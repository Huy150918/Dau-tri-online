"use strict";
// Phòng nhiều người: Tiến lên (2-4 người) và Đuổi Hình Bắt Chữ (2 người).
// Thông điệp bắt đầu bằng "m:" (chung), "tl:" (Tiến lên), "hb:" (Đuổi hình bắt chữ).
const accounts = require("./accounts");
const voice = require("./voice");
const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const rooms = new Map();

function send(ws, o) { if (ws && ws.readyState === 1) ws.send(JSON.stringify(o)); }
function both(room, o) { room.players.forEach(p => send(p, o)); }
function cleanName(n, fb) { n = String(n || "").replace(/[<>]/g, "").trim().slice(0, 14); return n || fb; }
function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function newCode() {
  for (let n = 0; n < 200; n++) {
    let c = ""; for (let i = 0; i < 4; i++) c += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
    if (!rooms.has(c)) return c;
  }
  return null;
}
const avOf = ws => (ws.acct ? accounts.avatarOf(ws.acct) : "a0");
function reward(room, i, pts, why) {
  const ws = room.players[i]; if (!ws || !ws.acct) return;
  const r = accounts.award(ws.acct, pts, why);
  if (r) send(ws, { t: "w:upd", wallet: r.wallet, gain: r.gain, why: r.why });
}
function clearTimers(room) { room.timers.forEach(clearTimeout); room.timers = []; }
function later(room, fn, ms) { room.timers.push(setTimeout(fn, ms)); }
function err(ws, msg) { send(ws, { t: "m:err", msg }); }
function roomInfo(room) {
  room.players.forEach((p, i) => send(p, { t: "m:room", game: room.game, code: room.code, you: i, names: room.names, avs: room.avs, max: room.max, full: room.players.length === room.max }));
}

/* ---------- Phòng chung ---------- */
function create(ws, m) {
  leave(ws);
  const game = m.game === "hb" ? "hb" : m.game === "cr" ? "cr" : "tl";
  const max = game === "tl" ? Math.min(4, Math.max(2, parseInt(m.n, 10) || 2)) : 2;
  const code = newCode(); if (!code) return err(ws, "Máy chủ đang đầy, thử lại sau.");
  const room = { code, game, max, players: [ws], names: [cleanName(m.name, "Người chơi 1")], avs: [avOf(ws)], phase: "lobby", timers: [], again: [] };
  rooms.set(code, room); ws.mroom = room; roomInfo(room);
}
function join(ws, m) {
  leave(ws);
  const code = String(m.code || "").toUpperCase().replace(/[^A-Z]/g, "").slice(0, 4);
  const room = rooms.get(code);
  if (!room) return err(ws, "Không tìm thấy phòng " + code + ".");
  if (m.game && room.game !== m.game) return err(ws, "Mã này là phòng của trò khác.");
  if (room.phase !== "lobby" || room.players.length >= room.max) return err(ws, "Phòng này đã đủ người.");
  let nm = cleanName(m.name, "Người chơi " + (room.players.length + 1));
  if (room.names.includes(nm)) nm = nm.slice(0, 11) + " (" + (room.players.length + 1) + ")";
  room.players.push(ws); room.names.push(nm); room.avs.push(avOf(ws)); ws.mroom = room;
  roomInfo(room);
  if (room.players.length === room.max) later(room, () => start(room), 900);
}
function start(room) { if (room.game === "tl") tlStart(room); else if (room.game === "cr") crStart(room); else hbStart(room); }
function leave(ws) {
  voice.drop(ws);
  const room = ws.mroom; if (!room) return;
  ws.mroom = null;
  const i = room.players.indexOf(ws); if (i < 0) return;
  clearTimers(room);
  if (room.phase === "lobby") {
    room.players.splice(i, 1); room.names.splice(i, 1); room.avs.splice(i, 1);
    if (!room.players.length) rooms.delete(room.code); else roomInfo(room);
  } else {
    room.players.forEach((p, k) => { if (k !== i && p) { send(p, { t: "m:left", name: room.names[i] }); p.mroom = null; } });
    rooms.delete(room.code);
  }
}
function again(ws) {
  const room = ws.mroom; if (!room || room.phase !== "ended") return;
  const i = room.players.indexOf(ws); room.again[i] = true;
  if (room.again.length === room.players.length && room.again.every(Boolean)) start(room);
  else room.players.forEach((p, k) => { if (k !== i) send(p, { t: "m:rematch" }); });
}

