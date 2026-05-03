import { useState } from 'react'
import './QuestionCard.css'

function QuestionCard({ question, onNext }) {
  const [selectedIndex, setSelectedIndex] = useState(null)

  const hasAnswered = selectedIndex !== null
  const isCorrect = selectedIndex === question.answerIndex

  function handleChoiceClick(index) {
    if (hasAnswered) return
    setSelectedIndex(index)
  }

  function handleNext() {
    setSelectedIndex(null)
    onNext()
  }

  function getChoiceBtnClass(index) {
    if (!hasAnswered) return 'choice-btn'
    if (index === question.answerIndex) {
      return selectedIndex === index ? 'choice-btn correct' : 'choice-btn reveal-correct'
    }
    if (index === selectedIndex) return 'choice-btn incorrect'
    return 'choice-btn'
  }

  const difficultyLabel = '★'.repeat(question.difficulty) + '☆'.repeat(5 - question.difficulty)

  return (
    <div className="question-card">
      {/* メタ情報バッジ */}
      <div className="question-meta">
        <span className="badge">{question.era}</span>
        <span className="badge">{question.category}</span>
        <span className="badge badge-difficulty">{difficultyLabel}</span>
      </div>

      {/* 問題文 */}
      <p className="question-text">{question.question}</p>

      {/* 選択肢 */}
      <ul className="choices-list">
        {question.choices.map((choice, index) => (
          <li key={index}>
            <button
              className={getChoiceBtnClass(index)}
              onClick={() => handleChoiceClick(index)}
              disabled={hasAnswered}
            >
              {choice}
            </button>
          </li>
        ))}
      </ul>

      {/* 結果表示 */}
      {hasAnswered && (
        <div className={`result-area ${isCorrect ? 'correct-result' : 'incorrect-result'}`}>
          <p className="result-label">
            {isCorrect ? '✓ 正解！' : '✗ 不正解'}
          </p>
          {!isCorrect && (
            <p style={{ fontSize: '14px', marginBottom: '8px', color: '#555' }}>
              正解：<strong>{question.choices[question.answerIndex]}</strong>
            </p>
          )}
          <p className="explanation">{question.explanation}</p>
        </div>
      )}

      {/* 次の問題へ */}
      {hasAnswered && (
        <button className="next-btn" onClick={handleNext}>
          次の問題へ →
        </button>
      )}
    </div>
  )
}

export default QuestionCard
