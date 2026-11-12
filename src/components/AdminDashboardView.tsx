import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Play,
  CheckCircle,
  SkipForward,
  UserX,
  XCircle,
  Plus,
  Trash2,
  RotateCcw,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  Clock,
  Users,
  Building,
  Check,
  Lock,
  Star,
  QrCode,
  UserCheck,
  Tv,
} from 'lucide-react';
import {
  AdminDashboardData,
  NoShowRisk,
  QueueEntryResponse,
  SERVICE_TYPES,
  ServiceCounter,
  ServiceType,
} from '../types/queue';
import { queueEngine } from '../services/queueEngine';

interface AdminDashboardViewProps {
  isAuthenticated: boolean;
  onLoginSuccess: () => void;
  onNavigateToCheckIn?: () => void;
  onNavigateToDisplay?: () => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  isAuthenticated,
  onLoginSuccess,
  onNavigateToCheckIn,
  onNavigateToDisplay,
}) => {
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  const [dashboardData, setDashboardData] = useState<AdminDashboardData>(queueEngine.getDashboardData());
  const [selectedService, setSelectedService] = useState<ServiceType | 'ALL'>('ALL');
  const [selectedCounterId, setSelectedCounterId] = useState<number | undefined>(undefined);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'warning' | 'error'; text: string } | null>(null);

  // New counter form
  const [newCounterName, setNewCounterName] = useState('');
  const [newCounterService, setNewCounterService] = useState<ServiceType>('DOCTOR_CONSULTATION');
  const [showCounterModal, setShowCounterModal] = useState(false);

  const refreshData = () => {
    setDashboardData(queueEngine.getDashboardData());
  };

  useEffect(() => {
    refreshData();
    const timer = setInterval(refreshData, 3000);
    return () => clearInterval(timer);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'admin123') {
      setAuthError(null);
      onLoginSuccess();
    } else {
      setAuthError('Invalid password. For this presentation demo, use: admin123');
    }
  };

  const notify = (type: 'success' | 'warning' | 'error', text: string) => {
    setFeedbackMessage({ type, text });
    refreshData();
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const handleServe = (tokenNumber: string) => {
    try {
      queueEngine.serveCustomer(tokenNumber, selectedCounterId);
      notify('success', `Customer with token ${tokenNumber} is now SERVING at the counter.`);
    } catch (err: any) {
      notify('error', err.message);
    }
  };

  const handleComplete = (tokenNumber: string) => {
    try {
      queueEngine.completeCustomer(tokenNumber);
      notify('success', `Ticket ${tokenNumber} marked as COMPLETED. Rolling average service time updated.`);
    } catch (err: any) {
      notify('error', err.message);
    }
  };

  const handleSkip = (tokenNumber: string) => {
    try {
      queueEngine.skipCustomer(tokenNumber);
      notify('warning', `Ticket ${tokenNumber} has been marked as SKIPPED.`);
    } catch (err: any) {
      notify('error', err.message);
    }
  };

  const handleNoShow = (tokenNumber: string) => {
    try {
      queueEngine.markNoShow(tokenNumber);
      notify('warning', `Ticket ${tokenNumber} marked as NO-SHOW. Customer risk profile updated.`);
    } catch (err: any) {
      notify('error', err.message);
    }
  };

  const handleCancel = (tokenNumber: string) => {
    if (window.confirm(`Cancel ticket ${tokenNumber}?`)) {
      try {
        queueEngine.cancelCustomer(tokenNumber);
        notify('warning', `Ticket ${tokenNumber} has been CANCELLED.`);
      } catch (err: any) {
        notify('error', err.message);
      }
    }
  };

  const handleCheckInCustomer = (tokenNumber: string) => {
    try {
      queueEngine.checkInCustomer(tokenNumber);
      notify('success', `Ticket ${tokenNumber} successfully checked in.`);
    } catch (err: any) {
      notify('error', err.message);
    }
  };

  const handleAddCounter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCounterName.trim()) return;
    try {
      queueEngine.addCounter(newCounterName, newCounterService, true);
      setNewCounterName('');
      setShowCounterModal(false);
      notify('success', 'New service counter added successfully.');
    } catch (err: any) {
      notify('error', err.message);
    }
  };

  const handleDeleteCounter = (id: number) => {
    if (window.confirm('Delete this counter?')) {
      queueEngine.deleteCounter(id);
      notify('warning', 'Counter deleted.');
    }
  };

  const handleToggleCounter = (id: number) => {
    queueEngine.toggleCounter(id);
    refreshData();
  };

  const handleResetDay = () => {
    if (
      window.confirm(
        'Are you sure you want to RESET THE DAY? This will archive all active waiting/serving tickets as CANCELLED and reset token sequence numbers.'
      )
    ) {
      queueEngine.resetDay();
      notify('warning', 'Queue has been reset for the new day.');
    }
  };

  const handleFactoryReset = () => {
    if (window.confirm('Reset to standard presentation demo data (preloaded tickets and counters)?')) {
      queueEngine.resetToFactoryDemo();
      notify('success', 'Reset to initial demo state.');
    }
  };

  // If not authenticated, show modern login modal/screen
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6" />
          </div>

          <h2 className="text-xl font-bold text-center text-slate-900 tracking-tight">
            Staff Administrator Login
          </h2>
          <p className="text-xs text-center text-slate-500 mt-1 mb-6">
            Authorized access for queue operators and counter officers.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            {authError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Demo Password
              </label>
              <input
                type="password"
                placeholder="Enter password..."
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                autoFocus
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
              />
              <div className="text-2xs text-slate-500 mt-1.5 flex items-center justify-between">
                <span>Demo password: <strong className="font-mono text-slate-700">admin123</strong></span>
                <button
                  type="button"
                  onClick={() => setPasswordInput('admin123')}
                  className="text-indigo-600 hover:underline font-semibold"
                >
                  Quick Fill
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-lg transition-colors shadow-2xs"
            >
              Sign In to Admin Dashboard
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-2xs text-slate-500 text-center">
            * Note for presentation: Real production deployments should use Spring Security OAuth2 / JWT.
          </div>
        </div>
      </div>
    );
  }

  // Get active queue entries based on filter
  const allEntries = queueEngine.getAllEntries();
  const filteredEntries =
    selectedService === 'ALL'
      ? allEntries.filter((e) => e.status === 'WAITING' || e.status === 'CHECKED_IN' || e.status === 'SERVING')
      : allEntries.filter(
          (e) =>
            e.serviceType === selectedService &&
            (e.status === 'WAITING' || e.status === 'CHECKED_IN' || e.status === 'SERVING')
        );

  // Find next customer overall or for selected service
  const nextCustomer: QueueEntryResponse | null =
    filteredEntries.find((e) => e.status === 'WAITING' || e.status === 'CHECKED_IN') || null;

  const isNextHighRisk = nextCustomer && nextCustomer.noShowRisk === 'HIGH';
  const hasUncheckedTurnWarning = nextCustomer && !nextCustomer.checkedIn && nextCustomer.queuePosition <= 2;

  const feedbackStats = dashboardData.feedbackStats;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner & Fast Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Staff Queue Management Console
          </h1>
          <p className="text-xs text-slate-500">
            Real-time counter orchestration, QR check-in tracking & customer satisfaction metrics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {onNavigateToCheckIn && (
            <button
              onClick={onNavigateToCheckIn}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded-lg transition-colors shadow-2xs"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>QR Check-In Desk</span>
            </button>
          )}

          {onNavigateToDisplay && (
            <button
              onClick={onNavigateToDisplay}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors shadow-2xs"
            >
              <Tv className="w-3.5 h-3.5 text-slate-500" />
              <span>TV Display</span>
            </button>
          )}

          <button
            onClick={() => setShowCounterModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-600" />
            <span>Add Counter</span>
          </button>

          <button
            onClick={handleFactoryReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors shadow-2xs"
            title="Reset to initial presentation demo data"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Demo Data</span>
          </button>

          <button
            onClick={handleResetDay}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-lg transition-colors"
          >
            <span>Reset Day</span>
          </button>
        </div>
      </div>

      {feedbackMessage && (
        <div
          className={`p-3.5 rounded-lg text-xs font-medium border flex items-center justify-between ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : feedbackMessage.type === 'warning'
              ? 'bg-amber-50 text-amber-800 border-amber-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <span>{feedbackMessage.text}</span>
          <button onClick={() => setFeedbackMessage(null)} className="text-slate-400 hover:text-slate-600">
            ✕
          </button>
        </div>
      )}

      {/* TODAY'S STATISTICS METRIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-2xs uppercase font-semibold text-slate-500 block">Served Today</span>
          <div className="text-2xl font-bold font-mono text-emerald-600 mt-1">
            {dashboardData.statistics.totalCustomersServed}
          </div>
        </div>

        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-2xs uppercase font-semibold text-slate-500 block">No-Shows</span>
          <div className="text-2xl font-bold font-mono text-amber-600 mt-1">
            {dashboardData.statistics.totalNoShows}
          </div>
        </div>

        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-2xs uppercase font-semibold text-slate-500 block">Cancelled</span>
          <div className="text-2xl font-bold font-mono text-slate-600 mt-1">
            {dashboardData.statistics.totalCancelledEntries}
          </div>
        </div>

        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-2xs uppercase font-semibold text-slate-500 block">Avg Svc Time</span>
          <div className="text-2xl font-bold font-mono text-indigo-600 mt-1">
            {dashboardData.statistics.averageServiceTimeMinutes}m
          </div>
        </div>

        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-2xs uppercase font-semibold text-slate-500 block">Active Waiting</span>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
            {dashboardData.statistics.activeCustomersWaiting}
          </div>
        </div>

        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-2xs uppercase font-semibold text-slate-500 block">Satisfaction</span>
          <div className="text-2xl font-bold font-mono text-amber-500 mt-1 flex items-baseline gap-1">
            {feedbackStats.averageRating > 0 ? `${feedbackStats.averageRating}★` : 'N/A'}
          </div>
        </div>

        <div className="col-span-2 p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-2xs uppercase font-semibold text-slate-500 block">Busiest Department</span>
          <div className="text-xs font-bold text-slate-800 mt-1 truncate">
            {dashboardData.statistics.busiestServiceType}
          </div>
          <div className="text-2xs text-slate-500 truncate mt-0.5">
            {dashboardData.statistics.peakHour}
          </div>
        </div>
      </div>

      {/* NEXT PERSON IN LINE & HIGH-RISK WARNING CARD */}
      {nextCustomer && (
        <div
          className={`border rounded-2xl p-6 transition-all ${
            isNextHighRisk
              ? 'bg-rose-50/70 border-rose-300 ring-2 ring-rose-400/40'
              : 'bg-indigo-50/40 border-indigo-200'
          }`}
        >
          {/* Explicit High-Risk Alert Banner as requested by user prompt */}
          {isNextHighRisk && (
            <div className="mb-4 p-4 rounded-xl bg-rose-600 text-white text-xs sm:text-sm font-semibold flex items-start gap-3 shadow-sm">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-200" />
              <div>
                <div className="font-bold text-sm">
                  Warning: This customer has a high chance of not arriving.
                </div>
                <div className="text-xs text-rose-100 font-normal mt-0.5">
                  Reason: {nextCustomer.noShowReason} ({nextCustomer.totalPastNoShows} missed appointments in history).
                  The administrator must decide whether to serve, wait, skip, or mark them as no-show.
                </div>
              </div>
            </div>
          )}

          {/* Feature 1 Admin Warning: Turn is near but customer has not checked in */}
          {hasUncheckedTurnWarning && (
            <div className="mb-4 p-3.5 rounded-xl bg-amber-500 text-white text-xs font-semibold flex items-center gap-2.5 shadow-sm">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-100" />
              <span>
                <strong>Warning:</strong> Customer has not checked in yet. (Physical arrival at counter desk not confirmed).
              </span>
            </div>
          )}

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold tracking-wider text-slate-500">
                  Next Customer To Serve
                </span>
                <span
                  className={`text-2xs font-semibold px-2 py-0.5 rounded font-mono ${
                    isNextHighRisk
                      ? 'bg-rose-200 text-rose-900 font-bold'
                      : nextCustomer.noShowRisk === 'MEDIUM'
                      ? 'bg-amber-100 text-amber-900'
                      : 'bg-emerald-100 text-emerald-900'
                  }`}
                >
                  No-Show Risk: {nextCustomer.noShowRisk} ({nextCustomer.noShowReason})
                </span>

                <span
                  className={`text-2xs font-semibold px-2 py-0.5 rounded font-mono ${
                    nextCustomer.checkedIn
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {nextCustomer.checkedIn ? '✓ Checked In' : 'Not Checked In'}
                </span>
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-4xl sm:text-5xl font-extrabold font-mono text-slate-900">
                  {nextCustomer.tokenNumber}
                </span>
                <span className="text-lg font-bold text-slate-800">
                  {nextCustomer.customerName}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  {nextCustomer.phoneNumber}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-1">
                <span>{nextCustomer.serviceTypeName}</span>
                <span>·</span>
                <span className="font-semibold text-slate-800">Priority: {nextCustomer.priorityName}</span>
                <span>·</span>
                <span>Estimated Wait: {nextCustomer.estimatedWaitMinutes} min</span>
              </div>
            </div>

            {/* Actions for next customer */}
            <div className="flex flex-wrap items-center gap-2.5">
              {!nextCustomer.checkedIn && (
                <button
                  onClick={() => handleCheckInCustomer(nextCustomer.tokenNumber)}
                  className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Check In</span>
                </button>
              )}

              <div className="w-full sm:w-auto">
                <label className="block text-2xs text-slate-500 mb-1">Assign Counter (optional):</label>
                <select
                  value={selectedCounterId || ''}
                  onChange={(e) => setSelectedCounterId(e.target.value ? Number(e.target.value) : undefined)}
                  className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none"
                >
                  <option value="">Auto-Assign Active Desk</option>
                  {dashboardData.counters
                    .filter((c) => c.serviceType === nextCustomer.serviceType && c.isActive)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.counterName}
                      </option>
                    ))}
                </select>
              </div>

              <button
                onClick={() => handleServe(nextCustomer.tokenNumber)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Call & Serve</span>
              </button>

              <button
                onClick={() => handleSkip(nextCustomer.tokenNumber)}
                className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <SkipForward className="w-3.5 h-3.5" />
                <span>Skip</span>
              </button>

              <button
                onClick={() => handleNoShow(nextCustomer.tokenNumber)}
                className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <UserX className="w-3.5 h-3.5" />
                <span>Mark No-Show</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FILTER TABS */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto max-w-full">
          <button
            onClick={() => setSelectedService('ALL')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              selectedService === 'ALL'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Services ({filteredEntries.length})
          </button>
          {(Object.keys(SERVICE_TYPES) as ServiceType[]).map((type) => {
            const count = allEntries.filter(
              (e) =>
                e.serviceType === type &&
                (e.status === 'WAITING' || e.status === 'CHECKED_IN' || e.status === 'SERVING')
            ).length;
            return (
              <button
                key={type}
                onClick={() => setSelectedService(type)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  selectedService === type
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {SERVICE_TYPES[type].displayName} ({count})
              </button>
            );
          })}
        </div>

        <button
          onClick={refreshData}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* ACTIVE QUEUE TABLE WITH CHECK-IN BADGES */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Active Tickets ({filteredEntries.length})
          </span>
          <span className="text-2xs text-slate-500">
            Ordered by: Priority Value ASC · Arrival Time ASC
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-2xs">
              <tr>
                <th className="py-3 px-4">Pos</th>
                <th className="py-3 px-4">Token</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Service</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Check-In</th>
                <th className="py-3 px-4">No-Show Risk</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Wait Est.</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-500">
                    No active customers in this queue.
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry) => {
                  const isServing = entry.status === 'SERVING';
                  return (
                    <tr
                      key={entry.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isServing ? 'bg-emerald-50/40' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-mono font-semibold text-slate-600">
                        {isServing ? '●' : `#${entry.queuePosition}`}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 text-sm">
                        {entry.tokenNumber}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{entry.customerName}</div>
                        <div className="text-2xs text-slate-400 font-mono">{entry.phoneNumber}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {entry.serviceTypeName}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-2xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {entry.priorityName} (L{entry.priorityValue})
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-mono text-2xs font-semibold px-2 py-0.5 rounded ${
                              entry.checkedIn
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {entry.checkedIn ? 'Checked In' : 'Not Checked In'}
                          </span>
                          {!entry.checkedIn && !isServing && (
                            <button
                              onClick={() => handleCheckInCustomer(entry.tokenNumber)}
                              className="text-2xs text-indigo-600 hover:text-indigo-800 underline font-semibold"
                            >
                              Check In
                            </button>
                          )}
                        </div>
                        {entry.checkInWarning && (
                          <div className="text-2xs text-amber-600 font-semibold mt-0.5">
                            Turn is near!
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-mono text-2xs font-bold px-2 py-0.5 rounded ${
                            entry.noShowRisk === 'HIGH'
                              ? 'bg-rose-100 text-rose-800'
                              : entry.noShowRisk === 'MEDIUM'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                          title={entry.noShowReason}
                        >
                          {entry.noShowRisk}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-2xs font-semibold px-2 py-0.5 rounded ${
                            isServing
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {entry.status}
                        </span>
                        {entry.assignedCounterName && (
                          <div className="text-2xs text-slate-500 mt-0.5 truncate max-w-xs">
                            {entry.assignedCounterName}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700 font-medium">
                        {isServing ? 'In Progress' : `${entry.estimatedWaitMinutes} min`}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isServing ? (
                            <button
                              onClick={() => handleComplete(entry.tokenNumber)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded text-2xs transition-colors flex items-center gap-1 shadow-2xs"
                            >
                              <CheckCircle className="w-3 h-3" />
                              <span>Complete</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleServe(entry.tokenNumber)}
                              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded text-2xs transition-colors flex items-center gap-1 shadow-2xs"
                            >
                              <Play className="w-3 h-3 fill-current" />
                              <span>Serve</span>
                            </button>
                          )}

                          <button
                            onClick={() => handleSkip(entry.tokenNumber)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded text-2xs transition-colors"
                            title="Skip this ticket"
                          >
                            Skip
                          </button>

                          <button
                            onClick={() => handleNoShow(entry.tokenNumber)}
                            className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 font-medium rounded text-2xs transition-colors"
                            title="Mark as No-Show"
                          >
                            No-Show
                          </button>

                          {!isServing && (
                            <button
                              onClick={() => handleCancel(entry.tokenNumber)}
                              className="px-1.5 py-1 text-slate-400 hover:text-rose-600 rounded text-2xs transition-colors"
                              title="Cancel Ticket"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FEATURE 3: CUSTOMER FEEDBACK & RATING STATISTICS PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Star Rating Distribution Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Customer Rating Quality
              </h2>
            </div>
            <span className="text-2xs text-slate-500 font-mono">
              {feedbackStats.totalFeedback} Total Reviews
            </span>
          </div>

          <div className="flex items-baseline gap-3">
            <div className="text-4xl font-black font-mono text-slate-900">
              {feedbackStats.averageRating > 0 ? feedbackStats.averageRating.toFixed(1) : '0.0'}
            </div>
            <div className="flex text-amber-400">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-4 h-4 ${
                    s <= Math.round(feedbackStats.averageRating) ? 'fill-current' : 'text-slate-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-slate-500">out of 5.0</span>
          </div>

          {/* Rating Distribution Bars */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = feedbackStats.ratingDistribution[star] || 0;
              const pct = feedbackStats.totalFeedback > 0 ? (count / feedbackStats.totalFeedback) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2 text-xs">
                  <span className="w-6 font-mono text-slate-600 font-semibold">{star}★</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-right font-mono text-2xs text-slate-500">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Recent Customer Feedback List */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Recent Customer Reviews & Comments
            </h2>
            <span className="text-2xs text-slate-500">Verified Served Tokens</span>
          </div>

          <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
            {feedbackStats.recentFeedback.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No customer feedback submitted yet.
              </div>
            ) : (
              feedbackStats.recentFeedback.map((fb) => (
                <div
                  key={fb.id}
                  className="p-3 rounded-lg border border-slate-100 bg-slate-50/60 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{fb.tokenNumber}</span>
                      <span className="text-2xs text-slate-500">{fb.serviceTypeName}</span>
                    </div>
                    <div className="flex text-amber-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${s <= fb.rating ? 'fill-current' : 'text-slate-200'}`}
                        />
                      ))}
                    </div>
                  </div>
                  {fb.comment && (
                    <p className="text-slate-700 italic text-2xs">"{fb.comment}"</p>
                  )}
                  <div className="text-2xs text-slate-400">
                    {new Date(fb.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* COUNTERS MANAGEMENT PANEL */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-indigo-600" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Service Counters Configuration
            </h2>
          </div>
          <button
            onClick={() => setShowCounterModal(true)}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            + Add New Desk
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {dashboardData.counters.map((counter) => (
            <div
              key={counter.id}
              className={`p-3.5 rounded-lg border text-xs transition-colors ${
                counter.isActive ? 'bg-slate-50 border-slate-200' : 'bg-slate-100/60 border-slate-200 text-slate-400'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-semibold text-slate-900">{counter.counterName}</div>
                  <div className="text-2xs text-slate-500 mt-0.5">
                    {SERVICE_TYPES[counter.serviceType]?.displayName}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteCounter(counter.id)}
                  className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                  title="Remove Counter"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-200/60 text-2xs">
                <span>Status: {counter.isActive ? 'Active' : 'Offline'}</span>
                <button
                  onClick={() => handleToggleCounter(counter.id)}
                  className={`font-semibold hover:underline ${
                    counter.isActive ? 'text-amber-700' : 'text-emerald-700'
                  }`}
                >
                  {counter.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ADD COUNTER MODAL */}
      {showCounterModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">Add Service Counter</h3>
            <p className="text-xs text-slate-500 mb-4">
              Configure a physical or virtual window/desk for queue assignments.
            </p>

            <form onSubmit={handleAddCounter} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Counter Name / Desk
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Counter 3 - Express Checkout"
                  value={newCounterName}
                  onChange={(e) => setNewCounterName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assigned Service Type
                </label>
                <select
                  value={newCounterService}
                  onChange={(e) => setNewCounterService(e.target.value as ServiceType)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600"
                >
                  {(Object.keys(SERVICE_TYPES) as ServiceType[]).map((type) => (
                    <option key={type} value={type}>
                      {SERVICE_TYPES[type].displayName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCounterModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-2xs"
                >
                  Create Counter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
