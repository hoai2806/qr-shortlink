# Triển khai qua FTP/SFTP (KHÔNG khuyến khích cho Next.js production)

> Khuyến nghị dùng Git (pull), CI/CD hoặc SSH thay vì upload thủ công. FTP chỉ nên dùng nếu bạn bị giới hạn quyền.

## 1. Chuẩn bị build ở local
```bash
# Tại máy local
cp .env.production.example .env    # nếu bạn có file template, hoặc tự tạo thủ công
npm install
npm run build
```
Build xong sẽ có thư mục `.next/`.

## 2. Danh sách cần upload
Upload các thư mục & file sau lên server (ví dụ thư mục đích `/var/www/qr-app`):
- `.next/` (toàn bộ – giữ nguyên cấu trúc)
- `public/` (nếu có bạn tự thêm logo tĩnh, hiện tại repo chưa có public/logos trừ khi runtime tạo)
- `package.json`
- `package-lock.json`
- `.env` (TỰ TẠO TRÊN SERVER tốt hơn là upload) 
- `next.config.js`
- `prisma/` (để migrate deploy trên server)
- `node_modules/` (tùy: có thể cài lại trên server cho sạch)
- `app/`, `lib/`, `components/`, `middleware.ts`, `tsconfig.json`

## 3. Quy trình SFTP thủ công (ví dụ dùng lệnh)
```bash
sftp deploy@your-server-ip
# hoặc nếu buộc dùng root (KHÔNG khuyến khích)
# sftp root@your-server-ip

# Trong phiên SFTP:
mkdir qr-app
cd qr-app
put -r .next
put package.json
put package-lock.json
put -r app
put -r lib
put -r components
put prisma/schema.prisma prisma/schema.prisma
put next.config.js
put middleware.ts
put tsconfig.json
# Không upload .env qua SFTP nếu có thể tránh -> tạo thủ công trên server.
```

## 4. Tạo `.env` trên server
```bash
nano /var/www/qr-app/.env
```
Nội dung ví dụ:
```
NODE_ENV=production
BASE_URL=https://your-domain.com
NEXTAUTH_URL=https://your-domain.com
DATABASE_URL=postgresql://USER:PASSWORD@HOST:6543/postgres?pgbouncer=true&connection_limit=1&schema=qr_app
NEXTAUTH_SECRET=...chuoi_bimat...
```
Quyền:
```bash
chmod 600 /var/www/qr-app/.env
```

## 5. Cài dependency / migrate (nên qua SSH)
```bash
cd /var/www/qr-app
npm ci --omit=dev   # hoặc npm install --omit=dev
npx prisma migrate deploy
```

## 6. Chạy app (PM2)
```bash
pm2 start npm --name "qr-app" -- start
pm2 save
```

## 7. Nginx reverse proxy & HTTPS
Xem hướng dẫn chính trong README mục triển khai VPS.

## 8. Cập nhật phiên bản mới
1. Local: pull code mới, `npm install`, `npm run build`.
2. Upload các thay đổi (ưu tiên thay `.next/`, file mã nguồn mới/chỉnh sửa).
3. SSH vào server:
```bash
cd /var/www/qr-app
npx prisma migrate deploy
pm2 reload qr-app
```

## 9. Nhược điểm dùng FTP/SFTP
- Dễ upload thiếu file / sai phiên bản.
- Khó rollback.
- Có nguy cơ lộ `.env` nếu không cẩn thận.
- Không tự động build trên server (trừ khi bạn vẫn chạy build server-side).

## 10. Giải pháp tốt hơn
- Dùng Git + pull origin main + build.
- Thiết lập GitHub Actions deploy qua SSH.
- Dùng nền tảng (Vercel) tự build.

> Khuyến nghị: Chỉ dùng quy trình này khi không còn lựa chọn khác.
