import { GENDAIBUN_CATEGORIES } from '../../utils/subjects'

function GendaibunCategorySelect({
  allQuestions,
  progress,
  onSelectCategory,
  onBack,
  onShowStats,
}) {
  return (
    <div className="kobun-category-select">
      <div className="screen-header">
        <button className="back-btn" onClick={onBack}>← 戻る</button>
        <h2 className="screen-title">📝 現代文</h2>
        {onShowStats && (
          <button className="kobun-stats-btn" onClick={onShowStats}>📊 サマリ</button>
        )}
      </div>

      <p className="section-label">分野を選んで挑戦しよう</p>
      <div className="category-grid">
        {GENDAIBUN_CATEGORIES.map((cat) => {
          const questions = allQuestions[cat.key] ?? []
          const catProgress = progress?.[cat.key] ?? {}
          // 読解フォーマットはサブ問題の合計数をtotalにする
          const total = cat.defaultFormat === '読解'
            ? questions.reduce((sum, p) => sum + (p.questions?.length ?? 0), 0)
            : questions.length || 0
          const answered = Object.keys(catProgress).length
          return (
            <button
              key={cat.key}
              className="category-card"
              onClick={() => onSelectCategory(cat.key, cat.defaultFormat, cat.label)}
            >
              <span className="category-label">{cat.label}</span>
              <span className="category-count">
                {answered}/{total} 問
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default GendaibunCategorySelect
