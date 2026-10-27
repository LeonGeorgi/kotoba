export interface FuriganaPart {
  text: string;
  reading?: string;
}

// Readings for the words and source titles used in these notes.
const readings: Record<string, string> = {
  女: 'め',
  娘: 'むすめ',
  女神: 'めがみ',
  生す: 'むす',
  姫: 'ひめ',
  媛: 'ひめ',
  日女: 'ひめ',
  日本大百科全書: 'にほんだいひゃっかぜんしょ',
  和名抄: 'わみょうしょう',
  宇津保物語: 'うつほものがたり',
  新しい: 'あたらしい',
  新たし: 'あらたし',
  新た: 'あらた',
  改めて: 'あらためて',
  改める: 'あらためる',
  改まる: 'あらたまる',
  改む: 'あらたむ',
  表す: 'あらわす',
  現す: 'あらわす',
  顕す: 'あらわす',
  著す: 'あらわす',
  現れる: 'あらわれる',
  表れる: 'あらわれる',
  顕れる: 'あらわれる',
  露: 'あらわ',
  顕: 'あらわ',
  岩波古語辞典: 'いわなみこごじてん',
  始まり: 'はじまり',
  気づく: 'きづく',
  後: 'あと',
  跡: 'あと',
  雨: 'あめ',
  知らす: 'しらす',
  知る: 'しる',
  記す: 'しるす',
  印: 'しるし',
  著しい: 'いちじるしい',
  著し: 'しるし',
  連用形: 'れんようけい',
  日本国語大辞典: 'にほんこくごだいじてん',
  大辞泉: 'だいじせん',
  全訳古語辞典: 'ぜんやくこごじてん',
  東京書籍: 'とうきょうしょせき',
  万葉集: 'まんようしゅう',
  日本書紀: 'にほんしょき',
  歌謡: 'かよう',
  古今和歌集: 'こきんわかしゅう',
  類聚国史: 'るいじゅこくし',
  源氏物語: 'げんじものがたり',
  仏足石歌: 'ぶっそくせきか',
  隆信集: 'たかのぶしゅう',
};

const wordPattern = new RegExp(
  Object.keys(readings)
    .sort((a, b) => b.length - a.length)
    .join('|'),
  'gu',
);
const kanjiPattern = /\p{Script=Han}/u;

export function addFurigana(text: string): FuriganaPart[] {
  const parts: FuriganaPart[] = [];
  let cursor = 0;
  for (const match of text.matchAll(wordPattern)) {
    const word = match[0];
    const start = match.index;
    const end = start + word.length;
    // Do not guess the reading of a word embedded in an unknown compound.
    if (
      (kanjiPattern.test(text[start - 1] ?? '') &&
        kanjiPattern.test(word[0])) ||
      (kanjiPattern.test(word.at(-1)!) && kanjiPattern.test(text[end] ?? ''))
    ) {
      continue;
    }
    if (start > cursor) parts.push({ text: text.slice(cursor, start) });
    const okurigana = word.match(/\p{Script=Hiragana}+$/u)?.[0] ?? '';
    parts.push({
      text: word.slice(0, word.length - okurigana.length),
      reading: readings[word].slice(
        0,
        readings[word].length - okurigana.length,
      ),
    });
    if (okurigana) parts.push({ text: okurigana });
    cursor = end;
  }
  if (cursor < text.length) parts.push({ text: text.slice(cursor) });
  return parts;
}
