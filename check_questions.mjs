#!/usr/bin/env node
// ============================================================
//  問題データ 構造チェックスクリプト（事実の正誤は見ません）
//
//  使い方:
//    node check_questions.mjs            … ./src/data を再帰的に点検
//    node check_questions.mjs <ディレクトリ> … 指定ディレクトリを点検
//
//  検出項目:
//    [形式]     choices が4択でない / answerIndex(answer) が範囲外
//    [選択肢重複] 選択肢の中に同じ文字列がある
//    [答え露出]  設問文の中に正解の選択肢がそのまま含まれる（同語反復）
//    [文字数偏り] 正解だけが他の全選択肢より5文字以上 長い/短い（勘で当てられる）
//    [設問重複]  まったく同じ設問文が複数ある
//
//  出力: コンソールに一覧、さらに CSV（点検レポート.csv, Excelで開ける）
// ============================================================
import { readFileSync, readdirSync, writeFileSync, statSync } from 'fs'
import { join, relative } from 'path'

const LEN_GAP = 5 // 正解と不正解の文字数差がこの値以上で「偏り」とみなす

const baseDir = process.argv[2] ?? './src/data'

// JSONファイルを再帰的に集める
function collectJson(dir) {
  const out = []
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    const st = statSync(p)
    if (st.isDirectory()) out.push(...collectJson(p))
    else if (name.startsWith('questions_') && name.endsWith('.json')) out.push(p)
  }
  return out
}

// 1問（4択）を点検して findings を返す
function checkMCQ(q, file) {
  const res = []
  const push = (type, detail) => res.push({ file, id: q.id ?? '(id無し)', type, detail })

  const choices = q.choices
  const ai = q.answerIndex ?? q.answer // 日本史は answerIndex、古文系は answer

  if (!Array.isArray(choices) || choices.length !== 4) {
    push('形式', `選択肢が4つでない（${Array.isArray(choices) ? choices.length : '配列でない'}）`)
    return res
  }
  if (typeof ai !== 'number' || ai < 0 || ai >= choices.length) {
    push('形式', `正解番号が不正（${ai}）`)
    return res
  }

  // 選択肢重複
  if (new Set(choices).size !== choices.length) {
    push('選択肢重複', `選択肢: [${choices.join(' / ')}]`)
  }

  const correct = String(choices[ai])
  const others = choices.filter((_, i) => i !== ai).map(String)
  const question = String(q.question ?? '')

  // 答え露出
  if (correct && question.includes(correct)) {
    push('答え露出', `正解「${correct}」が設問文に含まれる`)
  }

  // 文字数偏り（正解だけ突出）
  const ol = others.map(o => o.length)
  const cl = correct.length
  if (cl - Math.max(...ol) >= LEN_GAP) {
    push('文字数偏り', `正解「${correct}」(${cl}字)が他(${ol.join(',')}字)より突出して長い`)
  } else if (Math.min(...ol) - cl >= LEN_GAP) {
    push('文字数偏り', `正解「${correct}」(${cl}字)が他(${ol.join(',')}字)より突出して短い`)
  }

  return res
}

// ファイル内の各要素を「4択問題」か「読解パッセージ」かで振り分け
function checkItem(item, file) {
  if (Array.isArray(item.choices)) return checkMCQ(item, file)
  // 読解（パッセージに小問がぶら下がる形）→ 小問を再帰的に見る
  if (Array.isArray(item.questions)) {
    return item.questions.flatMap(sub =>
      Array.isArray(sub.choices) ? checkMCQ({ ...sub, id: sub.subId ?? sub.id }, file) : []
    )
  }
  return []
}

// ---- 実行 ----
const files = collectJson(baseDir)
if (files.length === 0) {
  console.error(`問題ファイルが見つかりません: ${baseDir}`)
  process.exit(1)
}

let total = 0
const allFindings = []
const questionText = new Map() // 設問重複検出用

for (const file of files) {
  let data
  try {
    data = JSON.parse(readFileSync(file, 'utf-8'))
  } catch (e) {
    allFindings.push({ file, id: '-', type: '形式', detail: `JSONとして読めない: ${e.message}` })
    continue
  }
  const list = Array.isArray(data) ? data : []
  for (const item of list) {
    if (Array.isArray(item.choices) || Array.isArray(item.questions)) total++
    allFindings.push(...checkItem(item, file))
    // 設問重複
    const qt = (item.question ?? '').trim()
    if (qt) {
      if (!questionText.has(qt)) questionText.set(qt, [])
      questionText.get(qt).push(`${relative(baseDir, file)}:${item.id ?? '?'}`)
    }
  }
}

// 設問重複を findings に追加
for (const [qt, locs] of questionText) {
  if (locs.length > 1) {
    allFindings.push({ file: '複数ファイル', id: locs.join(' , '), type: '設問重複', detail: `同一設問: 「${qt.slice(0, 40)}…」` })
  }
}

// ファイル表示（設問重複など実ファイルでないものはそのまま表示）
const showFile = f => (String(f.file).endsWith('.json') ? (relative(baseDir, f.file) || f.file) : f.file)

// ---- レポート出力 ----
const byType = {}
for (const f of allFindings) byType[f.type] = (byType[f.type] ?? 0) + 1

console.log('='.repeat(60))
console.log(`点検対象: ${files.length}ファイル / ${total}問`)
console.log('='.repeat(60))
if (allFindings.length === 0) {
  console.log('構造的な問題は見つかりませんでした 🎉')
} else {
  console.log(`要確認: ${allFindings.length}件`)
  for (const [t, n] of Object.entries(byType)) console.log(`  [${t}] ${n}件`)
  console.log('-'.repeat(60))
  for (const f of allFindings) {
    console.log(`[${f.type}] ${f.id}  (${showFile(f)})`)
    console.log(`        ${f.detail}`)
  }
}

// CSV（ExcelでそのままひらけるようUTF-8 BOM付き）
const esc = s => `"${String(s).replace(/"/g, '""')}"`
const csv = '﻿' + ['種別,問題ID,ファイル,詳細']
  .concat(allFindings.map(f => [f.type, f.id, showFile(f), f.detail].map(esc).join(',')))
  .join('\r\n')
writeFileSync('点検レポート.csv', csv)
console.log('-'.repeat(60))
console.log('CSVを出力しました: 点検レポート.csv')
