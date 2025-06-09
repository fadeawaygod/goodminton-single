import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './index';
import { Player, Gender } from '../types/court';

export interface PlayerState {
    players: Player[];
}

const initialState: PlayerState = {
    players: [],
};

export const playerSlice = createSlice({
    name: 'players',
    initialState,
    reducers: {
        addPlayer: (state, action: PayloadAction<Omit<Player, 'id' | 'enabled' | 'isPlaying' | 'isQueuing' | 'gamesPlayed'>>) => {
            const newPlayer: Player = {
                ...action.payload,
                id: Date.now().toString(),
                enabled: true,
                isPlaying: false,
                isQueuing: false,
                gamesPlayed: 0,
            };
            state.players.push(newPlayer);
        },
        deletePlayer: (state, action: PayloadAction<string>) => {
            state.players = state.players.filter(player => player.id !== action.payload);
        },
        togglePlayerEnabled: (state, action: PayloadAction<string>) => {
            const player = state.players.find(p => p.id === action.payload);
            if (player) {
                player.enabled = !player.enabled;
            }
        },
        updatePlayerStatus: (state, action: PayloadAction<{ id: string; isPlaying: boolean; isQueuing: boolean }>) => {
            const player = state.players.find(p => p.id === action.payload.id);
            if (player) {
                if (!action.payload.isPlaying && player.isPlaying) {
                    player.gamesPlayed += 1;
                    player.lastGameEndTime = new Date();
                }
                player.isPlaying = action.payload.isPlaying;
                player.isQueuing = action.payload.isQueuing;
            }
        },
    },
});

export const { addPlayer, deletePlayer, togglePlayerEnabled, updatePlayerStatus } = playerSlice.actions;

// Selectors
export const selectAllPlayers = (state: RootState) => state.players.players;
export const selectEnabledPlayers = (state: RootState) => state.players.players.filter(player => player.enabled);
export const selectPlayingPlayers = (state: RootState) => state.players.players.filter(player => player.isPlaying);
export const selectQueuingPlayers = (state: RootState) => state.players.players.filter(player => player.isQueuing);

export default playerSlice.reducer; 