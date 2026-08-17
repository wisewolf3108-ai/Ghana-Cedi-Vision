import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Support larger payloads for camera frame base64
app.use(express.json({ limit: "15mb" }));

// Initialize Google GenAI client
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set in environment. Mock/offline mode or client key will be needed.");
    }
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

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Banknote recognition endpoint
app.post("/api/recognize-cedi", async (req, res) => {
  try {
    const { imageBase64, mimeType = "image/jpeg" } = req.body;

    if (!imageBase64) {
      return res.status(400).json({
        error: "Missing imageBase64 in request body",
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        error: "Gemini API key is not configured on the server.",
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
          // If unencoded SVG or string, base64-encode it
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

    // System prompt specifically crafted for Ghana Cedi recognition
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

    // Resilient model fallback: try gemini-3.6-flash first, then gemini-2.5-flash or gemini-3.7-flash
    const candidateModels = ["gemini-3.6-flash", "gemini-2.5-flash", "gemini-3.7-flash"];
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
        console.warn(`Model ${modelName} failed, attempting next candidate if available:`, err?.message || err);
      }
    }

    if (!response && lastModelError) {
      throw lastModelError;
    }

    const textOutput = response.text || "{}";

    // Clean any markdown fences if present
    const cleanedText = textOutput.replace(/```json/gi, "").replace(/```/g, "").trim();
    let resultJson;
    try {
      resultJson = JSON.parse(cleanedText);
    } catch {
      // Fallback regex extraction if parsing failed
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

    // Ensure standard spoken text if missing
    if (!resultJson.spokenText) {
      if (resultJson.denomination && resultJson.denomination !== "none") {
        const words: Record<string, string> = {
          "1": "one",
          "2": "two",
          "5": "five",
          "10": "ten",
          "20": "twenty",
          "50": "fifty",
          "100": "one hundred",
          "200": "two hundred",
        };
        const word = words[resultJson.denomination] || resultJson.denomination;
        resultJson.spokenText = `This is a ${word} Ghana cedi note.`;
      } else {
        resultJson.spokenText = "Unable to identify the note. Please reposition the banknote and scan again.";
      }
    }

    return res.json({
      success: true,
      data: resultJson,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Gemini Vision recognition error:", error);
    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to process image with Gemini Vision API",
      spokenText: "Recognition service encountered an error. Please check your connection and tap scan again.",
    });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Ghana Cedi Vision Server running on http://localhost:${PORT}`);
  });
}

startServer();
