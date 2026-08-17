import React from 'react';
import { X, Fingerprint, Volume2, ShieldCheck } from 'lucide-react';
import { GHANA_CEDI_BANKNOTES } from '../utils/banknoteData';
import { Denomination, ContrastTheme } from '../types';
import { speak } from '../utils/speech';

interface TactileGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: ContrastTheme;
}

export const TactileGuideModal: React.FC<TactileGuideModalProps> = ({ isOpen, onClose, theme = 'standard' }) => {
  const isLight = theme === 'light' || theme === 'black-on-white';

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

  const denoms: Denomination[] = ['1', '2', '5', '10', '20', '50', '100', '200'];

  const handleSpeakDenomTactile = (denom: Denomination) => {
    const info = GHANA_CEDI_BANKNOTES[denom];
    if (info) {
      speak(
        `${info.spokenName}: True dimensions ${info.dimensions}. Status: ${info.circulationStatus}. ${info.tactileDescription}. Color is ${info.colorName}. Reverse features ${info.reverseBack}.`,
        { interrupt: true }
      );
    }
  };

  const handleSpeakAllGuide = () => {
    speak(
      'Bank of Ghana Banknote Dimensions and Circulation Guide: One Cedi is 137 mm by 65 mm, phasing out for coin. Two Cedis is 140 mm by 67 mm, phasing out for coin. Five Cedis is 141 mm by 68 mm, active circulation. Ten Cedis is 145 mm by 71 mm, active circulation. Twenty Cedis is 149 mm by 74 mm, active circulation. Fifty Cedis is 152 mm by 78 mm, active circulation. One Hundred Cedis is 156 mm by 81 mm, active circulation, largest size. Two Hundred Cedis is 156 mm by 81 mm, active circulation, largest size.',
      { interrupt: true }
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tactile-guide-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`relative w-full max-w-3xl max-h-[90vh] border-2 sm:border-4 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${
          isLight
            ? 'bg-white border-blue-400 text-slate-900'
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
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
              <Fingerprint className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <h2
                id="tactile-guide-title"
                className={`text-lg sm:text-xl font-black leading-tight ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                Bank of Ghana Tactile Guide
              </h2>
              <p className={`text-[11px] sm:text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-blue-600' : 'text-blue-400'}`}>
                Raised Marks & Physical Verification
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
            aria-label="Close tactile guide dialog"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 overscroll-contain">
          {/* Action Header Banner */}
          <div
            className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border ${
              isLight
                ? 'bg-blue-50 border-blue-200 text-slate-800'
                : 'bg-slate-800/80 border-slate-700 text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Features include intaglio raised printing, tactile shape marks, and stepped banknote lengths.</span>
            </div>
            <button
              onClick={handleSpeakAllGuide}
              className="px-3.5 py-1.5 sm:py-2 bg-yellow-400 text-black font-bold text-xs rounded-xl flex items-center gap-2 hover:bg-yellow-300 shrink-0 active:scale-95 transition-transform"
            >
              <Volume2 className="w-4 h-4" /> Listen to All Marks
            </button>
          </div>

          {/* Banknote List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {denoms.map((d) => {
              const info = GHANA_CEDI_BANKNOTES[d];
              if (!info) return null;

              return (
                <div
                  key={d}
                  className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border flex items-start justify-between gap-3 transition-colors ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 hover:border-blue-400'
                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex flex-col items-center justify-center font-black text-white shrink-0 shadow-md"
                      style={{ backgroundColor: info.hexColor }}
                    >
                      <span className="text-[9px] sm:text-[10px] opacity-80 leading-none">GH₵</span>
                      <span className="text-lg sm:text-xl leading-tight">{info.denomination}</span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <h3 className={`font-bold text-xs sm:text-sm truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          {info.spokenName}
                        </h3>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            info.circulationStatus.includes('Phasing out')
                              ? isLight
                                ? 'bg-amber-100 border-amber-300 text-amber-900'
                                : 'bg-amber-950/60 border-amber-700 text-amber-300'
                              : isLight
                              ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                              : 'bg-emerald-950/60 border-emerald-700 text-emerald-300'
                          }`}
                        >
                          {info.circulationStatus}
                        </span>
                      </div>
                      <p className={`text-xs font-semibold mt-1 ${isLight ? 'text-blue-700' : 'text-blue-400'}`}>
                        Size: {info.dimensions}
                      </p>
                      <p className={`text-[11px] mt-0.5 line-clamp-2 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                        {info.tactileDescription}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSpeakDenomTactile(d)}
                    title={`Speak tactile info for ${info.spokenName}`}
                    aria-label={`Listen to tactile details for ${info.spokenName}`}
                    className={`p-2 rounded-xl shrink-0 transition-colors ${
                      isLight
                        ? 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                        : 'bg-slate-800 hover:bg-slate-700 text-yellow-400'
                    }`}
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
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
            className={`w-full sm:w-auto px-6 py-2.5 sm:py-3 font-bold text-sm sm:text-base rounded-xl transition-colors ${
              isLight
                ? 'bg-slate-900 hover:bg-slate-800 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-white'
            }`}
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
