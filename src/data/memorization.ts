import quranText from './memorization-uthmani.txt?raw';

const SURAHS = [
  [1, 'Fâtiha'],
  [114, 'Nâs'], [113, 'Felak'], [112, 'İhlâs'], [111, 'Tebbet (Mesed)'],
  [110, 'Nasr'], [109, 'Kâfirûn'], [108, 'Kevser'], [107, 'Mâûn'],
  [106, 'Kureyş'], [105, 'Fîl'], [104, 'Hümeze'], [103, 'Asr'],
  [102, 'Tekâsür'], [101, 'Kâria'], [100, 'Âdiyât'], [99, 'Zilzâl'],
  [98, 'Beyyine'], [97, 'Kadir (İnnâ enzelnâ)'], [96, 'Alak'],
  [95, 'Tîn'], [94, 'İnşirâh (Şerh)'], [93, 'Duhâ (Vedduhâ)'],
  [78, 'Nebe (Amme)'], [67, 'Mülk (Tebâreke)'], [36, 'Yâsîn'],
  [62, 'Cuma (Cum‘a)'], [18, 'Kehf'],
] as const;

type Verse = { number: number; text: string };
type StudyLine = Verse[];

const versesBySurah = new Map<number, Verse[]>();
for (const row of quranText.split(/\r?\n/)) {
  const match = /^(\d+)\|(\d+)\|(.+)$/.exec(row);
  if (!match) continue;
  const surahNumber = Number(match[1]);
  const verses = versesBySurah.get(surahNumber) ?? [];
  verses.push({ number: Number(match[2]), text: match[3] });
  versesBySurah.set(surahNumber, verses);
}

function groupStudyLines(verses: Verse[], maxLetters = 58): StudyLine[][] {
  const lines: StudyLine[] = [];
  let line: StudyLine = [];
  let letters = 0;

  for (const verse of verses) {
    const verseLetters = verse.text.replace(/\p{Mark}/gu, '').length;
    if (line.length && (letters + verseLetters > maxLetters || line.length === 3)) {
      lines.push(line);
      line = [];
      letters = 0;
    }
    line.push(verse);
    letters += verseLetters + 1;
  }
  if (line.length) lines.push(line);

  // Balance long surahs so the last lesson is also at least eight study lines.
  const lessonCount = Math.ceil(lines.length / 10);
  return Array.from({ length: lessonCount }, (_, index) =>
    lines.slice(Math.round(index * lines.length / lessonCount), Math.round((index + 1) * lines.length / lessonCount))
  );
}

export const MEMORIZATION_SURAHS = SURAHS.map(([number, name]) => {
  const verses = versesBySurah.get(number) ?? [];
  const lessons = number === 1
    ? [verses.map((verse) => [verse])]
    : groupStudyLines(verses, number === 62 ? 95 : undefined);
  return {
    number,
    name,
    verseCount: verses.length,
    lessons: lessons.map((lines) => {
      const first = lines[0][0].number;
      const lastLine = lines[lines.length - 1];
      const last = lastLine[lastLine.length - 1].number;
      return { id: `${number}:${first}-${last}`, first, last, lines };
    }),
  };
});

export const MEMORIZATION_LESSON_IDS = new Set(
  MEMORIZATION_SURAHS.flatMap((surah) => surah.lessons.map((lesson) => lesson.id)),
);

export function quranPassage(surah: number, first: number, last = first, startsWith?: string) {
  return (versesBySurah.get(surah) ?? [])
    .filter((verse) => verse.number >= first && verse.number <= last)
    .map((verse) => {
      if (verse.number !== first || !startsWith) return verse.text;
      const start = verse.text.indexOf(startsWith);
      if (start < 0) throw new Error(`Missing Qur’an passage: ${surah}:${first}`);
      return verse.text.slice(start);
    });
}
