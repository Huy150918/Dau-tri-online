"use strict";
/* Tài khoản, điểm và shop avatar lưu trên máy chủ.
 *
 * - Tài khoản khách KHÔNG bao giờ được lưu điểm (khách không đăng nhập, không có token).
 * - Điểm do MÁY CHỦ cộng khi kết thúc ván (client không tự cộng được), trừ chế độ offline có giới hạn.
 * - Quy đổi: `exchange` điểm chơi = 1 điểm shop (xem assets/avatars/catalog.json).
 *
 * Nơi lưu dữ liệu:
 *   1) Mặc định: file data/db.json (hoặc thư mục DATA_DIR).
 *      CẢNH BÁO: máy chủ miễn phí của Render xoá file khi ngủ/khởi động lại. Chỉ dùng để thử nghiệm.
 *   2) Khuyên dùng: đặt 2 biến môi trường UPSTASH_REDIS_REST_URL và UPSTASH_REDIS_REST_TOKEN
 *      (Upstash Redis có gói miễn phí). Dữ liệu sẽ nằm ngoài Render nên không mất.
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const DIR = process.env.DATA_DIR || path.join(__dirname, "data");
const FILE = path.join(DIR, "db.json");
const RURL = (process.env.UPSTASH_REDIS_REST_URL || "").replace(/\/+$/, "");
const RTOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || "";
const RKEY = process.env.STORE_KEY || "dtv:db";

/* ---------- Danh mục avatar & giá ---------- */
let CAT = { exchange: 50, defaultPrice: 100, avatars: [{ id: "a0", name: "Tân binh", free: true }] };
try { CAT = JSON.parse(fs.readFileSync(path.join(__dirname, "assets", "avatars", "catalog.json"), "utf8")); }
catch (e) { console.error("Không đọc được assets/avatars/catalog.json, dùng mặc định:", e.message); }
const EX = Math.max(1, parseInt(CAT.exchange, 10) || 50);
const avById = id => CAT.avatars.find(a => a.id === id);
const priceOf = a => (typeof a.price === "number" ? a.price : (parseInt(CAT.defaultPrice, 10) || 100));

/* ---------- Kho dữ liệu (file hoặc Upstash Redis) ---------- */
let db = null, ready = false, dirty = false, saving = false, timer = null;
const mode = () => (RURL ? "redis" : "file");

