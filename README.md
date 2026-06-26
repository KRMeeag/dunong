# Dunong

**Recitation & oral confidence coaching for Filipino students.**
Scan a printed module, explain it out loud, get feedback that builds
your confidence to speak -- not just your grade.

---

## Team

**Team name:** Fine Tuned

| Member |
|---|
| Shintaro Suzuki |
| Melfred Bernabe |
| Kenth Razen Magbanua |
| Shana Cruzat |

## Event

- **Hackathon:** ACM TechSprint: Asteria
- **Organized by:** FIT ACM Student Chapter
- **Major partner:** Accenture · **Tech partner:** GitHub
- **Project case chosen:** Case 2 -- *AI-Powered Study Companion for
  Filipino Learners* (presented by Accenture)

The case brief asks for an AI study companion that explains concepts
in Filipino and English, generates practice exercises, adapts to a
student's level, and works on low-bandwidth, mobile-first
environments.

## Our niche

We deliberately did not build a general-purpose tutor that tries to
cover every study need at once. Instead, **Dunong narrows in on one
specific, underserved gap: oral confidence and recitation anxiety**
among Filipino high school and college students.

Dunong is not "AI that teaches you everything" -- it's AI that helps
you find your voice out loud, in a private, judgment-free space,
before you have to do it in front of a real classroom. Every
mechanic in the app -- the scan-and-lock, the voice loop, the
difficulty ladder, the feedback engine -- exists in service of that
one outcome. We are trading breadth for depth on purpose: it's what
makes the project memorable, differentiated from the generic
Q&A-chatbot submissions this case will likely attract, and
genuinely finishable in a hackathon timeframe.

## How it works

1. **Scan** -- point the camera at a printed DepEd module (or upload
   a photo). On-device text recognition finds paragraphs and math
   problems and shows a **"Tama ba?"** confirmation step so the
   student can fix anything misread before continuing.
2. **Lock** ("Sipat-Aral") -- tap the specific paragraph or problem
   to recite. Only that extracted text is used as context -- the
   image itself never leaves the phone.
3. **Recite** ("Sabihin mo") -- instead of asking the AI a question,
   the student explains the locked text out loud, in Filipino,
   English, or naturally code-switched. Difficulty climbs through a
   **confidence ladder**: read-aloud → paraphrase → cold-call →
   stand-and-deliver -- each step raising social pressure, not just
   content difficulty.
4. **Feedback** -- the system scores accuracy, clarity, and
   confidence (filler words, hesitation, pace), then responds with
   something specific and encouraging, never just "wrong."
5. **Track** -- a dashboard turns invisible progress (getting
   braver) into something visible: a weekly points ring, skill
   rings, a streak tracker, and a points-per-day bar chart.

Only the OCR'd text and the speech-to-text transcript -- a few KB --
ever touch the network, which is what makes the low-bandwidth claim
in the case brief actually true rather than aspirational.

---

## ✅ Developed

This is a real, working scaffold, not pseudocode -- the backend has
been run and tested end to end (health check, scoring, dashboard
aggregation all verified returning correct data), and the mobile
source tree is complete and syntax-checked clean.

**Backend (FastAPI)**
- `/recite/feedback` -- LLM-judged accuracy scoring with bilingual,
  encouraging feedback text; filler-word counting; clarity and
  confidence scoring; points calculation; streak tracking
- `/dashboard/{user_id}` -- weekly points, skill-score averages,
  streak calendar, points-per-day, filler-word trend
- Mock-mode fallback when no LLM API key is set, so the team isn't
  blocked on API access and a demo never breaks from a rate limit
- SQLite persistence (sessions + per-user profile rollup)

**Mobile app (Expo / React Native + TypeScript)**
- Home screen -- streak badge, points-today glance, scan CTA,
  resume-last-session card
- Scan screen -- camera capture (photo only, not real-time feed),
  gallery upload fallback, tap-to-lock ("Sipat-Aral")
- Recitation screen -- confidence ladder selector, mic record loop,
  live transcript display
- Feedback screen -- points earned, three skill rings (accuracy /
  clarity / confidence), spoken feedback read aloud
