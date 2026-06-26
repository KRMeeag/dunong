import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function scanImageWithVLM(base64: string): Promise<string> {
  const response = await groq.chat.completions.create({
    model: 'meta-llama/llama-4-scout-17b-16e-instruct',
    messages: [{
      role: 'user',
      content: [
        { type: 'text', text: 'Extract all the text from this image exactly as it appears. Return only the extracted text, no commentary.' },
        { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64}` } }
      ]
    }],
    max_tokens: 2048,
  })
  return response.choices[0].message.content?.trim() ?? ''
}

export async function transcribeWithWhisper(audioBuffer: Buffer, filename: string): Promise<string> {
  const ab = audioBuffer.buffer instanceof SharedArrayBuffer
    ? new Uint8Array(audioBuffer).buffer
    : audioBuffer.buffer.slice(audioBuffer.byteOffset, audioBuffer.byteOffset + audioBuffer.byteLength) as ArrayBuffer
  const type = filename.endsWith('.mp4') ? 'audio/mp4' : 'audio/webm'
  const file = new File([ab], filename, { type })
  const response = await groq.audio.transcriptions.create({
    file,
    model: 'whisper-large-v3-turbo',
  })
  return response.text
}

export interface CoachParams {
  lockedText: string
  transcript: string
  mode: string
  lang: string
}

export interface CoachResponse {
  type: string
  message: string
  accuracy: number
  confidence: number
  clarity: number
  fillerWords: number
  pauseTime: number
  feedback: string
}

export async function getCoachResponse(params: CoachParams): Promise<CoachResponse> {
  const { lockedText, transcript, mode, lang } = params
  const systemPrompt = lang === 'FIL'
    ? 'Ikaw ay isang AI coach para sa recitation. Magbigay ng feedback sa Filipino. Tumugon sa JSON.'
    : 'You are an AI recitation coach. Give feedback in English. Respond in JSON.'

  const userPrompt = `Source text: "${lockedText}"
Student recitation (mode: ${mode}): "${transcript}"

Evaluate and return JSON with these exact keys:
{
  "type": "encouragement" | "correction" | "question",
  "message": "short Socratic follow-up or encouragement (1-2 sentences)",
  "accuracy": <0-100>,
  "confidence": <0-100>,
  "clarity": <0-100>,
  "fillerWords": <count of filler words like "um", "ah", "ano">,
  "pauseTime": <estimated avg pause in seconds, 1 decimal>,
  "feedback": "detailed coaching feedback (2-3 sentences)"
}`

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    response_format: { type: 'json_object' },
    max_tokens: 512,
  })

  const raw = JSON.parse(response.choices[0].message.content ?? '{}')
  return {
    type: raw.type ?? 'encouragement',
    message: raw.message ?? '',
    accuracy: Number(raw.accuracy) || 0,
    confidence: Number(raw.confidence) || 0,
    clarity: Number(raw.clarity) || 0,
    fillerWords: Number(raw.fillerWords) || 0,
    pauseTime: Number(raw.pauseTime) || 0,
    feedback: raw.feedback ?? '',
  }
}

export async function chatWithCompanion(
  messages: { role: 'user' | 'assistant'; content: string }[],
  lang = 'FIL',
  context?: string
): Promise<string> {
  const ctxNote = context
    ? lang === 'FIL'
      ? `\n\nKonteksto ng pag-aaral ng estudyante: "${context}"`
      : `\n\nStudent's current study context: "${context}"`
    : ''
  const systemPrompt = lang === 'FIL'
    ? `Ikaw si Dunong, isang maaasahan at masayang AI study companion para sa mga high school at college students sa Pilipinas. Esperto ka sa lahat ng pangunahing paksa: Mathematics (Algebra, Geometry, Trigonometry, Statistics, Calculus), Science (Biology, Chemistry, Physics, Earth Science), Filipino (Gramatika, Panitikan), Araling Panlipunan (Kasaysayan ng Pilipinas at Mundo), at English (Grammar, Literature). Mag-usap sa natural na Filipino, English, o Taglish — ayon sa kung paano nagsasalita ang estudyante. Para sa Math at Science, magbigay ng step-by-step na paliwanag kasama ang tamang formulas. Maging maikling at malinaw (1-3 pangungusap para sa simpleng tanong, mas detalyado kung kailangan). Huwag gumamit ng markdown bullets o headers sa iyong mga sagot.${ctxNote}`
    : `You are Dunong, a friendly and knowledgeable AI study companion for Filipino high school and college students. You are an expert across all major subjects: Mathematics (Algebra, Geometry, Trigonometry, Statistics, Calculus), Science (Biology, Chemistry, Physics, Earth Science), Filipino (Grammar, Literature), Araling Panlipunan (Philippine and World History), and English (Grammar, Literature, Essay Writing). Respond naturally in English, Filipino, or Taglish — matching the student's register. For Math and Science, provide step-by-step explanations with correct formulas and examples. Be concise for simple questions (1-3 sentences), more detailed when depth is needed. Do not use markdown bullets or headers.${ctxNote}`

  const fallback = lang === 'FIL'
    ? 'Paumanhin, hindi ko masagot iyan ngayon. Subukan mo ulit.'
    : 'Sorry, I could not answer that right now. Please try again.'

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    ],
    max_tokens: 512,
  })
  return response.choices[0].message.content?.trim() ?? fallback
}

export async function askQuestion(context: string, question: string, lang = 'FIL'): Promise<string> {
  const systemPrompt = lang === 'FIL'
    ? 'Ikaw si Dunong, isang matulunging AI tutor. Sagutin ang tanong base sa ibinigay na konteksto. Maging malinaw at maikli.'
    : 'You are Dunong, a helpful AI tutor. Answer the question based on the given context. Be clear and concise.'
  const userPrompt = lang === 'FIL'
    ? `Konteksto: "${context}"\n\nTanong: ${question}`
    : `Context: "${context}"\n\nQuestion: ${question}`
  const fallback = lang === 'FIL' ? 'Hindi ko masagot iyon ngayon.' : 'I cannot answer that right now.'
  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    max_tokens: 256,
  })
  return response.choices[0].message.content?.trim() ?? fallback
}

