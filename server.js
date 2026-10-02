"use strict";
const http = require("http");
const fs = require("fs");
const path = require("path");
const { WebSocketServer } = require("ws");
const { buildQuestions } = require("./questions");
const multi = require("./multi");

const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, "index.html");
const MAXT = 5000, BASE = 200, ROUNDS = 5;
const BOTS = {
  easy:   { n: "Anh HyM (Dễ)",  acc: 0.5, base: 3400, jit: 1000 },
  medium: { n: "Anh HyM (Vừa)", acc: 0.7, base: 2200, jit: 900 },
  hard:   { n: "Anh HyM (Khó)", acc: 0.9, base: 1100, jit: 500 }
};
const INTRO_MS = 2000, RESULT_MS = 3000, GRACE_MS = 900; // chờ giữa 2 câu = RESULT_MS + INTRO_MS = 5s

const server = http.createServer((req, res) => {
  const url = (req.url || "/").split("?")[0];
  if (url === "/healthz") { res.writeHead(200); return res.end("ok"); }
  if (url !== "/" && url !== "/index.html") { res.writeHead(404); return res.end("Not found"); }
  fs.readFile(INDEX, (err, buf) => {
    if (err) { res.writeHead(500); return res.end("Missing index.html"); }
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache" });
    res.end(buf);
  });
});

const wss = new WebSocketServer({ server, maxPayload: 2048 });
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
  room.players.forEach((p, i) => send(p, { t: "room", code: room.code, you: i, names: room.names, full: !!(room.players[0] && (room.players[1] || room.bot)), bot: !!room.bot }));
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
    else { room.phase = "ended"; both(room, { t: "end", scores: room.scores, log: room.log, names: room.names }); }
  }, RESULT_MS);
}
function leave(ws) {
  const room = ws.room; if (!room) return;
  ws.room = null;
  const i = room.players.indexOf(ws);
  if (i >= 0) room.players[i] = null;
  clearTimers(room);
  room.players.forEach(p => { if (p) { send(p, { t: "left" }); p.room = null; } });
  rooms.delete(room.code);
}

wss.on("connection", ws => {
  ws.alive = true; ws.room = null;
  ws.on("pong", () => { ws.alive = true; });
  ws.on("message", raw => {
    let m; try { m = JSON.parse(raw); } catch { return; }
    if (!m || typeof m.t !== "string") return;
    if (m.t.startsWith("m:") || m.t.startsWith("tl:") || m.t.startsWith("hb:")) return multi.handle(ws, m);
    if (m.t === "create" || m.t === "bot" || m.t === "join") multi.leave(ws);
    if (m.t === "create") {
      leave(ws);
      const code = newCode(); if (!code) return send(ws, { t: "err", msg: "Máy chủ đang đầy, thử lại sau." });
      const room = { code, players: [ws, null], names: [cleanName(m.name, "Người chơi 1"), ""], phase: "lobby", timers: [], scores: [0, 0], again: [false, false] };
      rooms.set(code, room); ws.room = room; roomInfo(room);
    } else if (m.t === "bot") {
      leave(ws);
      const b = BOTS[m.level] || BOTS.medium;
      const code = newCode(); if (!code) return send(ws, { t: "err", msg: "Máy chủ đang đầy, thử lại sau." });
      const room = { code, players: [ws, null], names: [cleanName(m.name, "Người chơi 1"), b.n], phase: "lobby", timers: [], scores: [0, 0], again: [false, false], bot: b };
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
      room.players[1] = ws; room.names[1] = nm; ws.room = room;
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

server.listen(PORT, () => console.log("Đấu Trí online chạy ở cổng " + PORT));
