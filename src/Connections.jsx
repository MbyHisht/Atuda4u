import { useState, useEffect, useCallback } from "react";

const COURSES_URL = "https://hishtmby.org.il";

const PUZZLE = {
  id: "demo-1",
  groups: [
    { category: "בכיתה", difficulty: 1, color: "#58B8A0", words: ["לוח", "מורה", "מבחן"], hint1: "חשבי על מקום שנמצאות בו כל יום... 🏫", hint2: "בקורס ההוראה של עתודה תלמדי איך להפוך כל כיתה לחוויה!" },
    { category: "בעיצוב גרפי", difficulty: 2, color: "#7B8FD4", words: ["פונט", "רקע", "מסגרת"], hint1: "חשבי על דברים שרואים כשפותחים קנבה... 🎨", hint2: "בקורס הגרפיקה של עתודה תלמדי לעצב כמו מקצוענית!" },
    { category: "בהנהלת חשבונות", difficulty: 3, color: "#E88B8B", words: ["מאזן", "קבלה", "תקציב"], hint1: "חשבי על מושגים שקשורים לעולם המספרים והכסף 💰", hint2: "בקורס ראיית החשבון של עתודה תגלי שמספרים זה דווקא כיף!" },
    { category: "בייעוץ", difficulty: 4, color: "#F0C94B", words: ["הקשבה", "אמפתיה", "שיחה"], hint1: "חשבי על מה שצריך כשוֹבּה אחת באה לדבר על מה שעל הלב... 💛", hint2: "בקורס הייעוץ של עתודה תלמדי כלים מקצועיים לעזור לאחרות!" },
    { category: "_ מקצועי/ת", difficulty: 5, color: "#C490D1", words: ["תעודה", "התמחות", "דעה"], hint1: "חשבי על מילה שמחברת את כולן... ✨", hint2: "בעתודה תקבלי הכשרה מקצועית שפותחת דלתות - תעודה, התמחות, ודעה מקצועית!" },
  ],
};

const MAX_GUESSES = 6, GROUP_SIZE = 3, NUM_GROUPS = 5, MAX_HINTS = 2;

const shuffle = (arr) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

const QUOTES = ["ציטוט נחמד כלשהוא", "הדרך הטובה ביותר לחזות את העתיד היא ליצור אותו", "כל מומחית התחילה פעם כמתחילה", "ההשקעה הטובה ביותר היא בעצמך"];

