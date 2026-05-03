// localStorage のキー
const STORAGE_KEY = 'nihonshi_progress'

// 全進捗を取得
export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

// 全進捗を保存
export function saveProgress(progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
}

// 1問の記録を更新
// status: 'unseen' | 'mastered' | 'review'
export function updateQuestionRecord(progress, eraKey, questionId, isCorrect) {
  const era = progress[eraKey] ?? {}
  const record = era[questionId] ?? { status: 'unseen', correctStreak: 0, wrongCount: 0 }

  let { correctStreak, wrongCount } = record

  if (isCorrect) {
    correctStreak += 1
    wrongCount = record.wrongCount // 正解しても wrongCount はリセットしない
  } else {
    correctStreak = 0
    wrongCount += 1
  }

  // 習得条件:
  //   一度も間違えていない → 1回正解でOK
  //   過去に間違えたことがある → 2回連続正解が必要
  const hadWrong = wrongCount > 0 && !isCorrect
    ? true
    : (record.wrongCount > 0)

  let status
  if (hadWrong) {
    status = correctStreak >= 2 ? 'mastered' : 'review'
  } else {
    status = correctStreak >= 1 ? 'mastered' : 'unseen'
  }

  return {
    ...progress,
    [eraKey]: {
      ...era,
      [questionId]: { status, correctStreak, wrongCount },
    },
  }
}

// 時代の統計を計算
export function calcEraStats(progress, eraKey, questions) {
  const era = progress[eraKey] ?? {}
  const total = questions.length
  const mastered = questions.filter(q => era[q.id]?.status === 'mastered').length
  const review = questions.filter(q => era[q.id]?.status === 'review').length
  const unseen = total - mastered - review
  return { total, mastered, review, unseen }
}
