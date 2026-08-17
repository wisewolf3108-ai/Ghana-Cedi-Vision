import React, { useEffect } from 'react';
import { Volume2, X, CheckCircle, Hand, Smartphone, Sparkles, Bell, HelpCircle } from 'lucide-react';
import { speak, stopSpeaking } from '../utils/speech';
import { playSuccessChime, playWarningTone, playScanBlip, triggerHaptic } from '../utils/audio';
import { ContrastTheme } from '../types';

interface AudioOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: ContrastTheme;
}

export const AudioOnboardingModal: React.FC<AudioOnboardingModalProps> = ({ isOpen, onClose, theme = 'standard' }) => {
  const isLight = theme === 'light' || theme === 'black-on-white';

  useEffect(() => {
    if (isOpen) {
      const fullWelcomeText =
        'Welcome to Ghana Cedi Vision, developed for the Ghana Federation of Disability Organizations. Here is how to use the app: Step 1: Hold your banknote flat on a table or in your hand, about 15 to 20 centimeters from your phone camera. Step 2: Tap the huge Scan Note button at the bottom, or say Scan if voice control is active. Step 3: Listen for the announcement. A pleasant double chime means successful high-confidence detection. A low warning tone means you should reposition the note. Tap Close or press Escape when you are ready to scan.';
      speak(fullWelcomeText, { interrupt: true });

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    } else {
      stopSpeaking();
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`relative w-full max-w-2xl max-h-[90vh] border-2 sm:border-4 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${
          isLight
            ? 'bg-white border-yellow-500 text-slate-900'
            : 'bg-slate-900 border-yellow-400 text-white'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between gap-3 p-4 sm:p-5 border-b shrink-0 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-yellow-400 text-black flex items-center justify-center font-bold shrink-0">
              <HelpCircle className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <h2
                id="onboarding-modal-title"
                className={`text-lg sm:text-xl font-black leading-tight ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                Audio Guide & Tutorial
              </h2>
              <p className={`text-[11px] sm:text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-amber-700' : 'text-yellow-400'}`}>
                Ghana Federation of Disability Organizations (GFD)
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
            aria-label="Close tutorial dialog"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 overscroll-contain">
          {/* Narrate Again button banner */}
          <div
            className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border ${
              isLight
                ? 'bg-amber-50 border-amber-200 text-slate-800'
                : 'bg-slate-800/80 border-slate-700 text-slate-300'
            }`}
          >
            <span className="text-xs font-medium">Spoken tutorial is playing aloud</span>
            <button
              onClick={() => {
                speak(
                  'Hold note flat 15 to 20 centimeters from phone. Tap large Scan button or say Scan. Listen for denomination announcement.',
                  { interrupt: true }
                );
              }}
              className="px-3.5 py-1.5 sm:py-2 bg-yellow-400 text-black font-bold text-xs rounded-xl flex items-center gap-2 hover:bg-yellow-300 active:scale-95 transition-transform shrink-0"
            >
              <Volume2 className="w-4 h-4" /> Replay Narration
            </button>
          </div>

          {/* Step 1 */}
          <div
            className={`flex items-start gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/70 border-slate-800'
            }`}
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-blue-600/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black shrink-0 text-sm sm:text-base">
              1
            </div>
            <div>
              <h3 className={`font-bold text-sm sm:text-base ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Position the Banknote
              </h3>
              <p className={`text-xs sm:text-sm mt-0.5 sm:mt-1 leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                Place the banknote flat on a table, counter, or across your hand. Hold your phone about <strong>15 to 20 cm (6–8 inches)</strong> directly above the note.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div
            className={`flex items-start gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/70 border-slate-800'
            }`}
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-yellow-400/30 text-yellow-600 dark:text-yellow-400 flex items-center justify-center font-black shrink-0 text-sm sm:text-base">
              2
            </div>
            <div>
              <h3 className={`font-bold text-sm sm:text-base ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Scan with Single Tap or Voice
              </h3>
              <p className={`text-xs sm:text-sm mt-0.5 sm:mt-1 leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                Tap anywhere on the large <strong>SCAN NOTE</strong> button at the bottom, press <strong>Spacebar</strong>, or simply say <em>"Scan"</em> into your microphone.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div
            className={`flex items-start gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/70 border-slate-800'
            }`}
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-emerald-600/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black shrink-0 text-sm sm:text-base">
              3
            </div>
            <div>
              <h3 className={`font-bold text-sm sm:text-base ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Listen for the Immediate Audio Announcement
              </h3>
              <p className={`text-xs sm:text-sm mt-0.5 sm:mt-1 leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                The app immediately speaks the denomination name (e.g. <em>"10 Ghana Cedis"</em>) alongside key security and historical details.
              </p>
            </div>
          </div>

          {/* Audio Chimes Legend */}
          <div
            className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border flex flex-col gap-2.5 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/70 border-slate-800'
            }`}
          >
            <h3 className={`font-bold text-xs sm:text-sm flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              <Bell className="w-4 h-4 text-yellow-500" /> Sound Effects & Audio Cues
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={() => playSuccessChime()}
                className={`p-2.5 rounded-xl border flex items-center justify-between text-left transition-colors ${
                  isLight
                    ? 'bg-white border-slate-200 hover:border-slate-300'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <span className="font-bold text-xs text-emerald-600 dark:text-emerald-400 block">Double Chime</span>
                  <span className={`text-[10px] block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    High confidence detection
                  </span>
                </div>
                <Volume2 className="w-4 h-4 text-emerald-500 shrink-0" />
              </button>

              <button
                onClick={() => playWarningTone()}
                className={`p-2.5 rounded-xl border flex items-center justify-between text-left transition-colors ${
                  isLight
                    ? 'bg-white border-slate-200 hover:border-slate-300'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <span className="font-bold text-xs text-amber-600 dark:text-amber-400 block">Warning Low Tone</span>
                  <span className={`text-[10px] block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Note not detected / Reposition
                  </span>
                </div>
                <Volume2 className="w-4 h-4 text-amber-500 shrink-0" />
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          className={`p-3.5 sm:p-4 border-t shrink-0 flex justify-end ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/95 border-slate-800'
          }`}
        >
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 sm:py-3 bg-yellow-400 text-black font-black text-sm sm:text-base rounded-xl hover:bg-yellow-300 active:scale-95 transition-transform"
          >
            I'm Ready to Scan
          </button>
        </div>
      </div>
    </div>
  );
};