/* ---------- Tiến lên ----------
   Lá bài là số 0..51: id = hạng*4 + chất. Hạng 0..12 = 3,4,...,K,A,2. Chất 0..3 = ♠ ♣ ♦ ♥. */
function cls(ids) {
  const n = ids.length; if (!n) return null;
  const a = ids.slice().sort((x, y) => x - y), r = a.map(x => x >> 2), key = a[n - 1];
  if (n <= 4 && r.every(x => x === r[0])) return { type: ["single", "pair", "triple", "quad"][n - 1], len: n, key, two: r[0] === 12 };
  if (n >= 3 && r.every((x, i) => x < 12 && (i === 0 || x === r[i - 1] + 1))) return { type: "straight", len: n, key };
  if (n >= 6 && n % 2 === 0) {
    for (let i = 0; i < n; i += 2) { if (r[i] !== r[i + 1] || r[i] >= 12 || (i > 0 && r[i] !== r[i - 2] + 1)) return null; }
    return { type: "pairthru", len: n / 2, key };
  }
  return null;
}
function beats(p, c) {
  if (c.type === p.type && c.len === p.len) return c.key > p.key;
  if (p.type === "single" && p.two) return c.type === "quad" || (c.type === "pairthru" && c.len >= 3);
  if (p.type === "pair" && p.two) return c.type === "quad" || (c.type === "pairthru" && c.len >= 4);
  if (p.type === "pairthru" && p.len === 3) return c.type === "quad" || (c.type === "pairthru" && c.len >= 4);
  if (p.type === "quad") return c.type === "pairthru" && c.len >= 4;
  return false;
}
function tlStart(room) {
  clearTimers(room);
  const n = room.players.length;
  const deck = shuffle(Array.from({ length: 52 }, (_, i) => i));
  room.hands = Array.from({ length: n }, (_, i) => deck.slice(i * 13, i * 13 + 13).sort((a, b) => a - b));
  let first = 0, min = 99; room.hands.forEach((h, i) => { if (h[0] < min) { min = h[0]; first = i; } });
  room.turn = typeof room.winner === "number" && room.winner < n ? room.winner : first;
  room.last = null; room.passed = Array(n).fill(false); room.again = Array(n).fill(false); room.phase = "play";
  tlBroadcast(room);
}
function tlBroadcast(room) {
  const counts = room.hands.map(h => h.length);
  room.players.forEach((p, i) => send(p, {
    t: "tl:state", you: i, names: room.names, hand: room.hands[i], counts, turn: room.turn,
    last: room.last ? { ids: room.last.ids, by: room.last.by } : null, passed: room.passed
  }));
}
function tlAdvance(room) {
  const n = room.players.length; let nx = room.turn;
  for (let k = 0; k < n; k++) {
    nx = (nx + 1) % n;
    if (room.last && nx === room.last.by) { room.last = null; room.passed.fill(false); room.turn = nx; break; }
    if (!room.passed[nx]) { room.turn = nx; break; }
  }
  tlBroadcast(room);
}
function tlPlay(room, i, ids) {
  if (room.phase !== "play" || room.turn !== i) return;
  if (!Array.isArray(ids) || ids.length < 1 || ids.length > 13) return;
  const hand = room.hands[i];
  if (new Set(ids).size !== ids.length || !ids.every(x => Number.isInteger(x) && hand.includes(x))) return err(room.players[i], "Bài không hợp lệ.");
  const c = cls(ids); if (!c) return err(room.players[i], "Bộ bài không hợp lệ.");
  if (room.last && !beats(cls(room.last.ids), c)) return err(room.players[i], "Bài chưa đủ lớn để chặt.");
  room.hands[i] = hand.filter(x => !ids.includes(x));
  room.last = { ids: ids.slice().sort((a, b) => a - b), by: i };
  if (!room.hands[i].length) {
    room.phase = "ended"; room.winner = i; tlBroadcast(room);
    room.players.forEach((p, k) => reward(room, k, k === i ? 400 : 100, "Tiến lên"));
    return both(room, { t: "tl:end", winner: i, names: room.names, counts: room.hands.map(h => h.length) });
  }
  tlAdvance(room);
}
function tlPass(room, i) {
  if (room.phase !== "play" || room.turn !== i) return;
  if (!room.last) return err(room.players[i], "Bạn đang đi đầu, hãy đánh một bộ.");
  room.passed[i] = true; tlAdvance(room);
}

