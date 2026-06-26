import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse") as (buf: Buffer) => Promise<{ text: string }>;
import {
  scanImageWithVLM,
  transcribeWithWhisper,
  getCoachResponse,
  askQuestion,
  chatWithCompanion,
  generateStudio,
  generateOralCards,
  scoreOralResponse,
} from "./services/groq.js";

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

const MOCK = !process.env.GROQ_API_KEY;
if (MOCK) console.log("⚠️  No GROQ_API_KEY — running in mock mode.");

app.use(cors());
app.use(express.json({ limit: "20mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/scan", async (req, res) => {
  try {
    const { image } = req.body as { image: string };
    if (!image) {
      res.status(400).json({ error: "Missing image" });
      return;
    }
    if (MOCK) {
      res.json({
        text: "Ang pag-aaral ay isang mahalagang proseso ng pagkuha ng kaalaman at kasanayan.\n\nAng bawat mag-aaral ay kailangang mag-aral nang husto upang magtagumpay sa buhay at makamit ang kanilang mga pangarap.\n\nSa pamamagitan ng pagsisipag at dedikasyon, maaaring makamit ng sinuman ang kanilang mga layunin.",
      });
      return;
    }
    const text = await scanImageWithVLM(image);
    res.json({ text });
  } catch (e: any) {
    console.error("/api/scan error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/transcribe", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "Missing audio file" });
      return;
    }
    if (MOCK) {
      res.json({
        transcript:
          "Ang pag-aaral ay isang mahalagang proseso ng pagkuha ng kaalaman at kasanayan sa buhay.",
      });
      return;
    }
    const transcript = await transcribeWithWhisper(
      req.file.buffer,
      req.file.originalname || "audio.webm",
    );
    res.json({ transcript });
  } catch (e: any) {
    console.error("/api/transcribe error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/coach", async (req, res) => {
  try {
    const { lockedText, transcript, mode, lang } = req.body as {
      lockedText: string;
      transcript: string;
      mode: string;
      lang: string;
    };
    if (!lockedText || !transcript) {
      res.status(400).json({ error: "Missing fields" });
      return;
    }
    if (MOCK) {
      const isFil = (lang || "FIL") === "FIL";
      res.json({
        type: "encouragement",
        message: isFil
          ? "Napakagaling! Patuloy mo itong gawin."
          : "Great effort! Keep it up.",
        accuracy: 82,
        confidence: 76,
        clarity: 79,
        fillerWords: 2,
        pauseTime: 1.1,
        feedback: isFil
          ? "Magaling ang iyong pagsisipag! Subukan mong palawakin pa ang iyong sagot sa susunod na pagkakataon."
          : "Great effort! Try to expand your answer next time and cover more key concepts from the text.",
      });
      return;
    }
    const result = await getCoachResponse({
      lockedText,
      transcript,
      mode: mode || "paraphrase",
      lang: lang || "FIL",
    });
    res.json(result);
  } catch (e: any) {
    console.error("/api/coach error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/ask", async (req, res) => {
  try {
    const { context, question, lang } = req.body as {
      context: string;
      question: string;
      lang?: string;
    };
    if (!context || !question) {
      res.status(400).json({ error: "Missing fields" });
      return;
    }
    if (MOCK) {
      const isFil = (lang || "FIL") === "FIL";
      res.json({
        answer: isFil
          ? "Ang tekstong ito ay nagsasalita tungkol sa kahalagahan ng pag-aaral at kung paano ito nakakatulong sa ating pang-araw-araw na buhay."
          : "This text talks about the importance of learning and how it helps us in our everyday lives.",
      });
      return;
    }
    const answer = await askQuestion(context, question, lang);
    res.json({ answer });
  } catch (e: any) {
    console.error("/api/ask error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/extract-pdf", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) { res.status(400).json({ error: "Missing file" }); return; }
    const data = await pdfParse(req.file.buffer);
    const text = data.text.replace(/\s+/g, " ").trim();
    if (!text) { res.status(422).json({ error: "No readable text found in PDF" }); return; }
    res.json({ text });
  } catch (e: any) {
    console.error("/api/extract-pdf error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/extract-url", async (req, res) => {
  try {
    const { url } = req.body as { url: string };
    if (!url) { res.status(400).json({ error: "Missing url" }); return; }
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; Dunong/1.0)" },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const html = await response.text();
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/\s{2,}/g, " ")
      .trim()
      .slice(0, 8000);
    if (!text) { res.status(422).json({ error: "No readable text found at URL" }); return; }
    res.json({ text });
  } catch (e: any) {
    console.error("/api/extract-url error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/studio", async (req, res) => {
  try {
    const { content, lang } = req.body as { content: string; lang?: string };
    if (!content) { res.status(400).json({ error: "Missing content" }); return; }
    if (MOCK) {
      res.json({
        flashcards: [
          { q: "What is the main idea of the text?", a: "The main idea is about learning and personal growth." },
          { q: "Ano ang kahalagahan ng paksa?", a: "Mahalaga ito para sa pang-araw-araw na buhay ng mag-aaral." },
          { q: "What skill does this topic develop?", a: "Critical thinking and comprehension." },
          { q: "Paano mo maipaliwanag ito sa sariling salita?", a: "Ang pag-aaral ay nagbibigay ng kaalaman at kakayahan." },
        ],
        quiz: [
          { question: "What is the primary focus of the text?", choices: ["Learning", "Sports", "Music", "Food"], answer: 0 },
          { question: "Ano ang pangunahing paksa?", choices: ["Pag-aaral", "Palaro", "Musika", "Pagkain"], answer: 0 },
          { question: "Which best describes the text?", choices: ["Educational", "Fictional", "Satirical", "Poetic"], answer: 0 },
        ],
      });
      return;
    }
    const result = await generateStudio(content, lang || "FIL");
    res.json(result);
  } catch (e: any) {
    console.error("/api/studio error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/chat", async (req, res) => {
  try {
    const { messages, lang, context } = req.body as {
      messages: { role: "user" | "assistant"; content: string }[];
      lang?: string;
      context?: string;
    };
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: "Missing messages" });
      return;
    }
    if (MOCK) {
      const isFil = (lang || "FIL") === "FIL";
      res.json({
        message: isFil
          ? "Kumusta! Ako si Dunong. Anong paksa ang gusto mong talakayin?"
          : "Hello! I'm Dunong. What topic would you like to discuss?",
      });
      return;
    }
    const message = await chatWithCompanion(messages, lang || "FIL", context);
    res.json({ message });
  } catch (e: any) {
    console.error("/api/chat error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/oral-generate", async (req, res) => {
  try {
    const { content, mode, count, lang } = req.body as { content: string; mode: string; count?: number; lang?: string };
    if (!content || !mode) { res.status(400).json({ error: "Missing fields" }); return; }
    if (MOCK) {
      const n = count ?? 5;
      const mockCards: Record<string, object[]> = {
        'paraphrase': Array.from({ length: n }, (_, i) => ({ id: `oral_${i}`, content: `Term ${i + 1}: Key concept from the text`, hint: `Context: This relates to the main topic` })),
        'quiz-bee': Array.from({ length: n }, (_, i) => ({ id: `oral_${i}`, content: `This is the definition of concept ${i + 1} found in the text.`, hint: `Answer: Term ${i + 1}` })),
        'recitation': Array.from({ length: n }, (_, i) => ({ id: `oral_${i}`, content: `What is concept ${i + 1} and why is it important?`, hint: `Key idea: It relates to the main theme` })),
      };
      res.json({ cards: mockCards[mode] ?? mockCards['paraphrase'] });
      return;
    }
    const cards = await generateOralCards(content, mode as any, count ?? 5, lang ?? 'FIL');
    res.json({ cards });
  } catch (e: any) {
    console.error("/api/oral-generate error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/oral-score", async (req, res) => {
  try {
    const { mode, cardContent, transcript, lang } = req.body as { mode: string; cardContent: string; transcript: string; lang?: string };
    if (!mode || !cardContent || !transcript) { res.status(400).json({ error: "Missing fields" }); return; }
    if (MOCK) {
      res.json({ score: 7, label: "Proficient", feedback: "Good job! Keep practicing to improve further." });
      return;
    }
    const result = await scoreOralResponse(mode, cardContent, transcript, lang ?? 'FIL');
    res.json(result);
  } catch (e: any) {
    console.error("/api/oral-score error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

const PORT = Number(process.env.PORT) || 3001;
app.listen(PORT, () => console.log(`Dunong backend listening on port ${PORT}`));