export async function generateStudio(content: string, lang = 'FIL'): Promise<{
  flashcards: { q: string; a: string }[];
  quiz: { question: string; choices: string[]; answer: number }[];
}> {
  const prompt = lang === 'FIL'
    ? `Base sa tekstong ito, gumawa ng 4 flashcards at 3 multiple-choice questions. Ang bawat flashcard ay may "q" at "a". Ang bawat quiz item ay may "question", "choices" (array ng 4), at "answer" (index 0-3 ng tamang sagot). Tumugon sa JSON.\n\nTeksto: "${content.slice(0, 3000)}"`
    : `Based on this text, generate 4 flashcards and 3 multiple-choice questions. Each flashcard has "q" and "a". Each quiz item has "question", "choices" (array of 4), and "answer" (correct index 0-3). Respond in JSON.\n\nText: "${content.slice(0, 3000)}"`
  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    max_tokens: 1024,
  })
  const raw = JSON.parse(response.choices[0].message.content ?? '{}')
  return {
    flashcards: Array.isArray(raw.flashcards) ? raw.flashcards : [],
    quiz: Array.isArray(raw.quiz) ? raw.quiz : [],
  }
}

export async function generateOralCards(
  content: string,
  mode: 'paraphrase' | 'quiz-bee' | 'recitation',
  count: number,
  lang: string
): Promise<{ id: string; content: string; hint?: string }[]> {
  const isFil = lang === 'FIL';
  const prompts: Record<string, string> = {
    'paraphrase': isFil
      ? `Mula sa tekstong ito, kunin ang ${count} pangunahing termino o konsepto. Para sa bawat isa, ibigay ang "content" (ang termino mismo) at "hint" (isang pangungusap na nagpapaliwanag ng konteksto). Tumugon sa JSON: {"cards":[{"content":"...","hint":"..."},...]}.\n\nTeksto: "${content.slice(0, 3000)}"`
      : `From this text, extract ${count} key terms or concepts. For each, provide "content" (the exact term) and "hint" (a sentence explaining its context). Respond in JSON: {"cards":[{"content":"...","hint":"..."},...]}.\n\nText: "${content.slice(0, 3000)}"`,
    'quiz-bee': isFil
      ? `Mula sa tekstong ito, gumawa ng ${count} quiz bee definition cards. Ang "content" ay ang kahulugan/description at ang "hint" ay ang tamang termino/sagot. Tumugon sa JSON: {"cards":[{"content":"...","hint":"..."},...]}.\n\nTeksto: "${content.slice(0, 3000)}"`
      : `From this text, create ${count} quiz bee definition cards. The "content" is the definition/description and "hint" is the correct term/answer. Respond in JSON: {"cards":[{"content":"...","hint":"..."},...]}.\n\nText: "${content.slice(0, 3000)}"`,
    'recitation': isFil
      ? `Mula sa tekstong ito, gumawa ng ${count} "Ano ito?" o "Ipaliwanag ang..." na tanong. Ang "content" ay ang tanong at ang "hint" ay ang pangunahing ideya ng tamang sagot. Tumugon sa JSON: {"cards":[{"content":"...","hint":"..."},...]}.\n\nTeksto: "${content.slice(0, 3000)}"`
      : `From this text, generate ${count} "What is...?" or "Explain..." questions. The "content" is the question and "hint" is the key idea of the correct answer. Respond in JSON: {"cards":[{"content":"...","hint":"..."},...]}.\n\nText: "${content.slice(0, 3000)}"`,
  };
  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompts[mode] }],
    response_format: { type: 'json_object' },
    max_tokens: 1024,
  });
  const raw = JSON.parse(response.choices[0].message.content ?? '{}');
  const cards = Array.isArray(raw.cards) ? raw.cards : [];
  return cards.slice(0, count).map((c: any, i: number) => ({
    id: `oral_${i}`,
    content: String(c.content ?? ''),
    hint: c.hint ? String(c.hint) : undefined,
  }));
}