- Dashboard screen -- weekly points ring, skill rings, streak
  tracker, points-per-day bar chart
- Hybrid online/offline routing service -- checks connectivity,
  calls the cloud backend when online, falls back to a working
  rule-based local scorer when offline, queues offline sessions for
  later sync
- On-device OCR and speech (STT/TTS) service wrappers

## 🔧 Planned / not yet implemented

Said plainly, so nothing here gets overclaimed in the pitch:

- **"Socrates" guided discovery loop** -- the newest feature on our
  list: instead of a single cold-call follow-up, the AI responds to
  the student's explanation with probing, redirecting, or affirming
  follow-up questions in a real back-and-forth, continuing until the
  student arrives at the answer themselves. Cold-call mode currently
  only swaps the prompt text -- the actual dynamic follow-up-question
  generation is not built yet.
- **Live camera feed (real-time scan without capturing a photo)** --
  current implementation requires the user to take a still photo
  first; continuous frame analysis is not yet built.
- **On-device VLM / true offline LLM** -- the current offline
  fallback is a mock/rule-based scorer. A real bundled quantized
  model (e.g. a GGUF served locally) is not yet integrated.
- **Native module linking for camera OCR + voice recognition** on a
  real device build -- needs an EAS dev build or `expo prebuild`;
  Expo Go alone won't fully support these native modules.
- **Editing/flagging misread OCR text** and saving corrections as a
  personal note -- the "Tama ba?" step currently confirms or
  re-scans, but doesn't yet support inline editing of misread text.
- **Offline queue reconciliation** -- sessions completed offline are
  already queued locally, but nothing yet re-submits that queue once
  connectivity returns.
- **Vocabulary growth and pause-length trend metrics** -- listed in
  our feature spec and dashboard design, not yet computed by the
  backend (current dashboard covers points, streak, the three skill
  scores, and filler-word trend only).

---

## Architecture

```
Mobile app (Expo / React Native)
  Camera scan --on-device OCR--> locked text ("Sipat-Aral")
  Mic --on-device speech-to-text--> transcript
  llmService.ts checks connectivity:
    online  -> POST locked text + transcript to backend (few KB)
    offline -> local rule-based scorer, queues for sync later
                  |
                  v
Backend (FastAPI)
  /recite/feedback -> LLM judges accuracy + writes feedback,
                       speech_analysis.py scores confidence/clarity,
                       points + streak computed, saved to SQLite
  /dashboard/{id}  -> aggregates the week's sessions for the
                       rings, bar chart, and streak tracker
```

## Tech stack

- **Mobile:** Expo (React Native), TypeScript, React Navigation,
  react-native-svg, AsyncStorage, ML Kit (on-device OCR),
  `@react-native-voice/voice` (STT), `expo-speech` (TTS)
- **Backend:** FastAPI, SQLAlchemy + SQLite, httpx
- **AI:** Gemini Flash / GPT-4o mini (cloud reasoning), rule-based
  fallback scorer (offline mode)

## Running it

**Backend**
```bash
cd backend
cp .env.example .env        # add a Gemini or OpenAI key, or leave
                             # blank to run in mock mode
pip install -r requirements.txt
uvicorn main:app --reload
```
Verify it's alive: `curl http://localhost:8000/health`

**Mobile**
```bash
cd mobile
npm install
EXPO_PUBLIC_API_URL=http://<your-laptop-LAN-IP>:8000 npx expo start
```
Use Expo Go on a physical phone, or an Android/iOS simulator. Set
`EXPO_PUBLIC_API_URL` to your machine's LAN IP, not `localhost`, when
testing on a real device.

## Honest implementation notes -- for pitch Q&A

**On-device OCR vs. true VLM.** Text recognition is genuinely
on-device and free, but it reads characters, not semantic math
structure -- it won't natively know "x²" means "x squared." The
backend LLM re-interprets the raw OCR string with context, which
covers most cases. A real VLM would handle math notation better, at
the direct cost of no longer being a "few KB" payload.

**Points formula** lives in `backend/services/speech_analysis.py` --
a guaranteed floor for attempting, plus bonuses scaled by accuracy
and confidence, proportionally higher for harder ladder levels.
