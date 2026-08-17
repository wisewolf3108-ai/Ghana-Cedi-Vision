import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CameraScanner, CameraScannerRef } from './components/CameraScanner';
import { ScanControls } from './components/ScanControls';
import { ResultDisplay } from './components/ResultDisplay';
import { VoiceCommandAssistant } from './components/VoiceCommandAssistant';
import { AudioOnboardingModal } from './components/AudioOnboardingModal';
import { TactileGuideModal } from './components/TactileGuideModal';
import { ScanHistory } from './components/ScanHistory';
import { SampleNotesTester } from './components/SampleNotesTester';
import { AccessibilitySettingsModal } from './components/AccessibilitySettingsModal';
import { Header } from './components/Header';
import {
  RecognitionResult,
  ScanHistoryItem,
  UserPreferences,
  Denomination,
} from './types';
import {
  playScanBlip,
  playSuccessChime,
  playMediumChime,
  playWarningTone,
  playErrorTone,
  playTickTone,
  playMicTone,
  triggerHaptic,
} from './utils/audio';
import { speak, createSpeechRecognizer } from './utils/speech';
import { getBanknote } from './utils/banknoteData';

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'standard',
  speechRate: 1.0,
  speechPitch: 1.0,
  soundEffects: true,
  hapticFeedback: true,
  autoSpeakResults: true,
  continuousIntervalSec: 4,
  hasSeenOnboarding: false,
  voiceCommandsEnabled: false,
};

