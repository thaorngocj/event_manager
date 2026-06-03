# Hệ thống Quản lý Ngày Rèn luyện
Hệ thống quản lý sự kiện và ngày rèn luyện toàn diện với thiết kế theo mô hình Client-Server. Hệ thống hỗ trợ sinh viên đăng ký, check-in qua QR code, và hỗ trợ ban tổ chức quản lý sự kiện, điểm danh cũng như import danh sách sinh viên qua Excel.

## Các module chính

### 1. Frontend (React + Vite)
- Giao diện người dùng hiện đại với TailwindCSS, shadcn/ui.
- SPA (Single Page Application) tương tác mượt mà, hỗ trợ tìm kiếm sự kiện, quản lý form đăng ký.
- Hỗ trợ đa ngôn ngữ (i18n), quản lý state qua Zustand/Context.

### 2. Backend (NestJS + PostgreSQL)
- Kiến trúc module hóa chặt chẽ.
- Xác thực & Phân quyền: Đăng nhập JWT. Hỗ trợ đa vai trò: `STUDENT`, `EVENT_MANAGER`, `ADMIN`, `SUPER_ADMIN`.
- Ràng buộc dữ liệu (Validation) nghiêm ngặt (ví dụ: MSSV — Mã số sinh viên là duy nhất).
- Cron Job tự động cập nhật trạng thái sự kiện (`UPCOMING` → `ONGOING` → `CLOSED`).
- Tích hợp tài liệu API với Swagger UI.

## Tính năng nổi bật

- **Đăng ký & Check-in**: Sinh viên nhận QR code sau khi đăng ký. Hỗ trợ quét QR hoặc check-in thủ công.
- **Import/Export Excel**: Xử lý dữ liệu danh sách tham gia quá khứ nhanh chóng qua file Excel.
- **Thống kê**: Dashboard tổng quan số lượng sự kiện, tỉ lệ tham gia và danh sách người dùng.

## Cài đặt và chạy với Docker (Khuyến nghị)

1. Cấu hình môi trường bằng cách tạo file `.env` ở thư mục gốc.

2. Build và chạy các container:
   ```bash
   docker-compose up -d --build
   ```

3. Khởi tạo Database (Migration) trên Docker:
   ```bash
   docker exec nest_backend npm run typeorm migration:run
   ```