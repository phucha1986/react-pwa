import type { Lang } from '@/i18n/context';

/**
 * Chapters of "Dế Mèn Phiêu Lưu Ký" (Tô Hoài) as narrated by the Mỹ Duyên
 * voice job (21f866c73554, 289.96s). The narration is one audio clip; each
 * paragraph break was located as a silence gap in the WAV (scripts/
 * demen-boundaries.mjs), so `start`/`end` are the spoken boundaries in seconds.
 *
 * Titles are the authentic chapter headings from the Kim Đồng edition (verified
 * against the archive.org scan and toploigiai.vn). Only the chapters covered by
 * the narration have audio; `n` is the book chapter number, so the buttons are
 * Chương 1, 2, 3, 4, 6, 10. Chapter 4 and Chapter 6 share narration paragraph
 * 9, split at the silence gap before "Một buổi chiều bờ đầm, tôi gặp Dế Trũi…"
 * (scripts/demen-split.mjs).
 */
export type DemenChapter = {
  n: number;
  title: Record<Lang, string>;
  start: number;
  end: number;
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
    n: 6,
    title: {
      vi: 'Tranh hùng với võ sĩ Bọ Ngựa - Chánh phó thủ lĩnh Châu Chấu - Thề rằng sinh tử có nhau',
      en: 'Fighting the warrior Bọ Ngựa - Grasshopper chief and deputy - Sworn to share life and death',
    },
    start: 238.3,
    end: 260.5,
  },
  {
    n: 10,
    title: {
      vi: 'Mấy dòng tạm biệt của tập ký',
      en: 'Farewell lines of this journal',
    },
    start: 261.15,
    end: 289.96,
  },
];
