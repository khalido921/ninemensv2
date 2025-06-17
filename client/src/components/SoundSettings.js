import React from 'react';
import { useSound } from '../context/SoundContext';

const SoundSettings = ({ isOpen, onClose }) => {
  const { soundEnabled, toggleSound, useMP3Files, toggleMP3Files, playSound } = useSound();

  const handleTestSound = (type) => {
    playSound(type);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Sound Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          {/* Master Sound Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-800">Master Sound</h3>
              <p className="text-sm text-gray-600">Enable/disable all game sounds</p>
            </div>
            <button
              onClick={toggleSound}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                soundEnabled ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  soundEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Sound Type Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-800">Use MP3 Files</h3>
              <p className="text-sm text-gray-600">Use .mp3 files instead of generated sounds</p>
            </div>
            <button
              onClick={toggleMP3Files}
              disabled={!soundEnabled}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                useMP3Files && soundEnabled ? 'bg-green-600' : 'bg-gray-300'
              } ${!soundEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  useMP3Files && soundEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Sound Test Section */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-800 mb-3">Test Sounds</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleTestSound('piece')}
                disabled={!soundEnabled}
                className="px-3 py-2 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Piece Move
              </button>
              <button
                onClick={() => handleTestSound('mill')}
                disabled={!soundEnabled}
                className="px-3 py-2 bg-green-100 text-green-800 rounded-md hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Mill Formed
              </button>
              <button
                onClick={() => handleTestSound('turn')}
                disabled={!soundEnabled}
                className="px-3 py-2 bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Turn Switch
              </button>
              <button
                onClick={() => handleTestSound('message')}
                disabled={!soundEnabled}
                className="px-3 py-2 bg-purple-100 text-purple-800 rounded-md hover:bg-purple-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Chat Message
              </button>
              <button
                onClick={() => handleTestSound('win')}
                disabled={!soundEnabled}
                className="px-3 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Victory
              </button>
              <button
                onClick={() => handleTestSound('click')}
                disabled={!soundEnabled}
                className="px-3 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Button Click
              </button>
            </div>
          </div>

          {/* Info Section */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-800 mb-2">About Sounds</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>• Generated sounds use Web Audio API</p>
              <p>• MP3 files can be added to <code>/public/sounds/</code></p>
              <p>• Files: mill.mp3, turn.mp3, message.mp3, etc.</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SoundSettings; 