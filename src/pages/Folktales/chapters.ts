import type { Lang } from '@/i18n/context';

/**
 * All ten chapters of "Dế Mèn Phiêu Lưu Ký" (Tô Hoài). Titles are the authentic
 * chapter headings from the Kim Đồng edition (verified against the archive.org
 * scan, toploigiai.vn and the Kim Đồng JSON corpus in thanglamhuu/thaz.github.io).
 *
 * The narration is the single "Giong vo" clone voice job (5c8c54989504,
 * 377.4s) — an abridged reading. Each paragraph start was located with ASR
 * word timestamps (scripts/demen-asr-boundaries.py), so `start`/`end` are the
 * spoken boundaries in seconds. Chapters the abridged reading does not cover
 * have no `start`/`end` and render without audio. Chapter 4 and Chapter 6
 * share narration paragraph 10, split before "Một buổi chiều bờ đầm, tôi gặp
 * Dế Trũi…".
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
    start: 4.52,
    end: 177.36,
  },
  {
    n: 2,
    title: {
      vi: 'Cuộc phiêu lưu bất ngờ - Làm đồ chơi cho trẻ con mà không biết - Lại anh Xiến Tóc cho tôi một bài học',
      en: 'An unexpected adventure - Making toys for children unknowingly - Another lesson from Mr. Xiến Tóc',
    },
    start: 177.36,
    end: 230.26,
  },
  {
    n: 3,
    title: {
      vi: 'Thoát khỏi cái lồng tù - Giữa đường dẫu thấy bất bằng mà tha - Mẹ kính mến của con ơi!',
      en: 'Escaping the cage prison - Passing injustice on the road - Dear beloved mother!',
    },
    start: 230.26,
    end: 292.74,
  },
  {
    n: 4,
    title: {
      vi: 'Ông anh cả và ông anh hai của Mèn - Tri âm không đợi mà gặp',
      en: "Mèn's elder and younger brothers - A soulmate met without waiting",
    },
    start: 292.74,
    end: 310.42,
  },
  {
    n: 5,
    title: {
      vi: 'Một sự vô ý rất nguy hiểm - Địa thế và tình hình các xóm lầy lội - Vì lẽ gì mà Mèn và Trũi trốn đi được?',
      en: 'A careless act of great danger - The terrain of the muddy hamlets - Why could Mèn and Trũi escape?',
    },
    start: 338.68,
    end: 377.4,
  },
  {
    n: 6,
    title: {
      vi: 'Tranh hùng với võ sĩ Bọ Ngựa - Chánh phó thủ lĩnh Châu Chấu - Thề rằng sinh tử có nhau',
      en: 'Fighting the warrior Bọ Ngựa - Grasshopper chief and deputy - Sworn to share life and death',
    },
    start: 310.42,
    end: 338.68,
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
