import React, { createContext, useContext, useState, useEffect } from 'react';

const SoundContext = createContext();

// Sound URLs (using Web Audio API to generate simple sounds)
const generateSound = (frequency, duration, type = 'sine') => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.value = frequency;
  oscillator.type = type;
  
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration);
  
  return audioContext;
};

export const SoundProvider = ({ children }) => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [audioContext, setAudioContext] = useState(null);

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

  const playSound = (type) => {
    if (!soundEnabled || !audioContext) return;

    switch (type) {
      case 'mill':
        generateSound(800, 0.5, 'sine');
        break;
      case 'turn':
        generateSound(600, 0.3, 'sine');
        break;
      case 'message':
        generateSound(400, 0.2, 'sine');
        break;
      case 'piece':
        generateSound(300, 0.1, 'square');
        break;
      case 'win':
        generateSound(523, 0.2, 'sine');
        setTimeout(() => generateSound(659, 0.2, 'sine'), 200);
        setTimeout(() => generateSound(784, 0.4, 'sine'), 400);
        break;
      default:
        break;
    }
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  return (
    <SoundContext.Provider value={{ soundEnabled, playSound, toggleSound }}>
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