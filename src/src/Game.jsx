import { useState, useEffect, useCallback } from "react";

const PUZZLE = {
  id: "demo-1",
  groups: [
    { category: "בכיתה", difficulty: 1, color: "#58B8A0", words: ["לוח", "מורה", "מבחן"], hint1: "חשבי על מקום שנמצאות בו כל יום... 🏫", hint2: "בקורס ההוראה של עתודה תלמדי איך להפוך כל כיתה לחוויה!" },
    { category: "בעיצוב גרפי", difficulty: 2, color: "#7B8FD4", words: ["פונט", "רקע", "מסגרת"], hint1: "חשבי על דברים שרואים כשפותחים קנבה... 🎨", hint2: "בקורס הגרפיקה של עתודה תלמדי לעצב כמו מקצוענית!" },
    { category: "בהנהלת חשבונות", difficulty: 3, color: "#E88B8B", words: ["מאזן", "קבלה", "תקציב"], hint1: "חשבי על מושגים שקשורים לעולם המספרים והכסף 💰", hint2: "בקורס ראיית החשבון של עתודה תגלי שמספרים זה דווקא כיף!" },
    { category: "בייעוץ", difficulty: 4, color: "#F0C94B", words: ["הקשבה", "אמפתיה", "שיחה"], hint1: "חשבי על מה שצריך כשמישהי באה לדבר על מה שעל הלב... 💛", hint2: "בקורס הייעוץ של עתודה תלמדי כלים מקצועיים לעזור לאחרות!" },
    { category: "_ מקצועי/ת", difficulty: 5, color: "#C490D1", words: ["תעודה", "התמחות", "דעה"], hint1: "חשבי על מילה שמחברת את כולן... ✨", hint2: "בעתודה תקבלי הכשרה מקצועית שפותחת דלתות — תעודה, התמחות, ודעה מקצועית!" },
  ],
};

