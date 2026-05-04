// 教科定義
export const SUBJECTS = {
  history: {
    label: '日本史',
    icon: '📜',
  },
  kobun: {
    label: '古文',
    icon: '🖌️',
  },
  gendaibun: {
    label: '現代文',
    icon: '📝',
  },
  kanbun: {
    label: '漢文',
    icon: '🀄',
  },
}

// 古文カテゴリ定義
export const KOBUN_CATEGORIES = [
  { key: 'tango',  label: '古語・単語',         defaultFormat: '4択' },
  { key: 'bunpo',  label: '文法（助動詞・助詞）', defaultFormat: '4択' },
  { key: 'keigo',  label: '敬語',               defaultFormat: '4択' },
  { key: 'dokkai', label: '読解',               defaultFormat: '読解' },
  { key: 'kusho',  label: '空所補充',           defaultFormat: '空所補充' },
]

// 古文の出題形式
export const KOBUN_FORMATS = ['4択', '読解', '空所補充']

// 現代文カテゴリ定義
export const GENDAIBUN_CATEGORIES = [
  { key: 'kanji_yomi',   label: '漢字・読み',          defaultFormat: '4択' },
  { key: 'kanji_kaki',   label: '漢字・書き取り',       defaultFormat: '4択' },
  { key: 'kanji_goji',   label: '漢字・誤字訂正',       defaultFormat: '4択' },
  { key: 'yojijukugo',   label: '四字熟語・慣用句',     defaultFormat: '4択' },
  { key: 'keyword',      label: '現代文キーワード',     defaultFormat: '4択' },
  { key: 'bungakushi',   label: '文学史',               defaultFormat: '4択' },
  { key: 'setsuzoku',    label: '接続語補充',           defaultFormat: '空所補充' },
  { key: 'hyoron',       label: '評論読解',             defaultFormat: '読解' },
  { key: 'shosetsu',     label: '小説読解',             defaultFormat: '読解' },
]

// 漢文カテゴリ定義
export const KANBUN_CATEGORIES = [
  { key: 'goi',     label: '重要語・多義語',     defaultFormat: '4択' },
  { key: 'kuhou',   label: '句法・句形',         defaultFormat: '4択' },
  { key: 'kundoku', label: '返り点・書き下し',   defaultFormat: '4択' },
  { key: 'kanshi',  label: '漢詩',               defaultFormat: '4択' },
  { key: 'shisou',  label: '思想・故事',         defaultFormat: '4択' },
  { key: 'kusho',   label: '空所補充',           defaultFormat: '空所補充' },
  { key: 'dokkai',  label: '読解',               defaultFormat: '読解' },
]

// 漢文の出題形式
export const KANBUN_FORMATS = ['4択', '読解', '空所補充']
