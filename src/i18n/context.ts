import { createContext } from 'react';

export type Lang = 'en' | 'vi';

export interface Dict {
  question: (word: string) => string;
  greatJob: (word: string) => string;
  animalsTitle: string;
  animals: Record<string, string>;
  fruitTitle: string;
  fruits: Record<string, string>;
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
  pianoHint: string;
  pianoRotate: string;
  pianoChooseSong: string;
  pianoPlay: string;
  pianoBack: string;
  pianoContinue: string;
  pianoSettings: string;
  pianoProgressTitle: string;
  pianoDifficulty: string;
  pianoEasy: string;
  pianoMedium: string;
  pianoChallenge: string;
  pianoVolume: string;
  pianoMute: string;
  pianoTempo: string;
  pianoShowNoteNames: string;
  pianoAnimations: string;
  pianoFreePlay: string;
  pianoPreview: string;
  pianoPause: string;
  pianoResume: string;
  pianoRestart: string;
  pianoResultsTitle: string;
  pianoCorrect: string;
  pianoAccuracy: string;
  pianoStars: string;
  pianoReplay: string;
  pianoNextSong: string;
  pianoCongrats: string;
  pianoGoodTry: string;
  pianoSongDone: string;
  pianoSongsCompleted: string;
  pianoTotalNotes: string;
  pianoMissed: string;
  pianoModeEasyHint: string;
  pianoModeMediumHint: string;
  pianoModeChallengeHint: string;
  songTwinkleTwinkle: string;
  songMaryLamb: string;
  songOdeToJoy: string;
  songFrereJacques: string;
  songRowYourBoat: string;
  songHotCrossBuns: string;
  songLondonBridge: string;
  songFirstMelody: string;
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
  pondTitle: string;
  pondHint: string;
  architectureTitle: string;
  architectureHint: string;
  householdTitle: string;
  householdPlay: string;
  householdBack: string;
  householdNext: string;
  householdRestart: string;
  household: Record<string, string>;
}