const IconCheck = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square"><polyline points="20 6 9 17 4 12" /></svg>);
const IconHint = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square"><path d="M9 18h6M10 22h4M12 2a7 7 0 0 1 4 12.7V17H8v-2.3A7 7 0 0 1 12 2z" /></svg>);
const IconShuffle = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square"><polyline points="16 3 21 3 21 8" /><line x1="4" y1="20" x2="21" y2="3" /><polyline points="21 16 21 21 16 21" /><line x1="15" y1="15" x2="21" y2="21" /><line x1="4" y1="4" x2="9" y2="9" /></svg>);
const IconCancel = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>);
const IconMenu = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>);

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
      <div className="page-welcome">
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
        {showHelp && <Help onClose={() => setShowHelp(false)} />}
        <style>{css}</style>
      </div>
    );
  }

  return (
    <div className="page-game">
      {/* Top bar: title + guesses */}
      <div className="top-bar">
        <h1 className="game-title">חמש מי יודעת</h1>
        <div className="guesses-row">
          {Array.from({ length: MAX_GUESSES }).map((_, i) => (
            <span key={i} className="guess-dot" style={{ background: i < guessesLeft ? "#58B8A0" : "rgba(255,255,255,0.1)" }} />
          ))}
        </div>
      </div>

      {/* Main horizontal layout */}
      <div className="main-row">
        {/* Left: Quote */}
        <div className="quote-col">
          <div className="quote-text">
            <span className="qm">"</span>{quote}<span className="qm">"</span>
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
                  className={`tile tile-int ${isSel ? "tile-sel" : ""} ${isShake ? "shake" : ""}`}
                  style={{ animationDelay: `${i * 0.02}s` }}>
                  {tile.word}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="actions-col">
          <button onClick={handleCheck} disabled={selected.length !== GROUP_SIZE} className="abtn a-check" style={{ opacity: selected.length === GROUP_SIZE ? 1 : 0.3 }}>
            <IconCheck /><span className="a-lbl">בדיקה</span>
          </button>
          <button onClick={handleHint} disabled={hintsUsed >= MAX_HINTS || gameOver} className="abtn a-hint" style={{ opacity: hintsUsed >= MAX_HINTS || gameOver ? 0.3 : 1 }}>
            <IconHint /><span className="a-lbl">רמז</span>
          </button>
          <button onClick={handleShuffle} className="abtn a-shuf">
            <IconShuffle /><span className="a-lbl">ערבוב</span>
          </button>
          <button onClick={() => setSelected([])} disabled={!selected.length} className="abtn a-cancel" style={{ opacity: selected.length ? 1 : 0.3 }}>
            <IconCancel /><span className="a-lbl">ביטול</span>
          </button>
          <button className="abtn a-menu" onClick={() => setShowMenu(!showMenu)}>
            <IconMenu />
          </button>
          {showMenu && (
            <div className="menu-dd fade-in">
              <button className="menu-it" onClick={() => { setShowHelp(true); setShowMenu(false); }}>איך משחקים?</button>
              <button className="menu-it" onClick={() => { initGame(); setShowMenu(false); }}>התחלה מחדש</button>
              <button className="menu-it" onClick={handleCoursesClick}>לאתר עתודה</button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom bar: hint + instructions */}
      <div className="bottom-bar">
        {currentHint ? (
          <div className="hint-strip fade-in" style={{ borderRightColor: currentHint.color }}>
            {currentHint.type === "marketing" && <strong style={{ color: currentHint.color }}>הקטגוריה: {currentHint.category} · </strong>}
            <span>{currentHint.text}</span>
            {currentHint.type === "marketing" && <span className="hint-tag"> 💜 עתודה</span>}
          </div>
        ) : almostMsg ? (
          <div className="hint-strip almost-strip fade-in">כמעט! חסרה לך מילה אחת 🫣</div>
        ) : (
          <div className="instructions-strip">
            בחרי <strong>3 מילים</strong> עם קשר משותף ולחצי <strong>בדיקה</strong>&nbsp;&nbsp;·&nbsp;&nbsp;{guessesLeft} ניחושים&nbsp;&nbsp;·&nbsp;&nbsp;{MAX_HINTS - hintsUsed} רמזים&nbsp;&nbsp;·&nbsp;&nbsp;צדקת ב-2 מ-3? "כמעט!"
          </div>
        )}
      </div>

      {/* Game Over */}
      {gameOver && (
        <div className="overlay">
          <div className="modal fade-in">
            <div style={{ fontSize: 44, marginBottom: 6 }}>{won ? "🎉" : "💪"}</div>
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
          <p style={{ marginTop: 10 }}><strong>כללים:</strong><br />• בחרי 3 מילים ולחצי "בדיקה"<br />• ניחוש נכון — הקבוצה תתגלה<br />• ניחוש שגוי — תפסידי ניחוש<br />• צדקת ב-2 מתוך 3 — "כמעט!"<br />• 6 ניחושים · 2 רמזים</p>
        </div>
        <button onClick={onClose} className="modal-btn" style={{ marginTop: 16 }}>הבנתי! 👍</button>
      </div>
    </div>
  );
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700;800;900&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@400;500;700;900&display=swap');

*{box-sizing:border-box;margin:0;padding:0}
html,body,#root{height:100%;overflow:hidden}

/* ═══ WELCOME ═══ */
.page-welcome{
  direction:rtl;height:100vh;overflow:hidden;
  background:linear-gradient(160deg,#0d0b2e,#151050 35%,#1a1360 60%,#12103a);
  font-family:'Heebo',sans-serif;
  display:flex;align-items:center;justify-content:center;
}
.welcome-card{
  background:rgba(255,255,255,0.95);padding:36px 28px 28px;text-align:center;
  max-width:360px;width:90%;box-shadow:0 12px 48px rgba(0,0,0,0.3);
}
.w-icon{width:48px;height:48px;background:linear-gradient(135deg,#1a1360,#302070);color:#fff;display:flex;align-items:center;justify-content:center;font-size:20px;margin:0 auto 12px}
.w-title{font-family:'Frank Ruhl Libre',serif;font-size:28px;font-weight:900;color:#1a1360;margin:0 0 2px}
.w-brand{font-size:11px;color:#999;letter-spacing:2px;margin:0 0 12px}
.w-line{width:36px;height:3px;background:linear-gradient(90deg,#58B8A0,#C490D1);margin:0 auto 12px}
.w-desc{font-size:13px;color:#777;line-height:1.8;margin:0 0 16px}
.w-input{width:100%;padding:11px 14px;border:2px solid #e0dce8;font-size:14px;text-align:center;outline:none;font-family:'Heebo',sans-serif;color:#1a1360;margin-bottom:10px}
.w-input:focus{border-color:#58B8A0!important;box-shadow:0 0 0 3px rgba(88,184,160,0.15)!important}
.w-btn{width:100%;padding:12px;background:linear-gradient(135deg,#1a1360,#302070);color:#fff;border:none;font-size:14px;font-weight:700;cursor:pointer;font-family:'Heebo',sans-serif;margin-bottom:10px;transition:all .15s}
.w-btn:hover{filter:brightness(1.08)}
.w-link{background:none;border:none;color:#999;font-size:12px;cursor:pointer;font-family:'Heebo',sans-serif}

/* ═══ GAME PAGE — fills viewport exactly ═══ */
.page-game{
  direction:rtl;height:100vh;overflow:hidden;
  background:linear-gradient(160deg,#0d0b2e,#151050 35%,#1a1360 60%,#12103a);
  font-family:'Heebo',sans-serif;
  display:flex;flex-direction:column;
  padding:8px 12px;
}

/* ─ Top bar ─ */
.top-bar{
  display:flex;align-items:center;justify-content:space-between;
  padding:0 4px 6px;flex-shrink:0;
}
.game-title{
  font-family:'Frank Ruhl Libre',serif;
  font-size:20px;font-weight:900;color:#e8e4f8;letter-spacing:0.5px;
  text-shadow:0 1px 12px rgba(88,100,180,0.3);
}
.guesses-row{display:flex;gap:5px;align-items:center}
.guess-dot{width:9px;height:9px;transition:all .3s}

/* ─ Main row — takes all remaining space ─ */
.main-row{
  flex:1;min-height:0;
  display:flex;gap:10px;align-items:stretch;
}

/* Quote column */
.quote-col{
  display:flex;align-items:center;justify-content:center;
  min-width:36px;flex-shrink:0;
}
.quote-text{
  font-family:'Frank Ruhl Libre',serif;
  font-size:14px;font-weight:700;color:#e07058;
  writing-mode:vertical-rl;text-orientation:mixed;direction:rtl;
  line-height:1.6;text-align:center;letter-spacing:2px;
  text-shadow:0 1px 10px rgba(224,112,88,0.15);
}
.qm{font-size:18px;opacity:0.5}

/* Grid column — fills center */
.grid-col{
  flex:1;min-width:0;min-height:0;
  display:flex;align-items:stretch;
}
.grid-5x3{
  flex:1;
  display:grid;
  grid-template-columns:repeat(3,1fr);
  grid-template-rows:repeat(5,1fr);
  gap:6px;
}

/* Tiles — square via grid stretch */
.tile{
  border:none;font-family:'Heebo',sans-serif;
  font-size:clamp(13px,2.2vw,17px);font-weight:700;
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  cursor:pointer;transition:all .18s ease;text-align:center;
  min-width:0;min-height:0;
}
.tile-int{
  background:linear-gradient(145deg,rgba(60,55,140,0.75),rgba(50,45,120,0.9));
  color:#c8c4e8;
  box-shadow:inset 0 1px 0 rgba(255,255,255,0.08),0 2px 6px rgba(0,0,0,0.25),0 0 0 1px rgba(80,75,160,0.3);
}
.tile-int:hover{
  background:linear-gradient(145deg,rgba(75,70,160,0.85),rgba(65,60,140,0.95));
  transform:translateY(-1px);
  box-shadow:inset 0 1px 0 rgba(255,255,255,0.12),0 4px 10px rgba(0,0,0,0.3),0 0 0 1px rgba(100,95,180,0.4);
  color:#e0ddf5;
}
.tile-int:active{transform:scale(0.96)!important}
.tile-sel{
  background:linear-gradient(145deg,rgba(88,184,160,0.65),rgba(70,160,140,0.8))!important;
  color:#fff!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,0.15),0 0 16px rgba(88,184,160,0.25),0 0 0 2px rgba(88,184,160,0.5)!important;
  transform:scale(0.97);
}
.tile-solved{cursor:default;color:#1a1a2e;box-shadow:0 2px 8px rgba(0,0,0,0.15)}
.tile-cat{font-size:8px;font-weight:500;opacity:0.65;margin-top:1px}
.tile-word{font-size:clamp(13px,2.2vw,17px);font-weight:700}

/* Actions column */
.actions-col{
  display:flex;flex-direction:column;gap:5px;
  min-width:48px;flex-shrink:0;position:relative;
  justify-content:center;
}
.abtn{
  border:none;cursor:pointer;font-family:'Heebo',sans-serif;
  transition:all .15s ease;
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  gap:3px;min-width:48px;padding:6px 2px;
}
.abtn:hover{filter:brightness(1.15);transform:scale(1.04)}
.abtn:active{transform:scale(0.95)}
.a-lbl{font-size:9px;font-weight:700;letter-spacing:0.3px;line-height:1}

.a-check{background:linear-gradient(180deg,#50b8a0,#3da88e);color:#fff;flex:1.2;box-shadow:0 2px 8px rgba(88,184,160,0.25)}
.a-hint{background:linear-gradient(180deg,#5a78c8,#4a68b8);color:#fff;flex:1;box-shadow:0 2px 8px rgba(90,120,200,0.2)}
.a-shuf{background:linear-gradient(180deg,#3a3580,#2d2870);color:rgba(255,255,255,0.8);flex:1}
.a-cancel{background:linear-gradient(180deg,#4caa70,#3c9a60);color:#fff;flex:1}
.a-menu{background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.08);color:rgba(255,255,255,0.4);padding:6px 2px;flex:0}

.menu-dd{
  position:absolute;left:0;bottom:-4px;transform:translateY(100%);
  background:rgba(30,25,80,0.97);border:1px solid rgba(255,255,255,0.1);
  padding:4px;min-width:130px;z-index:50;
  box-shadow:0 8px 24px rgba(0,0,0,0.4);backdrop-filter:blur(10px);
}
.menu-it{
  display:block;width:100%;padding:8px 10px;background:none;border:none;
  color:rgba(255,255,255,0.7);font-size:12px;font-family:'Heebo',sans-serif;
  cursor:pointer;text-align:right;transition:all .12s;
}
.menu-it:hover{background:rgba(255,255,255,0.08);color:#fff}

/* ─ Bottom bar ─ */
.bottom-bar{
  flex-shrink:0;padding:6px 4px 2px;
}
.instructions-strip{
  font-size:11px;color:rgba(255,255,255,0.3);text-align:center;line-height:1.6;
}
.instructions-strip strong{color:rgba(255,255,255,0.5)}

.hint-strip{
  font-size:11px;color:rgba(255,255,255,0.6);text-align:right;line-height:1.6;
  padding:6px 10px;background:rgba(255,255,255,0.05);border-right:3px solid #fff;
}
.hint-tag{font-size:9px;color:#C490D1;font-weight:600}
.almost-strip{
  text-align:center;color:#F0C94B;border:none;
  background:rgba(240,201,75,0.1);font-weight:600;
}

/* ═══ OVERLAY / MODAL ═══ */
.overlay{
  position:fixed;inset:0;background:rgba(8,6,24,0.65);backdrop-filter:blur(8px);
  display:flex;align-items:center;justify-content:center;z-index:100;padding:16px;
}
.modal{
  background:#fff;padding:28px 24px;text-align:center;
  max-width:380px;width:100%;max-height:85vh;overflow-y:auto;
  box-shadow:0 20px 60px rgba(0,0,0,0.35);
}
.m-title{font-family:'Frank Ruhl Libre',serif;font-size:20px;font-weight:900;color:#1a1360;margin:0 0 6px}
.m-text{font-size:13px;color:#777;margin:0 0 16px;line-height:1.6}
.modal-btn{
  width:100%;padding:11px;background:linear-gradient(135deg,#1a1360,#302070);
  color:#fff;border:none;font-size:13px;font-weight:700;cursor:pointer;
  font-family:'Heebo',sans-serif;margin-bottom:6px;transition:all .15s;
}
.modal-btn:hover{filter:brightness(1.08)}
.m-link{background:none;border:none;color:#999;font-size:12px;cursor:pointer;font-family:'Heebo',sans-serif;margin-top:6px}
.m-divider{height:1px;background:#f0edf4;margin:10px 0}
.res-grid{display:flex;flex-direction:column;gap:3px;align-items:center;margin-bottom:16px}
.res-row{display:flex;gap:3px}
.res-dot{width:20px;height:20px}
.cta-box{background:#f8f6fd;padding:14px;margin-bottom:6px}
.cta-text{font-size:12px;color:#1a1360;margin:0 0 8px;font-weight:600}
.cta-btn{
  background:linear-gradient(135deg,#58B8A0,#4aa890);color:#fff;border:none;
  padding:9px 20px;font-size:12px;font-weight:700;cursor:pointer;
  font-family:'Heebo',sans-serif;transition:all .15s;
}
.cta-btn:hover{filter:brightness(1.08)}
.help-body{text-align:right;line-height:2;font-size:13px;color:#555}

/* ═══ ANIMATIONS ═══ */
@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-5px)}40%{transform:translateX(5px)}60%{transform:translateX(-3px)}80%{transform:translateX(3px)}}
.shake{animation:shake .45s ease-in-out!important;background:rgba(232,88,88,0.35)!important;color:#faa!important}
@keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
.fade-in{animation:fadeIn .25s ease forwards}
.tile-int{animation:fadeIn .15s ease backwards}

/* ═══ RESPONSIVE ═══ */
@media(max-width:500px){
  .main-row{gap:6px}
  .quote-col{min-width:28px}
  .quote-text{font-size:12px}
  .actions-col{min-width:40px}
  .abtn{min-width:40px;padding:4px 1px}
  .abtn svg{width:16px;height:16px}
  .a-lbl{font-size:8px}
  .game-title{font-size:17px}
}
@media(max-width:380px){
  .quote-col{display:none}
  .page-game{padding:6px 8px}
}
`;
