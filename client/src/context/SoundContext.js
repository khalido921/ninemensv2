import React, { createContext, useContext, useState, useEffect } from 'react';

const SoundContext = createContext();

// Enhanced sound generation with more realistic game sounds
const generateSound = (frequency, duration, type = 'sine', volume = 0.3, effects = {}) => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.value = frequency;
  oscillator.type = type;
  
  // Apply volume and fade
  gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
  
  // Add effects if specified
  if (effects.frequencyRamp) {
    oscillator.frequency.exponentialRampToValueAtTime(
      frequency * effects.frequencyRamp, 
      audioContext.currentTime + duration
    );
  }
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration);
  
  return audioContext;
};

// Generate more realistic game sounds
const generateGameSound = (type) => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  
  switch (type) {
    case 'mill':
      // Triumphant sound - ascending notes
      generateSound(523, 0.2, 'sine', 0.2); // C
      setTimeout(() => generateSound(659, 0.2, 'sine', 0.2), 200); // E
      setTimeout(() => generateSound(784, 0.4, 'sine', 0.3), 400); // G
      break;
      
    case 'turn':
      // Gentle notification sound
      generateSound(600, 0.3, 'sine', 0.2, { frequencyRamp: 1.2 });
      break;
      
    case 'message':
      // Soft ping sound
      generateSound(800, 0.15, 'sine', 0.15);
      break;
      
    case 'piece':
      // Wooden piece placement sound
      generateSound(300, 0.1, 'square', 0.2);
      setTimeout(() => generateSound(250, 0.1, 'square', 0.15), 50);
      break;
      
    case 'win':
      // Victory fanfare
      generateSound(523, 0.3, 'sine', 0.3); // C
      setTimeout(() => generateSound(659, 0.3, 'sine', 0.3), 300); // E
      setTimeout(() => generateSound(784, 0.3, 'sine', 0.3), 600); // G
      setTimeout(() => generateSound(1047, 0.5, 'sine', 0.4), 900); // C (high)
      break;
      
    case 'click':
      // Button click sound
      generateSound(400, 0.05, 'square', 0.1);
      break;
      
    case 'remove':
      // Piece removal sound
      generateSound(200, 0.2, 'sawtooth', 0.25, { frequencyRamp: 0.5 });
      break;
      
    case 'error':
      // Error sound
      generateSound(200, 0.2, 'sawtooth', 0.2);
      setTimeout(() => generateSound(150, 0.2, 'sawtooth', 0.2), 200);
      break;
      
    default:
      generateSound(400, 0.2, 'sine', 0.2);
  }
};

// Load .mp3 files if available (fallback system)
const loadSoundFile = async (type) => {
  try {
    const response = await fetch(`/sounds/${type}.mp3`);
    if (response.ok) {
      const arrayBuffer = await response.arrayBuffer();
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start(0);
      return true;
    }
  } catch (error) {
    console.log(`MP3 file not found for ${type}, using generated sound`);
  }
  return false;
};

export const SoundProvider = ({ children }) => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [audioContext, setAudioContext] = useState(null);
  const [useMP3Files, setUseMP3Files] = useState(false);

  useEffect(() => {
    // Initialize audio context on first user interaction
    const initAudio = () => {
      if (!audioContext) {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        setAudioContext(ctx);
      }
    };

    const handleUserInteraction = () => {
      initAudio();
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };

    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };
  }, [audioContext]);

  const playSound = async (type) => {
    if (!soundEnabled || !audioContext) return;

    // Try to load MP3 file first if enabled
    if (useMP3Files) {
      const mp3Loaded = await loadSoundFile(type);
      if (mp3Loaded) return;
    }

    // Fallback to generated sounds
    generateGameSound(type);
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  const toggleMP3Files = () => {
    setUseMP3Files(!useMP3Files);
  };

  return (
    <SoundContext.Provider value={{ 
      soundEnabled, 
      playSound, 
      toggleSound, 
      useMP3Files, 
      toggleMP3Files 
    }}>
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
}; 