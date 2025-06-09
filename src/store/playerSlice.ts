import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';
import { RootState } from './index';
import { Player, Gender } from '../types/court';

interface PlayerState {
    players: Player[];
}

const initialState: PlayerState = {
    players: []
};

interface AddPlayerPayload {
    name: string;
    gender: Gender;
    level: number;
}

export const playerSlice = createSlice({
    name: 'players',
    initialState,
    reducers: {
        addPlayer: (state, action: PayloadAction<AddPlayerPayload>) => {
            const newPlayer: Player = {
                id: uuidv4(),
                ...action.payload,
                enabled: true,
                isPlaying: false,
                isQueuing: false,
                gamesPlayed: 0
            };
            state.players.push(newPlayer);
        },
        deletePlayer: (state, action: PayloadAction<string>) => {
            state.players = state.players.filter(player => player.id !== action.payload);
        },
        updatePlayerGameCount: (state, action: PayloadAction<string>) => {
            const player = state.players.find(p => p.id === action.payload);
            if (player) {
                player.gamesPlayed += 1;
            }
        },
        resetPlayerGameCount: (state, action: PayloadAction<string>) => {
            const player = state.players.find(p => p.id === action.payload);
            if (player) {
                player.gamesPlayed = 0;
            }
        }
    }
});

export const {
    addPlayer,
    deletePlayer,
    updatePlayerGameCount,
    resetPlayerGameCount
} = playerSlice.actions;

// Selectors
export const selectAllPlayers = (state: RootState) => state.players.players;
export const selectEnabledPlayers = (state: RootState) => state.players.players.filter(p => p.enabled);
export const selectPlayingPlayers = (state: RootState) => state.players.players.filter(p => p.isPlaying);
export const selectQueuingPlayers = (state: RootState) => state.players.players.filter(p => p.isQueuing);

export default playerSlice.reducer; 