# Var Nhau – trò chơi online

## Cấu trúc thư mục
```
index.html            giao diện (chỉ phần khung HTML)
css/style.css         toàn bộ kiểu dáng
js/app.js             toàn bộ mã chạy trên điện thoại
assets/avatars/       18 hình avatar (.svg) + catalog.json (tên, màu khung, giá)
assets/ui/            icon: túi, shop, xu, mic, chat, favicon
server.js             máy chủ (phòng chơi, API, phục vụ file)
multi.js              Tiến lên, Đuổi hình bắt chữ, Cờ ca rô
accounts.js           tài khoản + điểm + shop lưu trên máy chủ
voice.js              chuyển tín hiệu cho mic (WebRTC)
questions.js          câu hỏi Var Nhau
package.json, render.yaml
.github/workflows/build-apk.yml   tạo file APK
```

## Điểm và shop
- **50 điểm = 1 điểm shop.** Mỗi avatar giá **100 điểm shop** (= 5.000 điểm). Sửa ở `assets/avatars/catalog.json`
  (`exchange`, `defaultPrice`, hoặc `"price"` riêng cho từng avatar).
- Điểm do **máy chủ** cộng khi hết ván. **Tài khoản khách không bao giờ lưu điểm.**
- Chơi offline (Cờ ca rô với máy, Đuổi hình một mình) máy chủ không kiểm chứng được nên giới hạn:
  cách nhau 15 giây và tối đa 3.000 điểm mỗi ngày từ nguồn này.

## Lưu tài khoản và điểm: PHẢI làm bước này
Máy chủ miễn phí của Render **xoá mọi file khi ngủ hoặc khởi động lại**, nên file `data/db.json` chỉ dùng để thử.
Để không mất tài khoản và điểm, dùng Upstash Redis (có gói miễn phí):
1. Vào https://upstash.com, tạo tài khoản, **Create Database** (Redis), chọn vùng gần (Singapore).
2. Trong trang database, mục **REST API**, chép `UPSTASH_REDIS_REST_URL` và `UPSTASH_REDIS_REST_TOKEN`.
3. Render > service > **Environment** > thêm 2 biến trên với đúng giá trị đó > Save.
4. Mở `/stats` (hoặc `/stats.json`): mục `taiKhoan.mode` phải là `redis`.

## Mic (voice chat)
- Âm thanh đi thẳng giữa các điện thoại (WebRTC), không qua máy chủ. Mặc định dùng STUN miễn phí của Google.
- Một số mạng (đặc biệt 4G) chặn kết nối trực tiếp. Khi đó cần máy chủ TURN: đặt biến môi trường
  `TURN_URLS` (ví dụ `turn:host:3478,turns:host:5349`), `TURN_USER`, `TURN_PASS` trên Render.
- **APK phải build lại** để có quyền micro (workflow đã thêm sẵn). Trên trình duyệt thì không cần.

## Biến môi trường (Render > Environment)
| Biến | Tác dụng |
|---|---|
| UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN | nơi lưu tài khoản và điểm (khuyên dùng) |
| TOKEN_SECRET | (không bắt buộc) khoá ký đăng nhập, mặc định tự sinh và lưu cùng dữ liệu |
| STATS_KEY | (không bắt buộc) khoá xem trang `/stats?key=...` |
| TURN_URLS, TURN_USER, TURN_PASS | (không bắt buộc) máy chủ TURN cho mic |
| DATA_DIR | (không bắt buộc) thư mục lưu `db.json` khi không dùng Upstash |

## Chạy thử trên máy tính
```
npm install
npm start       # mở http://localhost:3000
```
