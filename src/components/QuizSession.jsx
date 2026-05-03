import { useState } from 'react'
import './QuizSession.css'
import QuestionCard from './QuestionCard'
import { buildQuestionForDisplay } from '../utils/quiz'
import { getEraLabel } from '../utils/eras'

function QuizSession({ eraKey, sessionQuestions, onAnswer, onFinish, onBack }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [results, setResults] = useState([])

  const total = sessionQuestions.length
  const current = sessionQuestions[currentIndex]
  const displayQuestion = buildQuestionForDisplay(current)

  function handleAnswer(isCorrect) {
    const newResults = [...results, { question: current, isCorrect }]
    setResults(newResults)
    onAnswer(current.id, isCorrect)
    return newResults // QuestionCard の onNext に渡すため返す
  }

  function handleNext(newResults) {
    if (currentIndex + 1 >= total) {
      onFinish(newResults)
    } else {
      setCurrentIndex(i => i + 1)
      window.scrollTo(0, 0)
    }
  }

  const progressPct = Math.round((currentIndex / total) * 100)

  return (
    <div className="quiz-session">
      {/* ヘッダー */}
      <div className="quiz-session__header">
        <button className="quiz-session__back" onClick={onBack} aria-label="戻る">
          ←
        </button>
        <div className="quiz-session__info">
          <div className="quiz-session__era">{getEraLabel(eraKey)}</div>
          <div className="quiz-session__progress-text">
            {currentIndex + 1} / {total} 問
          </div>
        </div>
      </div>

      {/* 進捗バー */}
      <div className="quiz-session__bar">
        <div className="quiz-session__bar-fill" style={{ width: `${progressPct}%` }} />
      </div>

      {/* 問題カード */}
      <QuestionCard
        key={current.id}
        question={displayQuestion}
        onAnswer={handleAnswer}
        onNext={handleNext}
        isLast={currentIndex + 1 >= total}
      />
    </div>
  )
}

export default QuizSession
