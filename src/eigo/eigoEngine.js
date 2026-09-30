// ============================================================
// 英語・多義語 出題エンジン
//   データ構造: word → senses → examples
//   例文の対象語は [ ] で囲む（例: "He [addressed] the problem."）
//   問題はデータから自動生成する（問題を個別に持たない）
// ============================================================
import { WORDS, WORD_MAP } from './eigoData'
import { getSenseStatus, getCommonStatus } from './eigoProgress'

export const SESSION_SIZE = 10

// 選択肢では先頭の（日時を）等の目的語ヒントを外す（例文の語と照合するだけで解けてしまうため）
export const stripHint = ja => ja.replace(/^（[^）]*）/, '')

export function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// "He [addressed] it." → { before, target, after }
export function parseMarked(en) {
  const m = en.match(/\[([^\]]+)\]/)
  if (!m) return { before: en, target: '', after: '' }
  return {
    before: en.slice(0, m.index),
    target: m[1],
    after: en.slice(m.index + m[0].length),
  }
}

export function isBaseForm(word, en) {
  return parseMarked(en).target.toLowerCase() === word.word.toLowerCase()
}

// 共通語補充に使える例文（原形のまま使われている例文）
function baseExamples(word) {
  const list = []
  word.senses.forEach(s => {
    s.ex.forEach(e => {
      if (isBaseForm(word, e.en)) list.push({ sense: s, ex: e })
    })
  })
  return list
}

export function canMakeCommon(word) {
  const list = baseExamples(word)
  const senseCount = new Set(list.map(x => x.sense.id)).size
  return list.length >= 3 && senseCount >= 2 && (word.distractors?.length ?? 0) >= 3
}

// ---------- 出題プール ----------
function levelOk(word, level) {
  return level === 'all' || word.level === level
}

export function contextPool(level) {
  const pool = []
  WORDS.filter(w => levelOk(w, level)).forEach(w => {
    w.senses.forEach(s => pool.push({ type: 'context', wordId: w.id, senseId: s.id, key: s.id }))
  })
  return pool
}

export function commonPool(level) {
  return WORDS.filter(w => levelOk(w, level) && canMakeCommon(w))
    .map(w => ({ type: 'common', wordId: w.id, key: `common:${w.id}` }))
}

// 優先度: 苦手(0) > 未出題(1) > 学習中(2) > 定着(3)。同順位は最終解答が古い順＋ランダム
const RANK = { weak: 0, unseen: 1, learning: 2, mastered: 3 }

function statusOf(item, progress) {
  return item.type === 'context'
    ? getSenseStatus(progress, item.senseId)
    : getCommonStatus(progress, item.wordId)
}

function lastOf(item, progress) {
  const rec = item.type === 'context'
    ? progress.senses?.[item.senseId]
    : progress.common?.[item.wordId]
  return rec?.last ?? 0
}

function prioritize(pool, progress) {
  return shuffle(pool)
    .map(item => ({ item, rank: RANK[statusOf(item, progress)], last: lastOf(item, progress) }))
    .sort((a, b) => a.rank - b.rank || a.last - b.last)
    .map(x => x.item)
}

// 同じ単語は1セッション1回まで（語義マップで他の問題の答えが見えてしまうため）
function takeUniqueWords(sorted, n, used = new Set()) {
  const out = []
  for (const item of sorted) {
    if (out.length >= n) break
    if (used.has(item.wordId)) continue
    used.add(item.wordId)
    out.push(item)
  }
  return out
}

export function pickSession(mode, level, progress) {
  if (mode === 'context') {
    return takeUniqueWords(prioritize(contextPool(level), progress), SESSION_SIZE)
  }
  if (mode === 'common') {
    return takeUniqueWords(prioritize(commonPool(level), progress), SESSION_SIZE)
  }
  if (mode === 'mix') {
    const used = new Set()
    const c = takeUniqueWords(prioritize(commonPool(level), progress), 3, used)
    const x = takeUniqueWords(prioritize(contextPool(level), progress), SESSION_SIZE - c.length, used)
    return shuffle([...x, ...c])
  }
  if (mode === 'weak') {
    const pool = [...contextPool(level), ...commonPool(level)]
      .filter(item => statusOf(item, progress) === 'weak')
    return takeUniqueWords(prioritize(pool, progress), SESSION_SIZE)
  }
  return []
}

export function countWeak(level, progress) {
  return [...contextPool(level), ...commonPool(level)]
    .filter(item => statusOf(item, progress) === 'weak').length
}

// ---------- 表示用の問題を組み立て ----------
export function buildDisplay(item) {
  const word = WORD_MAP[item.wordId]
  if (item.type === 'context') {
    const sense = word.senses.find(s => s.id === item.senseId)
    const ex = sense.ex[Math.floor(Math.random() * sense.ex.length)]
    const correct = stripHint(sense.ja)
    const used = new Set([correct])
    // 誤答: まず同じ単語の別語義（多義語の区別を問う）→ 足りなければ他の単語の同品詞の語義
    const wrong = []
    const candidates = [
      ...shuffle(word.senses.filter(s => s.id !== sense.id)),
      ...shuffle(WORDS.filter(w => w.id !== word.id).flatMap(w => w.senses).filter(s => s.pos === sense.pos)),
    ]
    for (const s of candidates) {
      if (wrong.length >= 3) break
      const label = stripHint(s.ja)
      if (used.has(label)) continue
      used.add(label)
      wrong.push(label)
    }
    const choices = shuffle([correct, ...wrong])
    return {
      ...item,
      word,
      sense,
      ex,
      choices,
      correctIndex: choices.indexOf(correct),
    }
  }

  // common
  const list = shuffle(baseExamples(word))
  const picked = []
  const usedSense = new Set()
  for (const x of list) {
    if (picked.length >= 3) break
    if (usedSense.has(x.sense.id)) continue
    usedSense.add(x.sense.id)
    picked.push(x)
  }
  for (const x of list) {
    if (picked.length >= 3) break
    if (!picked.includes(x)) picked.push(x)
  }
  const choices = shuffle([word.word, ...shuffle(word.distractors).slice(0, 3)])
  return {
    ...item,
    word,
    items: picked,
    choices,
    correctIndex: choices.indexOf(word.word),
  }
}
