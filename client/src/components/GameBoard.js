import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { useSound } from '../context/SoundContext';
import ChatSystem from './ChatSystem';
import GameInfo from './GameInfo';
import GameEndModal from './GameEndModal';

const GameBoard = ({ socket, gameData, playerId, onGameEnded, onReturnToLobby, onReturnToEntry }) => {
  const { state, dispatch } = useGame();
  const { playSound } = useSound();
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const [validPlacements, setValidPlacements] = useState([]);
  const [validRemovals, setValidRemovals] = useState([]);
  const [showGameEnd, setShowGameEnd] = useState(false);
  const [gameResult, setGameResult] = useState(null);
  const chatRef = useRef(null);

  // Board positions for rendering
  const boardPositions = [
    // Outer square
    { x: 50, y: 50 }, { x: 150, y: 50 }, { x: 250, y: 50 },
    { x: 50, y: 150 }, { x: 150, y: 150 }, { x: 250, y: 150 },
    { x: 50, y: 250 }, { x: 150, y: 250 }, { x: 250, y: 250 },
    // Middle square
    { x: 100, y: 100 }, { x: 150, y: 100 }, { x: 200, y: 100 },
    { x: 100, y: 150 }, { x: 200, y: 150 },
    { x: 100, y: 200 }, { x: 150, y: 200 }, { x: 200, y: 200 },
    // Inner square
    { x: 125, y: 125 }, { x: 150, y: 125 }, { x: 175, y: 125 },
    { x: 125, y: 150 }, { x: 175, y: 150 },
    { x: 125, y: 175 }, { x: 150, y: 175 }, { x: 175, y: 175 }
  ];

  // Mill combinations for highlighting
  const millCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], [9, 10, 11], [12, 13, 14], [15, 16, 17], [18, 19, 20], [21, 22, 23],
    [0, 9, 21], [3, 10, 18], [6, 11, 15], [1, 4, 7], [16, 19, 22], [8, 12, 17], [5, 13, 20], [2, 14, 23]
  ];

  useEffect(() => {
    // Update game state when gameData changes
    if (gameData) {
      dispatch({ type: 'SET_GAME_STATE', payload: gameData });
    }

    // Socket event listeners
    socket.on('gameStateUpdated', (gameState) => {
      dispatch({ type: 'SET_GAME_STATE', payload: gameState });
      
      // Play sounds for different events
      if (gameState.lastMove) {
        if (gameState.lastMove.type === 'placement' || gameState.lastMove.type === 'movement') {
          playSound('piece');
        }
        if (gameState.millFormed) {
          playSound('mill');
        }
      }
      
      if (gameState.currentTurn === playerId) {
        playSound('turn');
      }
    });

    socket.on('gameEnded', (result) => {
      setGameResult(result);
      setShowGameEnd(true);
      playSound('win');
      onGameEnded(result);
    });

    socket.on('newMessage', (message) => {
      dispatch({ type: 'ADD_CHAT_MESSAGE', payload: message });
      playSound('message');
    });

    return () => {
      socket.off('gameStateUpdated');
      socket.off('gameEnded');
      socket.off('newMessage');
    };
  }, [socket, gameData, playerId, dispatch, playSound, onGameEnded]);

  // Calculate valid moves and placements
  useEffect(() => {
    if (state.currentTurn === playerId && state.gameState === 'playing') {
      const player = state.players[playerId];
      
      if (state.phase === 'placement') {
        // Valid placements are empty positions
        const placements = state.board
          .map((player, index) => player === null ? index : -1)
          .filter(index => index !== -1);
        setValidPlacements(placements);
        setValidMoves([]);
        setValidRemovals([]);
      } else {
        // Valid moves for movement phase
        const playerPieces = state.board
          .map((player, index) => player === playerId ? index : -1)
          .filter(index => index !== -1);
        
        if (player.inPlay === 3) {
          // Flying phase - can move to any empty position
          const moves = state.board
            .map((player, index) => player === null ? index : -1)
            .filter(index => index !== -1);
          setValidMoves(moves);
        } else {
          // Normal movement - adjacent positions only
          const adjacentPositions = {
            0: [1, 9], 1: [0, 2, 4], 2: [1, 14], 3: [4, 10], 4: [1, 3, 5, 7], 5: [4, 13], 6: [7, 11], 7: [4, 6, 8],
            8: [7, 12], 9: [0, 10, 21], 10: [3, 9, 11, 18], 11: [6, 10, 15], 12: [8, 13, 17], 13: [5, 12, 14, 20],
            14: [2, 13, 23], 15: [11, 16], 16: [15, 17, 19], 17: [12, 16], 18: [10, 19], 19: [16, 18, 20, 22],
            20: [13, 19, 23], 21: [9, 22], 22: [19, 21, 23], 23: [14, 20, 22]
          };
          
          const moves = [];
          playerPieces.forEach(piece => {
            const adjacent = adjacentPositions[piece] || [];
            adjacent.forEach(pos => {
              if (state.board[pos] === null) {
                moves.push(pos);
              }
            });
          });
          setValidMoves(moves);
        }
        
        setValidPlacements([]);
        
        // Valid removals if mill was formed
        if (state.millFormed) {
          const opponentId = Object.keys(state.players).find(id => id !== playerId);
          const opponentPieces = state.board
            .map((player, index) => player === opponentId ? index : -1)
            .filter(index => index !== -1);
          
          // Check if all opponent pieces are in mills
          const allInMills = opponentPieces.every(piece => {
            return millCombinations.some(mill => {
              if (!mill.includes(piece)) return false;
              return mill.every(pos => state.board[pos] === opponentId);
            });
          });
          
          if (allInMills) {
            setValidRemovals(opponentPieces);
          } else {
            // Only pieces not in mills can be removed
            const removablePieces = opponentPieces.filter(piece => {
              return !millCombinations.some(mill => {
                if (!mill.includes(piece)) return false;
                return mill.every(pos => state.board[pos] === opponentId);
              });
            });
            setValidRemovals(removablePieces);
          }
        } else {
          setValidRemovals([]);
        }
      }
    } else {
      setValidMoves([]);
      setValidPlacements([]);
      setValidRemovals([]);
    }
  }, [state, playerId]);

  const handlePositionClick = (position) => {
    if (state.currentTurn !== playerId || state.gameState !== 'playing') return;

    const player = state.players[playerId];
    
    // Handle piece placement
    if (state.phase === 'placement' && validPlacements.includes(position)) {
      socket.emit('placePiece', { position }, (response) => {
        if (!response.success) {
          console.error('Placement failed:', response.error);
        }
      });
      return;
    }
    
    // Handle piece selection for movement
    if (state.phase !== 'placement' && state.board[position] === playerId) {
      setSelectedPiece(position);
      return;
    }
    
    // Handle piece movement
    if (state.phase !== 'placement' && selectedPiece !== null && validMoves.includes(position)) {
      socket.emit('movePiece', { from: selectedPiece, to: position }, (response) => {
        if (!response.success) {
          console.error('Move failed:', response.error);
        }
      });
      setSelectedPiece(null);
      return;
    }
    
    // Handle piece removal (after forming a mill)
    if (state.millFormed && validRemovals.includes(position)) {
      socket.emit('removePiece', { position }, (response) => {
        if (!response.success) {
          console.error('Removal failed:', response.error);
        }
      });
      return;
    }
  };

  const isInMill = (position) => {
    return millCombinations.some(mill => {
      if (!mill.includes(position)) return false;
      const player = state.board[position];
      return mill.every(pos => state.board[pos] === player);
    });
  };

  const isCurrentPlayer = state.currentTurn === playerId;
  const player = state.players[playerId];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Nine Men's Morris</h1>
            <div className="flex items-center space-x-4">
              <GameInfo 
                state={state} 
                playerId={playerId} 
                isCurrentPlayer={isCurrentPlayer}
              />
              <button
                onClick={onReturnToLobby}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Back to Lobby
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Game Board */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-center mb-4">
                <div className="text-lg font-semibold text-gray-800">
                  {isCurrentPlayer ? 'Your Turn' : "Opponent's Turn"}
                </div>
              </div>
              
              <div className="flex justify-center">
                <div className="relative w-80 h-80 bg-board-light rounded-lg shadow-inner">
                  {/* Board Lines */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 300">
                    {/* Outer square */}
                    <rect x="25" y="25" width="250" height="250" fill="none" stroke="#8B4513" strokeWidth="3"/>
                    {/* Middle square */}
                    <rect x="75" y="75" width="150" height="150" fill="none" stroke="#8B4513" strokeWidth="3"/>
                    {/* Inner square */}
                    <rect x="125" y="125" width="50" height="50" fill="none" stroke="#8B4513" strokeWidth="3"/>
                    {/* Cross lines */}
                    <line x1="150" y1="25" x2="150" y2="75" stroke="#8B4513" strokeWidth="3"/>
                    <line x1="150" y1="225" x2="150" y2="275" stroke="#8B4513" strokeWidth="3"/>
                    <line x1="25" y1="150" x2="75" y2="150" stroke="#8B4513" strokeWidth="3"/>
                    <line x1="225" y1="150" x2="275" y2="150" stroke="#8B4513" strokeWidth="3"/>
                  </svg>

                  {/* Board Positions */}
                  {boardPositions.map((pos, index) => {
                    const piece = state.board[index];
                    const isSelected = selectedPiece === index;
                    const isValidMove = validMoves.includes(index);
                    const isValidPlacement = validPlacements.includes(index);
                    const isValidRemoval = validRemovals.includes(index);
                    const isMill = isInMill(index);
                    
                    return (
                      <div
                        key={index}
                        className={`absolute w-6 h-6 rounded-full cursor-pointer transition-all duration-200 ${
                          piece === playerId
                            ? 'bg-piece-white border-2 border-gray-400'
                            : piece
                            ? 'bg-piece-black border-2 border-gray-600'
                            : 'bg-transparent border-2 border-transparent'
                        } ${
                          isSelected ? 'ring-4 ring-blue-500 ring-opacity-50 scale-125' : ''
                        } ${
                          isValidMove ? 'ring-4 ring-green-500 ring-opacity-50' : ''
                        } ${
                          isValidPlacement ? 'ring-4 ring-blue-500 ring-opacity-50' : ''
                        } ${
                          isValidRemoval ? 'ring-4 ring-red-500 ring-opacity-50' : ''
                        } ${
                          isMill ? 'mill-highlight' : ''
                        }`}
                        style={{
                          left: `${pos.x - 12}px`,
                          top: `${pos.y - 12}px`,
                        }}
                        onClick={() => handlePositionClick(index)}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Game Phase Info */}
              <div className="mt-4 text-center">
                <div className="text-sm text-gray-600">
                  Phase: {state.phase === 'placement' ? 'Placement' : state.phase === 'movement' ? 'Movement' : 'Flying'}
                </div>
                {state.millFormed && (
                  <div className="text-sm text-green-600 font-semibold mt-1">
                    Mill formed! Remove an opponent's piece.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Chat and Game Info */}
          <div className="space-y-4">
            <ChatSystem 
              socket={socket} 
              chat={state.chat} 
              playerId={playerId}
              ref={chatRef}
            />
          </div>
        </div>
      </div>

      {/* Game End Modal */}
      {showGameEnd && (
        <GameEndModal
          result={gameResult}
          onPlayAgain={onReturnToLobby}
          onReturnToEntry={onReturnToEntry}
        />
      )}
    </div>
  );
};

export default GameBoard; 