export default function App() {
  // State
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    try {
      const saved = localStorage.getItem('cedi_vision_prefs');
      return saved ? { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) } : DEFAULT_PREFERENCES;
    } catch {
      return DEFAULT_PREFERENCES;
    }
  });

  const [history, setHistory] = useState<ScanHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('cedi_vision_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [isScanning, setIsScanning] = useState(false);
  const [isContinuous, setIsContinuous] = useState(false);
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [lastVoiceCommand, setLastVoiceCommand] = useState<string | null>(null);
  const [latestResult, setLatestResult] = useState<RecognitionResult | null>(null);

  // Modals
  const [showTutorial, setShowTutorial] = useState(false);
  const [showTactileGuide, setShowTactileGuide] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Refs
  const cameraRef = useRef<CameraScannerRef | null>(null);
  const continuousTimerRef = useRef<NodeJS.Timeout | null>(null);
  const speechRecognizerRef = useRef<any>(null);
  const isScanningRef = useRef(isScanning);
  isScanningRef.current = isScanning;

  // Save preferences
  const updatePreferences = (updated: Partial<UserPreferences>) => {
    setPreferences((prev) => {
      const next = { ...prev, ...updated };
      try {
        localStorage.setItem('cedi_vision_prefs', JSON.stringify(next));
      } catch (e) {
        console.debug('Failed to save preferences to localStorage', e);
      }
      return next;
    });
  };

  // Toggle light/dark theme
  const toggleTheme = useCallback(() => {
    const isCurrentlyLight = preferences.theme === 'light' || preferences.theme === 'black-on-white';
    const nextTheme = isCurrentlyLight ? 'standard' : 'light';
    updatePreferences({ theme: nextTheme });
    speak(isCurrentlyLight ? 'Dark mode activated' : 'Light mode activated', {
      rate: preferences.speechRate,
      pitch: preferences.speechPitch,
      interrupt: true,
    });
  }, [preferences]);

  // Save history
  useEffect(() => {
    try {
      localStorage.setItem('cedi_vision_history', JSON.stringify(history));
    } catch (e) {
      console.debug('Failed to save history to localStorage', e);
    }
  }, [history]);

  // Online / Offline Detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (preferences.soundEffects) playSuccessChime(true);
      speak('Internet connection restored. Banknote recognition is online.', {
        rate: preferences.speechRate,
        pitch: preferences.speechPitch,
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      if (preferences.soundEffects) playErrorTone(true);
      triggerHaptic('error', preferences.hapticFeedback);
      speak(
        'Warning: Internet connection lost. Gemini Vision requires internet to identify banknotes.',
        {
          rate: preferences.speechRate,
          pitch: preferences.speechPitch,
        }
      );
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [preferences]);

  // First Visit Tutorial Prompt
  useEffect(() => {
    if (!preferences.hasSeenOnboarding) {
      const timer = setTimeout(() => {
        setShowTutorial(true);
        updatePreferences({ hasSeenOnboarding: true });
      }, 800);
      return () => clearTimeout(timer);
    }
  }, []);

  // Main Recognition Trigger
  const executeRecognition = useCallback(
    async (imageBase64: string) => {
      if (isScanningRef.current) return;

      if (!isOnline) {
        if (preferences.soundEffects) playErrorTone(true);
        triggerHaptic('error', preferences.hapticFeedback);
        speak('Cannot scan while offline. Please connect to Wi-Fi or mobile data.', {
          rate: preferences.speechRate,
          pitch: preferences.speechPitch,
        });
        return;
      }

      setIsScanning(true);
      if (preferences.soundEffects) playScanBlip(true);
      triggerHaptic('scan', preferences.hapticFeedback);

      try {
        const response = await fetch('/api/recognize-cedi', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            imageBase64,
            mimeType: 'image/jpeg',
          }),
        });

        let data: any = null;
        try {
          const rawText = await response.text();
          data = JSON.parse(rawText);
        } catch {
          if (!response.ok) {
            if (response.status === 404) {
              throw new Error('API route /api/recognize-cedi not found. On Vercel, ensure GEMINI_API_KEY is set in Environment Variables.');
            }
            throw new Error(`Server returned HTTP ${response.status} error.`);
          }
          throw new Error('Server returned an invalid response format.');
        }

        if (!response.ok || !data || !data.success) {
          throw new Error(data?.error || `Recognition failed (${response.status})`);
        }

        const resultData = data.data;
        const banknote = getBanknote(resultData.denomination);
        const denomSpoken = banknote ? banknote.spokenName : `${resultData.denomination} Ghana Cedis`;

        // Direct, immediate denomination announcement
        let immediateAnnouncement = '';
        if (resultData.denomination && resultData.denomination !== 'none') {
          immediateAnnouncement = `${denomSpoken}.`;
          if (resultData.confidence === 'high') {
            immediateAnnouncement += ' High confidence.';
          } else if (resultData.confidence === 'medium') {
            immediateAnnouncement += ' Medium confidence.';
          }
        } else {
          immediateAnnouncement = resultData.spokenText || 'Note not recognized. Please position note flat and scan again.';
        }

        const result: RecognitionResult = {
          denomination: resultData.denomination || 'none',
          confidence: resultData.confidence || 'low',
          spokenText: immediateAnnouncement,
          keyFeatures: resultData.keyFeatures,
          seriesInfo: resultData.seriesInfo,
          note: resultData.note,
          timestamp: Date.now(),
          capturedImage: imageBase64,
        };

        setLatestResult(result);

        // Feedback based on confidence
        if (result.confidence === 'high' && result.denomination !== 'none') {
          if (preferences.soundEffects) playSuccessChime(true);
          triggerHaptic('success', preferences.hapticFeedback);
        } else if (result.confidence === 'medium' && result.denomination !== 'none') {
          if (preferences.soundEffects) playMediumChime(true);
          triggerHaptic('medium', preferences.hapticFeedback);
        } else {
          if (preferences.soundEffects) playWarningTone(true);
          triggerHaptic('warning', preferences.hapticFeedback);
        }

        // Immediately speak the currency denomination
        if (preferences.autoSpeakResults !== false) {
          speak(immediateAnnouncement, {
            rate: preferences.speechRate,
            pitch: preferences.speechPitch,
            interrupt: true,
          });
        }

        // Add to history if recognized
        if (result.denomination !== 'none') {
          const historyItem: ScanHistoryItem = {
            id: String(Date.now()),
            denomination: result.denomination,
            value: banknote ? banknote.value : 0,
            confidence: result.confidence,
            spokenText: immediateAnnouncement,
            timestamp: Date.now(),
            thumbnail: imageBase64,
          };
          setHistory((prev) => [historyItem, ...prev.slice(0, 49)]); // Keep last 50
        }
      } catch (err: any) {
        console.error('Scan error:', err);
        if (preferences.soundEffects) playErrorTone(true);
        triggerHaptic('error', preferences.hapticFeedback);

        const errorSpoken =
          'Recognition could not be completed. Please check your internet connection and try again.';
        speak(errorSpoken, {
          rate: preferences.speechRate,
          pitch: preferences.speechPitch,
          interrupt: true,
        });

        setLatestResult({
          denomination: 'none',
          confidence: 'low',
          spokenText: errorSpoken,
          note: err?.message || 'Network or API error',
          timestamp: Date.now(),
        });
      } finally {
        setIsScanning(false);
      }
    },
    [isOnline, preferences]
  );

  // Capture from live camera
  const handleCapture = useCallback(() => {
    if (!cameraRef.current) return;
    const frame = cameraRef.current.captureFrame();
    if (frame) {
      executeRecognition(frame);
    } else {
      speak('Camera is not ready yet. Please wait a moment.', {
        rate: preferences.speechRate,
        pitch: preferences.speechPitch,
      });
    }
  }, [executeRecognition, preferences]);

  // Repeat last result
  const handleRepeatLast = useCallback(() => {
    if (latestResult) {
      if (preferences.soundEffects) playScanBlip(true);
      speak(latestResult.spokenText, {
        rate: preferences.speechRate,
        pitch: preferences.speechPitch,
        interrupt: true,
      });
    } else {
      speak('No banknote scanned yet. Point your camera at a note and tap Scan.', {
        rate: preferences.speechRate,
        pitch: preferences.speechPitch,
      });
    }
  }, [latestResult, preferences]);

  // Continuous Auto-Scan Toggle
  const toggleContinuous = useCallback(() => {
    setIsContinuous((prev) => {
      const next = !prev;
      if (next) {
        speak(`Continuous scanning started. Scanning every ${preferences.continuousIntervalSec} seconds.`, {
          rate: preferences.speechRate,
          pitch: preferences.speechPitch,
        });
      } else {
        speak('Continuous scanning paused.', {
          rate: preferences.speechRate,
          pitch: preferences.speechPitch,
        });
      }
      return next;
    });
  }, [preferences]);

  // Continuous Scanner Loop
  useEffect(() => {
    if (isContinuous) {
      continuousTimerRef.current = setInterval(() => {
        if (!isScanningRef.current) {
          if (preferences.soundEffects) playTickTone();
          handleCapture();
        }
      }, preferences.continuousIntervalSec * 1000);
    } else if (continuousTimerRef.current) {
      clearInterval(continuousTimerRef.current);
      continuousTimerRef.current = null;
    }

    return () => {
      if (continuousTimerRef.current) {
        clearInterval(continuousTimerRef.current);
      }
    };
  }, [isContinuous, preferences, handleCapture]);

  // Voice Command Setup
  const toggleVoiceCommands = useCallback(() => {
    if (isVoiceListening) {
      if (speechRecognizerRef.current) {
        speechRecognizerRef.current.stop();
      }
      setIsVoiceListening(false);
      playMicTone(false, preferences.soundEffects);
      speak('Voice commands turned off.', {
        rate: preferences.speechRate,
        pitch: preferences.speechPitch,
      });
    } else {
      const recognizer = createSpeechRecognizer({
        onCommand: (command, raw) => {
          setLastVoiceCommand(raw);
          const rawLower = raw.toLowerCase();

          if (rawLower.includes('light mode') || rawLower.includes('light theme')) {
            updatePreferences({ theme: 'light' });
            speak('Light mode enabled', { interrupt: true });
            return;
          }
          if (rawLower.includes('dark mode') || rawLower.includes('dark theme')) {
            updatePreferences({ theme: 'standard' });
            speak('Dark mode enabled', { interrupt: true });
            return;
          }

          switch (command) {
            case 'scan':
              handleCapture();
              break;
            case 'repeat':
              handleRepeatLast();
              break;
            case 'continuous_toggle':
              toggleContinuous();
              break;
            case 'stop':
              setIsContinuous(false);
              speak('Stopped continuous scanning.', {
                rate: preferences.speechRate,
                pitch: preferences.speechPitch,
              });
              break;
            case 'torch_toggle':
              if (cameraRef.current) {
                cameraRef.current.toggleTorch();
              }
              break;
            case 'help':
              setShowTutorial(true);
              break;
            case 'total':
              const total = history.reduce((s, i) => s + i.value, 0);
              speak(`Total scanned wallet amount is ${total} Ghana Cedis.`, {
                rate: preferences.speechRate,
                pitch: preferences.speechPitch,
              });
              break;
            case 'faster':
              updatePreferences({ speechRate: Math.min(1.5, preferences.speechRate + 0.15) });
              speak('Speech speed increased.', { rate: preferences.speechRate + 0.15 });
              break;
            case 'slower':
              updatePreferences({ speechRate: Math.max(0.7, preferences.speechRate - 0.15) });
              speak('Speech speed decreased.', { rate: preferences.speechRate - 0.15 });
              break;
          }
        },
        onListeningStateChange: (listening) => {
          setIsVoiceListening(listening);
        },
        onError: (err) => {
          console.debug('Voice recognition error:', err);
        },
      });

      if (recognizer) {
        try {
          recognizer.start();
          speechRecognizerRef.current = recognizer;
          setIsVoiceListening(true);
          playMicTone(true, preferences.soundEffects);
          speak('Voice commands active. You can say Scan, Repeat, Continuous, Torch, Light Mode, or Total.', {
            rate: preferences.speechRate,
            pitch: preferences.speechPitch,
          });
        } catch (e) {
          console.error('Failed to start speech recognition', e);
        }
      } else {
        speak('Voice speech recognition is not supported in this browser.', {
          rate: preferences.speechRate,
          pitch: preferences.speechPitch,
        });
      }
    }
  }, [
    isVoiceListening,
    preferences,
    handleCapture,
    handleRepeatLast,
    toggleContinuous,
    history,
  ]);

  // Keyboard Shortcuts (Space/Enter to scan, R to repeat, C for continuous, V for voice, T for torch, H for help, L for Light/Dark)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        handleCapture();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleRepeatLast();
      } else if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        toggleContinuous();
      } else if (e.key === 'v' || e.key === 'V') {
        e.preventDefault();
        toggleVoiceCommands();
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        if (cameraRef.current) {
          cameraRef.current.toggleTorch();
        }
      } else if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        setShowTutorial(true);
      } else if (e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        toggleTheme();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleCapture, handleRepeatLast, toggleContinuous, toggleVoiceCommands, toggleTheme]);

  const isLight = preferences.theme === 'light' || preferences.theme === 'black-on-white';

  // Theme Wrapper Classes
  const getThemeClass = () => {
    switch (preferences.theme) {
      case 'yellow-on-black':
        return 'bg-black text-yellow-400 font-sans';
      case 'cyan-on-black':
        return 'bg-black text-cyan-400 font-sans';
      case 'white-on-black':
        return 'bg-black text-white font-sans';
      case 'black-on-white':
        return 'bg-white text-black font-sans';
      case 'light':
        return 'bg-slate-100 text-slate-900 font-sans';
      default:
        return 'bg-slate-950 text-slate-100 font-sans';
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${getThemeClass()} selection:bg-yellow-400 selection:text-black transition-colors duration-200`}>
      {/* Accessible Header */}
      <Header
        isOnline={isOnline}
        theme={preferences.theme}
        onOpenTutorial={() => setShowTutorial(true)}
        onOpenTactileGuide={() => setShowTactileGuide(true)}
        onOpenSettings={() => setShowSettings(true)}
        onToggleTheme={toggleTheme}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-4 sm:py-6 flex flex-col gap-6">
        {/* Camera Viewfinder */}
        <section aria-label="Camera scanner area" className="w-full">
          <CameraScanner
            ref={cameraRef}
            theme={preferences.theme}
            isScanning={isScanning}
            onCameraReady={() => {
              // camera ready hook
            }}
            onError={(msg) => {
              speak(msg, {
                rate: preferences.speechRate,
                pitch: preferences.speechPitch,
              });
            }}
          />
        </section>

        {/* Primary Controls (Big Scan Button, Repeat, Continuous, Voice) */}
        <section aria-label="Scan operations" className="w-full">
          <ScanControls
            theme={preferences.theme}
            isScanning={isScanning}
            isContinuous={isContinuous}
            isVoiceListening={isVoiceListening}
            hasLastResult={Boolean(latestResult)}
            hasTorch={cameraRef.current?.hasTorch || false}
            isTorchOn={cameraRef.current?.isTorchOn || false}
            onScan={handleCapture}
            onRepeat={handleRepeatLast}
            onToggleContinuous={toggleContinuous}
            onToggleVoice={toggleVoiceCommands}
            onToggleTorch={async () => {
              if (cameraRef.current) {
                const next = await cameraRef.current.toggleTorch();
                speak(next ? 'Flashlight on' : 'Flashlight off', {
                  rate: preferences.speechRate,
                  pitch: preferences.speechPitch,
                });
              }
            }}
          />
        </section>

        {/* Recognition Result Display */}
        <section aria-label="Recognition results" className="w-full">
          <ResultDisplay
            result={latestResult}
            theme={preferences.theme}
            onReplayAudio={handleRepeatLast}
            onOpenTactileGuide={() => setShowTactileGuide(true)}
          />
        </section>

        {/* Voice Command Assistant Banner */}
        <section aria-label="Voice command assistant" className="w-full">
          <VoiceCommandAssistant
            isListening={isVoiceListening}
            lastCommand={lastVoiceCommand}
            onTriggerHelpAudio={() => setShowTutorial(true)}
            theme={preferences.theme}
          />
        </section>

        {/* Sample Notes Tester (For Testing without physical currency) */}
        <section aria-label="Sample banknotes tester" className="w-full">
          <SampleNotesTester
            isScanning={isScanning}
            onSelectSample={(dataUrl) => {
              executeRecognition(dataUrl);
            }}
            theme={preferences.theme}
          />
        </section>

        {/* Scan History & Wallet Calculator */}
        <section aria-label="Scan history and wallet" className="w-full mb-8">
          <ScanHistory
            history={history}
            theme={preferences.theme}
            onClearHistory={() => {
              setHistory([]);
              speak('Scan history cleared.', {
                rate: preferences.speechRate,
                pitch: preferences.speechPitch,
              });
            }}
            onReplayItem={(item) => {
              speak(item.spokenText, {
                rate: preferences.speechRate,
                pitch: preferences.speechPitch,
              });
            }}
          />
        </section>
      </main>

      {/* Accessible Footer */}
      <footer
        className={`w-full border-t py-4 px-4 text-center text-xs transition-colors ${
          isLight
            ? 'border-slate-200 bg-white text-slate-600'
            : 'border-slate-800 bg-slate-950 text-slate-500'
        }`}
      >
        <p className="font-semibold">
          Ghana Cedi Vision • Developed for Ghana Federation of Disability Organizations (GFD) – Accra Secretariat
        </p>
        <p className={`mt-1 text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-600'}`}>
          Powered by Gemini Vision Multimodal AI & Web Speech API. Intended to support visually impaired independent living.
        </p>
      </footer>

      {/* Modals with responsive max-height and fluid fit */}
      <AudioOnboardingModal
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        theme={preferences.theme}
      />

      <TactileGuideModal
        isOpen={showTactileGuide}
        onClose={() => setShowTactileGuide(false)}
        theme={preferences.theme}
      />

      <AccessibilitySettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        preferences={preferences}
        onUpdatePreferences={updatePreferences}
      />
    </div>
  );
}
