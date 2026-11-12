import React, { useState } from 'react';
import {
  Utensils,
  Stethoscope,
  FileCheck,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Clock,
  Users,
  Sparkles,
  ArrowRight,
  Info,
  Download,
  QrCode,
} from 'lucide-react';
import {
  PRIORITY_CONFIG,
  PriorityCategory,
  QueueEntryResponse,
  SERVICE_TYPES,
  ServiceType,
} from '../types/queue';
import { queueEngine } from '../services/queueEngine';

interface JoinQueueViewProps {
  onTokenGenerated: (token: QueueEntryResponse) => void;
  onNavigateToStatus: (tokenNumber?: string) => void;
}

export const JoinQueueView: React.FC<JoinQueueViewProps> = ({
  onTokenGenerated,
  onNavigateToStatus,
}) => {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [serviceType, setServiceType] = useState<ServiceType>('DOCTOR_CONSULTATION');
  const [priority, setPriority] = useState<PriorityCategory>('NORMAL');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedEntry, setGeneratedEntry] = useState<QueueEntryResponse | null>(null);

  const getServiceIcon = (type: ServiceType) => {
    switch (type) {
      case 'FOOD_ORDER':
        return <Utensils className="w-5 h-5 text-amber-600" />;
      case 'DOCTOR_CONSULTATION':
        return <Stethoscope className="w-5 h-5 text-emerald-600" />;
      case 'DOCUMENT_VERIFICATION':
        return <FileCheck className="w-5 h-5 text-blue-600" />;
      case 'PAYMENT_COUNTER':
        return <CreditCard className="w-5 h-5 text-indigo-600" />;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Form validations
    if (!name.trim() || name.trim().length < 2) {
      setErrorMessage('Name is required and must be at least 2 characters.');
      return;
    }

    const cleanPhone = phoneNumber.replace(/[\s-]/g, '');
    const phoneRegex = /^[0-9+]{10,15}$/;
    if (!cleanPhone || !phoneRegex.test(cleanPhone)) {
      setErrorMessage('Phone number is required and must contain 10 to 15 digits (e.g. +919876543210 or 9876543210).');
      return;
    }

    setIsSubmitting(true);
    try {
      const entry = queueEngine.joinQueue(name, cleanPhone, serviceType, priority);
      setGeneratedEntry(entry);
      onTokenGenerated(entry);
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while joining the queue.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadQr = () => {
    if (!generatedEntry || !generatedEntry.qrCodeData) return;
    const link = document.createElement('a');
    link.href = generatedEntry.qrCodeData;
    link.download = `token-${generatedEntry.tokenNumber}-qr.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleQuickFill = (presetName: string, presetPhone: string, presetPriority: PriorityCategory) => {
    setName(presetName);
    setPhoneNumber(presetPhone);
    setPriority(presetPriority);
    setErrorMessage(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Intro hero banner */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-xs font-semibold text-indigo-700 mb-3 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>Priority Triage & QR Mobile Check-In Active</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
          Smart Virtual Queue <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Kiosk</span>
        </h1>
        <p className="mt-2 text-slate-600 text-sm sm:text-base leading-relaxed">
          Skip crowded physical lobbies. Choose your department, get an instant digital token with an arrival QR code, and track queue positions in real-time.
        </p>
      </div>

      {generatedEntry ? (
        /* Token Confirmation Card with QR Code (Feature 1) */
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-600 text-sm font-semibold mb-3">
            <CheckCircle2 className="w-5 h-5" />
            <span>Ticket Successfully Issued</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Token & QR Code Presentation */}
            <div className="text-center p-6 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <span className="text-xs font-semibold tracking-wider uppercase text-slate-500">
                Your Token Number
              </span>
              <div className="text-5xl sm:text-6xl font-extrabold font-mono text-indigo-600 tracking-tight my-1">
                {generatedEntry.tokenNumber}
              </div>

              {/* QR Code Preview */}
              {generatedEntry.qrCodeData && (
                <div className="pt-2 flex flex-col items-center">
                  <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
                    <img
                      src={generatedEntry.qrCodeData}
                      alt={`QR Code for ${generatedEntry.tokenNumber}`}
                      className="w-32 h-32 object-contain mx-auto"
                    />
                  </div>
                  <div className="text-2xs text-slate-500 mt-2">
                    Scan at lobby check-in desk
                  </div>
                  <button
                    onClick={handleDownloadQr}
                    className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-2xs font-semibold text-slate-700 shadow-2xs transition-colors"
                  >
                    <Download className="w-3 h-3 text-slate-500" />
                    <span>Download QR Image</span>
                  </button>
                </div>
              )}

              <div className="flex items-center justify-center gap-2 text-xs text-slate-500 pt-2 border-t border-slate-200">
                <span>{generatedEntry.serviceTypeName}</span>
                <span>·</span>
                <span>Priority: {generatedEntry.priorityName}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span>People Ahead</span>
                  </div>
                  <div className="text-2xl font-bold font-mono text-slate-900">
                    {generatedEntry.peopleAhead}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Position #{generatedEntry.queuePosition}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>Est. Wait Time</span>
                  </div>
                  <div className="text-2xl font-bold font-mono text-indigo-600">
                    {generatedEntry.estimatedWaitMinutes} min
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    ~3 min / customer
                  </div>
                </div>
              </div>

              {/* Physical check-in instruction */}
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-xs text-amber-900 space-y-1">
                <span className="font-semibold block">Physical Arrival Check-In Required:</span>
                <p className="text-2xs text-amber-800">
                  Please show your QR code to staff at the entrance (<code className="font-mono">/admin/check-in</code>) to confirm your presence before your number is called.
                </p>
              </div>

              <div className="text-xs text-slate-600 p-3 bg-indigo-50/60 border border-indigo-100 rounded-lg">
                <span className="font-semibold text-indigo-900">Customer: </span>
                {generatedEntry.customerName} ({generatedEntry.phoneNumber})
                {generatedEntry.assignedCounterName && (
                  <div>
                    <span className="font-semibold text-indigo-900">Assigned Counter: </span>
                    {generatedEntry.assignedCounterName}
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={() => onNavigateToStatus(generatedEntry.tokenNumber)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  <span>Track Live Ticket</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setGeneratedEntry(null);
                    setName('');
                    setPhoneNumber('');
                  }}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-200 transition-colors"
                >
                  Join Another Queue
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Join Form */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form (2 cols) */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMessage && (
                <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Unable to issue ticket: </span>
                    {errorMessage}
                  </div>
                </div>
              )}

              {/* Service Selection */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                  1. Select Service Type
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(Object.keys(SERVICE_TYPES) as ServiceType[]).map((type) => {
                    const info = SERVICE_TYPES[type];
                    const isSelected = serviceType === type;
                    return (
                      <button
                        type="button"
                        key={type}
                        onClick={() => setServiceType(type)}
                        className={`text-left p-3.5 rounded-lg border transition-all ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 mb-1">
                          <div className="p-1.5 rounded-md bg-white border border-slate-200 shadow-2xs">
                            {getServiceIcon(type)}
                          </div>
                          <span className="font-semibold text-sm text-slate-900">
                            {info.displayName}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2">
                          {info.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Customer Info */}
              <div className="space-y-4">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  2. Customer Details
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +919876543210"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                    />
                  </div>
                </div>
              </div>

              {/* Priority Category */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                    3. Priority Category
                  </label>
                  <span className="text-xs text-slate-500">
                    Lower value = Higher priority
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {(Object.keys(PRIORITY_CONFIG) as PriorityCategory[]).map((cat) => {
                    const pInfo = PRIORITY_CONFIG[cat];
                    const isSelected = priority === cat;
                    return (
                      <button
                        type="button"
                        key={cat}
                        onClick={() => setPriority(cat)}
                        className={`text-left p-3 rounded-lg border text-xs transition-all ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-slate-900">{pInfo.displayName}</span>
                          <span className="font-mono text-2xs font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                            Lvl {pInfo.value}
                          </span>
                        </div>
                        <p className="text-2xs text-slate-500 line-clamp-2">
                          {pInfo.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg transition-colors shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Generating Token & QR Code...' : 'Get Virtual Queue Token & QR'}
                </button>
              </div>
            </form>
          </div>

          {/* Side Info & Demo Presets (1 col) */}
          <div className="space-y-6">
            {/* Priority Queue Explanation Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
              <div className="flex items-center gap-2 font-semibold text-xs uppercase tracking-wider text-slate-800 mb-3">
                <Info className="w-4 h-4 text-indigo-600" />
                <span>Priority Algorithm Rules</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                  <span>
                    <strong>Emergency (1):</strong> Inserted directly to top of queue.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <span>
                    <strong>VIP (2):</strong> Served after emergencies, before seniors & standard.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                  <span>
                    <strong>Elderly (3):</strong> Priority ahead of standard normal tickets.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                  <span>
                    <strong>Normal (4):</strong> First-in, first-out (FIFO).
                  </span>
                </li>
                <li className="pt-2 border-t border-slate-100 text-slate-500">
                  <em>Arrival time acts as the tie-breaker for identical priority tiers.</em>
                </li>
              </ul>
            </div>

            {/* Quick Demo Pre-fills for student presentation */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 mb-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Demo Quick-Fill Personas</span>
              </div>
              <p className="text-xs text-slate-500 mb-3">
                Quickly test different customer profiles to demo the no-show risk engine:
              </p>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => handleQuickFill('Rahul Sharma', '+919876543210', 'NORMAL')}
                  className="w-full text-left p-2.5 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-xs transition-colors"
                >
                  <div className="font-semibold text-slate-900">Rahul Sharma (High Risk)</div>
                  <div className="text-slate-500 text-2xs">3 missed visits · triggers admin warning!</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickFill('Dr. Kavita Verma (Dean)', '+919876543299', 'VIP')}
                  className="w-full text-left p-2.5 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-xs transition-colors"
                >
                  <div className="font-semibold text-slate-900">Dr. Kavita Verma (VIP Priority)</div>
                  <div className="text-slate-500 text-2xs">Level 2 VIP Priority test</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickFill('Suresh Kumar (Urgent)', '+919876543288', 'EMERGENCY')}
                  className="w-full text-left p-2.5 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-xs transition-colors"
                >
                  <div className="font-semibold text-slate-900">Suresh Kumar (Emergency Jump)</div>
                  <div className="text-slate-500 text-2xs">Level 1 Emergency jump to #1 position</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
