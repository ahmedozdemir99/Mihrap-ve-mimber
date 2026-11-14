import { MEMORIZATION_SURAHS } from './memorization';
import { PRAYER_LESSONS } from './memorizationPrayers';

const surahIds = (numbers: number[]) => numbers.flatMap((number) =>
  MEMORIZATION_SURAHS.find((surah) => surah.number === number)?.lessons.map((lesson) => lesson.id) ?? [],
);
const prayerIds = (group: typeof PRAYER_LESSONS[number]['group']) =>
  PRAYER_LESSONS.filter((lesson) => lesson.group === group).map((lesson) => lesson.id);

const firstDhikr = ['uyku', 'uyanma', 'yemek-baslangic', 'yemek-sonu', 'tesbih', 'iki-tesbih', 'gunluk-istigfar', 'havkale'];
const firstSurahs = [1, 114, 113, 112, 111, 110, 109, 108];
const remainingShortSurahs = MEMORIZATION_SURAHS
  .filter((surah) => surah.number >= 93 && !firstSurahs.includes(surah.number))
  .map((surah) => surah.number);

export const JOURNEY_STAGES = [
  { title: 'Fâtiha ile başlangıç', description: 'Fâtiha ve kısa sûrelerle okuma, gizleme ve tekrar düzenini kur.', lessons: surahIds(firstSurahs) },
  { title: 'Güne eşlik eden zikirler', description: 'Uyku, uyanma ve yemek dualarıyla kısa tesbihleri çalış.', lessons: firstDhikr },
  { title: 'Duhâ’ya doğru', description: 'Kalan kısa sûreleri sırayla tamamla.', lessons: surahIds(remainingShortSurahs) },
  { title: 'Günlük dua alışkanlığı', description: 'Abdest, namaz, sabah ve akşam, yolculuk ve günlük hayattan dualar.', lessons: prayerIds('daily').filter((id) => !firstDhikr.includes(id)) },
  { title: 'Amme, Tebâreke ve Cuma', description: 'Nebe, Mülk ve Cuma sûrelerini bölüm bölüm çalış.', lessons: surahIds([78, 67, 62]) },
  { title: 'Kur’an’dan dualar', description: 'Peygamber dualarını ve Kur’an’daki diğer niyazları anlamlarıyla çalış.', lessons: [...prayerIds('prophets'), ...prayerIds('quran')] },
  { title: 'Hadis duaları ve salavatlar', description: 'Hadislerden duaları, cenaze dualarını ve salavatları gözden geçir.', lessons: [...prayerIds('hadith'), ...prayerIds('salawat')] },
  { title: 'Yâsîn ve Kehf', description: 'İki uzun sûreyi küçük bölümlerle tamamla.', lessons: surahIds([36, 18]) },
  { title: 'Hatim duası', description: 'Mushaf sonlarında yer alan uzun duayı dokuz çalışma sayfasında öğren.', lessons: prayerIds('hatim') },
];

export const JOURNEY_REVIEW_LESSONS = ['1:1-7', 'iki-tesbih', 'hatim-sayfa-9'];
export const reviewCompletionId = (id: string) => `ezber-final-tekrar:${id}`;
export const LEGACY_HATIM_ID = 'hatim';
export const JOURNEY_FINAL_ID = 'ezber-rotasi-final';

export function journeyStageProgress(completed: readonly string[]) {
  const done = new Set(completed);
  return JOURNEY_STAGES.map((stage) => stage.lessons.filter((id) => done.has(id)).length);
}

export function firstIncompleteStage(progress: number[]) {
  return JOURNEY_STAGES.findIndex((stage, index) => progress[index] < stage.lessons.length);
}
