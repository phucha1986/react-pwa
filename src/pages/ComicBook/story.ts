import type { Lang } from '@/i18n/context';

/**
 * An original, kid-friendly comic adaptation inspired by the characters of
 * "Dế Mèn phiêu lưu ký" (Tô Hoài). Every caption and line of dialogue below
 * is freshly written for this app — it is not a reproduction of the book.
 */

export type SceneId =
  | 'cave'
  | 'toad'
  | 'flood'
  | 'snail'
  | 'flying'
  | 'night'
  | 'spider'
  | 'storm'
  | 'after'
  | 'reunion'
  | 'lesson'
  | 'home';

export type Bubble = {
  who: string;
  /** Bubble anchor in panel coordinates (0-400 x, 0-300 y). */
  x: number;
  y: number;
  en: string;
  vi: string;
};

export type ComicPage = {
  id: string;
  scene: SceneId;
  caption: Record<Lang, string>;
  bubbles: Bubble[];
};

export const COMIC_PAGES: ComicPage[] = [
  {
    id: 'p01',
    scene: 'cave',
    caption: {
      en: 'Deep in the grass, in a small earthen cave, lived a young cricket named Dế Mèn. His wings shone and his legs were strong.',
      vi: 'Sâu trong đồng cỏ, trong một căn hang đất nhỏ, có chú dế tên Dế Mèn. Cánh chú bóng lộn, chân chú rất khỏe.',
    },
    bubbles: [
      {
        who: 'Dế Mèn',
        x: 250,
        y: 120,
        en: 'Today I walk to the end of the field!',
        vi: 'Hôm nay mình sẽ đi đến cuối đồng cỏ!',
      },
    ],
  },
  {
    id: 'p02',
    scene: 'toad',
    caption: {
      en: 'Outside the cave he met Cóc Ná, a round grey toad sitting on a flat stone.',
      vi: 'Ngoài hang, chú gặp Cóc Ná, một chú cóc tròn màu xám đang ngồi trên phiến đá.',
    },
    bubbles: [
      {
        who: 'Cóc Ná',
        x: 130,
        y: 90,
        en: 'Careful — the field is big and the rain is coming.',
        vi: 'Cẩn thận nhé — đồng cỏ rộng và mưa sắp tới đó.',
      },
    ],
  },
  {
    id: 'p03',
    scene: 'flood',
    caption: {
      en: 'Rain filled the low ground. Gọng Vó the water strider glided across the puddle on six long legs.',
      vi: 'Mưa làm ngập chỗ đất trũng. Gọng Vó lướt trên mặt vũng nước bằng sáu cái chân dài.',
    },
    bubbles: [
      {
        who: 'Gọng Vó',
        x: 280,
        y: 100,
        en: 'Climb onto a leaf — I can slide over water.',
        vi: 'Leo lên chiếc lá nhé — mình trượt trên nước được.',
      },
    ],
  },
  {
    id: 'p04',
    scene: 'snail',
    caption: {
      en: 'On a wet leaf they found Sên the snail, carrying his house on his back.',
      vi: 'Trên chiếc lá ướt, họ gặp Sên ốc sên, đang mang cả ngôi nhà trên lưng.',
    },
    bubbles: [
      {
        who: 'Sên',
        x: 160,
        y: 100,
        en: 'Slow is not the same as scared.',
        vi: 'Đi chậm không giống như sợ hãi.',
      },
    ],
  },
  {
    id: 'p05',
    scene: 'flying',
    caption: {
      en: 'A dragonfly showed Dế Mèn how to spread his wings and lift into the air.',
      vi: 'Một chú chuồn chuồn chỉ cho Dế Mèn cách xoè cánh và bay lên không trung.',
    },
    bubbles: [
      {
        who: 'Chuồn Chuồn',
        x: 250,
        y: 80,
        en: 'Push down, then glide. You are a flyer, not only a walker.',
        vi: 'Đạp xuống rồi lướt. Bạn là người biết bay, không chỉ biết đi.',
      },
    ],
  },
  {
    id: 'p06',
    scene: 'night',
    caption: {
      en: 'Night came. The field went quiet and the stars looked like little lamps.',
      vi: 'Ban đêm đến. Đồng cỏ lặng đi, các vì sao trông như những chiếc đèn nhỏ.',
    },
    bubbles: [
      {
        who: 'Dế Mèn',
        x: 200,
        y: 110,
        en: 'The world is much bigger than my cave.',
        vi: 'Thế giới rộng hơn căn hang của mình nhiều.',
      },
    ],
  },
  {
    id: 'p07',
    scene: 'spider',
    caption: {
      en: 'In the dark corner of an old wall, a spider waited. Dế Mèn stopped, breathed, and walked around it.',
      vi: 'Trong góc tối của bức tường cũ, một chú nhện đang chờ. Dế Mèn dừng lại, hít thở, rồi đi vòng qua.',
    },
    bubbles: [
      {
        who: 'Dế Mèn',
        x: 130,
        y: 190,
        en: 'Brave does not mean rushing in.',
        vi: 'Dũng cảm không nghĩa là lao vội vào.',
      },
    ],
  },
  {
    id: 'p08',
    scene: 'storm',
    caption: {
      en: 'The storm returned. Everyone hid under one big leaf, sharing a single dry corner.',
      vi: 'Cơn mưa quay lại. Tất cả trú dưới một chiếc lá lớn, chia nhau một góc khô.',
    },
    bubbles: [
      {
        who: 'Cóc Ná',
        x: 200,
        y: 90,
        en: 'A friend is someone you share shelter with.',
        vi: 'Bạn bè là người mình cùng trú mưa với.',
      },
    ],
  },
  {
    id: 'p09',
    scene: 'after',
    caption: {
      en: 'When the rain stopped, the grass smelled clean and the field shone green.',
      vi: 'Khi mưa tạnh, cỏ thơm sạch và đồng cỏ sáng lên màu xanh.',
    },
    bubbles: [
      {
        who: 'Sên',
        x: 170,
        y: 110,
        en: 'Every storm leaves the field a little kinder.',
        vi: 'Mỗi cơn mưa để lại đồng cỏ dễ chịu hơn một chút.',
      },
    ],
  },
  {
    id: 'p10',
    scene: 'reunion',
    caption: {
      en: 'A young cricket named Dế Trọi ran up to them, glad to find his big brother.',
      vi: 'Một chú dế nhỏ tên Dế Trọi chạy tới, vui vì tìm được người anh lớn.',
    },
    bubbles: [
      {
        who: 'Dế Trọi',
        x: 250,
        y: 100,
        en: 'Tell me how the field looks from the sky!',
        vi: 'Kể cho mình nghe đồng cỏ nhìn từ trên trời như thế nào!',
      },
    ],
  },
  {
    id: 'p11',
    scene: 'lesson',
    caption: {
      en: 'Dế Mèn understood the lesson of the field: strength is for helping, not for scaring.',
      vi: 'Dế Mèn hiểu bài học của đồng cỏ: sức mạnh là để giúp đỡ, không phải để dọa.',
    },
    bubbles: [
      {
        who: 'Dế Mèn',
        x: 200,
        y: 80,
        en: 'I promise to use my strong legs for my friends.',
        vi: 'Mình hứa sẽ dùng đôi chân khỏe vì bạn bè.',
      },
    ],
  },
  {
    id: 'p12',
    scene: 'home',
    caption: {
      en: 'At the end of the field Dế Mèn built a new cave — big enough for every friend to visit.',
      vi: 'Ở cuối đồng cỏ, Dế Mèn xây căn hang mới — đủ rộng để mọi người bạn đến chơi.',
    },
    bubbles: [
      {
        who: 'Dế Mèn',
        x: 210,
        y: 100,
        en: 'An adventure is best when there is a home to come back to.',
        vi: 'Cuộc phiêu lưu tuyệt nhất khi có một nhà để trở về.',
      },
    ],
  },
];

/** Plain text for read-aloud: caption first, then every line of dialogue. */
export function pageText(page: ComicPage, lang: Lang): string {
  return [page.caption[lang], ...page.bubbles.map((b) => `${b.who}: ${b[lang]}`)].join(' ');
}
