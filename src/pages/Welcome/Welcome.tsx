import useOrientation from '@/hooks/useOrientation';

import elephantIcon from './logos/elephant.png';
import giraffeIcon from './logos/giraffe.png';
import lionIcon from './logos/lion.png';
import monkeyIcon from './logos/monkey.png';
import parrotIcon from './logos/parrot.png';
import turtleIcon from './logos/turtle.png';
import { Image } from './styled';

function Welcome() {
  const isPortrait = useOrientation();

  const width = isPortrait ? '48%' : '30%';
  const height = isPortrait ? '30%' : '48%';

  const animals = [
    { src: lionIcon, alt: 'Lion', bg: '#FFD93D' },
    { src: elephantIcon, alt: 'Elephant', bg: '#6BCB77' },
    { src: monkeyIcon, alt: 'Monkey', bg: '#FF6B6B' },
    { src: giraffeIcon, alt: 'Giraffe', bg: '#4D96FF' },
    { src: parrotIcon, alt: 'Parrot', bg: '#FFADAD' },
    { src: turtleIcon, alt: 'Turtle', bg: '#A0E7E5' },
  ];

  return (
    <>
      <meta name="title" content="Welcome to Jungle!" />
      <div
        // flexDirection={isPortrait ? 'column' : 'row'}
        id="main-container"
        style={{ backgroundColor: '#FFFCEB', gap: '1rem', padding: '1rem' }}
      >
        {animals.map((animal) => (
          <div
            key={animal.alt}
            style={{
              backgroundColor: animal.bg,
              borderRadius: '2rem',
              padding: '1rem',
              width,
              height,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
            }}
          >
            <Image alt={animal.alt} src={animal.src} sx={{ width: '100%', height: '100%' }} />
          </div>
        ))}
      </div>
    </>
  );
}

export default Welcome;
