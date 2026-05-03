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

// カテゴリ別統計を計算（全時代横断）
// 返り値: [ { category, total, mastered, review, unseen, correctRate } ]
export function calcCategoryStats(progress, allQuestions) {
  const categoryMap = {}

  for (const [eraKey, questions] of Object.entries(allQuestions)) {
    const era = progress[eraKey] ?? {}
    for (const q of questions) {
      const cat = q.category ?? '不明'
      if (!categoryMap[cat]) {
        categoryMap[cat] = { total: 0, mastered: 0, review: 0, unseen: 0, correct: 0, answered: 0 }
      }
      const record = era[q.id]
      categoryMap[cat].total++
      if (record?.status === 'mastered') {
        categoryMap[cat].mastered++
      } else if (record?.status === 'review') {
        categoryMap[cat].review++
      } else {
        categoryMap[cat].unseen++
      }
      if (record) {
        const total = (record.correctStreak ?? 0) + (record.wrongCount ?? 0)
        categoryMap[cat].correct += record.correctStreak ?? 0
        categoryMap[cat].answered += total
      }
    }
  }

  return Object.entries(categoryMap)
    .map(([category, s]) => ({
      category,
      ...s,
      correctRate: s.answered > 0 ? Math.round((s.correct / s.answered) * 100) : null,
    }))
    .sort((a, b) => b.total - a.total)
}

// 弱点問題リスト（wrongCount が多い順）
export function getWeakQuestions(progress, allQuestions, limit = 20) {
  const list = []
  for (const [eraKey, questions] of Object.entries(allQuestions)) {
    const era = progress[eraKey] ?? {}
    for (const q of questions) {
      const record = era[q.id]
      if (record && record.wrongCount > 0) {
        list.push({ ...q, eraKey, ...record })
      }
    }
  }
  return list
    .sort((a, b) => b.wrongCount - a.wrongCount)
    .slice(0, limit)
}
