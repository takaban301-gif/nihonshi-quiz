// ============================================================
// 英語・多義語 進捗管理（語義単位）
//   senses: { [senseId]: { c, w, streak, last } }
//   common: { [wordId]:  { c, w, streak, last } }
//   streak（連続正解数）を持たせておき、将来の間隔反復に流用できるようにする
// ============================================================
const STORAGE_KEY = 'eigo-polysemy-progress'

export function loadEigoProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const p = raw ? JSON.parse(raw) : {}
    return { senses: p.senses ?? {}, common: p.common ?? {} }
  } catch {
    return { senses: {}, common: {} }
  }
}

export function saveEigoProgress(progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  } catch {
    // ignore
  }
}

function bump(rec, isCorrect) {
  const prev = rec ?? { c: 0, w: 0, streak: 0, last: 0 }
  return {
    c: prev.c + (isCorrect ? 1 : 0),
    w: prev.w + (isCorrect ? 0 : 1),
    streak: isCorrect ? prev.streak + 1 : 0,
    last: Date.now(),
  }
}

export function recordAnswer(progress, item, isCorrect) {
  if (item.type === 'context') {
    return {
      ...progress,
      senses: { ...progress.senses, [item.senseId]: bump(progress.senses[item.senseId], isCorrect) },
    }
  }
  return {
    ...progress,
    common: { ...progress.common, [item.wordId]: bump(progress.common[item.wordId], isCorrect) },
  }
}

function statusFromRec(rec) {
  if (!rec) return 'unseen'
  if (rec.streak === 0) return 'weak'
  if (rec.streak >= 3) return 'mastered'
  return 'learning'
}

export function getSenseStatus(progress, senseId) {
  return statusFromRec(progress.senses?.[senseId])
}

export function getCommonStatus(progress, wordId) {
  return statusFromRec(progress.common?.[wordId])
}

export const STATUS_LABEL = {
  unseen: '未出題',
  weak: '苦手',
  learning: '学習中',
  mastered: '定着',
}
