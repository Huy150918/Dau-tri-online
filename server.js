"use strict";
const http = require("http");
const fs = require("fs");
const path = require("path");
const { WebSocketServer } = require("ws");
const { buildQuestions } = require("./questions");
const zlib = require("zlib");
const multi = require("./multi");
const accounts = require("./accounts");
const voice = require("./voice");

const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, "index.html");
const MAXT = 5000, BASE = 200, ROUNDS = 5;
const BOTS = {
  easy:   { n: "Anh HyM (Dễ)",  acc: 0.5, base: 3400, jit: 1000 },
  medium: { n: "Anh HyM (Vừa)", acc: 0.7, base: 2200, jit: 900 },
  hard:   { n: "Anh HyM (Khó)", acc: 0.9, base: 1100, jit: 500 }
};
const INTRO_MS = 2000, RESULT_MS = 3000, GRACE_MS = 900; // chờ giữa 2 câu = RESULT_MS + INTRO_MS = 5s

// Thống kê người chơi (chỉ đếm từ lúc máy chủ khởi động, không lưu lại khi khởi động lại)
const startedAt = Date.now();
let appOpens = 0, totalConns = 0, peakOnline = 0;
function statsData() {
  let vnRooms = 0, vnPlayers = 0, vnBot = 0;
  rooms.forEach(r => {
    if (r.bot) { vnBot++; vnPlayers++; } else { vnRooms++; vnPlayers += r.players.filter(Boolean).length; }
  });
  const g = multi.stats();
  return {
    online: wss.clients.size,
    dangChoi: vnPlayers + g.tl.players + g.hb.players + g.cr.players,
    games: {
      varNhau: { phong: vnRooms, nguoi: vnPlayers - vnBot, voiMay: vnBot },
      tienLen: { phong: g.tl.rooms, nguoi: g.tl.players },
      duoiHinhBatChu: { phong: g.hb.rooms, nguoi: g.hb.players },
      caro: { phong: g.cr.rooms, nguoi: g.cr.players }
    },
    luotMoApp: appOpens,
    luotKetNoi: totalConns,
    dinhOnline: peakOnline,
    taiKhoan: accounts.stats(),
    chayTu: new Date(startedAt).toISOString()
  };
}
const STATS_PAGE = `<!DOCTYPE html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Thống kê Var Nhau</title>
<style>body{margin:0;padding:20px;font:16px system-ui,sans-serif;background:#0e0b24;color:#f2efff}h1{font-size:22px;margin:0 0 14px}.g{display:grid;grid-template-columns:1fr 1fr;gap:10px}.c{background:#1b1642;border-radius:14px;padding:14px}.c b{display:block;font-size:34px;line-height:1.1}.c span{color:#a49fd0;font-size:13px}.w{grid-column:1/-1}small{color:#a49fd0;display:block;margin-top:14px;line-height:1.5}</style></head><body>
<h1>Thống kê Var Nhau</h1><div class="g" id="g">Đang tải…</div><small id="n"></small>
<script>
async function load(){try{const r=await fetch('/stats.json'+location.search,{cache:'no-store'});if(!r.ok)throw 0;const d=await r.json();
const c=(n,l,w)=>'<div class="c'+(w?' w':'')+'"><b>'+n+'</b><span>'+l+'</span></div>';
document.getElementById('g').innerHTML=c(d.dangChoi,'người đang trong phòng chơi',1)+c(d.online,'kết nối đang mở')+c(d.dinhOnline,'đỉnh online')+
c(d.games.varNhau.nguoi+' ('+d.games.varNhau.phong+' phòng)','Var Nhau online')+c(d.games.varNhau.voiMay,'Var Nhau với máy')+
c(d.games.tienLen.nguoi+' ('+d.games.tienLen.phong+' phòng)','Tiến lên')+c(d.games.duoiHinhBatChu.nguoi+' ('+d.games.duoiHinhBatChu.phong+' phòng)','Đuổi hình bắt chữ')+
c(d.games.caro.nguoi+' ('+d.games.caro.phong+' phòng)','Cờ ca rô')+c(d.luotMoApp,'lượt mở app');
document.getElementById('n').textContent='Máy chủ chạy từ '+new Date(d.chayTu).toLocaleString('vi-VN')+'. Số liệu về 0 khi máy chủ khởi động lại. Chơi offline không được tính. Tự cập nhật mỗi 5 giây.';
}catch(e){document.getElementById('g').textContent='Không xem được (sai khoá?).';}}
load();setInterval(load,5000);
</script></body></html>`;

