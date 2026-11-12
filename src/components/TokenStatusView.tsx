import React, { useState, useEffect } from 'react';
import {
  Search,
  RefreshCw,
  Clock,
  Users,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Building,
  User,
  Phone,
  XCircle,
  HelpCircle,
  Download,
  Star,
  QrCode,
  ArrowRight,
} from 'lucide-react';
import { QueueEntryResponse } from '../types/queue';
import { queueEngine } from '../services/queueEngine';

interface TokenStatusViewProps {
  initialToken?: string;
  onNavigateToKiosk: () => void;
  onNavigateToFeedback?: (tokenNumber: string) => void;
}

export const TokenStatusView: React.FC<TokenStatusViewProps> = ({
  initialToken,
  onNavigateToKiosk,
  onNavigateToFeedback,
}) => {
  const [searchToken, setSearchToken] = useState(initialToken || 'D-102');
  const [currentEntry, setCurrentEntry] = useState<QueueEntryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [recentTokens, setRecentTokens] = useState<string[]>([]);

  const loadToken = (tokenToLoad: string) => {
    setError(null);
    try {
      const entry = queueEngine.getQueueEntryByToken(tokenToLoad);
      setCurrentEntry(entry);
      setSearchToken(tokenToLoad.toUpperCase());

      // Save to recents
      setRecentTokens((prev) => {
        const set = new Set([tokenToLoad.toUpperCase(), ...prev]);
        return Array.from(set).slice(0, 5);
      });
    } catch (err: any) {
      setError(err.message || 'Ticket not found.');
      setCurrentEntry(null);
    }
  };

  useEffect(() => {
    if (initialToken) {
      loadToken(initialToken);
    } else {
      // Default to first active entry if exists
      const all = queueEngine.getAllEntries();
      const active = all.find((e) => e.status === 'WAITING' || e.status === 'CHECKED_IN' || e.status === 'SERVING');
      if (active) {
        loadToken(active.tokenNumber);
      }
    }
  }, [initialToken]);

  const handleRefresh = () => {
    if (searchToken) {
      setIsRefreshing(true);
      setTimeout(() => {
        loadToken(searchToken);
        setIsRefreshing(false);
      }, 250);
    }
  };

  const handleCancelTicket = () => {
    if (!currentEntry) return;
    if (window.confirm(`Are you sure you want to cancel ticket ${currentEntry.tokenNumber}?`)) {
      try {
        const updated = queueEngine.cancelCustomer(currentEntry.tokenNumber);
        setCurrentEntry(updated);
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  const handleDownloadQr = () => {
    if (!currentEntry || !currentEntry.qrCodeData) return;
    const link = document.createElement('a');
    link.href = currentEntry.qrCodeData;
    link.download = `token-${currentEntry.tokenNumber}-qr.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: string, checkedIn: boolean) => {
    switch (status) {
      case 'WAITING':
      case 'CHECKED_IN':
        return (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              <Clock className="w-3.5 h-3.5" />
              <span>Waiting in Queue</span>
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold ${
                checkedIn
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              {checkedIn ? '✓ Checked In' : 'Not Checked In Yet'}
            </span>
          </div>
        );
      case 'SERVING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 animate-pulse">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Currently Being Served!</span>
          </span>
        );
      case 'SERVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Completed / Served</span>
          </span>
        );
      case 'SKIPPED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Skipped</span>
          </span>
        );
      case 'NO_SHOW':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Marked No-Show</span>
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">
            <XCircle className="w-3.5 h-3.5" />
            <span>Cancelled</span>
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Search Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-1">
          Live Queue Status Lookup
        </h1>
        <p className="text-sm text-slate-600 mb-4">
          Enter your token number to view real-time queue position, QR check-in code, and estimated wait time.
        </p>

        {/* Search bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            loadToken(searchToken);
          }}
          className="flex gap-2 max-w-lg"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="e.g. D-101, F-102"
              value={searchToken}
              onChange={(e) => setSearchToken(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm uppercase font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-2xs whitespace-nowrap"
          >
            Check Status
          </button>
        </form>

        {/* Quick chip links to demo tokens */}
        {recentTokens.length > 0 && (
          <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
            <span>Recent lookups:</span>
            <div className="flex gap-1.5">
              {recentTokens.map((t) => (
                <button
                  key={t}
                  onClick={() => loadToken(t)}
                  className="font-mono px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 transition-colors"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm mb-6 flex items-start gap-2.5">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Search result: </span>
            {error}
          </div>
        </div>
      )}

      {currentEntry && (
        <div className="space-y-6">
          {/* Main Status Hero Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Ticket Status
                </span>
                <div className="mt-1">{getStatusBadge(currentEntry.status, currentEntry.checkedIn)}</div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors shadow-2xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>

                {(currentEntry.status === 'WAITING' || currentEntry.status === 'CHECKED_IN') && (
                  <button
                    onClick={handleCancelTicket}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-xs font-medium text-rose-700 transition-colors"
                  >
                    <span>Cancel Ticket</span>
                  </button>
                )}

                {currentEntry.status === 'SERVED' && onNavigateToFeedback && (
                  <button
                    onClick={() => onNavigateToFeedback(currentEntry.tokenNumber)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-50 border border-amber-200 hover:bg-amber-100 text-xs font-semibold text-amber-800 transition-colors"
                  >
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                    <span>Leave Feedback</span>
                  </button>
                )}
              </div>
            </div>

            {/* Central Big Number & Details & QR */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 items-center">
              {/* Token Number & QR Code */}
              <div className="text-center md:text-left md:border-r border-slate-100 md:pr-6 flex flex-col items-center md:items-start">
                <span className="text-xs uppercase font-semibold text-slate-500">Token Number</span>
                <div className="text-5xl sm:text-6xl font-extrabold font-mono text-indigo-600 my-1">
                  {currentEntry.tokenNumber}
                </div>
                <div className="text-xs text-slate-500">
                  Joined: {new Date(currentEntry.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>

                {currentEntry.qrCodeData && (
                  <div className="mt-3 flex items-center gap-2">
                    <img
                      src={currentEntry.qrCodeData}
                      alt={`QR code for ${currentEntry.tokenNumber}`}
                      className="w-16 h-16 p-1 bg-white border border-slate-200 rounded-lg shadow-2xs"
                    />
                    <button
                      onClick={handleDownloadQr}
                      className="text-2xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md"
                    >
                      <Download className="w-3 h-3" />
                      <span>Save QR</span>
                    </button>
                  </div>
                )}
              </div>

              {/* People Ahead & Est Wait */}
              <div className="col-span-2 grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center sm:text-left">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span>People Ahead</span>
                  </div>
                  <div className="text-3xl font-extrabold font-mono text-slate-900">
                    {currentEntry.peopleAhead}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Queue Position #{currentEntry.queuePosition}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center sm:text-left">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>Estimated Wait Time</span>
                  </div>
                  <div className="text-3xl font-extrabold font-mono text-indigo-600">
                    {currentEntry.estimatedWaitMinutes} <span className="text-lg font-normal text-slate-600">min</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Calculated dynamically
                  </div>
                </div>
              </div>
            </div>

            {/* Context Metadata Row */}
            <div className="pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block mb-0.5">Queue Type</span>
                <span className="font-semibold text-slate-900 text-sm">
                  {currentEntry.serviceTypeName}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block mb-0.5">Priority Status</span>
                <span className="font-semibold text-slate-900 text-sm">
                  {currentEntry.priorityName} (Level {currentEntry.priorityValue})
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block mb-0.5">Assigned Counter</span>
                <span className="font-semibold text-slate-900 text-sm">
                  {currentEntry.assignedCounterName || 'Pending Assignment'}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block mb-0.5">Check-In Status</span>
                <span className="font-semibold text-slate-900 text-sm">
                  {currentEntry.checkedIn ? 'Physical Check-In Done' : 'Please Check In at Desk'}
                </span>
              </div>
            </div>
          </div>

          {/* Feedback Prompt if SERVED */}
          {currentEntry.status === 'SERVED' && (
            <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <div className="font-bold text-sm text-amber-900">How was your service experience?</div>
                <div className="text-xs text-amber-800 mt-0.5">
                  Your ticket has been marked completed. Take 15 seconds to rate your counter consultation.
                </div>
              </div>
              {onNavigateToFeedback && (
                <button
                  onClick={() => onNavigateToFeedback(currentEntry.tokenNumber)}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-lg transition-colors whitespace-nowrap shadow-2xs"
                >
                  Rate Counter (1-5★)
                </button>
              )}
            </div>
          )}

          {/* Wait Time Formula Explanation Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
              <HelpCircle className="w-4 h-4 text-indigo-600" />
              <span>How Estimated Waiting Time is Calculated</span>
            </div>
            <div className="text-xs text-slate-600 space-y-1.5">
              <div className="font-mono bg-white px-3 py-2 rounded border border-slate-200 text-slate-800 text-xs">
                Estimated Wait = People Ahead ({currentEntry.peopleAhead}) × Average Service Time (~3 min) = {currentEntry.estimatedWaitMinutes} minutes
              </div>
              <p className="text-slate-500 text-2xs pt-1">
                * Note: The average service time automatically recalculates using actual service durations recorded by counter staff upon ticket completion.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
