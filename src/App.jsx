// ============================================================
// App.jsx 修正版
// 教科切替（日本史 / 古文）対応
//
// 変更点:
//   - 'subject-select' 画面を追加（最初の画面）
//   - subject state で教科を管理
//   - 古文選択時は kobun 系コンポーネントに分岐
//   - 日本史側は既存ロジックをそのまま維持
// ============================================================

import { useState } from 'react'
import './App.css'
import './kobun-additions.css'
import './themes.css'

// --- 既存の日本史コンポーネント ---
import EraSelect from './components/EraSelect'
import QuizSession from './components/QuizSession'
import SessionResult from './components/SessionResult'
import Stats from './components/Stats'

// --- 新規: 教科選択 ---
import SubjectSelect from './components/SubjectSelect'

// --- 新規: 古文コンポーネント ---
import KobunCategorySelect from './components/kobun/KobunCategorySelect'
import KobunQuizYontaku from './components/kobun/KobunQuizYontaku'
import KobunQuizDokkai from './components/kobun/KobunQuizDokkai'
import KobunQuizKusho from './components/kobun/KobunQuizKusho'
import KobunStats from './components/kobun/KobunStats'

// --- 新規: 現代文コンポーネント ---
import GendaibunCategorySelect from './components/gendaibun/GendaibunCategorySelect'
import GendaibunStats from './components/gendaibun/GendaibunStats'

// --- 既存: 日本史ユーティリティ ---
import { ERAS } from './utils/eras'
import { loadProgress, saveProgress, updateQuestionRecord } from './utils/progress'
import { pickSessionQuestions, pickKobunSessionQuestions, pickKobunDokkaiPassages, normalizeKobunQuestion } from './utils/quiz'

// --- 新規: 古文ユーティリティ ---
import { loadKobunProgress, saveKobunProgress, updateKobunRecord } from './utils/kobunProgress'

// --- 新規: 現代文ユーティリティ ---
import { loadGendaibunProgress, saveGendaibunProgress, updateGendaibunRecord } from './utils/gendaibunProgress'

// --- 既存: 日本史データ ---
import q_jomon      from './data/questions_jomon.json'
import q_yayoi      from './data/questions_yayoi.json'
import q_kofun      from './data/questions_kofun.json'
import q_asuka      from './data/questions_asuka.json'
import q_nara       from './data/questions_nara.json'
import q_heian      from './data/questions_heian.json'
import q_kamakura   from './data/questions_kamakura.json'
import q_nanbokucho from './data/questions_nanbokucho.json'
import q_muromachi  from './data/questions_muromachi.json'
import q_sengoku    from './data/questions_sengoku.json'
import q_azuchi     from './data/questions_azuchi.json'
import q_edo_early  from './data/questions_edo_early.json'
import q_edo_mid    from './data/questions_edo_mid.json'
import q_bakumatsu  from './data/questions_bakumatsu.json'
// import q_meiji   from './data/questions_meiji.json'  // ファイル未作成
import q_taisho     from './data/questions_taisho.json'
import q_showa      from './data/questions_showa.json'
import q_heisei     from './data/questions_heisei.json'

// --- 新規: 古文データ ---
import q_tango  from './data/kobun/questions_tango.json'
import q_bunpo  from './data/kobun/questions_bunpo.json'
import q_keigo  from './data/kobun/questions_keigo.json'
import q_dokkai from './data/kobun/questions_dokkai.json'
import q_kusho  from './data/kobun/questions_kusho.json'

// --- 新規: 現代文データ ---
import q_kanji_yomi  from './data/gendaibun/questions_kanji_yomi.json'
import q_kanji_kaki  from './data/gendaibun/questions_kanji_kaki.json'
import q_kanji_goji  from './data/gendaibun/questions_kanji_goji.json'
import q_yojijukugo  from './data/gendaibun/questions_yojijukugo.json'
import q_keyword     from './data/gendaibun/questions_keyword.json'
import q_bungakushi  from './data/gendaibun/questions_bungakushi.json'
import q_setsuzoku   from './data/gendaibun/questions_setsuzoku.json'
import q_hyoron      from './data/gendaibun/questions_hyoron.json'
import q_shosetsu    from './data/gendaibun/questions_shosetsu.json'

