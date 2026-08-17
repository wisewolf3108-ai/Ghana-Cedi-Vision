import React from 'react';
import { X, Sliders, Volume2, Eye, Vibrate, Mic, Check, Sun, Moon } from 'lucide-react';
import { UserPreferences, ContrastTheme } from '../types';
import { speak } from '../utils/speech';

interface AccessibilitySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: UserPreferences;
  onUpdatePreferences: (updated: Partial<UserPreferences>) => void;
}

export const AccessibilitySettingsModal: React.FC<AccessibilitySettingsModalProps> = ({
  isOpen,
  onClose,
  preferences,
  onUpdatePreferences,
}) => {
  React.useEffect(() => {
    if (isOpen) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isLight = preferences.theme === 'light' || preferences.theme === 'black-on-white';

  const themes: { id: ContrastTheme; label: string; desc: string; previewBg: string; previewText: string }[] = [
    {
      id: 'light',
      label: 'Daylight Light Mode',
      desc: 'Crisp white canvas with rich dark slate typography & high clarity',
      previewBg: 'bg-white',
      previewText: 'text-blue-700',
    },
    {
      id: 'standard',
      label: 'Standard Dark Slate',
      desc: 'Balanced high clarity dark mode with cobalt accents',
      previewBg: 'bg-slate-900',
      previewText: 'text-blue-400',
    },
    {
      id: 'yellow-on-black',
      label: 'High-Contrast Yellow on Black',
      desc: 'Optimized for low-vision, cataracts, and tritanopia',
      previewBg: 'bg-black',
      previewText: 'text-yellow-400',
    },
    {
      id: 'cyan-on-black',
      label: 'High-Contrast Cyan on Black',
      desc: 'High optical vibrancy for glare reduction',
      previewBg: 'bg-black',
      previewText: 'text-cyan-400',
    },
    {
      id: 'white-on-black',
      label: 'Monochrome White on Black',
      desc: 'Maximum WCAG AAA luminance contrast ratio (21:1)',
      previewBg: 'bg-black',
      previewText: 'text-white',
    },
    {
      id: 'black-on-white',
      label: 'High-Contrast Black on White',
      desc: 'Maximum luminance contrast light mode for high daylight glare',
      previewBg: 'bg-white',
      previewText: 'text-black',
    },
  ];

  const handleTestSpeech = (rate: number, pitch: number) => {
    speak('This is a test of the speech voice synthesis.', { rate, pitch, interrupt: true });
  };

  const handleToggleLightDark = () => {
    const nextTheme: ContrastTheme = isLight ? 'standard' : 'light';
    onUpdatePreferences({ theme: nextTheme });
    speak(isLight ? 'Switched to dark mode' : 'Switched to light mode', { interrupt: true });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="accessibility-settings-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`relative w-full max-w-2xl max-h-[90vh] border-2 sm:border-4 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${
          isLight
            ? 'bg-white border-slate-300 text-slate-900'
            : 'bg-slate-900 border-slate-700 text-white'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between gap-3 p-4 sm:p-5 border-b shrink-0 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center font-bold shrink-0 ${
                isLight ? 'bg-amber-100 text-amber-700' : 'bg-slate-800 text-yellow-400'
              }`}
            >
              <Sliders className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <h2
                id="accessibility-settings-title"
                className={`text-lg sm:text-xl font-black leading-tight ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                Accessibility & Themes
              </h2>
              <p
                className={`text-[11px] sm:text-xs font-semibold uppercase tracking-wider ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                Light/Dark Mode, Contrast, Voice & Audio
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl sm:rounded-2xl font-bold transition-colors ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
            }`}
            aria-label="Close settings dialog"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5 overscroll-contain">
          {/* Quick Light / Dark Mode Toggle Hero Banner */}
          <div
            className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border flex items-center justify-between gap-4 ${
              isLight
                ? 'bg-amber-50/80 border-amber-200'
                : 'bg-slate-950/80 border-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  isLight ? 'bg-amber-100 text-amber-700' : 'bg-slate-800 text-yellow-400'
                }`}
              >
                {isLight ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </div>
              <div>
                <span className={`font-black text-sm block ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Theme Mode: {isLight ? 'Light Mode (Daylight)' : 'Dark Mode (Night)'}
                </span>
                <span className={`text-xs block ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  Shortcut: Press <strong>L</strong> anywhere on keyboard to toggle
                </span>
              </div>
            </div>

            <button
              onClick={handleToggleLightDark}
              className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-sm ${
                isLight
                  ? 'bg-slate-900 text-white hover:bg-slate-800'
                  : 'bg-yellow-400 text-black hover:bg-yellow-300'
              }`}
            >
              {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              <span>{isLight ? 'Switch to Dark' : 'Switch to Light'}</span>
            </button>
          </div>

          {/* Theme Selector Grid */}
          <div className="flex flex-col gap-2.5 sm:gap-3">
            <label
              className={`text-xs sm:text-sm font-bold flex items-center gap-2 ${
                isLight ? 'text-slate-800' : 'text-slate-200'
              }`}
            >
              <Eye className={`w-4 h-4 ${isLight ? 'text-amber-600' : 'text-yellow-400'}`} /> Contrast & Display Presets
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
              {themes.map((t) => {
                const isSelected = preferences.theme === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      onUpdatePreferences({ theme: t.id });
                      speak(`Selected ${t.label}`, { interrupt: true });
                    }}
                    className={`p-3 rounded-xl sm:rounded-2xl border-2 text-left flex items-start justify-between gap-2.5 transition-all ${
                      isSelected
                        ? isLight
                          ? 'border-blue-600 bg-blue-50/70 shadow-md ring-2 ring-blue-500/20'
                          : 'border-yellow-400 bg-slate-800 shadow-md'
                        : isLight
                        ? 'border-slate-200 bg-slate-50 hover:border-slate-300'
                        : 'border-slate-800 bg-slate-950/70 hover:border-slate-700'
                    }`}
                  >
                    <div className="min-w-0">
                      <span className={`font-black text-xs sm:text-sm block ${t.previewText}`}>
                        {t.label}
                      </span>
                      <span
                        className={`text-[10px] sm:text-[11px] block mt-0.5 leading-snug ${
                          isLight ? 'text-slate-500' : 'text-slate-400'
                        }`}
                      >
                        {t.desc}
                      </span>
                    </div>
                    {isSelected && (
                      <div
                        className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          isLight ? 'bg-blue-600 text-white' : 'bg-yellow-400 text-black'
                        }`}
                      >
                        <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Speech Rate Slider */}
          <div
            className={`flex flex-col gap-2.5 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/70 border-slate-800'
            }`}
          >
            <div className="flex justify-between items-center">
              <label
                htmlFor="speech-rate-input"
                className={`text-xs sm:text-sm font-bold flex items-center gap-2 ${
                  isLight ? 'text-slate-800' : 'text-slate-200'
                }`}
              >
                <Volume2 className={`w-4 h-4 ${isLight ? 'text-amber-600' : 'text-yellow-400'}`} /> Speech Rate / Speed
              </label>
              <span
                className={`text-xs font-mono font-bold ${
                  isLight ? 'text-blue-700' : 'text-yellow-400'
                }`}
              >
                {preferences.speechRate.toFixed(2)}x
              </span>
            </div>
            <input
              id="speech-rate-input"
              type="range"
              min="0.7"
              max="1.5"
              step="0.05"
              value={preferences.speechRate}
              onChange={(e) => {
                const newRate = parseFloat(e.target.value);
                onUpdatePreferences({ speechRate: newRate });
              }}
              className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-yellow-500"
            />
            <div
              className={`flex justify-between items-center text-[10px] sm:text-[11px] ${
                isLight ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              <span>0.7x (Slower)</span>
              <button
                onClick={() => handleTestSpeech(preferences.speechRate, preferences.speechPitch)}
                className={`font-bold hover:underline ${
                  isLight ? 'text-blue-700' : 'text-yellow-400'
                }`}
              >
                Test Voice Speed
              </button>
              <span>1.5x (Faster)</span>
            </div>
          </div>

          {/* Continuous Scan Frequency */}
          <div
            className={`flex flex-col gap-2.5 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/70 border-slate-800'
            }`}
          >
            <div className="flex justify-between items-center">
              <label
                htmlFor="continuous-interval-input"
                className={`text-xs sm:text-sm font-bold ${
                  isLight ? 'text-slate-800' : 'text-slate-200'
                }`}
              >
                Continuous Auto-Scan Interval
              </label>
              <span
                className={`text-xs font-mono font-bold ${
                  isLight ? 'text-blue-700' : 'text-yellow-400'
                }`}
              >
                Every {preferences.continuousIntervalSec} seconds
              </span>
            </div>
            <input
              id="continuous-interval-input"
              type="range"
              min="3"
              max="8"
              step="1"
              value={preferences.continuousIntervalSec}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                onUpdatePreferences({ continuousIntervalSec: val });
              }}
              className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-yellow-500"
            />
            <span
              className={`text-[10px] sm:text-[11px] leading-snug ${
                isLight ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              Allows time to flip or align new notes between automatic camera captures.
            </span>
          </div>

          {/* Toggles: Audio Effects, Haptic Feedback */}
          <div className="flex flex-col gap-2 sm:gap-2.5">
            {/* Audio Effects Toggle */}
            <label
              className={`flex items-center justify-between p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border cursor-pointer transition-colors ${
                isLight
                  ? 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Volume2
                  className={`w-5 h-5 shrink-0 ${isLight ? 'text-amber-600' : 'text-yellow-400'}`}
                />
                <div className="min-w-0">
                  <span
                    className={`font-bold text-xs sm:text-sm block truncate ${
                      isLight ? 'text-slate-900' : 'text-white'
                    }`}
                  >
                    Earcons & Sound Cues
                  </span>
                  <span
                    className={`text-[10px] sm:text-xs block truncate ${
                      isLight ? 'text-slate-500' : 'text-slate-400'
                    }`}
                  >
                    Distinct chimes, beeps and warning tones
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences.soundEffects}
                onChange={(e) => onUpdatePreferences({ soundEffects: e.target.checked })}
                className="w-5 h-5 sm:w-6 sm:h-6 rounded accent-yellow-500 cursor-pointer shrink-0 ml-2"
                aria-label="Toggle sound effects"
              />
            </label>

            {/* Haptic Vibration Toggle */}
            <label
              className={`flex items-center justify-between p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border cursor-pointer transition-colors ${
                isLight
                  ? 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Vibrate
                  className={`w-5 h-5 shrink-0 ${isLight ? 'text-amber-600' : 'text-yellow-400'}`}
                />
                <div className="min-w-0">
                  <span
                    className={`font-bold text-xs sm:text-sm block truncate ${
                      isLight ? 'text-slate-900' : 'text-white'
                    }`}
                  >
                    Haptic Vibrations
                  </span>
                  <span
                    className={`text-[10px] sm:text-xs block truncate ${
                      isLight ? 'text-slate-500' : 'text-slate-400'
                    }`}
                  >
                    Tactile vibration on successful note scans
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences.hapticFeedback}
                onChange={(e) => onUpdatePreferences({ hapticFeedback: e.target.checked })}
                className="w-5 h-5 sm:w-6 sm:h-6 rounded accent-yellow-500 cursor-pointer shrink-0 ml-2"
                aria-label="Toggle haptic feedback"
              />
            </label>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`p-3.5 sm:p-4 border-t shrink-0 flex justify-end ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/95 border-slate-800'
          }`}
        >
          <button
            onClick={onClose}
            className={`w-full sm:w-auto px-6 py-2.5 sm:py-3 font-black text-sm sm:text-base rounded-xl active:scale-95 transition-transform ${
              isLight
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-yellow-400 text-black hover:bg-yellow-300'
            }`}
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};
