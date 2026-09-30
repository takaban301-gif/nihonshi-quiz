// ============================================================
// 英語・多義語 モジュール（App.jsx からはこのコンポーネントだけを呼ぶ）
//   画面: home → quiz → result / words → word-detail
// ============================================================
import { useState } from 'react'
import './eigo.css'
import { WORDS, WORD_MAP, LEVELS } from './eigoData'
import { pickSession, countWeak, contextPool, commonPool } from './eigoEngine'
import { loadEigoProgress, saveEigoProgress, recordAnswer } from './eigoProgress'
import EigoQuiz from './EigoQuiz'
import EigoResult from './EigoResult'
import EigoWordList from './EigoWordList'
import SenseMap from './SenseMap'

const MODES = [
  { key: 'context', label: '文脈で語義選択', desc: '英文中の下線語の意味を選ぶ' },
  { key: 'common', label: '共通語補充', desc: '3つの英文に共通して入る1語を選ぶ' },
  { key: 'mix', label: 'ミックス', desc: '語義選択7問＋共通語補充3問' },
]

function loadLevel() {
  try {
    const v = localStorage.getItem('eigo-level')
    if (v === null || v === 'all') return 'all'
    return Number(v)
  } catch {
    return 'all'
  }
}

export default function EigoApp({ onBack }) {
  const [screen, setScreen] = useState('home')
  const [level, setLevel] = useState(loadLevel)
  const [mode, setMode] = useState(null)
  const [session, setSession] = useState([])
  const [results, setResults] = useState([])
  const [progress, setProgress] = useState(loadEigoProgress)
  const [detailWordId, setDetailWordId] = useState(null)

  function goTo(s) {
    setScreen(s)
    window.scrollTo(0, 0)
  }

  function changeLevel(l) {
    setLevel(l)
    try { localStorage.setItem('eigo-level', String(l)) } catch { /* ignore */ }
  }

  function start(m) {
    const s = pickSession(m, level, progress)
    if (s.length === 0) return
    setMode(m)
    setSession(s)
    setResults([])
    goTo('quiz')
  }

  function handleAnswer(item, isCorrect) {
    const next = recordAnswer(progress, item, isCorrect)
    setProgress(next)
    saveEigoProgress(next)
  }

  function handleFinish(r) {
    setResults(r)
    goTo('result')
  }

  const weakCount = countWeak(level, progress)
  const wordCount = WORDS.filter(w => level === 'all' || w.level === level).length

  if (screen === 'quiz') {
    return (
      <EigoQuiz
        key={session.map(s => s.key).join()}
        session={session}
        progress={progress}
        onAnswer={handleAnswer}
        onFinish={handleFinish}
        onBack={() => goTo('home')}
      />
    )
  }

  if (screen === 'result') {
    return (
      <EigoResult
        results={results}
        onRetry={() => start(mode)}
        onBack={() => goTo('home')}
        onShowWord={id => { setDetailWordId(id); goTo('word-detail') }}
      />
    )
  }

  if (screen === 'words') {
    return (
      <EigoWordList
        level={level}
        progress={progress}
        onBack={() => goTo('home')}
        onSelect={id => { setDetailWordId(id); goTo('word-detail') }}
      />
    )
  }

  if (screen === 'word-detail') {
    const word = WORD_MAP[detailWordId]
    return (
      <div className="eigo eigo-page">
        <div className="screen-header">
          <button className="back-btn" onClick={() => goTo('words')}>← 一覧</button>
          <h2 className="screen-title">{word.word}</h2>
        </div>
        <SenseMap word={word} progress={progress} showExamples />
      </div>
    )
  }

  // home
  return (
    <div className="eigo eigo-page">
      <div className="screen-header">
        <button className="back-btn" onClick={onBack}>← 戻る</button>
        <h2 className="screen-title">🔤 英語・多義語</h2>
      </div>

      <p className="section-label">レベル（{wordCount}語）</p>
      <div className="eigo-level-row">
        {LEVELS.map(l => (
          <button
            key={l.key}
            className={`eigo-chip ${level === l.key ? 'active' : ''}`}
            onClick={() => changeLevel(l.key)}
          >
            {l.label}
          </button>
        ))}
      </div>

      <p className="section-label">出題形式を選んで10問に挑戦</p>
      <div className="eigo-mode-list">
        {MODES.map(m => {
          const n = m.key === 'common' ? commonPool(level).length
            : m.key === 'context' ? contextPool(level).length
            : contextPool(level).length + commonPool(level).length
          return (
            <button key={m.key} className="eigo-mode-card" onClick={() => start(m.key)} disabled={n === 0}>
              <span className="eigo-mode-card__label">{m.label}</span>
              <span className="eigo-mode-card__desc">{m.desc}</span>
              <span className="eigo-mode-card__count">{n}問</span>
            </button>
          )
        })}
        <button
          className="eigo-mode-card eigo-mode-card--weak"
          onClick={() => start('weak')}
          disabled={weakCount === 0}
        >
          <span className="eigo-mode-card__label">苦手な語義を復習</span>
          <span className="eigo-mode-card__desc">
            {weakCount === 0 ? '直近で間違えた語義はありません' : '直近で間違えた語義だけを出題'}
          </span>
          <span className="eigo-mode-card__count">{weakCount}件</span>
        </button>
      </div>

      <button className="btn-secondary eigo-wide" onClick={() => goTo('words')}>
        📖 単語一覧・語義マップ
      </button>
    </div>
  )
}