/* ---------- Đuổi Hình Bắt Chữ (2 người) ---------- */
const HB = [
  { e: ["☀️", "🌻"], a: ["hoa hướng dương", "hướng dương"] },
  { e: ["🚒", "🔥"], a: ["xe cứu hỏa", "cứu hỏa"] },
  { e: ["🎂", "🕯️", "🎉"], a: ["sinh nhật", "bánh sinh nhật", "tiệc sinh nhật"] },
  { e: ["🌧️", "☀️", "🌈"], a: ["cầu vồng"] },
  { e: ["🦁", "👑"], a: ["vua sư tử", "sư tử"] },
  { e: ["🏖️", "🌊", "☀️"], a: ["bãi biển", "biển", "đi biển"] },
  { e: ["📚", "🏫", "🎒"], a: ["đi học", "trường học", "học sinh", "học"] },
  { e: ["🔔", "🎄", "🎅"], a: ["giáng sinh", "noel", "lễ giáng sinh"] },
  { e: ["🏮", "🌕", "🥮"], a: ["trung thu", "tết trung thu", "bánh trung thu"] },
  { e: ["🎤", "🎶", "😀"], a: ["ca hát", "hát", "karaoke", "ca sĩ"] },
  { e: ["🐼", "🎋"], a: ["gấu trúc", "panda"] },
  { e: ["🚀", "🌌"], a: ["vũ trụ", "du hành vũ trụ", "tên lửa"] },
  { e: ["🐢", "🐇", "🏁"], a: ["rùa và thỏ", "thỏ và rùa", "rùa thỏ", "thỏ rùa", "cuộc đua"] },
  { e: ["⛈️", "⚡"], a: ["sấm sét", "sấm chớp", "sét", "giông bão", "bão"] }
];
const HB_ROUNDS = 8, HB_MS = 30000, HINT_MS = 15000, RES_MS = 3000;
const hnorm = s => String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/[^a-z0-9]/g, "");
function hbStart(room) {
  clearTimers(room);
  room.qs = shuffle(HB.slice()).slice(0, HB_ROUNDS); room.qi = 0; room.scores = [0, 0]; room.again = [false, false];
  hbQ(room);
}
function hbQ(room) {
  room.phase = "q";
  const p = room.qs[room.qi], words = p.a[0].split(" ");
  both(room, { t: "hb:q", n: room.qi + 1, total: room.qs.length, e: p.e, w: words.map(x => Array.from(x).length), ms: HB_MS, scores: room.scores });
  later(room, () => both(room, { t: "hb:hint", f: words.map(x => Array.from(x)[0]) }), HINT_MS);
  later(room, () => hbRes(room, -1), HB_MS);
}
function hbAns(room, i, text) {
  if (room.phase !== "q") return;
  const v = hnorm(String(text || "").slice(0, 60)); if (!v) return;
  if (room.qs[room.qi].a.some(x => hnorm(x) === v)) hbRes(room, i);
  else send(room.players[i], { t: "hb:no" });
}
function hbRes(room, w) {
  if (room.phase !== "q") return;
  room.phase = "r"; clearTimers(room);
  if (w >= 0) room.scores[w] += 10;
  both(room, { t: "hb:res", n: room.qi + 1, answer: room.qs[room.qi].a[0], winner: w, scores: room.scores });
  later(room, () => {
    if (room.qi < room.qs.length - 1) { room.qi++; hbQ(room); }
    else { room.phase = "ended"; both(room, { t: "hb:end", scores: room.scores, names: room.names }); room.players.forEach((p, k) => reward(room, k, (room.scores[k] || 0) * 5, "Đuổi hình")); }
  }, RES_MS);
}


