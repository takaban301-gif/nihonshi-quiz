import { useState } from 'react'
import { KOBUN_CATEGORIES } from '../../utils/subjects'

function KobunStats({ allQuestions, progress, onBack }) {
  const [tab, setTab] = useState('category') // 'category' | 'weak'

  // カテゴリ別集計
  const catRows = KOBUN_CATEGORIES.map(cat => {
    const questions = allQuestions[cat.key] ?? []
    const catProg = progress?.[cat.key] ?? {}
    let correct = 0, wrong = 0, unseen = 0
    questions.forEach(q => {
      const rec = catProg[q.id]
      if (!rec) { unseen++; return }
      correct += rec.correct ?? 0
      wrong += rec.wrong ?? 0
    })
    const total = questions.length
    const answered = total - unseen
    const correctRate = answered > 0 ? Math.round((correct / (correct + wrong)) * 100) : null
    return { ...cat, total, answered, unseen, correct, wrong, correctRate }
  })

  // 弱点問題（wrongCount > 0 の問題を wrongCount 降順）
  const weakList = []
  KOBUN_CATEGORIES.forEach(cat => {
    const questions = allQuestions[cat.key] ?? []
    const catProg = progress?.[cat.key] ?? {}
    questions.forEach(q => {
      const rec = catProg[q.id]
      if (rec && (rec.wrong ?? 0) > 0) {
        weakList.push({ ...q, catLabel: cat.label, wrongCount: rec.wrong ?? 0 })
      }
    })
  })
  weakList.sort((a, b) => b.wrongCount - a.wrongCount)

  function getRateClass(rate) {
    if (rate === null) return 'unseen'
    if (rate >= 80) return 'strong'
    if (rate >= 50) return 'mid'
    return 'weak'
  }

  return (
    <div className="stats">
      <div className="stats__header">
        <button className="stats__back" onClick={onBack} aria-label="戻る">←</button>
        <span className="stats__title">📊 古文サマリ</span>
      </div>

      <div className="stats__tabs">
        <button className={`stats__tab ${tab === 'category' ? 'active' : ''}`} onClick={() => setTab('category')}>
          カテゴリ別
        </button>
        <button className={`stats__tab ${tab === 'weak' ? 'active' : ''}`} onClick={() => setTab('weak')}>
          弱点問題 {weakList.length > 0 && `(${weakList.length})`}
        </button>
      </div>

      {/* カテゴリ別 */}
      {tab === 'category' && (
        <div className="stats-cat-list">
          {catRows.map(row => {
            const cls = getRateClass(row.correctRate)
            return (
              <div key={row.key} className={`stats-cat-card ${cls}`}>
                <div className="stats-cat-card__header">
                  <span className="stats-cat-card__name">{row.label}</span>
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
                  正解 {row.correct} / 不正解 {row.wrong} / 未回答 {row.unseen}（計 {row.total}問）
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 弱点問題 */}
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
                  <span className="stats-weak-card__era">{q.catLabel}</span>
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

export default KobunStats
