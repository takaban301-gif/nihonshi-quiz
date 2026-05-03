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
import './kobun-additions.css'  // ← 追加

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

// --- 既存: 日本史ユーティリティ ---
import { ERAS } from './utils/eras'
import { loadProgress, saveProgress, updateQuestionRecord } from './utils/progress'
import { pickSessionQuestions } from './utils/quiz'

// --- 新規: 古文ユーティリティ ---
import { loadKobunProgress, saveKobunProgress, updateKobunRecord } from './utils/kobunProgress'

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
import q_meiji      from './data/questions_meiji.json'
import q_taisho     from './data/questions_taisho.json'
import q_showa      from './data/questions_showa.json'
import q_heisei     from './data/questions_heisei.json'

// --- 新規: 古文データ ---
import q_tango  from './data/kobun/questions_tango.json'
import q_bunpo  from './data/kobun/questions_bunpo.json'
import q_keigo  from './data/kobun/questions_keigo.json'
import q_dokkai from './data/kobun/questions_dokkai.json'
import q_kusho  from './data/kobun/questions_kusho.json'

const ALL_QUESTIONS = {
  jomon: q_jomon, yayoi: q_yayoi, kofun: q_kofun, asuka: q_asuka,
  nara: q_nara, heian: q_heian, kamakura: q_kamakura, nanbokucho: q_nanbokucho,
  muromachi: q_muromachi, sengoku: q_sengoku, azuchi: q_azuchi,
  edo_early: q_edo_early, edo_mid: q_edo_mid, bakumatsu: q_bakumatsu,
  meiji: q_meiji, taisho: q_taisho, showa: q_showa, heisei: q_heisei,
}

const KOBUN_QUESTIONS = {
  tango: q_tango,
  bunpo: q_bunpo,
  keigo: q_keigo,
  dokkai: q_dokkai,
  kusho: q_kusho,
}

// 画面の状態
// 'subject-select' | 'era-select' | 'quiz' | 'result' | 'stats'
// |                  ↑ 日本史フロー（既存）
// |
// 'kobun-select' | 'kobun-quiz' | 'kobun-result'
//   ↑ 古文フロー（新規）

function App() {
  // --- 共通 state ---
  const [screen, setScreen] = useState('subject-select')  // ← 変更: 初期画面
  const [subject, setSubject] = useState(null)             // ← 追加: 'history' | 'kobun'

  // --- 日本史 state（既存） ---
  const [selectedEra, setSelectedEra] = useState(null)
  const [sessionQuestions, setSessionQuestions] = useState([])
  const [sessionResults, setSessionResults] = useState([])
  const [progress, setProgress] = useState(() => loadProgress())

  // --- 古文 state（新規） ---
  const [kobunCategory, setKobunCategory] = useState(null)
  const [kobunFormat, setKobunFormat] = useState('4択')
  const [kobunQuestions, setKobunQuestions] = useState([])
  const [kobunResults, setKobunResults] = useState([])
  const [kobunProgress, setKobunProgress] = useState(() => loadKobunProgress())

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
  function handleSelectKobunCategory(categoryKey, format) {
    const questions = KOBUN_QUESTIONS[categoryKey] ?? []
    setKobunCategory(categoryKey)
    setKobunFormat(format)
    // 読解・空所補充はそのまま、4択は pickSessionQuestions 的にシャッフル
    if (format === '4択') {
      const shuffled = [...questions].sort(() => Math.random() - 0.5)
      setKobunQuestions(shuffled)
    } else {
      setKobunQuestions(questions)
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
  //  描画
  // ==========================================
  return (
    <div className="app">
      {/* === 教科選択（新規） === */}
      {screen === 'subject-select' && (
        <SubjectSelect onSelectSubject={handleSelectSubject} />
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
        />
      )}

      {/* === 古文フロー（新規） === */}
      {screen === 'kobun-select' && (
        <KobunCategorySelect
          allQuestions={KOBUN_QUESTIONS}
          progress={kobunProgress}
          onSelectCategory={handleSelectKobunCategory}
          onBack={handleBackToSubject}
        />
      )}

      {screen === 'kobun-quiz' && kobunFormat === '4択' && (
        <KobunQuizYontaku
          eraKey={kobunCategory}
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
    </div>
  )
}

export default App
