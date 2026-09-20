export const playPianoNote = (frequency: number, volume: number = 0.8) => {
  // Create audio context if it doesn't exist
  const audioContext = new (window.AudioContext || (window as unknown as typeof window).AudioContext)();
  
  // Create oscillator and gain node
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  // Configure oscillator for a pleasant piano-like sound
  oscillator.type = 'sine';
  oscillator.frequency.value = frequency;
  
  // Configure gain (volume) with smooth attack and release
  gainNode.gain.value = 0; // Start silent
  gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01); // Quick attack
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5); // Gentle release
  
  // Connect nodes
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  // Start and stop the sound
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.5); // Stop after 0.5 seconds
};

// Enhanced sound with better piano-like qualities
export const playPianoNoteEnhanced = (frequency: number, volume: number = 0.8) => {
  // Create audio context if it doesn't exist
  const audioContext = new (window.AudioContext || (window as unknown as typeof window).AudioContext)();
  
  // Create multiple oscillators for richer sound
  const oscillator1 = audioContext.createOscillator();
  const oscillator2 = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  // Configure oscillators
  oscillator1.type = 'sine';
  oscillator1.frequency.value = frequency;
  
  oscillator2.type = 'sine';
  oscillator2.frequency.value = frequency * 1.01; // Slight detuning for richer sound
  
  // Configure gain (volume) with smooth attack and release
  gainNode.gain.value = 0; // Start silent
  gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01); // Quick attack
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.8); // Gentle release
  
  // Connect nodes
  oscillator1.connect(gainNode);
  oscillator2.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  // Start and stop the sound
  oscillator1.start();
  oscillator2.start();
  oscillator1.stop(audioContext.currentTime + 0.8); // Stop after 0.8 seconds
  oscillator2.stop(audioContext.currentTime + 0.8);
};

export const initAudio = () => {
  // Audio initialization logic can go here if needed
};