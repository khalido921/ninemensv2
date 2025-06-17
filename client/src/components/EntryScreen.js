import React, { useState } from 'react';
import { useSound } from '../context/SoundContext';

const EntryScreen = ({ socket, onGameCreated, onGameJoined }) => {
  const [gameId, setGameId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { playSound } = useSound();

  const handleCreateGame = () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    setIsLoading(true);
    setError('');

    socket.emit('createGame', (response) => {
      setIsLoading(false);
      if (response.success) {
        playSound('piece');
        onGameCreated(response.gameId, response.playerId);
      } else {
        setError(response.error || 'Failed to create game');
      }
    });
  };

  const handleJoinGame = () => {
    if (!gameId.trim() || !playerName.trim()) {
      setError('Please enter both game ID and your name');
      return;
    }

    setIsLoading(true);
    setError('');

    socket.emit('joinGame', { gameId: gameId.trim() }, (response) => {
      setIsLoading(false);
      if (response.success) {
        playSound('piece');
        onGameJoined(response.gameId, response.playerId);
      } else {
        setError(response.error || 'Failed to join game');
      }
    });
  };

  const copyGameId = () => {
    navigator.clipboard.writeText(gameId);
    playSound('message');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Nine Men's Morris</h1>
          <p className="text-gray-600">A classic strategy game for two players</p>
        </div>

        <div className="space-y-6">
          {/* Player Name Input */}
          <div>
            <label htmlFor="playerName" className="block text-sm font-medium text-gray-700 mb-2">
              Your Name
            </label>
            <input
              type="text"
              id="playerName"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={20}
            />
          </div>

          {/* Create Game Section */}
          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Create a New Game</h2>
            <button
              onClick={handleCreateGame}
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Creating...' : 'Create Game'}
            </button>
          </div>

          {/* Join Game Section */}
          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Join an Existing Game</h2>
            <div className="space-y-3">
              <input
                type="text"
                value={gameId}
                onChange={(e) => setGameId(e.target.value)}
                placeholder="Enter game ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleJoinGame}
                disabled={isLoading}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Joining...' : 'Join Game'}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {/* Game Rules */}
          <div className="border-t pt-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">How to Play:</h3>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Place 9 pieces on the board</li>
              <li>• Move pieces to form mills (3 in a row)</li>
              <li>• Remove opponent's piece when you form a mill</li>
              <li>• Win by reducing opponent to 2 pieces or blocking all moves</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntryScreen; 