const ALL_QUESTIONS = {
  jomon: q_jomon, yayoi: q_yayoi, kofun: q_kofun, asuka: q_asuka,
  nara: q_nara, heian: q_heian, kamakura: q_kamakura, nanbokucho: q_nanbokucho,
  muromachi: q_muromachi, sengoku: q_sengoku, azuchi: q_azuchi,
  edo_early: q_edo_early, edo_mid: q_edo_mid, bakumatsu: q_bakumatsu,
  taisho: q_taisho, showa: q_showa, heisei: q_heisei,
}

const KOBUN_QUESTIONS = {
  tango: q_tango,
  bunpo: q_bunpo,
  keigo: q_keigo,
  dokkai: q_dokkai,
  kusho: q_kusho,
}

const GENDAIBUN_QUESTIONS = {
  kanji_yomi:  q_kanji_yomi,
  kanji_kaki:  q_kanji_kaki,
  kanji_goji:  q_kanji_goji,
  yojijukugo:  q_yojijukugo,
  keyword:     q_keyword,
  bungakushi:  q_bungakushi,
  setsuzoku:   q_setsuzoku,
  hyoron:      q_hyoron,
  shosetsu:    q_shosetsu,
}

// 画面の状態
// 'subject-select' | 'era-select' | 'quiz' | 'result' | 'stats'
// |                  ↑ 日本史フロー（既存）
// |
// 'kobun-select' | 'kobun-quiz' | 'kobun-result'
//   ↑ 古文フロー（新規）

