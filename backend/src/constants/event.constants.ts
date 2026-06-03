export const DISPLAY_CATEGORY = {
  HERO: 'HERO',
  FEATURED: 'FEATURED',
  HIGHLIGHT: 'HIGHLIGHT',
  NORMAL: 'NORMAL',
} as const;
export type DisplayCategory =
  (typeof DISPLAY_CATEGORY)[keyof typeof DISPLAY_CATEGORY];

export const EVENT_CATEGORY = {
  ACADEMIC: 'ACADEMIC',
  CULTURE: 'CULTURE',
  SPORT: 'SPORT',
  COMMUNITY: 'COMMUNITY',
  NATIONAL: 'NATIONAL',
  SCHOOL: 'SCHOOL',
  SEMINAR: 'SEMINAR',
} as const;
export type EventCategory =
  (typeof EVENT_CATEGORY)[keyof typeof EVENT_CATEGORY];

export const SCALE = {
  UNIT: 'UNIT',
  SCHOOL: 'SCHOOL',
  CITY: 'CITY',
  NATIONAL: 'NATIONAL',
} as const;
export type Scale = (typeof SCALE)[keyof typeof SCALE];

export const EVENT_STATUS = {
  DRAFT: 'DRAFT',
  UPCOMING: 'UPCOMING',
  OPEN: 'OPEN',
  ONGOING: 'ONGOING',
  CLOSED: 'CLOSED',
  CANCELLED: 'CANCELLED',
} as const;
export type EventStatus = (typeof EVENT_STATUS)[keyof typeof EVENT_STATUS];

// Nap màu cho từng loại sự kiện
export const EVENT_CATEGORY_COLORS: Record<EventCategory, string> = {
  [EVENT_CATEGORY.ACADEMIC]: '#4A90D9',
  [EVENT_CATEGORY.CULTURE]: '#F4A7B9',
  [EVENT_CATEGORY.SPORT]: '#F5A623',
  [EVENT_CATEGORY.COMMUNITY]: '#7ED321',
  [EVENT_CATEGORY.NATIONAL]: '#D0021B',
  [EVENT_CATEGORY.SCHOOL]: '#FF6B35',
  [EVENT_CATEGORY.SEMINAR]: '#50E3C2',
};
