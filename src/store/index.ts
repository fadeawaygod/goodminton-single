import { configureStore } from '@reduxjs/toolkit';
import playerReducer, { PlayerState } from './playerSlice';

const loadPlayersFromStorage = (): PlayerState => {
    try {
        const storedPlayers = localStorage.getItem('goodminton_players');
        if (storedPlayers) {
            const players = JSON.parse(storedPlayers);
            return {
                players: players.map((p: any) => ({
                    ...p,
                    lastGameEndTime: p.lastGameEndTime ? new Date(p.lastGameEndTime) : undefined
                }))
            };
        }
    } catch (e) {
        console.error('Failed to load players from localStorage:', e);
    }
    return { players: [] };
};

export const store = configureStore({
    reducer: {
        players: playerReducer
    },
    preloadedState: {
        players: loadPlayersFromStorage()
    }
});

// Save to localStorage whenever the state changes
store.subscribe(() => {
    const state = store.getState();
    localStorage.setItem('goodminton_players', JSON.stringify(state.players.players));
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store; 