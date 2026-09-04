import { createContext } from 'react';

export type Lang = 'en' | 'vi';

export interface Dict {
  question: (word: string) => string;
  greatJob: (word: string) => string;
  animalsTitle: string;
  animals: Record<string, string>;
  flappyTitle: string;
  flappyTapToStart: string;
  flappyScore: string;
  flappyBest: string;
  flappyGameOver: string;
  flappyPlayAgain: string;
  memoryTitle: string;
  memoryHint: string;
  memoryPairs: string;
  memoryMoves: string;
  memoryWin: string;
  memoryPlayAgain: string;
  whackTitle: string;
  whackHint: string;
  whackScore: string;
  whackTime: string;
  whackGameOver: string;
  whackPlayAgain: string;
  pianoTitle: string;
  pianoTapToStart: string;
  pianoScore: string;
  pianoBest: string;
  pianoAutoPlay: string;
  pianoHint: string;
  pianoRotate: string;
  pianoChooseSong: string;
  songHappyBirthday: string;
  songTwinkleTwinkle: string;
  songMaryLamb: string;
  songJingleBells: string;
  coloringTitle: string;
  coloringChoose: string;
  coloringHint: string;
  coloringReset: string;
  coloringComplete: string;
  coloringBack: string;
  coloringProgress: (done: number, total: number) => string;
  brushSmall: string;
  brushMedium: string;
  brushLarge: string;
  coloringHouse: string;
  coloringFish: string;
  coloringFlower: string;
  coloringCar: string;
  coloringButterfly: string;
  coloringBalloon: string;
  coloringIceCream: string;
  coloringRocket: string;
  coloringTurtle: string;
  coloringBoat: string;
  candyTitle: string;
  candyHint: string;
  candyScore: string;
  candyMoves: string;
  candyPlay: string;
  candyGameOver: string;
  candyPlayAgain: string;
}

