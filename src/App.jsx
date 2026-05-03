import { useState } from 'react'
import './App.css'
import EraSelect from './components/EraSelect'
import QuizSession from './components/QuizSession'
import SessionResult from './components/SessionResult'
import { ERAS } from './utils/eras'
import { loadProgress, saveProgress, updateQuestionRecord } from './utils/progress'
import { pickSessionQuestions } from './utils/quiz'

// 全時代の問題をまとめてimport
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
import q_edo        from './data/questions_edo.json'
import q_meiji      from './data/questions_meiji.json'
import q_taisho     from './data/questions_taisho.json'
import q_showa      from './data/questions_showa.json'
import q_heisei     from './data/questions_heisei.json'

const ALL_QUESTIONS = {
  jomon: q_jomon,
  yayoi: q_yayoi,
  kofun: q_kofun,
  asuka: q_asuka,
  nara: q_nara,
  heian: q_heian,
  kamakura: q_kamakura,
  nanbokucho: q_nanbokucho,
  muromachi: q_muromachi,
  sengoku: q_sengoku,
  azuchi: q_azuchi,
  edo: q_edo,
  meiji: q_meiji,
  taisho: q_taisho,
  showa: q_showa,
  heisei: q_heisei,
}

// 画面の状態
// 'era-select' | 'quiz' | 'result'

function App() {
  const [screen, setScreen] = useState('era-select')
  const [selectedEra, setSelectedEra] = useState(null)
  const [sessionQuestions, setSessionQuestions] = useState([])
  const [sessionResults, setSessionResults] = useState([])
  const [progress, setProgress] = useState(() => loadProgress())

  function goTo(screenName) {
    setScreen(screenName)
    window.scrollTo(0, 0)
  }

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

  return (
    <div className="app">
      {screen === 'era-select' && (
        <EraSelect
          allQuestions={ALL_QUESTIONS}
          progress={progress}
          onSelectEra={handleSelectEra}
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
    </div>
  )
}

export default App
