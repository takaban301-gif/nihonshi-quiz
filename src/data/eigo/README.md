# 英語・多義語データ仕様

レビュー・追加時はこの仕様を前提にしてください。問題はこのデータからアプリ側（`src/eigo/eigoEngine.js`）が自動生成します。

## フィールド
| 階層 | フィールド | 内容 |
|---|---|---|
| word | id / word | 見出し語 |
| word | level | 1=基礎 2=標準 3=発展 |
| word | core | コアイメージのみ（注意書き・発音は入れない） |
| word | pron | 品詞で発音が変わる語だけ |
| word | caution | 和製英語とのズレなどの注意 |
| word | distractors | 共通語補充用の誤答3語（下記） |
| sense | id | `word_連番`（1始まり・欠番なし） |
| sense | pos | n / v / adj / adv / prep / phr |
| sense | ja | 訳。先頭の（〜を）は出題時に除去される |
| sense | note | 決まった形（英語のみ。例 `account for`） |
| sense | homograph | 語源が別の同綴語なら true |
| sense | ex | 例文。対象語を `[ ]` で1か所だけ囲む |

## pos の方針
- `phr` は、句全体が別の品詞として働くもの（at any rate＝副詞、with respect to＝前置詞、make sense＝動詞 など）。
- a lot of / a great deal of / a touch of のように、その語自体が名詞「量」として働くものは `n` のまま。

## 出題形式と distractors の考え方
1. **文脈で語義選択**：例文1つ（下線付き）→ 和訳4択。誤答は同じ語の別語義（不足分は他の語の同品詞の語義）。distractors は使わない。
2. **共通語補充**：原形で使われた例文を**語義が異なるものから3文同時に**提示し、3文すべての空所に入る1語を選ぶ。選択肢＝正解語＋distractors 3語。
   - distractors は「どれか1文には入るが、3文すべてには入らない語」を**意図的に**選ぶ（入試の共通語補充と同じ作り）。例：book の reserve は「予約」の文には入るが「本」の文には入らない。
   - NG なのは、ある distractor が選ばれうる3文の組み合わせの**すべての文**に入ってしまう場合のみ。

## 検証
`node check_eigo.mjs`
