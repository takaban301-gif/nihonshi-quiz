import './EraSelect.css'
import { ERAS } from '../utils/eras'
import { calcEraStats } from '../utils/progress'

function EraSelect({ allQuestions, progress, onSelectEra, onShowStats, onBack }) {
  // 全体の合計を計算
  const totalAll = Object.values(allQuestions).reduce((s, qs) => s + qs.length, 0)
  const masteredAll = ERAS.reduce((s, era) => {
    const stats = calcEraStats(progress, era.key, allQuestions[era.key] ?? [])
    return s + stats.mastered
  }, 0)
  const totalPct = totalAll > 0 ? Math.round((masteredAll / totalAll) * 100) : 0

  return (
    <div className="era-select">
      <div className="era-select__top-row">
        {onBack && (
          <button className="era-select__back-btn" onClick={onBack}>← 教科選択</button>
        )}
        <h1 className="era-select__title">日本史問題演習</h1>
        <button className="era-select__stats-btn" onClick={onShowStats}>📊 サマリ</button>
      </div>
      <p className="era-select__subtitle">時代を選んで10問に挑戦しよう</p>

      {/* 全体進捗 */}
      <div className="era-select__total">
        <div className="era-select__total-label">全体の達成率</div>
        <div className="progress-bar">
          <div className="progress-bar__fill" style={{ width: `${totalPct}%` }} />
        </div>
        <div className="era-select__total-count">
          {masteredAll} / {totalAll} 問習得済み（{totalPct}%）
        </div>
      </div>

      {/* 時代一覧 */}
      <div className="era-list">
        {ERAS.map(era => {
          const questions = allQuestions[era.key] ?? []
          const stats = calcEraStats(progress, era.key, questions)
          const pct = stats.total > 0 ? Math.round((stats.mastered / stats.total) * 100) : 0
          const isComplete = pct === 100 && stats.total > 0

          return (
            <button
              key={era.key}
              className="era-card"
              onClick={() => onSelectEra(era.key)}
            >
              <div className="era-card__header">
                <span className="era-card__name">
                  {isComplete ? '✅ ' : ''}{era.label}
                </span>
                <span className={`era-card__pct ${isComplete ? 'complete' : ''}`}>
                  {pct}%
                </span>
              </div>
              <div className="era-card__bar">
                <div
                  className={`era-card__bar-fill ${isComplete ? 'complete' : ''}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="era-card__detail">
                <span>習得 {stats.mastered}/{stats.total}</span>
                {stats.review > 0 && (
                  <span className="review">要復習 {stats.review}</span>
                )}
                <span>未回答 {stats.unseen}</span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default EraSelect
