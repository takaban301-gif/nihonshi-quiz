import { SUBJECTS } from '../utils/subjects'

function SubjectSelect({ onSelectSubject }) {
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
    </div>
  )
}

export default SubjectSelect
