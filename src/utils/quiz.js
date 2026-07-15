// 配列をシャッフル（Fisher-Yates）
export function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ============================================================
//  直近に出した問題を覚えておくクールダウン（マンネリ防止）
//  「一度間違えると同じ問題が最初に何度も出る／同じ問題しか出ない」
//  対策として、直近に出したIDを localStorage に記録し、次回の選択で
//  後ろに回す（除外はしない）。
// ============================================================
const RECENT_PREFIX = 'quiz_recent_'
const RECENT_MAX = 24 // 直近この件数を「最近見た」とみなす（≒直近2〜3セッション分）

export function getRecent(key) {
  if (!key) return []
  try {
    const raw = localStorage.getItem(RECENT_PREFIX + key)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function pushRecent(key, ids) {
  if (!key || !ids?.length) return
  try {
    const prev = getRecent(key)
    // 新しい順に並べ、重複を除いて上限まで
    const merged = [...ids, ...prev].filter((v, i, a) => a.indexOf(v) === i)
    localStorage.setItem(RECENT_PREFIX + key, JSON.stringify(merged.slice(0, RECENT_MAX)))
  } catch {
    /* localStorage 不可でも動作は継続 */
  }
}

// 直近に出したものを後ろへ回す（fresh を前、seen を後ろ。除外はしない）
function deprioritizeRecent(list, recentSet, idOf) {
  if (!recentSet || recentSet.size === 0) return list
  const fresh = []
  const seen = []
  for (const item of list) {
    ;(recentSet.has(idOf(item)) ? seen : fresh).push(item)
  }
  return [...fresh, ...seen]
}

// tier（review / unseen / mastered）を混合してセッションを組み立てる共通処理
//   - review は出しすぎない（上限 reviewCap）。残りは unseen → mastered → 余った review で補充
//   - 直近に出した問題は各 tier 内で後ろに回す
//   - 最後に全体をシャッフルして「復習が必ず先頭」になるのを防ぐ
//   - 選んだIDを recent に記録
function buildSession({ review, unseen, mastered }, count, recentKey, idOf) {
  const recentSet = new Set(getRecent(recentKey))
  const order = (arr) => deprioritizeRecent(shuffle(arr), recentSet, idOf)

  const r = order(review)
  const u = order(unseen)
  const m = order(mastered)

  const reviewCap = Math.max(1, Math.ceil(count * 0.6)) // 復習はセッションの最大6割まで

  const picked = []
  const pickedIds = new Set()
  const take = (arr, max) => {
    let added = 0
    for (const item of arr) {
      if (picked.length >= count) break
      if (max != null && added >= max) break
      const id = idOf(item)
      if (pickedIds.has(id)) continue
      picked.push(item)
      pickedIds.add(id)
      added++
    }
  }

  take(r, reviewCap) // まず復習を上限まで
  take(u)            // 次に未出題で埋める（毎回ここが混ざるので変化が出る）
  take(m)            // それでも足りなければ習得済み
  take(r)            // まだ足りなければ残りの復習で補充

  const session = shuffle(picked.slice(0, count)) // 全体シャッフルで出題順を毎回変える
  pushRecent(recentKey, session.map(idOf))
  return session
}

// 10問セッション用の問題を選ぶ
// 優先順位: review（上限あり）> unseen > mastered。recentKey を渡すと直近出題を後ろに回す
export function pickSessionQuestions(questions, progressEra, count = 10, recentKey = null) {
  const era = progressEra ?? {}
  const review   = questions.filter(q => era[q.id]?.status === 'review')
  const unseen   = questions.filter(q => !era[q.id] || era[q.id].status === 'unseen')
  const mastered = questions.filter(q => era[q.id]?.status === 'mastered')
  return buildSession({ review, unseen, mastered }, count, recentKey, q => q.id)
}

// 古文・現代文・漢文用セッション問題選択（4択・空所補充）
// categoryProgress の構造は { [questionId]: { correct, wrong } }
// 優先順位: review（wrongあり・上限あり）> unseen（未回答）> mastered（correctのみ）
export function pickKobunSessionQuestions(questions, categoryProgress, count = 10, recentKey = null) {
  const prog = categoryProgress ?? {}
  const review   = questions.filter(q => prog[q.id] && (prog[q.id].wrong ?? 0) > 0)
  const unseen   = questions.filter(q => !prog[q.id])
  const mastered = questions.filter(q => prog[q.id] && (prog[q.id].wrong ?? 0) === 0 && (prog[q.id].correct ?? 0) > 0)
  return buildSession({ review, unseen, mastered }, count, recentKey, q => q.id)
}

// 読解用セッション選択（パッセージ単位）
// subId（例: dokkai_001_1）を集計してパッセージ単位の優先度を決定
export function pickKobunDokkaiPassages(passages, categoryProgress, count = 5, recentKey = null) {
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

  // パッセージの識別子（id が無ければ最初の subId で代用）
  const idOf = p => p.id ?? p.passageId ?? p.questions?.[0]?.subId ?? JSON.stringify(p.questions?.map(s => s.subId))
  return buildSession({ review, unseen, mastered }, count, recentKey, idOf)
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
