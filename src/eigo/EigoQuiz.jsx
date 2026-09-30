import { useState } from 'react'
import { buildDisplay } from './eigoEngine'
import SenseMap, { MarkedSentence } from './SenseMap'

function choiceClass(i, selected, correct) {
  if (selected === null) return 'choice-btn'
  if (i === correct) return selected === i ? 'choice-btn correct' : 'choice-btn reveal-correct'
  if (i === selected) return 'choice-btn incorrect'
  return 'choice-btn'
}

export default function EigoQuiz({ session, progress, onAnswer, onFinish, onBack }) {
  const [index, setIndex] = useState(0)
  const [results, setResults] = useState([])
  const [selected, setSelected] = useState(null)
  // 選択肢・例文はセッション開始時に1回だけ確定
  const [display] = useState(() => session.map(buildDisplay))

  const q = display[index]
  const total = display.length
  const answered = selected !== null
  const isCorrect = selected === q.correctIndex
  const isLast = index + 1 >= total

  function choose(i) {
    if (answered) return
    setSelected(i)
    const ok = i === q.correctIndex
    setResults(r => [...r, { q, isCorrect: ok }])
    onAnswer(session[index], ok)
  }

  function next() {
    if (isLast) {
      onFinish(results)
      return
    }
    setIndex(i => i + 1)
    setSelected(null)
    window.scrollTo(0, 0)
  }

  const highlightIds = q.type === 'context' ? [q.senseId] : q.items.map(x => x.sense.id)

  return (
    <div className="quiz-session eigo">
      <div className="quiz-session__header">
        <button className="quiz-session__back" onClick={onBack} aria-label="戻る">←</button>
        <div className="quiz-session__info">
          <div className="quiz-session__era">
            {q.type === 'context' ? '文脈で語義選択' : '共通語補充'}
          </div>
          <div className="quiz-session__progress-text">{index + 1} / {total} 問</div>
        </div>
      </div>
      <div className="quiz-session__bar">
        <div className="quiz-session__bar-fill" style={{ width: `${Math.round((index / total) * 100)}%` }} />
      </div>

      <div className="question-card">
        {q.type === 'context' ? (
          <>
            <p className="eigo-instruction">下線部の意味として最も適切なものを選べ。</p>
            <p className="eigo-sentence" lang="en"><MarkedSentence en={q.ex.en} /></p>
          </>
        ) : (
          <>
            <p className="eigo-instruction">3つの英文の空所に共通して入る語を選べ。</p>
            <ol className="eigo-common-list" lang="en">
              {q.items.map((x, i) => (
                <li key={i} className="eigo-sentence">
                  <MarkedSentence en={x.ex.en} blank={!answered} />
                  {answered && <div className="eigo-common-ja">→ {x.sense.ja}：{x.ex.ja}</div>}
                </li>
              ))}
            </ol>
          </>
        )}

        <ul className="choices-list">
          {q.choices.map((c, i) => (
            <li key={i}>
              <button
                className={choiceClass(i, selected, q.correctIndex)}
                onClick={() => choose(i)}
                disabled={answered}
                lang={q.type === 'common' ? 'en' : undefined}
              >
                {c}
              </button>
            </li>
          ))}
        </ul>

        {answered && (
          <>
            <div className={`result-area ${isCorrect ? 'correct-result' : 'incorrect-result'}`}>
              <p className="result-label">{isCorrect ? '✓ 正解！' : '✗ 不正解'}</p>
              {q.type === 'context' && (
                <p className="explanation">訳：{q.ex.ja}</p>
              )}
              {q.type === 'common' && !isCorrect && (
                <p className="explanation">正解：<strong>{q.word.word}</strong></p>
              )}
            </div>
            <SenseMap word={q.word} progress={progress} highlightIds={highlightIds} />
            <button className="next-btn" onClick={next}>
              {isLast ? '結果を見る →' : '次の問題へ →'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
