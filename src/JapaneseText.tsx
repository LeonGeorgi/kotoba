import { addFurigana } from './furigana';

export function Furigana({ text }: { text: string }) {
  return addFurigana(text).map((part, index) =>
    part.reading ? (
      <ruby key={index} lang="ja">
        {part.text}
        <rp>(</rp>
        <rt>{part.reading}</rt>
        <rp>)</rp>
      </ruby>
    ) : (
      part.text
    ),
  );
}