const server = http.createServer((req, res) => {
  const url = (req.url || "/").split("?")[0];
  if (url === "/healthz") { res.writeHead(200); return res.end("ok"); }
  if (url.startsWith("/api/")) return api(req, res, url);
  if (url === "/ice.json") return sendJson(res, 200, { iceServers: iceServers() });
  if (url === "/stats" || url === "/stats.json") {
    let key = ""; try { key = new URL(req.url, "http://x").searchParams.get("key") || ""; } catch (e) {}
    if (process.env.STATS_KEY && key !== process.env.STATS_KEY) { res.writeHead(404); return res.end("Not found"); }
    const json = url === "/stats.json";
    res.writeHead(200, { "Content-Type": json ? "application/json; charset=utf-8" : "text/html; charset=utf-8", "Cache-Control": "no-store" });
    return res.end(json ? JSON.stringify(statsData()) : STATS_PAGE);
  }
  if (url === "/" || url === "/index.html") appOpens++;
  return serveStatic(req, res, url);
});


/* ---------- File tĩnh (index.html, css/, js/, assets/) ---------- */
const ROOT = __dirname;
const MIME = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".ico": "image/x-icon" };
const GZ = new Set([".html", ".css", ".js", ".json", ".svg"]);
const STATIC_DIRS = ["css", "js", "assets"];
const gzCache = new Map();
function serveStatic(req, res, url) {
  let rel;
  try { rel = url === "/" ? "index.html" : decodeURIComponent(url).replace(/^\/+/, ""); } catch (e) { res.writeHead(400); return res.end("Bad request"); }
  if (rel.includes("\0")) { res.writeHead(400); return res.end("Bad request"); }
  const file = path.normalize(path.join(ROOT, rel));
  const norm = path.relative(ROOT, file);                 // đường dẫn thật sau khi bỏ ../
  const top = norm.split(path.sep)[0];
  const okPath = norm === "index.html" || (STATIC_DIRS.includes(top) && !norm.startsWith("..") && !norm.split(path.sep).some(p => p.startsWith(".")));
  if (!okPath) { res.writeHead(404); return res.end("Not found"); }
  fs.stat(file, (e, st) => {
    if (e || !st.isFile()) { res.writeHead(404); return res.end("Not found"); }
    const ext = path.extname(file).toLowerCase();
    const heads = { "Content-Type": MIME[ext] || "application/octet-stream", "Cache-Control": ext === ".svg" || ext === ".png" ? "public, max-age=3600" : "no-cache" };
    fs.readFile(file, (err, buf) => {
      if (err) { res.writeHead(500); return res.end("Lỗi đọc file"); }
      if (GZ.has(ext) && /\bgzip\b/.test(req.headers["accept-encoding"] || "")) {
        const k = file + ":" + st.mtimeMs; let z = gzCache.get(k);
        if (!z) { z = zlib.gzipSync(buf); gzCache.set(k, z); if (gzCache.size > 200) gzCache.delete(gzCache.keys().next().value); }
        heads["Content-Encoding"] = "gzip"; heads["Vary"] = "Accept-Encoding"; res.writeHead(200, heads); return res.end(z);
      }
      res.writeHead(200, heads); res.end(buf);
    });
  });
}
function sendJson(res, code, obj) { res.writeHead(code, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }); res.end(JSON.stringify(obj)); }
function iceServers() {
  const list = [{ urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] }];
  if (process.env.TURN_URLS) list.push({ urls: process.env.TURN_URLS.split(",").map(x => x.trim()).filter(Boolean), username: process.env.TURN_USER || "", credential: process.env.TURN_PASS || "" });
  return list;
}

