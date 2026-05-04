// 配列をシャッフル（Fisher-Yates）
export function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// 10問セッション用の問題を選ぶ
// 優先順位: review > unseen > mastered
export function pickSessionQuestions(questions, progressEra, count = 10) {
  const era = progressEra ?? {}

  const review  = questions.filter(q => era[q.id]?.status === 'review')
  const unseen  = questions.filter(q => !era[q.id] || era[q.id].status === 'unseen')
  const mastered = questions.filter(q => era[q.id]?.status === 'mastered')

  const pool = [
    ...shuffle(review),
    ...shuffle(unseen),
    ...shuffle(mastered),
  ]

  return pool.slice(0, count)
}

// 古文用セッション問題選択（4択・空所補充）
// kobunProgress の構造は { [questionId]: { correct, wrong } }
// 優先順位: review（wrongあり）> unseen（未回答）> mastered（correctのみ）
export function pickKobunSessionQuestions(questions, categoryProgress, count = 10) {
  const prog = categoryProgress ?? {}

  const review   = questions.filter(q => prog[q.id] && (prog[q.id].wrong ?? 0) > 0)
  const unseen   = questions.filter(q => !prog[q.id])
  const mastered = questions.filter(q => prog[q.id] && (prog[q.id].wrong ?? 0) === 0 && (prog[q.id].correct ?? 0) > 0)

  const pool = [
    ...shuffle(review),
    ...shuffle(unseen),
    ...shuffle(mastered),
  ]

  return pool.slice(0, count)
}

// 古文読解用セッション選択（パッセージ単位）
// subId（例: dokkai_001_1）を集計してパッセージ単位の優先度を決定
export function pickKobunDokkaiPassages(passages, categoryProgress, count = 5) {
  const prog = categoryProgress ?? {}

  // パッセージ単位でwrong/correct集計
  const withStats = passages.map(p => {
    const totalWrong   = p.questions.reduce((s, sub) => s + (prog[sub.subId]?.wrong ?? 0), 0)
    const totalCorrect = p.questions.reduce((s, sub) => s + (prog[sub.subId]?.correct ?? 0), 0)
    const anyAnswered  = p.questions.some(sub => prog[sub.subId])
    return { ...p, _wrong: totalWrong, _correct: totalCorrect, _answered: anyAnswered }
  })

  const review   = withStats.filter(p => p._wrong > 0)
  const unseen   = withStats.filter(p => !p._answered)
  const mastered = withStats.filter(p => p._answered && p._wrong === 0)

  const pool = [
    ...shuffle(review),
    ...shuffle(unseen),
    ...shuffle(mastered),
  ]

  return pool.slice(0, count)
}

// 古文・現代文・漢文の問題を日本史と同じ形式に正規化（answer → answerIndex, era/category/difficulty を補完）
export function normalizeKobunQuestion(q, categoryLabel, eraLabel = '古文') {
  return {
    ...q,
    answerIndex: q.answer,          // answer → answerIndex に統一
    era: eraLabel,
    category: q.category ?? categoryLabel,
    difficulty: q.difficulty ?? 3,
  }
}

// 選択肢をランダム順にして出題用オブジェクトを返す
export function buildQuestionForDisplay(question) {
  const indexed = question.choices.map((text, i) => ({ text, originalIndex: i }))
  const shuffled = shuffle(indexed)
  const correctShuffledIndex = shuffled.findIndex(c => c.originalIndex === question.answerIndex)
  return {
    ...question,
    displayChoices: shuffled.map(c => c.text),
    correctDisplayIndex: correctShuffledIndex,
  }
}
