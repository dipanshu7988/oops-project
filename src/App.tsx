import React, { useState } from 'react';
import { Header, NavTab } from './components/Header';
import { JoinQueueView } from './components/JoinQueueView';
import { TokenStatusView } from './components/TokenStatusView';
import { CheckInView } from './components/CheckInView';
import { DisplayBoardView } from './components/DisplayBoardView';
import { FeedbackView } from './components/FeedbackView';
import { AdminDashboardView } from './components/AdminDashboardView';
import { JavaCodeExplorerView } from './components/JavaCodeExplorerView';
import { PdfReportView } from './components/PdfReportView';
import { QueueEntryResponse } from './types/queue';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('kiosk');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [selectedTokenForStatus, setSelectedTokenForStatus] = useState<string | undefined>(undefined);
  const [selectedTokenForFeedback, setSelectedTokenForFeedback] = useState<string | undefined>(undefined);

  const handleTokenGenerated = (token: QueueEntryResponse) => {
    setSelectedTokenForStatus(token.tokenNumber);
  };

  const handleNavigateToStatus = (tokenNumber?: string) => {
    if (tokenNumber) {
      setSelectedTokenForStatus(tokenNumber);
    }
    setActiveTab('status');
  };

  const handleNavigateToFeedback = (tokenNumber?: string) => {
    if (tokenNumber) {
      setSelectedTokenForFeedback(tokenNumber);
    }
    setActiveTab('feedback');
  };

  return (
    <div className="min-h-screen flex flex-col bg-mesh-pattern text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Navigation */}
      <Header
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
        }}
        isAdminAuthenticated={isAdminAuthenticated}
        onOpenAdminAuth={() => setActiveTab('admin')}
        onLogoutAdmin={() => {
          setIsAdminAuthenticated(false);
          setActiveTab('kiosk');
        }}
        activeTokenCount={3}
      />

      {/* Main Content Body */}
      <main className="flex-1 pb-16">
        {activeTab === 'kiosk' && (
          <JoinQueueView
            onTokenGenerated={handleTokenGenerated}
            onNavigateToStatus={handleNavigateToStatus}
          />
        )}

        {activeTab === 'status' && (
          <TokenStatusView
            initialToken={selectedTokenForStatus}
            onNavigateToKiosk={() => setActiveTab('kiosk')}
            onNavigateToFeedback={handleNavigateToFeedback}
          />
        )}

        {activeTab === 'checkin' && (
          <CheckInView
            onNavigateToDashboard={() => setActiveTab('admin')}
          />
        )}

        {activeTab === 'display' && <DisplayBoardView />}

        {activeTab === 'feedback' && (
          <FeedbackView
            initialToken={selectedTokenForFeedback}
            onNavigateToKiosk={() => setActiveTab('kiosk')}
          />
        )}

        {activeTab === 'admin' && (
          <AdminDashboardView
            isAuthenticated={isAdminAuthenticated}
            onLoginSuccess={() => setIsAdminAuthenticated(true)}
            onNavigateToCheckIn={() => setActiveTab('checkin')}
            onNavigateToDisplay={() => setActiveTab('display')}
          />
        )}

        {activeTab === 'code' && <JavaCodeExplorerView />}
        {activeTab === 'pdf' && <PdfReportView />}
      </main>

      {/* Clean Academic / Presentation Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">Smart Queue Manager</span>
            <span>·</span>
            <span>Spring Boot 3.3 & Java 21</span>
            <span>·</span>
            <span>In-Memory H2 Database</span>
            <span>·</span>
            <span>ZXing QR & Feedback Module</span>
          </div>

          <div className="flex items-center gap-4 text-2xs text-slate-500">
            <span>Terminal: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-mono">mvn spring-boot:run</code></span>
            <span>·</span>
            <span>H2 Console: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-mono">/h2-console</code></span>
            <span>·</span>
            <span>Admin Demo Key: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-mono">admin123</code></span>
          </div>
        </div>
      </footer>
    </div>
  );
}