/* ---------- API tài khoản / điểm / shop ---------- */
function readBody(req) {
  return new Promise((resolve, reject) => {
    let n = 0; const chunks = [];
    req.on("data", c => { n += c.length; if (n > 4096) { reject(Object.assign(new Error("Dữ liệu quá lớn."), { status: 413 })); req.destroy(); } else chunks.push(c); });
    req.on("end", () => { try { resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString("utf8")) : {}); } catch (e) { reject(Object.assign(new Error("Dữ liệu không hợp lệ."), { status: 400 })); } });
    req.on("error", reject);
  });
}
const clientIp = req => String(req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").split(",")[0].trim();
async function api(req, res, url) {
  try {
    const key = accounts.verify((req.headers.authorization || "").replace(/^Bearer\s+/i, ""));
    if (req.method === "GET" && url === "/api/me") { if (!key) return sendJson(res, 401, { error: "Phiên đăng nhập đã hết hạn." }); return sendJson(res, 200, { wallet: accounts.walletOf(key) }); }
    if (req.method !== "POST") return sendJson(res, 404, { error: "Not found" });
    const b = await readBody(req);
    if (url === "/api/register") return sendJson(res, 200, accounts.register(b.name, b.password, clientIp(req)));
    if (url === "/api/login") return sendJson(res, 200, accounts.login(b.name, b.password, clientIp(req)));
    if (!key) return sendJson(res, 401, { error: "Bạn cần đăng nhập (tài khoản khách không lưu điểm)." });
    if (url === "/api/equip") return sendJson(res, 200, { wallet: accounts.equip(key, String(b.id || "")) });
    if (url === "/api/buy") return sendJson(res, 200, { wallet: accounts.buy(key, String(b.id || "")) });
    if (url === "/api/award") return sendJson(res, 200, accounts.offlineAward(key, String(b.kind || ""), b));
    return sendJson(res, 404, { error: "Not found" });
  } catch (e) {
    sendJson(res, e.status || 500, { error: e.status ? e.message : "Lỗi máy chủ." });
    if (!e.status) console.error(e);
  }
}
const avOf = ws => (ws.acct ? accounts.avatarOf(ws.acct) : "a0");
function reward(room, i, pts, why) {
  const ws = room.players[i]; if (!ws || !ws.acct) return;
  const r = accounts.award(ws.acct, pts, why);
  if (r) send(ws, { t: "w:upd", wallet: r.wallet, gain: r.gain, why: r.why });
}

const wss = new WebSocketServer({ server, maxPayload: 16384 });
const rooms = new Map();
const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ";

function newCode() {
  for (let n = 0; n < 200; n++) {
    let c = ""; for (let i = 0; i < 4; i++) c += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
    if (!rooms.has(c)) return c;
  }
  return null;
}
function send(ws, obj) { if (ws && ws.readyState === 1) ws.send(JSON.stringify(obj)); }
function both(room, obj) { room.players.forEach(p => send(p, obj)); }
function cleanName(n, fb) { n = String(n || "").replace(/[<>]/g, "").trim().slice(0, 14); return n || fb; }
function roomInfo(room) {
  room.players.forEach((p, i) => send(p, { t: "room", code: room.code, you: i, names: room.names, avs: room.avs, full: !!(room.players[0] && (room.players[1] || room.bot)), bot: !!room.bot }));
}
function clearTimers(room) { room.timers.forEach(clearTimeout); room.timers = []; }
function later(room, fn, ms) { room.timers.push(setTimeout(fn, ms)); }

function startGame(room) {
  clearTimers(room);
  room.qs = buildQuestions(); room.qi = 0; room.scores = [0, 0]; room.log = []; room.again = [false, false];
  startRound(room);
}
function startRound(room) {
  room.phase = "intro"; room.ans = [null, null];
  const q = room.qs[room.qi];
  both(room, { t: "round", n: room.qi + 1, total: ROUNDS, final: q.final, scores: room.scores });
  later(room, () => sendQuestion(room), INTRO_MS);
}
function sendQuestion(room) {
  const q = room.qs[room.qi];
  room.phase = "play"; room.tStart = Date.now();
  both(room, { t: "q", n: room.qi + 1, final: q.final, q: q.q, opts: q.opts });
  if (room.bot) scheduleBot(room, q);
  later(room, () => endRound(room), MAXT + GRACE_MS);
}
function scheduleBot(room, q) {
  const b = room.bot;
  const delay = Math.max(600, Math.min(4700, Math.round(b.base + (Math.random() * 2 - 1) * b.jit)));
  let idx = q.ci;
  if (Math.random() >= b.acc) { const w = [0, 1, 2, 3].filter(i => i !== q.ci); idx = w[Math.floor(Math.random() * 3)]; }
  later(room, () => onAnswer(room, 1, idx, delay), delay);
}
function onAnswer(room, p, idx, ms) {
  if (room.phase !== "play" || room.ans[p]) return;
  idx = Number(idx);
  if (!Number.isInteger(idx) || idx < 0 || idx > 3) return;
  const serverEl = Date.now() - room.tStart;
  if (serverEl > MAXT + GRACE_MS) return;
  ms = Number(ms); if (!Number.isFinite(ms)) ms = serverEl;
  // Dùng thời gian đo trên máy người chơi (công bằng với độ trễ mạng), nhưng không cho nhanh hơn quá nhiều so với những gì server thấy.
  const t = Math.min(MAXT, Math.max(ms, serverEl - 1500, 0));
  const q = room.qs[room.qi];
  const ok = idx === q.ci;
  const max = BASE * (q.final ? 2 : 1);
  // Điểm theo bậc từng giây: giây 1 = 100%, giây 2 = 90%, ... giây 5 (giây cuối) = 60%
  // Câu thường: 200 / 180 / 160 / 140 / 120. Câu cuối (x2): 400 / 360 / 320 / 280 / 240.
  const step = Math.min(4, Math.floor(t / 1000));
  const pts = ok ? Math.round(max * (1 - 0.1 * step)) : 0;
  room.ans[p] = { idx, ok, pts, t };
  send(room.players[1 - p], { t: "opp" });
  if (room.ans[0] && room.ans[1]) endRound(room);
}
function endRound(room) {
  if (room.phase !== "play") return;
  room.phase = "reveal"; clearTimers(room);
  const q = room.qs[room.qi];
  const res = room.ans.map(a => a ? { idx: a.idx, ok: a.ok, pts: a.pts, t: Math.round(a.t) } : null);
  res.forEach((r, i) => { if (r) room.scores[i] += r.pts; });
  room.log.push({ final: q.final, res });
  both(room, { t: "result", n: room.qi + 1, ci: q.ci, res, scores: room.scores });
  later(room, () => {
    if (room.qi < ROUNDS - 1) { room.qi++; startRound(room); }
    else {
      room.phase = "ended"; both(room, { t: "end", scores: room.scores, log: room.log, names: room.names });
      room.players.forEach((p, i) => { if (p) reward(room, i, room.scores[i], "Var Nhau"); });
    }
  }, RESULT_MS);
}
function leave(ws) {
  voice.drop(ws);
  const room = ws.room; if (!room) return;
  ws.room = null;
  const i = room.players.indexOf(ws);
  if (i >= 0) room.players[i] = null;
  clearTimers(room);
  room.players.forEach(p => { if (p) { send(p, { t: "left" }); p.room = null; } });
  rooms.delete(room.code);
}


// Chat và thả icon: dùng chung cho mọi phòng (Var Nhau, Tiến lên, Đuổi hình bắt chữ, Cờ ca rô)
const CHAT_EMO = new Set(["😂", "😍", "😎", "😡", "😭", "😱", "🤔", "👍", "👎", "👏", "🔥", "❤️"]);
function chatRelay(ws, m) {
  const room = ws.room || ws.mroom;
  if (!room || !Array.isArray(room.players)) return;
  const idx = room.players.indexOf(ws); if (idx < 0) return;
  const now = Date.now(), emo = m.t === "c:emo";
  const key = emo ? "cEmo" : "cMsg", lim = emo ? [10, 6000] : [6, 8000];
  ws[key] = (ws[key] || []).filter(t => now - t < lim[1]);
  if (ws[key].length >= lim[0]) return send(ws, { t: "c:slow" });
  let payload;
  if (emo) {
    if (!CHAT_EMO.has(m.e)) return;
    payload = { t: "c:emo", e: m.e };
  } else {
    const text = String(m.text || "").replace(/[<>]/g, "").replace(/\s+/g, " ").trim().slice(0, 120);
    if (!text) return;
    payload = { t: "c:msg", text };
  }
  ws[key].push(now);
  const name = (room.names && room.names[idx]) || "Người chơi";
  room.players.forEach((p, j) => send(p, Object.assign({ from: idx, name, mine: j === idx }, payload)));
}

wss.on("connection", ws => {
  totalConns++; peakOnline = Math.max(peakOnline, wss.clients.size);
  ws.alive = true; ws.room = null;
  ws.on("pong", () => { ws.alive = true; });
  ws.on("message", raw => {
    let m; try { m = JSON.parse(raw); } catch { return; }
    if (!m || typeof m.t !== "string") return;
    if (m.t === "auth") {
      const k = accounts.verify(String(m.token || ""));
      ws.acct = k || null;
      return send(ws, k ? { t: "auth:ok", wallet: accounts.walletOf(k) } : { t: "auth:fail" });
    }
    if (m.t.startsWith("v:")) return voice.handle(ws, m);
    if (m.t === "c:msg" || m.t === "c:emo") return chatRelay(ws, m);
    if (m.t.startsWith("m:") || m.t.startsWith("tl:") || m.t.startsWith("hb:") || m.t.startsWith("cr:")) return multi.handle(ws, m);
    if (m.t === "create" || m.t === "bot" || m.t === "join") multi.leave(ws);
    if (m.t === "create") {
      leave(ws);
      const code = newCode(); if (!code) return send(ws, { t: "err", msg: "Máy chủ đang đầy, thử lại sau." });
      const room = { code, players: [ws, null], names: [cleanName(m.name, "Người chơi 1"), ""], avs: [avOf(ws), "a0"], phase: "lobby", timers: [], scores: [0, 0], again: [false, false] };
      rooms.set(code, room); ws.room = room; roomInfo(room);
    } else if (m.t === "bot") {
      leave(ws);
      const b = BOTS[m.level] || BOTS.medium;
      const code = newCode(); if (!code) return send(ws, { t: "err", msg: "Máy chủ đang đầy, thử lại sau." });
      const room = { code, players: [ws, null], names: [cleanName(m.name, "Người chơi 1"), b.n], avs: [avOf(ws), "hym"], phase: "lobby", timers: [], scores: [0, 0], again: [false, false], bot: b };
      rooms.set(code, room); ws.room = room; roomInfo(room);
      later(room, () => startGame(room), 700);
    } else if (m.t === "join") {
      leave(ws);
      const code = String(m.code || "").toUpperCase().replace(/[^A-Z]/g, "").slice(0, 4);
      const room = rooms.get(code);
      if (!room) return send(ws, { t: "err", msg: "Không tìm thấy phòng " + code + "." });
      if (room.bot || room.players[1] || room.phase !== "lobby") return send(ws, { t: "err", msg: "Phòng này đã đủ người." });
      let nm = cleanName(m.name, "Người chơi 2");
      if (nm === room.names[0]) nm = nm.slice(0, 11) + " (2)";
      room.players[1] = ws; room.names[1] = nm; room.avs[1] = avOf(ws); ws.room = room;
      roomInfo(room);
      later(room, () => startGame(room), 900);
    } else if (m.t === "ans") {
      const room = ws.room; if (!room) return;
      onAnswer(room, room.players.indexOf(ws), m.idx, m.ms);
    } else if (m.t === "again") {
      const room = ws.room; if (!room || room.phase !== "ended") return;
      if (room.bot) { startGame(room); return; }
      const p = room.players.indexOf(ws); room.again[p] = true;
      if (room.again[0] && room.again[1]) startGame(room); else send(room.players[1 - p], { t: "rematch" });
    } else if (m.t === "leave") {
      leave(ws);
    }
  });
  ws.on("close", () => { leave(ws); multi.leave(ws); });
  ws.on("error", () => {});
});

// Giữ kết nối sống và dọn kết nối chết
setInterval(() => {
  wss.clients.forEach(ws => { if (!ws.alive) return ws.terminate(); ws.alive = false; ws.ping(); });
}, 25000);

accounts.init();
server.listen(PORT, () => console.log("Var Nhau chạy ở cổng " + PORT));
for (const sig of ["SIGTERM", "SIGINT"]) process.on(sig, () => { accounts.shutdown().finally(() => process.exit(0)); });
