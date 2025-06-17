import React from 'react';

const GameInfo = ({ state, playerId, isCurrentPlayer }) => {
  const player = state.players[playerId];
  const opponentId = Object.keys(state.players).find(id => id !== playerId);
  const opponent = state.players[opponentId];

  return (
    <div className="flex flex-col items-end space-y-1 text-sm">
      <div>
        <span className="font-semibold">You:</span> {player ? (player.color === 'white' ? 'White' : 'Black') : '-'}
      </div>
      <div>
        <span className="font-semibold">Opponent:</span> {opponent ? (opponent.color === 'white' ? 'White' : 'Black') : '-'}
      </div>
      <div>
        <span className="font-semibold">Your unplaced:</span> {player ? player.unplaced : '-'}
      </div>
      <div>
        <span className="font-semibold">Your in play:</span> {player ? player.inPlay : '-'}
      </div>
      <div>
        <span className="font-semibold">Phase:</span> {state.phase.charAt(0).toUpperCase() + state.phase.slice(1)}
      </div>
      <div>
        <span className="font-semibold">Turn:</span> {isCurrentPlayer ? <span className="text-green-600 font-bold">Your turn</span> : <span className="text-gray-600">Opponent</span>}
      </div>
    </div>
  );
};

export default GameInfo; 