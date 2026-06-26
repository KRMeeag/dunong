import { useState, useCallback, useEffect, Component, ReactNode } from "react";
import { checkHealth } from "./services/api";
import { Session, ChatMessage, ChatSession, Notebook, Scores, Source } from "./types";
import StatusBar from "./components/StatusBar";
import BottomNav from "./components/BottomNav";
import LandingScreen from "./screens/LandingScreen";
import OnboardingScreen from "./screens/OnboardingScreen";
import HomeScreen from "./screens/HomeScreen";
import PracticeScreen from "./screens/PracticeScreen";
import ChatScreen from "./screens/ChatScreen";
import RecitationScreen from "./screens/RecitationScreen";
import LibraryScreen from "./screens/LibraryScreen";
import ProfileScreen from "./screens/ProfileScreen";

class ErrorBoundary extends Component<{ children: ReactNode }, { error: string | null }> {
  state = { error: null };
  static getDerivedStateFromError(e: Error) { return { error: e.message }; }
  componentDidCatch(e: Error) { console.error("[ErrorBoundary]", e); }
  render() {
    if (this.state.error)
      return (
        <div style={{ padding: 24, color: "#4B4032", background: "#FFF9EE", height: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
          <strong style={{ fontSize: 14 }}>Something crashed — check the browser Console (F12) for the full error.</strong>
          <code style={{ fontSize: 11, background: "#F4E3B2", padding: 10, borderRadius: 10, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{this.state.error}</code>
          <button onClick={() => this.setState({ error: null })} style={{ padding: "8px 16px", borderRadius: 999, background: "#4B4032", color: "#FFF9EE", border: "none", fontSize: 12, cursor: "pointer" }}>Try again</button>
        </div>
      );
    return this.props.children;
  }
}

export default function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [practiceKey, setPracticeKey] = useState(0);
  const [userName, setUserName] = useState("Learner");
  const [lang, setLang] = useState("FIL");
  const [streak, setStreak] = useState(0);
  const [points, setPoints] = useState(0);
  const [history, setHistory] = useState<Session[]>([]);
  const [practiceDefaultMode, setPracticeDefaultMode] = useState("Paraphrase");
  const [practicePreloadedText, setPracticePreloadedText] = useState<string | undefined>(undefined);
  const [practiceReturnTab, setPracticeReturnTab] = useState<string>("home");
  const [chatSessions, setChatSessions] = useState<ChatSession[]>(() => {
    const id = "default-chat";
    return [{ id, title: "New Chat", messages: [], createdAt: new Date().toLocaleDateString() }];
  });
  const [activeChatId, setActiveChatId] = useState<string>("default-chat");
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);

  useEffect(() => {
    checkHealth().then((ok) => {
      if (ok) console.log("Successfully connected to the Dunong backend API.");
      else console.error("Failed to connect to the backend API.");
    });
  }, []);

  const handleDone = useCallback((scores: Scores, feedback: string) => {
    const earned = Math.round(
      (scores.accuracy + scores.confidence + scores.clarity) / 3,
    );
    setPoints((p) => p + earned);
    setStreak((s) => s + 1);
    setHistory((h) => [
      ...h,
      { scores, feedback, date: new Date().toISOString().slice(0, 10) },
    ]);
  }, []);

  const handleScanComplete = useCallback((text: string) => {
    const src: Source = {
      id: Date.now().toString() + "_s",
      type: "image",
      label: "Scanned Text",
      content: text,
    };
    const nb: Notebook = {
      id: Date.now().toString(),
      title: `Scan – ${new Date().toLocaleDateString()}`,
      sources: [src],
      chatMessages: [],
      flashcards: [],
      quiz: [],
      createdAt: new Date().toLocaleDateString(),
    };
    setNotebooks((prev) => [nb, ...prev]);
  }, []);

  const handleScanPress = useCallback(
    (mode?: string) => {
      if (mode) setPracticeDefaultMode(mode);
      setPracticePreloadedText(undefined);
      setPracticeReturnTab("home");
      if (activeTab === "practice") {
        setPracticeKey((k) => k + 1);
      } else {
        setActiveTab("practice");
        setPracticeKey((k) => k + 1);
      }
    },
    [activeTab],
  );

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        background:
          "linear-gradient(135deg, #2C2416 0%, #1A1209 60%, #0D0A04 100%)",
      }}
    >
      <div
        className="relative flex flex-col bg-[#FFF9EE]"
        style={{
          width: 370,
          height: 800,
          borderRadius: 44,
          overflow: "hidden",
          boxShadow:
            "0 40px 80px rgba(0,0,0,0.6), 0 0 0 10px #1A1209, inset 0 0 0 1px rgba(255,255,255,0.08)",
        }}
      >
        {/* Notch */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 z-30"
          style={{
            width: 120,
            height: 28,
            background: "#1A1209",
            borderRadius: "0 0 20px 20px",
          }}
        />

        {/* Status bar */}
        <div className="shrink-0 pt-7 z-20">
          <StatusBar />
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          {showLanding ? (
            <LandingScreen
              onStart={() => {
                setShowLanding(false);
                setShowOnboarding(true);
              }}
            />
          ) : showOnboarding ? (
            <OnboardingScreen
              onDone={() => setShowOnboarding(false)}
              lang={lang}
              setLang={setLang}
            />
          ) : (
            <>
              <div className="flex-1 overflow-hidden min-h-0">
                {activeTab === "home" && (
                  <HomeScreen
                    onPractice={handleScanPress}
                    onProfile={() => setActiveTab("profile")}
                    onLibrary={() => setActiveTab("library")}
                    userName={userName}
                    points={points}
                    notebookCount={notebooks.length}
                    history={history}
                    lang={lang}
                  />
                )}
                {activeTab === "practice" && (
                  <ErrorBoundary key={practiceKey}>
                    <PracticeScreen
                      key={practiceKey}
                      onDone={handleDone}
                      lang={lang}
                      onBack={() => setActiveTab(practiceReturnTab)}
                      defaultMode={practiceDefaultMode}
                      onScanComplete={handleScanComplete}
                      preloadedText={practicePreloadedText}
                    />
                  </ErrorBoundary>
                )}
                {activeTab === "chat" && (
                  <ChatScreen
                    lang={lang}
                    sessions={chatSessions}
                    setSessions={setChatSessions}
                    activeChatId={activeChatId}
                    setActiveChatId={setActiveChatId}
                  />
                )}
                {activeTab === "recitation" && (
                  <RecitationScreen
                    onStartMode={handleScanPress}
                    history={history}
                    lang={lang}
                  />
                )}
                {activeTab === "library" && (
                  <LibraryScreen
                    notebooks={notebooks}
                    setNotebooks={setNotebooks}
                    lang={lang}
                    onPractice={(mode, text) => {
                      setPracticeDefaultMode(mode);
                      setPracticePreloadedText(text);
                      setPracticeReturnTab("library");
                      setPracticeKey((k) => k + 1);
                      setActiveTab("practice");
                    }}
                    onEarnPoints={(pts) => setPoints((p) => p + pts)}
                  />
                )}
                {activeTab === "profile" && (
                  <ProfileScreen
                    userName={userName}
                    streak={streak}
                    points={points}
                    sessions={history.length}
                    lang={lang}
                    setLang={setLang}
                    setUserName={setUserName}
                  />
                )}
              </div>
              <BottomNav
                active={activeTab}
                onChange={setActiveTab}
                onScanPress={handleScanPress}
              />
            </>
          )}
        </div>

        {/* Home indicator */}
        <div
          className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 w-28 h-1 rounded-full"
          style={{ background: "rgba(75,64,50,0.25)" }}
        />
      </div>

      <p className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/20 text-xs font-bold tracking-widest uppercase">
        Dunong · AI Recitation Coach
      </p>
    </div>
  );
}
