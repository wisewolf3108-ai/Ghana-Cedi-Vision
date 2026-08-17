import React from 'react';
import { Camera, Volume2, Repeat, Play, Pause, Mic, MicOff, Zap, ZapOff } from 'lucide-react';
import { ContrastTheme } from '../types';

interface ScanControlsProps {
  theme: ContrastTheme;
  isScanning: boolean;
  isContinuous: boolean;
  isVoiceListening: boolean;
  hasLastResult: boolean;
  hasTorch: boolean;
  isTorchOn: boolean;
  onScan: () => void;
  onRepeat: () => void;
  onToggleContinuous: () => void;
  onToggleVoice: () => void;
  onToggleTorch: () => void;
}

export const ScanControls: React.FC<ScanControlsProps> = ({
  theme,
  isScanning,
  isContinuous,
  isVoiceListening,
  hasLastResult,
  hasTorch,
  isTorchOn,
  onScan,
  onRepeat,
  onToggleContinuous,
  onToggleVoice,
  onToggleTorch,
}) => {
  const isLight = theme === 'light' || theme === 'black-on-white';

  // Theme specific button styles for accessibility
  const getMainScanBtnStyle = () => {
    if (theme === 'yellow-on-black') {
      return 'bg-yellow-400 text-black hover:bg-yellow-300 active:bg-yellow-500 border-4 border-yellow-200';
    }
    if (theme === 'cyan-on-black') {
      return 'bg-cyan-400 text-black hover:bg-cyan-300 active:bg-cyan-500 border-4 border-cyan-200';
    }
    if (theme === 'white-on-black') {
      return 'bg-white text-black hover:bg-slate-200 active:bg-slate-300 border-4 border-slate-400';
    }
    if (theme === 'black-on-white') {
      return 'bg-black text-white hover:bg-slate-800 active:bg-slate-900 border-4 border-black';
    }
    if (theme === 'light') {
      return 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 border-4 border-blue-500 shadow-xl shadow-blue-600/25';
    }
    // GFD Standard Blue theme
    return 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 border-4 border-blue-400 shadow-xl shadow-blue-600/30';
  };

  return (
    <div className="w-full flex flex-col gap-4 mt-2" role="group" aria-label="Scanner controls">
      {/* Primary Massive Scan Button */}
      <button
        id="main-scan-button"
        onClick={onScan}
        disabled={isScanning}
        aria-label={isScanning ? 'Scanning banknote in progress' : 'Scan Ghana Cedi banknote now. Shortcut: Space or Enter key'}
        className={`w-full py-6 px-8 rounded-3xl font-black text-2xl sm:text-3xl flex items-center justify-center gap-4 transition-all transform active:scale-98 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed select-none ${getMainScanBtnStyle()}`}
      >
        {isScanning ? (
          <>
            <div className="w-8 h-8 border-4 border-current border-t-transparent rounded-full animate-spin" />
            <span>Scanning Note...</span>
          </>
        ) : (
          <>
            <Camera className="w-9 h-9 sm:w-10 sm:h-10 shrink-0" strokeWidth={2.5} />
            <span>SCAN NOTE (TAP HERE)</span>
          </>
        )}
      </button>

      {/* Secondary Action Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Repeat Last Announcement Button */}
        <button
          id="repeat-audio-btn"
          onClick={onRepeat}
          disabled={!hasLastResult}
          aria-label="Repeat last recognized banknote result aloud"
          className={`min-h-[56px] px-3 py-2.5 rounded-2xl active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed border-2 flex flex-col sm:flex-row items-center justify-center gap-1.5 text-center transition-all ${
            isLight
              ? 'bg-white hover:bg-slate-50 text-slate-900 border-slate-300 shadow-sm'
              : 'bg-slate-800 text-white hover:bg-slate-700 border-slate-700'
          }`}
        >
          <Repeat className="w-5 h-5 text-amber-500 dark:text-yellow-400 shrink-0" />
          <span className="font-bold text-xs sm:text-sm">Repeat Result</span>
        </button>

        {/* Continuous Scanning Mode */}
        <button
          id="continuous-scan-btn"
          onClick={onToggleContinuous}
          aria-pressed={isContinuous}
          aria-label={isContinuous ? 'Continuous auto-scanning active. Tap to pause.' : 'Start continuous auto-scanning mode'}
          className={`min-h-[56px] px-3 py-2.5 rounded-2xl border-2 flex flex-col sm:flex-row items-center justify-center gap-1.5 text-center transition-all ${
            isContinuous
              ? 'bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-600/30'
              : isLight
              ? 'bg-white hover:bg-slate-50 text-slate-900 border-slate-300 shadow-sm'
              : 'bg-slate-800 text-white hover:bg-slate-700 border-slate-700'
          }`}
        >
          {isContinuous ? (
            <>
              <Pause className="w-5 h-5 text-white shrink-0 animate-pulse" />
              <span className="font-bold text-xs sm:text-sm">Auto-Scan: ON</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="font-bold text-xs sm:text-sm">Auto-Scan</span>
            </>
          )}
        </button>

        {/* Voice Assistant Mic Toggle */}
        <button
          id="voice-command-btn"
          onClick={onToggleVoice}
          aria-pressed={isVoiceListening}
          aria-label={isVoiceListening ? 'Voice commands active. Say scan, repeat, or help.' : 'Enable voice commands microphone'}
          className={`min-h-[56px] px-3 py-2.5 rounded-2xl border-2 flex flex-col sm:flex-row items-center justify-center gap-1.5 text-center transition-all ${
            isVoiceListening
              ? 'bg-purple-700 text-white border-purple-400 shadow-md shadow-purple-600/30'
              : isLight
              ? 'bg-white hover:bg-slate-50 text-slate-900 border-slate-300 shadow-sm'
              : 'bg-slate-800 text-white hover:bg-slate-700 border-slate-700'
          }`}
        >
          {isVoiceListening ? (
            <>
              <Mic className="w-5 h-5 text-pink-300 shrink-0 animate-bounce" />
              <span className="font-bold text-xs sm:text-sm">Voice: Listening</span>
            </>
          ) : (
            <>
              <MicOff className="w-5 h-5 text-slate-500 dark:text-slate-400 shrink-0" />
              <span className="font-bold text-xs sm:text-sm">Voice Control</span>
            </>
          )}
        </button>

        {/* Flashlight / Torch Button */}
        {hasTorch ? (
          <button
            id="controls-torch-btn"
            onClick={onToggleTorch}
            aria-pressed={isTorchOn}
            aria-label={isTorchOn ? 'Turn flashlight off' : 'Turn flashlight on for low lighting'}
            className={`min-h-[56px] px-3 py-2.5 rounded-2xl border-2 flex flex-col sm:flex-row items-center justify-center gap-1.5 text-center transition-all ${
              isTorchOn
                ? 'bg-amber-500 text-black border-amber-300 shadow-md'
                : isLight
                ? 'bg-white hover:bg-slate-50 text-slate-900 border-slate-300 shadow-sm'
                : 'bg-slate-800 text-white hover:bg-slate-700 border-slate-700'
            }`}
          >
            {isTorchOn ? (
              <>
                <Zap className="w-5 h-5 fill-current shrink-0" />
                <span className="font-bold text-xs sm:text-sm">Torch: ON</span>
              </>
            ) : (
              <>
                <ZapOff className="w-5 h-5 text-amber-500 dark:text-amber-400 shrink-0" />
                <span className="font-bold text-xs sm:text-sm">Flashlight</span>
              </>
            )}
          </button>
        ) : (
          <div
            className={`min-h-[56px] px-3 py-2.5 rounded-2xl border-2 flex flex-col sm:flex-row items-center justify-center gap-1.5 text-center text-xs ${
              isLight
                ? 'bg-slate-100 text-slate-500 border-slate-200'
                : 'bg-slate-800/50 text-slate-400 border-slate-800'
            }`}
          >
            <Volume2 className="w-5 h-5 text-slate-400" />
            <span>Audio Ready</span>
          </div>
        )}
      </div>

      {/* Keyboard navigation helper */}
      <div className={`hidden sm:flex justify-between items-center text-xs px-2 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
        <span>Keyboard: <kbd className={`px-2 py-0.5 border rounded ${isLight ? 'bg-slate-200 border-slate-300 text-slate-900 font-bold' : 'bg-slate-800 border-slate-700 text-slate-200'}`}>Space</kbd> Scan</span>
        <span><kbd className={`px-2 py-0.5 border rounded ${isLight ? 'bg-slate-200 border-slate-300 text-slate-900 font-bold' : 'bg-slate-800 border-slate-700 text-slate-200'}`}>R</kbd> Repeat</span>
        <span><kbd className={`px-2 py-0.5 border rounded ${isLight ? 'bg-slate-200 border-slate-300 text-slate-900 font-bold' : 'bg-slate-800 border-slate-700 text-slate-200'}`}>C</kbd> Auto-Scan</span>
        <span><kbd className={`px-2 py-0.5 border rounded ${isLight ? 'bg-slate-200 border-slate-300 text-slate-900 font-bold' : 'bg-slate-800 border-slate-700 text-slate-200'}`}>V</kbd> Voice Mic</span>
        <span><kbd className={`px-2 py-0.5 border rounded ${isLight ? 'bg-slate-200 border-slate-300 text-slate-900 font-bold' : 'bg-slate-800 border-slate-700 text-slate-200'}`}>L</kbd> Light/Dark</span>
      </div>
    </div>
  );
};
