// ============================================================
// App.jsx — the generic Flashpoint game shell.
//
// Data-driven from ./gameData.js. This file does NOT change per game; only
// gameData.js does. Behavior is ported from the live 1900 build, with two
// deliberate upgrades the spec mandates over that build:
//   1. IMAGE SYSTEM — every title/chapter/insert renders through <ImageSlot>
//      when gameData.images wires a slot; absent keys fall back to the exact
//      text-only path the live game ships (art is purely additive).
//   2. WORKSHEET-AS-SAVE-FILE — chapters are ALWAYS unlocked (no sequential
//      gating), deep-linkable via ?chapter=N, and localStorage is a
//      within-session convenience only, never a hard dependency.
// ============================================================

import { useState, useEffect } from 'react'
import game from './gameData.js'
import ImageSlot from './components/ImageSlot.jsx'

const META = game.meta
const CHAPTERS = game.chapters
const INIT_METERS = game.meters.init
const METER_CONFIG = game.meters.config
const VERDICTS = game.verdicts
const IMAGES = game.images
const SAVE_KEY = META.saveKey
const DECISION_LETTERS = ['a', 'b', 'c', 'd', 'e']
// Home timeline (the Flashpoint landing page) — exit link at chapter/game end.
const TIMELINE_URL = 'https://flashpointhistory.com'

// Chapter-select metadata derived from the chapters themselves.
const ALL_CHAPTER_META = CHAPTERS.map(c => ({ id: c.id, title: c.title, subtitle: c.subtitle }))

// ── VERDICT (data-driven; was getVerdict() in the live build) ─────────────
// Two modes:
//   • 'highestGauge' — the verdict keyed to the single highest gauge at game
//     end wins; a tie resolves to the FIRST verdict listed (VERDICTS order).
//     This is the mode the 11.2 / 11.3 briefs specify.
//   • default (scoring) — the live 1900 model: score = sum(add) - sum(subtract)
//     matched top-down against each tier's `min`.
function getVerdict(meters) {
  if (META.verdictMode === 'highestGauge') {
    let best = VERDICTS[0]
    let bestVal = meters[best.key] ?? -Infinity
    for (const v of VERDICTS) {
      const val = meters[v.key] ?? -Infinity
      if (val > bestVal) {
        bestVal = val
        best = v
      }
    }
    return best
  }
  const { add = [], subtract = [] } = META.scoring || {}
  const score =
    add.reduce((s, k) => s + (meters[k] || 0), 0) -
    subtract.reduce((s, k) => s + (meters[k] || 0), 0)
  return VERDICTS.find(v => score >= v.min) || VERDICTS[VERDICTS.length - 1]
}

// ── slot lookups ──────────────────────────────────────────────────────────
const heroSrc = () => IMAGES?.hero || ''
const backdropSrc = id => IMAGES?.chapterBackdrops?.[id] || ''
const portraitSrc = roleId => (roleId ? IMAGES?.portraits?.[roleId] || '' : '')
const insertSrc = (chapterId, decisionIndex) =>
  IMAGES?.inserts?.[`${chapterId}${DECISION_LETTERS[decisionIndex]}`] || ''

// ============================================================
// METER HELPERS
// ============================================================
function clampMeters(m) {
  const out = {}
  Object.keys(m).forEach(k => {
    out[k] = Math.max(0, Math.min(100, m[k]))
  })
  return out
}

function applyDeltas(meters, deltas) {
  const out = { ...meters }
  Object.entries(deltas).forEach(([k, v]) => {
    out[k] = (out[k] || 0) + v
  })
  return clampMeters(out)
}

function MainPanel({ meters, accent, children }) {
  return (
    <div className="main-panel" style={{ '--accent': accent }}>
      <div className="panel-accent" style={{ background: accent }} />
      <div className="panel-inner">
        <div className="meters">
          {METER_CONFIG.map(m => (
            <div key={m.key} className="meter-item">
              <span className="meter-label">{m.label}</span>
              <div className="meter-bar-bg">
                <div
                  className="meter-bar-fill"
                  style={{
                    width: `${Math.max(0, Math.min(100, meters[m.key]))}%`,
                    background: m.color,
                  }}
                />
              </div>
              <span className="meter-value">{Math.round(meters[m.key])}</span>
            </div>
          ))}
        </div>
        {children}
      </div>
    </div>
  )
}