export const translations: Record<Lang, Dict> = {
  en: {
    question: (word) => `Which one is the ${word}?`,
    greatJob: (word) => `Great Job! It's ${word}!`,
    animalsTitle: 'Animals',
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
    flappyTitle: 'Flappy Bird',
    flappyTapToStart: 'Tap or press Space to fly',
    flappyScore: 'Score',
    flappyBest: 'Best',
    flappyGameOver: 'Game Over',
    flappyPlayAgain: 'Play Again',
    memoryTitle: 'Animal Memory',
    memoryHint: 'Tap two cards to find matching animal pairs!',
    memoryPairs: 'Pairs',
    memoryMoves: 'Moves',
    memoryWin: 'You found them all! 🎉',
    memoryPlayAgain: 'Play Again',
    whackTitle: 'Whack-a-Mole',
    whackHint: 'Tap the animals as they pop out of the holes!',
    whackScore: 'Score',
    whackTime: 'Time',
    whackGameOver: 'Game Over',
    whackPlayAgain: 'Play',
    pianoTitle: 'Piano Game',
    pianoTapToStart: 'Tap to Play',
    pianoScore: 'Score',
    pianoBest: 'Best',
    pianoAutoPlay: 'Auto play the song',
    pianoHint: 'Tap the key when the note lands on the glowing line!',
    pianoRotate: 'Please rotate your device to landscape',
    pianoChooseSong: 'Choose a song',
    songHappyBirthday: 'Happy Birthday',
    songTwinkleTwinkle: 'Twinkle Twinkle',
    songMaryLamb: 'Mary Had a Little Lamb',
    songJingleBells: 'Jingle Bells',
    coloringTitle: 'Coloring',
    coloringChoose: 'Pick a picture to color',
    coloringHint: 'Pick a color, then drag over a part of the picture to paint it',
    coloringReset: 'Start over',
    coloringComplete: 'Great job! You finished it! 🎉',
    coloringBack: 'Back',
    coloringProgress: (done: number, total: number) => `${done}/${total}`,
    brushSmall: 'Small brush',
    brushMedium: 'Medium brush',
    brushLarge: 'Large brush',
    coloringHouse: 'House',
    coloringFish: 'Fish',
    coloringFlower: 'Flower',
    coloringCar: 'Car',
    coloringButterfly: 'Butterfly',
    coloringBalloon: 'Balloon',
    coloringIceCream: 'Ice cream',
    coloringRocket: 'Rocket',
    coloringTurtle: 'Turtle',
    coloringBoat: 'Boat',
    candyTitle: 'Candy Crush',
    candyHint: 'Swap two adjacent candies to match 3 or more of a kind!',
    candyScore: 'Score',
    candyMoves: 'Moves',
    candyPlay: 'Play',
    candyGameOver: 'Game Over',
    candyPlayAgain: 'Play Again',
  },
  vi: {
    question: (word) => `Con nào là ${word}?`,
    greatJob: (word) => `Giỏi lắm! Đó là ${word}!`,
    animalsTitle: 'Động vật',
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
    flappyTitle: 'Flappy Bird',
    flappyTapToStart: 'Chạm hoặc nhấn Space để bay',
    flappyScore: 'Điểm',
    flappyBest: 'Kỷ lục',
    flappyGameOver: 'Hết cuộc chơi',
    flappyPlayAgain: 'Chơi lại',
    memoryTitle: 'Trò nhớ hình',
    memoryHint: 'Chạm hai thẻ để tìm cặp động vật giống nhau!',
    memoryPairs: 'Cặp',
    memoryMoves: 'Nước đi',
    memoryWin: 'Bạn đã tìm thấy tất cả! 🎉',
    memoryPlayAgain: 'Chơi lại',
    whackTitle: 'Đánh chuột',
    whackHint: 'Chạm vào động vật khi chúng chui ra khỏi hang!',
    whackScore: 'Điểm',
    whackTime: 'Thời gian',
    whackGameOver: 'Hết cuộc chơi',
    whackPlayAgain: 'Chơi',
    pianoTitle: 'Trò chơi Piano',
    pianoTapToStart: 'Chạm để chơi',
    pianoScore: 'Điểm',
    pianoBest: 'Kỷ lục',
    pianoAutoPlay: 'Tự động chơi bài hát',
    pianoHint: 'Chạm phím khi nốt nhạc rơi xuống đường sáng!',
    pianoRotate: 'Vui lòng xoay máy sang chế độ ngang',
    pianoChooseSong: 'Chọn một bài hát',
    songHappyBirthday: 'Chúc mừng sinh nhật',
    songTwinkleTwinkle: 'Twinkle Twinkle',
    songMaryLamb: 'Mary có một con cừu',
    songJingleBells: 'Jingle Bells',
    coloringTitle: 'Tô màu',
    coloringChoose: 'Chọn một bức tranh để tô',
    coloringHint: 'Chọn màu, rồi kéo qua một phần của bức tranh để tô',
    coloringReset: 'Tô lại từ đầu',
    coloringComplete: 'Giỏi lắm! Bạn đã tô xong! 🎉',
    coloringBack: 'Quay lại',
    coloringProgress: (done: number, total: number) => `${done}/${total}`,
    brushSmall: 'Cọ nhỏ',
    brushMedium: 'Cọ vừa',
    brushLarge: 'Cọ to',
    coloringHouse: 'Ngôi nhà',
    coloringFish: 'Cá',
    coloringFlower: 'Bông hoa',
    coloringCar: 'Ô tô',
    coloringButterfly: 'Con bướm',
    coloringBalloon: 'Bóng bay',
    coloringIceCream: 'Kem',
    coloringRocket: 'Tên lửa',
    coloringTurtle: 'Con rùa',
    coloringBoat: 'Con thuyền',
    candyTitle: 'Candy Crush',
    candyHint: 'Đổi chỗ hai kẹo kề nhau để ghép 3 hoặc nhiều hơn cùng loại!',
    candyScore: 'Điểm',
    candyMoves: 'Nước đi',
    candyPlay: 'Chơi',
    candyGameOver: 'Hết cuộc chơi',
    candyPlayAgain: 'Chơi lại',
  },
};

export interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Dict;
}

export const LanguageContext = createContext<LanguageContextValue | null>(null);
