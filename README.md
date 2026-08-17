# Ghana Cedi Vision — Accessible Banknote Denomination Reader

Developed for the **Ghana Federation of Disability Organizations (GFD) – Accra Secretariat**.

Ghana Cedi Vision is a mobile-first, computer vision and speech-enabled assistive web application built to empower blind and visually impaired individuals in Ghana to independently recognize, verify, and count Ghana Cedi (GH₵) banknotes in daily commerce and financial transactions.

---

## 1. System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            FRONTEND (React + Vite)                          │
│                                                                             │
│  [Camera Stream (Rear-facing)] ───► [Canvas 768px Frame Capture]            │
│                                           │ (Base64 JPEG)                   │
│                                           ▼                                 │
│  [Web Audio Earcons Synthesizer] ◄── [Backend API Proxy: /api/recognize-cedi]
│  [Web Speech SpeechSynthesis]    ◄── [Parsed Structured JSON Response]      │
│  [Vibration API Haptic Feedback] ◄── [High / Medium / Low Confidence]       │
│  [Web Speech Voice Commands]     ──► ["Scan", "Repeat", "Torch", "Total"]   │
└─────────────────────────────────────────────────────────────────────────────┘
                                            │
                                            ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          BACKEND SERVER (Express.js)                        │
│                                                                             │
│  • Node.js / Express proxy endpoint (/api/recognize-cedi)                   │
│  • Secure server-side GEMINI_API_KEY handling                                │
│  • Google GenAI SDK (@google/genai)                                         │
│  • Model: gemini-2.5-flash (multimodal vision + structured JSON output)     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Gemini Vision API Integration & Prompt Engineering

### Multimodal Pipeline
1. **Frame Capture:** The application captures a still frame from the live `getUserMedia` stream using an offscreen `<canvas>` scaled to 768px wide (keeping payload size small and fast over Ghanaian 3G/4G cellular networks).
2. **Inline Data Payload:** The base64-encoded frame is packaged as an `inlineData` part (`mimeType: "image/jpeg"`) alongside a system prompt.
3. **Structured Classification:** The model evaluates visual identifiers (colors, portraits of The Big Six, Dr. Kwame Nkrumah, landmarks such as Akosombo Dam, Supreme Court, Parliament, Jubilee House, and tactile dot/bar patterns).
4. **JSON Schema Enforcement:** Gemini outputs structured JSON with:
   - `denomination`: `"1" | "2" | "5" | "10" | "20" | "50" | "100" | "200" | "none"`
   - `confidence`: `"high" | "medium" | "low"`
   - `spokenText`: Natural, clear text-to-speech announcement sentence
   - `keyFeatures`: Visible landmarks, colors, or security features detected
   - `seriesInfo`: Denotes standard 2019 series, commemorative, or legacy series
   - `note`: Guidance for repositioning if low-confidence

### Backend Proxy Security Note
In production deployments (Firebase Hosting + Cloud Functions or Vercel Serverless), the client communicates only with `/api/recognize-cedi`. The `GEMINI_API_KEY` remains securely configured in the server environment (`process.env.GEMINI_API_KEY`) and is never sent to or exposed in the browser bundle.

---

## 3. Accessibility & Assistive UX Features

- **Full Screen-Reader Support:** Dynamic `aria-live="assertive"` regions announce state changes, camera status, and denomination results to VoiceOver, TalkBack, and NVDA.
- **Multimodal State Signals (Non-Visual):**
  - **Capture Initiated:** Pitch-rising blip earcon + light tap vibration.
  - **High Confidence Detection:** Harmonic double chime + double pulse vibration (`[180, 80, 180]ms`).
  - **Medium Confidence:** Single bell chime + single medium vibration.
  - **Low Confidence / Reposition:** Low-frequency double buzz + long vibration + spoken instruction.
  - **Offline / Network Error:** Descending alarm tone + triple rapid vibration.
- **Massive Target Controls:** Prominent, high-contrast scan button exceeding WCAG AAA target guidelines.
- **Hands-Free Voice Commands:** Integrated Web Speech recognition listening for:
  - `"Scan"` / `"Capture"` → Triggers instant capture
  - `"Repeat"` / `"Again"` → Repeats the last denomination result
  - `"Continuous"` / `"Auto"` → Toggles hands-free interval scanning
  - `"Torch"` / `"Light"` → Toggles camera flashlight for dark rooms
  - `"Total"` / `"Wallet"` → Speaks total accumulated amount in wallet
  - `"Help"` / `"Guide"` → Plays spoken orientation tutorial
- **High-Contrast Themes:**
  - Standard GFD Blue (High clarity dark mode)
  - High-Contrast Yellow on Black (Optimized for low-vision, cataracts, and tritanopia)
  - High-Contrast Cyan on Black (Glare reduction)
  - Pure Monochrome White on Black (Maximum 21:1 contrast ratio)
- **Audio Onboarding Tutorial:** Fully narrated step-by-step orientation on how to hold the note, scan, and interpret audio/haptic cues.
- **Bank of Ghana Tactile Guide:** Complete reference of tactile raised dots and bars for physical touch verification.
- **Built-in Sample Banknotes Tester:** Camera-free test simulator allowing users and developers to test all 8 denominations with one click.

---

## 4. Latency & Offline Considerations

- **Network Dependency:** Gemini Vision is a cloud-based multimodal AI inference model requiring an active internet connection.
- **Audible Latency Communication:** To ensure a visually impaired user is never left wondering during network round-trip latency (typically 1–2 seconds), the app immediately speaks *"Scanning note..."* alongside an earcon upon capture.
- **Offline Guardrails:** The app continuously monitors `navigator.onLine` and `window.addEventListener('offline')`. If connectivity drops, it immediately sounds an audible alert and prevents fruitless API requests.
- **Local Session Caching:** Scanned banknotes and the wallet balance are cached in `localStorage`, allowing the user to replay previous results and check their wallet sum even when offline.

---

## 5. Extending Denomination Coverage

To extend or update the currency model (e.g. for new Bank of Ghana banknote redesigns, polymer variants, or new commemorative issues):

1. **Update `src/types/index.ts`:** Add new denominations or series metadata to the `Denomination` type.
2. **Update `src/utils/banknoteData.ts`:** Register the new note's dimensions, color profile, front/reverse landmarks, and tactile bar count in `GHANA_CEDI_BANKNOTES`.
3. **Update the System Prompt in `server.ts`:** Add the visual features, security elements, and landmark descriptions to the prompt instruction so Gemini 2.5 Flash reliably recognizes the new series.
4. **Update the Sample Generator in `src/utils/banknoteData.ts`:** Add the SVG template for camera-free testing and simulator coverage.
