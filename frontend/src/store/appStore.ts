import { create } from 'zustand'

export type Lang = 'EN' | 'FIL'
export type RecitationMode = 'paraphrase' | 'read-aloud' | 'cold-call' | 'stand-deliver'

export interface Session {
  lockedText: string
  subject: string
  mode: RecitationMode
  transcript: string
  scores: { accuracy: number; confidence: number; clarity: number }
  fillerWordDrop: number
  pauseDrop: number
  feedback: string
}

interface AppState {
  lang: Lang
  setLang: (l: Lang) => void
  userName: string
  setUserName: (n: string) => void
  streak: number
  points: number
  confidence: number
  sessions: number
  scannedText: string
  setScannedText: (t: string) => void
  currentSession: Partial<Session>
  setSessionField: <K extends keyof Session>(k: K, v: Session[K]) => void
  resetSession: () => void
  history: Session[]
  addHistory: (s: Session) => void
}

export const useAppStore = create<AppState>((set) => ({
  lang: 'EN',
  setLang: (l) => set({ lang: l }),
  userName: 'Liwayway',
  setUserName: (n) => set({ userName: n }),
  streak: 12,
  points: 82,
  confidence: 74,
  sessions: 5,
  scannedText: '',
  setScannedText: (t) => set({ scannedText: t }),
  currentSession: { mode: 'paraphrase' },
  setSessionField: (k, v) => set((s) => ({ currentSession: { ...s.currentSession, [k]: v } })),
  resetSession: () => set({ currentSession: { mode: 'paraphrase' } }),
  history: [],
  addHistory: (s) => set((state) => ({
    history: [s, ...state.history],
    sessions: state.sessions + 1,
    confidence: Math.min(100, Math.round((state.confidence + s.scores.confidence) / 2)),
    points: state.points + Math.round((s.scores.accuracy + s.scores.confidence + s.scores.clarity) / 3),
  })),
}))
