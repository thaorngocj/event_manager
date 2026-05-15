### Hệ thống Quản lý Ngày Rèn luyện - Backend
Backend API chuyên dụng cho hệ thống quản lý sự kiện, hỗ trợ đăng ký, check-in, thống kê và phân quyền người dùng. Hệ thống được thiết kế để vận hành ổn định trên môi trường Docker.

### Tính năng chính
- Xác thực & Phân quyền: Đăng nhập JWT, refresh token. Hỗ trợ đa vai trò: STUDENT, EVENT_MANAGER, ADMIN, SUPER_ADMIN.
- Quản lý sự kiện: Quy trình tự động (UPCOMING → ONGOING → CLOSED). Lọc theo danh mục và hiển thị lịch.
- Đăng ký & Check-in: Sinh viên nhận QR code sau khi đăng ký. Hỗ trợ quét QR hoặc check-in thủ công.
- Import/Export Excel: Xử lý dữ liệu danh sách người tham gia nhanh chóng qua file Excel.
- Thống kê: Dashboard tổng quan về số lượng sự kiện, tỷ lệ tham gia và bảng xếp hạng sinh viên.

** Tài liệu API: Tích hợp Swagger UI tương tác trực tiếp.

### Công nghệ sử dụng
- Core: Node.js (v18), NestJS (v11)
- Database: PostgreSQL (v15), TypeORM
- Security: JWT (Passport-jwt)
- Utility: ExcelJS, QRCode, Winston (Logging)
- DevOps: Docker, Docker Compose

### Cài đặt và chạy với Docker (Khuyến nghị)
1. Clone repository
Bash
git clone <your-repo-url>
cd <project-folder>
2. Tạo file cấu hình môi trường
Tạo file .env ở thư mục gốc (cùng cấp với docker-compose.yml) với nội dung sau:

Đoạn mã
# Database Configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_strong_password
POSTGRES_DB=event_management

# Backend Connections
DB_HOST=db
DB_PORT=5432

# Security
JWT_SECRET=your_super_secret_key_change_me

# Server Port
PORT=3000
Lưu ý: DB_HOST phải để là db để khớp với tên service định nghĩa trong Docker Compose.

3. Build và chạy container
Bash
docker-compose up -d --build

Quá trình này sẽ:
- Tải các Image cần thiết (PostgreSQL, Node.js).
- Tự động cài đặt dependencies và build source code.
- Khởi chạy các container theo đúng thứ tự.

4. Khởi tạo Database (Migration)
Sau khi container đã chạy, bạn cần chạy migration để tạo bảng và dữ liệu mẫu:

Bash
# Truy cập vào container
docker exec -it nest_backend sh

# Chạy migration bên trong container
npm run typeorm migration:run -- -d dist/data-source.js
Dữ liệu mẫu bao gồm các tài khoản: Admin, Student và Super Admin.

5. Kiểm tra hoạt động
API Endpoint: http://localhost:3000/api/v1
Swagger Documentation: http://localhost:3000/api/docs

📂 Cấu trúc thư mục
.
├── src/
│   ├── common/logger/       # Cấu hình Winston logging
│   ├── constants/           # Định nghĩa Role, Status, Category
│   ├── decorators/          # Các custom decorator (ví dụ: @Roles)
│   ├── guards/              # JwtAuthGuard, RolesGuard
│   ├── migrations/          # File quản lý cấu trúc DB
│   ├── modules/
│   │   ├── auth/            # Xử lý Login, JWT, Refresh Token
│   │   ├── users/           # Quản lý người dùng & phân quyền
│   │   ├── events/          # CRUD sự kiện & xử lý Excel
│   │   ├── registrations/   # Đăng ký, QR Code & Check-in
│   │   └── statistics/      # Tổng hợp dữ liệu báo cáo
│   ├── app.module.ts
│   └── main.ts
├── Dockerfile
├── docker-compose.yml
├── .env
└── README.md