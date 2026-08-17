import React, { useState } from 'react';
import { Mic, Volume2, HelpCircle, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { speak } from '../utils/speech';
import { ContrastTheme } from '../types';

interface VoiceCommandAssistantProps {
  isListening: boolean;
  lastCommand: string | null;
  onTriggerHelpAudio: () => void;
  theme?: ContrastTheme;
}

export const VoiceCommandAssistant: React.FC<VoiceCommandAssistantProps> = ({
  isListening,
  lastCommand,
  onTriggerHelpAudio,
  theme = 'standard',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLight = theme === 'light' || theme === 'black-on-white';

  const commandsList = [
    { voice: '"Scan" or "Capture"', desc: 'Takes a photo and identifies the Ghana Cedi note' },
    { voice: '"Repeat" or "Again"', desc: 'Repeats the last denomination spoken aloud' },
    { voice: '"Continuous" or "Auto"', desc: 'Toggles automatic hands-free scanning every few seconds' },
    { voice: '"Torch" or "Flashlight"', desc: 'Turns the flashlight torch on or off for dark rooms' },
    { voice: '"Total" or "Wallet"', desc: 'Announces the total sum of scanned notes in this session' },
    { voice: '"Light Mode" or "Dark Mode"', desc: 'Switches display between light and dark themes' },
    { voice: '"Help" or "Guide"', desc: 'Plays spoken audio instructions and orientation' },
  ];

  const handleSpeakCommands = () => {
    speak(
      'Voice commands available: Say Scan to capture note, Say Repeat to hear the last result, Say Continuous to toggle automatic scanning, Say Torch for flashlight, Say Light Mode or Dark Mode to switch themes, and Say Total to hear your wallet sum.',
      { interrupt: true }
    );
  };

  return (
    <div
      className={`w-full rounded-2xl border transition-all duration-300 p-4 ${
        isListening
          ? 'bg-purple-950/60 border-purple-500/80 shadow-lg shadow-purple-900/30'
          : isLight
          ? 'bg-white border-slate-300 shadow-sm text-slate-900'
          : 'bg-slate-900/80 border-slate-800 text-white'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isListening
                ? 'bg-purple-600 text-white animate-pulse shadow-md shadow-purple-500/50'
                : isLight
                ? 'bg-slate-100 text-slate-700'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            <Mic className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Voice Command Assistant
              </span>
              {isListening && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-300 font-semibold border border-purple-400/40">
                  Listening for speech...
                </span>
              )}
            </div>
            <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              {isListening
                ? 'Say "Scan", "Repeat", "Light Mode", "Torch", "Total" or "Help"'
                : 'Tap "Voice Control" in buttons above to activate hands-free speech'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSpeakCommands}
            title="Speak voice command list"
            aria-label="Listen to available voice commands"
            className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors ${
              isLight
                ? 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                : 'bg-slate-800 hover:bg-slate-700 text-yellow-400'
            }`}
          >
            <Volume2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`p-2 rounded-xl text-xs font-bold transition-colors ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
            aria-expanded={isExpanded}
            aria-label="Toggle voice command reference list"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Last Heard Feedback */}
      {lastCommand && (
        <div
          className={`mt-3 px-3 py-1.5 rounded-xl border text-xs flex items-center gap-2 ${
            isLight
              ? 'bg-purple-50 border-purple-200 text-purple-900'
              : 'bg-purple-900/40 border-purple-500/30 text-purple-200'
          }`}
        >
          <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
          <span>Heard command: <strong className={isLight ? 'text-purple-950 font-black' : 'text-white'}>"{lastCommand}"</strong></span>
        </div>
      )}

      {/* Expandable Command Reference Table */}
      {isExpanded && (
        <div
          className={`mt-4 pt-3 border-t grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs ${
            isLight ? 'border-slate-200 text-slate-700' : 'border-slate-800 text-slate-300'
          }`}
        >
          {commandsList.map((c, i) => (
            <div
              key={i}
              className={`p-2.5 rounded-xl border flex flex-col gap-0.5 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
              }`}
            >
              <strong className={isLight ? 'text-purple-900 font-bold' : 'text-purple-300 font-bold'}>{c.voice}</strong>
              <span className={isLight ? 'text-slate-600 text-[11px]' : 'text-slate-400 text-[11px]'}>{c.desc}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