export async function scoreOralResponse(
  mode: string,
  cardContent: string,
  transcript: string,
  lang: string
): Promise<{ score: number; label: string; feedback: string }> {
  const isFil = lang === 'FIL';
  const prompts: Record<string, string> = {
    'read-aloud': isFil
      ? `Ikaw ay guro ng pagbabasa. Suriin kung nabasa nang tama ang talata.\n\nTALATA: "${cardContent.slice(0, 500)}"\n\nSINABI NG MAG-AARAL: "${transcript}"\n\nScore 1-10, label (Expert/Proficient/Developing/Beginner/Needs Improvement), maikling feedback sa Filipino. JSON: {"score":number,"label":string,"feedback":string}`
      : `You are a reading teacher. Evaluate the student's reading of this paragraph.\n\nPARAGRAPH: "${cardContent.slice(0, 500)}"\n\nSTUDENT SAID: "${transcript}"\n\nScore 1-10 (10=perfect match), label (Expert/Proficient/Developing/Beginner/Needs Improvement), brief feedback. JSON: {"score":number,"label":string,"feedback":string}`,
    'paraphrase': isFil
      ? `TERMINO/KONSEPTO: "${cardContent}"\n\nPAGPAPALIWANAG NG MAG-AARAL: "${transcript}"\n\nSuriin kung tama at kumpleto ang paliwanag. Score 1-10, label (Expert/Proficient/Developing/Beginner/Needs Improvement), feedback sa Filipino. JSON: {"score":number,"label":string,"feedback":string}`
      : `TERM/CONCEPT: "${cardContent}"\n\nSTUDENT EXPLANATION: "${transcript}"\n\nCheck correctness and completeness of the explanation. Score 1-10, label (Expert/Proficient/Developing/Beginner/Needs Improvement), brief feedback. JSON: {"score":number,"label":string,"feedback":string}`,
    'quiz-bee': isFil
      ? `KAHULUGAN: "${cardContent}"\n\nSAGOT NG MAG-AARAL: "${transcript}"\n\nSuriin kung nabanggit ang tamang termino. Score 1-10, label (Expert/Proficient/Developing/Beginner/Needs Improvement), feedback sa Filipino. JSON: {"score":number,"label":string,"feedback":string}`
      : `DEFINITION: "${cardContent}"\n\nSTUDENT ANSWER: "${transcript}"\n\nCheck if the student correctly named the term. Score 1-10, label (Expert/Proficient/Developing/Beginner/Needs Improvement), brief feedback. JSON: {"score":number,"label":string,"feedback":string}`,
    'recitation': isFil
      ? `TANONG: "${cardContent}"\n\nSAGOT NG MAG-AARAL: "${transcript}"\n\nSuriin kung tama at detalyado ang sagot. Score 1-10, label (Expert/Proficient/Developing/Beginner/Needs Improvement), feedback sa Filipino. JSON: {"score":number,"label":string,"feedback":string}`
      : `QUESTION: "${cardContent}"\n\nSTUDENT ANSWER: "${transcript}"\n\nCheck correctness and detail of the explanation. Score 1-10, label (Expert/Proficient/Developing/Beginner/Needs Improvement), brief feedback. JSON: {"score":number,"label":string,"feedback":string}`,
  };
  const prompt = prompts[mode] ?? prompts['read-aloud'];
  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    max_tokens: 300,
  });
  const raw = JSON.parse(response.choices[0].message.content ?? '{}');
  return {
    score: Math.min(10, Math.max(1, Math.round(Number(raw.score) || 5))),
    label: String(raw.label || 'Developing'),
    feedback: String(raw.feedback || 'Keep practicing!'),
  };
}
