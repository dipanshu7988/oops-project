import {
  AdminDashboardData,
  CheckInResult,
  Customer,
  DailyStatistics,
  DisplayBoardData,
  Feedback,
  FeedbackStatistics,
  NoShowRisk,
  PRIORITY_CONFIG,
  PriorityCategory,
  QueueEntry,
  QueueEntryResponse,
  QueueStatus,
  SERVICE_TYPES,
  ServiceCounter,
  ServiceType,
} from '../types/queue';

const STORAGE_KEY = 'smart_queue_manager_state_v2';

// Helper to generate a clean, standalone SVG QR Code data URL without external libraries
function generateQrSvgDataUri(payload: {
  tokenNumber: string;
  customerName: string;
  serviceType: string;
  joinedAt: string;
}): string {
  const jsonStr = JSON.stringify(payload);
  // Generate a distinct deterministic grid pattern from hash
  let hash = 0;
  for (let i = 0; i < jsonStr.length; i++) {
    hash = (hash << 5) - hash + jsonStr.charCodeAt(i);
    hash |= 0;
  }

  const size = 21; // standard QR size
  const modules: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  // Finder patterns at (0,0), (14,0), (0,14)
  const drawFinder = (startX: number, startY: number) => {
    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < 7; x++) {
        const isOuter = x === 0 || x === 6 || y === 0 || y === 6;
        const isInner = x >= 2 && x <= 4 && y >= 2 && y <= 4;
        modules[startY + y][startX + x] = isOuter || isInner;
      }
    }
  };

  drawFinder(0, 0);
  drawFinder(14, 0);
  drawFinder(0, 14);

  // Fill data modules pseudo-randomly based on string characters
  let seed = Math.abs(hash) + 12345;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // Don't overwrite finder patterns
      if (
        (x < 8 && y < 8) ||
        (x >= 13 && y < 8) ||
        (x < 8 && y >= 13)
      ) {
        continue;
      }
      seed = (seed * 9301 + 49297) % 233280;
      modules[y][x] = seed / 233280 > 0.45;
    }
  }

  // Build SVG path
  let rects = '';
  const scale = 8;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (modules[y][x]) {
        rects += `<rect x="${(x + 2) * scale}" y="${(y + 2) * scale}" width="${scale}" height="${scale}" fill="#1e1b4b"/>`;
      }
    }
  }

  const totalSize = (size + 4) * scale;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalSize} ${totalSize}" width="${totalSize}" height="${totalSize}">
    <rect width="${totalSize}" height="${totalSize}" fill="#ffffff" rx="8"/>
    ${rects}
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

interface EngineState {
  customers: Customer[];
  counters: ServiceCounter[];
  queueEntries: QueueEntry[];
  serviceAverages: Record<ServiceType, number>;
  sequences: Record<ServiceType, number>;
  feedbacks: Feedback[];
  history: Array<{
    tokenNumber: string;
    serviceType: ServiceType;
    status: QueueStatus;
    completedAt: string;
    durationMinutes: number;
  }>;
}

const INITIAL_COUNTERS: ServiceCounter[] = [
  { id: 1, counterName: 'Counter 1 - Fast Food & Snacks', serviceType: 'FOOD_ORDER', isActive: true },
  { id: 2, counterName: 'Counter 2 - Meals & Beverages', serviceType: 'FOOD_ORDER', isActive: true },
  { id: 3, counterName: 'Room 101 - General Physician', serviceType: 'DOCTOR_CONSULTATION', isActive: true },
  { id: 4, counterName: 'Room 102 - Specialist Clinic', serviceType: 'DOCTOR_CONSULTATION', isActive: true },
  { id: 5, counterName: 'Desk A - Admissions & ID Verification', serviceType: 'DOCUMENT_VERIFICATION', isActive: true },
  { id: 6, counterName: 'Desk B - Academic Records & Stamp', serviceType: 'DOCUMENT_VERIFICATION', isActive: true },
  { id: 7, counterName: 'Window 1 - Tuition & Fee Cashier', serviceType: 'PAYMENT_COUNTER', isActive: true },
  { id: 8, counterName: 'Window 2 - Card & Digital Payments', serviceType: 'PAYMENT_COUNTER', isActive: true },
];

