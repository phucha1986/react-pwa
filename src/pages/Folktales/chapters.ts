import type { Lang } from '@/i18n/context';

/**
 * All ten chapters of "Dế Mèn Phiêu Lưu Ký" (Tô Hoài). Titles are the authentic
 * chapter headings from the Kim Đồng edition (verified against the archive.org
 * scan, toploigiai.vn and the Kim Đồng JSON corpus in thanglamhuu/thaz.github.io).
 *
 * The narration is the single Mỹ Duyên voice job (21f866c73554, 289.96s) — an
 * abridged reading. Each paragraph break was located as a silence gap in the WAV
 * (scripts/demen-boundaries.mjs), so `start`/`end` are the spoken boundaries in
 * seconds. Chapters the abridged reading does not cover have no `start`/`end`
 * and render without audio. Chapter 4 and Chapter 6 share narration paragraph
 * 10, split at the silence gap before "Một buổi chiều bờ đầm, tôi gặp Dế Trũi…"
 * (scripts/demen-split.mjs).
 *
 * Narration paragraph 11 ("Ngày cuối thu, tôi và Trũi lên đường. Ghép mấy lá
 * sen nhật thành chiếc bè… chờ đổi gió và rủi may") is the opening of Chapter 5,
 * not the farewell of Chapter 10 — Chapter 10's closing lines are not narrated.
 */
export type DemenChapter = {
  n: number;
  title: Record<Lang, string>;
  /** Seconds into the narration clip; absent when the chapter is not narrated. */
  start?: number;
  end?: number;
};

export const DE_MEN_CHAPTERS: DemenChapter[] = [
  {
    n: 1,
    title: {
      vi: 'Tôi sống độc lập từ thuở bé - Một sự ngỗ nghịch đáng ân hận suốt đời',
      en: 'I lived on my own from childhood - A mischievous act I regret for life',
    },
    start: 3.2,
    end: 134.25,
  },
  {
    n: 2,
    title: {
      vi: 'Cuộc phiêu lưu bất ngờ - Làm đồ chơi cho trẻ con mà không biết - Lại anh Xiến Tóc cho tôi một bài học',
      en: 'An unexpected adventure - Making toys for children unknowingly - Another lesson from Mr. Xiến Tóc',
    },
    start: 134.9,
    end: 174.3,
  },
  {
    n: 3,
    title: {
      vi: 'Thoát khỏi cái lồng tù - Giữa đường dẫu thấy bất bằng mà tha - Mẹ kính mến của con ơi!',
      en: 'Escaping the cage prison - Passing injustice on the road - Dear beloved mother!',
    },
    start: 174.95,
    end: 224.35,
  },
  {
    n: 4,
    title: {
      vi: 'Ông anh cả và ông anh hai của Mèn - Tri âm không đợi mà gặp',
      en: "Mèn's elder and younger brothers - A soulmate met without waiting",
    },
    start: 225.0,
    end: 237.95,
  },
  {
    n: 5,
    title: {
      vi: 'Một sự vô ý rất nguy hiểm - Địa thế và tình hình các xóm lầy lội - Vì lẽ gì mà Mèn và Trũi trốn đi được?',
      en: 'A careless act of great danger - The terrain of the muddy hamlets - Why could Mèn and Trũi escape?',
    },
    start: 261.15,
    end: 289.96,
  },
  {
    n: 6,
    title: {
      vi: 'Tranh hùng với võ sĩ Bọ Ngựa - Chánh phó thủ lĩnh Châu Chấu - Thề rằng sinh tử có nhau',
      en: 'Fighting the warrior Bọ Ngựa - Grasshopper chief and deputy - Sworn to share life and death',
    },
    start: 238.3,
    end: 260.5,
  },
  {
    n: 7,
    title: {
      vi: 'Tâm sự bác Xiến Tóc chán đời - cái cớ khiến cho Mèn lại lên đường',
      en: 'The weary confessions of Mr. Xiến Tóc - what sends Mèn off again',
    },
  },
  {
    n: 8,
    title: {
      vi: 'Mèn bị tù - Những sự xảy ra cho Mèn khi phải giam trong hầm kín của lão chim Trả - Xa nhau lại gặp nhau',
      en: 'Mèn is imprisoned - What happens to Mèn locked in old Bird Trả’s hidden pit - Parted, then met again',
    },
  },
  {
    n: 9,
    title: {
      vi: 'Lại một chuyện rủi ro với các bạn Kiến - Sự tức giận của mấy cô bé học trò - ai có công nhất?',
      en: 'Another mishap with the Ants - the anger of the young schoolgirls - who deserves the credit?',
    },
  },
  {
    n: 10,
    title: {
      vi: 'Mấy dòng tạm biệt của tập ký',
      en: 'Farewell lines of this journal',
    },
  },
];
