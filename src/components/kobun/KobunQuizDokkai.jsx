import { useState, useMemo } from 'react'
import { shuffle } from '../../utils/quiz'

// パッセージ内の各設問の選択肢をシャッフルして正解インデックスを記録
function buildSubForDisplay(sub) {
  const indexed = sub.choices.map((text, i) => ({ text, originalIndex: i }))
  const shuffled = shuffle(indexed)
  return {
    ...sub,
    displayChoices: shuffled.map(c => c.text),
    correctDisplayIndex: shuffled.findIndex(c => c.originalIndex === sub.answer),
  }
}

function KobunQuizDokkai({ eraKey, sessionQuestions, onAnswer, onFinish, onBack }) {
  const [qIdx, setQIdx] = useState(0)
  const [subIdx, setSubIdx] = useState(0)
  const [answered, setAnswered] = useState(null)
  const [results, setResults] = useState([])

  // マウント時に全設問の選択肢をシャッフル（一度だけ）
  const shuffledPassages = useMemo(() => {
    return sessionQuestions.map(p => ({
      ...p,
      questions: p.questions.map(sub => buildSubForDisplay(sub)),
    }))
  }, [sessionQuestions])

  const passage = shuffledPassages[qIdx]
  if (!passage) return null
  const sub = passage.questions[subIdx]

  function handleChoice(choiceIdx) {
    if (answered !== null) return
    const isCorrect = choiceIdx === sub.correctDisplayIndex
    setAnswered(choiceIdx)
    onAnswer(sub.subId, isCorrect)
    setResults((r) => [...r, { id: sub.subId, correct: isCorrect }])
  }

  function next() {
    if (subIdx < passage.questions.length - 1) {
      setSubIdx((i) => i + 1)
      setAnswered(null)
    } else if (qIdx < shuffledPassages.length - 1) {
      setQIdx((i) => i + 1)
      setSubIdx(0)
      setAnswered(null)
    } else {
      onFinish([...results])
    }
  }

  const totalSubs = shuffledPassages.reduce((s, p) => s + p.questions.length, 0)
  let doneSubs = 0
  for (let i = 0; i < qIdx; i++) doneSubs += shuffledPassages[i].questions.length
  doneSubs += subIdx + (answered !== null ? 1 : 0)
  const progress = (doneSubs / totalSubs) * 100

  const isLastSub = subIdx === passage.questions.length - 1
  const isLastPassage = qIdx === shuffledPassages.length - 1

  return (
    <div className="quiz-session">
      <div className="quiz-header">
        <button className="back-btn" onClick={onBack}>← 戻る</button>
        <span className="quiz-progress-text">
          大問 {qIdx + 1}/{shuffledPassages.length}　設問 {subIdx + 1}/{passage.questions.length}
        </span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="passage-box">
        <p className="passage-text">{passage.passage}</p>
        <span className="passage-source">{passage.passageSource}</span>
      </div>

      <p className="question-text">{sub.question}</p>
      <div className="choices">
        {sub.displayChoices.map((c, i) => {
          let state = ''
          if (answered !== null) {
            if (i === sub.correctDisplayIndex) state = 'correct'
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
          {isLastSub && (
            <div className="explanation-box">{passage.explanation}</div>
          )}
          <button className="next-btn" onClick={next}>
            {!isLastSub
              ? '次の設問 →'
              : !isLastPassage
                ? '次の大問 →'
                : '結果を見る'}
          </button>
        </>
      )}
    </div>
  )
}

export default KobunQuizDokkai
