import { BanknoteInfo, Denomination } from '../types';

export const GHANA_CEDI_BANKNOTES: Record<Denomination, BanknoteInfo | null> = {
  '1': {
    denomination: '1',
    value: 1,
    spokenName: 'One Ghana Cedi',
    colorName: 'Red / Brownish-Red',
    hexColor: '#b91c1c',
    textColor: '#ffffff',
    frontObverse: 'The Big Six nationalist leaders and Independence Arch',
    reverseBack: 'Akosombo Dam (hydroelectric power)',
    tactileBars: 1,
    tactileDescription: 'Intaglio raised portrait & denomination numerals with tactile shape markings',
    dimensions: '137 mm × 65 mm',
    circulationStatus: 'Phasing out for coin',
    features: ['Red dominant color', 'Big Six portrait', 'Akosombo Dam power station', 'Intaglio raised relief'],
  },
  '2': {
    denomination: '2',
    value: 2,
    spokenName: 'Two Ghana Cedis',
    colorName: 'Terra-cotta / Orange-Brown',
    hexColor: '#c2410c',
    textColor: '#ffffff',
    frontObverse: 'Dr. Kwame Nkrumah (First President of Ghana)',
    reverseBack: 'Parliament House of Ghana in Accra',
    tactileBars: 2,
    tactileDescription: 'Intaglio raised Kwame Nkrumah portrait and tactile corner markings',
    dimensions: '140 mm × 67 mm',
    circulationStatus: 'Phasing out for coin',
    features: ['Terra-cotta orange color', 'Dr. Kwame Nkrumah portrait', 'Parliament building', 'Intaglio raised relief'],
  },
  '5': {
    denomination: '5',
    value: 5,
    spokenName: 'Five Ghana Cedis',
    colorName: 'Deep Blue',
    hexColor: '#1d4ed8',
    textColor: '#ffffff',
    frontObverse: 'The Big Six leaders (or James Kwegyir Aggrey on 60th Commemorative Note)',
    reverseBack: 'Balme Library (University of Ghana, Legon) / FPSO Kwame Nkrumah',
    tactileBars: 3,
    tactileDescription: 'Intaglio raised print on portrait and corner tactile marks (or smooth polymer substrate on 60th anniversary note)',
    dimensions: '141 mm × 68 mm',
    circulationStatus: 'Active circulation',
    features: ['Royal blue color', 'Balme Library University of Ghana', 'Polka-dot commemorative design available', 'Intaglio raised relief'],
  },
  '10': {
    denomination: '10',
    value: 10,
    spokenName: 'Ten Ghana Cedis',
    colorName: 'Yellow-Green',
    hexColor: '#65a30d',
    textColor: '#0f172a',
    frontObverse: 'The Big Six nationalist leaders',
    reverseBack: 'Bank of Ghana Headquarters building in Accra',
    tactileBars: 4,
    tactileDescription: 'Intaglio raised portrait and tactile marks with Spark Live color-shifting element',
    dimensions: '145 mm × 71 mm',
    circulationStatus: 'Active circulation',
    features: ['Yellow-green tint', 'Bank of Ghana headquarters', 'Enhanced windowed security thread', 'Intaglio raised relief'],
  },
  '20': {
    denomination: '20',
    value: 20,
    spokenName: 'Twenty Ghana Cedis',
    colorName: 'Purple / Violet',
    hexColor: '#7e22ce',
    textColor: '#ffffff',
    frontObverse: 'The Big Six nationalist leaders',
    reverseBack: 'Supreme Court of Ghana building',
    tactileBars: 5,
    tactileDescription: 'Intaglio raised portrait and distinct corner tactile marks',
    dimensions: '149 mm × 74 mm',
    circulationStatus: 'Active circulation',
    features: ['Vibrant purple color', 'Supreme Court building', 'Optically variable magnetic ink', 'Intaglio raised relief'],
  },
  '50': {
    denomination: '50',
    value: 50,
    spokenName: 'Fifty Ghana Cedis',
    colorName: 'Warm Brown',
    hexColor: '#854d0e',
    textColor: '#ffffff',
    frontObverse: 'The Big Six nationalist leaders',
    reverseBack: 'Christiansborg Castle (Osu Castle, former seat of Government)',
    tactileBars: 6,
    tactileDescription: 'Intaglio raised print, tactile shape markings and Spark Live feature',
    dimensions: '152 mm × 78 mm',
    circulationStatus: 'Active circulation',
    features: ['Rich brown color', 'Christiansborg / Osu Castle', 'Color-shifting eagle hologram', 'Intaglio raised relief'],
  },
  '100': {
    denomination: '100',
    value: 100,
    spokenName: 'One Hundred Ghana Cedis',
    colorName: 'Cyan / Blue-Green',
    hexColor: '#0e7490',
    textColor: '#ffffff',
    frontObverse: 'The Big Six nationalist leaders (2019 Series)',
    reverseBack: 'Parliament House complex in Accra',
    tactileBars: 7,
    tactileDescription: 'Advanced intaglio raised print and upgraded corner tactile feature',
    dimensions: '156 mm × 81 mm',
    circulationStatus: 'Active circulation (Largest size)',
    features: ['Cyan / blue-green high denomination', 'Introduced Nov 2019', 'Advanced rolling star security thread', 'Intaglio raised relief'],
  },
  '200': {
    denomination: '200',
    value: 200,
    spokenName: 'Two Hundred Ghana Cedis',
    colorName: 'Orange-Gold / Terra-cotta Gold',
    hexColor: '#b45309',
    textColor: '#ffffff',
    frontObverse: 'The Big Six nationalist leaders (2019 Series)',
    reverseBack: 'Jubilee House (Seat of the Presidency of Ghana)',
    tactileBars: 8,
    tactileDescription: 'Highest denomination note sharing largest dimensions with high-relief intaglio print and tactile marks',
    dimensions: '156 mm × 81 mm',
    circulationStatus: 'Active circulation (Largest size)',
    features: ['Highest Ghanaian banknote denomination', 'Jubilee House illustration', 'Spark Live 3D optical shift', 'Intaglio raised relief'],
  },
  'none': null,
};

