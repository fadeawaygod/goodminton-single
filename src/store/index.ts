import { configureStore } from '@reduxjs/toolkit';
import playerReducer from './slices/playerSlice';
import { Player } from '../types/court';

interface PlayerState {
    players: Player[];
}

const loadPlayersFromStorage = (): PlayerState => {
    try {
        const playersJson = localStorage.getItem('players');
        if (!playersJson) return { players: [] };
        const players = JSON.parse(playersJson);
        if (!Array.isArray(players)) return { players: [] };
        return { players };
    } catch (e) {
        console.error('Failed to parse players from localStorage:', e);
        return { players: [] };
    }
};

const savePlayersToStorage = (state: RootState) => {
    try {
        localStorage.setItem('players', JSON.stringify(state.players.players));
    } catch (e) {
        console.error('Failed to save players to localStorage:', e);
    }
};

export const store = configureStore({
    reducer: {
        players: playerReducer,
    },
    preloadedState: {
        players: loadPlayersFromStorage(),
    },
});

store.subscribe(() => {
    savePlayersToStorage(store.getState());
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store; 