function DeltaTags({ deltas }) {
  return (
    <div className="delta-row">
      {METER_CONFIG.map(m => {
        const v = deltas[m.key]
        if (!v) return null
        return (
          <span key={m.key} className={`delta ${v > 0 ? 'pos' : 'neg'}`}>
            {m.label} {v > 0 ? '+' : ''}
            {v}
          </span>
        )
      })}
    </div>
  )
}

function ProgressPips({ total, current }) {
  return (
    <div className="progress-row">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`progress-pip ${i < current ? 'done' : i === current ? 'current' : ''}`}
        />
      ))}
    </div>
  )
}

// ============================================================
// SCREENS
// ============================================================

// ── TITLE ─────────────────────────────────────────────────
function TitleMasthead({ onStart, onResume, hasSave }) {
  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          marginBottom: 36,
          justifyContent: 'center',
        }}
      >
        <div style={{ flex: 1, maxWidth: 120, height: 1, background: 'linear-gradient(90deg, transparent, #3d2c12)' }} />
        <span
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 9,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: '#5a4220',
            whiteSpace: 'nowrap',
          }}
        >
          {META.period}
        </span>
        <div style={{ flex: 1, maxWidth: 120, height: 1, background: 'linear-gradient(90deg, #3d2c12, transparent)' }} />
      </div>

      <h1
        className="game-title"
        style={{
          color: META.accent,
          // era accent glow (was hardcoded amber in the shared shell) — keeps
          // the masthead on-brand per game: Forten blue / Hayden green.
          textShadow: `0 0 120px ${META.accent}80, 0 0 40px ${META.accent}40, 0 6px 24px rgba(0,0,0,0.95)`,
        }}
      >
        {META.title}
      </h1>

      <div style={{ display: 'flex', alignItems: 'center', gap: 20, margin: '20px auto 20px', maxWidth: 480, justifyContent: 'center' }}>
        <div style={{ flex: 1, height: 1, background: '#3d2c12' }} />
        <span
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 'clamp(1.3rem, 4vw, 2rem)',
            fontStyle: 'italic',
            fontWeight: 400,
            color: '#d4c090',
            whiteSpace: 'nowrap',
          }}
        >
          {META.subtitle}
        </span>
        <div style={{ flex: 1, height: 1, background: '#3d2c12' }} />
      </div>

      <p style={{ fontFamily: "'Libre Baskerville', Georgia, serif", maxWidth: 520, margin: '32px auto', fontSize: 17, lineHeight: 1.9, color: '#7a6642' }}>
        {META.deck}
      </p>
      <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: 'italic', maxWidth: 420, margin: '0 auto 44px', fontSize: 19, color: '#c09060' }}>
        {META.tagline}
      </p>

      <p style={{ fontFamily: "'Cinzel', serif", fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#3d2c12', marginBottom: 40 }}>
        Standards · {META.standardsLine}
      </p>

      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button className="btn btn-primary" onClick={onStart} style={{ '--accent': META.accent, background: META.accent, padding: '16px 48px', fontSize: 12 }}>
          {hasSave ? 'New Game' : 'Begin'}
        </button>
        {hasSave && (
          <button className="btn btn-outline" onClick={onResume} style={{ '--accent': META.accent, padding: '16px 48px', fontSize: 12 }}>
            Resume
          </button>
        )}
      </div>
    </>
  )
}

function TitleScreen({ onStart, onResume, hasSave }) {
  const hero = heroSrc()
  // Art path: masthead composited over the hero backdrop's scrim.
  if (hero) {
    return (
      <div style={{ '--accent': META.accent }}>
        <ImageSlot variant="hero" src={hero} accent={META.accent} alt={`${META.title}: ${META.subtitle}`}>
          <div style={{ textAlign: 'center', width: '100%' }}>
            <TitleMasthead onStart={onStart} onResume={onResume} hasSave={hasSave} />
          </div>
        </ImageSlot>
      </div>
    )
  }
  // Text-only path: exactly as the live game renders today.
  return (
    <div style={{ '--accent': META.accent, textAlign: 'center', padding: '72px 24px 56px' }}>
      <TitleMasthead onStart={onStart} onResume={onResume} hasSave={hasSave} />
    </div>
  )
}

