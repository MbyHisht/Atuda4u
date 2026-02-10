import { useState, useEffect, useCallback } from "react";

const COURSES_URL = "https://hishtmby.org.il";

const PUZZLE = {
  id: "demo-1",
  groups: [
    {
      category: "בכיתה",
      difficulty: 1,
      color: "#58B8A0",
      words: ["לוח", "מורה", "מבחן"],
      hint1: "חשבי על מקום שנמצאות בו כל יום... 🏫",
      hint2: "בקורס ההוראה של עתודה תלמדי איך להפוך כל כיתה לחוויה!",
    },
    {
      category: "בעיצוב גרפי",
      difficulty: 2,
      color: "#7B8FD4",
      words: ["פונט", "רקע", "מסגרת"],
      hint1: "חשבי על דברים שרואים כשפותחים קנבה... 🎨",
      hint2: "בקורס הגרפיקה של עתודה תלמדי לעצב כמו מקצוענית!",
    },
    {
      category: "בהנהלת חשבונות",
      difficulty: 3,
      color: "#E88B8B",
      words: ["מאזן", "קבלה", "תקציב"],
      hint1: "חשבי על מושגים שקשורים לעולם המספרים והכסף 💰",
      hint2: "בקורס ראיית החשבון של עתודה תגלי שמספרים זה דווקא כיף!",
    },
    {
      category: "בייעוץ",
      difficulty: 4,
      color: "#F0C94B",
      words: ["הקשבה", "אמפתיה", "שיחה"],
      hint1: "חשבי על מה שצריך כשוֹבּה אחת באה לדבר על מה שעל הלב... 💛",
      hint2: "בקורס הייעוץ של עתודה תלמדי כלים מקצועיים לעזור לאחרות!",
    },
    {
      category: "_ מקצועי/ת",
      difficulty: 5,
      color: "#C490D1",
      words: ["תעודה", "התמחות", "דעה"],
      hint1: "חשבי על מילה שמחברת את כולן... ✨",
      hint2: "בעתודה תקבלי הכשרה מקצועית שפותחת דלתות - תעודה, התמחות, ודעה מקצועית!",
    },
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

const QUOTES = [
  "הדרך הטובה ביותר לחזות את העתיד היא ליצור אותו",
  "כל מומחית התחילה פעם כמתחילה",
  "ההשקעה הטובה ביותר היא בעצמך",
  "הצעד הראשון הוא תמיד הקשה ביותר",
  "לעולם אל תפסיקי ללמוד",
];

const IconCheck = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter"><polyline points="20 6 9 17 4 12" /></svg>
);
const IconHint = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter"><path d="M9 18h6M10 22h4M12 2a7 7 0 0 1 4 12.7V17H8v-2.3A7 7 0 0 1 12 2z" /></svg>
);
const IconShuffle = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter"><polyline points="16 3 21 3 21 8" /><line x1="4" y1="20" x2="21" y2="3" /><polyline points="21 16 21 21 16 21" /><line x1="15" y1="15" x2="21" y2="21" /><line x1="4" y1="4" x2="9" y2="9" /></svg>
);
const IconCancel = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
);
const IconMenu = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
);

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
  const [showMenu, setShowMenu] = useState(false);
  const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)]);

  const puzzle = PUZZLE;

  const initGame = useCallback(() => {
    setWords(shuffle(puzzle.groups.flatMap((g) => g.words)));
    setSelected([]); setSolved([]); setGuessesLeft(MAX_GUESSES);
    setShakeWords([]); setAlmostMsg(false); setGameOver(false); setWon(false);
    setGuessHistory([]); setHintsUsed(0); setCurrentHint(null); setShuffleKey((k) => k + 1);
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
      setGuessHistory((h) => [...h, { colors: selected.map((w) => puzzle.groups.find((g) => g.words.includes(w)).color), correct: true }]);
      if (ns.length === NUM_GROUPS) setTimeout(() => { setWon(true); setGameOver(true); }, 800);
    } else {
      const ng = guessesLeft - 1; setGuessesLeft(ng);
      if (puzzle.groups.some((g) => !solved.includes(g) && selected.filter((w) => g.words.includes(w)).length === GROUP_SIZE - 1)) { setAlmostMsg(true); setTimeout(() => setAlmostMsg(false), 2500); }
      setShakeWords([...selected]); setTimeout(() => setShakeWords([]), 600);
      setGuessHistory((h) => [...h, { colors: selected.map((w) => puzzle.groups.find((g) => g.words.includes(w)).color), correct: false }]);
      if (ng <= 0) setTimeout(() => revealAll([...solved]), 800);
    }
  };

  const revealAll = (cur) => {
    const u = puzzle.groups.filter((g) => !cur.includes(g)); let i = 0;
    const next = () => { if (i < u.length) { cur = [...cur, u[i]]; setSolved([...cur]); i++; setTimeout(next, 500); } else setTimeout(() => { setGameOver(true); setWon(false); }, 600); };
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
    setWords([...sv, ...shuffle(uv)]); setShuffleKey((k) => k + 1);
  };

  const handleShare = async () => {
    const em = { [puzzle.groups[0].color]: "🟢", [puzzle.groups[1].color]: "🔵", [puzzle.groups[2].color]: "🔴", [puzzle.groups[3].color]: "🟡", [puzzle.groups[4].color]: "🟣" };
    const rows = guessHistory.map((g) => g.colors.map((c) => em[c] || "⬜").join("")).join("\n");
    const hi = hintsUsed > 0 ? ` (💡${hintsUsed})` : "";
    const text = `✨ חמש מי יודעת — עתודה ✨\n${won ? `פתרתי ב-${guessHistory.length} ניחושים${hi}!` : "לא הצלחתי הפעם 😅"}\n\n${rows}\n\nנסי גם → ${COURSES_URL}`;
    try { await navigator.clipboard.writeText(text); alert("הועתק! 📋"); } catch { const t = document.createElement("textarea"); t.value = text; document.body.appendChild(t); t.select(); document.execCommand("copy"); document.body.removeChild(t); alert("הועתק! 📋"); }
  };

  const handleCoursesClick = () => { window.location.href = COURSES_URL; };

  const unsolved = words.filter((w) => !solved.some((g) => g.words.includes(w)));
  const allTiles = [];
  solved.forEach((g) => { g.words.forEach((w) => allTiles.push({ word: w, solved: true, group: g })); });
  unsolved.forEach((w) => allTiles.push({ word: w, solved: false }));

  if (screen === "welcome") {
    return (
      <div className="page">
        <div className="welcome-center">
          <div className="welcome-card fade-in">
            <div className="w-icon">✦</div>
            <h1 className="w-title">חמש מי יודעת</h1>
            <p className="w-brand">עתודה · מרכז בית יעקב</p>
            <div className="w-line" />
            <p className="w-desc">מצאי את הקשר הנסתר בין המילים<br />5 קבוצות · 15 מילים · קשר אחד</p>
            <input type="text" placeholder="איך קוראים לך?" value={playerName} onChange={(e) => setPlayerName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && playerName.trim() && setScreen("game")} className="w-input" dir="rtl" />
            <button onClick={() => playerName.trim() && setScreen("game")} disabled={!playerName.trim()} className="w-btn" style={{ opacity: playerName.trim() ? 1 : 0.4 }}>בואי נשחק ✨</button>
            <button onClick={() => setShowHelp(true)} className="w-link">איך משחקים?</button>
          </div>
        </div>
        {showHelp && <Help onClose={() => setShowHelp(false)} />}
        <style>{css}</style>
      </div>
    );
  }

  return (
    <div className="page">
      <h1 className="game-title">חמש מי יודעת</h1>

      <div className="game-layout">
        {/* Left: Quote */}
        <div className="side-col quote-col">
          <div className="quote-text">
            <span className="quote-mark">"</span>
            {quote}
            <span className="quote-mark">"</span>
          </div>
        </div>

        {/* Center: Grid */}
        <div className="grid-col">
          <div className="grid-5x3" key={shuffleKey}>
            {allTiles.map((tile, i) => {
              if (tile.solved) {
                return (
                  <div key={tile.word + "-solved"} className="tile tile-solved fade-in" style={{ backgroundColor: tile.group.color }}>
                    <span className="tile-word">{tile.word}</span>
                    <span className="tile-cat">{tile.group.category}</span>
                  </div>
                );
              }
              const isSel = selected.includes(tile.word);
              const isShake = shakeWords.includes(tile.word);
              return (
                <button key={tile.word + shuffleKey} onClick={() => handleWordClick(tile.word)}
                  className={`tile tile-interactive ${isSel ? "tile-selected" : ""} ${isShake ? "shake" : ""}`}
                  style={{ animationDelay: `${i * 0.025}s` }}>
                  {tile.word}
                </button>
              );
            })}
          </div>

          {currentHint && (
            <div className="hint-box fade-in" style={{ borderRightColor: currentHint.color }}>
              {currentHint.type === "marketing" && (<div className="hint-cat-row"><span className="hint-dot" style={{ background: currentHint.color }} />הקטגוריה: {currentHint.category}</div>)}
              <p className="hint-text">{currentHint.text}</p>
              {currentHint.type === "marketing" && <span className="hint-tag">💜 עתודה</span>}
            </div>
          )}

          {almostMsg && <div className="almost fade-in">כמעט! חסרה לך מילה אחת 🫣</div>}

          <div className="guesses-row">
            {Array.from({ length: MAX_GUESSES }).map((_, i) => (
              <span key={i} className="guess-dot" style={{ background: i < guessesLeft ? "#58B8A0" : "rgba(255,255,255,0.1)" }} />
            ))}
          </div>
        </div>

        {/* Right: Action buttons with icons */}
        <div className="side-col actions-col">
          <button onClick={handleCheck} disabled={selected.length !== GROUP_SIZE} className="action-btn action-check" style={{ opacity: selected.length === GROUP_SIZE ? 1 : 0.35 }}>
            <IconCheck /><span className="action-label">בדיקה</span>
          </button>
          <button onClick={handleHint} disabled={hintsUsed >= MAX_HINTS || gameOver} className="action-btn action-hint" style={{ opacity: hintsUsed >= MAX_HINTS || gameOver ? 0.35 : 1 }}>
            <IconHint /><span className="action-label">רמז</span>
          </button>
          <button onClick={handleShuffle} className="action-btn action-shuffle">
            <IconShuffle /><span className="action-label">ערבוב</span>
          </button>
          <button onClick={() => setSelected([])} disabled={!selected.length} className="action-btn action-cancel" style={{ opacity: selected.length ? 1 : 0.35 }}>
            <IconCancel /><span className="action-label">ביטול</span>
          </button>

          <button className="action-btn action-menu" onClick={() => setShowMenu(!showMenu)}>
            <IconMenu />
          </button>

          {showMenu && (
            <div className="menu-dropdown fade-in">
              <button className="menu-item" onClick={() => { setShowHelp(true); setShowMenu(false); }}>איך משחקים?</button>
              <button className="menu-item" onClick={() => { initGame(); setShowMenu(false); }}>התחלה מחדש</button>
              <button className="menu-item" onClick={handleCoursesClick}>לאתר עתודה</button>
            </div>
          )}
        </div>
      </div>

      {/* Instructions below the game */}
      <div className="instructions-bar">
        <div className="instructions-title">הוראות המשחק</div>
        <div className="instructions-grid">
          <div className="instruction-item">
            <span className="instruction-num">1</span>
            <span>בחרי 3 מילים עם קשר משותף</span>
          </div>
          <div className="instruction-item">
            <span className="instruction-num">2</span>
            <span>לחצי על "בדיקה" לאימות</span>
          </div>
          <div className="instruction-item">
            <span className="instruction-num">3</span>
            <span>ניחוש נכון — הקבוצה תתגלה!</span>
          </div>
          <div className="instruction-item">
            <span className="instruction-num">4</span>
            <span>טעית? צדקת ב-2 מ-3 — תקבלי "כמעט!"</span>
          </div>
        </div>
        <div className="instructions-footer">
          {guessesLeft} ניחושים · {MAX_HINTS - hintsUsed} רמזים נותרו
        </div>
      </div>

      {gameOver && (
        <div className="overlay">
          <div className="modal fade-in">
            <div style={{ fontSize: 48, marginBottom: 8 }}>{won ? "🎉" : "💪"}</div>
            <h2 className="m-title">{won ? `כל הכבוד ${playerName}!` : "פעם הבאה!"}</h2>
            <p className="m-text">{won ? `פתרת ב-${guessHistory.length} ניחושים${hintsUsed > 0 ? ` (${hintsUsed} רמזים)` : ""}` : `לא נורא ${playerName}, כל ניסיון מחכים!`}</p>
            <div className="res-grid">
              {guessHistory.map((g, i) => (<div key={i} className="res-row">{g.colors.map((c, j) => <span key={j} className="res-dot" style={{ background: c }} />)}</div>))}
            </div>
            <button onClick={handleShare} className="modal-btn">שתפי תוצאות 📤</button>
            <div className="m-divider" />
            <div className="cta-box">
              <p className="cta-text">נהנית? בעתודה יש עוד הרבה דברים מעניינים 🌟</p>
              <button onClick={handleCoursesClick} className="cta-btn">גלי את הקורסים שלנו →</button>
            </div>
            <button onClick={initGame} className="m-link">שחקי שוב 🔄</button>
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
    <div className="overlay" onClick={onClose}>
      <div className="modal fade-in" onClick={(e) => e.stopPropagation()}>
        <h2 className="m-title">איך משחקים? 🎯</h2>
        <div className="help-body">
          <p>לפנייך <strong>15 מילים</strong> המחולקות ל-<strong>5 קבוצות</strong> של 3 מילים עם קשר משותף.</p>
          <p style={{ marginTop: 12 }}><strong>כללים:</strong><br />• בחרי 3 מילים ולחצי "בדיקה"<br />• ניחוש נכון — הקבוצה תתגלה<br />• ניחוש שגוי — תפסידי ניחוש<br />• צדקת ב-2 מתוך 3 — תקבלי "כמעט!"<br />• 6 ניחושים · 2 רמזים</p>
          <p style={{ marginTop: 12 }}><strong>רמזים 💡</strong><br />• רמז ראשון — טיפ עדין<br />• רמז שני — שם הקטגוריה + טיפ מעתודה</p>
        </div>
        <button onClick={onClose} className="modal-btn" style={{ marginTop: 20 }}>הבנתי! 👍</button>
      </div>
    </div>
  );
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700;800;900&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@400;500;700;900&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .page {
    direction: rtl;
    min-height: 100vh;
    background: linear-gradient(160deg, #0d0b2e 0%, #151050 35%, #1a1360 60%, #12103a 100%);
    font-family: 'Heebo', sans-serif;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px 16px 12px;
    position: relative;
    overflow-x: hidden;
  }

  .page::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image:
      radial-gradient(circle at 20% 30%, rgba(88,184,160,0.04) 0%, transparent 50%),
      radial-gradient(circle at 80% 70%, rgba(196,144,209,0.04) 0%, transparent 50%);
    pointer-events: none;
  }

  .game-title {
    font-family: 'Frank Ruhl Libre', 'Heebo', serif;
    font-size: 26px;
    font-weight: 900;
    color: #e8e4f8;
    text-align: center;
    margin-bottom: 16px;
    letter-spacing: 1px;
    text-shadow: 0 2px 20px rgba(88,100,180,0.3);
  }

  /* ─── 3-Column Layout ─── */
  .game-layout {
    display: flex;
    align-items: stretch;
    gap: 14px;
    width: 100%;
    max-width: 580px;
    flex: 1;
  }

  .side-col {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 6px;
    min-width: 56px;
    position: relative;
  }

  .grid-col { flex: 1; display: flex; flex-direction: column; gap: 10px; }

  /* ─── Quote ─── */
  .quote-col { align-items: center; justify-content: center; padding: 8px 0; }

  .quote-text {
    font-family: 'Frank Ruhl Libre', serif;
    font-size: 16px;
    font-weight: 700;
    color: #e07058;
    writing-mode: vertical-rl;
    text-orientation: mixed;
    direction: rtl;
    line-height: 1.7;
    text-align: center;
    letter-spacing: 2px;
    text-shadow: 0 1px 12px rgba(224,112,88,0.2);
  }

  .quote-mark { font-size: 22px; color: #e07058; opacity: 0.6; }

  /* ─── Grid — square tiles ─── */
  .grid-5x3 {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }

  .tile {
    border-radius: 0;
    border: none;
    font-family: 'Heebo', sans-serif;
    font-size: 16px;
    font-weight: 700;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    aspect-ratio: 1 / 1;
    cursor: pointer;
    transition: all 0.18s ease;
    position: relative;
    text-align: center;
    padding: 6px;
  }

  .tile-interactive {
    background: linear-gradient(145deg, rgba(60,55,140,0.75), rgba(50,45,120,0.9));
    color: #c8c4e8;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.08), 0 2px 6px rgba(0,0,0,0.25), 0 0 0 1px rgba(80,75,160,0.3);
  }

  .tile-interactive:hover {
    background: linear-gradient(145deg, rgba(75,70,160,0.85), rgba(65,60,140,0.95));
    transform: translateY(-2px);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.12), 0 4px 12px rgba(0,0,0,0.3), 0 0 0 1px rgba(100,95,180,0.4);
    color: #e0ddf5;
  }

  .tile-interactive:active { transform: scale(0.96) !important; }

  .tile-selected {
    background: linear-gradient(145deg, rgba(88,184,160,0.65), rgba(70,160,140,0.8)) !important;
    color: #fff !important;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.15), 0 0 18px rgba(88,184,160,0.25), 0 0 0 2px rgba(88,184,160,0.5) !important;
    transform: scale(0.97);
  }

  .tile-solved { cursor: default; color: #1a1a2e; box-shadow: 0 2px 10px rgba(0,0,0,0.15); }
  .tile-cat { font-size: 9px; font-weight: 500; opacity: 0.7; margin-top: 2px; }
  .tile-word { font-size: 16px; font-weight: 700; }

  /* ─── Action Buttons — icon + label, sharp corners ─── */
  .actions-col { gap: 6px; align-items: stretch; }

  .action-btn {
    border: none;
    border-radius: 0;
    padding: 10px 4px;
    cursor: pointer;
    font-family: 'Heebo', sans-serif;
    transition: all 0.15s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    min-width: 54px;
  }

  .action-btn:hover { filter: brightness(1.15); transform: scale(1.04); }
  .action-btn:active { transform: scale(0.95); }

  .action-label { font-size: 10px; font-weight: 700; letter-spacing: 0.5px; line-height: 1; }

  .action-check {
    background: linear-gradient(180deg, #50b8a0, #3da88e);
    color: #fff; flex: 1.3;
    box-shadow: 0 2px 10px rgba(88,184,160,0.25);
  }

  .action-hint {
    background: linear-gradient(180deg, #5a78c8, #4a68b8);
    color: #fff; flex: 1;
    box-shadow: 0 2px 10px rgba(90,120,200,0.2);
  }

  .action-shuffle {
    background: linear-gradient(180deg, #3a3580, #2d2870);
    color: rgba(255,255,255,0.8); flex: 1;
    box-shadow: 0 2px 10px rgba(58,53,128,0.2);
  }

  .action-cancel {
    background: linear-gradient(180deg, #4caa70, #3c9a60);
    color: #fff; flex: 1;
    box-shadow: 0 2px 10px rgba(76,170,112,0.2);
  }

  .action-menu {
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.08);
    color: rgba(255,255,255,0.4);
    padding: 8px 4px; flex: 0;
  }

  /* ─── Menu ─── */
  .menu-dropdown {
    position: absolute;
    left: 0; bottom: -8px;
    transform: translateY(100%);
    background: rgba(30,25,80,0.97);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 0;
    padding: 4px;
    min-width: 140px;
    z-index: 50;
    box-shadow: 0 8px 30px rgba(0,0,0,0.4);
    backdrop-filter: blur(10px);
  }

  .menu-item {
    display: block; width: 100%; padding: 10px 12px;
    background: none; border: none;
    color: rgba(255,255,255,0.7);
    font-size: 13px; font-family: 'Heebo', sans-serif;
    cursor: pointer; border-radius: 0; text-align: right;
    transition: all 0.12s;
  }

  .menu-item:hover { background: rgba(255,255,255,0.08); color: #fff; }

  /* ─── Guesses ─── */
  .guesses-row { display: flex; justify-content: center; gap: 6px; padding: 4px 0; }
  .guess-dot { width: 10px; height: 10px; border-radius: 0; transition: all 0.3s; }

  /* ─── Hint ─── */
  .hint-box { background: rgba(255,255,255,0.06); border-radius: 0; border-right: 4px solid #fff; padding: 10px 14px; text-align: right; }
  .hint-cat-row { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; color: #fff; margin-bottom: 4px; }
  .hint-dot { width: 8px; height: 8px; border-radius: 0; display: inline-block; }
  .hint-text { font-size: 12px; color: rgba(255,255,255,0.6); margin: 0; line-height: 1.7; }
  .hint-tag { font-size: 10px; color: #C490D1; font-weight: 600; margin-top: 4px; display: block; }
  .almost { background: rgba(240,201,75,0.12); color: #F0C94B; padding: 8px 14px; border-radius: 0; font-size: 13px; font-weight: 600; text-align: center; }

  /* ─── Instructions Bar ─── */
  .instructions-bar {
    width: 100%;
    max-width: 580px;
    margin-top: 16px;
    padding: 14px 18px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 0;
  }

  .instructions-title {
    font-size: 13px;
    font-weight: 800;
    color: rgba(255,255,255,0.5);
    text-align: center;
    margin-bottom: 10px;
    letter-spacing: 1px;
  }

  .instructions-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px 16px;
  }

  .instruction-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: rgba(255,255,255,0.35);
    line-height: 1.5;
  }

  .instruction-num {
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(88,184,160,0.15);
    color: #58B8A0;
    font-size: 11px;
    font-weight: 800;
    flex-shrink: 0;
  }

  .instructions-footer {
    text-align: center;
    margin-top: 10px;
    padding-top: 8px;
    border-top: 1px solid rgba(255,255,255,0.05);
    font-size: 12px;
    font-weight: 600;
    color: rgba(88,184,160,0.6);
  }

  /* ─── Welcome ─── */
  .welcome-center { flex: 1; display: flex; align-items: center; justify-content: center; width: 100%; }

  .welcome-card {
    background: rgba(255,255,255,0.95);
    border-radius: 0;
    padding: 44px 32px 32px;
    text-align: center;
    max-width: 380px; width: 100%;
    box-shadow: 0 12px 48px rgba(0,0,0,0.3);
  }

  .w-icon {
    width: 56px; height: 56px; border-radius: 0;
    background: linear-gradient(135deg, #1a1360, #302070);
    color: #fff; display: flex; align-items: center; justify-content: center;
    font-size: 24px; margin: 0 auto 16px;
    box-shadow: 0 4px 16px rgba(26,19,96,0.3);
  }

  .w-title { font-family: 'Frank Ruhl Libre', 'Heebo', serif; font-size: 30px; font-weight: 900; color: #1a1360; margin: 0 0 4px; }
  .w-brand { font-size: 12px; color: #999; letter-spacing: 2px; margin: 0 0 16px; }
  .w-line { width: 40px; height: 3px; border-radius: 0; background: linear-gradient(90deg, #58B8A0, #C490D1); margin: 0 auto 16px; }
  .w-desc { font-size: 14px; color: #777; line-height: 1.8; margin: 0 0 20px; }

  .w-input {
    width: 100%; padding: 13px 16px; border-radius: 0;
    border: 2px solid #e0dce8; font-size: 15px; text-align: center;
    outline: none; font-family: 'Heebo', sans-serif; color: #1a1360;
    margin-bottom: 12px; transition: all 0.2s;
  }

  .w-input:focus { border-color: #58B8A0 !important; box-shadow: 0 0 0 3px rgba(88,184,160,0.15) !important; }

  .w-btn {
    width: 100%; padding: 14px; border-radius: 0;
    background: linear-gradient(135deg, #1a1360, #302070);
    color: #fff; border: none; font-size: 15px; font-weight: 700;
    cursor: pointer; font-family: 'Heebo', sans-serif;
    margin-bottom: 12px; box-shadow: 0 4px 16px rgba(26,19,96,0.3);
    transition: all 0.15s;
  }

  .w-btn:hover { filter: brightness(1.08); }
  .w-link { background: none; border: none; color: #999; font-size: 13px; cursor: pointer; font-family: 'Heebo', sans-serif; }

  /* ─── Modal ─── */
  .overlay {
    position: fixed; inset: 0;
    background: rgba(8,6,24,0.65);
    backdrop-filter: blur(8px);
    display: flex; align-items: center; justify-content: center;
    z-index: 100; padding: 20px;
  }

  .modal {
    background: #fff; border-radius: 0;
    padding: 32px 28px; text-align: center;
    max-width: 400px; width: 100%;
    max-height: 85vh; overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0,0,0,0.35);
  }

  .m-title { font-family: 'Frank Ruhl Libre', 'Heebo', serif; font-size: 22px; font-weight: 900; color: #1a1360; margin: 0 0 8px; }
  .m-text { font-size: 14px; color: #777; margin: 0 0 20px; line-height: 1.6; }

  .modal-btn {
    width: 100%; padding: 13px; border-radius: 0;
    background: linear-gradient(135deg, #1a1360, #302070);
    color: #fff; border: none; font-size: 14px; font-weight: 700;
    cursor: pointer; font-family: 'Heebo', sans-serif;
    margin-bottom: 8px; box-shadow: 0 4px 16px rgba(26,19,96,0.2);
    transition: all 0.15s;
  }

  .modal-btn:hover { filter: brightness(1.08); }
  .m-link { background: none; border: none; color: #999; font-size: 13px; cursor: pointer; font-family: 'Heebo', sans-serif; margin-top: 8px; }
  .m-divider { height: 1px; background: #f0edf4; margin: 12px 0; }
  .res-grid { display: flex; flex-direction: column; gap: 4px; align-items: center; margin-bottom: 20px; }
  .res-row { display: flex; gap: 4px; }
  .res-dot { width: 24px; height: 24px; border-radius: 0; }
  .cta-box { background: #f8f6fd; border-radius: 0; padding: 16px; margin-bottom: 8px; }
  .cta-text { font-size: 13px; color: #1a1360; margin: 0 0 10px; font-weight: 600; }

  .cta-btn {
    background: linear-gradient(135deg, #58B8A0, #4aa890);
    color: #fff; border: none; border-radius: 0;
    padding: 10px 24px; font-size: 13px; font-weight: 700;
    cursor: pointer; font-family: 'Heebo', sans-serif;
    box-shadow: 0 3px 12px rgba(88,184,160,0.25); transition: all 0.15s;
  }

  .cta-btn:hover { filter: brightness(1.08); }

  .help-body { text-align: right; line-height: 2.2; font-size: 14px; color: #555; }

  /* ─── Animations ─── */
  @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-5px)} 40%{transform:translateX(5px)} 60%{transform:translateX(-3px)} 80%{transform:translateX(3px)} }
  .shake { animation: shake 0.45s ease-in-out !important; background: rgba(232,88,88,0.35) !important; color: #faa !important; }
  @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
  .fade-in { animation: fadeIn 0.3s ease forwards; }
  .tile-interactive { animation: fadeIn 0.2s ease backwards; }

  /* ─── Responsive ─── */
  @media (max-width: 500px) {
    .game-layout { gap: 8px; }
    .side-col { min-width: 44px; }
    .tile { font-size: 14px !important; }
    .tile-word { font-size: 14px !important; }
    .action-btn { padding: 8px 2px; min-width: 40px; }
    .action-label { font-size: 9px; }
    .action-btn svg { width: 18px; height: 18px; }
    .quote-text { font-size: 13px; }
    .game-title { font-size: 22px; }
    .instructions-grid { grid-template-columns: 1fr; gap: 6px; }
  }

  @media (max-width: 380px) {
    .quote-col { display: none; }
    .game-layout { gap: 6px; }
    .tile { font-size: 13px !important; }
  }
`;
