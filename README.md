# QR Shortlink Manager

Ứng dụng Next.js (App Router) + PostgreSQL (Prisma) để quản lý mã QR code và shortlink linh hoạt.

## Chức năng
1. Tạo shortlink (slug tùy chọn hoặc tự sinh)
2. Ánh xạ tới target URL (có thể thay đổi về sau) — QR luôn ổn định
3. Sinh QR code với tùy chọn: kích thước, màu foreground, màu background, logo nhúng giữa
4. Xem danh sách (lọc theo user sau khi đăng nhập), chỉnh sửa cấu hình và target URL
5. Endpoint redirect: `/s/{slug}` (ghi nhận thống kê lượt quét)
6. Endpoint ảnh QR động: `/api/qrcode/{slug}` (có cache in-memory + ETag + header Cache-Control)
7. Đăng ký / đăng nhập (Credentials) với NextAuth
8. Thống kê lượt quét (viewsCount + bảng sự kiện)

## Thiết kế ổn định
QR code luôn mã hóa URL trung gian: `${BASE_URL}/s/{slug}`. Khi bạn đổi `targetUrl`, ảnh QR không cần thay đổi vì slug giữ nguyên.

## Cài đặt (Local Dev)

1. Tạo schema riêng (tùy chọn nhưng khuyến nghị nếu định deploy Supabase):
	```sql
	create schema if not exists qr_app;
	```
2. Sao chép `.env.example` thành `.env` và chỉnh:
	```
	DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/qrdb?schema=qr_app
	BASE_URL=http://localhost:3000
	NEXTAUTH_SECRET=chuoi_bi_mat
	```
3. Cài dependency:
	```bash
	npm install
	```
4. Tạo migration & generate Prisma Client:
	```bash
	npx prisma migrate dev --name init
	```
5. Chạy dev:
	```bash
	npm run dev
	```
6. Mở `http://localhost:3000`

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
- GET `/s/{slug}` -> redirect 302 (ghi nhận thống kê)

## Ghi chú bảo mật / mở rộng
- Thêm 2FA / OAuth providers (Google, GitHub) qua NextAuth.
- Thêm rate limit khi tạo link.
- Có thể cache ảnh QR đã render ra file để giảm CPU.
- Thêm trường đếm số lần click (tạo bảng ClickLog / middleware).
- Triển khai Vercel: cần đặt biến môi trường `DATABASE_URL`, `NEXTAUTH_SECRET`, `BASE_URL`. Cache in-memory chỉ hiệu quả mỗi instance.
- Dùng schema riêng (`qr_app`) để tránh lỗi Prisma P3005 trên Supabase.

## Giới hạn & Edge Cases
- Kích thước giới hạn (120-1024).
- Màu hex hợp lệ (#RRGGBB) nên được kiểm tra thêm (hiện tại minimal).
- Logo quá lớn sẽ tự resize 20% kích thước QR.
- In-memory cache không chia sẻ giữa replicas (Serverless). Dùng CDN hoặc persistent cache nếu cần.

## Triển khai Vercel + Supabase

1. Tạo project Supabase (region ap-southeast-1). Trong SQL Editor:
	```sql
	create schema if not exists qr_app;
	```
2. Lấy connection string (nếu dùng PgBouncer pooler cổng 6543) và thêm `&schema=qr_app` (khuyến nghị thêm `pgbouncer=true&sslmode=require`).
3. Import repo vào Vercel.
4. Environment Variables:
	- `DATABASE_URL` = `...postgres?pgbouncer=true&sslmode=require&schema=qr_app`
	- `NEXTAUTH_SECRET` = `openssl rand -base64 32`
	- `BASE_URL` = Production domain (vd: https://qr-shortlink.vercel.app)
5. Build Command: `npm run vercel-build` (chạy `prisma migrate deploy` + build). Hoặc giữ mặc định và add script migrate trong UI.
6. Redeploy → kiểm tra log có `Prisma migrate deploy`.
7. Đăng ký user, tạo link, quét QR.
8. Gắn custom domain (nếu có) rồi cập nhật lại `BASE_URL`.

### Pooling / Kết nối
Khuyến nghị luôn dùng pooler trên Supabase: giảm nguy cơ quá nhiều kết nối serverless. Ví dụ URL:
```
postgresql://postgres:<PASSWORD>@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require&schema=qr_app
```

### Caching QR
Route `/api/qrcode/:slug` có ETag + Cache-Control (max-age=3600, stale-while-revalidate). Có thể thay sang persistent / CDN nếu tải lớn.

### Nâng cấp hiệu năng
- Tách redirect `/s/:slug` sang Cloudflare Worker nếu cần latency thấp hơn.
- Pre-render QR + lưu object storage (R2/S3) khi traffic lớn.

### Rollback nhanh
Sử dụng Vercel Deployments (Revert). Với migration phá hủy, cân nhắc `prisma migrate diff` trước.

## License
MIT

# qr-shortlink
