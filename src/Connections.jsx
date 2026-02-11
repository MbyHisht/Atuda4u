import { useState, useEffect, useCallback } from "react";

const COURSES_URL = "https://hishtmby.org.il";
const LOGO_URL = "/white_logo.png";
const FOOTER_IMG = "/footer_atuda-04.png";

const PUZZLE = {
  id: "demo-1",
  groups: [
    { category: "בכיתה", difficulty: 1, color: "#58B8A0", words: ["לוח", "מורה", "מבחן"], hint1: "חשבי על מקום שנמצאות בו כל יום... 🏫", hint2: "בקורס ההוראה של עתודה תלמדי איך להפוך כל כיתה לחוויה!", marketing: "קורס הוראה — הכשרה מעשית שפותחת דלתות לעולם החינוך" },
    { category: "בעיצוב גרפי", difficulty: 2, color: "#7B8FD4", words: ["פונט", "רקע", "מסגרת"], hint1: "חשבי על דברים שרואים כשפותחים קנבה... 🎨", hint2: "בקורס הגרפיקה של עתודה תלמדי לעצב כמו מקצוענית!", marketing: "קורס עיצוב גרפי — מהרעיון למציאות, עם כלים מקצועיים" },
    { category: "בהנהלת חשבונות", difficulty: 3, color: "#E88B8B", words: ["מאזן", "קבלה", "תקציב"], hint1: "חשבי על מושגים שקשורים לעולם המספרים והכסף 💰", hint2: "בקורס ראיית החשבון של עתודה תגלי שמספרים זה דווקא כיף!", marketing: "קורס הנהלת חשבונות — תעודה מקצועית ופרנסה בטוחה" },
    { category: "בייעוץ", difficulty: 4, color: "#F0C94B", words: ["הקשבה", "אמפתיה", "שיחה"], hint1: "חשבי על מה שצריך כשמישהי באה לדבר על מה שעל הלב... 💛", hint2: "בקורס הייעוץ של עתודה תלמדי כלים מקצועיים לעזור לאחרות!", marketing: "קורס ייעוץ — הכלים להפוך לאוזן הקשבת מקצועית" },
    { category: "_ מקצועי/ת", difficulty: 5, color: "#C490D1", words: ["תעודה", "התמחות", "דעה"], hint1: "חשבי על מילה שמחברת את כולן... ✨", hint2: "בעתודה תקבלי הכשרה מקצועית שפותחת דלתות!", marketing: "עתודה — לימודי תעודה ומקצוע, ההתחלה של הקריירה שלך" },
  ],
};

const MAX_GUESSES = 6, GROUP_SIZE = 3, NUM_GROUPS = 5, MAX_HINTS = 2;
const shuffle = (a) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

