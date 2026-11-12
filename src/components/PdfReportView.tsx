import React, { useState } from 'react';
import {
  FileText,
  Download,
  ExternalLink,
  Printer,
  CheckCircle2,
  BookOpen,
  Code2,
  ShieldCheck,
  Layers,
  Sparkles,
} from 'lucide-react';

export const PdfReportView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'embed' | 'sections'>('embed');

  const pdfUrl = '/downloads/Smart_Queue_Manager_Project_Report.pdf';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-2xs">
              <FileText className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Project Technical Report & Architecture Specification
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Official academic & technical documentation PDF for Smart Queue Manager (Spring Boot 3.3.4, Java 21, ZXing QR, H2 RDBMS).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors shadow-2xs"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            <span>Open in New Tab</span>
          </a>

          <a
            href={pdfUrl}
            download="Smart_Queue_Manager_Project_Report.pdf"
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </a>
        </div>
      </div>

      {/* Quick Summary Pill Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-2xs uppercase font-semibold text-slate-500 block">Document Title</span>
          <div className="text-xs font-bold text-slate-900 mt-0.5 truncate">
            Smart Queue Manager
          </div>
          <div className="text-2xs text-slate-500">Technical Report v1.0.0</div>
        </div>

        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-2xs uppercase font-semibold text-slate-500 block">Stack & Standard</span>
          <div className="text-xs font-bold text-slate-900 mt-0.5 truncate">
            Spring Boot 3.3 & Java 21
          </div>
          <div className="text-2xs text-slate-500">H2 In-Memory RDBMS</div>
        </div>

        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-2xs uppercase font-semibold text-slate-500 block">Test Verification</span>
          <div className="text-xs font-bold text-emerald-600 mt-0.5 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>20 / 20 Tests Passed</span>
          </div>
          <div className="text-2xs text-slate-500">100% Pass Rate (JUnit 5)</div>
        </div>

        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-2xs uppercase font-semibold text-slate-500 block">Enhanced Features</span>
          <div className="text-xs font-bold text-indigo-600 mt-0.5">
            QR · Display · Feedback
          </div>
          <div className="text-2xs text-slate-500">ZXing + TV Board + Stars</div>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('embed')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'embed'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Live PDF Document Reader
          </button>
          <button
            onClick={() => setActiveTab('sections')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'sections'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Report Outline & Chapters
          </button>
        </div>

        <div className="text-2xs text-slate-500 font-mono hidden sm:block">
          File: Smart_Queue_Manager_Project_Report.pdf (~19 KB)
        </div>
      </div>

      {/* Tab 1: Live Interactive PDF Reader */}
      {activeTab === 'embed' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col h-[780px]">
          <div className="px-4 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-mono text-slate-700 font-medium">
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>Smart_Queue_Manager_Project_Report.pdf</span>
            </div>
            <div className="flex items-center gap-3">
              <a
                href={pdfUrl}
                download="Smart_Queue_Manager_Project_Report.pdf"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save to Computer</span>
              </a>
            </div>
          </div>

          <div className="flex-1 bg-slate-800 p-2 sm:p-4">
            <object
              data={pdfUrl}
              type="application/pdf"
              className="w-full h-full rounded-lg shadow-md bg-white"
            >
              <div className="p-12 text-center text-white space-y-4">
                <FileText className="w-12 h-12 text-slate-400 mx-auto" />
                <h3 className="text-base font-bold">PDF Reader Plugin</h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  Your current browser view does not support embedded PDF rendering directly. You can download or view it in a new tab:
                </p>
                <div className="flex justify-center gap-3 pt-2">
                  <a
                    href={pdfUrl}
                    download="Smart_Queue_Manager_Project_Report.pdf"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm"
                  >
                    Download PDF File
                  </a>
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-semibold"
                  >
                    Open in Dedicated Window
                  </a>
                </div>
              </div>
            </object>
          </div>
        </div>
      )}

      {/* Tab 2: Structured Chapters & Outline Overview */}
      {activeTab === 'sections' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
              <BookOpen className="w-4 h-4" />
              <span>Report Contents & Chapters</span>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <div className="font-bold text-slate-900 text-sm">1. System Architecture & Component Design</div>
                <p className="text-slate-500 mt-1">
                  Covers clean enterprise layered separation: REST Controllers, Data Transfer Objects (DTOs), Business Logic Services, Spring Data JPA Repositories, and in-memory H2 RDBMS.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <div className="font-bold text-slate-900 text-sm">2. Priority Queue Algorithm & Mathematics</div>
                <p className="text-slate-500 mt-1">
                  Details the 4-tier precedence model (Emergency: 1 &gt; VIP: 2 &gt; Elderly: 3 &gt; Normal: 4), secondary arrival timestamp tie-breaking, and adaptive rolling average wait-time formulas.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <div className="font-bold text-slate-900 text-sm">3. Enhanced Production Features</div>
                <p className="text-slate-500 mt-1">
                  Full specifications for ZXing QR Token Check-In, Public Waiting Area TV Board (/display), and Customer Feedback 1-to-5 Star Rating (/feedback/{'{tokenNumber}'}).
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <div className="font-bold text-slate-900 text-sm">4. Comprehensive REST API Reference Table</div>
                <p className="text-slate-500 mt-1">
                  13 documented endpoints across Kiosk, Check-In, TV Display, Feedback, and Admin Management with HTTP methods, URL patterns, and HTTP status codes.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <div className="font-bold text-slate-900 text-sm">5. Quality Assurance & Test Verification</div>
                <p className="text-slate-500 mt-1">
                  20 automated JUnit 5 tests documented with 100% passing results, covering edge cases, state machine transitions, and end-to-end integration flows.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900 text-white rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
                <Code2 className="w-4 h-4" />
                <span>Single-Command Execution</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg font-mono text-xs text-emerald-400 border border-slate-800">
                <code>mvn spring-boot:run</code>
              </div>
              <p className="text-xs text-slate-300">
                Starts the complete Spring Boot 3.3.4 backend on port 8080 with automated schema generation and data seeding.
              </p>
              <div className="space-y-1.5 text-2xs font-mono text-slate-400 pt-2 border-t border-slate-800">
                <div>H2 Console: http://localhost:8080/h2-console</div>
                <div>JDBC URL: jdbc:h2:mem:smartqueuedb</div>
                <div>Admin Password: admin123</div>
              </div>
            </div>

            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Ready for Academic Presentation & Defense</span>
              </div>
              <p className="text-xs text-indigo-800">
                This PDF report is structured specifically for university project submissions, technical defense panels, or enterprise stakeholder evaluation.
              </p>
              <a
                href={pdfUrl}
                download="Smart_Queue_Manager_Project_Report.pdf"
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Report PDF File</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
