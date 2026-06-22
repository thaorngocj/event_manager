export type UserRole = 'Super Admin' | 'Admin' | 'Manager' | 'Student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  status: 'HOẠT ĐỘNG' | 'KHOÁ';
  password?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  status: 'SẮP DIỄN RA' | 'ĐANG DIỄN RA' | 'ĐÃ KẾT THÚC' | 'ĐÃ HỦY';
  capacity: number;
  registeredCount: number;
  imageUrl?: string;
  displayCategory?: 'HERO' | 'FEATURED' | 'HIGHLIGHT' | 'NORMAL';
  eventCategory?: string;
}

export interface Registration {
  id: string;
  studentId: string;
  faculty: string;
  eventId: string;
  eventName: string;
  userName: string;
  userEmail: string;
  status: 'ĐÃ XÁC NHẬN' | 'CHỜ XỬ LÝ' | 'ĐÃ HỦY' | 'ĐÃ ĐIỂM DANH';
  registrationDate: string;
}

export interface DashboardStats {
  totalEvents: number;
  totalRegistrations: number;
  totalUsers: number;
  checkInRate: number;
  activeEvents: number;
  totalCheckins: number;
}
