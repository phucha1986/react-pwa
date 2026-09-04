import AddTaskIcon from '@mui/icons-material/AddTask';
import BugReportIcon from '@mui/icons-material/BugReport';
import CookieIcon from '@mui/icons-material/Cookie';
import GavelIcon from '@mui/icons-material/Gavel';
import GitHubIcon from '@mui/icons-material/GitHub';
import HomeIcon from '@mui/icons-material/Home';
import PaletteIcon from '@mui/icons-material/Palette';
import PetsIcon from '@mui/icons-material/Pets';
import PianoIcon from '@mui/icons-material/Piano';
import TerrainIcon from '@mui/icons-material/Terrain';

import asyncComponentLoader from '@/utils/loader';

import { Routes } from './types';

const routes: Routes = [
  {
    component: asyncComponentLoader(() => import('@/pages/Welcome')),
    path: '/',
    title: 'Welcome',
    icon: HomeIcon,
  },
  {
    component: asyncComponentLoader(() => import('@/pages/AnimalGame')),
    path: '/AnimalGame',
    title: 'Animal Game',
    icon: GitHubIcon,
  },
  {
    component: asyncComponentLoader(() => import('@/pages/AnimalGuessPage')),
    path: '/AnimalGuessPage',
    title: 'Animal Guess Page',
    icon: AddTaskIcon,
  },
  {
    component: asyncComponentLoader(() => import('@/pages/FlappyBird')),
    path: '/FlappyBird',
    title: 'Flappy Bird',
    icon: GitHubIcon,
  },
  {
    component: asyncComponentLoader(() => import('@/pages/PianoGame')),
    path: '/PianoGame',
    title: 'Piano Game',
    icon: PianoIcon,
  },
  {
    component: asyncComponentLoader(() => import('@/pages/MemoryMatch')),
    path: '/MemoryMatch',
    title: 'Memory Match',
    icon: PetsIcon,
  },
  {
    component: asyncComponentLoader(() => import('@/pages/ColoringGame')),
    path: '/ColoringGame',
    title: 'Coloring',
    icon: PaletteIcon,
  },
  {
    component: asyncComponentLoader(() => import('@/pages/WhackAMole')),
    path: '/WhackAMole',
    title: 'Whack-a-Mole',
    icon: GavelIcon,
  },
  {
    component: asyncComponentLoader(() => import('@/pages/CandyCrush')),
    path: '/CandyCrush',
    title: 'Candy Crush',
    icon: CookieIcon,
  },
  {
    component: asyncComponentLoader(() => import('@/pages/Page3')),
    path: '/page-3',
    title: 'Page 3',
    icon: TerrainIcon,
  },
  {
    component: asyncComponentLoader(() => import('@/pages/Page4')),
    path: '/page-4',
    title: 'Page 4',
    icon: BugReportIcon,
  },
  {
    component: asyncComponentLoader(() => import('@/pages/NotFound')),
    path: '*',
  },
];

export default routes;