export function getBanknote(denomination: Denomination): BanknoteInfo | null {
  return GHANA_CEDI_BANKNOTES[denomination] || null;
}

export function formatCediAmount(amount: number): string {
  return `GH₵ ${amount.toFixed(2)}`;
}

/**
 * Creates high-detail SVG of realistic Ghana Cedi banknotes for offline testing,
 * sample uploads, and camera-free simulation.
 */
export function generateSampleBanknoteSvg(denom: Denomination): string {
  const info = GHANA_CEDI_BANKNOTES[denom];
  if (!info) return '';

  const w = 768;
  const h = 380;
  const bg = info.hexColor;
  const num = info.denomination;
  const textClr = info.textColor;

  // Dots for tactile marks
  const tactileMarks = Array.from({ length: info.tactileBars }, (_, i) => {
    const y = 80 + i * 28;
    return `<rect x="${w - 35}" y="${y}" width="22" height="14" rx="4" fill="#ffffff" stroke="#000000" stroke-width="2" />`;
  }).join('\n');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bg}" stop-opacity="0.95" />
        <stop offset="50%" stop-color="${bg}" stop-opacity="0.8" />
        <stop offset="100%" stop-color="${bg}" stop-opacity="1" />
      </linearGradient>
      <pattern id="guilloche" width="30" height="30" patternUnits="userSpaceOnUse">
        <path d="M 0 15 Q 15 0 30 15 Q 15 30 0 15" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1.5" />
      </pattern>
    </defs>

    <!-- Banknote Background -->
    <rect width="${w}" height="${h}" rx="16" fill="url(#bgGrad)" stroke="#222" stroke-width="4" />
    <rect width="${w}" height="${h}" rx="16" fill="url(#guilloche)" />

    <!-- Outer Security Border -->
    <rect x="18" y="18" width="${w - 36}" height="${h - 36}" rx="10" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="2" stroke-dasharray="8 4" />

    <!-- Bank of Ghana Header -->
    <text x="${w / 2}" y="60" font-family="Arial, sans-serif" font-size="28" font-weight="900" text-anchor="middle" fill="${textClr}" letter-spacing="3">BANK OF GHANA</text>
    <text x="${w / 2}" y="86" font-family="Arial, sans-serif" font-size="14" font-weight="bold" text-anchor="middle" fill="${textClr}" opacity="0.9">THIS NOTE IS ISSUED ON STATUTORY AUTHORITY AND IS LEGAL TENDER</text>

    <!-- Large Denomination Numeral Center-Left -->
    <rect x="40" y="110" width="130" height="130" rx="14" fill="rgba(0,0,0,0.25)" stroke="rgba(255,255,255,0.6)" stroke-width="2" />
    <text x="105" y="195" font-family="Arial, sans-serif" font-size="68" font-weight="900" text-anchor="middle" fill="${textClr}">GH₵${num}</text>
    <text x="105" y="224" font-family="Arial, sans-serif" font-size="13" font-weight="bold" text-anchor="middle" fill="${textClr}">CEDIS</text>

    <!-- Center Art & Illustration Box -->
    <rect x="190" y="110" width="370" height="190" rx="12" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.3)" stroke-width="1.5" />
    <circle cx="270" cy="185" r="48" fill="rgba(0,0,0,0.2)" stroke="#fff" stroke-width="1.5" />
    <text x="270" y="180" font-family="Arial, sans-serif" font-size="14" font-weight="bold" text-anchor="middle" fill="#fff">THE BIG SIX</text>
    <text x="270" y="200" font-family="Arial, sans-serif" font-size="10" text-anchor="middle" fill="#fff">NATIONAL HEROES</text>

    <!-- Landmark description in center -->
    <text x="440" y="165" font-family="Arial, sans-serif" font-size="16" font-weight="bold" text-anchor="middle" fill="${textClr}">${info.spokenName.toUpperCase()}</text>
    <text x="440" y="195" font-family="Arial, sans-serif" font-size="12" text-anchor="middle" fill="${textClr}" opacity="0.95">${info.reverseBack}</text>
    <text x="440" y="225" font-family="Arial, sans-serif" font-size="11" text-anchor="middle" fill="${textClr}" opacity="0.8">TACTILE: ${info.tactileBars} RAISED ${info.tactileBars === 1 ? 'BAR' : 'BARS'}</text>

    <!-- Holographic security strip on right -->
    <rect x="580" y="25" width="40" height="${h - 50}" fill="rgba(255,215,0,0.4)" stroke="rgba(255,255,255,0.8)" stroke-width="1" />
    <text x="600" y="200" transform="rotate(-90 600,200)" font-family="Arial, sans-serif" font-size="14" font-weight="900" fill="#000" letter-spacing="4">BANK OF GHANA GH₵${num}</text>

    <!-- Tactile Identification Area (Right Border) -->
    <rect x="${w - 50}" y="45" width="40" height="${h - 90}" rx="6" fill="rgba(0,0,0,0.35)" stroke="#fff" stroke-width="1.5" />
    ${tactileMarks}

    <!-- Bottom corners denomination badge -->
    <text x="50" y="${h - 35}" font-family="Arial, sans-serif" font-size="34" font-weight="900" fill="${textClr}">GH₵ ${num}</text>
    <text x="${w - 180}" y="${h - 35}" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="${textClr}">SERIES 2019 / GFD</text>
  </svg>`;
}

export function generateSampleBanknoteDataUrl(denom: Denomination): string {
  const svg = generateSampleBanknoteSvg(denom);
  if (!svg) return '';
  // Return valid base64-encoded SVG data URL
  try {
    const b64 = btoa(unescape(encodeURIComponent(svg)));
    return `data:image/svg+xml;base64,${b64}`;
  } catch {
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }
}

/**
 * Rasterizes the sample SVG banknote into a high-quality JPEG Data URL via HTML Canvas.
 * This guarantees 100% compatibility with Gemini Vision inline image payloads.
 */
export async function rasterizeSampleBanknoteJpeg(denom: Denomination): Promise<string> {
  const svg = generateSampleBanknoteSvg(denom);
  if (!svg) return '';

  return new Promise((resolve) => {
    try {
      const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 768;
        canvas.height = 380;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const jpegData = canvas.toDataURL('image/jpeg', 0.9);
          URL.revokeObjectURL(url);
          resolve(jpegData);
          return;
        }
        URL.revokeObjectURL(url);
        resolve(generateSampleBanknoteDataUrl(denom));
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(generateSampleBanknoteDataUrl(denom));
      };

      img.src = url;
    } catch {
      resolve(generateSampleBanknoteDataUrl(denom));
    }
  });
}
