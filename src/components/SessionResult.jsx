import './SessionResult.css'
import { getEraLabel } from '../utils/eras'

function SessionResult({ eraKey, results, onRetry, onBack, retryLabel, backLabel }) {
  const total = results.length
  const correctCount = results.filter(r => r.isCorrect).length

  // eraKey が eras.js に存在しない場合（古文カテゴリ等）はそのまま表示
  const displayLabel = getEraLabel(eraKey) ?? eraKey

  function getMessage(correct, total) {
    const pct = correct / total
    if (pct === 1) return '🎉 パーフェクト！'
    if (pct >= 0.8) return '👏 すばらしい！'
    if (pct >= 0.6) return '😊 よくできました'
    if (pct >= 0.4) return '📖 もう少し！'
    return '💪 復習して再挑戦しよう'
  }

  return (
    <div className="session-result">
      <h2 className="session-result__title">セッション結果</h2>
      <p className="session-result__era">{displayLabel}</p>

      {/* スコア */}
      <div className="result-score-card">
        <div className="result-score-card__circle">
          <span className="result-score-card__num">{correctCount}</span>
          <span className="result-score-card__denom">/ {total}</span>
        </div>
        <p className="result-score-card__message">{getMessage(correctCount, total)}</p>
      </div>

      {/* 問題ごとの結果 */}
      <div className="result-list">
        {results.map((r, i) => (
          <div key={i} className={`result-item ${r.isCorrect ? 'correct' : 'incorrect'}`}>
            <div className="result-item__status">
              {r.isCorrect ? '✓ 正解' : '✗ 不正解'}
            </div>
            <div className="result-item__question">
              Q{i + 1}. {r.question.question}
            </div>
          </div>
        ))}
      </div>

      {/* ボタン */}
      <div className="result-actions">
        <button className="btn-primary" onClick={onRetry}>
          {retryLabel ?? 'もう一度このセクションに挑戦'}
        </button>
        <button className="btn-secondary" onClick={onBack}>
          {backLabel ?? 'セクション選択に戻る'}
        </button>
      </div>
    </div>
  )
}

export default SessionResult
