// 多義語データの読み込み（ファイルを追加したらここに import を足す）
import w1 from '../data/eigo/polysemy_01.json'
import w2 from '../data/eigo/polysemy_02.json'
import w3 from '../data/eigo/polysemy_03.json'
import w4 from '../data/eigo/polysemy_04.json'

export const WORDS = [...w1, ...w2, ...w3, ...w4]
  .sort((a, b) => a.word.localeCompare(b.word))

export const WORD_MAP = Object.fromEntries(WORDS.map(w => [w.id, w]))

export const LEVELS = [
  { key: 'all', label: 'すべて' },
  { key: 1, label: '基礎' },
  { key: 2, label: '標準' },
  { key: 3, label: '発展' },
]

export const POS_LABEL = { n: '名', v: '動', adj: '形', adv: '副', prep: '前', phr: '熟' }
