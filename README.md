# H? th?ng Qu?n lý Ngày Rèn luy?n

H? th?ng qu?n lý s? ki?n và ngày rèn luy?n toàn di?n v?i thi?t k? theo mô hình Client-Server. H? th?ng h? tr? sinh viên dang ký, check-in qua QR code, và h? tr? ban t? ch?c qu?n lý s? ki?n, di?m danh cung nhu import danh sách sinh viên qua Excel.

## Các module chính
1. **Frontend (React + Vite)**:
   - Giao di?n ngu?i dùng hi?n d?i v?i TailwindCSS, shadcn/ui.
   - SPA (Single Page Application) tuong tác mu?t mà, h? tr? tìm ki?m s? ki?n, qu?n lý form d?ng.
   - H? tr? da ngôn ng? (i18n), qu?n lý state qua Zustand/Context.

2. **Backend (NestJS + PostgreSQL)**:
   - Ki?n trúc module hóa ch?t ch?.
   - Xác th?c & Phân quy?n: Ðang nh?p JWT. H? tr? da vai trò: STUDENT, EVENT_MANAGER, ADMIN, SUPER_ADMIN.
   - Ràng bu?c d? li?u (Validation) nghiêm ng?t (vd: mssv - Mã s? sinh viên là duy nh?t).
   - Cron Job t? d?ng c?p nh?t tr?ng thái s? ki?n (UPCOMING ? ONGOING ? CLOSED).
   - Tích h?p tài li?u API v?i Swagger UI.

## Tính nang n?i b?t
- **Ðang ký & Check-in**: Sinh viên nh?n QR code sau khi dang ký. H? tr? quét QR ho?c check-in th? công.
- **Import/Export Excel**: X? lý d? li?u danh sách tham gia quá kh? nhanh chóng qua file Excel.
- **Th?ng kê**: Dashboard t?ng quan s? lu?ng s? ki?n, t? l? tham gia và danh sách ngu?i dùng.

## Cài d?t và ch?y v?i Docker (Khuy?n ngh?)
1. C?u hình môi tru?ng b?ng cách t?o file .env ? thu m?c g?c.
2. Build và ch?y các container:
   `ash
   docker-compose up -d --build
   `
3. Kh?i t?o Database (Migration) trên Docker:
   `ash
   docker exec nest_backend npm run typeorm migration:run
   `

