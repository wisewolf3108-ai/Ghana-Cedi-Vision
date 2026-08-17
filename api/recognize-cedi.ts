import { GoogleGenAI, Type } from "@google/genai";

export const config = {
  maxDuration: 30,
};

let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

export default async function handler(req: any, res: any) {
  // CORS & Preflight handling
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed. Use POST.",
    });
  }

  try {
    const { imageBase64, mimeType = "image/jpeg" } = req.body || {};

    if (!imageBase64) {
      return res.status(400).json({
        success: false,
        error: "Missing imageBase64 in request body",
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        success: false,
        error: "GEMINI_API_KEY is not configured in Vercel Environment Variables.",
        spokenText: "Gemini API key is not configured. Please add GEMINI_API_KEY in your Vercel project settings.",
      });
    }

    // Clean base64 string if data URL prefix was included
    let cleanBase64 = imageBase64;
    let resolvedMimeType = mimeType || "image/jpeg";

    if (cleanBase64.startsWith("data:")) {
      const match = cleanBase64.match(/^data:([a-zA-Z0-9/+-]+);(base64|utf8),(.+)$/);
      if (match) {
        resolvedMimeType = match[1];
        if (match[2] === "utf8") {
          const decoded = decodeURIComponent(match[3]);
          cleanBase64 = Buffer.from(decoded, "utf8").toString("base64");
        } else {
          cleanBase64 = match[3];
        }
      } else {
        cleanBase64 = cleanBase64.replace(/^data:[^;]+;base64,/, "");
      }
    }

    const ai = getGenAI();

    const promptText = `You are an expert currency recognition assistant for a visually impaired user in Ghana (working with the Ghana Federation of Disability Organizations - GFD Accra Secretariat).
Look carefully at this image and identify which Ghana Cedi (GH₵) banknote denomination is shown, if any.

Consider both older (2007/2012 series) and newer (2018/2019 upgraded and commemorative series) note designs:
Key features to recognize:
- GH₵ 1: Red/brownish-red note featuring The Big Six leaders and Akosombo Dam (137 mm × 65 mm, phasing out for coin).
- GH₵ 2: Terra-cotta/orange note featuring Dr. Kwame Nkrumah and Parliament House (140 mm × 67 mm, phasing out for coin).
- GH₵ 5: Blue note featuring The Big Six leaders and Balme Library, University of Ghana (or 60th anniversary commemorative polymer note with James Kwegyir Aggrey) (141 mm × 68 mm, active circulation).
- GH₵ 10: Yellow-green note featuring The Big Six and Bank of Ghana headquarters (145 mm × 71 mm, active circulation).
- GH₵ 20: Purple/violet note featuring The Big Six and Supreme Court of Ghana building (149 mm × 74 mm, active circulation).
- GH₵ 50: Brown note featuring The Big Six and Christiansborg Castle (Osu Castle) (152 mm × 78 mm, active circulation).
- GH₵ 100: Cyan/blue-green note featuring The Big Six and Parliament House (156 mm × 81 mm, active circulation - largest size).
- GH₵ 200: Terra-cotta / orange-gold note featuring The Big Six and Jubilee House (156 mm × 81 mm, active circulation - largest size).

Accessibility verification context:
Bank of Ghana banknotes feature intaglio raised print (on portraits, denomination numerals, and 'Bank of Ghana' lettering), distinct corner tactile marks, and graduated banknote lengths. However, in circulation, physical embossing frequently wears down, which is why your visual recognition is essential.

Provide a definitive classification. If the image does not show a clear Ghana Cedi banknote, or is too blurry/dark/obscured, set denomination to "none" and confidence to "low".

Respond ONLY with a JSON object matching this schema:
{
  "denomination": "1" | "2" | "5" | "10" | "20" | "50" | "100" | "200" | "none",
  "confidence": "high" | "medium" | "low",
  "spokenText": "Direct spoken announcement starting immediately with the denomination name, e.g. 'Fifty Ghana Cedis.' or 'Twenty Ghana Cedis. High confidence.' or 'Note not recognized. Please position note and try again.'",
  "keyFeatures": "Brief description of visual or tactile features identified (e.g. 'Purple note, Supreme Court, 20 Cedi numeral')",
  "seriesInfo": "e.g. 'Standard 2019 Upgraded Series' or 'Commemorative Edition' or 'Unknown'",
  "note": "Brief explanation if low confidence or advice to user"
}`;

    const candidateModels = ["gemini-2.5-flash", "gemini-3.6-flash", "gemini-3.7-flash"];
    let response: any = null;
    let lastModelError: any = null;

    for (const modelName of candidateModels) {
      try {
        response = await ai.models.generateContent({
          model: modelName,
          contents: {
            parts: [
              {
                inlineData: {
                  data: cleanBase64,
                  mimeType: resolvedMimeType === "image/svg+xml" ? "image/png" : resolvedMimeType,
                },
              },
              {
                text: promptText,
              },
            ],
          },
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                denomination: {
                  type: Type.STRING,
                  description: "The recognized denomination (1, 2, 5, 10, 20, 50, 100, 200, or none)",
                },
                confidence: {
                  type: Type.STRING,
                  description: "Confidence level: high, medium, or low",
                },
                spokenText: {
                  type: Type.STRING,
                  description: "The exact sentence to be spoken aloud to the visually impaired user",
                },
                keyFeatures: {
                  type: Type.STRING,
                  description: "Visible banknote features detected (color, landmarks, portraits)",
                },
                seriesInfo: {
                  type: Type.STRING,
                  description: "Series or edition info",
                },
                note: {
                  type: Type.STRING,
                  description: "Advice or reason if none/low confidence",
                },
              },
              required: ["denomination", "confidence", "spokenText"],
            },
          },
        });
        if (response) break;
      } catch (err: any) {
        lastModelError = err;
        console.warn(`Model ${modelName} failed on Vercel:`, err?.message || err);
      }
    }

    if (!response && lastModelError) {
      throw lastModelError;
    }

    const textOutput = response.text || "{}";
    const cleanedText = textOutput.replace(/```json/gi, "").replace(/```/g, "").trim();
    let resultJson: any;
    try {
      resultJson = JSON.parse(cleanedText);
    } catch {
      const denomMatch = cleanedText.match(/"denomination"\s*:\s*"?(1|2|5|10|20|50|100|200|none)"?/i);
      const confMatch = cleanedText.match(/"confidence"\s*:\s*"?(high|medium|low)"?/i);
      resultJson = {
        denomination: denomMatch ? denomMatch[1] : "none",
        confidence: confMatch ? confMatch[1] : "low",
        spokenText: denomMatch && denomMatch[1] !== "none"
          ? `This is a ${denomMatch[1]} Ghana cedi note.`
          : "Could not clearly identify the note. Please hold it steady with good lighting and scan again.",
        note: "Extracted from partial response",
      };
    }

    if (!resultJson.spokenText) {
      if (resultJson.denomination && resultJson.denomination !== "none") {
        resultJson.spokenText = `${resultJson.denomination} Ghana Cedis.`;
      } else {
        resultJson.spokenText = "Unable to identify the note. Please reposition the banknote and scan again.";
      }
    }

    return res.status(200).json({
      success: true,
      data: resultJson,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Vercel Serverless Gemini Vision error:", error);
    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to process image with Gemini Vision API",
      spokenText: "Recognition service encountered an error. Please try again.",
    });
  }
}
