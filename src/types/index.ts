export type Denomination = '1' | '2' | '5' | '10' | '20' | '50' | '100' | '200' | 'none';

export type Confidence = 'high' | 'medium' | 'low';

export interface BanknoteInfo {
  denomination: Denomination;
  value: number;
  spokenName: string;
  colorName: string;
  hexColor: string;
  textColor: string;
  frontObverse: string;
  reverseBack: string;
  tactileBars: number;
  tactileDescription: string;
  dimensions: string;
  circulationStatus: string;
  features: string[];
}

export interface RecognitionResult {
  denomination: Denomination;
  confidence: Confidence;
  spokenText: string;
  keyFeatures?: string;
  seriesInfo?: string;
  note?: string;
  timestamp: number;
  capturedImage?: string; // base64 thumbnail
}

export interface ScanHistoryItem {
  id: string;
  denomination: Denomination;
  value: number;
  confidence: Confidence;
  spokenText: string;
  timestamp: number;
  thumbnail?: string;
}

export type ContrastTheme = 'standard' | 'light' | 'yellow-on-black' | 'white-on-black' | 'cyan-on-black' | 'black-on-white';

export interface UserPreferences {
  theme: ContrastTheme;
  speechRate: number; // 0.8 to 1.4
  speechPitch: number; // 0.8 to 1.2
  soundEffects: boolean;
  hapticFeedback: boolean;
  autoSpeakResults: boolean;
  continuousIntervalSec: number; // 3 to 7
  hasSeenOnboarding: boolean;
  voiceCommandsEnabled: boolean;
}
