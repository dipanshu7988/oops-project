import React from 'react';
import { Layers, Shield, Tv, Ticket, Code2, QrCode, Star, FileText, Activity } from 'lucide-react';

export type NavTab = 'kiosk' | 'status' | 'checkin' | 'display' | 'feedback' | 'admin' | 'code' | 'pdf';

interface HeaderProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  isAdminAuthenticated: boolean;
  onOpenAdminAuth: () => void;
  onLogoutAdmin: () => void;
  activeTokenCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  isAdminAuthenticated,
  onOpenAdminAuth,
  onLogoutAdmin,
  activeTokenCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 h-16">
          {/* Brand Wordmark & Live System Dot */}
          <button
            onClick={() => onTabChange('kiosk')}
            className="flex items-center gap-3 text-left group focus:outline-none shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-all">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors whitespace-nowrap">
                  Smart Queue Manager
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-2xs font-semibold border border-emerald-200/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Live</span>
                </span>
              </div>
              <div className="text-2xs text-slate-500 font-medium hidden sm:block">
                Spring Boot 3.3 · Java 21 · ZXing QR Engine
              </div>
            </div>
          </button>

          {/* Single-line Navigation Links with Modern Segmented Capsule Styling */}
          <nav className="hidden lg:flex items-center gap-1.5 text-xs font-semibold text-slate-600 p-1 bg-slate-100/80 rounded-xl border border-slate-200/70">
            <button
              onClick={() => onTabChange('kiosk')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'kiosk'
                  ? 'bg-white text-indigo-700 shadow-xs font-bold'
                  : 'hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>Join Line</span>
            </button>

            <button
              onClick={() => onTabChange('status')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'status'
                  ? 'bg-white text-indigo-700 shadow-xs font-bold'
                  : 'hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <span>My Token</span>
            </button>

            <button
              onClick={() => onTabChange('checkin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'checkin'
                  ? 'bg-white text-indigo-700 shadow-xs font-bold'
                  : 'hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <QrCode className="w-3.5 h-3.5 text-indigo-600" />
              <span>QR Check-In</span>
            </button>

            <button
              onClick={() => onTabChange('display')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'display'
                  ? 'bg-white text-indigo-700 shadow-xs font-bold'
                  : 'hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>TV Board</span>
            </button>

            <button
              onClick={() => onTabChange('feedback')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'feedback'
                  ? 'bg-white text-indigo-700 shadow-xs font-bold'
                  : 'hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
              <span>Feedback</span>
            </button>

            <button
              onClick={() => onTabChange('admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'admin'
                  ? 'bg-white text-indigo-700 shadow-xs font-bold'
                  : 'hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Console</span>
            </button>

            <button
              onClick={() => onTabChange('code')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'code'
                  ? 'bg-white text-indigo-700 shadow-xs font-bold'
                  : 'hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Java Code</span>
            </button>

            <button
              onClick={() => onTabChange('pdf')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'pdf'
                  ? 'bg-indigo-600 text-white shadow-xs font-bold'
                  : 'text-indigo-600 hover:bg-indigo-50'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Report PDF</span>
            </button>
          </nav>

          {/* Action Zone: Admin Sign-in or Status */}
          <div className="flex items-center gap-3 shrink-0">
            {isAdminAuthenticated ? (
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  <span>Admin Session</span>
                </span>
                <button
                  onClick={onLogoutAdmin}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shadow-2xs"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAdminAuth}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-sm hover:shadow transition-all whitespace-nowrap active:scale-95"
              >
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
                <span>Admin Sign-In</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile nav bar */}
      <div className="lg:hidden flex items-center justify-around border-t border-slate-200 py-2.5 bg-slate-50/95 backdrop-blur-md px-1 text-2xs font-semibold overflow-x-auto">
        <button
          onClick={() => onTabChange('kiosk')}
          className={`py-1 px-2 rounded-lg ${activeTab === 'kiosk' ? 'text-indigo-700 font-bold bg-white shadow-2xs' : 'text-slate-600'}`}
        >
          Join
        </button>
        <button
          onClick={() => onTabChange('status')}
          className={`py-1 px-2 rounded-lg ${activeTab === 'status' ? 'text-indigo-700 font-bold bg-white shadow-2xs' : 'text-slate-600'}`}
        >
          Token
        </button>
        <button
          onClick={() => onTabChange('checkin')}
          className={`py-1 px-2 rounded-lg ${activeTab === 'checkin' ? 'text-indigo-700 font-bold bg-white shadow-2xs' : 'text-slate-600'}`}
        >
          Check-In
        </button>
        <button
          onClick={() => onTabChange('display')}
          className={`py-1 px-2 rounded-lg ${activeTab === 'display' ? 'text-indigo-700 font-bold bg-white shadow-2xs' : 'text-slate-600'}`}
        >
          TV Board
        </button>
        <button
          onClick={() => onTabChange('feedback')}
          className={`py-1 px-2 rounded-lg ${activeTab === 'feedback' ? 'text-indigo-700 font-bold bg-white shadow-2xs' : 'text-slate-600'}`}
        >
          Review
        </button>
        <button
          onClick={() => onTabChange('admin')}
          className={`py-1 px-2 rounded-lg ${activeTab === 'admin' ? 'text-indigo-700 font-bold bg-white shadow-2xs' : 'text-slate-600'}`}
        >
          Console
        </button>
        <button
          onClick={() => onTabChange('pdf')}
          className={`py-1 px-2 rounded-lg ${activeTab === 'pdf' ? 'text-white font-bold bg-indigo-600 shadow-2xs' : 'text-indigo-600'}`}
        >
          PDF
        </button>
      </div>
    </header>
  );
};
