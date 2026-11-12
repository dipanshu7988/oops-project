import React, { useState, useEffect } from 'react';
import {
  Tv,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building,
  Sparkles,
} from 'lucide-react';
import { queueEngine } from '../services/queueEngine';
import { DisplayBoardData, SERVICE_TYPES, ServiceType } from '../types/queue';

export const DisplayBoardView: React.FC = () => {
  const [boardData, setBoardData] = useState<DisplayBoardData[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [selectedServiceTab, setSelectedServiceTab] = useState<ServiceType | 'ALL'>('ALL');

  const refreshData = () => {
    setBoardData(queueEngine.getDisplayBoardData());
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(() => {
      refreshData();
      setCurrentTime(new Date().toLocaleTimeString());
    }, 5000); // Polls every 5 seconds as specified in requirements
    return () => clearInterval(interval);
  }, []);

  const [voiceEnabled, setVoiceEnabled] = useState(false);

  // Web Audio synthetic chime ding-dong for presentation demo
  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const now = ctx.currentTime;
      // High note
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, now); // E5
      gain1.gain.setValueAtTime(0.2, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.6);

      // Low note
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(523.25, now + 0.25); // C5
      gain2.gain.setValueAtTime(0.25, now + 0.25);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.25);
      osc2.stop(now + 0.9);
    } catch {
      // AudioContext could be blocked until interaction
    }
  };

  const speakTokenCallout = (token: string, counterName: string) => {
    playChime();
    if (voiceEnabled && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const text = `Token ${token.split('').join(' ')}, please proceed to ${counterName}`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  const filteredBoards =
    selectedServiceTab === 'ALL'
      ? boardData
      : boardData.filter((b) => b.serviceType === selectedServiceTab);

  // Check if any customer is currently being served across filtered boards
  const anyServing = filteredBoards.some((b) => b.currentlyServing !== null);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Control Strip & TV Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-900 text-white shadow-sm">
            <Tv className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
              Live Queue Display Board
            </h1>
            <p className="text-xs text-slate-500">
              Route: <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-700">/display</code> · High-visibility public waiting area screen (5s auto-refresh, privacy compliant).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            {currentTime}
          </div>

          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              if (!soundEnabled) playChime();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
            title="Toggle Chime Sound"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            <span>{soundEnabled ? 'Chime On' : 'Chime Off'}</span>
          </button>

          <button
            onClick={() => {
              setVoiceEnabled(!voiceEnabled);
              if (!voiceEnabled) speakTokenCallout('D-102', 'Room 101');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors shadow-2xs ${
              voiceEnabled
                ? 'bg-indigo-600 text-white border-indigo-700'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
            title="Toggle Voice Speech Announcement"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{voiceEnabled ? 'Voice On' : 'Voice Off'}</span>
          </button>

          <button
            onClick={() => speakTokenCallout('D-102', 'Room 101')}
            className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            Test Callout
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-1.5 text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
            title="Fullscreen Mode"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Animated Callout Message Banner (Required by prompt) */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-4 text-white shadow-md">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping shrink-0" />
            <div className="font-extrabold text-sm sm:text-base tracking-wide text-indigo-100 animate-pulse">
              Please proceed to the assigned counter.
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-2xs text-indigo-200 bg-white/10 px-3 py-1 rounded-full border border-white/10 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Privacy Guaranteed · No Personal Names on Screen</span>
          </div>
        </div>
      </div>

      {/* Service Filter Tabs (Required by prompt) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedServiceTab('ALL')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
            selectedServiceTab === 'ALL'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          All Departments
        </button>
        {(Object.keys(SERVICE_TYPES) as ServiceType[]).map((type) => (
          <button
            key={type}
            onClick={() => setSelectedServiceTab(type)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              selectedServiceTab === type
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {SERVICE_TYPES[type].displayName}
          </button>
        ))}
      </div>

      {/* Department Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredBoards.map((board) => (
          <div
            key={board.serviceType}
            className="bg-white border-2 border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col"
          >
            {/* Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <span className="text-2xs uppercase tracking-widest text-indigo-300 font-bold">
                  Department
                </span>
                <h2 className="text-lg font-black tracking-tight">{board.serviceTypeName}</h2>
              </div>
              <div className="text-right">
                <span className="text-2xs uppercase tracking-wider text-slate-400 block">
                  Average Waiting Time
                </span>
                <div className="text-base font-extrabold font-mono text-emerald-400">
                  {board.averageWaitMinutes} minutes
                </div>
              </div>
            </div>

            {/* Now Serving Highlight Section */}
            <div className="p-6 bg-slate-50 border-b border-slate-200">
              <span className="text-xs uppercase font-extrabold tracking-wider text-slate-500 block mb-2">
                Now Serving
              </span>

              {board.currentlyServing ? (
                <div className="bg-white border-2 border-emerald-500 rounded-xl p-5 text-center shadow-xs">
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-1">
                    {board.currentlyServing.counterName}
                  </div>
                  <div className="text-5xl sm:text-6xl font-black font-mono text-emerald-600 tracking-tight my-1">
                    {board.currentlyServing.tokenNumber}
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <span className="text-2xs font-semibold text-slate-500 uppercase tracking-widest">
                      Service in progress
                    </span>
                    <button
                      onClick={() => speakTokenCallout(board.currentlyServing!.tokenNumber, board.currentlyServing!.counterName)}
                      className="inline-flex items-center gap-1 px-2 py-0.5 text-2xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition-colors"
                      title="Announce this token"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>Announce</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-dashed border-slate-300 rounded-xl p-6 text-center text-slate-400">
                  <Clock className="w-6 h-6 mx-auto mb-1 text-slate-300" />
                  <div className="text-sm font-semibold text-slate-600">
                    No customer is currently being served.
                  </div>
                  <div className="text-2xs text-slate-400 mt-0.5">
                    Desk is ready for next token call
                  </div>
                </div>
              )}
            </div>

            {/* Next in Queue Section */}
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-xs uppercase font-extrabold tracking-wider text-slate-500 block mb-3">
                  Next in Queue
                </span>

                {board.nextTokens.length === 0 ? (
                  <div className="py-4 text-center text-xs text-slate-400 italic">
                    Queue is clear. No waiting tickets.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2.5">
                    {board.nextTokens.map((tok, idx) => (
                      <div
                        key={tok}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center"
                      >
                        <span className="text-2xs text-slate-400 font-mono block">
                          #{idx + 1}
                        </span>
                        <span className="text-xl sm:text-2xl font-black font-mono text-slate-900 block">
                          {tok}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-2xs text-slate-500">
                <span>Auto-refresh: 5s polling active</span>
                <span>Privacy: Confidential</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
