# Dunong — AI Recitation Coach

**Oral confidence coaching for Filipino students.**
Scan a printed module, explain it out loud, and get AI feedback that builds your confidence to speak — not just your grade.

> Hackathon: **ACM TechSprint: Asteria** · Organized by FIT ACM Student Chapter · Major partner: Accenture · Tech partner: GitHub
> Project Case: *Case 2 — AI-Powered Study Companion for Filipino Learners*

---

## 1. ReadMe

Dunong narrows in on one specific, underserved gap: **oral confidence and recitation anxiety** among Filipino high school and college students. Instead of a generic Q&A chatbot, it helps students find their voice out loud — in a private, judgment-free space — before they have to perform in a real classroom.

**How it works:**

1. **Scan** — Point the camera at a printed module or upload a photo. AI extracts the text and shows a **"Tama Ba?"** step so the student can correct any misread words before continuing.
2. **Lock** ("Sipat-Aral") — Tap the paragraph to recite. Only that text is used as context.
3. **Recite** ("Sabihin Mo") — Explain the locked text out loud in Filipino, English, or code-switched. Difficulty climbs through a confidence ladder: Read-Aloud → Paraphrase → Cold Call → Stand & Deliver.
4. **Feedback** — Scored on accuracy, clarity, and confidence (filler words, hesitation), with specific and encouraging AI-generated coaching.
5. **Chat** — Ask Dunong anything about the subject. Works online and falls back to offline keyword responses when no connection is available.

Only the OCR'd text and speech transcript — a few kilobytes — ever touch the network, keeping the app genuinely low-bandwidth and mobile-first.

---

## 2. Setup Guide

### Prerequisites
- Node.js 18+
- A [Groq API key](https://console.groq.com) (free tier works)

### Backend
```bash
cd backend
npm install
cp .env.example .env    # paste your GROQ_API_KEY into .env
npm run dev             # starts on http://localhost:3001
```
Leave `GROQ_API_KEY` blank to run in **mock mode** — the app still works with canned responses, no API key required.

### Frontend
```bash
cd frontend
npm install
npm run dev             # starts on http://localhost:5173
```
The frontend proxies `/api/*` to `localhost:3001` automatically in development.

### Environment Variables

| File | Variable | Description |
|---|---|---|
| `backend/.env` | `GROQ_API_KEY` | Groq API key for AI features |
| `backend/.env` | `PORT` | Backend port (default: 3001) |
| `frontend/.env` | `VITE_API_URL` | Backend URL for deployed builds (leave empty for local dev) |

### Deployed Version
- **Frontend:** https://dunong-pinoy.vercel.app
- **Backend:** https://dunong-ihba.onrender.com

---

## 3. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Backend | Node.js, Express, TypeScript, tsx |
| AI — Vision (OCR) | Groq API · `meta-llama/llama-4-scout-17b-16e-instruct` |
| AI — Coaching & Chat | Groq API · `llama-3.3-70b-versatile` |
| AI — Speech-to-Text | Groq Whisper · `whisper-large-v3-turbo` |
| Text-to-Speech | Web Speech API (on-device, no cost) |
| Deployment | Render (backend), Vercel/Netlify (frontend) |

**Architecture:**
```
Browser / Phone
  Camera / Gallery → canvas → JPEG (max 1280px) → POST /api/scan
  Mic → MediaRecorder (webm/mp4) → POST /api/transcribe
  Text → POST /api/coach → accuracy + confidence + clarity scores
                ↓
  Express backend (Render)
    /api/scan       → Groq Vision (Llama 4 Scout) → extracted text
    /api/transcribe → Groq Whisper → transcript
    /api/coach      → Groq LLM (Llama 3.3 70B) → feedback + scores
    /api/chat       → Groq LLM → study companion response
    /api/ask        → Groq LLM → paragraph explanation
```

---

## 4. AI Disclosure

### AI tools used to build Dunong

| Tool | How it was used |
|---|---|
| Claude (Anthropic) | Primary coding assistant — UI implementation, bug fixes, architecture decisions |
| ChatGPT (OpenAI) | Generated the mascot PNG images used in the app |
| Groq Console | Testing and validating AI model responses during development |

### AI embedded inside the product

| Feature | Model | Provider | Purpose |
|---|---|---|---|
| Scan Module (OCR) | Llama 4 Scout 17B | Groq | Extract printed text from a photo |
| Coaching Feedback | Llama 3.3 70B | Groq | Score recitation and generate personalized feedback in Filipino/English |
| Speech Transcription | Whisper Large V3 Turbo | Groq | Convert student's spoken answer to text |
| AI Chat | Llama 3.3 70B | Groq | Answer student questions about any subject |
| Ask Dunong | Llama 3.3 70B | Groq | Explain a selected paragraph in Filipino or English |
| Text-to-Speech | Web Speech API | On-device | Read prompts and feedback aloud (no API cost, no data sent) |
| Offline fallback | Keyword rules | None | Basic responses when there is no internet connection |

**Privacy:** No images are stored. No audio is stored. Only the OCR-extracted text and speech transcript (plain text, a few KB each) are sent to the Groq API for processing. Nothing is persisted beyond the current session.

---

## 5. Team Members

**Team Name:** Fine Tuned

| Name |
|---|
| Shintaro Suzuki |
| Melfred Bernabe |
| Kenth Razen Magbanua |
| Shana Czane M. Cruzat |
