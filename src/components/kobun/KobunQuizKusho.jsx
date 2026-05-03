import { useState, useMemo } from 'react'
import { shuffle } from '../../utils/quiz'

// 選択肢をシャッフルして正解インデックスを記録
function buildKushoForDisplay(q) {
  const indexed = q.choices.map((text, i) => ({ text, originalIndex: i }))
  const shuffled = shuffle(indexed)
  return {
    ...q,
    displayChoices: shuffled.map(c => c.text),
    correctDisplayIndex: shuffled.findIndex(c => c.originalIndex === q.answer),
  }
}

function KobunQuizKusho({ eraKey, sessionQuestions, onAnswer, onFinish, onBack }) {
  const [idx, setIdx] = useState(0)
  const [answered, setAnswered] = useState(null)
  const [results, setResults] = useState([])

  // マウント時に全問の選択肢をシャッフル（一度だけ）
  const shuffledQuestions = useMemo(() => {
    return sessionQuestions.map(q => buildKushoForDisplay(q))
  }, [sessionQuestions])

  const q = shuffledQuestions[idx]
  if (!q) return null

  function handleChoice(choiceIdx) {
    if (answered !== null) return
    const isCorrect = choiceIdx === q.correctDisplayIndex
    setAnswered(choiceIdx)
    onAnswer(q.id, isCorrect)
    setResults((r) => [...r, { id: q.id, correct: isCorrect }])
  }

  function next() {
    if (idx < shuffledQuestions.length - 1) {
      setIdx((i) => i + 1)
      setAnswered(null)
    } else {
      onFinish([...results])
    }
  }

  const progress = ((idx + (answered !== null ? 1 : 0)) / shuffledQuestions.length) * 100

  // 空欄を分割して表示
  const parts = q.sentence.split('（　　）')

  return (
    <div className="quiz-session">
      <div className="quiz-header">
        <button className="back-btn" onClick={onBack}>← 戻る</button>
        <span className="quiz-progress-text">{idx + 1} / {shuffledQuestions.length}</span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="sentence-box">
        {parts.map((part, i) => (
          <span key={i}>
            {part}
            {i < parts.length - 1 && (
              <span className={`blank-mark ${answered !== null ? 'filled' : ''}`}>
                {answered !== null ? q.displayChoices[q.correctDisplayIndex] : '？'}
              </span>
            )}
          </span>
        ))}
      </div>
      {q.hint && <p className="hint-text">💡 {q.hint}</p>}

      <div className="choices">
        {q.displayChoices.map((c, i) => {
          let state = ''
          if (answered !== null) {
            if (i === q.correctDisplayIndex) state = 'correct'
            else if (i === answered) state = 'wrong'
          }
          return (
            <button
              key={i}
              className={`choice-btn ${state}`}
              onClick={() => handleChoice(i)}
              disabled={answered !== null}
            >
              {String.fromCharCode(65 + i)}. {c}
            </button>
          )
        })}
      </div>

      {answered !== null && (
        <>
          <div className="explanation-box">{q.explanation}</div>
          <button className="next-btn" onClick={next}>
            {idx < shuffledQuestions.length - 1 ? '次の問題 →' : '結果を見る'}
          </button>
        </>
      )}
    </div>
  )
}

export default KobunQuizKusho
