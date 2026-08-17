import React from 'react';
import { Wifi, WifiOff, HelpCircle, Sliders, Fingerprint, Sun, Moon } from 'lucide-react';
import { ContrastTheme } from '../types';

interface HeaderProps {
  isOnline: boolean;
  theme: ContrastTheme;
  onOpenTutorial: () => void;
  onOpenTactileGuide: () => void;
  onOpenSettings: () => void;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isOnline,
  theme,
  onOpenTutorial,
  onOpenTactileGuide,
  onOpenSettings,
  onToggleTheme,
}) => {
  const isLight = theme === 'light' || theme === 'black-on-white';

  return (
    <header
      className={`w-full border-b px-4 py-3 sm:px-6 sticky top-0 z-30 shadow-md transition-colors ${
        isLight
          ? 'bg-white border-slate-200 text-slate-900'
          : 'bg-slate-900 border-slate-800 text-white'
      }`}
    >
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
        {/* Brand & Organization Title */}
        <div className="flex items-center gap-3">
          {/* Ghana Flag stylized icon / logo */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-red-600 via-yellow-400 to-green-600 p-0.5 shadow-md flex items-center justify-center shrink-0">
            <div className={`w-full h-full rounded-[10px] flex items-center justify-center ${isLight ? 'bg-slate-900' : 'bg-slate-950'}`}>
              <span className="font-black text-yellow-400 text-xs">GH₵</span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className={`text-base sm:text-lg font-black leading-none ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Ghana Cedi Vision
              </h1>
              {/* Online / Offline status badge */}
              {isOnline ? (
                <span
                  title="Connected to internet (Gemini Vision ready)"
                  aria-label="Online"
                  className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                    isLight
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : 'bg-emerald-950 text-emerald-400 border-emerald-500/40'
                  }`}
                >
                  <Wifi className="w-3 h-3" /> Online
                </span>
              ) : (
                <span
                  title="Device is offline. Gemini Vision requires internet connection."
                  aria-label="Offline warning"
                  className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-red-950 text-red-400 border border-red-500/50 font-bold animate-pulse"
                >
                  <WifiOff className="w-3 h-3" /> Offline
                </span>
              )}
            </div>
            <p className={`text-[11px] font-medium ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              GFD Accra Secretariat • Banknote Reader for Visually Impaired
            </p>
          </div>
        </div>

        {/* Quick Accessible Top Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Light / Dark Mode Quick Switch */}
          <button
            id="header-theme-toggle-btn"
            onClick={onToggleTheme}
            title={isLight ? 'Switch to Dark Mode (Shortcut: L)' : 'Switch to Light Mode (Shortcut: L)'}
            aria-label={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            className={`p-2 sm:px-3 sm:py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 border transition-all cursor-pointer ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300 shadow-sm'
                : 'bg-slate-800 hover:bg-slate-700 text-yellow-300 border-slate-700'
            }`}
          >
            {isLight ? (
              <>
                <Moon className="w-4 h-4 text-slate-700" />
                <span className="hidden sm:inline">Dark Mode</span>
              </>
            ) : (
              <>
                <Sun className="w-4 h-4 text-yellow-400" />
                <span className="hidden sm:inline">Light Mode</span>
              </>
            )}
          </button>

          {/* Audio Tutorial */}
          <button
            id="header-tutorial-btn"
            onClick={onOpenTutorial}
            title="Open Audio Tutorial and Orientation"
            aria-label="Audio tutorial and orientation guide"
            className={`p-2 sm:px-3 sm:py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 border transition-colors ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-amber-700 border-slate-300'
                : 'bg-slate-800 hover:bg-slate-700 text-yellow-400 border-slate-700'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span className="hidden md:inline">Tutorial</span>
          </button>

          {/* Tactile Guide */}
          <button
            id="header-tactile-btn"
            onClick={onOpenTactileGuide}
            title="Open Ghana Cedi Tactile Markings Guide"
            aria-label="Ghana Cedi tactile markings guide"
            className={`p-2 sm:px-3 sm:py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 border transition-colors ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-blue-700 border-slate-300'
                : 'bg-slate-800 hover:bg-slate-700 text-blue-400 border-slate-700'
            }`}
          >
            <Fingerprint className="w-4 h-4" />
            <span className="hidden md:inline">Tactile Guide</span>
          </button>

          {/* Settings / Contrast */}
          <button
            id="header-settings-btn"
            onClick={onOpenSettings}
            title="Open Accessibility Settings"
            aria-label="Accessibility settings"
            className={`p-2 sm:px-3 sm:py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 border transition-colors ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span className="hidden md:inline">Settings</span>
          </button>
        </div>
      </div>
    </header>
  );
};

