const fs = require('fs');
const path = require('path');

const decksDir = path.join(__dirname, 'decks');

if (!fs.existsSync(decksDir)) {
  console.error('❌ decks フォルダが見つかりません。リポジトリのルートで実行してください。');
  process.exit(1);
}

// decks/ 配下の全JSONファイルを取得
const files = fs.readdirSync(decksDir).filter(f => f.endsWith('.json'));

// ヘッダー行（スプレッドシートの1行目）
const rows = [
  ['カセットID', 'カセットタイトル', 'カードID', '単語 (front)', '読み/ピンイン', '解答 (back)', '小話/解説 (story)', '検索クエリ']
];

// セル内改行やダブルクォートを崩さないTSVエスケープ処理
function escapeCell(val) {
  if (val === undefined || val === null) return '';
  const str = String(val);
  if (str.includes('\n') || str.includes('"') || str.includes('\t') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

let totalCards = 0;

files.forEach(file => {
  const filePath = path.join(decksDir, file);
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const deckId = data.deckId || data.id || file.replace('.json', '');
    const title = data.title || '';
    const cards = data.cards || [];

    cards.forEach(card => {
      rows.push([
        escapeCell(deckId),
        escapeCell(title),
        escapeCell(card.id || ''),
        escapeCell(card.front || ''),
        escapeCell(card.reading || card.pinyin || ''),
        escapeCell(card.back || ''),
        escapeCell(card.story || ''),
        escapeCell(card.searchQuery || '')
      ]);
      totalCards++;
    });
  } catch (err) {
    console.error(`⚠️ ${file} の解析エラー:`, err.message);
  }
});

// TSVファイルとして保存
const outputPath = path.join(__dirname, 'all_cards_vocab.tsv');
fs.writeFileSync(outputPath, rows.map(r => r.join('\t')).join('\n'), 'utf8');

console.log(`\n✔ decks/ 配下の ${files.length} ファイルから【合計 ${totalCards} 問】を抽出しました！`);
console.log(`📁 出力ファイル: ${outputPath}`);