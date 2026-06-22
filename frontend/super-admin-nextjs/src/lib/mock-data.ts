import { User, Event, Registration, DashboardStats } from "@/types"

export const MOCK_STATS: DashboardStats = {
  totalEvents: 12,
  totalRegistrations: 1450,
  totalUsers: 3400,
  checkInRate: 78,
  activeEvents: 4,
  totalCheckins: 0,
}

export const MOCK_EVENTS: Event[] = [
  {
    id: "1",
    title: "Hội nghị Công nghệ 2024",
    description: "Hội nghị công nghệ lớn nhất khu vực dành cho sinh viên.",
    date: "2024-06-15",
    location: "Hội trường chính A1",
    status: "SẮP DIỄN RA",
    capacity: 500,
    registeredCount: 420,
  },
  {
    id: "2",
    title: "Cuộc thi Khởi nghiệp",
    description: "Ra mắt dự án khởi nghiệp trong 48 giờ.",
    date: "2024-05-20",
    location: "Trung tâm Đổi mới sáng tạo",
    status: "ĐANG DIỄN RA",
    capacity: 100,
    registeredCount: 98,
  },
  {
    id: "3",
    title: "Workshop Trí tuệ nhân tạo",
    description: "Thực hành về AI tạo sinh và ứng dụng.",
    date: "2024-04-10",
    location: "Thư viện trung tâm",
    status: "ĐÃ KẾT THÚC",
    capacity: 50,
    registeredCount: 50,
  },
]

export const MOCK_REGISTRATIONS: Registration[] = [
  {
    id: "r1",
    studentId: "20120001",
    faculty: "Công nghệ thông tin",
    eventId: "1",
    eventName: "Hội nghị Công nghệ 2024",
    userName: "Nguyễn Văn A",
    userEmail: "vana@university.edu.vn",
    status: "ĐÃ ĐIỂM DANH",
    registrationDate: "2024-03-01",
  },
  {
    id: "r2",
    studentId: "20120045",
    faculty: "Kinh tế",
    eventId: "1",
    eventName: "Hội nghị Công nghệ 2024",
    userName: "Trần Thị B",
    userEmail: "thib@university.edu.vn",
    status: "ĐÃ XÁC NHẬN",
    registrationDate: "2024-03-02",
  },
  {
    id: "r3",
    studentId: "20120982",
    faculty: "Ngoại ngữ",
    eventId: "2",
    eventName: "Cuộc thi Khởi nghiệp",
    userName: "Lê Văn C",
    userEmail: "vanc@university.edu.vn",
    status: "CHỜ XỬ LÝ",
    registrationDate: "2024-03-05",
  },
]

export const MOCK_USERS: User[] = [
  {
    id: "u0",
    name: "Võ Ly",
    email: "voly@university.edu.vn",
    role: "Super Admin",
    status: "HOẠT ĐỘNG",
  },
  {
    id: "u1",
    name: "Quản trị viên Hệ thống",
    email: "admin@university.edu.vn",
    role: "Admin",
    status: "HOẠT ĐỘNG",
  },
  {
    id: "u2",
    name: "Nguyễn Quản Lý",
    email: "manager@university.edu.vn",
    role: "Manager",
    status: "HOẠT ĐỘNG",
  },
  {
    id: "u3",
    name: "Trần Sinh Viên",
    email: "student@university.edu.vn",
    role: "Student",
    status: "HOẠT ĐỘNG",
  },
]

export const EVENT_BREAKDOWN = [
  { id: "1", name: "Hội thảo Career Path", registered: 450, capacity: 500, color: "hsl(var(--primary))" },
  { id: "2", name: "Cuộc thi Lập trình", registered: 280, capacity: 300, color: "#10b981" },
  { id: "3", name: "Workshop AI & ML", registered: 120, capacity: 150, color: "#f59e0b" },
  { id: "4", name: "Hội nghị Công nghệ", registered: 850, capacity: 1000, color: "#6366f1" },
  { id: "5", name: "Talkshow Start-up", registered: 190, capacity: 200, color: "#ec4899" },
]

export const chartData = [
  { name: "Jan", registrations: 400 },
  { name: "Feb", registrations: 300 },
  { name: "Mar", registrations: 200 },
  { name: "Apr", registrations: 278 },
  { name: "May", registrations: 189 },
  { name: "Jun", registrations: 239 },
]

export const ALL_ACTIVITIES = [
  { user: "Võ Ly (Super Admin)", action: "Đã tạo sự kiện mới: Hội thảo Career Path", time: "10 phút trước", date: "Hôm nay" },
  { user: "Quản trị viên (Admin)", action: "Phê duyệt 24 lượt đăng ký mới", time: "45 phút trước", date: "Hôm nay" },
  { user: "Nguyễn Quản Lý (Manager)", action: "Cập nhật trạng thái sự kiện: Cuộc thi Lập trình", time: "2 giờ trước", date: "Hôm nay" },
  { user: "Võ Ly (Super Admin)", action: "Thêm thành viên mới vào hệ thống", time: "4 giờ trước", date: "Hôm nay" },
  { user: "Quản trị viên (Admin)", action: "Xuất báo cáo thống kê tháng 5", time: "6 giờ trước", date: "Hôm nay" },
  { user: "Nguyễn Quản Lý (Manager)", action: "Xóa sự kiện Hết hạn: Workshop Tiếng Anh", time: "Hôm qua", date: "Hôm qua" },
  { user: "Võ Ly (Super Admin)", action: "Thay đổi cài đặt bảo mật hệ thống", time: "2 ngày trước", date: "16/05/2026" },
  { user: "Quản trị viên (Admin)", action: "Hủy bỏ 3 vé đăng ký sai quy định", time: "3 ngày trước", date: "15/05/2026" },
  { user: "Nguyễn Quản Lý (Manager)", action: "Gửi thông báo đẩy cho 500 sinh viên", time: "5 ngày trước", date: "13/05/2026" },
  { user: "Võ Ly (Super Admin)", action: "Tạo tài khoản quản trị mới cho Phòng Đào Tạo", time: "7 ngày trước", date: "11/05/2026" },
]

export const CHECKED_IN_USERS: Record<string, { name: string; id: string; time: string; status: string }[]> = {
  "1": [
    { name: "Nguyễn Văn An", id: "20240001", time: "08:15", status: "Đã điểm danh" },
    { name: "Trần Thị Bình", id: "20240023", time: "08:20", status: "Đã điểm danh" },
    { name: "Lê Hoàng Cường", id: "20240105", time: "08:25", status: "Đã điểm danh" },
    { name: "Phạm Minh Đức", id: "20240089", time: "08:30", status: "Đã điểm danh" },
    { name: "Võ Thị Em", id: "20240210", time: "08:32", status: "Đã điểm danh" },
    { name: "Hoàng Văn Giang", id: "20240156", time: "08:35", status: "Đã điểm danh" },
  ],
  "2": [
    { name: "Bùi Thế Hiển", id: "20240567", time: "09:00", status: "Đã điểm danh" },
    { name: "Đặng Thu Hương", id: "20240890", time: "09:05", status: "Đã điểm danh" },
  ],
  "3": [
    { name: "Lý Gia Kiệt", id: "20240901", time: "13:45", status: "Đã điểm danh" },
    { name: "Mai Hồng Liên", id: "20241022", time: "13:50", status: "Đã điểm danh" },
  ],
}