export const translations: Record<Lang, Dict> = {
  en: {
    question: (word) => `Which one is the ${word}?`,
    greatJob: (word) => `Great Job! It's ${word}!`,
    animalsTitle: 'Animals',
    fruitTitle: 'Fruits',
    fruits: {
      apple: 'Apple',
      banana: 'Banana',
      cherry: 'Cherry',
      grape: 'Grape',
      lemon: 'Lemon',
      mango: 'Mango',
      orange: 'Orange',
      peach: 'Peach',
      pear: 'Pear',
      pineapple: 'Pineapple',
      strawberry: 'Strawberry',
      watermelon: 'Watermelon',
      kiwi: 'Kiwi',
      coconut: 'Coconut',
      blueberry: 'Blueberry',
      melon: 'Melon',
      avocado: 'Avocado',
      olive: 'Olive',
    },
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
    pianoTitle: 'Piano Learning Game',
    pianoTapToStart: 'Tap to Play',
    pianoScore: 'Score',
    pianoBest: 'Best',
    pianoHint: 'Tap the key when the note reaches the line!',
    pianoRotate: 'Please rotate your device to landscape',
    pianoChooseSong: 'Choose a song',
    pianoPlay: 'Play',
    pianoBack: 'Back',
    pianoContinue: 'Continue learning',
    pianoSettings: 'Settings',
    pianoProgressTitle: 'My progress',
    pianoDifficulty: 'Difficulty',
    pianoEasy: 'Easy',
    pianoMedium: 'Medium',
    pianoChallenge: 'Challenge',
    pianoVolume: 'Volume',
    pianoMute: 'Mute',
    pianoTempo: 'Tempo',
    pianoShowNoteNames: 'Show note names',
    pianoAnimations: 'Animations',
    pianoFreePlay: 'Free play',
    pianoPreview: 'Preview',
    pianoPause: 'Pause',
    pianoResume: 'Resume',
    pianoRestart: 'Restart',
    pianoResultsTitle: 'Song complete!',
    pianoCorrect: 'Correct notes',
    pianoAccuracy: 'Accuracy',
    pianoStars: 'Stars',
    pianoReplay: 'Play again',
    pianoNextSong: 'Next song',
    pianoCongrats: 'Amazing! You played the whole song! 🎉',
    pianoGoodTry: 'Nice try! Every practice makes you better.',
    pianoSongDone: 'Song finished',
    pianoSongsCompleted: 'Songs completed',
    pianoTotalNotes: 'Notes in song',
    pianoMissed: 'Missed',
    pianoModeEasyHint: 'Colours, key highlights and note names — nice and slow.',
    pianoModeMediumHint: 'Notes and note names, normal tempo.',
    pianoModeChallengeHint: 'Just the notes — see how well you do.',
    songTwinkleTwinkle: 'Twinkle Twinkle',
    songMaryLamb: 'Mary Had a Little Lamb',
    songOdeToJoy: 'Ode to Joy',
    songFrereJacques: 'Frère Jacques',
    songRowYourBoat: 'Row, Row, Row Your Boat',
    songHotCrossBuns: 'Hot Cross Buns',
    songLondonBridge: 'London Bridge Is Falling Down',
    songFirstMelody: 'My First Melody',
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
    pondTitle: 'The Pond',
    pondHint: 'A calm pond scene — drag to look around. A fishing game is coming soon!',
    architectureTitle: 'Architecture',
    architectureHint:
      'How this app is built. Authored as an Archify JSON-IR and rendered at build time with the official @spexcode/archify runtime — see architecture/ and scripts/vite-plugin-archify.mjs.',
    householdTitle: 'Household Things',
    householdPlay: 'Play',
    householdBack: 'Back',
    householdNext: 'Next',
    householdRestart: 'Restart',
    household: {
      table: 'Table',
      chair: 'Chair',
      lamp: 'Lamp',
      pen: 'Pen',
      book: 'Book',
      cup: 'Cup',
      clock: 'Clock',
      phone: 'Phone',
      bed: 'Bed',
      spoon: 'Spoon',
      fork: 'Fork',
      tv: 'TV',
      sofa: 'Sofa',
      window: 'Window',
      door: 'Door',
      mirror: 'Mirror',
      shower: 'Shower',
      toilet: 'Toilet',
      speaker: 'Speaker',
      key: 'Key',
      umbrella: 'Umbrella',
      broom: 'Broom',
      toiletpaper: 'Toilet paper',
    },
  },
  vi: {
    question: (word) => `Con nào là ${word}?`,
    greatJob: (word) => `Giỏi lắm! Đó là ${word}!`,
    animalsTitle: 'Động vật',
    fruitTitle: 'Trái cây',
    fruits: {
      apple: 'Táo',
      banana: 'Chuối',
      cherry: 'Sơ ri',
      grape: 'Nho',
      lemon: 'Chanh',
      mango: 'Xoài',
      orange: 'Cam',
      peach: 'Đào',
      pear: 'Lê',
      pineapple: 'Dứa',
      strawberry: 'Dâu tây',
      watermelon: 'Dưa hấu',
      kiwi: 'Kiwi',
      coconut: 'Dừa',
      blueberry: 'Việt quất',
      melon: 'Bí xanh',
      avocado: 'Bơ',
      olive: 'Ô liu',
    },
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
    pianoTitle: 'Trò chơi Piano cho bé',
    pianoTapToStart: 'Chạm để chơi',
    pianoScore: 'Điểm',
    pianoBest: 'Kỷ lục',
    pianoHint: 'Chạm phím khi nốt nhạc chạm đường kẻ!',
    pianoRotate: 'Vui lòng xoay máy sang chế độ ngang',
    pianoChooseSong: 'Chọn một bài hát',
    pianoPlay: 'Chơi',
    pianoBack: 'Quay lại',
    pianoContinue: 'Tiếp tục học',
    pianoSettings: 'Cài đặt',
    pianoProgressTitle: 'Tiến độ của bé',
    pianoDifficulty: 'Độ khó',
    pianoEasy: 'Dễ',
    pianoMedium: 'Trung bình',
    pianoChallenge: 'Thử thách',
    pianoVolume: 'Â lượng',
    pianoMute: 'Tắt tiếng',
    pianoTempo: 'Nhịp độ',
    pianoShowNoteNames: 'Hiện tên nốt',
    pianoAnimations: 'Hiệu ứng',
    pianoFreePlay: 'Chơi tự do',
    pianoPreview: 'Nghe thử',
    pianoPause: 'Tạm dừng',
    pianoResume: 'Tiếp tục',
    pianoRestart: 'Chơi lại',
    pianoResultsTitle: 'Hoàn thành bài hát!',
    pianoCorrect: 'Nốt đúng',
    pianoAccuracy: 'Độ chính xác',
    pianoStars: 'Sao',
    pianoReplay: 'Chơi lại',
    pianoNextSong: 'Bài tiếp theo',
    pianoCongrats: 'Tuyệt vời! Bé đã chơi trọn bài hát! 🎉',
    pianoGoodTry: 'Làm tốt lắm! Mỗi lần luyện tập giúp bé tiến bộ hơn.',
    pianoSongDone: 'Bài hát đã xong',
    pianoSongsCompleted: 'Số bài đã hoàn thành',
    pianoTotalNotes: 'Số nốt trong bài',
    pianoMissed: 'Bỏ lỡ',
    pianoModeEasyHint: 'Màu sắc, phím sáng và tên nốt — chậm rãi.',
    pianoModeMediumHint: 'Nốt nhạc và tên nốt, nhịp độ bình thường.',
    pianoModeChallengeHint: 'Chỉ có nốt nhạc — xem bé chơi tốt đến đâu.',
    songTwinkleTwinkle: 'Twinkle Twinkle',
    songMaryLamb: 'Mary có một con cừu',
    songOdeToJoy: 'Ode to Joy',
    songFrereJacques: 'Frère Jacques',
    songRowYourBoat: 'Row, Row, Row Your Boat',
    songHotCrossBuns: 'Hot Cross Buns',
    songLondonBridge: 'London Bridge Is Falling Down',
    songFirstMelody: 'Giai điệu đầu tiên của bé',
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
    pondTitle: 'Ao nước',
    pondHint: 'Một cảnh ao nước yên bình — hãy kéo để quan sát xung quanh. Trò câu cá sắp ra mắt!',
    architectureTitle: 'Kiến trúc',
    architectureHint:
      'Cách ứng dụng này được xây dựng. Được mô tả dưới dạng JSON-IR của Archify và render khi build với runtime @spexcode/archify chính thức — xem architecture/ và scripts/vite-plugin-archify.mjs.',
    householdTitle: 'Đồ dùng gia đình',
    householdPlay: 'Chơi',
    householdBack: 'Quay lại',
    householdNext: 'Tiếp theo',
    householdRestart: 'Chơi lại',
    household: {
      table: 'Bàn',
      chair: 'Ghế',
      lamp: 'Đèn',
      pen: 'Bút',
      book: 'Sách',
      cup: 'Cốc',
      clock: 'Đồng hồ',
      phone: 'Điện thoại',
      bed: 'Giường',
      spoon: 'Thìa',
      fork: 'Nĩa',
      tv: 'Tivi',
      sofa: 'Ghế sofa',
      window: 'Cửa sổ',
      door: 'Cửa',
      mirror: 'Gương',
      shower: 'Vòi sen',
      toilet: 'Nhà vệ sinh',
      speaker: 'Loa',
      key: 'Chìa khóa',
      umbrella: 'Ô',
      broom: 'Chổi',
      toiletpaper: 'Giấy vệ sinh',
    },
  },
};

export interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Dict;
}

export const LanguageContext = createContext<LanguageContextValue | null>(null);
