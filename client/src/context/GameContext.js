import React, { createContext, useContext, useReducer } from 'react';

const GameContext = createContext();

const initialState = {
  board: new Array(24).fill(null),
  players: {},
  currentTurn: null,
  phase: 'placement',
  gameState: 'waiting',
  lastMove: null,
  millFormed: false,
  chat: [],
  selectedPiece: null,
  validMoves: [],
  validPlacements: [],
  validRemovals: []
};

const gameReducer = (state, action) => {
  switch (action.type) {
    case 'SET_GAME_STATE':
      return {
        ...state,
        ...action.payload
      };
    case 'SET_SELECTED_PIECE':
      return {
        ...state,
        selectedPiece: action.payload
      };
    case 'SET_VALID_MOVES':
      return {
        ...state,
        validMoves: action.payload
      };
    case 'SET_VALID_PLACEMENTS':
      return {
        ...state,
        validPlacements: action.payload
      };
    case 'SET_VALID_REMOVALS':
      return {
        ...state,
        validRemovals: action.payload
      };
    case 'ADD_CHAT_MESSAGE':
      return {
        ...state,
        chat: [...state.chat, action.payload]
      };
    case 'RESET_GAME':
      return initialState;
    default:
      return state;
  }
};

export const GameProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}; 