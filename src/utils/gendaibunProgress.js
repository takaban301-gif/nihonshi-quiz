// 現代文用の進捗管理（kobunProgress.js と同じ構造）
const STORAGE_KEY = 'gendaibun-progress'

export function loadGendaibunProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function saveGendaibunProgress(progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  } catch {
    // ignore
  }
}

export function updateGendaibunRecord(progress, category, questionId, isCorrect) {
  const catProgress = progress[category] ?? {}
  const prev = catProgress[questionId] ?? { correct: 0, wrong: 0, lastAnswered: null }
  const updated = {
    ...prev,
    correct: prev.correct + (isCorrect ? 1 : 0),
    wrong:   prev.wrong   + (isCorrect ? 0 : 1),
    lastAnswered: Date.now(),
  }
  return {
    ...progress,
    [category]: {
      ...catProgress,
      [questionId]: updated,
    },
  }
}