const MAX_GUESSES = 6, GROUP_SIZE = 3, NUM_GROUPS = 5, MAX_HINTS = 2;

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export default function App() {
  const [screen, setScreen] = useState("welcome");
  const [playerName, setPlayerName] = useState("");
  const [words, setWords] = useState([]);
  const [selected, setSelected] = useState([]);
  const [solved, setSolved] = useState([]);
  const [guessesLeft, setGuessesLeft] = useState(MAX_GUESSES);
  const [shakeWords, setShakeWords] = useState([]);
  const [almostMsg, setAlmostMsg] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [guessHistory, setGuessHistory] = useState([]);
  const [showHelp, setShowHelp] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [currentHint, setCurrentHint] = useState(null);
  const [shuffleKey, setShuffleKey] = useState(0);

  const puzzle = PUZZLE;

  const initGame = useCallback(() => {
    setWords(shuffle(puzzle.groups.flatMap((g) => g.words)));
    setSelected([]); setSolved([]); setGuessesLeft(MAX_GUESSES);
    setShakeWords([]); setAlmostMsg(false); setGameOver(false);
    setWon(false); setGuessHistory([]); setHintsUsed(0);
    setCurrentHint(null); setShuffleKey(k => k + 1);
  }, []);

  useEffect(() => { initGame(); }, [initGame]);

  const handleWordClick = (word) => {
    if (gameOver || solved.some((g) => g.words.includes(word))) return;
    setCurrentHint(null);
    if (selected.includes(word)) setSelected(selected.filter((w) => w !== word));
    else if (selected.length < GROUP_SIZE) setSelected([...selected, word]);
  };

  const handleCheck = () => {
    if (selected.length !== GROUP_SIZE) return;
    setCurrentHint(null);
    const match = puzzle.groups.find((g) => !solved.includes(g) && g.words.every((w) => selected.includes(w)) && selected.every((w) => g.words.includes(w)));
    if (match) {
      const ns = [...solved, match]; setSolved(ns); setSelected([]); setAlmostMsg(false);
      setGuessHistory(h => [...h, { colors: selected.map((w) => puzzle.groups.find((g) => g.words.includes(w)).color), correct: true }]);
      if (ns.length === NUM_GROUPS) setTimeout(() => { setWon(true); setGameOver(true); }, 800);
    } else {
      const ng = guessesLeft - 1; setGuessesLeft(ng);
      if (puzzle.groups.some((g) => !solved.includes(g) && selected.filter((w) => g.words.includes(w)).length === GROUP_SIZE - 1)) {
        setAlmostMsg(true); setTimeout(() => setAlmostMsg(false), 2500);
      }
      setShakeWords([...selected]); setTimeout(() => setShakeWords([]), 600);
      setGuessHistory(h => [...h, { colors: selected.map((w) => puzzle.groups.find((g) => g.words.includes(w)).color), correct: false }]);
      if (ng <= 0) setTimeout(() => revealAll([...solved]), 800);
    }
  };

  const revealAll = (cur) => {
    const u = puzzle.groups.filter((g) => !cur.includes(g));
    let i = 0;
    const next = () => {
      if (i < u.length) { cur = [...cur, u[i]]; setSolved([...cur]); i++; setTimeout(next, 500); }
      else setTimeout(() => { setGameOver(true); setWon(false); }, 600);
    };
    next();
  };

  const handleHint = () => {
    if (hintsUsed >= MAX_HINTS || gameOver) return;
    const group = puzzle.groups.filter((g) => !solved.includes(g)).sort((a, b) => a.difficulty - b.difficulty)[0];
    if (!group) return;
    const n = hintsUsed + 1;
    setCurrentHint(n === 2 ? { type: "marketing", category: group.category, text: group.hint2, color: group.color } : { type: "subtle", text: group.hint1, color: group.color });
    setHintsUsed(n);
  };

  const handleShuffle = () => {
    const sv = words.filter((w) => solved.some((g) => g.words.includes(w)));
    const uv = words.filter((w) => !solved.some((g) => g.words.includes(w)));
    setWords([...sv, ...shuffle(uv)]); setShuffleKey(k => k + 1);
  };

  const handleShare = async () => {
    const em = { [puzzle.groups[0].color]: "🟢", [puzzle.groups[1].color]: "🔵", [puzzle.groups[2].color]: "🔴", [puzzle.groups[3].color]: "🟡", [puzzle.groups[4].color]: "🟣" };
    const rows = guessHistory.map((g) => g.colors.map((c) => em[c] || "⬜").join("")).join("\n");
    const hi = hintsUsed > 0 ? ` (💡${hintsUsed})` : "";
    const text = `✨ חידת קשרים — עתודה ✨\n${won ? `פתרתי ב-${guessHistory.length} ניחושים${hi}!` : "לא הצלחתי הפעם 😅"}\n\n${rows}\n\nנסי גם →`;
    try { await navigator.clipboard.writeText(text); alert("הועתק! 📋"); } catch { const t = document.createElement("textarea"); t.value = text; document.body.appendChild(t); t.select(); document.execCommand("copy"); document.body.removeChild(t); alert("הועתק! 📋"); }
  };

  const unsolved = words.filter((w) => !solved.some((g) => g.words.includes(w)));

  // ─── WELCOME ───
  if (screen === "welcome") {
    return (
      <div style={S.page}>
        <div style={S.welcomeCenter}>
          <div style={S.welcomeCard} className="fade-in">
            <div style={S.wIcon}>✦</div>
            <h1 style={S.wTitle}>חידת קשרים</h1>
            <p style={S.wBrand}>עתודה · מרכז בית יעקב</p>
            <div style={S.wLine} />
            <p style={S.wDesc}>מצאי את הקשר הנסתר בין המילים<br/>5 קבוצות · 15 מילים · קשר אחד</p>
            <input type="text" placeholder="איך קוראים לך?" value={playerName} onChange={(e) => setPlayerName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && playerName.trim() && setScreen("game")} style={S.wInput} dir="rtl" />
            <button onClick={() => playerName.trim() && setScreen("game")} disabled={!playerName.trim()} style={{...S.wBtn, opacity: playerName.trim() ? 1 : 0.4}}>בואי נשחק ✨</button>
            <button onClick={() => setShowHelp(true)} style={S.wLink}>איך משחקים?</button>
          </div>
        </div>
        {showHelp && <Help onClose={() => setShowHelp(false)} />}
        <style>{css}</style>
      </div>
    );
  }

  // ─── GAME ───
  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.header}>
        <h1 style={S.title}>חידת קשרים</h1>
        <p style={S.subtitle}>שלום {playerName} 👋 מצאי 5 קבוצות של 3 מילים</p>
      </div>

      {/* Board Area */}
      <div style={S.boardWrap}>
        {/* Solved groups */}
        {solved.map((g) => (
          <div key={g.category} className="fade-in" style={{...S.solvedBar, backgroundColor: g.color}}>
            <span style={S.solvedCat}>{g.category}</span>
            <span style={S.solvedW}>{g.words.join("  ·  ")}</span>
          </div>
        ))}

        {/* Word grid - 3 columns, 5 rows */}
        {unsolved.length > 0 && (
          <div style={S.grid} key={shuffleKey}>
            {unsolved.map((word, i) => {
              const isSel = selected.includes(word);
              const isShake = shakeWords.includes(word);
              return (
                <button key={word + shuffleKey} onClick={() => handleWordClick(word)} className={`tile ${isShake ? "shake" : ""}`} style={{...S.tile, ...(isSel ? S.tileSel : {}), animationDelay: `${i * 0.02}s`}}>
                  {word}
                </button>
              );
            })}
          </div>
        )}

        {/* Hint bubble */}
        {currentHint && (
          <div className="fade-in" style={{...S.hintBox, borderRightColor: currentHint.color}}>
            {currentHint.type === "marketing" && (
              <div style={S.hintCatRow}><span style={{...S.hintDot, background: currentHint.color}} />הקטגוריה: {currentHint.category}</div>
            )}
            <p style={S.hintText}>{currentHint.text}</p>
            {currentHint.type === "marketing" && <span style={S.hintTag}>💜 עתודה</span>}
          </div>
        )}

        {/* Almost */}
        {almostMsg && <div className="fade-in" style={S.almost}>כמעט! חסרה לך מילה אחת 🫣</div>}
      </div>

      {/* Status bar */}
      <div style={S.statusRow}>
        <div style={S.statusGroup}>
          <span style={S.statusLabel}>ניחושים</span>
          <div style={S.dotsRow}>
            {Array.from({length: MAX_GUESSES}).map((_, i) => (
              <span key={i} style={{...S.dot, background: i < guessesLeft ? "#58B8A0" : "rgba(255,255,255,0.15)"}} />
            ))}
          </div>
        </div>
        <div style={S.statusGroup}>
          <span style={S.statusLabel}>רמזים</span>
          <div style={S.dotsRow}>
            {Array.from({length: MAX_HINTS}).map((_, i) => (
              <span key={i} style={{...S.hintIndicator, opacity: i < (MAX_HINTS - hintsUsed) ? 1 : 0.2}}>💡</span>
            ))}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div style={S.actions}>
        <button onClick={handleShuffle} style={S.btn}>🔀 ערבבי</button>
        <button onClick={() => setSelected([])} disabled={!selected.length} style={{...S.btn, opacity: selected.length ? 1 : 0.3}}>↩ נקי</button>
        <button onClick={handleHint} disabled={hintsUsed >= MAX_HINTS || gameOver} style={{...S.btnHint, opacity: (hintsUsed >= MAX_HINTS || gameOver) ? 0.3 : 1}}>💡 רמז</button>
        <button onClick={handleCheck} disabled={selected.length !== GROUP_SIZE} style={{...S.btnCheck, opacity: selected.length === GROUP_SIZE ? 1 : 0.3}}>בדיקה ✓</button>
      </div>

      {/* Help link */}
      <button onClick={() => setShowHelp(true)} style={S.helpLink}>? איך משחקים</button>

      {/* Footer */}
      <div style={S.footer}>
        <span style={S.footerBrand}>עתודה</span> · לימודי תעודה ומקצוע · מרכז בית יעקב
      </div>

      {/* Game Over Modal */}
      {gameOver && (
        <div style={S.overlay}>
          <div style={S.modal} className="fade-in">
            <div style={{fontSize: 48, marginBottom: 8}}>{won ? "🎉" : "💪"}</div>
            <h2 style={S.mTitle}>{won ? `כל הכבוד ${playerName}!` : "פעם הבאה!"}</h2>
            <p style={S.mText}>{won ? `פתרת ב-${guessHistory.length} ניחושים${hintsUsed > 0 ? ` (${hintsUsed} רמזים)` : ""}` : `לא נורא ${playerName}, כל ניסיון מחכים!`}</p>
            <div style={S.resGrid}>
              {guessHistory.map((g, i) => (
                <div key={i} style={S.resRow}>{g.colors.map((c, j) => <span key={j} style={{...S.resDot, background: c}} />)}</div>
              ))}
            </div>
            <button onClick={handleShare} style={S.modalBtn}>שתפי תוצאות 📤</button>
            <div style={S.mDivider} />
            <div style={S.ctaBox}>
              <p style={S.ctaText}>נהנית? בעתודה יש עוד הרבה דברים מעניינים 🌟</p>
              <button style={S.ctaBtn}>גלי את הקורסים שלנו →</button>
            </div>
            <button onClick={initGame} style={S.mLink}>שחקי שוב 🔄</button>
          </div>
        </div>
      )}

      {showHelp && <Help onClose={() => setShowHelp(false)} />}
      <style>{css}</style>
    </div>
  );
}

