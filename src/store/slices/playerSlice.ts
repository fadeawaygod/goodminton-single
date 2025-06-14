import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';
import { RootState } from '../index';
import { Player, Gender } from '../../types/court';

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

interface UpdatePlayerPayload {
    id: string;
    name?: string;
    gender?: Gender;
    level?: number;
    gamesPlayed?: number;
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
        togglePlayerEnabled: (state, action: PayloadAction<string>) => {
            const player = state.players.find(p => p.id === action.payload);
            if (player && !player.isPlaying && !player.isQueuing) {
                player.enabled = !player.enabled;
                if (!player.enabled) {
                    player.gamesPlayed = 0;
                }
            }
        },
        updatePlayerStatus: (state, action: PayloadAction<{ id: string; isPlaying: boolean; isQueuing: boolean }>) => {
            const player = state.players.find(p => p.id === action.payload.id);
            if (player) {
                player.isPlaying = action.payload.isPlaying;
                player.isQueuing = action.payload.isQueuing;
            }
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
        },
        updatePlayer: (state, action: PayloadAction<UpdatePlayerPayload>) => {
            const player = state.players.find(p => p.id === action.payload.id);
            if (player && !player.isPlaying && !player.isQueuing) {
                if (action.payload.name !== undefined) player.name = action.payload.name;
                if (action.payload.gender !== undefined) player.gender = action.payload.gender;
                if (action.payload.level !== undefined) player.level = action.payload.level;
                if (action.payload.gamesPlayed !== undefined) player.gamesPlayed = action.payload.gamesPlayed;
            }
        }
    }
});

export const {
    addPlayer,
    deletePlayer,
    togglePlayerEnabled,
    updatePlayerStatus,
    updatePlayerGameCount,
    resetPlayerGameCount,
    updatePlayer
} = playerSlice.actions;

// Selectors
export const selectAllPlayers = (state: RootState) => state.players.players;
export const selectEnabledPlayers = (state: RootState) => state.players.players.filter(p => p.enabled);
export const selectPlayingPlayers = (state: RootState) => state.players.players.filter(p => p.isPlaying);
export const selectQueuingPlayers = (state: RootState) => state.players.players.filter(p => p.isQueuing);

export default playerSlice.reducer; 