async function redis(cmd) {
  const r = await fetch(RURL, { method: "POST", headers: { Authorization: "Bearer " + RTOKEN, "Content-Type": "application/json" }, body: JSON.stringify(cmd) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.error) throw new Error(j.error || ("HTTP " + r.status));
  return j.result;
}
async function load() {
  if (RURL) { const v = await redis(["GET", RKEY]); return v ? JSON.parse(v) : null; }
  try { return JSON.parse(await fs.promises.readFile(FILE, "utf8")); }
  catch (e) { if (e.code === "ENOENT") return null; throw e; }
}
async function persist() {
  const s = JSON.stringify(db);
  if (RURL) { await redis(["SET", RKEY, s]); return; }
  await fs.promises.mkdir(DIR, { recursive: true });
  const tmp = FILE + ".tmp";
  await fs.promises.writeFile(tmp, s);
  await fs.promises.rename(tmp, FILE);
}
function markDirty() { dirty = true; if (!timer) timer = setTimeout(flush, RURL ? 4000 : 700); }
async function flush() {
  timer = null;
  if (!ready || !dirty || saving) return;
  saving = true; dirty = false;
  try { await persist(); } catch (e) { dirty = true; console.error("Lưu dữ liệu lỗi:", e.message); }
  saving = false;
  if (dirty && !timer) timer = setTimeout(flush, 5000);
}
async function init() {
  try {
    const d = await load();
    db = d && d.accounts ? d : { accounts: {}, meta: {} };
    db.meta = db.meta || {};
    if (!db.meta.secret) { db.meta.secret = crypto.randomBytes(32).toString("hex"); markDirty(); }
    ready = true;
    console.log("Kho tài khoản sẵn sàng (" + mode() + "), " + Object.keys(db.accounts).length + " tài khoản.");
  } catch (e) {
    // Không được ghi đè dữ liệu khi chưa đọc được: giữ trạng thái "chưa sẵn sàng" và thử lại.
    console.error("Chưa đọc được kho dữ liệu (" + mode() + "):", e.message, "- thử lại sau 10 giây");
    setTimeout(init, 10000);
  }
}
async function shutdown() { if (timer) clearTimeout(timer); timer = null; if (ready && dirty) { dirty = false; try { await persist(); } catch (e) { console.error(e.message); } } }

/* ---------- Mật khẩu & token ---------- */
const secret = () => process.env.TOKEN_SECRET || (db && db.meta.secret) || "";
function hashPw(pw, salt) { return crypto.scryptSync(String(pw), salt, 32).toString("hex"); }
function sign(key, exp) { return crypto.createHmac("sha256", secret()).update(key + "|" + exp).digest("base64url"); }
function makeToken(key) { const exp = Date.now() + 30 * 24 * 3600 * 1000; return Buffer.from(key).toString("base64url") + "." + exp + "." + sign(key, exp); }
function verify(token) {
  if (!ready || typeof token !== "string") return null;
  const p = token.split("."); if (p.length !== 3) return null;
  let key; try { key = Buffer.from(p[0], "base64url").toString(); } catch (e) { return null; }
  const exp = +p[1]; if (!exp || exp < Date.now() || !db.accounts[key]) return null;
  const a = Buffer.from(sign(key, exp)), b = Buffer.from(p[2]);
  return a.length === b.length && crypto.timingSafeEqual(a, b) ? key : null;
}

/* ---------- Giới hạn đăng nhập sai ---------- */
const fails = new Map();
function limited(id) { const f = fails.get(id); return !!(f && f.n >= 6 && f.until > Date.now()); }
function failed(id) { const f = fails.get(id) || { n: 0, until: 0 }; f.n++; f.until = Date.now() + 10 * 60 * 1000; fails.set(id, f); }
setInterval(() => { const now = Date.now(); fails.forEach((f, k) => { if (f.until < now) fails.delete(k); }); }, 60000).unref();

/* ---------- Nghiệp vụ ---------- */
const fail = (msg, code) => { const e = new Error(msg); e.status = code || 400; throw e; };
function cleanName(n) { return String(n || "").normalize("NFC").replace(/[<>\u0000-\u001f]/g, "").replace(/\s+/g, " ").trim(); }
function need() { if (!ready) fail("Kho dữ liệu chưa sẵn sàng, thử lại sau ít giây.", 503); }

function wallet(a) {
  return {
    name: a.name, points: a.points, spent: a.spent,
    shop: Math.max(0, Math.floor(a.points / EX) - a.spent),
    next: EX - (a.points % EX), exchange: EX,
    owned: a.owned, eq: a.eq
  };
}
function register(name, pw, ip) {
  need();
  name = cleanName(name); pw = String(pw || "");
  if (name.length < 2 || name.length > 14) fail("Tên cần từ 2 đến 14 ký tự.");
  if (/^kh[aá]ch\s*\d*$/i.test(name)) fail("Tên này dành cho tài khoản khách, hãy chọn tên khác.");
  if (pw.length < 4 || pw.length > 64) fail("Mật khẩu cần từ 4 đến 64 ký tự.");
  const key = name.toLowerCase();
  if (db.accounts[key]) fail("Tên này đã có người dùng.", 409);
  const salt = crypto.randomBytes(16).toString("hex");
  db.accounts[key] = { name, salt, hash: hashPw(pw, salt), created: Date.now(), points: 0, spent: 0, owned: ["a0"], eq: "a0", off: { day: "", sum: 0, last: 0 } };
  markDirty();
  return { token: makeToken(key), wallet: wallet(db.accounts[key]) };
}
function login(name, pw, ip) {
  need();
  name = cleanName(name); const key = name.toLowerCase(), id = (ip || "?") + "|" + key;
  if (limited(id)) fail("Đăng nhập sai quá nhiều lần, thử lại sau 10 phút.", 429);
  const a = db.accounts[key];
  const ok = a && crypto.timingSafeEqual(Buffer.from(hashPw(pw || "", a.salt)), Buffer.from(a.hash));
  if (!ok) { failed(id); fail("Sai tên hoặc mật khẩu.", 401); }
  fails.delete(id);
  return { token: makeToken(key), wallet: wallet(a) };
}
const walletOf = key => (ready && db.accounts[key] ? wallet(db.accounts[key]) : null);

function award(key, pts, why) {
  if (!ready || !db.accounts[key]) return null;
  pts = Math.floor(+pts || 0); if (pts <= 0 || pts > 5000) return null;
  const a = db.accounts[key]; a.points += pts; markDirty();
  return { wallet: wallet(a), gain: pts, why: why || "" };
}
function equip(key, id) {
  need(); const a = db.accounts[key]; if (!a) fail("Tài khoản không tồn tại.", 401);
  if (!a.owned.includes(id)) fail("Bạn chưa có avatar này.");
  a.eq = id; markDirty(); return wallet(a);
}
function buy(key, id) {
  need(); const a = db.accounts[key]; if (!a) fail("Tài khoản không tồn tại.", 401);
  const av = avById(id);
  if (!av || av.hidden) fail("Avatar này không có trong shop.");
  if (a.owned.includes(id)) fail("Bạn đã có avatar này rồi.");
  const price = av.free ? 0 : priceOf(av), w = wallet(a);
  if (w.shop < price) fail("Chưa đủ điểm shop (cần " + price + ", bạn có " + w.shop + ").");
  a.spent += price; a.owned.push(id); a.eq = id; markDirty();
  return wallet(a);
}
/* Chế độ offline (chơi với máy ngay trên điện thoại) máy chủ không kiểm chứng được, nên có giới hạn:
   cách nhau tối thiểu 15 giây và tối đa 3000 điểm mỗi ngày từ nguồn này. */
function offlineAward(key, kind, p) {
  need(); const a = db.accounts[key]; if (!a) fail("Tài khoản không tồn tại.", 401);
  let pts = 0, why = "";
  if (kind === "caro") {
    const L = { easy: 100, medium: 200, hard: 300 }[p.level]; if (!L) fail("Dữ liệu không hợp lệ.");
    pts = p.result === "win" ? L : p.result === "draw" ? 50 : p.result === "loss" ? 20 : 0; why = "Cờ ca rô";
  } else if (kind === "hb") {
    const s = Math.floor(+p.score); if (!(s >= 0 && s <= 80)) fail("Dữ liệu không hợp lệ.");
    pts = s * 5; why = "Đuổi hình";
  } else fail("Dữ liệu không hợp lệ.");
  if (pts <= 0) return { wallet: wallet(a), gain: 0 };
  const now = Date.now(), day = new Date(now).toISOString().slice(0, 10);
  const o = a.off = a.off && a.off.day === day ? a.off : { day, sum: 0, last: 0 };
  if (now - o.last < 15000) fail("Bạn nhận điểm hơi nhanh, chờ vài giây nhé.", 429);
  pts = Math.min(pts, Math.max(0, 3000 - o.sum));
  if (pts <= 0) fail("Hôm nay bạn đã nhận đủ điểm từ chế độ offline (tối đa 3.000).");
  o.sum += pts; o.last = now; a.points += pts; markDirty();
  return { wallet: wallet(a), gain: pts, why };
}
const avatarOf = key => (ready && db.accounts[key] ? db.accounts[key].eq : "a0");
const stats = () => ({ mode: mode(), ready, accounts: ready ? Object.keys(db.accounts).length : 0 });

module.exports = { init, shutdown, register, login, verify, walletOf, award, equip, buy, offlineAward, avatarOf, stats, mode };
