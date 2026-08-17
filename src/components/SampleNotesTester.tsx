import React from 'react';
import { Sparkles } from 'lucide-react';
import { Denomination, ContrastTheme } from '../types';
import { GHANA_CEDI_BANKNOTES, rasterizeSampleBanknoteJpeg } from '../utils/banknoteData';

interface SampleNotesTesterProps {
  onSelectSample: (base64Image: string, denomination: Denomination) => void;
  isScanning: boolean;
  theme?: ContrastTheme;
}

export const SampleNotesTester: React.FC<SampleNotesTesterProps> = ({
  onSelectSample,
  isScanning,
  theme = 'standard',
}) => {
  const isLight = theme === 'light' || theme === 'black-on-white';
  const denoms: Denomination[] = ['1', '2', '5', '10', '20', '50', '100', '200'];

  const handleTestClick = async (d: Denomination) => {
    if (isScanning) return;
    const dataUrl = await rasterizeSampleBanknoteJpeg(d);
    onSelectSample(dataUrl, d);
  };

  return (
    <div
      className={`w-full border-2 rounded-3xl p-5 sm:p-6 flex flex-col gap-3 transition-colors ${
        isLight
          ? 'bg-white border-slate-300 text-slate-900 shadow-sm'
          : 'bg-slate-900 border-slate-800 text-white'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className={`w-5 h-5 ${isLight ? 'text-amber-600' : 'text-yellow-400'}`} />
          <h3 className={`font-black text-base sm:text-lg ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Banknote Test Samples (Camera-Free Simulation)
          </h3>
        </div>
        <span
          className={`text-xs px-2.5 py-1 rounded-full font-bold ${
            isLight ? 'bg-slate-100 text-slate-600' : 'bg-slate-800 text-slate-400'
          }`}
        >
          8 Denominations
        </span>
      </div>

      <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
        No physical Ghana Cedis at hand? Tap any authentic banknote sample below to immediately test the Gemini Vision recognition and audio feedback loop:
      </p>

      {/* Grid of sample banknotes */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-2">
        {denoms.map((d) => {
          const info = GHANA_CEDI_BANKNOTES[d];
          if (!info) return null;

          return (
            <button
              key={d}
              id={`test-sample-${d}-btn`}
              onClick={() => handleTestClick(d)}
              disabled={isScanning}
              aria-label={`Test recognition with sample ${info.spokenName}`}
              className={`p-3 rounded-2xl border-2 active:scale-95 transition-all text-left flex flex-col justify-between gap-2 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer ${
                isLight
                  ? 'border-slate-300 bg-slate-50 hover:border-amber-500 hover:bg-amber-50/50 shadow-sm'
                  : 'border-slate-700 bg-slate-950/90 hover:border-yellow-400 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span
                  className="px-2 py-0.5 rounded-lg text-white font-black text-xs shadow-sm"
                  style={{ backgroundColor: info.hexColor }}
                >
                  GH₵{info.denomination}
                </span>
                <span
                  className={`text-[10px] font-bold ${
                    isLight ? 'text-blue-700 group-hover:text-blue-900' : 'text-slate-400 group-hover:text-yellow-300'
                  }`}
                >
                  Test &rarr;
                </span>
              </div>

              <div>
                <span
                  className={`font-bold text-xs block leading-tight ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  {info.spokenName}
                </span>
                <span
                  className={`text-[10px] block mt-0.5 font-medium truncate ${
                    isLight ? 'text-slate-600' : 'text-slate-400'
                  }`}
                >
                  {info.dimensions}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