const INITIAL_CUSTOMERS: Customer[] = [
  { id: 1, name: 'Rahul Sharma', phoneNumber: '+919876543210', totalVisits: 5, totalNoShows: 3, createdAt: new Date(Date.now() - 86400000 * 7).toISOString() },
  { id: 2, name: 'Ananya Patel', phoneNumber: '+919876543211', totalVisits: 2, totalNoShows: 1, createdAt: new Date(Date.now() - 86400000 * 4).toISOString() },
  { id: 3, name: 'Vikram Singh', phoneNumber: '+919876543212', totalVisits: 4, totalNoShows: 0, createdAt: new Date(Date.now() - 86400000 * 3).toISOString() },
  { id: 4, name: 'Savita Devi (Senior)', phoneNumber: '+919876543213', totalVisits: 3, totalNoShows: 0, createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: 5, name: 'Amit Verma', phoneNumber: '+919876543214', totalVisits: 1, totalNoShows: 0, createdAt: new Date(Date.now() - 86400000 * 1).toISOString() },
  { id: 6, name: 'Prof. Sen', phoneNumber: '+919876543215', totalVisits: 8, totalNoShows: 0, createdAt: new Date(Date.now() - 86400000 * 10).toISOString() },
];

function getInitialState(): EngineState {
  const now = Date.now();

  const initialEntries: QueueEntry[] = [
    {
      id: 1,
      tokenNumber: 'D-101',
      customer: INITIAL_CUSTOMERS[2], // Vikram (Normal)
      serviceType: 'DOCTOR_CONSULTATION',
      priority: 'NORMAL',
      status: 'WAITING',
      joinedAt: new Date(now - 1000 * 60 * 25).toISOString(),
      estimatedWaitMinutes: 6,
      queuePosition: 3,
      checkedIn: true,
      checkedInAt: new Date(now - 1000 * 60 * 10).toISOString(),
      qrCodePath: generateQrSvgDataUri({
        tokenNumber: 'D-101',
        customerName: INITIAL_CUSTOMERS[2].name,
        serviceType: 'DOCTOR_CONSULTATION',
        joinedAt: new Date(now - 1000 * 60 * 25).toISOString(),
      }),
    },
    {
      id: 2,
      tokenNumber: 'D-102',
      customer: INITIAL_CUSTOMERS[3], // Savita Devi (Elderly)
      serviceType: 'DOCTOR_CONSULTATION',
      priority: 'ELDERLY',
      status: 'WAITING',
      joinedAt: new Date(now - 1000 * 60 * 18).toISOString(),
      estimatedWaitMinutes: 0,
      queuePosition: 1,
      checkedIn: true,
      checkedInAt: new Date(now - 1000 * 60 * 15).toISOString(),
      qrCodePath: generateQrSvgDataUri({
        tokenNumber: 'D-102',
        customerName: INITIAL_CUSTOMERS[3].name,
        serviceType: 'DOCTOR_CONSULTATION',
        joinedAt: new Date(now - 1000 * 60 * 18).toISOString(),
      }),
    },
    {
      id: 3,
      tokenNumber: 'D-103',
      customer: INITIAL_CUSTOMERS[0], // Rahul Sharma (High Risk - 3 No Shows)
      serviceType: 'DOCTOR_CONSULTATION',
      priority: 'NORMAL',
      status: 'WAITING',
      joinedAt: new Date(now - 1000 * 60 * 12).toISOString(),
      estimatedWaitMinutes: 3,
      queuePosition: 2,
      checkedIn: false, // NOT checked in -> position 2 triggers check-in warning!
      qrCodePath: generateQrSvgDataUri({
        tokenNumber: 'D-103',
        customerName: INITIAL_CUSTOMERS[0].name,
        serviceType: 'DOCTOR_CONSULTATION',
        joinedAt: new Date(now - 1000 * 60 * 12).toISOString(),
      }),
    },
    {
      id: 4,
      tokenNumber: 'F-101',
      customer: INITIAL_CUSTOMERS[4], // Amit Verma
      serviceType: 'FOOD_ORDER',
      priority: 'NORMAL',
      status: 'WAITING',
      joinedAt: new Date(now - 1000 * 60 * 20).toISOString(),
      estimatedWaitMinutes: 3,
      queuePosition: 1,
      checkedIn: false,
      qrCodePath: generateQrSvgDataUri({
        tokenNumber: 'F-101',
        customerName: INITIAL_CUSTOMERS[4].name,
        serviceType: 'FOOD_ORDER',
        joinedAt: new Date(now - 1000 * 60 * 20).toISOString(),
      }),
    },
    {
      id: 5,
      tokenNumber: 'F-102',
      customer: INITIAL_CUSTOMERS[5], // Prof. Sen (VIP)
      serviceType: 'FOOD_ORDER',
      priority: 'VIP',
      status: 'SERVING',
      joinedAt: new Date(now - 1000 * 60 * 15).toISOString(),
      serviceStartedAt: new Date(now - 1000 * 60 * 3).toISOString(),
      estimatedWaitMinutes: 0,
      queuePosition: 0,
      assignedCounter: INITIAL_COUNTERS[0],
      checkedIn: true,
      checkedInAt: new Date(now - 1000 * 60 * 14).toISOString(),
      qrCodePath: generateQrSvgDataUri({
        tokenNumber: 'F-102',
        customerName: INITIAL_CUSTOMERS[5].name,
        serviceType: 'FOOD_ORDER',
        joinedAt: new Date(now - 1000 * 60 * 15).toISOString(),
      }),
    },
    {
      id: 6,
      tokenNumber: 'D-100',
      customer: INITIAL_CUSTOMERS[1],
      serviceType: 'DOCTOR_CONSULTATION',
      priority: 'NORMAL',
      status: 'SERVED',
      joinedAt: new Date(now - 1000 * 60 * 40).toISOString(),
      serviceStartedAt: new Date(now - 1000 * 60 * 35).toISOString(),
      serviceCompletedAt: new Date(now - 1000 * 60 * 30).toISOString(),
      estimatedWaitMinutes: 0,
      queuePosition: 0,
      assignedCounter: INITIAL_COUNTERS[2],
      checkedIn: true,
      checkedInAt: new Date(now - 1000 * 60 * 38).toISOString(),
      qrCodePath: generateQrSvgDataUri({
        tokenNumber: 'D-100',
        customerName: INITIAL_CUSTOMERS[1].name,
        serviceType: 'DOCTOR_CONSULTATION',
        joinedAt: new Date(now - 1000 * 60 * 40).toISOString(),
      }),
    },
    {
      id: 7,
      tokenNumber: 'F-100',
      customer: INITIAL_CUSTOMERS[2],
      serviceType: 'FOOD_ORDER',
      priority: 'NORMAL',
      status: 'SERVED',
      joinedAt: new Date(now - 1000 * 60 * 55).toISOString(),
      serviceStartedAt: new Date(now - 1000 * 60 * 50).toISOString(),
      serviceCompletedAt: new Date(now - 1000 * 60 * 45).toISOString(),
      estimatedWaitMinutes: 0,
      queuePosition: 0,
      assignedCounter: INITIAL_COUNTERS[1],
      checkedIn: true,
      checkedInAt: new Date(now - 1000 * 60 * 52).toISOString(),
      qrCodePath: generateQrSvgDataUri({
        tokenNumber: 'F-100',
        customerName: INITIAL_CUSTOMERS[2].name,
        serviceType: 'FOOD_ORDER',
        joinedAt: new Date(now - 1000 * 60 * 55).toISOString(),
      }),
    },
  ];

  const initialFeedbacks: Feedback[] = [
    {
      id: 1,
      tokenNumber: 'D-100',
      serviceType: 'DOCTOR_CONSULTATION',
      serviceTypeName: 'Doctor Consultation',
      rating: 5,
      comment: 'Very professional doctor and fast turnaround! No delay once called.',
      submittedAt: new Date(now - 1000 * 60 * 25).toISOString(),
    },
    {
      id: 2,
      tokenNumber: 'F-100',
      serviceType: 'FOOD_ORDER',
      serviceTypeName: 'Food Order',
      rating: 4,
      comment: 'Food was served hot and fresh. Display screen was clear.',
      submittedAt: new Date(now - 1000 * 60 * 40).toISOString(),
    },
  ];

  return {
    customers: INITIAL_CUSTOMERS,
    counters: INITIAL_COUNTERS,
    queueEntries: initialEntries,
    serviceAverages: {
      FOOD_ORDER: 3.0,
      DOCTOR_CONSULTATION: 3.0,
      DOCUMENT_VERIFICATION: 3.0,
      PAYMENT_COUNTER: 3.0,
    },
    sequences: {
      FOOD_ORDER: 102,
      DOCTOR_CONSULTATION: 103,
      DOCUMENT_VERIFICATION: 100,
      PAYMENT_COUNTER: 100,
    },
    feedbacks: initialFeedbacks,
    history: [
      {
        tokenNumber: 'F-100',
        serviceType: 'FOOD_ORDER',
        status: 'SERVED',
        completedAt: new Date(now - 1000 * 60 * 45).toISOString(),
        durationMinutes: 4,
      },
      {
        tokenNumber: 'D-100',
        serviceType: 'DOCTOR_CONSULTATION',
        status: 'SERVED',
        completedAt: new Date(now - 1000 * 60 * 30).toISOString(),
        durationMinutes: 3,
      },
    ],
  };
}

