import { useEffect, useState } from 'react';

function getOrientation() {
  return window.innerHeight > window.innerWidth;
}

function useOrientation() {
  const [isPortrait, setIsPortrait] = useState(getOrientation());

  useEffect(() => {
    function handleResize() {
      setIsPortrait(getOrientation());
    }

    window.addEventListener('resize', handleResize);

    // Some browsers report an orientation change without changing the viewport
    // size, so listen to the orientation media query as well.
    const mq = window.matchMedia?.('(orientation: portrait)');
    const handleMq = () => setIsPortrait(mq.matches);
    if (mq) {
      mq.addEventListener('change', handleMq);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mq) {
        mq.removeEventListener('change', handleMq);
      }
    };
  }, []);

  return isPortrait;
}

export default useOrientation;
