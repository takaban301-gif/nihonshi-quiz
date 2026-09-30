// 英語・多義語データの検証:  node check_eigo.mjs
import fs from 'node:fs'
const files = fs.readdirSync('src/data/eigo').filter(f => f.endsWith('.json')).sort()
const words = files.flatMap(f => JSON.parse(fs.readFileSync(`src/data/eigo/${f}`, 'utf8')))
const errors = [], warns = []
const ids = new Set(), senseIds = new Set()
let senses = 0, examples = 0, common = 0
const levels = {}
for (const w of words) {
  if (ids.has(w.id)) errors.push(`重複word: ${w.id}`); ids.add(w.id)
  levels[w.level] = (levels[w.level] ?? 0) + 1
  if (w.senses.length < 2) errors.push(`${w.id}: 語義が2未満`)
  const jas = new Set()
  let base = 0; const baseSenses = new Set()
  w.senses.forEach((s, i) => {
    if (s.id !== `${w.id}_${i + 1}`) errors.push(`${s.id}: IDが連番でない（期待値 ${w.id}_${i + 1}）`)
    if (!['n','v','adj','adv','prep','phr'].includes(s.pos)) errors.push(`${s.id}: 不正なpos ${s.pos}`)
    if (s.note && /[ぁ-んァ-ヶ一-龠]/.test(s.note)) warns.push(`${s.id}: noteに日本語が含まれる`)
  })
  if (w.core && /※/.test(w.core)) warns.push(`${w.id}: 注意書きはcoreでなくcautionに`)
  if (w.core && /[\[\]ː]|発音/.test(w.core)) warns.push(`${w.id}: 発音はcoreでなくpronに`)
  for (const s of w.senses) {
    senses++
    if (senseIds.has(s.id)) errors.push(`重複sense: ${s.id}`); senseIds.add(s.id)
    const label = s.ja.replace(/^（[^）]*）/, '')
    if (jas.has(label)) errors.push(`${w.id}: 語義の訳が重複 ${label}`); jas.add(label)
    if (s.ja.length > 18) warns.push(`${s.id}: 訳が長い(${s.ja.length}字) ${s.ja}`)
    if (!s.ex?.length) errors.push(`${s.id}: 例文なし`)
    for (const e of s.ex) {
      examples++
      const m = e.en.match(/\[([^\]]+)\]/g)
      if (!m || m.length !== 1) { errors.push(`${s.id}: マーカーが1個でない: ${e.en}`); continue }
      const t = m[0].slice(1, -1).toLowerCase()
      if (!t.startsWith(w.word.slice(0, 3))) warns.push(`${s.id}: 対象語が見出し語と不一致? ${t}`)
      if (t === w.word) { base++; baseSenses.add(s.id) }
      if (!e.ja) errors.push(`${s.id}: 和訳なし`)
    }
  }
  const ds = w.distractors ?? []
  if (ds.includes(w.word)) errors.push(`${w.id}: 誤答に正解語が含まれる`)
  if (base >= 3 && baseSenses.size >= 2 && ds.length >= 3) common++
  else warns.push(`${w.id}: 共通語補充を作れない（原形例文${base}件/${baseSenses.size}語義）`)
}
console.log(`単語 ${words.length} / 語義 ${senses} / 例文 ${examples}`)
console.log(`出題数: 文脈語義選択 ${senses} + 共通語補充 ${common} = ${senses + common}`)
console.log('レベル分布:', levels)
warns.forEach(x => console.log('WARN', x))
errors.forEach(x => console.log('ERROR', x))
process.exit(errors.length ? 1 : 0)
