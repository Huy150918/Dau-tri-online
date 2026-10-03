"use strict";
/* Voice chat (WebRTC): máy chủ chỉ chuyển tin báo kết nối (signaling).
   Âm thanh đi thẳng giữa các điện thoại (P2P), không đi qua máy chủ nên không tốn băng thông Render. */
const crypto = require("crypto");

function send(ws, o) { if (ws && ws.readyState === 1) ws.send(JSON.stringify(o)); }
const roomOf = ws => ws.room || ws.mroom;
const members = room => (room && Array.isArray(room.players) ? room.players.filter(Boolean) : []);
const nameOf = (room, ws) => (room.names && room.names[room.players.indexOf(ws)]) || "Người chơi";

function handle(ws, m) {
  const room = roomOf(ws); if (!room) return;
  if (m.t === "v:join") {
    if (!ws.vid) ws.vid = crypto.randomBytes(5).toString("hex");
    const peers = members(room).filter(p => p !== ws && p.voice).map(p => ({ id: p.vid, name: nameOf(room, p) }));
    ws.voice = true;
    send(ws, { t: "v:peers", me: ws.vid, peers });
    members(room).forEach(p => { if (p !== ws) send(p, { t: "v:joined", id: ws.vid, name: nameOf(room, ws) }); });
  } else if (m.t === "v:leave") {
    drop(ws);
  } else if (m.t === "v:sig") {
    if (!ws.voice) return;
    const now = Date.now(); ws.vLog = (ws.vLog || []).filter(t => now - t < 10000);
    if (ws.vLog.length >= 150) return; ws.vLog.push(now);
    const data = m.data; if (!data || typeof data !== "object") return;
    const to = members(room).find(p => p.vid === m.to && p.voice); if (!to) return;
    send(to, { t: "v:sig", from: ws.vid, name: nameOf(room, ws), data });
  }
}
function drop(ws) {
  if (!ws.voice) return;
  ws.voice = false;
  const room = roomOf(ws);
  if (room) members(room).forEach(p => { if (p !== ws) send(p, { t: "v:left", id: ws.vid }); });
}
module.exports = { handle, drop };
