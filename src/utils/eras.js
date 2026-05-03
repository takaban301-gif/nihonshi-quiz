// 時代の定義（順番・表示名・ファイルキー）
export const ERAS = [
  { key: 'jomon',      label: '縄文時代' },
  { key: 'yayoi',      label: '弥生時代' },
  { key: 'kofun',      label: '古墳時代' },
  { key: 'asuka',      label: '飛鳥時代' },
  { key: 'nara',       label: '奈良時代' },
  { key: 'heian',      label: '平安時代' },
  { key: 'kamakura',   label: '鎌倉時代' },
  { key: 'nanbokucho', label: '南北朝時代' },
  { key: 'muromachi',  label: '室町時代' },
  { key: 'sengoku',    label: '戦国時代' },
  { key: 'azuchi',     label: '安土桃山時代' },
  { key: 'edo_early',  label: '江戸時代（前期）' },
  { key: 'edo_mid',    label: '江戸時代（中後期）' },
  { key: 'bakumatsu',  label: '幕末' },
  { key: 'meiji',      label: '明治時代' },
  { key: 'taisho',     label: '大正時代' },
  { key: 'showa',      label: '昭和時代' },
  { key: 'heisei',     label: '平成〜現代' },
]

export function getEraLabel(key) {
  return ERAS.find(e => e.key === key)?.label ?? key
}