class QueueEngineService {
  private state: EngineState;

  constructor() {
    this.state = this.loadState();
    this.recalculateAll();
  }

  private loadState(): EngineState {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed.feedbacks && parsed.customers) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return getInitialState();
  }

  private saveState(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch {
      // ignore
    }
  }

  public calculateNoShowRisk(customer: Customer): NoShowRisk {
    if (!customer) return 'LOW';
    if (customer.totalNoShows >= 2) return 'HIGH';
    if (customer.totalNoShows === 1) return 'MEDIUM';
    return 'LOW';
  }

  public getNoShowReason(customer: Customer): string {
    if (!customer || customer.totalNoShows === 0) return 'No past no-shows';
    if (customer.totalNoShows === 1) return '1 missed appointment in history';
    return `${customer.totalNoShows} missed appointments in history`;
  }

  public getOrCreateCustomer(name: string, phoneNumber: string): Customer {
    const cleanPhone = phoneNumber.trim();
    const cleanName = name.trim();
    let customer = this.state.customers.find((c) => c.phoneNumber === cleanPhone);
    if (!customer) {
      const newId = this.state.customers.length > 0 ? Math.max(...this.state.customers.map((c) => c.id)) + 1 : 1;
      customer = {
        id: newId,
        name: cleanName,
        phoneNumber: cleanPhone,
        totalVisits: 0,
        totalNoShows: 0,
        createdAt: new Date().toISOString(),
      };
      this.state.customers.push(customer);
    } else if (cleanName && customer.name !== cleanName) {
      customer.name = cleanName;
    }
    this.saveState();
    return customer;
  }

  public joinQueue(
    name: string,
    phoneNumber: string,
    serviceType: ServiceType,
    priority: PriorityCategory
  ): QueueEntryResponse {
    const customer = this.getOrCreateCustomer(name, phoneNumber);

    // Rule: Do not allow a customer to have more than one active token for the same service type
    const hasActiveToken = this.state.queueEntries.some(
      (entry) =>
        entry.customer.phoneNumber === customer.phoneNumber &&
        entry.serviceType === serviceType &&
        (entry.status === 'WAITING' || entry.status === 'CHECKED_IN' || entry.status === 'SERVING')
    );

    if (hasActiveToken) {
      throw new Error(
        `You already have an active ticket for ${SERVICE_TYPES[serviceType].displayName}. Please complete or cancel it before joining again.`
      );
    }

    const currentSeq = (this.state.sequences[serviceType] || 100) + 1;
    this.state.sequences[serviceType] = currentSeq;
    const prefix = SERVICE_TYPES[serviceType].codePrefix;
    const tokenNumber = `${prefix}-${currentSeq}`;

    const newEntryId = this.state.queueEntries.length > 0
      ? Math.max(...this.state.queueEntries.map((e) => e.id)) + 1
      : 1;

    const joinedAt = new Date().toISOString();
    const qrCodePath = generateQrSvgDataUri({
      tokenNumber,
      customerName: customer.name,
      serviceType,
      joinedAt,
    });

    const newEntry: QueueEntry = {
      id: newEntryId,
      tokenNumber,
      customer,
      serviceType,
      priority,
      status: 'WAITING',
      joinedAt,
      estimatedWaitMinutes: 0,
      queuePosition: 1,
      checkedIn: false,
      qrCodePath,
    };

    this.state.queueEntries.push(newEntry);
    this.recalculateQueue(serviceType);
    this.saveState();

    const saved = this.state.queueEntries.find((e) => e.tokenNumber === tokenNumber)!;
    return this.mapToResponse(saved);
  }

  public getQueueEntryByToken(token: string): QueueEntryResponse {
    const formatted = token.trim().toUpperCase();
    const entry = this.state.queueEntries.find((e) => e.tokenNumber.toUpperCase() === formatted);
    if (!entry) {
      throw new Error(`Ticket "${token}" not found in current session.`);
    }
    return this.mapToResponse(entry);
  }

  // Feature 1: QR Token Check-In
  public checkInCustomer(tokenNumber: string): CheckInResult {
    const formatted = tokenNumber.trim().toUpperCase();
    const entry = this.state.queueEntries.find((e) => e.tokenNumber.toUpperCase() === formatted);

    if (!entry) {
      throw new Error(`Ticket "${tokenNumber}" not found.`);
    }

    if (entry.checkedIn) {
      throw new Error(`Ticket "${entry.tokenNumber}" has already been checked in at ${new Date(entry.checkedInAt!).toLocaleTimeString()}.`);
    }

    if (entry.status === 'SERVED' || entry.status === 'SKIPPED' || entry.status === 'NO_SHOW' || entry.status === 'CANCELLED') {
      throw new Error(`Cannot check in ticket with terminal status: ${entry.status}`);
    }

    entry.checkedIn = true;
    entry.checkedInAt = new Date().toISOString();
    if (entry.status === 'WAITING') {
      entry.status = 'CHECKED_IN';
    }

    // Recalculate to keep positions consistent
    this.recalculateQueue(entry.serviceType);
    this.saveState();

    const peopleAhead = Math.max(0, entry.queuePosition - 1);

    return {
      tokenNumber: entry.tokenNumber,
      customerName: entry.customer.name,
      serviceType: entry.serviceType,
      serviceTypeName: SERVICE_TYPES[entry.serviceType].displayName,
      checkedIn: entry.checkedIn,
      checkedInAt: entry.checkedInAt,
      queuePosition: entry.queuePosition,
      peopleAhead,
      estimatedWaitMinutes: entry.estimatedWaitMinutes,
      status: entry.status,
    };
  }

  public serveCustomer(tokenNumber: string, counterId?: number): QueueEntryResponse {
    const entry = this.findEntryOrThrow(tokenNumber);
    if (entry.status !== 'WAITING' && entry.status !== 'CHECKED_IN') {
      throw new Error(`Only WAITING or CHECKED_IN customers can be served. Current status: ${entry.status}`);
    }

    entry.status = 'SERVING';
    entry.serviceStartedAt = new Date().toISOString();
    entry.queuePosition = 0;
    entry.estimatedWaitMinutes = 0;

    if (counterId) {
      const counter = this.state.counters.find((c) => c.id === counterId);
      if (counter) entry.assignedCounter = counter;
    } else {
      const available = this.state.counters.find(
        (c) => c.serviceType === entry.serviceType && c.isActive
      );
      if (available) entry.assignedCounter = available;
    }

    this.recalculateQueue(entry.serviceType);
    this.saveState();
    return this.mapToResponse(entry);
  }

  public completeCustomer(tokenNumber: string): QueueEntryResponse {
    const entry = this.findEntryOrThrow(tokenNumber);
    if (entry.status !== 'SERVING') {
      throw new Error(`Only SERVING customers can be completed. Current status: ${entry.status}`);
    }

    const now = new Date();
    entry.status = 'SERVED';
    entry.serviceCompletedAt = now.toISOString();

    let durationMinutes = 3;
    if (entry.serviceStartedAt) {
      const diffMs = now.getTime() - new Date(entry.serviceStartedAt).getTime();
      const mins = Math.round(diffMs / 60000);
      durationMinutes = Math.max(1, mins);
    }

    // Update customer visits
    entry.customer.totalVisits += 1;

    // Update rolling average service time
    const currentAvg = this.state.serviceAverages[entry.serviceType] || 3.0;
    const newAvg = Math.round(((currentAvg + durationMinutes) / 2) * 10) / 10;
    this.state.serviceAverages[entry.serviceType] = newAvg;

    // Record history
    this.state.history.push({
      tokenNumber: entry.tokenNumber,
      serviceType: entry.serviceType,
      status: 'SERVED',
      completedAt: now.toISOString(),
      durationMinutes,
    });

    this.recalculateQueue(entry.serviceType);
    this.saveState();
    return this.mapToResponse(entry);
  }

  public skipCustomer(tokenNumber: string): QueueEntryResponse {
    const entry = this.findEntryOrThrow(tokenNumber);
    if (entry.status === 'SERVED' || entry.status === 'SKIPPED' || entry.status === 'NO_SHOW' || entry.status === 'CANCELLED') {
      throw new Error(`Cannot skip customer in terminal status: ${entry.status}`);
    }

    entry.status = 'SKIPPED';
    entry.serviceCompletedAt = new Date().toISOString();

    this.state.history.push({
      tokenNumber: entry.tokenNumber,
      serviceType: entry.serviceType,
      status: 'SKIPPED',
      completedAt: new Date().toISOString(),
      durationMinutes: 0,
    });

    this.recalculateQueue(entry.serviceType);
    this.saveState();
    return this.mapToResponse(entry);
  }

  public markNoShow(tokenNumber: string): QueueEntryResponse {
    const entry = this.findEntryOrThrow(tokenNumber);
    if (entry.status === 'SERVED' || entry.status === 'SKIPPED' || entry.status === 'NO_SHOW' || entry.status === 'CANCELLED') {
      throw new Error(`Cannot mark no-show for ticket in status: ${entry.status}`);
    }

    entry.status = 'NO_SHOW';
    entry.serviceCompletedAt = new Date().toISOString();

    // Increment customer no-show count
    entry.customer.totalNoShows += 1;

    this.state.history.push({
      tokenNumber: entry.tokenNumber,
      serviceType: entry.serviceType,
      status: 'NO_SHOW',
      completedAt: new Date().toISOString(),
      durationMinutes: 0,
    });

    this.recalculateQueue(entry.serviceType);
    this.saveState();
    return this.mapToResponse(entry);
  }

  public cancelCustomer(tokenNumber: string): QueueEntryResponse {
    const entry = this.findEntryOrThrow(tokenNumber);
    if (entry.status !== 'WAITING' && entry.status !== 'CHECKED_IN') {
      throw new Error(`Only WAITING or CHECKED_IN tickets can be cancelled. Current status: ${entry.status}`);
    }

    entry.status = 'CANCELLED';
    entry.serviceCompletedAt = new Date().toISOString();

    this.state.history.push({
      tokenNumber: entry.tokenNumber,
      serviceType: entry.serviceType,
      status: 'CANCELLED',
      completedAt: new Date().toISOString(),
      durationMinutes: 0,
    });

    this.recalculateQueue(entry.serviceType);
    this.saveState();
    return this.mapToResponse(entry);
  }

  // Feature 3: Customer Feedback Rating
  public submitFeedback(tokenNumber: string, rating: number, comment?: string): Feedback {
    const formatted = tokenNumber.trim().toUpperCase();
    const entry = this.state.queueEntries.find((e) => e.tokenNumber.toUpperCase() === formatted);

    if (!entry) {
      throw new Error(`Ticket "${tokenNumber}" not found.`);
    }

    if (entry.status !== 'SERVED') {
      throw new Error(`Feedback can only be submitted for completed (SERVED) tickets. Current status is ${entry.status}.`);
    }

    const alreadySubmitted = this.state.feedbacks.some((f) => f.tokenNumber.toUpperCase() === formatted);
    if (alreadySubmitted) {
      throw new Error(`Feedback has already been submitted for ticket "${formatted}".`);
    }

    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be an integer between 1 and 5 stars.');
    }

    const cleanComment = comment ? comment.trim().slice(0, 500) : undefined;
    const newId = this.state.feedbacks.length > 0 ? Math.max(...this.state.feedbacks.map((f) => f.id)) + 1 : 1;

    const feedback: Feedback = {
      id: newId,
      tokenNumber: entry.tokenNumber,
      serviceType: entry.serviceType,
      serviceTypeName: SERVICE_TYPES[entry.serviceType].displayName,
      rating,
      comment: cleanComment,
      submittedAt: new Date().toISOString(),
    };

    this.state.feedbacks.unshift(feedback);
    this.saveState();
    return feedback;
  }

  public getFeedbackByToken(tokenNumber: string): Feedback | null {
    const formatted = tokenNumber.trim().toUpperCase();
    return this.state.feedbacks.find((f) => f.tokenNumber.toUpperCase() === formatted) || null;
  }

  public getFeedbackStatistics(): FeedbackStatistics {
    const list = this.state.feedbacks;
    const totalFeedback = list.length;
    const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    if (totalFeedback === 0) {
      return {
        averageRating: 0.0,
        totalFeedback: 0,
        ratingDistribution,
        recentFeedback: [],
      };
    }

    let sum = 0;
    list.forEach((f) => {
      sum += f.rating;
      ratingDistribution[f.rating] = (ratingDistribution[f.rating] || 0) + 1;
    });

    const averageRating = Math.round((sum / totalFeedback) * 10) / 10;
    return {
      averageRating,
      totalFeedback,
      ratingDistribution,
      recentFeedback: list.slice(0, 10),
    };
  }

  // Feature 2: Display Board API Data
  public getDisplayBoardData(): DisplayBoardData[] {
    return (Object.keys(SERVICE_TYPES) as ServiceType[]).map((type) => {
      const serving = this.state.queueEntries.find(
        (e) => e.serviceType === type && e.status === 'SERVING'
      );

      const waitingTokens = this.state.queueEntries
        .filter((e) => e.serviceType === type && (e.status === 'WAITING' || e.status === 'CHECKED_IN'))
        .sort((a, b) => a.queuePosition - b.queuePosition)
        .map((e) => e.tokenNumber);

      const avgWait = this.state.serviceAverages[type] || 3.0;
      const totalWaitMinutes = Math.round(waitingTokens.length * avgWait);

      return {
        serviceType: type,
        serviceTypeName: SERVICE_TYPES[type].displayName,
        currentlyServing: serving
          ? {
              tokenNumber: serving.tokenNumber,
              counterName: serving.assignedCounter?.counterName || 'Assigned Counter',
            }
          : null,
        nextTokens: waitingTokens.slice(0, 6),
        averageWaitMinutes: totalWaitMinutes,
      };
    });
  }

  public addCounter(name: string, serviceType: ServiceType, isActive = true): ServiceCounter {
    const newId = this.state.counters.length > 0 ? Math.max(...this.state.counters.map((c) => c.id)) + 1 : 1;
    const counter: ServiceCounter = {
      id: newId,
      counterName: name.trim(),
      serviceType,
      isActive,
    };
    this.state.counters.push(counter);
    this.saveState();
    return counter;
  }

  public toggleCounter(id: number): void {
    const counter = this.state.counters.find((c) => c.id === id);
    if (counter) {
      counter.isActive = !counter.isActive;
      this.saveState();
    }
  }

  public deleteCounter(id: number): void {
    this.state.counters = this.state.counters.filter((c) => c.id !== id);
    this.saveState();
  }

  public resetDay(): void {
    const now = new Date().toISOString();
    // Safely archive all active entries as CANCELLED
    this.state.queueEntries.forEach((entry) => {
      if (entry.status === 'WAITING' || entry.status === 'CHECKED_IN' || entry.status === 'SERVING') {
        entry.status = 'CANCELLED';
        entry.serviceCompletedAt = now;
        this.state.history.push({
          tokenNumber: entry.tokenNumber,
          serviceType: entry.serviceType,
          status: 'CANCELLED',
          completedAt: now,
          durationMinutes: 0,
        });
      }
    });

    // Reset sequences
    this.state.sequences = {
      FOOD_ORDER: 100,
      DOCTOR_CONSULTATION: 100,
      DOCUMENT_VERIFICATION: 100,
      PAYMENT_COUNTER: 100,
    };

    this.saveState();
  }

  public resetToFactoryDemo(): void {
    this.state = getInitialState();
    this.recalculateAll();
    this.saveState();
  }

  public recalculateQueue(serviceType: ServiceType): void {
    const waiting = this.state.queueEntries.filter(
      (e) => e.serviceType === serviceType && (e.status === 'WAITING' || e.status === 'CHECKED_IN')
    );

    // Priority Sort Rule: Lower value is higher priority (Emergency: 1 -> Normal: 4).
    // If priority is identical, earlier arrival time is served first.
    // Checked-in status does NOT alter priority order, it preserves priority.
    waiting.sort((a, b) => {
      const pA = PRIORITY_CONFIG[a.priority].value;
      const pB = PRIORITY_CONFIG[b.priority].value;
      if (pA !== pB) return pA - pB;
      return new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime();
    });

    const avgTime = this.state.serviceAverages[serviceType] || 3.0;

    waiting.forEach((entry, idx) => {
      const position = idx + 1;
      const peopleAhead = idx;
      entry.queuePosition = position;
      entry.estimatedWaitMinutes = Math.round(peopleAhead * avgTime);
    });
  }

  public recalculateAll(): void {
    (Object.keys(SERVICE_TYPES) as ServiceType[]).forEach((type) => {
      this.recalculateQueue(type);
    });
    this.saveState();
  }

  public getDashboardData(): AdminDashboardData {
    const activeWaiting = this.state.queueEntries.filter(
      (e) => e.status === 'WAITING' || e.status === 'CHECKED_IN'
    );
    const activeServing = this.state.queueEntries.filter((e) => e.status === 'SERVING');

    const queuesByService: Record<ServiceType, QueueEntryResponse[]> = {
      FOOD_ORDER: [],
      DOCTOR_CONSULTATION: [],
      DOCUMENT_VERIFICATION: [],
      PAYMENT_COUNTER: [],
    };

    const nextCustomerPerService: Record<string, QueueEntryResponse | null> = {
      FOOD_ORDER: null,
      DOCTOR_CONSULTATION: null,
      DOCUMENT_VERIFICATION: null,
      PAYMENT_COUNTER: null,
    };

    (Object.keys(SERVICE_TYPES) as ServiceType[]).forEach((type) => {
      const entries = this.state.queueEntries
        .filter(
          (e) =>
            e.serviceType === type &&
            (e.status === 'WAITING' || e.status === 'CHECKED_IN' || e.status === 'SERVING')
        )
        .map((e) => this.mapToResponse(e))
        .sort((a, b) => {
          if (a.status === 'SERVING' && b.status !== 'SERVING') return -1;
          if (b.status === 'SERVING' && a.status !== 'SERVING') return 1;
          if (a.priorityValue !== b.priorityValue) return a.priorityValue - b.priorityValue;
          return new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime();
        });

      queuesByService[type] = entries;

      const next = entries.find((e) => e.status === 'WAITING' || e.status === 'CHECKED_IN') || null;
      nextCustomerPerService[type] = next;
    });

    const stats = this.getStatistics();
    const feedbackStats = this.getFeedbackStatistics();

    return {
      totalActiveWaiting: activeWaiting.length,
      totalServing: activeServing.length,
      queuesByService,
      nextCustomerPerService,
      counters: [...this.state.counters],
      statistics: stats,
      feedbackStats,
    };
  }

  public getStatistics(): DailyStatistics {
    const served = this.state.history.filter((h) => h.status === 'SERVED').length;
    const noShows = this.state.history.filter((h) => h.status === 'NO_SHOW').length;
    const cancelled = this.state.history.filter((h) => h.status === 'CANCELLED').length;

    const servedDurations = this.state.history
      .filter((h) => h.status === 'SERVED' && h.durationMinutes > 0)
      .map((h) => h.durationMinutes);
    const avgDuration =
      servedDurations.length > 0
        ? Math.round((servedDurations.reduce((a, b) => a + b, 0) / servedDurations.length) * 10) / 10
        : 3.0;

    // Counts by service type today
    const countMap: Record<string, number> = {};
    this.state.queueEntries.forEach((e) => {
      countMap[e.serviceType] = (countMap[e.serviceType] || 0) + 1;
    });

    let busiest = 'Doctor Consultation';
    let maxCount = -1;
    Object.entries(countMap).forEach(([type, count]) => {
      if (count > maxCount) {
        maxCount = count;
        busiest = `${SERVICE_TYPES[type as ServiceType]?.displayName || type} (${count} entries)`;
      }
    });

    const activeWaiting = this.state.queueEntries.filter(
      (e) => e.status === 'WAITING' || e.status === 'CHECKED_IN'
    );
    const highRiskWaiting = activeWaiting.filter(
      (e) => this.calculateNoShowRisk(e.customer) === 'HIGH'
    ).length;

    return {
      totalCustomersServed: served,
      totalNoShows: noShows,
      totalCancelledEntries: cancelled,
      averageServiceTimeMinutes: avgDuration,
      busiestServiceType: busiest,
      peakHour: '10:00 - 11:00 AM (Peak Rush)',
      activeCustomersWaiting: activeWaiting.length,
      highRiskCustomersCount: highRiskWaiting,
    };
  }

  public getAllEntries(): QueueEntryResponse[] {
    return this.state.queueEntries.map((e) => this.mapToResponse(e));
  }

  private findEntryOrThrow(tokenNumber: string): QueueEntry {
    const formatted = tokenNumber.trim().toUpperCase();
    const entry = this.state.queueEntries.find((e) => e.tokenNumber.toUpperCase() === formatted);
    if (!entry) {
      throw new Error(`Queue entry not found for token: ${tokenNumber}`);
    }
    return entry;
  }

  public mapToResponse(entry: QueueEntry): QueueEntryResponse {
    const isWaitingOrCheckedIn = entry.status === 'WAITING' || entry.status === 'CHECKED_IN';
    const peopleAhead = isWaitingOrCheckedIn ? Math.max(0, entry.queuePosition - 1) : 0;
    const risk = this.calculateNoShowRisk(entry.customer);
    const reason = this.getNoShowReason(entry.customer);

    // Turn is near warning rule: if in position 1 or 2 and NOT checked in
    const checkInWarning = isWaitingOrCheckedIn && entry.queuePosition <= 2 && !entry.checkedIn;

    return {
      id: entry.id,
      tokenNumber: entry.tokenNumber,
      customerName: entry.customer.name,
      phoneNumber: entry.customer.phoneNumber,
      serviceType: entry.serviceType,
      serviceTypeName: SERVICE_TYPES[entry.serviceType].displayName,
      priority: entry.priority,
      priorityName: PRIORITY_CONFIG[entry.priority].displayName,
      priorityValue: PRIORITY_CONFIG[entry.priority].value,
      status: entry.status,
      statusName: entry.status === 'CHECKED_IN' ? 'CHECKED IN' : entry.status,
      joinedAt: entry.joinedAt,
      serviceStartedAt: entry.serviceStartedAt,
      serviceCompletedAt: entry.serviceCompletedAt,
      estimatedWaitMinutes: entry.estimatedWaitMinutes,
      queuePosition: entry.queuePosition,
      peopleAhead,
      assignedCounterName: entry.assignedCounter?.counterName,
      assignedCounterId: entry.assignedCounter?.id,
      noShowRisk: risk,
      noShowReason: reason,
      totalPastNoShows: entry.customer.totalNoShows,
      checkedIn: !!entry.checkedIn,
      checkedInAt: entry.checkedInAt,
      qrCodeData: entry.qrCodePath,
      checkInWarning,
    };
  }
}

export const queueEngine = new QueueEngineService();
