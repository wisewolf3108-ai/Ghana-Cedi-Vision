// Web Speech API wrapper for speech synthesis and voice recognition

export interface SpeakOptions {
  rate?: number;
  pitch?: number;
  interrupt?: boolean;
  onEnd?: () => void;
}

// Retain set of active utterances on window to prevent Chromium garbage collection bugs mid-speech
const activeUtterances = new Set<SpeechSynthesisUtterance>();
if (typeof window !== 'undefined') {
  (window as any).__activeSpeechUtterances = activeUtterances;
}

// Cached voices
let cachedVoices: SpeechSynthesisVoice[] = [];

function loadVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
  const voices = window.speechSynthesis.getVoices();
  if (voices && voices.length > 0) {
    cachedVoices = voices;
  }
  return cachedVoices;
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    loadVoices();
  };
}

export function speak(text: string, options: SpeakOptions = {}): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this browser environment');
    return;
  }

  if (!text || !text.trim()) return;

  const { rate = 1.0, pitch = 1.0, interrupt = true, onEnd } = options;

  try {
    if (interrupt) {
      window.speechSynthesis.cancel();
      activeUtterances.clear();
    }

    // Auto resume if paused/suspended by browser policy
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    const runSpeech = () => {
      try {
        const utterance = new SpeechSynthesisUtterance(text.trim());
        utterance.rate = rate;
        utterance.pitch = pitch;

        // Pick best English voice if available
        const voices = cachedVoices.length > 0 ? cachedVoices : loadVoices();
        const preferredVoice = voices.find(
          (v) =>
            v.lang.startsWith('en-GH') ||
            v.lang.startsWith('en-NG') ||
            v.lang.startsWith('en-GB') ||
            v.lang.startsWith('en-US') ||
            v.lang.startsWith('en')
        );
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }

        utterance.onend = () => {
          activeUtterances.delete(utterance);
          if (onEnd) onEnd();
        };

        utterance.onerror = (e) => {
          activeUtterances.delete(utterance);
          console.debug('SpeechSynthesis error:', e);
          if (onEnd) onEnd();
        };

        activeUtterances.add(utterance);
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.error('Speech utterance creation failed:', err);
      }
    };

    if (interrupt) {
      // Small 15ms dispatch to let browser speech engine flush the cancel queue cleanly
      setTimeout(runSpeech, 15);
    } else {
      runSpeech();
    }
  } catch (e) {
    console.error('Speech playback failed:', e);
  }
}

export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    activeUtterances.clear();
  }
}

export function isSpeaking(): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false;
  return window.speechSynthesis.speaking;
}

/**
 * Type declarations for SpeechRecognition API
 */
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function createSpeechRecognizer(callbacks: {
  onCommand: (command: string, rawTranscript: string) => void;
  onListeningStateChange: (isListening: boolean) => void;
  onError?: (error: string) => void;
}) {
  if (typeof window === 'undefined') return null;

  const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognitionClass) {
    console.warn('SpeechRecognition API not supported on this browser');
    return null;
  }

  const recognition = new SpeechRecognitionClass();
  recognition.continuous = true;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  recognition.onstart = () => {
    callbacks.onListeningStateChange(true);
  };

  recognition.onend = () => {
    callbacks.onListeningStateChange(false);
  };

  recognition.onerror = (event: any) => {
    console.debug('Speech recognition error event:', event.error);
    if (callbacks.onError) callbacks.onError(event.error);
    callbacks.onListeningStateChange(false);
  };

  recognition.onresult = (event: any) => {
    const last = event.results.length - 1;
    const transcript = event.results[last][0].transcript.trim().toLowerCase();
    console.log('Heard voice command transcript:', transcript);

    // Match keywords
    if (transcript.includes('scan') || transcript.includes('capture') || transcript.includes('read') || transcript.includes('check')) {
      callbacks.onCommand('scan', transcript);
    } else if (transcript.includes('repeat') || transcript.includes('again') || transcript.includes('what was that') || transcript.includes('say again')) {
      callbacks.onCommand('repeat', transcript);
    } else if (transcript.includes('continuous') || transcript.includes('auto scan') || transcript.includes('loop')) {
      callbacks.onCommand('continuous_toggle', transcript);
    } else if (transcript.includes('stop') || transcript.includes('pause') || transcript.includes('cancel')) {
      callbacks.onCommand('stop', transcript);
    } else if (transcript.includes('flash') || transcript.includes('torch') || transcript.includes('light')) {
      callbacks.onCommand('torch_toggle', transcript);
    } else if (transcript.includes('help') || transcript.includes('tutorial') || transcript.includes('instructions') || transcript.includes('guide')) {
      callbacks.onCommand('help', transcript);
    } else if (transcript.includes('history') || transcript.includes('recent') || transcript.includes('log')) {
      callbacks.onCommand('history', transcript);
    } else if (transcript.includes('total') || transcript.includes('wallet') || transcript.includes('sum') || transcript.includes('how much')) {
      callbacks.onCommand('total', transcript);
    } else if (transcript.includes('faster') || transcript.includes('speed up')) {
      callbacks.onCommand('faster', transcript);
    } else if (transcript.includes('slower') || transcript.includes('slow down')) {
      callbacks.onCommand('slower', transcript);
    } else {
      callbacks.onCommand('unknown', transcript);
    }
  };

  return recognition;
}
