# QR Shortlink Manager

Ứng dụng Next.js (App Router) + PostgreSQL (Prisma) để quản lý mã QR code và shortlink linh hoạt.

## Chức năng
1. Tạo shortlink (slug tùy chọn hoặc tự sinh)
2. Ánh xạ tới target URL (có thể thay đổi về sau) — QR luôn ổn định
3. Sinh QR code với tùy chọn: kích thước, màu foreground, màu background, logo nhúng giữa
4. Xem danh sách (lọc theo user sau khi đăng nhập), chỉnh sửa cấu hình và target URL
5. Endpoint redirect: `/s/{slug}` (ghi nhận thống kê lượt quét)
6. Endpoint ảnh QR động: `/api/qrcode/{slug}` (có cache in-memory + ETag)
7. Đăng ký / đăng nhập (Credentials) với NextAuth
8. Thống kê lượt quét (viewsCount + bảng sự kiện)

## Thiết kế ổn định
QR code luôn mã hóa URL trung gian: `${BASE_URL}/s/{slug}`. Khi bạn đổi `targetUrl`, ảnh QR không cần thay đổi vì slug giữ nguyên.

## Cài đặt

1. Sao chép `.env.example` thành `.env` và chỉnh:
```
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/qrdb?schema=public
BASE_URL=http://localhost:3000
NEXTAUTH_SECRET=chuoi_bi_mat
```
2. Cài dependency:
```
npm install
```
3. Tạo migration & generate Prisma Client:
```
npx prisma migrate dev --name init
```
4. Chạy dev:
```
npm run dev
```
5. Mở `http://localhost:3000`

## Cấu trúc bảng
`User(id, email unique, passwordHash, name?, createdAt, updatedAt)`
`Link(id, slug unique, targetUrl, ownerId?, viewsCount, createdAt, updatedAt)`
`QrCode(id, linkId unique FK->Link, size, foregroundColor, backgroundColor, logoPath, createdAt, updatedAt)`
`ScanEvent(id, linkId FK->Link, createdAt, ip?, userAgent?)`

## Upload logo
Logo gửi dưới dạng base64 (client đọc file). Server lưu vào `public/logos/{slug}.{ext}` và composite vào ảnh bằng `sharp`.

## Các API chính
- POST `/api/links` body: `{ targetUrl, slug?, size?, foregroundColor?, backgroundColor?, logoBase64? }`
- PATCH `/api/links/{id}` body: trường muốn cập nhật
- GET `/api/qrcode/{slug}` -> ảnh PNG
- GET `/s/{slug}` -> redirect 302

## Ghi chú bảo mật / mở rộng
- Thêm 2FA / OAuth providers (Google, GitHub) qua NextAuth.
- Thêm rate limit khi tạo link.
- Có thể cache ảnh QR đã render ra file để giảm CPU.
- Thêm trường đếm số lần click (tạo bảng ClickLog / middleware).
 - Triển khai Vercel: cần đặt biến môi trường `DATABASE_URL`, `NEXTAUTH_SECRET`, `BASE_URL` (dùng Production URL). Cơ chế cache in-memory chỉ hiệu quả trên mỗi instance; cân nhắc object storage hoặc edge cache (CDN) nếu lưu lượng lớn.

## Giới hạn & Edge Cases
- Kích thước giới hạn (120-1024).
- Màu hex hợp lệ (#RRGGBB) nên được kiểm tra thêm (hiện tại minimal).
- Logo quá lớn sẽ tự resize 20% kích thước QR.
 - In-memory cache không chia sẻ giữa replicas (Serverless). Dùng CDN hoặc persistent cache nếu cần.

## License
MIT
