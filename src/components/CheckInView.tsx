import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  QrCode,
  CheckCircle2,
  AlertCircle,
  Camera,
  Search,
  Clock,
  UserCheck,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Video,
  VideoOff,
  RefreshCw,
  Flashlight,
  Upload,
  Check,
} from 'lucide-react';
// @ts-ignore
import jsQR from 'jsqr';
import { queueEngine } from '../services/queueEngine';
import { CheckInResult, QueueEntryResponse, SERVICE_TYPES } from '../types/queue';

interface CheckInViewProps {
  onCheckInSuccess?: (result: CheckInResult) => void;
  onNavigateToDashboard?: () => void;
}

export const CheckInView: React.FC<CheckInViewProps> = ({
  onCheckInSuccess,
  onNavigateToDashboard,
}) => {
  const [tokenInput, setTokenInput] = useState('');
  const [result, setResult] = useState<CheckInResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStreamActive, setCameraStreamActive] = useState(false);
  const [cameraPermissionError, setCameraPermissionError] = useState<string | null>(null);
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
  const [isProcessingScan, setIsProcessingScan] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanLoopRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Active tickets for quick demonstration
  const [allEntries, setAllEntries] = useState(queueEngine.getAllEntries());
  const waitingEntries = allEntries.filter(
    (e) => e.status === 'WAITING' || e.status === 'CHECKED_IN'
  );

  const refreshList = () => {
    setAllEntries(queueEngine.getAllEntries());
  };

  const handleCheckIn = useCallback((token: string) => {
    setError(null);
    setResult(null);

    const cleanToken = token.trim().toUpperCase();
    if (!cleanToken) {
      setError('Please provide a valid token number (e.g. D-101, F-102).');
      return;
    }

    try {
      const checkInResult = queueEngine.checkInCustomer(cleanToken);
      setResult(checkInResult);
      setTokenInput('');
      setLastScannedCode(cleanToken);
      refreshList();
      if (onCheckInSuccess) {
        onCheckInSuccess(checkInResult);
      }
    } catch (err: any) {
      setError(err.message || 'Unable to complete check-in.');
    }
  }, [onCheckInSuccess]);

  // Decode QR code text (can be raw token "D-101" or JSON {"tokenNumber":"D-101", ...})
  const parseTokenFromQrData = (data: string): string => {
    try {
      const parsed = JSON.parse(data);
      if (parsed && parsed.tokenNumber) {
        return parsed.tokenNumber;
      }
    } catch {
      // Not JSON, check if standard token format
    }
    // Match token format like D-101, F-102, V-103, P-104
    const match = data.match(/([A-Z]-\d{3,4})/i);
    if (match) {
      return match[1].toUpperCase();
    }
    return data.trim().toUpperCase();
  };

  // Continuous frame scanner using jsQR on the video stream
  const scanFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !cameraStreamActive) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });

      if (code && code.data && !isProcessingScan) {
        const detectedToken = parseTokenFromQrData(code.data);
        if (detectedToken) {
          setIsProcessingScan(true);
          handleCheckIn(detectedToken);
          // Pause slightly before allowing next scan to prevent double triggers
          setTimeout(() => {
            setIsProcessingScan(false);
          }, 2000);
        }
      }
    }

    scanLoopRef.current = requestAnimationFrame(scanFrame);
  }, [cameraStreamActive, isProcessingScan, handleCheckIn]);

  useEffect(() => {
    if (cameraStreamActive) {
      scanLoopRef.current = requestAnimationFrame(scanFrame);
    }
    return () => {
      if (scanLoopRef.current) {
        cancelAnimationFrame(scanLoopRef.current);
      }
    };
  }, [cameraStreamActive, scanFrame]);

  const startRealCamera = async () => {
    setCameraPermissionError(null);
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
      }
      setCameraStreamActive(true);
      setCameraActive(true);
    } catch (err: any) {
      setCameraPermissionError(
        'Camera access was denied or no camera device is connected. You can still upload a QR code image or tap any active token on the right to simulate a scan.'
      );
      setCameraActive(true);
      setCameraStreamActive(false);
    }
  };

  const stopRealCamera = () => {
    if (scanLoopRef.current) {
      cancelAnimationFrame(scanLoopRef.current);
      scanLoopRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setCameraStreamActive(false);
  };

  useEffect(() => {
    return () => {
      stopRealCamera();
    };
  }, []);

  // Handle uploading/dragging a QR image file for instant scanning
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code && code.data) {
            const token = parseTokenFromQrData(code.data);
            handleCheckIn(token);
          } else {
            setError('No valid QR code was detected in the uploaded image. Please try another image or enter the token number manually.');
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    // Reset input
    e.target.value = '';
  };

  const handleSimulateQrScan = (tokenToScan: string) => {
    setCameraActive(true);
    setTimeout(() => {
      handleCheckIn(tokenToScan);
    }, 400);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Hidden canvas used for processing video frames */}
      <canvas ref={canvasRef} className="hidden" />
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Intro Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-2xs">
              <QrCode className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Staff Physical Check-In Desk
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Route: <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-700">/admin/check-in</code> · Live webcam optical scanner with real-time jsQR video frame decoding.
          </p>
        </div>

        {onNavigateToDashboard && (
          <button
            onClick={onNavigateToDashboard}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            ← Back to Admin Console
          </button>
        )}
      </div>

      {/* Main Check-In Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Input & Scanner */}
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              Live QR Check-In Scanner
            </h2>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload QR Image</span>
            </button>
          </div>

          {/* Real Live Camera Scanner Box */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <Camera className="w-4 h-4 text-indigo-600" />
                <span>Camera Scanner (jsQR Real-Time Engine)</span>
              </div>
              <div className="flex items-center gap-2">
                {!cameraStreamActive ? (
                  <button
                    onClick={startRealCamera}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-2xs"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Start Webcam</span>
                  </button>
                ) : (
                  <button
                    onClick={stopRealCamera}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-lg transition-colors"
                  >
                    <VideoOff className="w-3.5 h-3.5" />
                    <span>Stop Camera</span>
                  </button>
                )}
              </div>
            </div>

            {cameraPermissionError && (
              <div className="text-2xs text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Notice: </span>
                  {cameraPermissionError}
                </div>
              </div>
            )}

            {cameraStreamActive ? (
              <div className="relative overflow-hidden rounded-xl bg-black border-2 border-indigo-500 shadow-md">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-64 object-cover"
                />

                {/* Reticle Overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-48 border-2 border-emerald-400 rounded-xl relative shadow-sm">
                    {/* Corner accents */}
                    <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-emerald-400" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-emerald-400" />
                    <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-emerald-400" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-emerald-400" />

                    {/* Laser scanning bar animation */}
                    <div className="absolute left-0 right-0 h-0.5 bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse top-1/2" />
                  </div>
                </div>

                <div className="absolute bottom-2 left-0 right-0 text-center pointer-events-none">
                  <span className="bg-slate-900/80 text-white text-2xs font-mono px-3 py-1 rounded-full border border-white/20">
                    Align customer QR code inside the green square
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-white rounded-lg border border-dashed border-slate-300 text-slate-600 space-y-2">
                <Camera className="w-8 h-8 text-slate-400 mx-auto" />
                <div className="text-xs font-semibold text-slate-800">
                  Camera is Currently Inactive
                </div>
                <p className="text-2xs text-slate-500 max-w-sm mx-auto">
                  Click <strong>"Start Webcam"</strong> above to scan directly with your computer/phone camera, upload a downloaded token QR image, or tap any customer on the right.
                </p>
              </div>
            )}
          </div>

          {/* Manual Token Number Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCheckIn(tokenInput);
            }}
            className="space-y-2 pt-2 border-t border-slate-100"
          >
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
              Or Enter Token Number Manually
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="e.g. D-101, F-101"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm uppercase font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg transition-colors shadow-2xs whitespace-nowrap"
              >
                Verify & Check In
              </button>
            </div>
          </form>

          {/* Alerts / Success Feedback */}
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Check-In Failed: </span>
                {error}
              </div>
            </div>
          )}

          {result && (
            <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-emerald-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Physical Check-In Confirmed!</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-white/80 p-3 rounded-lg border border-emerald-100">
                <div>
                  <span className="text-slate-500 text-2xs block">Token</span>
                  <span className="font-mono font-bold text-base text-indigo-600">
                    {result.tokenNumber}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-2xs block">Customer</span>
                  <span className="font-semibold text-slate-900 truncate block">
                    {result.customerName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-2xs block">Position</span>
                  <span className="font-mono font-bold text-slate-900">
                    #{result.queuePosition} ({result.peopleAhead} ahead)
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-2xs block">Est. Wait</span>
                  <span className="font-mono font-bold text-slate-900">
                    ~{result.estimatedWaitMinutes} min
                  </span>
                </div>
              </div>

              <div className="text-2xs text-emerald-700">
                Customer confirmed present in waiting area at {new Date(result.checkedInAt!).toLocaleTimeString()}. Priority position is preserved.
              </div>
            </div>
          )}
        </div>

        {/* Right: Quick Demo Queue List */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Active Queue ({waitingEntries.length})
            </h3>
            <span className="text-2xs text-slate-400">Tap to Scan</span>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {waitingEntries.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">
                No active tickets in queue.
              </div>
            ) : (
              waitingEntries.map((e) => (
                <div
                  key={e.id}
                  className="p-2.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50/60 transition-colors flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-slate-900">
                        {e.tokenNumber}
                      </span>
                      <span
                        className={`text-2xs font-semibold px-1.5 py-0.2 rounded font-mono ${
                          e.checkedIn
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {e.checkedIn ? 'Checked In' : 'Not Checked In'}
                      </span>
                    </div>
                    <div className="text-2xs text-slate-500 truncate max-w-[140px]">
                      {e.customerName} · Pos #{e.queuePosition}
                    </div>
                  </div>

                  {!e.checkedIn ? (
                    <button
                      onClick={() => handleSimulateQrScan(e.tokenNumber)}
                      className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded text-2xs font-semibold transition-colors flex items-center gap-1"
                    >
                      <Camera className="w-3 h-3" />
                      <span>Scan QR</span>
                    </button>
                  ) : (
                    <span className="text-2xs font-medium text-emerald-600 flex items-center gap-0.5">
                      <UserCheck className="w-3 h-3" />
                      <span>Present</span>
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
