import type { Lang } from '@/i18n/context';

/** Built-in VieNeu storyteller voice used for the narrated stories. */
export const NARRATOR_PRESET = 'Mỹ Duyên';

export type Folktale = {
  id: string;
  emoji: string;
  /** Tile background, same palette as the Animal game. */
  bg: string;
  alt: Record<Lang, string>;
  /** Text marker identifying this story's Mỹ Duyên narration job. */
  marker?: string;
};

export const STORIES: Folktale[] = [
  {
    id: 'bamboo',
    emoji: '🎋',
    bg: '#6BCB77',
    alt: { vi: 'Cây tre trăm đốt', en: 'The bamboo with a hundred nodes' },
    marker: 'tre trăm đốt',
  },
  {
    id: 'thanh-giong',
    emoji: '🐎',
    bg: '#FFD93D',
    alt: { vi: 'Thánh Gióng', en: 'Saint Gióng' },
    marker: 'Thánh Gióng',
  },
  { id: 'tam-cam', emoji: '🧚', bg: '#FFADAD', alt: { vi: 'Tấm Cám', en: 'Tấm and Cám' } },
  { id: 'thach-sanh', emoji: '⚔️', bg: '#4D96FF', alt: { vi: 'Thạch Sanh', en: 'Thạch Sanh' } },
  {
    id: 'trau-cau',
    emoji: '🍃',
    bg: '#A0E7E5',
    alt: { vi: 'Sự tích trầu cau', en: 'The betel and areca story' },
  },
  {
    id: 'rong-tien',
    emoji: '🐉',
    bg: '#4D96FF',
    alt: { vi: 'Con rồng cháu tiên', en: 'Descendants of the Dragon and Fairy' },
  },
  {
    id: 'son-tinh',
    emoji: '🌊',
    bg: '#FF6B6B',
    alt: { vi: 'Sơn Tinh Thủy Tinh', en: 'Mountain Spirit and Water Spirit' },
  },
  {
    id: 'ho-guom',
    emoji: '🐢',
    bg: '#A0E7E5',
    alt: { vi: 'Sự tích hồ Gươm', en: 'The story of Sword Lake' },
  },
  {
    id: 'dua-hau',
    emoji: '🍉',
    bg: '#FF6B6B',
    alt: { vi: 'Sự tích dưa hấu', en: 'The story of the watermelon' },
  },
];
