// 語義マップ: その単語の全語義を一覧表示し、今回問われた語義をハイライト
import { POS_LABEL } from './eigoData'
import { getSenseStatus, STATUS_LABEL } from './eigoProgress'
import { parseMarked } from './eigoEngine'

export function MarkedSentence({ en, blank = false }) {
  const { before, target, after } = parseMarked(en)
  return (
    <span>
      {before}
      {blank
        ? <span className="eigo-blank">（　　）</span>
        : <u className="eigo-target">{target}</u>}
      {after}
    </span>
  )
}

export default function SenseMap({ word, progress, highlightIds = [], showExamples = false }) {
  return (
    <div className="eigo-sensemap">
      <div className="eigo-sensemap__head">
        <span className="eigo-sensemap__word">{word.word}</span>
        {word.core && <span className="eigo-sensemap__core">コア：{word.core}</span>}
      </div>
      {word.pron && <div className="eigo-sensemap__pron">発音注意　{word.pron}</div>}
      {word.caution && <div className="eigo-sensemap__pron">注意　{word.caution}</div>}
      <ol className="eigo-sensemap__list">
        {word.senses.map(s => {
          const st = getSenseStatus(progress, s.id)
          const hl = highlightIds.includes(s.id)
          return (
            <li key={s.id} className={`eigo-sense ${hl ? 'is-current' : ''}`}>
              <div className="eigo-sense__row">
                <span className="eigo-pos">{POS_LABEL[s.pos] ?? s.pos}</span>
                <span className="eigo-sense__ja">
                  {s.ja}
                  {s.note && <span className="eigo-note" lang="en">{s.note}</span>}
                  {s.homograph && <span className="eigo-homograph" title="語源が別の同じつづりの語">別語源</span>}
                </span>
                <span className={`eigo-status eigo-status--${st}`}>{STATUS_LABEL[st]}</span>
              </div>
              {(showExamples || hl) && s.ex.map((e, i) => (
                <div key={i} className="eigo-sense__ex">
                  <div className="eigo-sense__en"><MarkedSentence en={e.en} /></div>
                  <div className="eigo-sense__exja">{e.ja}</div>
                </div>
              ))}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
