import React from 'react';

const reasons = {
  less_than_3_pieces: 'Opponent has less than 3 pieces',
  no_legal_moves: 'Opponent has no legal moves',
};

const GameEndModal = ({ result, onPlayAgain, onReturnToEntry }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full text-center">
        <h2 className="text-3xl font-bold mb-4 text-gray-800">Game Over</h2>
        <div className="mb-4">
          <span className="text-xl font-semibold text-green-700">
            {result && result.winner ? (result.winner === 'draw' ? 'Draw!' : 'Winner!') : 'Game Ended'}
          </span>
        </div>
        <div className="mb-6 text-gray-600">
          {result && result.reason ? reasons[result.reason] || result.reason : ''}
        </div>
        <div className="flex flex-col space-y-3">
          <button
            onClick={onPlayAgain}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Play Again
          </button>
          <button
            onClick={onReturnToEntry}
            className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
          >
            Return to Lobby
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameEndModal; 