// ── HOW TO PLAY ───────────────────────────────────────────
function HowToPlay({ onContinue }) {
  const gaugeNames = METER_CONFIG.map(m => m.label)
  const gaugeList =
    gaugeNames.length > 1
      ? `${gaugeNames.slice(0, -1).join(', ')}, and ${gaugeNames[gaugeNames.length - 1]}`
      : gaugeNames[0]
  const items = [
    ['Your Role', 'Each chapter places you inside a specific historical actor — not an observer. Your decisions are their decisions.'],
    ['The Gauges', `${METER_CONFIG.length} forces shape this era: ${gaugeList}. Your choices shift all of them.`],
    ['No Right Answers', 'Every decision involves real trade-offs. The most historically accurate choice is not always the most morally comfortable one.'],
    ['Regents Hinge', 'Each chapter closes with a Regents-style analytical question. Full explanations are provided regardless of your answer.'],
    ['Your Verdict', `After all ${CHAPTERS.length} chapters, your accumulated choices determine which version of this era you built — or failed to build.`],
  ]
  return (
    <div style={{ '--accent': META.accent }}>
      <span className="eyebrow">How to Play</span>
      <h2 className="screen-title">Before You Begin</h2>
      {items.map(([title, desc]) => (
        <div key={title} style={{ marginBottom: 16, paddingLeft: 14, borderLeft: '2px solid #2e2214' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: META.accent, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>{title}</div>
          <p className="body-text" style={{ marginBottom: 0, fontSize: 14 }}>{desc}</p>
        </div>
      ))}
      <div style={{ marginTop: 24 }}>
        <button className="btn btn-primary" onClick={onContinue} style={{ '--accent': META.accent, background: META.accent }}>
          Enter the Era
        </button>
      </div>
    </div>
  )
}

// ── CHAPTER HUB (chapters ALWAYS unlocked — worksheet-as-save-file) ────────
function ChapterHub({ completed, onSelect, meters, onShowVerdict }) {
  const allDone = completed.length >= CHAPTERS.length
  const verdict = getVerdict(meters)
  return (
    <div style={{ '--accent': META.accent }}>
      <span className="eyebrow">Chapter Select</span>
      <h2 className="screen-title">
        {META.title}: {META.subtitle}
      </h2>
      {allDone && (
        <div className="verdict-box" style={{ '--accent': verdict.color }}>
          <div className="verdict-title">{verdict.title}</div>
          <div style={{ fontSize: 12, color: '#7a6a52', marginBottom: 10, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{verdict.subtitle}</div>
          <p className="body-text" style={{ fontSize: 14, marginBottom: 14 }}>{verdict.description}</p>
          <button className="btn btn-outline" onClick={onShowVerdict} style={{ '--accent': verdict.color }}>
            Full Verdict
          </button>
        </div>
      )}
      <div className="chapter-grid">
        {ALL_CHAPTER_META.map((meta, i) => {
          const isDone = completed.includes(meta.id)
          const accent = CHAPTERS[i]?.accentColor || META.accent
          return (
            <div
              key={meta.id}
              className={`chapter-card ${isDone ? 'complete' : ''}`}
              style={{ '--accent': accent, borderColor: isDone ? accent + '44' : undefined }}
              onClick={() => onSelect(meta.id)}
            >
              <div className="chapter-num">
                Chapter {meta.id} {isDone ? '✓' : ''}
              </div>
              <div className="chapter-name">{meta.title}</div>
              <div className="chapter-sub">{meta.subtitle}</div>
              {isDone && <div className="chapter-status">Complete — Replay available</div>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── CHAPTER INTRO (chapter header: frontispiece backdrop + portrait) ───────
function ChapterIntro({ chapter, onContinue }) {
  const accent = chapter.accentColor
  const backdrop = backdropSrc(chapter.id)
  const portrait = portraitSrc(chapter.roleId)

  const header = backdrop ? (
    <ImageSlot variant="frontispiece" src={backdrop} accent={accent} alt={`${chapter.title} — ${chapter.subtitle}`}>
      <span className="eyebrow">Chapter {chapter.id} of {CHAPTERS.length}</span>
      <h2 className="screen-title" style={{ marginBottom: 0 }}>{chapter.title}</h2>
    </ImageSlot>
  ) : (
    <>
      <span className="eyebrow">Chapter {chapter.id} of {CHAPTERS.length}</span>
      <h2 className="screen-title">{chapter.title}</h2>
    </>
  )

  return (
    <div style={{ '--accent': accent }}>
      {header}
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', marginTop: backdrop ? 22 : 0, flexWrap: 'wrap' }}>
        {portrait && <ImageSlot variant="portrait" src={portrait} accent={accent} alt={`Portrait: ${chapter.role}`} />}
        <div style={{ flex: 1, minWidth: 260 }}>
          <div className="role-tag">Your Role: {chapter.role}</div>
          <div className="quote-block">
            <div className="quote-text">{chapter.quote}</div>
            <div className="quote-source">— {chapter.quoteSource}</div>
          </div>
          <p className="body-text" style={{ color: '#7a6a52', fontSize: 13 }}>
            <strong style={{ color: '#9a8a6a' }}>Sourcing note:</strong> Consider the context and purpose of this quote as you play. Who said it, and why? What does it reveal about the historical moment?
          </p>
        </div>
      </div>
      <button className="btn btn-primary" onClick={onContinue}>Read Historical Context →</button>
    </div>
  )
}

// ── CHAPTER CONTEXT ───────────────────────────────────────
function ChapterContext({ chapter, page, onNext, onBegin }) {
  const accent = chapter.accentColor
  const context = chapter.context
  const isLast = page >= context.length - 1
  return (
    <div style={{ '--accent': accent }}>
      <span className="eyebrow">Historical Context · {page + 1} of {context.length}</span>
      <h2 className="screen-title">{chapter.title}</h2>
      <ProgressPips total={context.length} current={page + 1} />
      <p className="body-text">{context[page]}</p>
      <div style={{ marginTop: 20 }}>
        {isLast ? (
          <button className="btn btn-primary" onClick={onBegin}>Make Your First Decision →</button>
        ) : (
          <button className="btn btn-secondary" onClick={onNext}>Continue →</button>
        )}
      </div>
    </div>
  )
}

// ── DECISION (optional S4 archival insert at the decision/hinge) ───────────
function DecisionScreen({ chapter, decisionIndex, selected, onSelect }) {
  const accent = chapter.accentColor
  const dec = chapter.decisions[decisionIndex]
  const insert = insertSrc(chapter.id, decisionIndex)
  return (
    <div style={{ '--accent': accent }}>
      <span className="eyebrow">Decision {decisionIndex + 1} of {chapter.decisions.length} · {dec.year}</span>
      <ProgressPips total={chapter.decisions.length} current={decisionIndex} />
      {insert && (
        <div style={{ maxWidth: 420, margin: '0 0 22px' }}>
          <ImageSlot variant="insert" src={insert} accent={accent} alt={dec.situation.slice(0, 80)} caption={dec.insertCaption} />
        </div>
      )}
      <p className="body-text">{dec.situation}</p>
      <hr className="divider" />
      <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#7a6a52', marginBottom: 14 }}>{dec.question}</p>
      {dec.options.map(opt => (
        <div
          key={opt.label}
          className={`choice-card ${selected === opt.label ? 'selected' : ''}`}
          onClick={() => !selected && onSelect(opt.label)}
        >
          <div className="choice-label">Option {opt.label}</div>
          <div className="choice-text">{opt.text}</div>
        </div>
      ))}
    </div>
  )
}

// ── CONSEQUENCE ───────────────────────────────────────────
function ConsequenceScreen({ chapter, decisionIndex, choiceLabel, onContinue }) {
  const accent = chapter.accentColor
  const dec = chapter.decisions[decisionIndex]
  const opt = dec.options.find(o => o.label === choiceLabel)
  const isLast = decisionIndex >= chapter.decisions.length - 1
  return (
    <div style={{ '--accent': accent }}>
      <span className="eyebrow">Consequence · Decision {decisionIndex + 1}</span>
      <h2 className="screen-title">What Happens Next</h2>
      <div className="quote-block">
        <div className="quote-text" style={{ fontStyle: 'normal', fontSize: 14 }}>{opt.consequence}</div>
      </div>
      <DeltaTags deltas={opt.meters} />
      <div style={{ marginTop: 24 }}>
        <button className="btn btn-primary" onClick={onContinue}>
          {isLast ? 'Regents Question →' : `Decision ${decisionIndex + 2} →`}
        </button>
      </div>
    </div>
  )
}

// ── CRISIS ────────────────────────────────────────────────
function CrisisScreen({ chapter, onContinue }) {
  const accent = chapter.accentColor
  return (
    <div className="crisis-screen" style={{ '--accent': accent }}>
      <div className="crisis-title">{chapter.crisisTitle}</div>
      <p className="body-text" style={{ maxWidth: 560, margin: '0 auto 30px', fontSize: 15 }}>{chapter.crisisText}</p>
      <button className="btn btn-outline" onClick={onContinue}>Continue →</button>
    </div>
  )
}

// ── HINGE ─────────────────────────────────────────────────
function HingeScreen({ chapter, answer, onAnswer, onContinue }) {
  const accent = chapter.accentColor
  const hq = chapter.hingeQuestion
  const answered = answer !== null
  return (
    <div style={{ '--accent': accent }}>
      <span className="eyebrow">Regents Hinge Question</span>
      <span className="skill-tag">{hq.regentsSkill}</span>
      <h2 className="screen-title" style={{ fontSize: '1.15rem', marginBottom: 18 }}>{hq.question}</h2>
      {hq.options.map((opt, i) => {
        let cls = 'hinge-option'
        if (answered) {
          cls += ' disabled'
          if (i === hq.correctIndex) cls += ' correct'
          else if (i === answer) cls += ' incorrect'
        }
        return (
          <div key={i} className={cls} onClick={() => !answered && onAnswer(i)}>
            <strong style={{ marginRight: 8, opacity: 0.6 }}>{String.fromCharCode(65 + i)}.</strong>
            {opt}
          </div>
        )
      })}
      {answered && (
        <div className="hinge-explanation">
          <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: answer === hq.correctIndex ? '#4a8a4a' : '#8a4a4a', marginBottom: 8, fontWeight: 700 }}>
            {answer === hq.correctIndex ? '✓ Correct' : '✗ Review'}
          </div>
          <p className="body-text" style={{ fontSize: 14, marginBottom: 0 }}>{hq.explanation}</p>
          <div style={{ marginTop: 18 }}>
            <button className="btn btn-primary" onClick={onContinue}>Complete Chapter →</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── CHAPTER END ───────────────────────────────────────────
function ChapterEnd({ chapter, onHub }) {
  return (
    <div style={{ '--accent': chapter.accentColor }}>
      <span className="eyebrow">Chapter {chapter.id} Complete</span>
      <h2 className="screen-title">{chapter.title}</h2>
      <p className="body-text">You have played through {chapter.years}. Your decisions have shifted the forces that will shape the next chapter.</p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 20 }}>
        <button className="btn btn-primary" onClick={onHub}>
          {chapter.id < CHAPTERS.length ? 'Next Chapter →' : 'Final Verdict →'}
        </button>
        <a className="btn btn-secondary" href={TIMELINE_URL}>↩ Flashpoint Timeline</a>
      </div>
    </div>
  )
}

// ── FULL VERDICT ──────────────────────────────────────────
function VerdictScreen({ meters, onHub }) {
  const v = getVerdict(meters)
  return (
    <div style={{ '--accent': v.color }}>
      <span className="eyebrow">Final Verdict · All Chapters Complete</span>
      <h2 className="screen-title">{v.title}</h2>
      <div className="role-tag" style={{ borderColor: v.color, color: v.color }}>{v.subtitle}</div>
      <p className="body-text">{v.description}</p>
      <hr className="divider" />
      <div style={{ marginBottom: 16 }}>
        <span className="eyebrow">Your Final Gauges</span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, marginTop: 10 }}>
          {METER_CONFIG.map(m => (
            <div key={m.key}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 12, color: '#8a7a5a', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{m.label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#c0b098' }}>{Math.round(meters[m.key])}</span>
              </div>
              <div className="meter-bar-bg" style={{ height: 8 }}>
                <div className="meter-bar-fill" style={{ width: `${meters[m.key]}%`, background: m.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <hr className="divider" />
      <p className="body-text" style={{ fontSize: 13, color: '#6a5a42' }}>
        Use the reflection journal to connect these outcomes to the Regents standards. Play again to explore how different choices shape different historical outcomes.
      </p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
        <button className="btn btn-secondary" onClick={onHub}>Back to Chapter Select</button>
        <a className="btn btn-primary" href={TIMELINE_URL}>↩ All Flashpoint Games</a>
      </div>
    </div>
  )
}

// ============================================================
// APP CONTROLLER
// ============================================================
export default function App() {
  const [screen, setScreen] = useState('title')
  const [meters, setMeters] = useState(INIT_METERS)
  const [completed, setCompleted] = useState([])
  const [chapterId, setChapterId] = useState(null)
  const [decisionIdx, setDecisionIdx] = useState(0)
  const [contextPage, setContextPage] = useState(0)
  const [selectedChoice, setSelectedChoice] = useState(null)
  const [hingeAnswer, setHingeAnswer] = useState(null)
  const [showCrisis, setShowCrisis] = useState(false)
  const [allChoices, setAllChoices] = useState({})

  const chapter = CHAPTERS.find(c => c.id === chapterId) || null
  const accentColor = chapter?.accentColor || META.accent

  // Per-game accent as a document-level CSS variable.
  useEffect(() => {
    document.body.style.setProperty('--accent', META.accent)
    document.title = `${META.title}: ${META.subtitle} — Flashpoint History`
  }, [])

  // ── SAVE / LOAD (convenience only — never a hard dependency) ──────────────
  // Wrapped in try/catch so private-mode / disabled storage degrades to a
  // fully playable session (chapters are unlocked regardless of any save).
  function readSave() {
    try {
      return JSON.parse(localStorage.getItem(SAVE_KEY) || 'null')
    } catch {
      return null
    }
  }
  function writeSave(obj) {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(obj))
    } catch {
      /* storage unavailable — session still fully playable */
    }
  }
  function clearSave() {
    try {
      localStorage.removeItem(SAVE_KEY)
    } catch {
      /* no-op */
    }
  }

  const [hasSave, setHasSave] = useState(false)

  // ── BOOT: restore save (if any) + honor ?chapter=N deep link ──────────────
  useEffect(() => {
    const s = readSave()
    let restored = { meters: INIT_METERS, completed: [], allChoices: {} }
    if (s) {
      if (s.meters) setMeters((restored.meters = s.meters))
      if (s.completed) setCompleted((restored.completed = s.completed))
      if (s.allChoices) setAllChoices((restored.allChoices = s.allChoices))
      setHasSave(true)
    }

    // Deep-linking: ?chapter=N jumps straight into that chapter (always
    // unlocked). Any invalid value falls through to the title screen.
    const params = new URLSearchParams(window.location.search)
    const raw = params.get('chapter')
    if (raw != null) {
      const n = parseInt(raw, 10)
      if (CHAPTERS.some(c => c.id === n)) {
        openChapter(n)
        return
      }
    }
    if (params.get('screen') === 'hub') setScreen('hub')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function saveGame(newMeters, newCompleted, newChoices) {
    writeSave({ meters: newMeters, completed: newCompleted, allChoices: newChoices })
    setHasSave(true)
  }

  // ── NAVIGATION ───────────────────────────────────────────
  function startNewGame() {
    clearSave()
    setHasSave(false)
    setMeters(INIT_METERS)
    setCompleted([])
    setAllChoices({})
    setScreen('howtoplay')
  }

  function resumeGame() {
    setScreen('hub')
  }

  function openChapter(id) {
    setChapterId(id)
    setDecisionIdx(0)
    setContextPage(0)
    setSelectedChoice(null)
    setHingeAnswer(null)
    setShowCrisis(false)
    setScreen('chapterIntro')
  }

  function handleChoiceSelect(label) {
    setSelectedChoice(label)
    const ch = CHAPTERS.find(c => c.id === chapterId)
    const dec = ch.decisions[decisionIdx]
    const opt = dec.options.find(o => o.label === label)
    const newMeters = applyDeltas(meters, opt.meters)
    setMeters(newMeters)

    const newChoices = {
      ...allChoices,
      [chapterId]: [...(allChoices[chapterId] || []), label],
    }
    setAllChoices(newChoices)
    saveGame(newMeters, completed, newChoices)

    setTimeout(() => setScreen('consequence'), 300)
  }

  function afterConsequence() {
    const ch = CHAPTERS.find(c => c.id === chapterId)
    const isLastDecision = decisionIdx >= ch.decisions.length - 1

    if (isLastDecision) {
      const shouldCrisis =
        ch.isCrisisChapter || (ch.crisisTitle && meters.labor > 55 && ch.id === 1)
      if (shouldCrisis && !showCrisis) {
        setShowCrisis(true)
        setScreen('crisis')
      } else {
        setScreen('hinge')
      }
    } else {
      setDecisionIdx(prev => prev + 1)
      setSelectedChoice(null)
      setScreen('decision')
    }
  }

  function afterCrisis() {
    setScreen('hinge')
  }

  function afterHinge() {
    const ch = CHAPTERS.find(c => c.id === chapterId)
    const newCompleted = completed.includes(ch.id) ? completed : [...completed, ch.id]
    setCompleted(newCompleted)
    saveGame(meters, newCompleted, allChoices)
    setScreen('chapterEnd')
  }

  // ── RENDER ───────────────────────────────────────────────
  return (
    <div className="game-wrapper">
      {screen === 'title' && <TitleScreen onStart={startNewGame} onResume={resumeGame} hasSave={hasSave} />}

      {screen === 'howtoplay' && (
        <MainPanel meters={meters} accent={META.accent}>
          <HowToPlay onContinue={() => setScreen('hub')} />
        </MainPanel>
      )}

      {screen === 'hub' && (
        <MainPanel meters={meters} accent={META.accent}>
          <ChapterHub completed={completed} onSelect={openChapter} meters={meters} onShowVerdict={() => setScreen('verdict')} />
        </MainPanel>
      )}

      {screen === 'chapterIntro' && chapter && (
        <MainPanel meters={meters} accent={accentColor}>
          <ChapterIntro chapter={chapter} onContinue={() => setScreen('chapterContext')} />
        </MainPanel>
      )}

      {screen === 'chapterContext' && chapter && (
        <MainPanel meters={meters} accent={accentColor}>
          <ChapterContext
            chapter={chapter}
            page={contextPage}
            onNext={() => setContextPage(p => p + 1)}
            onBegin={() => {
              setContextPage(0)
              setScreen('decision')
            }}
          />
        </MainPanel>
      )}

      {screen === 'decision' && chapter && (
        <MainPanel meters={meters} accent={accentColor}>
          <DecisionScreen chapter={chapter} decisionIndex={decisionIdx} selected={selectedChoice} onSelect={handleChoiceSelect} />
        </MainPanel>
      )}

      {screen === 'consequence' && chapter && selectedChoice && (
        <MainPanel meters={meters} accent={accentColor}>
          <ConsequenceScreen chapter={chapter} decisionIndex={decisionIdx} choiceLabel={selectedChoice} onContinue={afterConsequence} />
        </MainPanel>
      )}

      {screen === 'crisis' && chapter && (
        <MainPanel meters={meters} accent={accentColor}>
          <CrisisScreen chapter={chapter} onContinue={afterCrisis} />
        </MainPanel>
      )}

      {screen === 'hinge' && chapter && (
        <MainPanel meters={meters} accent={accentColor}>
          <HingeScreen chapter={chapter} answer={hingeAnswer} onAnswer={a => setHingeAnswer(a)} onContinue={afterHinge} />
        </MainPanel>
      )}

      {screen === 'chapterEnd' && chapter && (
        <MainPanel meters={meters} accent={accentColor}>
          <ChapterEnd chapter={chapter} onHub={() => setScreen('hub')} />
        </MainPanel>
      )}

      {screen === 'verdict' && (
        <MainPanel meters={meters} accent={getVerdict(meters).color}>
          <VerdictScreen meters={meters} onHub={() => setScreen('hub')} />
        </MainPanel>
      )}
    </div>
  )
}
