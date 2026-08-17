import React from 'react';
import { Volume2, CheckCircle2, AlertTriangle, HelpCircle, Plus, Info, Fingerprint } from 'lucide-react';
import { RecognitionResult, ContrastTheme } from '../types';
import { getBanknote, formatCediAmount } from '../utils/banknoteData';

interface ResultDisplayProps {
  result: RecognitionResult | null;
  theme: ContrastTheme;
  onReplayAudio: () => void;
  onAddToHistory?: () => void;
  onOpenTactileGuide?: () => void;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({
  result,
  theme,
  onReplayAudio,
  onAddToHistory,
  onOpenTactileGuide,
}) => {
  const isLight = theme === 'light' || theme === 'black-on-white';

  if (!result) {
    return (
      <div
        className={`w-full border-2 rounded-3xl p-6 text-center flex flex-col items-center justify-center min-h-[160px] transition-colors ${
          isLight
            ? 'bg-white border-slate-300 text-slate-700 shadow-sm'
            : 'bg-slate-900 border-slate-800 text-slate-400'
        }`}
        aria-live="polite"
        role="status"
      >
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
            isLight ? 'bg-slate-100 text-slate-500' : 'bg-slate-800 text-slate-500'
          }`}
        >
          <HelpCircle className="w-6 h-6" />
        </div>
        <p className={`text-lg font-bold ${isLight ? 'text-slate-900' : 'text-slate-300'}`}>
          Ready to recognize Banknote
        </p>
        <p className={`text-sm mt-1 max-w-sm ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
          Point camera at any Ghana Cedi note (GH₵1 to GH₵200) and tap the Scan button or press Spacebar.
        </p>
      </div>
    );
  }

  const isIdentified = result.denomination !== 'none';
  const banknote = isIdentified ? getBanknote(result.denomination) : null;

  // Confidence styling
  const getConfidenceBadge = () => {
    switch (result.confidence) {
      case 'high':
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs sm:text-sm font-bold border ${
              isLight
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-emerald-900/60 text-emerald-300 border-emerald-500/40'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> High Confidence
          </span>
        );
      case 'medium':
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs sm:text-sm font-bold border ${
              isLight
                ? 'bg-blue-50 text-blue-800 border-blue-300'
                : 'bg-blue-900/60 text-blue-300 border-blue-500/40'
            }`}
          >
            <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Medium Confidence
          </span>
        );
      default:
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs sm:text-sm font-bold border ${
              isLight
                ? 'bg-amber-50 text-amber-900 border-amber-300'
                : 'bg-amber-900/60 text-amber-300 border-amber-500/40'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" /> Low Confidence / Reposition
          </span>
        );
    }
  };

  return (
    <div
      className={`w-full border-2 sm:border-3 rounded-3xl p-5 sm:p-7 shadow-xl transition-all duration-300 flex flex-col gap-4 ${
        isLight
          ? 'bg-white border-slate-300 text-slate-900'
          : 'bg-slate-900 border-slate-700 text-white'
      }`}
      aria-live="assertive"
      role="region"
      aria-label="Recognition results"
    >
      {/* Top Header & Confidence Badge */}
      <div
        className={`flex flex-wrap items-center justify-between gap-2 border-b pb-3 ${
          isLight ? 'border-slate-200' : 'border-slate-800'
        }`}
      >
        <span
          className={`text-xs sm:text-sm font-mono font-bold tracking-wider uppercase ${
            isLight ? 'text-slate-500' : 'text-slate-400'
          }`}
        >
          Gemini Vision AI Analysis
        </span>
        {getConfidenceBadge()}
      </div>

      {/* Main Result Hero */}
      {isIdentified && banknote ? (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Color Bar / Value Badge */}
            <div
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex flex-col items-center justify-center font-black text-white shrink-0 border-2 border-white/40 shadow-lg"
              style={{ backgroundColor: banknote.hexColor }}
              aria-hidden="true"
            >
              <span className="text-xs font-bold opacity-90">GH₵</span>
              <span className="text-3xl sm:text-4xl">{banknote.denomination}</span>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2
                  className={`text-2xl sm:text-3xl font-black tracking-tight ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  {banknote.spokenName}
                </h2>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                    banknote.circulationStatus.includes('Phasing out')
                      ? isLight
                        ? 'bg-amber-100 border-amber-300 text-amber-900'
                        : 'bg-amber-950/60 border-amber-700 text-amber-300'
                      : isLight
                      ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                      : 'bg-emerald-950/60 border-emerald-700 text-emerald-300'
                  }`}
                >
                  {banknote.circulationStatus}
                </span>
              </div>
              <p
                className={`text-sm font-semibold mt-0.5 ${
                  isLight ? 'text-amber-800 font-bold' : 'text-yellow-400'
                }`}
              >
                {banknote.dimensions} • {banknote.colorName}
              </p>
              {result.seriesInfo && (
                <p className={`text-xs mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  {result.seriesInfo}
                </p>
              )}
            </div>
          </div>

          {/* Quick Voice Playback & Action */}
          <button
            id="replay-result-audio-btn"
            onClick={onReplayAudio}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-yellow-400 text-black font-black text-sm flex items-center justify-center gap-2 hover:bg-yellow-300 active:scale-95 transition-all cursor-pointer shadow-md"
            aria-label="Listen again to spoken denomination announcement"
          >
            <Volume2 className="w-5 h-5" />
            <span>Hear Again</span>
          </button>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 text-amber-700 dark:text-amber-300">
          <div
            className={`w-16 h-16 rounded-2xl border flex items-center justify-center shrink-0 ${
              isLight
                ? 'bg-amber-100 border-amber-300 text-amber-800'
                : 'bg-amber-500/20 border-amber-500/40 text-amber-400'
            }`}
          >
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <h2 className={`text-xl sm:text-2xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Banknote Not Identified
            </h2>
            <p className={`text-sm mt-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              {result.note || 'Please place the note flat on a table with adequate light and hold the phone steady.'}
            </p>
          </div>
        </div>
      )}

      {/* Tactile Verification Notice for Visually Impaired Users */}
      {isIdentified && banknote && (
        <div
          className={`rounded-2xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs sm:text-sm border ${
            isLight
              ? 'bg-slate-50 border-slate-200 text-slate-800'
              : 'bg-slate-950/80 border-slate-800 text-slate-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Fingerprint className={`w-5 h-5 shrink-0 ${isLight ? 'text-amber-700' : 'text-yellow-400'}`} />
            <span>
              <strong className={isLight ? 'text-slate-900' : 'text-white'}>Physical & Tactile Features: </strong>
              <span className={isLight ? 'text-slate-700' : 'text-slate-300'}>{banknote.dimensions} • {banknote.tactileDescription}</span>
            </span>
          </div>
          {onOpenTactileGuide && (
            <button
              onClick={onOpenTactileGuide}
              className={`text-xs underline font-bold flex items-center gap-1 shrink-0 ${
                isLight ? 'text-blue-700 hover:text-blue-900' : 'text-blue-400 hover:text-blue-300'
              }`}
            >
              Tactile guide
            </button>
          )}
        </div>
      )}

      {/* Spoken Text Transcript */}
      <div
        className={`rounded-xl px-4 py-2.5 text-xs sm:text-sm border ${
          isLight
            ? 'bg-slate-100 border-slate-200 text-slate-800'
            : 'bg-slate-800/60 border-slate-700/50 text-slate-300'
        }`}
      >
        <span className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>Audio Spoken: </span>
        <span className="italic font-medium">"{result.spokenText}"</span>
      </div>
    </div>
  );
};
