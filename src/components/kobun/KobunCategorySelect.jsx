import { KOBUN_CATEGORIES, KOBUN_FORMATS } from '../../utils/subjects'

function KobunCategorySelect({
  allQuestions,
  progress,
  onSelectCategory,
  onBack,
}) {
  return (
    <div className="kobun-category-select">
      <div className="screen-header">
        <button className="back-btn" onClick={onBack}>← 戻る</button>
        <h2 className="screen-title">🖌️ 古文</h2>
      </div>

      <p className="section-label">分野を選択</p>
      <div className="category-grid">
        {KOBUN_CATEGORIES.map((cat) => {
          const questions = allQuestions[cat.key] ?? []
          const catProgress = progress?.[cat.key] ?? {}
          const total = questions.length || 0
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

export default KobunCategorySelect
