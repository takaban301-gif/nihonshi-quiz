import { useState } from 'react'
import { WORDS } from './eigoData'
import { getSenseStatus } from './eigoProgress'

export default function EigoWordList({ level, progress, onBack, onSelect }) {
  const [q, setQ] = useState('')
  const words = WORDS
    .filter(w => level === 'all' || w.level === level)
    .filter(w => !q || w.word.startsWith(q.toLowerCase().trim()))

  return (
    <div className="eigo eigo-page">
      <div className="screen-header">
        <button className="back-btn" onClick={onBack}>← 戻る</button>
        <h2 className="screen-title">単語一覧</h2>
      </div>
      <input
        className="eigo-search"
        type="search"
        placeholder="英単語で検索"
        value={q}
        onChange={e => setQ(e.target.value)}
        autoCapitalize="off"
      />
      <ul className="eigo-wordlist">
        {words.map(w => (
          <li key={w.id}>
            <button className="eigo-wordlist__item" onClick={() => onSelect(w.id)}>
              <span className="eigo-wordlist__word" lang="en">{w.word}</span>
              <span className="eigo-wordlist__dots">
                {w.senses.map(s => (
                  <span key={s.id} className={`eigo-dot eigo-dot--${getSenseStatus(progress, s.id)}`} />
                ))}
              </span>
              <span className="eigo-wordlist__ja">{w.senses.map(s => s.ja).join(' / ')}</span>
            </button>
          </li>
        ))}
      </ul>
      <p className="eigo-hint">● 灰=未出題　赤=苦手　黄=学習中　緑=定着（3回連続正解）</p>
    </div>
  )
}
