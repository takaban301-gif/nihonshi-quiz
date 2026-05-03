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