/* ---------- Cờ Ca Rô (15x15, 5 quân liền nhau thắng) ----------
   board: mảng 225 ô, 0 = trống, 1 = X (người 0), 2 = O (người 1). Người đi trước đổi luân phiên mỗi ván. */
const CR_N = 15;
function crWin(b, r, c, v) {
  for (const [dr, dc] of [[0, 1], [1, 0], [1, 1], [1, -1]]) {
    const line = [[r, c]];
    for (const s of [1, -1]) {
      let rr = r + dr * s, cc = c + dc * s;
      while (rr >= 0 && rr < CR_N && cc >= 0 && cc < CR_N && b[rr * CR_N + cc] === v) { line.push([rr, cc]); rr += dr * s; cc += dc * s; }
    }
    if (line.length >= 5) return line;
  }
  return null;
}
function crStart(room) {
  clearTimers(room);
  room.board = Array(CR_N * CR_N).fill(0);
  room.wins = room.wins || [0, 0];
  room.first = room.first === undefined ? 0 : 1 - room.first;
  room.turn = room.first; room.last = null; room.moves = 0;
  room.again = [false, false]; room.phase = "play";
  crBroadcast(room, null);
}
function crBroadcast(room, over) {
  room.players.forEach((p, i) => send(p, {
    t: "cr:state", you: i, names: room.names, board: room.board.join(""), turn: room.turn, last: room.last,
    over: !!over, winner: over ? over.winner : null, line: over ? over.line : null, wins: room.wins
  }));
}
function crMove(room, i, r, c) {
  if (room.phase !== "play" || room.turn !== i) return;
  if (!Number.isInteger(r) || !Number.isInteger(c) || r < 0 || c < 0 || r >= CR_N || c >= CR_N) return;
  const k = r * CR_N + c; if (room.board[k]) return;
  room.board[k] = i + 1; room.last = [r, c]; room.moves++;
  const line = crWin(room.board, r, c, i + 1);
  if (line) { room.phase = "ended"; room.wins[i]++; crBroadcast(room, { winner: i, line }); room.players.forEach((p, k) => reward(room, k, k === i ? 300 : 50, "Cờ ca rô")); return; }
  if (room.moves >= CR_N * CR_N) { room.phase = "ended"; crBroadcast(room, { winner: -1, line: null }); room.players.forEach((p, k) => reward(room, k, 100, "Cờ ca rô")); return; }
  room.turn = 1 - i; crBroadcast(room, null);
}

/* ---------- Điều phối ---------- */
function handle(ws, m) {
  const room = ws.mroom, i = room ? room.players.indexOf(ws) : -1;
  switch (m.t) {
    case "m:create": return create(ws, m);
    case "m:join": return join(ws, m);
    case "m:leave": return leave(ws);
    case "m:again": return again(ws);
    case "tl:play": if (room && room.game === "tl" && i >= 0) tlPlay(room, i, m.ids); return;
    case "tl:pass": if (room && room.game === "tl" && i >= 0) tlPass(room, i); return;
    case "cr:move": if (room && room.game === "cr" && i >= 0) crMove(room, i, m.r, m.c); return;
    case "hb:ans": if (room && room.game === "hb" && i >= 0) hbAns(room, i, m.text); return;
  }
}
function stats() {
  const g = { tl: { rooms: 0, players: 0 }, hb: { rooms: 0, players: 0 }, cr: { rooms: 0, players: 0 } };
  rooms.forEach(r => { const x = g[r.game]; if (x) { x.rooms++; x.players += r.players.length; } });
  return g;
}
module.exports = { handle, leave, stats };
