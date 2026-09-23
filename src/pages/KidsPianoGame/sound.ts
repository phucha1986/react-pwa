// Create a single global AudioContext instance
let audioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioContext) {
    // Check if Web Audio API is supported
    if (typeof window !== 'undefined' && typeof window.AudioContext !== 'undefined') {
      audioContext = new window.AudioContext();
    } else if (typeof window !== 'undefined' && typeof (window as unknown as { webkitAudioContext: any }).webkitAudioContext !== 'undefined') {
      // Fallback for Safari
      audioContext = new (window as unknown as { webkitAudioContext: any }).webkitAudioContext();
    } else {
      // Web Audio API not supported
      console.warn('Web Audio API is not supported in this browser');
      return null;
    }
  }
  return audioContext;
};

export const playPianoNote = (frequency: number, volume: number = 0.8) => {
  const ctx = getAudioContext();
  if (!ctx) return;

  // Create oscillator and gain node
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  // Configure oscillator for a pleasant piano-like sound
  oscillator.type = 'sine';
  oscillator.frequency.value = frequency;
  
  // Configure gain (volume) with smooth attack and release
  gainNode.gain.value = 0; // Start silent
  gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01); // Quick attack
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5); // Gentle release
  
  // Connect nodes
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  // Start and stop the sound
  oscillator.start();
  oscillator.stop(ctx.currentTime + 0.5); // Stop after 0.5 seconds
  
  // Clean up
  oscillator.onended = () => {
    oscillator.disconnect();
    gainNode.disconnect();
  };
};