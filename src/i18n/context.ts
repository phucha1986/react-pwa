import { createContext } from 'react';

export type Lang = 'en' | 'vi';

export interface Dict {
  question: (word: string) => string;
  greatJob: (word: string) => string;
  animals: Record<string, string>;
}

export const translations: Record<Lang, Dict> = {
  en: {
    question: (word) => `Which one is the ${word}?`,
    greatJob: (word) => `Great Job! It's ${word}!`,
    animals: {
      lion: 'Lion',
      elephant: 'Elephant',
      monkey: 'Monkey',
      giraffe: 'Giraffe',
      parrot: 'Parrot',
      turtle: 'Turtle',
      dog: 'Dog',
      cat: 'Cat',
      cow: 'Cow',
      horse: 'Horse',
      goat: 'Goat',
      whale: 'Whale',
      tiger: 'Tiger',
      rabbit: 'Rabbit',
      octopus: 'Octopus',
      zebra: 'Zebra',
      eagle: 'Eagle',
      crocodile: 'Crocodile',
      penguin: 'Penguin',
      ostrich: 'Ostrich',
      seal: 'Seal',
      flamingo: 'Flamingo',
      leopard: 'Leopard',
      ant: 'Ant',
      squirrel: 'Squirrel',
      frog: 'Frog',
      hummingbird: 'Hummingbird',
      orangutan: 'Orangutan',
      yak: 'Yak',
      reindeer: 'Reindeer',
    },
  },
  vi: {
    question: (word) => `Con nào là ${word}?`,
    greatJob: (word) => `Giỏi lắm! Đó là ${word}!`,
    animals: {
      lion: 'Sư tử',
      elephant: 'Voi',
      monkey: 'Khỉ',
      giraffe: 'Hươu cao cổ',
      parrot: 'Vẹt',
      turtle: 'Rùa',
      dog: 'Chó',
      cat: 'Mèo',
      cow: 'Bò',
      horse: 'Ngựa',
      goat: 'Dê',
      whale: 'Cá voi',
      tiger: 'Hổ',
      rabbit: 'Thỏ',
      octopus: 'Mực tám chân',
      zebra: 'Ngựa vằn',
      eagle: 'Điêu cẩu',
      crocodile: 'Cá sấu',
      penguin: 'Chim cánh cụt',
      ostrich: 'Chim đà điểu',
      seal: 'Hải cẩu',
      flamingo: 'Chim hồng hạc',
      leopard: 'Báo',
      ant: 'Kiến',
      squirrel: 'Sóc',
      frog: 'Ếch',
      hummingbird: 'Chim ruồi',
      orangutan: 'Khỉ người',
      yak: 'Trâu Tây Tạng',
      reindeer: 'Hươu sao',
    },
  },
};

export interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Dict;
}

export const LanguageContext = createContext<LanguageContextValue | null>(null);