function App() {
  // --- 共通 state ---
  const [screen, setScreen] = useState('subject-select')
  const [subject, setSubject] = useState(null)
  const [theme, setTheme] = useState(() => localStorage.getItem('app-theme') ?? 'normal')

  function handleChangeTheme(t) {
    setTheme(t)
    localStorage.setItem('app-theme', t)
  }

  // --- 日本史 state（既存） ---
  const [selectedEra, setSelectedEra] = useState(null)
  const [sessionQuestions, setSessionQuestions] = useState([])
  const [sessionResults, setSessionResults] = useState([])
  const [progress, setProgress] = useState(() => loadProgress())

  // --- 古文 state ---
  const [kobunCategory, setKobunCategory] = useState(null)
  const [kobunCategoryLabel, setKobunCategoryLabel] = useState(null)
  const [kobunFormat, setKobunFormat] = useState('4択')
  const [kobunQuestions, setKobunQuestions] = useState([])
  const [kobunResults, setKobunResults] = useState([])
  const [kobunProgress, setKobunProgress] = useState(() => loadKobunProgress())

  // --- 現代文 state ---
  const [gendaibunCategory, setGendaibunCategory] = useState(null)
  const [gendaibunCategoryLabel, setGendaibunCategoryLabel] = useState(null)
  const [gendaibunFormat, setGendaibunFormat] = useState('4択')
  const [gendaibunQuestions, setGendaibunQuestions] = useState([])
  const [gendaibunResults, setGendaibunResults] = useState([])
  const [gendaibunProgress, setGendaibunProgress] = useState(() => loadGendaibunProgress())

  function goTo(screenName) {
    setScreen(screenName)
    window.scrollTo(0, 0)
  }

  // --- 教科選択 ---
  function handleSelectSubject(subjectKey) {
    setSubject(subjectKey)
    if (subjectKey === 'history') {
      goTo('era-select')
    } else if (subjectKey === 'kobun') {
      goTo('kobun-select')
    } else if (subjectKey === 'gendaibun') {
      goTo('gendaibun-select')
    }
  }

  // ==========================================
  //  日本史ハンドラー（既存のまま）
  // ==========================================
  function handleSelectEra(eraKey) {
    const questions = ALL_QUESTIONS[eraKey] ?? []
    const session = pickSessionQuestions(questions, progress[eraKey])
    setSelectedEra(eraKey)
    setSessionQuestions(session)
    goTo('quiz')
  }

  function handleAnswer(questionId, isCorrect) {
    const newProgress = updateQuestionRecord(progress, selectedEra, questionId, isCorrect)
    setProgress(newProgress)
    saveProgress(newProgress)
  }

  function handleFinish(results) {
    setSessionResults(results)
    goTo('result')
  }

  function handleRetry() {
    const questions = ALL_QUESTIONS[selectedEra] ?? []
    const session = pickSessionQuestions(questions, progress[selectedEra])
    setSessionQuestions(session)
    setSessionResults([])
    goTo('quiz')
  }

  function handleBack() {
    setSessionResults([])
    goTo('era-select')
  }

  // ==========================================
  //  古文ハンドラー（新規）
  // ==========================================
  function handleSelectKobunCategory(categoryKey, format, categoryLabel) {
    const raw = KOBUN_QUESTIONS[categoryKey] ?? []
    const catProgress = kobunProgress[categoryKey] ?? {}
    setKobunCategory(categoryKey)
    setKobunCategoryLabel(categoryLabel ?? categoryKey)
    setKobunFormat(format)
    if (format === '4択' || format === '空所補充') {
      // 10問：wrong優先 > unseen > correct、正規化してシャッフル
      const normalized = raw.map(q => normalizeKobunQuestion(q, categoryLabel ?? categoryKey))
      const session = pickKobunSessionQuestions(normalized, catProgress, 10)
      setKobunQuestions(session)
    } else if (format === '読解') {
      // 5パッセージ：パッセージ単位でwrong優先 > unseen > correct
      const session = pickKobunDokkaiPassages(raw, catProgress, 5)
      setKobunQuestions(session)
    }
    setKobunResults([])
    goTo('kobun-quiz')
  }

  function handleKobunAnswer(questionId, isCorrect) {
    const newProgress = updateKobunRecord(kobunProgress, kobunCategory, questionId, isCorrect)
    setKobunProgress(newProgress)
    saveKobunProgress(newProgress)
  }

  function handleKobunFinish(results) {
    setKobunResults(results)
    goTo('kobun-result')
  }

  function handleKobunBack() {
    setKobunResults([])
    goTo('kobun-select')
  }

  function handleBackToSubject() {
    goTo('subject-select')
  }

  // ==========================================
  //  現代文ハンドラー
  // ==========================================
  function handleSelectGendaibunCategory(categoryKey, format, categoryLabel) {
    const raw = GENDAIBUN_QUESTIONS[categoryKey] ?? []
    const catProgress = gendaibunProgress[categoryKey] ?? {}
    setGendaibunCategory(categoryKey)
    setGendaibunCategoryLabel(categoryLabel ?? categoryKey)
    setGendaibunFormat(format)
    if (format === '4択' || format === '空所補充') {
      const normalized = raw.map(q => normalizeKobunQuestion(q, categoryLabel ?? categoryKey))
      const session = pickKobunSessionQuestions(normalized, catProgress, 10)
      setGendaibunQuestions(session)
    } else if (format === '読解') {
      const session = pickKobunDokkaiPassages(raw, catProgress, 5)
      setGendaibunQuestions(session)
    }
    setGendaibunResults([])
    goTo('gendaibun-quiz')
  }

  function handleGendaibunAnswer(questionId, isCorrect) {
    const newProgress = updateGendaibunRecord(gendaibunProgress, gendaibunCategory, questionId, isCorrect)
    setGendaibunProgress(newProgress)
    saveGendaibunProgress(newProgress)
  }

  function handleGendaibunFinish(results) {
    setGendaibunResults(results)
    goTo('gendaibun-result')
  }

  function handleGendaibunBack() {
    setGendaibunResults([])
    goTo('gendaibun-select')
  }

  // ==========================================
  //  描画
  // ==========================================
  return (
    <div className="app" data-theme={theme}>
      {/* === 教科選択（新規） === */}
      {screen === 'subject-select' && (
        <SubjectSelect
          onSelectSubject={handleSelectSubject}
          theme={theme}
          onChangeTheme={handleChangeTheme}
        />
      )}

      {/* === 日本史フロー（既存） === */}
      {screen === 'era-select' && (
        <EraSelect
          allQuestions={ALL_QUESTIONS}
          progress={progress}
          onSelectEra={handleSelectEra}
          onShowStats={() => goTo('stats')}
          onBack={handleBackToSubject}  // ← 追加: 教科選択に戻る
        />
      )}

      {screen === 'stats' && (
        <Stats
          allQuestions={ALL_QUESTIONS}
          progress={progress}
          onBack={() => goTo('era-select')}
        />
      )}

      {screen === 'quiz' && (
        <QuizSession
          eraKey={selectedEra}
          sessionQuestions={sessionQuestions}
          onAnswer={handleAnswer}
          onFinish={handleFinish}
          onBack={handleBack}
        />
      )}

      {screen === 'result' && (
        <SessionResult
          eraKey={selectedEra}
          results={sessionResults}
          onRetry={handleRetry}
          onBack={handleBack}
          retryLabel="もう一度この時代に挑戦"
          backLabel="時代選択に戻る"
        />
      )}

      {/* === 古文フロー（新規） === */}
      {screen === 'kobun-select' && (
        <KobunCategorySelect
          allQuestions={KOBUN_QUESTIONS}
          progress={kobunProgress}
          onSelectCategory={handleSelectKobunCategory}
          onBack={handleBackToSubject}
          onShowStats={() => goTo('kobun-stats')}
        />
      )}

      {screen === 'kobun-stats' && (
        <KobunStats
          allQuestions={KOBUN_QUESTIONS}
          progress={kobunProgress}
          onBack={() => goTo('kobun-select')}
        />
      )}

      {screen === 'kobun-quiz' && kobunFormat === '4択' && (
        <QuizSession
          eraKey={kobunCategoryLabel}
          sessionQuestions={kobunQuestions}
          onAnswer={handleKobunAnswer}
          onFinish={handleKobunFinish}
          onBack={handleKobunBack}
        />
      )}

      {screen === 'kobun-quiz' && kobunFormat === '読解' && (
        <KobunQuizDokkai
          eraKey={kobunCategory}
          sessionQuestions={kobunQuestions}
          onAnswer={handleKobunAnswer}
          onFinish={handleKobunFinish}
          onBack={handleKobunBack}
        />
      )}

      {screen === 'kobun-quiz' && kobunFormat === '空所補充' && (
        <KobunQuizKusho
          eraKey={kobunCategory}
          sessionQuestions={kobunQuestions}
          onAnswer={handleKobunAnswer}
          onFinish={handleKobunFinish}
          onBack={handleKobunBack}
        />
      )}

      {screen === 'kobun-result' && (
        <SessionResult
          eraKey={kobunCategory}
          results={kobunResults}
          onRetry={() => handleSelectKobunCategory(kobunCategory, kobunFormat)}
          onBack={handleKobunBack}
        />
      )}

      {/* === 現代文フロー === */}
      {screen === 'gendaibun-select' && (
        <GendaibunCategorySelect
          allQuestions={GENDAIBUN_QUESTIONS}
          progress={gendaibunProgress}
          onSelectCategory={handleSelectGendaibunCategory}
          onBack={handleBackToSubject}
          onShowStats={() => goTo('gendaibun-stats')}
        />
      )}

      {screen === 'gendaibun-stats' && (
        <GendaibunStats
          allQuestions={GENDAIBUN_QUESTIONS}
          progress={gendaibunProgress}
          onBack={() => goTo('gendaibun-select')}
        />
      )}

      {screen === 'gendaibun-quiz' && gendaibunFormat === '4択' && (
        <QuizSession
          eraKey={gendaibunCategoryLabel}
          sessionQuestions={gendaibunQuestions}
          onAnswer={handleGendaibunAnswer}
          onFinish={handleGendaibunFinish}
          onBack={handleGendaibunBack}
        />
      )}

      {screen === 'gendaibun-quiz' && gendaibunFormat === '空所補充' && (
        <KobunQuizKusho
          eraKey={gendaibunCategory}
          sessionQuestions={gendaibunQuestions}
          onAnswer={handleGendaibunAnswer}
          onFinish={handleGendaibunFinish}
          onBack={handleGendaibunBack}
        />
      )}

      {screen === 'gendaibun-quiz' && gendaibunFormat === '読解' && (
        <KobunQuizDokkai
          eraKey={gendaibunCategory}
          sessionQuestions={gendaibunQuestions}
          onAnswer={handleGendaibunAnswer}
          onFinish={handleGendaibunFinish}
          onBack={handleGendaibunBack}
        />
      )}

      {screen === 'gendaibun-result' && (
        <SessionResult
          eraKey={gendaibunCategory}
          results={gendaibunResults}
          onRetry={() => handleSelectGendaibunCategory(gendaibunCategory, gendaibunFormat)}
          onBack={handleGendaibunBack}
        />
      )}
    </div>
  )
}

export default App