const IconCheck = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square"><polyline points="20 6 9 17 4 12" /></svg>);
const IconHint = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square"><path d="M9 18h6M10 22h4M12 2a7 7 0 0 1 4 12.7V17H8v-2.3A7 7 0 0 1 12 2z" /></svg>);
const IconShuffle = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square"><polyline points="16 3 21 3 21 8" /><line x1="4" y1="20" x2="21" y2="3" /><polyline points="21 16 21 21 16 21" /><line x1="15" y1="15" x2="21" y2="21" /><line x1="4" y1="4" x2="9" y2="9" /></svg>);
const IconCancel = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>);
const IconMenu = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>);
const IconArrow = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>);

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
      setCurrentHint({ type: "solved", category: match.category, text: match.marketing, color: match.color });
      if (ns.length === NUM_GROUPS) setTimeout(() => { setWon(true); setGameOver(true); }, 1200);
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
    setCurrentHint(n === 2
      ? { type: "marketing", category: group.category, text: group.hint2, color: group.color }
      : { type: "subtle", text: group.hint1, color: group.color });
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

  const unsolved = words.filter((w) => !solved.some((g) => g.words.includes(w)));
  const allTiles = [];
  solved.forEach((g) => { g.words.forEach((w) => allTiles.push({ word: w, solved: true, group: g })); });
  unsolved.forEach((w) => allTiles.push({ word: w, solved: false }));

  const solvedGroups = solved.map(g => ({ category: g.category, marketing: g.marketing, color: g.color }));
  const ready = selected.length === GROUP_SIZE;

  /* ══════ WELCOME ══════ */
  if (screen === "welcome") {
    return (
      <div className="pg-welcome">
        <div className="wcard fade-in">
          <img src={LOGO_URL} alt="עתודה" className="wlogo" onError={(e) => { e.target.style.display = 'none'; }} />
          <h1 className="wtitle">חמש מי יודעת</h1>
          <p className="wbrand">עתודה · מרכז בית יעקב</p>
          <div className="wline" />
          <p className="wdesc">מצאי את הקשר הנסתר בין המילים<br />5 קבוצות · 15 מילים · קשר אחד</p>
          <input type="text" placeholder="איך קוראים לך?" value={playerName} onChange={(e) => setPlayerName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && playerName.trim() && setScreen("game")} className="winput" dir="rtl" />
          <button onClick={() => playerName.trim() && setScreen("game")} disabled={!playerName.trim()} className="wbtn" style={{ opacity: playerName.trim() ? 1 : 0.4 }}>בואי נשחק ✨</button>
          <button onClick={() => setShowHelp(true)} className="wlnk">איך משחקים?</button>
        </div>
        {showHelp && <Help onClose={() => setShowHelp(false)} />}
        <style>{css}</style>
      </div>
    );
  }

  /* ══════ GAME ══════ */
  return (
    <div className="pg-game">

      {/* ████ RIGHT: Game panel (dominant) ████ */}
      <div className="panel-game">
        <div className="title-bar">
          <div className="title-side">
            <div className="dots-row">
              {Array.from({ length: MAX_GUESSES }).map((_, i) => (
                <span key={i} className="gdot" style={{ background: i < guessesLeft ? "#58B8A0" : "rgba(255,255,255,0.08)" }} />
              ))}
            </div>
          </div>
          <h1 className="gtitle">חמש מי יודעת</h1>
          <div className="title-side title-side-end">
            <button className="menu-btn" onClick={() => setShowMenu(!showMenu)}>
              <IconMenu />
            </button>
            {showMenu && (
              <div className="menu-dd fade-in">
                <button className="menu-it" onClick={() => { setShowHelp(true); setShowMenu(false); }}>איך משחקים?</button>
                <button className="menu-it" onClick={() => { initGame(); setShowMenu(false); }}>התחלה מחדש</button>
              </div>
            )}
          </div>
        </div>

        <div className="grid-area">
          <div className="grid-wrap" key={shuffleKey}>
            {allTiles.map((tile, i) => {
              if (tile.solved) {
                return (<div key={tile.word + "-s"} className="t t-done fade-in" style={{ backgroundColor: tile.group.color }}><span className="t-w">{tile.word}</span></div>);
              }
              const isSel = selected.includes(tile.word);
              const isShake = shakeWords.includes(tile.word);
              return (
                <button key={tile.word + shuffleKey} onClick={() => handleWordClick(tile.word)}
                  className={`t t-live ${isSel ? "t-sel" : ""} ${isShake ? "shake" : ""}`}
                  style={{ animationDelay: `${i * 0.02}s` }}>
                  {tile.word}
                </button>
              );
            })}
          </div>
        </div>

        <div className="action-bar">
          <button onClick={handleCheck} disabled={!ready} className={`ab ${ready ? "ab-ready" : "ab-idle"}`}>
            <IconCheck /><span>בדיקה</span>
          </button>
          <button onClick={handleHint} disabled={hintsUsed >= MAX_HINTS || gameOver} className="ab ab-hint" style={{ opacity: hintsUsed >= MAX_HINTS || gameOver ? 0.25 : 1 }}>
            <IconHint /><span>רמז</span>
          </button>
          <button onClick={handleShuffle} className="ab ab-ghost">
            <IconShuffle /><span>ערבוב</span>
          </button>
          <button onClick={() => setSelected([])} disabled={!selected.length} className="ab ab-ghost" style={{ opacity: selected.length ? 1 : 0.25 }}>
            <IconCancel /><span>ביטול</span>
          </button>
        </div>
      </div>

      {/* ████ LEFT: Marketing panel ████ */}
      <div className="panel-mkt">
        {/* ── BIG LOGO ── */}
        <div className="logo-area">
          <img src={LOGO_URL} alt="עתודה" className="big-logo" onError={(e) => { e.target.replaceWith(Object.assign(document.createElement('div'), { className: 'logo-text', textContent: '✦ עתודה' })); }} />
        </div>

        {/* ── Hint / Marketing content ── */}
        <div className="mkt-content">
          {currentHint ? (
            <div className="mkt-card fade-in" style={{ borderColor: currentHint.color }}>
              {currentHint.type === "solved" && <div className="mkt-badge" style={{ background: currentHint.color }}>מצאת! ✓</div>}
              {currentHint.type === "marketing" && <div className="mkt-badge" style={{ background: currentHint.color }}>💡 רמז</div>}
              {currentHint.type === "subtle" && <div className="mkt-badge subtle-badge">💡</div>}
              <p className="mkt-msg">{currentHint.text}</p>
              {(currentHint.type === "marketing" || currentHint.type === "solved") && (
                <button className="mkt-link" onClick={() => window.location.href = COURSES_URL}>
                  <span>גלי עוד על הקורס</span> <IconArrow />
                </button>
              )}
            </div>
          ) : almostMsg ? (
            <div className="mkt-card almost-card fade-in">
              <p className="mkt-msg almost-msg">כמעט! 🫣<br />חסרה לך מילה אחת</p>
            </div>
          ) : (
            <div className="mkt-card idle-card">
              <p className="mkt-idle-text">בחרי 3 מילים<br />עם קשר משותף<br />ולחצי בדיקה</p>
              <div className="mkt-stats">{guessesLeft} ניחושים · {MAX_HINTS - hintsUsed} רמזים</div>
            </div>
          )}
        </div>

        {/* ── Solved ticker ── */}
        {solvedGroups.length > 0 && !currentHint && (
          <div className="mkt-ticker">
            {solvedGroups.map((sg, i) => (
              <div key={i} className="tick fade-in" style={{ borderRightColor: sg.color }}>
                <span className="tick-dot" style={{ background: sg.color }} />
                <span className="tick-txt">{sg.marketing}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── Footer / CTA ── */}
        <div className="mkt-footer">
          <img src={FOOTER_IMG} alt="" className="footer-img" onError={(e) => { e.target.style.display = 'none'; }} />
          <button className="mkt-cta" onClick={() => window.location.href = COURSES_URL}>גלי את כל הקורסים שלנו →</button>
        </div>
      </div>

      {/* Game Over Modal */}
      {gameOver && (
        <div className="overlay">
          <div className="modal fade-in">
            <div style={{ fontSize: 44, marginBottom: 6 }}>{won ? "🎉" : "💪"}</div>
            <h2 className="m-t">{won ? `כל הכבוד ${playerName}!` : "פעם הבאה!"}</h2>
            <p className="m-txt">{won ? `פתרת ב-${guessHistory.length} ניחושים${hintsUsed > 0 ? ` (${hintsUsed} רמזים)` : ""}` : `לא נורא ${playerName}, כל ניסיון מחכים!`}</p>
            <div className="resg">{guessHistory.map((g, i) => (<div key={i} className="resr">{g.colors.map((c, j) => <span key={j} className="resd" style={{ background: c }} />)}</div>))}</div>
            <button onClick={handleShare} className="m-btn">שתפי תוצאות 📤</button>
            <div className="m-div" />
            <div className="modal-promo">
              <img src={LOGO_URL} alt="עתודה" className="modal-logo" onError={(e) => { e.target.style.display = 'none'; }} />
              <p className="modal-promo-t">נהנית? בעתודה יש עוד הרבה יותר 🌟</p>
              <p className="modal-promo-s">קורסים מקצועיים, תעודות מוכרות, וליווי אישי</p>
              <button onClick={() => window.location.href = COURSES_URL} className="modal-promo-btn">גלי את הקורסים שלנו →</button>
            </div>
            <button onClick={initGame} className="m-lnk">שחקי שוב 🔄</button>
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
        <h2 className="m-t">איך משחקים? 🎯</h2>
        <div className="help-body">
          <p>לפנייך <strong>15 מילים</strong> המחולקות ל-<strong>5 קבוצות</strong> של 3 מילים עם קשר משותף.</p>
          <p style={{ marginTop: 10 }}><strong>כללים:</strong><br />• בחרי 3 מילים ולחצי "בדיקה"<br />• ניחוש נכון — הקבוצה תתגלה<br />• ניחוש שגוי — תפסידי ניחוש<br />• צדקת ב-2 מתוך 3 — "כמעט!"<br />• 6 ניחושים · 2 רמזים</p>
        </div>
        <button onClick={onClose} className="m-btn" style={{ marginTop: 16 }}>הבנתי! 👍</button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   CSS — ALL STYLES
   ═══════════════════════════════════════════ */
const css = `
/* ── Google Fonts ── */
@import url('https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700;800;900&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@400;500;700;900&display=swap');

/* ══════════════════════════════════
   GLOBAL RESET — forces Heebo on EVERYTHING
   ══════════════════════════════════ */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-family: 'Heebo', Arial, sans-serif;
}
html, body, #root {
  height: 100%;
  overflow: hidden;
  font-family: 'Heebo', Arial, sans-serif;
}
h1, h2, h3 {
  font-family: 'Frank Ruhl Libre', 'Heebo', serif;
}
button, input, textarea, select {
  font-family: 'Heebo', Arial, sans-serif;
}

/* ══════════════════════════════════
   WELCOME SCREEN
   ══════════════════════════════════ */
.pg-welcome {
  direction: rtl;
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(160deg, #0d0b2e, #151050 35%, #1a1360 60%, #12103a);
  display: flex;
  align-items: center;
  justify-content: center;
}
.wcard {
  background: rgba(255,255,255,0.96);
  padding: 36px 28px 28px;
  text-align: center;
  max-width: 340px;
  width: 90%;
  box-shadow: 0 12px 48px rgba(0,0,0,0.3);
}
.wlogo {
  display: block;
  margin: 0 auto 16px;
  width: 140px;
  height: auto;
  /* invert for dark logo on white bg */
  filter: invert(1) brightness(0.3);
}
.wtitle {
  font-size: 28px;
  font-weight: 900;
  color: #1a1360;
  margin: 0 0 2px;
}
.wbrand {
  font-size: 11px;
  color: #999;
  letter-spacing: 2px;
  margin: 0 0 12px;
}
.wline {
  width: 36px;
  height: 3px;
  background: linear-gradient(90deg, #58B8A0, #C490D1);
  margin: 0 auto 12px;
}
.wdesc {
  font-size: 13px;
  color: #777;
  line-height: 1.8;
  margin: 0 0 16px;
}
.winput {
  width: 100%;
  padding: 11px 14px;
  border: 2px solid #e0dce8;
  font-size: 14px;
  text-align: center;
  outline: none;
  color: #1a1360;
  margin-bottom: 10px;
}
.winput:focus {
  border-color: #58B8A0 !important;
  box-shadow: 0 0 0 3px rgba(88,184,160,0.15) !important;
}
.wbtn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #1a1360, #302070);
  color: #fff;
  border: none;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  margin-bottom: 10px;
  transition: all 0.15s;
}
.wbtn:hover { filter: brightness(1.08); }
.wlnk {
  background: none;
  border: none;
  color: #999;
  font-size: 12px;
  cursor: pointer;
}

/* ══════════════════════════════════
   GAME — horizontal two-panel split
   ══════════════════════════════════ */
.pg-game {
  direction: rtl;
  height: 100vh;
  overflow: hidden;
  background: #0e0c30;
  display: flex;
}

/* ── Game panel (RIGHT, dominant ~72%) ── */
.panel-game {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 14px 28px 10px;
  min-width: 0;
}

/* Title bar — 3 columns: dots | CENTERED RED TITLE | menu */
.title-bar {
  display: flex;
  align-items: center;
  padding-bottom: 10px;
  flex-shrink: 0;
}
.title-side {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 80px;
  position: relative;
}
.title-side-end {
  justify-content: flex-end;
}
.gtitle {
  flex: 1;
  text-align: center;
  font-size: 26px;
  font-weight: 900;
  color: #d94040;
  letter-spacing: 1px;
  text-shadow: 0 2px 18px rgba(220,60,60,0.25);
}
.dots-row { display: flex; gap: 5px; align-items: center; }
.gdot { width: 9px; height: 9px; transition: all 0.3s; }
.menu-btn {
  background: none;
  border: none;
  color: rgba(255,255,255,0.2);
  cursor: pointer;
  padding: 4px;
  transition: all 0.15s;
}
.menu-btn:hover { color: rgba(255,255,255,0.5); }
.menu-dd {
  position: absolute;
  left: 0;
  top: 100%;
  margin-top: 4px;
  background: rgba(30,25,80,0.97);
  border: 1px solid rgba(255,255,255,0.1);
  padding: 4px;
  min-width: 130px;
  z-index: 50;
  box-shadow: 0 8px 24px rgba(0,0,0,0.4);
  backdrop-filter: blur(10px);
}
.menu-it {
  display: block;
  width: 100%;
  padding: 8px 10px;
  background: none;
  border: none;
  color: rgba(255,255,255,0.7);
  font-size: 12px;
  cursor: pointer;
  text-align: right;
  transition: all 0.12s;
}
.menu-it:hover { background: rgba(255,255,255,0.08); color: #fff; }

/* Grid area — centered with breathing room */
.grid-area {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px 12%;
}
.grid-wrap {
  width: 100%;
  max-width: 360px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(5, 1fr);
  gap: 6px;
  aspect-ratio: 3 / 5;
  max-height: 100%;
}

/* Tiles */
.t {
  border: none;
  font-size: clamp(13px, 2vw, 17px);
  font-weight: 700;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.18s ease;
  text-align: center;
  min-width: 0;
  min-height: 0;
}
.t-live {
  background: linear-gradient(145deg, rgba(55,50,130,0.7), rgba(45,40,110,0.85));
  color: rgba(200,196,232,0.85);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.06), 0 2px 4px rgba(0,0,0,0.2), 0 0 0 1px rgba(70,65,150,0.25);
}
.t-live:hover {
  background: linear-gradient(145deg, rgba(70,65,155,0.8), rgba(60,55,135,0.9));
  transform: translateY(-1px);
  color: #e0ddf5;
}
.t-live:active { transform: scale(0.96) !important; }
.t-sel {
  background: linear-gradient(145deg, rgba(88,184,160,0.6), rgba(70,160,140,0.75)) !important;
  color: #fff !important;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.12), 0 0 14px rgba(88,184,160,0.2), 0 0 0 2px rgba(88,184,160,0.4) !important;
  transform: scale(0.97);
}
.t-done {
  cursor: default;
  color: #1a1a2e;
  box-shadow: 0 2px 6px rgba(0,0,0,0.12);
}
.t-w { font-size: clamp(13px, 2vw, 17px); font-weight: 700; }

/* Action bar */
.action-bar {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
  padding-top: 8px;
  max-width: 360px;
  align-self: center;
  width: 100%;
}
.ab {
  flex: 1;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 10px 4px;
  font-size: 11px;
  font-weight: 600;
  transition: all 0.15s;
}
.ab:hover { filter: brightness(1.12); transform: scale(1.02); }
.ab:active { transform: scale(0.96); }

/* Check button: idle=dim, ready=RED pulsing */
.ab-idle {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.06);
  color: rgba(255,255,255,0.2);
  opacity: 0.3;
}
.ab-ready {
  background: linear-gradient(180deg, #d94040, #c03030);
  color: #fff;
  box-shadow: 0 2px 12px rgba(220,60,60,0.35);
  animation: pulse-red 1.5s ease infinite;
}
@keyframes pulse-red {
  0%,100% { box-shadow: 0 2px 12px rgba(220,60,60,0.3); }
  50% { box-shadow: 0 2px 20px rgba(220,60,60,0.5); }
}
.ab-hint { background: linear-gradient(180deg, #5a78c8, #4a68b8); color: #fff; }
.ab-ghost { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06); color: rgba(255,255,255,0.4); }

/* ══════════════════════════════════
   MARKETING PANEL (LEFT, ~28%)
   ══════════════════════════════════ */
.panel-mkt {
  width: 28%;
  min-width: 220px;
  max-width: 300px;
  background: linear-gradient(180deg, #13103d 0%, #1a1555 50%, #0f0d2a 100%);
  border-right: 1px solid rgba(255,255,255,0.04);
  display: flex;
  flex-direction: column;
  padding: 20px 18px 14px;
  gap: 14px;
  overflow: hidden;
}

/* ▓▓▓ BIG LOGO — takes up real space ▓▓▓ */
.logo-area {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 0 16px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.big-logo {
  width: 100%;
  max-width: 200px;
  height: auto;
  display: block;
  object-fit: contain;
}
.logo-text {
  font-size: 32px;
  font-weight: 900;
  color: #e8e4f8;
  text-align: center;
}

/* Marketing content area */
.mkt-content {
  flex: 1;
  display: flex;
  min-height: 0;
}
.mkt-card {
  flex: 1;
  border: 1px solid rgba(255,255,255,0.06);
  padding: 18px 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
  position: relative;
  overflow: hidden;
}
.mkt-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(88,184,160,0.02), rgba(196,144,209,0.02));
  pointer-events: none;
}
.idle-card { border-color: rgba(255,255,255,0.03); }
.almost-card { border-color: rgba(240,201,75,0.15); background: rgba(240,201,75,0.02); }

.mkt-badge {
  display: inline-block;
  align-self: flex-start;
  padding: 3px 10px;
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.3px;
}
.subtle-badge { background: rgba(255,255,255,0.08); }

.mkt-msg {
  font-size: 18px;
  font-weight: 700;
  line-height: 1.7;
  color: rgba(255,255,255,0.85);
  position: relative;
  z-index: 1;
}
.almost-msg { color: #F0C94B; text-align: center; }

.mkt-idle-text {
  font-size: 14px;
  color: rgba(255,255,255,0.25);
  font-weight: 400;
  line-height: 1.8;
}
.mkt-stats {
  font-size: 12px;
  color: rgba(255,255,255,0.2);
}

.mkt-link {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  color: #fff;
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  margin-top: 4px;
}
.mkt-link:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.2); }

/* Solved ticker */
.mkt-ticker { display: flex; flex-direction: column; gap: 5px; }
.tick {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 7px 9px;
  border-right: 3px solid #fff;
  background: rgba(255,255,255,0.015);
}
.tick-dot { width: 6px; height: 6px; flex-shrink: 0; }
.tick-txt { font-size: 12px; color: rgba(255,255,255,0.4); line-height: 1.4; }

/* Footer / CTA */
.mkt-footer {
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid rgba(255,255,255,0.04);
}
.footer-img {
  width: 100%;
  max-height: 50px;
  object-fit: contain;
  margin-bottom: 10px;
  opacity: 0.6;
}
.mkt-cta {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #58B8A0, #4aa890);
  color: #fff;
  border: none;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
  letter-spacing: 0.3px;
}
.mkt-cta:hover { filter: brightness(1.1); }

/* ══════════════════════════════════
   MODAL / OVERLAY
   ══════════════════════════════════ */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(8,6,24,0.7);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 16px;
}
.modal {
  background: #fff;
  padding: 28px 24px;
  text-align: center;
  max-width: 380px;
  width: 100%;
  max-height: 88vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0,0,0,0.35);
}
.m-t { font-size: 20px; font-weight: 900; color: #1a1360; margin: 0 0 6px; }
.m-txt { font-size: 13px; color: #777; margin: 0 0 16px; line-height: 1.6; }
.m-btn {
  width: 100%;
  padding: 11px;
  background: linear-gradient(135deg, #1a1360, #302070);
  color: #fff;
  border: none;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  margin-bottom: 6px;
  transition: all 0.15s;
}
.m-btn:hover { filter: brightness(1.08); }
.m-lnk { background: none; border: none; color: #999; font-size: 12px; cursor: pointer; margin-top: 6px; }
.m-div { height: 1px; background: #f0edf4; margin: 10px 0; }
.resg { display: flex; flex-direction: column; gap: 3px; align-items: center; margin-bottom: 16px; }
.resr { display: flex; gap: 3px; }
.resd { width: 20px; height: 20px; }

.modal-promo {
  background: linear-gradient(135deg, #f8f6fd, #f0eef8);
  padding: 20px 16px;
  margin-bottom: 8px;
  border: 1px solid #e8e4f0;
}
.modal-logo {
  display: block;
  margin: 0 auto 10px;
  width: 120px;
  height: auto;
  filter: invert(1) brightness(0.3);
}
.modal-promo-t { font-size: 16px; font-weight: 800; color: #1a1360; margin: 0 0 4px; }
.modal-promo-s { font-size: 12px; color: #777; margin: 0 0 14px; line-height: 1.5; }
.modal-promo-btn {
  width: 100%;
  padding: 13px;
  background: linear-gradient(135deg, #58B8A0, #4aa890);
  color: #fff;
  border: none;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
}
.modal-promo-btn:hover { filter: brightness(1.1); }

.help-body { text-align: right; line-height: 2; font-size: 13px; color: #555; }

/* ══════════════════════════════════
   ANIMATIONS
   ══════════════════════════════════ */
@keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-5px)} 40%{transform:translateX(5px)} 60%{transform:translateX(-3px)} 80%{transform:translateX(3px)} }
.shake { animation: shake 0.45s ease-in-out !important; background: rgba(232,88,88,0.35) !important; color: #faa !important; }
@keyframes fadeIn { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:translateY(0); } }
.fade-in { animation: fadeIn 0.3s ease forwards; }
.t-live { animation: fadeIn 0.15s ease backwards; }

/* ══════════════════════════════════
   RESPONSIVE
   ══════════════════════════════════ */
@media (max-width: 700px) {
  .pg-game { flex-direction: column-reverse; }
  .panel-mkt {
    width: 100%; min-width: 0; max-width: 100%;
    max-height: 30vh;
    border-right: none;
    border-top: 1px solid rgba(255,255,255,0.04);
    padding: 10px 14px 8px;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }
  .logo-area { padding: 0; border-bottom: none; flex: 0 0 auto; }
  .big-logo { width: 80px !important; max-width: 80px !important; }
  .mkt-content { flex: 1; min-width: 180px; }
  .mkt-card { padding: 8px 12px; gap: 6px; }
  .mkt-msg { font-size: 13px; }
  .mkt-ticker { display: none; }
  .mkt-footer { display: none; }
  .panel-game { padding: 10px 16px 8px; }
  .grid-area { padding: 4px 6%; }
}

@media (max-width: 450px) {
  .panel-mkt { max-height: 25vh; }
  .mkt-msg { font-size: 12px; }
  .mkt-link { padding: 6px 8px; font-size: 11px; }
  .gtitle { font-size: 20px; }
  .grid-area { padding: 4px 3%; }
}
`;
