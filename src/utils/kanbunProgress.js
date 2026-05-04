// 漢文用の進捗管理（gendaibunProgress.js と同じ構造）
const STORAGE_KEY = 'kanbun-progress'

export function loadKanbunProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function saveKanbunProgress(progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  } catch {
    // ignore
  }
}

export function updateKanbunRecord(progress, category, questionId, isCorrect) {
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
