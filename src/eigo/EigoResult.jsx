export default function EigoResult({ results, onRetry, onBack, onShowWord }) {
  const total = results.length
  const correct = results.filter(r => r.isCorrect).length
  const pct = total ? correct / total : 0
  const msg = pct === 1 ? '🎉 パーフェクト！'
    : pct >= 0.8 ? '👏 すばらしい！'
    : pct >= 0.6 ? '😊 よくできました'
    : pct >= 0.4 ? '📖 もう少し！'
    : '💪 語義マップで復習しよう'

  return (
    <div className="session-result eigo">
      <h2 className="session-result__title">セッション結果</h2>
      <p className="session-result__era">英語・多義語</p>
      <div className="result-score-card">
        <div className="result-score-card__circle">
          <span className="result-score-card__num">{correct}</span>
          <span className="result-score-card__denom">/ {total}</span>
        </div>
        <p className="result-score-card__message">{msg}</p>
      </div>

      <div className="result-list">
        {results.map((r, i) => (
          <button
            key={i}
            className={`result-item eigo-result-item ${r.isCorrect ? 'correct' : 'incorrect'}`}
            onClick={() => onShowWord(r.q.word.id)}
          >
            <div className="result-item__status">{r.isCorrect ? '✓ 正解' : '✗ 不正解'}</div>
            <div className="result-item__question">
              <strong lang="en">{r.q.word.word}</strong>
              {r.q.type === 'context' ? `（${r.q.sense.ja}）` : '（共通語補充）'}
            </div>
          </button>
        ))}
      </div>
      <p className="eigo-hint">単語をタップすると語義マップを確認できます</p>

      <div className="result-actions">
        <button className="btn-primary" onClick={onRetry}>もう一度（同じ形式で10問）</button>
        <button className="btn-secondary" onClick={onBack}>形式選択に戻る</button>
      </div>
    </div>
  )
}
