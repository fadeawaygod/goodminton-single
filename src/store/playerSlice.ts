import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Player, Gender } from '../types/court';

interface PlayerState {
    players: Player[];
    standbyPlayers: Player[];
    lastSaved: number;
}

const STORAGE_KEY = 'goodminton_players';

const loadPlayersFromStorage = (): Player[] => {
    const storedPlayers = localStorage.getItem(STORAGE_KEY);
    if (storedPlayers) {
        try {
            const players = JSON.parse(storedPlayers);
            return players.map((p: Player) => ({
                ...p,
                lastEnabledTime: p.lastEnabledTime ? new Date(p.lastEnabledTime) : undefined
            }));
        } catch (e) {
            console.error('Failed to parse players from localStorage:', e);
            return [];
        }
    }
    return [];
};

const initialState: PlayerState = {
    players: loadPlayersFromStorage(),
    standbyPlayers: [],
    lastSaved: Date.now()
};

const playerSlice = createSlice({
    name: 'players',
    initialState,
    reducers: {
        addPlayer: (state, action: PayloadAction<{
            name: string;
            gender: Gender;
            level: number;
            labels: string[];
        }>) => {
            const newPlayer: Player = {
                id: crypto.randomUUID(),
                ...action.payload,
                enabled: true,
                isPlaying: false,
                isQueuing: false,
                gameCount: 0
            };
            state.players.push(newPlayer);
            state.lastSaved = Date.now();
        },
        togglePlayerEnabled: (state, action: PayloadAction<string>) => {
            const player = state.players.find(p => p.id === action.payload);
            if (player) {
                player.enabled = !player.enabled;
                player.lastEnabledTime = player.enabled ? new Date() : undefined;
                state.lastSaved = Date.now();
            }
        },
        updatePlayerStatus: (state, action: PayloadAction<{
            playerId: string;
            isPlaying?: boolean;
            isQueuing?: boolean;
        }>) => {
            const player = state.players.find(p => p.id === action.payload.playerId);
            if (player) {
                if (typeof action.payload.isPlaying !== 'undefined') {
                    player.isPlaying = action.payload.isPlaying;
                }
                if (typeof action.payload.isQueuing !== 'undefined') {
                    player.isQueuing = action.payload.isQueuing;
                }
            }
        },
        incrementGameCount: (state, action: PayloadAction<string>) => {
            const player = state.players.find(p => p.id === action.payload);
            if (player) {
                player.gameCount += 1;
                state.lastSaved = Date.now();
            }
        },
        moveToStandby: (state, action: PayloadAction<Player[]>) => {
            const playerIds = action.payload.map(p => p.id);
            state.standbyPlayers = state.standbyPlayers.concat(
                action.payload.filter(p => !state.standbyPlayers.some(sp => sp.id === p.id))
            );
            state.players = state.players.map(player => {
                if (playerIds.includes(player.id)) {
                    return {
                        ...player,
                        isPlaying: false,
                        isQueuing: false
                    };
                }
                return player;
            });
        },
        removeFromStandby: (state, action: PayloadAction<string[]>) => {
            state.standbyPlayers = state.standbyPlayers.filter(
                player => !action.payload.includes(player.id)
            );
        }
    }
});

export const {
    addPlayer,
    togglePlayerEnabled,
    updatePlayerStatus,
    incrementGameCount,
    moveToStandby,
    removeFromStandby
} = playerSlice.actions;

export default playerSlice.reducer; 