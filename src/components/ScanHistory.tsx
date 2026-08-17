import React from 'react';
import { Volume2, Trash2, Wallet, Clock } from 'lucide-react';
import { ScanHistoryItem, ContrastTheme } from '../types';
import { getBanknote, formatCediAmount } from '../utils/banknoteData';
import { speak } from '../utils/speech';

interface ScanHistoryProps {
  history: ScanHistoryItem[];
  onClearHistory: () => void;
  onReplayItem: (item: ScanHistoryItem) => void;
  theme?: ContrastTheme;
}

export const ScanHistory: React.FC<ScanHistoryProps> = ({
  history,
  onClearHistory,
  onReplayItem,
  theme = 'standard',
}) => {
  const isLight = theme === 'light' || theme === 'black-on-white';
  const totalAmount = history.reduce((sum, item) => sum + item.value, 0);

  const handleSpeakTotal = () => {
    if (history.length === 0) {
      speak('Your scan history is empty.', { interrupt: true });
      return;
    }
    speak(
      `You have scanned ${history.length} banknotes with a total value of ${totalAmount} Ghana Cedis.`,
      { interrupt: true }
    );
  };

  return (
    <div
      className={`w-full border-2 rounded-3xl p-5 sm:p-6 flex flex-col gap-4 transition-colors ${
        isLight
          ? 'bg-white border-slate-300 text-slate-900 shadow-sm'
          : 'bg-slate-900 border-slate-800 text-white'
      }`}
    >
      {/* Wallet Total Summary Card */}
      <div
        className={`border rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md ${
          isLight
            ? 'bg-gradient-to-r from-blue-50 to-indigo-50/80 border-blue-200 text-slate-900'
            : 'bg-gradient-to-r from-blue-900/60 to-slate-900 border-blue-500/40 text-white'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0 shadow-sm">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                isLight ? 'text-blue-700' : 'text-blue-300'
              }`}
            >
              Scanned Wallet Total
            </span>
            <h3 className={`text-2xl sm:text-3xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {formatCediAmount(totalAmount)}
            </h3>
            <span className={`text-xs ${isLight ? 'text-slate-600 font-medium' : 'text-slate-300'}`}>
              {history.length} {history.length === 1 ? 'banknote' : 'banknotes'} counted
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleSpeakTotal}
            aria-label="Speak total scanned wallet amount aloud"
            className="flex-1 sm:flex-initial px-4 py-2.5 bg-yellow-400 text-black font-black text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 hover:bg-yellow-300 active:scale-95 transition-transform shadow-sm"
          >
            <Volume2 className="w-4 h-4" /> Speak Total
          </button>

          {history.length > 0 && (
            <button
              onClick={onClearHistory}
              title="Clear scan history"
              aria-label="Clear scan history"
              className={`p-2.5 rounded-xl border transition-colors ${
                isLight
                  ? 'bg-white hover:bg-red-50 text-slate-600 hover:text-red-600 border-slate-300'
                  : 'bg-slate-800 hover:bg-red-900/60 text-slate-300 hover:text-red-300 border-slate-700'
              }`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* History Items List */}
      {history.length === 0 ? (
        <div className={`text-center py-6 text-xs sm:text-sm ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
          No banknotes scanned yet in this session.
        </div>
      ) : (
        <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
          {history.map((item) => {
            const banknote = getBanknote(item.denomination);
            return (
              <div
                key={item.id}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                  isLight
                    ? 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-900'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  {banknote ? (
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center font-black text-white text-sm shrink-0 shadow-sm"
                      style={{ backgroundColor: banknote.hexColor }}
                    >
                      GH₵{banknote.denomination}
                    </div>
                  ) : (
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        isLight ? 'bg-slate-200 text-slate-600' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      ?
                    </div>
                  )}

                  <div>
                    <span className={`font-bold text-sm block ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {banknote ? banknote.spokenName : 'Unidentified note'}
                    </span>
                    <div className={`flex items-center gap-2 text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      <Clock className="w-3 h-3 inline" />
                      <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                      <span className="capitalize">• {item.confidence} confidence</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onReplayItem(item)}
                  title="Replay this item audio"
                  aria-label={`Replay audio for ${banknote?.spokenName || 'note'}`}
                  className={`p-2 rounded-lg text-xs flex items-center gap-1 font-bold ${
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
      )}
    </div>
  );
};
