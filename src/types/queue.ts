export type ServiceType =
  | 'FOOD_ORDER'
  | 'DOCTOR_CONSULTATION'
  | 'DOCUMENT_VERIFICATION'
  | 'PAYMENT_COUNTER';

export type PriorityCategory = 'EMERGENCY' | 'VIP' | 'ELDERLY' | 'NORMAL';

export type QueueStatus =
  | 'WAITING'
  | 'CHECKED_IN'
  | 'SERVING'
  | 'SERVED'
  | 'SKIPPED'
  | 'NO_SHOW'
  | 'CANCELLED';

export type NoShowRisk = 'LOW' | 'MEDIUM' | 'HIGH';

export interface ServiceTypeInfo {
  type: ServiceType;
  displayName: string;
  codePrefix: string;
  description: string;
  iconName: string;
}

export const SERVICE_TYPES: Record<ServiceType, ServiceTypeInfo> = {
  FOOD_ORDER: {
    type: 'FOOD_ORDER',
    displayName: 'Food Order',
    codePrefix: 'F',
    description: 'Canteen snacks, hot meals, beverages & tray pickup',
    iconName: 'Utensils',
  },
  DOCTOR_CONSULTATION: {
    type: 'DOCTOR_CONSULTATION',
    displayName: 'Doctor Consultation',
    codePrefix: 'D',
    description: 'General outpatient, specialist checkup & prescription',
    iconName: 'Stethoscope',
  },
  DOCUMENT_VERIFICATION: {
    type: 'DOCUMENT_VERIFICATION',
    displayName: 'Document Verification',
    codePrefix: 'V',
    description: 'Admissions, student ID verification, transcripts & seals',
    iconName: 'FileCheck',
  },
  PAYMENT_COUNTER: {
    type: 'PAYMENT_COUNTER',
    displayName: 'Payment Counter',
    codePrefix: 'P',
    description: 'Tuition fees, cashier deposits, card & bill settlements',
    iconName: 'CreditCard',
  },
};

export interface PriorityInfo {
  category: PriorityCategory;
  value: number;
  displayName: string;
  description: string;
  badgeColor: string;
}

export const PRIORITY_CONFIG: Record<PriorityCategory, PriorityInfo> = {
  EMERGENCY: {
    category: 'EMERGENCY',
    value: 1,
    displayName: 'Emergency',
    description: 'Served first immediately (medical priority or urgent desk)',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  VIP: {
    category: 'VIP',
    value: 2,
    displayName: 'VIP',
    description: 'Served after emergencies (faculty, priority cardholders)',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  ELDERLY: {
    category: 'ELDERLY',
    value: 3,
    displayName: 'Elderly / Senior',
    description: 'Served after VIP (special assistance & accessibility)',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  NORMAL: {
    category: 'NORMAL',
    value: 4,
    displayName: 'Normal',
    description: 'Standard virtual queue line (FIFO among equal priority)',
    badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
  },
};

export interface Customer {
  id: number;
  name: string;
  phoneNumber: string;
  totalVisits: number;
  totalNoShows: number;
  createdAt: string;
}

export interface ServiceCounter {
  id: number;
  counterName: string;
  serviceType: ServiceType;
  isActive: boolean;
}

export interface QueueEntry {
  id: number;
  tokenNumber: string;
  customer: Customer;
  serviceType: ServiceType;
  priority: PriorityCategory;
  status: QueueStatus;
  joinedAt: string;
  serviceStartedAt?: string;
  serviceCompletedAt?: string;
  estimatedWaitMinutes: number;
  queuePosition: number;
  assignedCounter?: ServiceCounter;
  checkedIn: boolean;
  checkedInAt?: string;
  qrCodePath?: string;
}

export interface QueueEntryResponse {
  id: number;
  tokenNumber: string;
  customerName: string;
  phoneNumber: string;
  serviceType: ServiceType;
  serviceTypeName: string;
  priority: PriorityCategory;
  priorityName: string;
  priorityValue: number;
  status: QueueStatus;
  statusName: string;
  joinedAt: string;
  serviceStartedAt?: string;
  serviceCompletedAt?: string;
  estimatedWaitMinutes: number;
  queuePosition: number;
  peopleAhead: number;
  assignedCounterName?: string;
  assignedCounterId?: number;
  noShowRisk: NoShowRisk;
  noShowReason: string;
  totalPastNoShows: number;
  checkedIn: boolean;
  checkedInAt?: string;
  qrCodeData?: string;
  checkInWarning?: boolean;
}

export interface CustomerStatusResponse {
  tokenNumber: string;
  customerName: string;
  peopleAhead: number;
  estimatedWaitMinutes: number;
  queueType: string;
  priority: string;
  status: string;
  assignedCounter: string;
  queuePosition: number;
  checkedIn: boolean;
  checkedInAt?: string;
  qrCodeData?: string;
}

export interface Feedback {
  id: number;
  tokenNumber: string;
  serviceType: ServiceType;
  serviceTypeName: string;
  rating: number;
  comment?: string;
  submittedAt: string;
}

export interface FeedbackStatistics {
  averageRating: number;
  totalFeedback: number;
  ratingDistribution: Record<number, number>;
  recentFeedback: Feedback[];
}

export interface CheckInResult {
  tokenNumber: string;
  customerName: string;
  serviceType: ServiceType;
  serviceTypeName: string;
  checkedIn: boolean;
  checkedInAt?: string;
  queuePosition: number;
  peopleAhead: number;
  estimatedWaitMinutes: number;
  status: QueueStatus;
}

export interface DisplayBoardData {
  serviceType: ServiceType;
  serviceTypeName: string;
  currentlyServing: {
    tokenNumber: string;
    counterName: string;
  } | null;
  nextTokens: string[];
  averageWaitMinutes: number;
}

export interface DailyStatistics {
  totalCustomersServed: number;
  totalNoShows: number;
  totalCancelledEntries: number;
  averageServiceTimeMinutes: number;
  busiestServiceType: string;
  peakHour: string;
  activeCustomersWaiting: number;
  highRiskCustomersCount: number;
}

export interface AdminDashboardData {
  totalActiveWaiting: number;
  totalServing: number;
  queuesByService: Record<ServiceType, QueueEntryResponse[]>;
  nextCustomerPerService: Record<string, QueueEntryResponse | null>;
  counters: ServiceCounter[];
  statistics: DailyStatistics;
  feedbackStats: FeedbackStatistics;
}
