import bedImg from './logos/bed.png';
import bookImg from './logos/book.png';
import broomImg from './logos/broom.png';
import chairImg from './logos/chair.png';
import clockImg from './logos/clock.png';
import cupImg from './logos/cup.png';
import doorImg from './logos/door.png';
import forkImg from './logos/fork.png';
import keyImg from './logos/key.png';
import lampImg from './logos/lamp.png';
import mirrorImg from './logos/mirror.png';
import penImg from './logos/pen.png';
import phoneImg from './logos/phone.png';
import showerImg from './logos/shower.png';
import sofaImg from './logos/sofa.png';
import speakerImg from './logos/speaker.png';
import spoonImg from './logos/spoon.png';
import tableImg from './logos/table.png';
import toiletImg from './logos/toilet.png';
import toiletpaperImg from './logos/toiletpaper.png';
import tvImg from './logos/tv.png';
import umbrellaImg from './logos/umbrella.png';
import windowImg from './logos/window.png';

export interface HouseholdItem {
  key: string; // i18n key
  icon: string; // realistic Twemoji PNG (CC-BY 4.0)
  bg: string; // pastel card color
}

// 11 common household items — a kid can recognise each one from the image.
export const householdItems: HouseholdItem[] = [
  { key: 'table', icon: tableImg, bg: '#FFE5CC' },
  { key: 'chair', icon: chairImg, bg: '#D9F2E3' },
  { key: 'lamp', icon: lampImg, bg: '#FFF3C4' },
  { key: 'pen', icon: penImg, bg: '#D6E9FF' },
  { key: 'book', icon: bookImg, bg: '#E8D6FF' },
  { key: 'cup', icon: cupImg, bg: '#FFD6E0' },
  { key: 'clock', icon: clockImg, bg: '#FFF3C4' },
  { key: 'phone', icon: phoneImg, bg: '#D6E9FF' },
  { key: 'bed', icon: bedImg, bg: '#FFE5CC' },
  { key: 'spoon', icon: spoonImg, bg: '#D9F2E3' },
  { key: 'fork', icon: forkImg, bg: '#E8D6FF' },
  { key: 'tv', icon: tvImg, bg: '#D6E9FF' },
  { key: 'sofa', icon: sofaImg, bg: '#FFE5CC' },
  { key: 'window', icon: windowImg, bg: '#D9F2E3' },
  { key: 'door', icon: doorImg, bg: '#FFD6E0' },
  { key: 'mirror', icon: mirrorImg, bg: '#FFF3C4' },
  { key: 'shower', icon: showerImg, bg: '#D6E9FF' },
  { key: 'toilet', icon: toiletImg, bg: '#E8D6FF' },
  { key: 'speaker', icon: speakerImg, bg: '#D9F2E3' },
  { key: 'key', icon: keyImg, bg: '#FFE5CC' },
  { key: 'umbrella', icon: umbrellaImg, bg: '#FFD6E0' },
  { key: 'broom', icon: broomImg, bg: '#FFF3C4' },
  { key: 'toiletpaper', icon: toiletpaperImg, bg: '#D6E9FF' },
];
