import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { Camera, CameraOff, RefreshCw, Zap, ZapOff, AlertCircle } from 'lucide-react';
import { ContrastTheme } from '../types';

export interface CameraScannerRef {
  captureFrame: () => string | null;
  toggleTorch: () => Promise<boolean>;
  flipCamera: () => void;
  isReady: boolean;
  hasTorch: boolean;
  isTorchOn: boolean;
}

interface CameraScannerProps {
  theme: ContrastTheme;
  isScanning: boolean;
  onCameraReady?: () => void;
  onError?: (errorMessage: string) => void;
}

export const CameraScanner = forwardRef<CameraScannerRef, CameraScannerProps>(
  ({ theme, isScanning, onCameraReady, onError }, ref) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const [isReady, setIsReady] = useState(false);
    const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
    const [hasTorch, setHasTorch] = useState(false);
    const [isTorchOn, setIsTorchOn] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);

    // Initialize Camera Stream
    const startCamera = async (mode: 'environment' | 'user') => {
      setIsReady(false);
      setCameraError(null);

      // Stop existing tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        const errMsg = 'Camera access is not supported by your browser. Please use the Sample Notes buttons below.';
        setCameraError(errMsg);
        if (onError) onError(errMsg);
        return;
      }

      try {
        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: { ideal: mode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', 'true');
          videoRef.current.muted = true;
          try {
            const playPromise = videoRef.current.play();
            if (playPromise !== undefined) {
              await playPromise;
            }
          } catch (playErr: any) {
            // AbortError is normal when stream/element reloads
            if (playErr.name !== 'AbortError') {
              console.warn('Video playback warning:', playErr);
            }
          }
        }

        // Check for torch capability
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) {
          const capabilities: any = videoTrack.getCapabilities ? videoTrack.getCapabilities() : {};
          setHasTorch(Boolean(capabilities.torch));
        }

        setIsReady(true);
        if (onCameraReady) onCameraReady();
      } catch (err: any) {
        if (err.name === 'AbortError') return;

        console.warn('Camera initialization notice:', err?.name || err);
        const errMsg =
          err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
            ? 'Camera permission was not granted. You can allow camera in browser settings or use the Banknote Test Samples below.'
            : 'Camera could not be started in this environment. You can test recognition with the Sample Banknotes below.';
        setCameraError(errMsg);
        if (onError) onError(errMsg);
      }
    };

    useEffect(() => {
      let isMounted = true;
      startCamera(facingMode);
      return () => {
        isMounted = false;
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }
      };
    }, [facingMode]);

    // Imperative methods exposed to parent
    useImperativeHandle(ref, () => ({
      captureFrame: () => {
        if (!videoRef.current || !canvasRef.current || !isReady) {
          return null;
        }

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        // Resize frame to 768px width (as specified in requirements) for optimal payload speed
        const targetWidth = 768;
        const scale = targetWidth / video.videoWidth;
        const targetHeight = Math.round(video.videoHeight * scale);

        canvas.width = targetWidth;
        canvas.height = targetHeight;

        ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
        return canvas.toDataURL('image/jpeg', 0.85);
      },
      toggleTorch: async () => {
        if (!streamRef.current) return false;
        const track = streamRef.current.getVideoTracks()[0];
        if (!track) return false;

        try {
          const newStatus = !isTorchOn;
          await (track as any).applyConstraints({
            advanced: [{ torch: newStatus }],
          });
          setIsTorchOn(newStatus);
          return newStatus;
        } catch (e) {
          console.warn('Torch toggle not supported on this track', e);
          return false;
        }
      },
      flipCamera: () => {
        setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
      },
      isReady,
      hasTorch,
      isTorchOn,
    }));

    // Theme border color helpers
    const getBorderColor = () => {
      if (theme === 'yellow-on-black') return 'border-yellow-400';
      if (theme === 'cyan-on-black') return 'border-cyan-400';
      if (theme === 'white-on-black') return 'border-white';
      return 'border-blue-600';
    };

    return (
      <div
        className="relative w-full aspect-[4/3] sm:aspect-[16/9] max-h-[460px] bg-black rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center border-4 border-slate-700"
        aria-label="Live camera viewfinder"
        role="region"
      >
        {/* Hidden Canvas for capture processing */}
        <canvas ref={canvasRef} className="hidden" aria-hidden="true" />

        {/* Video Element */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isReady ? 'opacity-100' : 'opacity-0'
          }`}
          aria-label="Banknote camera feed"
        />

        {/* Loading / Starting Indicator */}
        {!isReady && !cameraError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 text-white p-4 text-center z-10">
            <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-lg font-bold">Activating Rear Camera...</p>
            <p className="text-sm text-slate-400 mt-1">Please allow camera permissions if prompted.</p>
          </div>
        )}

        {/* Error Fallback */}
        {cameraError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-white p-6 text-center z-10">
            <AlertCircle className="w-12 h-12 text-yellow-400 mb-3" />
            <p className="text-lg font-bold text-yellow-300 mb-2">Camera Unavailable</p>
            <p className="text-sm text-slate-300 max-w-md mb-4">{cameraError}</p>
            <button
              id="retry-camera-btn"
              onClick={() => startCamera(facingMode)}
              className="px-5 py-3 bg-yellow-400 text-black font-bold rounded-xl text-base flex items-center gap-2 hover:bg-yellow-300 active:scale-95 transition-transform"
            >
              <RefreshCw className="w-5 h-5" /> Retry Camera
            </button>
          </div>
        )}

        {/* Accessible Target Viewfinder Frame */}
        {isReady && (
          <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between">
            {/* Top Bar inside Viewfinder */}
            <div className="flex justify-between items-center bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg w-fit text-xs text-white font-mono uppercase tracking-wider">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Camera ({facingMode === 'environment' ? 'Rear' : 'Front'})
              </span>
            </div>

            {/* Viewfinder Target Reticle */}
            <div className="relative w-full h-[65%] mx-auto flex items-center justify-center">
              <div
                className={`w-[90%] h-[90%] border-4 border-dashed ${getBorderColor()} rounded-2xl flex items-center justify-center transition-colors duration-300 ${
                  isScanning ? 'scale-105 border-yellow-300 shadow-[0_0_30px_rgba(234,179,8,0.5)]' : 'opacity-85'
                }`}
              >
                {/* Visual guideline text */}
                <div className="text-center bg-black/75 px-4 py-2 rounded-xl text-white font-medium text-sm sm:text-base border border-white/20">
                  {isScanning ? (
                    <span className="text-yellow-400 font-bold flex items-center gap-2">
                      <span className="w-3 h-3 bg-yellow-400 rounded-full animate-ping" />
                      Scanning Banknote...
                    </span>
                  ) : (
                    'Align Ghana Cedi Banknote in Frame'
                  )}
                </div>
              </div>
            </div>

            {/* Bottom helper info */}
            <div className="text-center text-xs sm:text-sm text-slate-300 bg-black/60 py-1 px-3 rounded-lg mx-auto">
              Hold note approx. 15–20 cm (6–8 inches) away
            </div>
          </div>
        )}

        {/* Quick Camera Action Buttons Overlay */}
        {isReady && (
          <div className="absolute top-3 right-3 flex items-center gap-2 z-20">
            {hasTorch && (
              <button
                id="torch-toggle-btn"
                onClick={async () => {
                  if (streamRef.current) {
                    const track = streamRef.current.getVideoTracks()[0];
                    if (track) {
                      const next = !isTorchOn;
                      await (track as any).applyConstraints({ advanced: [{ torch: next }] });
                      setIsTorchOn(next);
                    }
                  }
                }}
                className={`p-2.5 rounded-xl text-white font-bold backdrop-blur-md transition-all ${
                  isTorchOn ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/40' : 'bg-black/60 hover:bg-black/80'
                }`}
                title={isTorchOn ? 'Turn Flashlight Off' : 'Turn Flashlight On'}
                aria-label={isTorchOn ? 'Turn Flashlight Off' : 'Turn Flashlight On'}
              >
                {isTorchOn ? <Zap className="w-5 h-5 fill-current" /> : <ZapOff className="w-5 h-5" />}
              </button>
            )}

            <button
              id="flip-camera-btn"
              onClick={() => setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))}
              className="p-2.5 rounded-xl bg-black/60 hover:bg-black/80 text-white font-bold backdrop-blur-md transition-all active:scale-95"
              title="Flip to Front/Rear Camera"
              aria-label="Flip camera"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    );
  }
);
CameraScanner.displayName = 'CameraScanner';
