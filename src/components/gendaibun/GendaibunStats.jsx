import { useState } from 'react'
import { GENDAIBUN_CATEGORIES } from '../../utils/subjects'

function GendaibunStats({ allQuestions, progress, onBack }) {
  const [tab, setTab] = useState('category') // 'category' | 'weak'

  // カテゴリ別集計
  const catRows = GENDAIBUN_CATEGORIES.map(cat => {
    const questions = allQuestions[cat.key] ?? []
    const catProg = progress?.[cat.key] ?? {}
    let correct = 0, wrong = 0, unseen = 0
    questions.forEach(q => {
      // 読解はsubIdで記録されるため、パッセージ内設問を走査
      if (cat.defaultFormat === '読解') {
        if (!q.questions) { unseen++; return }
        q.questions.forEach(sub => {
          const rec = catProg[sub.subId]
          if (!rec) { unseen++; return }
          correct += rec.correct ?? 0
          wrong   += rec.wrong   ?? 0
        })
      } else {
        const rec = catProg[q.id]
        if (!rec) { unseen++; return }
        correct += rec.correct ?? 0
        wrong   += rec.wrong   ?? 0
      }
    })
    const total = cat.defaultFormat === '読解'
      ? questions.reduce((s, p) => s + (p.questions?.length ?? 0), 0)
      : questions.length
    const answered = total - unseen
    const correctRate = answered > 0 ? Math.round((correct / (correct + wrong)) * 100) : null
    return { ...cat, total, answered, unseen, correct, wrong, correctRate }
  })

  // 弱点問題
  const weakList = []
  GENDAIBUN_CATEGORIES.forEach(cat => {
    const questions = allQuestions[cat.key] ?? []
    const catProg = progress?.[cat.key] ?? {}
    if (cat.defaultFormat === '読解') {
      questions.forEach(p => {
        (p.questions ?? []).forEach(sub => {
          const rec = catProg[sub.subId]
          if (rec && (rec.wrong ?? 0) > 0) {
            weakList.push({ id: sub.subId, question: sub.question, catLabel: cat.label, wrongCount: rec.wrong ?? 0 })
          }
        })
      })
    } else {
      questions.forEach(q => {
        const rec = catProg[q.id]
        if (rec && (rec.wrong ?? 0) > 0) {
          weakList.push({ ...q, catLabel: cat.label, wrongCount: rec.wrong ?? 0 })
        }
      })
    }
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
        <span className="stats__title">📊 現代文サマリ</span>
      </div>

      <div className="stats__tabs">
        <button className={`stats__tab ${tab === 'category' ? 'active' : ''}`} onClick={() => setTab('category')}>
          カテゴリ別
        </button>
        <button className={`stats__tab ${tab === 'weak' ? 'active' : ''}`} onClick={() => setTab('weak')}>
          弱点問題 {weakList.length > 0 && `(${weakList.length})`}
        </button>
      </div>

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

export default GendaibunStats
