export const USER_ROLE = {
  STUDENT: 'STUDENT',
  EVENT_MANAGER: 'EVENT_MANAGER',
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
} as const;
export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];

export const REGISTRATION_STATUS = {
  REGISTERED: 'REGISTERED',
  CHECKED_IN: 'CHECKED_IN',
  CANCELLED: 'CANCELLED',
} as const;
export type RegistrationStatus =
  (typeof REGISTRATION_STATUS)[keyof typeof REGISTRATION_STATUS];
