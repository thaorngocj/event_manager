'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useLanguageStore, type Language } from '@/lib/stores/languageStore'

interface Translations {
  [key: string]: {
    EN: string
    VI: string
  }
}

export const translations: Translations = {
  // Branding
  brandName: { EN: 'VA Event', VI: 'Sự kiện VA' },
  universityName: { EN: 'VA', VI: 'VA' },
  portalTitle: { EN: 'Official VA Portal', VI: 'Cổng thông tin chính thức VA' },
  heroTitlePart1: { EN: 'Empowering', VI: 'Hệ thống Quản lý' },
  heroTitlePart2: { EN: 'at VA', VI: 'tại VA' },
  heroSubtitle: {
    EN: 'The unified platform for managing academic training, workshops, and student participation with cutting-edge verification.',
    VI: 'Nền tảng thống nhất để quản lý đào tạo học tập, hội thảo và sự tham gia của sinh viên với xác minh tiên tiến.',
  },
  enterPortal: { EN: 'Enter Portal', VI: 'Vào cổng' },
  portalLogin: { EN: 'Portal Login', VI: 'Đăng nhập' },
  stakeholders: { EN: 'Stakeholders', VI: 'Các đối tác' },
  features: { EN: 'Features', VI: 'Tính năng' },

  // Navigation
  dashboard: { EN: 'Dashboard', VI: 'Tổng quan' },
  events: { EN: 'Events', VI: 'Sự kiện' },
  history: { EN: 'My History', VI: 'Lịch sử' },
  checkin: { EN: 'Check-in', VI: 'Điểm danh' },
  userManagement: { EN: 'User Management', VI: 'Người dùng' },
  historicalImport: { EN: 'Historical Import', VI: 'Nhập dữ liệu' },
  signOut: { EN: 'Sign Out', VI: 'Đăng xuất' },

  // Dashboard & Stats
  welcome: { EN: 'Welcome back', VI: 'Chào mừng trở lại' },
  activeEvents: { EN: 'Active Events', VI: 'Sự kiện hiện tại' },
  totalReg: { EN: 'Total Registrations', VI: 'Tổng lượt đăng ký' },
  pendingCheckin: { EN: 'Pending Check-ins', VI: 'Đang chờ điểm danh' },
  uptime: { EN: 'System Uptime', VI: 'Thời gian hoạt động' },
  recentActivities: { EN: 'Recent Events & Activities', VI: 'Hoạt động gần đây' },
  trainingDays: { EN: 'Training Days', VI: 'Ngày đào tạo' },
  capacity: { EN: 'Capacity', VI: 'Sức chứa' },
  full: { EN: 'Full', VI: 'Đầy' },

  // Landing Page Specific
  reliabilityTitle: { EN: 'Engineered for Reliability', VI: 'Thiết kế cho sự tin cậy' },
  qrSecurity: { EN: 'QR Security', VI: 'Bảo mật QR' },
  dataMigration: { EN: 'Data Migration', VI: 'Di chuyển dữ liệu' },
  realTimeAnalytics: { EN: 'Real-time Analytics', VI: 'Phân tích thời gian thực' },
  oneSystem: { EN: 'One System.', VI: 'Một hệ thống.' },
  everyRole: { EN: 'Every Role.', VI: 'Mọi vai trò.' },

  // Generic
  search: { EN: 'Search...', VI: 'Tìm kiếm...' },
  filters: { EN: 'Filters', VI: 'Bộ lọc' },
  export: { EN: 'Export CSV', VI: 'Xuất CSV' },
  status: { EN: 'Status', VI: 'Trạng thái' },
  actions: { EN: 'Actions', VI: 'Hành động' },
  registerNow: { EN: 'Register Now', VI: 'Đăng ký ngay' },
  registerEvent: { EN: 'Register for Event', VI: 'Đăng ký sự kiện' },
  attendeesRegistered: { EN: 'Attendees registered', VI: 'Người đã đăng ký' },
  eventName: { EN: 'Event Name', VI: 'Tên sự kiện' },
  dateTime: { EN: 'Date & Time', VI: 'Ngày & Giờ' },
  registrations: { EN: 'Registrations', VI: 'Lượt đăng ký' },
  viewReport: { EN: 'View Report', VI: 'Xem báo cáo' },
  view: { EN: 'View', VI: 'Xem' },
  open: { EN: 'Open', VI: 'Đang mở' },
  completed: { EN: 'Completed', VI: 'Hoàn thành' },
  upcoming: { EN: 'Upcoming', VI: 'Sắp tới' },
  closed: { EN: 'Closed', VI: 'Đã đóng' },
  actionRequired: { EN: 'Action Required', VI: 'Cần xử lý' },
  weekStat: { EN: 'this week', VI: 'tuần này' },
  across: { EN: 'Across', VI: 'Trên' },
  monitoring: { EN: 'Monitoring 24/7', VI: 'Giám sát 24/7' },
  historyTitle: { EN: 'Participation History', VI: 'Lịch sử Tham gia' },
  historySubtitle: {
    EN: 'View and download your training record certificates.',
    VI: 'Xem và tải xuống các chứng chỉ bản ghi đào tạo của bạn.',
  },
  exportPDF: { EN: 'Export PDF Record', VI: 'Xuất bản ghi PDF' },
  trainingLogs: { EN: 'My Training Logs', VI: 'Nhật ký đào tạo của tôi' },
  totalCredits: { EN: 'Total Credits Accumulated', VI: 'Tổng số tín chỉ tích lũy' },
  eventTitle: { EN: 'Event Title', VI: 'Tên sự kiện' },
  date: { EN: 'Date', VI: 'Ngày' },
  location: { EN: 'Location', VI: 'Địa điểm' },
  creditDays: { EN: 'Credit (Days)', VI: 'Tín chỉ (Ngày)' },
  attended: { EN: 'Attended', VI: 'Đã tham gia' },
  absent: { EN: 'Absent', VI: 'Vắng mặt' },
  searchLogs: { EN: 'Search logs...', VI: 'Tìm kiếm hoạt động...' },
  eventCheckIn: { EN: 'Event Check-in', VI: 'Điểm danh Sự kiện' },
  activeSession: { EN: 'Active Session', VI: 'Phiên đang hoạt động' },
  qrScanner: { EN: 'QR Scanner', VI: 'Máy quét QR' },
  scanPrompt: {
    EN: 'Scan student participation QR codes at entry.',
    VI: 'Quét mã QR tham gia của sinh viên tại lối vào.',
  },
  aligningQR: { EN: 'ALIGNING QR CODE...', VI: 'ĐANG CĂN CHỈNH MÃ QR...' },
  scannerIdle: { EN: 'Scanner is currently idle', VI: 'Máy quét đang ở trạng thái chờ' },
  startScanning: { EN: 'Start Scanning', VI: 'Bắt đầu quét' },
  checkInStatus: { EN: 'Check-in Status', VI: 'Trạng thái điểm danh' },
  recentEntries: {
    EN: "Recent successful entries for tonight's event.",
    VI: 'Các lượt vào thành công gần đây cho sự kiện.',
  },
  verifiedAt: { EN: 'Verified at', VI: 'Đã xác minh lúc' },
  verified: { EN: 'VERIFIED', VI: 'ĐÃ XÁC MINH' },
  waitingFirstCheckIn: {
    EN: 'Waiting for first check-in...',
    VI: 'Đang chờ lượt điểm danh đầu tiên...',
  },
  eventStats: { EN: 'Event Statistics', VI: 'Thống kê sự kiện' },
  present: { EN: 'Present', VI: 'Hiện diện' },
  viewAttendance: { EN: 'View Attendance List', VI: 'Xem danh sách điểm danh' },
  historicalDataImport: { EN: 'Historical Data Import', VI: 'Nhập dữ liệu lịch sử' },
  adminOnly: { EN: 'Admin Only', VI: 'Chỉ dành cho Admin' },
  uploadDataset: { EN: 'Upload Dataset', VI: 'Tải lên bộ dữ liệu' },
  fileSupport: {
    EN: 'Support CSV or Excel formats (.csv, .xlsx)',
    VI: 'Hỗ trợ định dạng CSV hoặc Excel (.csv, .xlsx)',
  },
  dragDrop: { EN: 'Click to browse or drag and drop', VI: 'Nhấp để duyệt hoặc kéo và thả' },
  maxSize: { EN: 'Maximum file size: 10MB', VI: 'Kích thước tệp tối đa: 10MB' },
  csvRequirement: { EN: 'Ensure your CSV has columns:', VI: 'Đảm bảo tệp CSV có các cột:' },
  invalidRowWarning: {
    EN: 'Invalid rows will be skipped and logged.',
    VI: 'Các hàng không hợp lệ sẽ được bỏ qua và ghi nhật ký.',
  },
  processing: { EN: 'Processing...', VI: 'Đang xử lý...' },
  runImport: { EN: 'Run Import Process', VI: 'Bắt đầu quy trình nhập' },
  importLogs: { EN: 'Import Logs', VI: 'Nhật ký nhập' },
  trackMigrations: {
    EN: 'Track previous data migrations and audits.',
    VI: 'Theo dõi các đợt di chuyển dữ liệu và kiểm tra trước đó.',
  },
  participants: { EN: 'Participants', VI: 'Người tham gia' },
  importedBy: { EN: 'Imported by', VI: 'Được nhập bởi' },
  importSuccess: { EN: 'Data imported successfully!', VI: 'Nhập dữ liệu thành công!' },
  userControl: { EN: 'System User Control', VI: 'Kiểm soát người dùng hệ thống' },
  addUser: { EN: 'Add System User', VI: 'Thêm người dùng hệ thống' },
  internalDirectory: { EN: 'Internal Directory', VI: 'Danh bạ nội bộ' },
  manageRoles: {
    EN: 'Manage staff roles and student access permissions.',
    VI: 'Quản lý vai trò nhân viên và quyền truy cập của sinh viên.',
  },
  user: { EN: 'User', VI: 'Người dùng' },
  systemRole: { EN: 'System Role', VI: 'Vai trò hệ thống' },
  active: { EN: 'ACTIVE', VI: 'ĐANG HOẠT ĐỘNG' },
  pending: { EN: 'PENDING', VI: 'ĐANG CHỜ' },
  inactive: { EN: 'INACTIVE', VI: 'NGỪNG HOẠT ĐỘNG' },
  admin: { EN: 'Admin', VI: 'Quản trị viên' },
  eventManager: { EN: 'Event Manager', VI: 'Quản lý sự kiện' },
  student: { EN: 'Student', VI: 'Sinh viên' },
  checkinsVerified: { EN: 'Check-ins Verified', VI: 'Lượt điểm danh đã xác minh' },
  institutions: { EN: 'Institutions', VI: 'Học viện/Cơ sở' },
  students: { EN: 'Students', VI: 'Sinh viên' },
  organizers: { EN: 'Organizers', VI: 'Ban tổ chức' },
  administrators: { EN: 'Administrators', VI: 'Quản trị viên' },
  browseRegister: { EN: 'Browse & Register', VI: 'Duyệt & Đăng ký' },
  personalQR: { EN: 'Personal QR Code', VI: 'Mã QR Cá nhân' },
  certHistory: { EN: 'Certificate History', VI: 'Lịch sử Chứng chỉ' },
  venueCheckin: { EN: 'Venue Check-in', VI: 'Điểm danh tại chỗ' },
  participationReports: { EN: 'Participation Reports', VI: 'Báo cáo tham gia' },
  eventLogistics: { EN: 'Event Logistics', VI: 'Hậu cần sự kiện' },
  roleManagement: { EN: 'Role Management', VI: 'Quản lý vai trò' },
  auditControl: { EN: 'Audit Control', VI: 'Kiểm soát kiểm toán' },
  dashboardPreview: { EN: 'Dashboard Preview', VI: 'Xem trước Tổng quan' },
  liveSystemView: { EN: 'Live System View', VI: 'Lượt xem hệ thống' },
  online: { EN: 'Online', VI: 'Trực tuyến' },
  platform: { EN: 'Platform', VI: 'Nền tảng' },
  company: { EN: 'Company', VI: 'Công ty' },
  qrScanning: { EN: 'QR Scanning', VI: 'Quét mã QR' },
  reporting: { EN: 'Reporting', VI: 'Báo cáo' },
  aboutUs: { EN: 'About Us', VI: 'Về chúng tôi' },
  support: { EN: 'Support', VI: 'Hỗ trợ' },
  privacy: { EN: 'Privacy', VI: 'Quyền riêng tư' },
  footerDesc: {
    EN: 'VA official event system. Standardizing event logistics and participation metrics for the modern educational landscape.',
    VI: 'Hệ thống sự kiện chính thức của VA. Chuẩn hóa hậu cần sự kiện và các chỉ số tham gia cho môi trường giáo dục hiện đại.',
  },
  systemStatus: { EN: 'System Status: Operative', VI: 'Trạng thái hệ thống: Hoạt động' },
  vluRights: { EN: '© 2026 VA. All rights reserved.', VI: '© 2026 VA. Bảo lưu mọi quyền.' },
  oneSystemDesc: {
    EN: 'VA platform adapts to your permissions, providing specialized tools for users at every level of the organization.',
    VI: 'Nền tảng VA thích ứng với quyền hạn của bạn, cung cấp các công cụ chuyên dụng cho người dùng ở mọi cấp độ của tổ chức.',
  },
  fraudProofDesc: {
    EN: 'Fraud-proof check-ins using unique student participation IDs generated in real-time.',
    VI: 'Điểm danh chống gian lận bằng cách sử dụng ID tham gia duy nhất của sinh viên được tạo trong thời gian thực.',
  },
  migrationDesc: {
    EN: 'Import historical participation records seamlessly with full audit logging support.',
    VI: 'Nhập các bản ghi tham gia lịch sử một cách liền mạch với sự hỗ trợ ghi nhật ký kiểm toán đầy đủ.',
  },
  realTimeDesc: {
    EN: 'Live attendance tracking and training day aggregation for official reporting.',
    VI: 'Theo dõi điểm danh trực tiếp và tổng hợp ngày đào tạo để báo cáo chính thức.',
  },
  systemLive: { EN: 'System Live', VI: 'Hệ thống đang chạy' },
  featuredEvents: { EN: 'Featured Events', VI: 'Sự kiện nổi bật' },
  proposedEvent: { EN: 'Proposed Event', VI: 'Sự kiện đề nghị' },
  recommendedEvents: { EN: 'Recommended Events', VI: 'Sự kiện được đề xuất' },
  alreadyRegistered: { EN: 'Already Registered', VI: 'Đã đăng ký' },
  registrationSuccess: { EN: 'Successfully registered for the event!', VI: 'Đăng ký sự kiện thành công!' },
  eventIntroductionTitle: { EN: 'Event Introduction', VI: 'Giới thiệu sự kiện' },
  loginToRegister: { EN: 'Please login to register for events', VI: 'Vui lòng đăng nhập để đăng ký sự kiện' },
  comeJoin: { EN: 'Come and join us!!', VI: 'Hãy cùng tham gia nào!!' },
  interestingEvents: { EN: 'Interesting events worth watching', VI: 'Những sự kiện thú vị đáng xem' },
  homepage: { EN: 'Homepage', VI: 'Trang chủ' },
  conferenceEvent: { EN: 'Conference - Event', VI: 'Hội nghị - Sự kiện' },
  eventCalendar: { EN: 'Event calendar', VI: 'Lịch sự kiện' },
  myEvent: { EN: 'My event', VI: 'Sự kiện của tôi' },
  personalInfo: { EN: 'Personal information', VI: 'Thông tin cá nhân' },
  createEvent: { EN: 'Create Event', VI: 'Tạo sự kiện' },
  myListOfEvents: { EN: 'My list of events', VI: 'Danh sách sự kiện của tôi' },
  addEvent: { EN: 'ADD EVENT', VI: 'THÊM SỰ KIỆN' },
  eventCode: { EN: 'Event code', VI: 'Mã sự kiện' },
  startTime: { EN: 'Start time', VI: 'Giờ bắt đầu' },
  operation: { EN: 'Operation', VI: 'Thao tác' },
  noEventsYet: { EN: "You don't have an event yet.", VI: 'Bạn chưa có sự kiện nào.' },
  registeredForEvent: { EN: 'Registered for the event', VI: 'Đã đăng ký sự kiện' },
  facultyInfo: { EN: 'Faculty of Information Technology', VI: 'Khoa Công nghệ thông tin' },
  participationInEvent: { EN: 'Participation In The Event', VI: 'Tham gia sự kiện' },
  approved: { EN: 'Approved', VI: 'Đã phê duyệt' },
  registeredEventsList: { EN: 'List of registered events', VI: 'Danh sách sự kiện đã đăng ký tham gia' },
  noRollCallYet: { EN: 'No Roll Call Yet', VI: 'Chưa Điểm Danh' },
  attendanceTaken: { EN: 'Attendance Has Been Taken', VI: 'Đã Điểm Danh' },
  eyeInfo: { EN: 'View Info', VI: 'Xem thông tin' },
  qrShort: { EN: 'QR Code', VI: 'Mã QR' },
  show: { EN: 'Show', VI: 'Xem' },
  entries: { EN: 'entries', VI: 'mục' },
  searchEvent: { EN: 'Search event', VI: 'Tìm kiếm sự kiện' },
  showingEntries: { EN: 'Showing', VI: 'Đang xem' },
  to: { EN: 'to', VI: 'đến' },
  of: { EN: 'of', VI: 'trong tổng số' },
  proposedEventSection: { EN: 'Proposed Event', VI: 'Sự kiện đề xuất' },
  eventCategories: { EN: 'Event Categories', VI: 'Danh mục sự kiện' },
  allCategories: { EN: 'All Categories', VI: 'Tất cả danh mục' },
  workshop: { EN: 'Workshop', VI: 'Hội thảo' },
  seminar: { EN: 'Seminar', VI: 'Chủ đề' },
  contest: { EN: 'Contest', VI: 'Cuộc thi' },
  career: { EN: 'Career', VI: 'Nghề nghiệp' },
  login: { EN: 'Login', VI: 'Đăng nhập' },
  loginWithEmail: { EN: 'LOGIN WITH VA EMAIL', VI: 'ĐĂNG NHẬP BẰNG EMAIL VA' },
  instruction: { EN: 'Instruction', VI: 'Hướng dẫn' },
  studentPortal: { EN: 'Student Portal', VI: 'Cổng Sinh Viên' },
  createEventTitle: { EN: 'CREATE NEW EVENT', VI: 'TẠO SỰ KIỆN MỚI' },
  editEventTitle: { EN: 'EDIT EVENT', VI: 'CHỈNH SỬA SỰ KIỆN' },
  eventBannerLabel: { EN: 'EVENT BANNER', VI: 'ẢNH BÌA SỰ KIỆN' },
  eventTitleLabel: { EN: 'EVENT TITLE', VI: 'TÊN SỰ KIỆN' },
  eventDetailsLabel: { EN: 'EVENT DETAILS', VI: 'CHI TIẾT SỰ KIỆN' },
  eventDateLabel: { EN: 'DATE', VI: 'NGÀY' },
  eventClosingDateLabel: { EN: 'CLOSING DATE', VI: 'NGÀY ĐÓNG' },
  eventTimeLabel: { EN: 'TIME', VI: 'GIỜ' },
  eventLocationLabel: { EN: 'LOCATION', VI: 'ĐỊA ĐIỂM' },
  eventCapacityLabel: { EN: 'CAPACITY', VI: 'SỨC CHỨA' },
  eventCategoryLabel: { EN: 'CATEGORY TAG', VI: 'NHÃN THỂ LOẠI' },
  displaySectionLabel: { EN: 'DISPLAY SECTION', VI: 'MỤC HIỂN THỊ' },
  confirmPublish: { EN: 'CONFIRM & PUBLISH EVENT', VI: 'XÁC NHẬN & XUẤT BẢN SỰ KIỆN' },
  updateEventBtn: { EN: 'UPDATE EVENT', VI: 'CẬP NHẬT SỰ KIỆN' },
  placeholderTitle: { EN: 'e.g. AI WORKSHOP 2026', VI: 'VD: HỘI THẢO AI 2026' },
  placeholderDetails: { EN: 'Enter event description...', VI: 'Nhập mô tả sự kiện...' },
  placeholderLocation: { EN: 'e.g. Hall A', VI: 'VD: Hội trường A' },
  placeholderCategory: { EN: 'WORKSHOP', VI: 'HỘI THẢO' },
  placeholderName: { EN: 'e.g. John Doe', VI: 'VD: Nguyễn Văn A' },
  placeholderEmail: { EN: 'e.g. john@school.edu', VI: 'VD: a.nguyen@vlu.edu.vn' },
  placeholderSchoolId: { EN: 'e.g. ADM001', VI: 'VD: 217IT01010' },
  addUserTitle: { EN: 'ADD SYSTEM USER', VI: 'THÊM NGƯỜI DÙNG HỆ THỐNG' },
  editUserTitle: { EN: 'EDIT SYSTEM USER', VI: 'CHỈNH SỬA NGƯỜI DÙNG' },
  addUserDesc: {
    EN: 'Grant administrative or managerial access to a new user.',
    VI: 'Cấp quyền quản trị hoặc quản lý cho người dùng mới.',
  },
  editUserDesc: {
    EN: 'Update credentials and permissions for this user.',
    VI: 'Cập nhật thông tin đăng nhập và quyền hạn cho người dùng này.',
  },
  fullNameLabel: { EN: 'FULL NAME', VI: 'HỌ VÀ TÊN' },
  emailLabel: { EN: 'EMAIL ADDRESS', VI: 'ĐỊA CHỈ EMAIL' },
  schoolIdLabel: { EN: 'SCHOOL ID', VI: 'MÃ SỐ CÁN BỘ/SINH VIÊN' },
  roleLabel: { EN: 'INITIAL ROLE', VI: 'VAI TRÒ KHỞI TẠO' },
  grantAccessBtn: { EN: 'GRANT SYSTEM ACCESS', VI: 'CẤP QUYỀN TRUY CẬP' },
  updateUserBtn: { EN: 'UPDATE USER', VI: 'CẬP NHẬT NGƯỜI DÙNG' },
  identityHeader: { EN: 'IDENTITY', VI: 'DANH TÍNH' },
  permissionsHeader: { EN: 'SYSTEM PERMISSIONS', VI: 'QUYỀN HỆ THỐNG' },
  statusHeader: { EN: 'STATUS', VI: 'TRẠNG THÁI' },
  actionsHeader: { EN: 'ACTIONS', VI: 'THAO TÁC' },
  searchUserPlaceholder: {
    EN: 'SEARCH BY NAME, EMAIL, OR SCHOOL ID...',
    VI: 'TÌM THEO TÊN, EMAIL, HOẶC MSSV...',
  },
  deleteUser: { EN: 'Delete User', VI: 'Xóa Người Dùng' },
  editUser: { EN: 'Edit User', VI: 'Chỉnh Sửa' },
  selectRole: { EN: 'Select Role', VI: 'Chọn vai trò' },
  noResultsFound: {
    EN: 'No users matching your search parameters',
    VI: 'Không tìm thấy người dùng phù hợp',
  },
  backToHome: { EN: 'Back to Home', VI: 'Quay lại trang chủ' },
  attendanceList: { EN: 'Attendance List', VI: 'Danh sách điểm danh' },
  studentId: { EN: 'Student ID', VI: 'Mã số sinh viên' },
  checkInTime: { EN: 'Check-in Time', VI: 'Thời gian điểm danh' },
  noAttendanceData: { EN: 'No students have checked in yet.', VI: 'Chưa có sinh viên nào điểm danh.' },
  backToCheckIn: { EN: 'Back to Check-in', VI: 'Quay lại điểm danh' },
  profilePicture: { EN: 'Profile Picture', VI: 'Ảnh đại diện' },
  uploadImage: { EN: 'Upload Image', VI: 'Tải ảnh lên' },
  removeImage: { EN: 'Remove Image', VI: 'Gỡ bỏ ảnh' },
  imageTooLarge: { EN: 'Image size should be less than 5MB', VI: 'Kích thước ảnh phải nhỏ hơn 5MB' },
  eventBox: { EN: 'EventBox', VI: 'Hộp sự kiện' },
  myEventsSection: { EN: 'My Events', VI: 'Sự kiện của tôi' },
  account: { EN: 'Account', VI: 'Tài khoản' },
}

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
  resolve: (val: string | { EN: string; VI: string } | undefined) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { language, setLanguage } = useLanguageStore()

  const t = (key: string) => translations[key]?.[language] || key

  const resolve = (val: string | { EN: string; VI: string } | undefined) => {
    if (!val) return ''
    if (typeof val === 'string') return val
    return val[language] || val.EN
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, resolve }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (context === undefined) throw new Error('useLanguage must be used within a LanguageProvider')
  return context
}