function Help({ onClose }) {
  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} className="fade-in" onClick={e => e.stopPropagation()}>
        <h2 style={S.mTitle}>איך משחקים? 🎯</h2>
        <div style={{textAlign: "right", lineHeight: 2.2, fontSize: 14, color: "#555"}}>
          <p>לפנייך <strong>15 מילים</strong> המחולקות ל-<strong>5 קבוצות</strong> של 3 מילים עם קשר משותף.</p>
          <p style={{marginTop: 12}}>
            <strong>כללים:</strong><br/>
            • בחרי 3 מילים ולחצי "בדיקה"<br/>
            • ניחוש נכון — הקבוצה תתגלה<br/>
            • ניחוש שגוי — תפסידי ניחוש<br/>
            • צדקת ב-2 מתוך 3 — תקבלי "כמעט!"<br/>
            • 6 ניחושים · 2 רמזים
          </p>
          <p style={{marginTop: 12}}>
            <strong>רמזים 💡</strong><br/>
            • רמז ראשון — טיפ עדין<br/>
            • רמז שני — שם הקטגוריה + טיפ מעתודה
          </p>
        </div>
        <button onClick={onClose} style={{...S.modalBtn, marginTop: 20}}>הבנתי! 👍</button>
      </div>
    </div>
  );
}

