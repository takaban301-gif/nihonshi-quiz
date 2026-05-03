import { SUBJECTS } from '../utils/subjects'

const THEMES = [
  { key: 'normal', label: '通常',  icon: '📖' },
  { key: 'pop',    label: 'ポップ', icon: '🎀' },
  { key: 'game',   label: 'ゲーム', icon: '🎮' },
]

function SubjectSelect({ onSelectSubject, theme, onChangeTheme }) {
  return (
    <div className="subject-select">
      <h1 className="app-title">受験対策</h1>
      <p className="app-subtitle">教科を選んでください</p>

      <div className="subject-grid">
        {Object.entries(SUBJECTS).map(([key, subj]) => (
          <button
            key={key}
            className="subject-card"
            onClick={() => onSelectSubject(key)}
          >
            <span className="subject-icon">{subj.icon}</span>
            <span className="subject-label">{subj.label}</span>
          </button>
        ))}
      </div>

      {/* テーマ切替 */}
      <div className="theme-selector">
        <p className="theme-selector__label">デザイン</p>
        <div className="theme-selector__btns">
          {THEMES.map(t => (
            <button
              key={t.key}
              className={`theme-btn ${theme === t.key ? 'active' : ''}`}
              onClick={() => onChangeTheme(t.key)}
            >
              <span className="theme-btn__icon">{t.icon}</span>
              <span className="theme-btn__label">{t.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SubjectSelect
