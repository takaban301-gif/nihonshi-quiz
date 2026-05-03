import { useState } from 'react'
import './Stats.css'
import { ERAS, getEraLabel } from '../utils/eras'
import { calcEraStats, calcCategoryStats, getWeakQuestions } from '../utils/progress'

function Stats({ allQuestions, progress, onBack }) {
  const [tab, setTab] = useState('era') // 'era' | 'category' | 'weak'

  // --- 時代別データ ---
  const eraRows = ERAS.map(era => {
    const questions = allQuestions[era.key] ?? []
    const stats = calcEraStats(progress, era.key, questions)
    const pct = stats.total > 0 ? Math.round((stats.mastered / stats.total) * 100) : null
    return { ...era, ...stats, pct }
  })

  // --- カテゴリ別データ ---
  const catRows = calcCategoryStats(progress, allQuestions)

  // --- 弱点問題 ---
  const weakList = getWeakQuestions(progress, allQuestions, 30)

  function getCatClass(rate) {
    if (rate === null) return 'unseen'
    if (rate >= 80) return 'strong'
    if (rate >= 50) return 'mid'
    return 'weak'
  }

  function getEraClass(pct) {
    if (pct === null) return ''
    if (pct === 100) return 'complete'
    if (pct < 40) return 'weak'
    return ''
  }

  return (
    <div className="stats">
      {/* ヘッダー */}
      <div className="stats__header">
        <button className="stats__back" onClick={onBack} aria-label="戻る">←</button>
        <span className="stats__title">📊 サマリ</span>
      </div>

      {/* タブ */}
      <div className="stats__tabs">
        <button className={`stats__tab ${tab === 'era' ? 'active' : ''}`} onClick={() => setTab('era')}>
          時代別
        </button>
        <button className={`stats__tab ${tab === 'category' ? 'active' : ''}`} onClick={() => setTab('category')}>
          カテゴリ別
        </button>
        <button className={`stats__tab ${tab === 'weak' ? 'active' : ''}`} onClick={() => setTab('weak')}>
          弱点問題 {weakList.length > 0 && `(${weakList.length})`}
        </button>
      </div>

      {/* ===== 時代別 ===== */}
      {tab === 'era' && (
        <div className="stats-era-list">
          {eraRows.map(era => {
            const cls = getEraClass(era.pct)
            return (
              <div key={era.key} className="stats-era-card">
                <div className="stats-era-card__header">
                  <span className="stats-era-card__name">{era.label}</span>
                  <span className={`stats-era-card__pct ${cls}`}>
                    {era.pct !== null ? `${era.pct}%` : '未挑戦'}
                  </span>
                </div>
                <div className="stats-era-card__bar">
                  <div
                    className={`stats-era-card__bar-fill ${cls}`}
                    style={{ width: `${era.pct ?? 0}%` }}
                  />
                </div>
                <div className="stats-era-card__detail">
                  <span className="tag-mastered">✓ 習得 {era.mastered}</span>
                  <span className="tag-review">△ 要復習 {era.review}</span>
                  <span className="tag-unseen">○ 未回答 {era.unseen}</span>
                  <span>計 {era.total}問</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ===== カテゴリ別 ===== */}
      {tab === 'category' && (
        <div className="stats-cat-list">
          {catRows.map(row => {
            const cls = getCatClass(row.correctRate)
            return (
              <div key={row.category} className={`stats-cat-card ${cls}`}>
                <div className="stats-cat-card__header">
                  <span className="stats-cat-card__name">{row.category}</span>
                  <span className="stats-cat-card__rate">
                    {row.correctRate !== null ? `正答率 ${row.correctRate}%` : '未挑戦'}
                  </span>
                </div>
                <div className="stats-cat-card__bar">
                  <div
                    className="stats-cat-card__bar-fill"
                    style={{ width: `${row.correctRate ?? 0}%` }}
                  />
                </div>
                <div className="stats-cat-card__detail">
                  習得 {row.mastered} / 要復習 {row.review} / 未回答 {row.unseen}（計 {row.total}問）
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ===== 弱点問題 ===== */}
      {tab === 'weak' && (
        weakList.length === 0 ? (
          <div className="stats-weak-empty">
            <p>🎉 間違えた問題はありません！</p>
          </div>
        ) : (
          <div className="stats-weak-list">
            {weakList.map(q => (
              <div key={q.id} className="stats-weak-card">
                <div className="stats-weak-card__meta">
                  <span className="stats-weak-card__era">{getEraLabel(q.eraKey)}</span>
                  <span className="stats-weak-card__cat">{q.category}</span>
                  <span className="stats-weak-card__wrong">✗ {q.wrongCount}回不正解</span>
                </div>
                <div className="stats-weak-card__question">{q.question}</div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}

export default Stats