const S = {
  // Page
  page: { direction: "rtl", minHeight: "100vh", background: "linear-gradient(170deg, #1a1250 0%, #241868 50%, #1e1458 100%)", fontFamily: "'Heebo', sans-serif", display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 16px 8px", boxSizing: "border-box" },

  // Welcome
  welcomeCenter: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", width: "100%" },
  welcomeCard: { background: "rgba(255,255,255,0.95)", borderRadius: 24, padding: "44px 32px 32px", textAlign: "center", maxWidth: 380, width: "100%", boxShadow: "0 12px 48px rgba(0,0,0,0.3)" },
  wIcon: { width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg, #302070, #4a35a0)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, margin: "0 auto 16px", boxShadow: "0 4px 16px rgba(48,32,112,0.3)" },
  wTitle: { fontSize: 28, fontWeight: 800, color: "#302070", margin: "0 0 4px" },
  wBrand: { fontSize: 12, color: "#999", letterSpacing: 2, margin: "0 0 16px" },
  wLine: { width: 40, height: 3, borderRadius: 2, background: "linear-gradient(90deg, #58B8A0, #C490D1)", margin: "0 auto 16px" },
  wDesc: { fontSize: 14, color: "#777", lineHeight: 1.8, margin: "0 0 20px" },
  wInput: { width: "100%", padding: "13px 16px", borderRadius: 14, border: "2px solid #e8e4f0", fontSize: 15, textAlign: "center", outline: "none", fontFamily: "'Heebo', sans-serif", color: "#302070", boxSizing: "border-box", marginBottom: 12 },
  wBtn: { width: "100%", padding: 14, borderRadius: 14, background: "linear-gradient(135deg, #302070, #4a35a0)", color: "#fff", border: "none", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'Heebo', sans-serif", marginBottom: 12, boxShadow: "0 4px 16px rgba(48,32,112,0.3)" },
  wLink: { background: "none", border: "none", color: "#999", fontSize: 13, cursor: "pointer", fontFamily: "'Heebo', sans-serif" },

  // Game Header
  header: { textAlign: "center", marginBottom: 12, width: "100%", maxWidth: 460 },
  title: { fontSize: 22, fontWeight: 800, color: "#fff", margin: 0, letterSpacing: -0.5 },
  subtitle: { fontSize: 12, color: "rgba(255,255,255,0.5)", margin: "4px 0 0" },

  // Board
  boardWrap: { width: "100%", maxWidth: 460, display: "flex", flexDirection: "column", gap: 8, flex: 1 },

  // Solved
  solvedBar: { borderRadius: 14, padding: "12px 16px", textAlign: "center", display: "flex", flexDirection: "column", gap: 1 },
  solvedCat: { fontWeight: 800, fontSize: 14, color: "#1a1a2e" },
  solvedW: { fontSize: 12, color: "#1a1a2eaa" },

  // Grid — 3 columns
  grid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 },
  tile: {
    padding: "18px 8px", borderRadius: 14, border: "none",
    background: "rgba(88, 100, 180, 0.35)", backdropFilter: "blur(4px)",
    fontSize: 17, fontWeight: 700, color: "#fff", cursor: "pointer",
    transition: "all 0.15s ease", fontFamily: "'Heebo', sans-serif",
    minHeight: 54, display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1), 0 2px 8px rgba(0,0,0,0.15)",
  },
  tileSel: {
    background: "rgba(88, 184, 160, 0.7)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.2), 0 0 20px rgba(88,184,160,0.3)",
    transform: "scale(0.96)",
  },

  // Hint
  hintBox: { background: "rgba(255,255,255,0.08)", borderRadius: 14, borderRight: "4px solid #fff", padding: "12px 16px", textAlign: "right" },
  hintCatRow: { display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 4 },
  hintDot: { width: 8, height: 8, borderRadius: 2, display: "inline-block" },
  hintText: { fontSize: 13, color: "rgba(255,255,255,0.7)", margin: 0, lineHeight: 1.7 },
  hintTag: { fontSize: 10, color: "#C490D1", fontWeight: 600, marginTop: 6, display: "block" },
  almost: { background: "rgba(240,201,75,0.15)", color: "#F0C94B", padding: "10px 16px", borderRadius: 12, fontSize: 13, fontWeight: 600, textAlign: "center" },

  // Status
  statusRow: { display: "flex", justifyContent: "center", gap: 28, margin: "12px 0 8px", width: "100%", maxWidth: 460 },
  statusGroup: { display: "flex", alignItems: "center", gap: 8 },
  statusLabel: { fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 500 },
  dotsRow: { display: "flex", gap: 5, alignItems: "center" },
  dot: { width: 10, height: 10, borderRadius: "50%", transition: "all 0.3s" },
  hintIndicator: { fontSize: 13, transition: "all 0.3s" },

  // Actions
  actions: { display: "flex", gap: 8, width: "100%", maxWidth: 460, marginBottom: 8 },
  btn: { flex: 1, padding: "11px 6px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.07)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Heebo', sans-serif", color: "rgba(255,255,255,0.7)", transition: "all 0.15s" },
  btnHint: { flex: 1, padding: "11px 6px", borderRadius: 12, border: "1px solid rgba(88,184,160,0.25)", background: "rgba(88,184,160,0.12)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Heebo', sans-serif", color: "#58B8A0", transition: "all 0.15s" },
  btnCheck: { flex: 1.4, padding: "11px 6px", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #58B8A0, #4aa890)", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Heebo', sans-serif", color: "#fff", transition: "all 0.15s", boxShadow: "0 3px 14px rgba(88,184,160,0.3)" },

  // Help link
  helpLink: { background: "none", border: "none", color: "rgba(255,255,255,0.25)", fontSize: 12, cursor: "pointer", fontFamily: "'Heebo', sans-serif", marginBottom: 8 },

  // Footer
  footer: { fontSize: 10, color: "rgba(255,255,255,0.2)", textAlign: "center", paddingBottom: 4 },
  footerBrand: { fontWeight: 700, color: "rgba(255,255,255,0.35)" },

  // Modal
  overlay: { position: "fixed", inset: 0, background: "rgba(10,8,30,0.6)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 },
  modal: { background: "#fff", borderRadius: 24, padding: "32px 28px", textAlign: "center", maxWidth: 400, width: "100%", maxHeight: "85vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" },
  mTitle: { fontSize: 22, fontWeight: 800, color: "#302070", margin: "0 0 8px" },
  mText: { fontSize: 14, color: "#777", margin: "0 0 20px", lineHeight: 1.6 },
  modalBtn: { width: "100%", padding: 13, borderRadius: 14, background: "linear-gradient(135deg, #302070, #4a35a0)", color: "#fff", border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Heebo', sans-serif", marginBottom: 8, boxShadow: "0 4px 16px rgba(48,32,112,0.2)" },
  mLink: { background: "none", border: "none", color: "#999", fontSize: 13, cursor: "pointer", fontFamily: "'Heebo', sans-serif", marginTop: 8 },
  mDivider: { height: 1, background: "#f0edf4", margin: "12px 0" },
  resGrid: { display: "flex", flexDirection: "column", gap: 4, alignItems: "center", marginBottom: 20 },
  resRow: { display: "flex", gap: 4 },
  resDot: { width: 24, height: 24, borderRadius: 6 },
  ctaBox: { background: "#f8f6fd", borderRadius: 14, padding: 16, marginBottom: 8 },
  ctaText: { fontSize: 13, color: "#302070", margin: "0 0 10px", fontWeight: 600 },
  ctaBtn: { background: "linear-gradient(135deg, #58B8A0, #4aa890)", color: "#fff", border: "none", borderRadius: 10, padding: "10px 24px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Heebo', sans-serif", boxShadow: "0 3px 12px rgba(88,184,160,0.25)" },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700;800;900&display=swap');
  * { box-sizing: border-box; margin: 0; }

  .tile:hover { background: rgba(88, 100, 180, 0.5) !important; transform: translateY(-2px); }
  .tile:active { transform: scale(0.95) !important; }

  @keyframes shake {
    0%,100%{transform:translateX(0)} 20%{transform:translateX(-5px)} 40%{transform:translateX(5px)} 60%{transform:translateX(-3px)} 80%{transform:translateX(3px)}
  }
  .shake { animation: shake 0.45s ease-in-out !important; background: rgba(232,88,88,0.3) !important; color: #faa !important; }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .fade-in { animation: fadeIn 0.3s ease forwards; }
  .tile { animation: fadeIn 0.2s ease backwards; }

  input:focus { border-color: #58B8A0 !important; box-shadow: 0 0 0 3px rgba(88,184,160,0.15) !important; }
  button:hover { filter: brightness(1.05); }
  button:active { transform: scale(0.97); }

  @media (max-width: 400px) {
    .tile { font-size: 14px !important; min-height: 46px !important; padding: 14px 4px !important; }
  }
`;
