import { Player, CourtType, PlayerGroup, CourtSystemState } from '../types/court';
import { v4 as uuidv4 } from "uuid";

export const createInitialState = (courtCount: number, initialPlayers: Player[] = []): CourtSystemState => ({
    courts: Array(courtCount)
        .fill(null)
        .map((_, index) => ({
            id: `court-${index + 1}`,
            name: `Court ${index + 1}`,
            number: index + 1,
            players: [],
            maxPlayers: 4,
            enabled: true,
            isActive: false
        })),
    waitingQueue: [],
    standbyPlayers: initialPlayers,
    autoAssign: true,
});

type CourtAction =
    | { type: 'UPDATE_COURT_COUNT'; count: number }
    | { type: 'TOGGLE_AUTO_ASSIGN' }
    | { type: 'FINISH_GAME'; courtId: string }
    | { type: 'MOVE_TO_STANDBY'; players: Player[] }
    | { type: 'ENABLE_PLAYER'; player: Player }
    | { type: 'DISABLE_PLAYER'; playerId: string }
    | { type: 'ADD_PLAYER'; player: Player }
    | { type: 'AUTO_ASSIGN'; newState: CourtSystemState };

export const courtReducer = (state: CourtSystemState, action: CourtAction): CourtSystemState => {
    switch (action.type) {
        case 'UPDATE_COURT_COUNT': {
            const { count } = action;
            if (count === state.courts.length) {
                return state;
            }

            if (count < state.courts.length) {
                // Remove courts from the end
                return {
                    ...state,
                    courts: state.courts.slice(0, count),
                };
            } else {
                // Add new courts
                const newCourts: CourtType[] = Array(count - state.courts.length)
                    .fill(null)
                    .map((_, index) => ({
                        id: `court-${state.courts.length + index + 1}`,
                        name: `Court ${state.courts.length + index + 1}`,
                        number: state.courts.length + index + 1,
                        players: [],
                        maxPlayers: 4,
                        enabled: true,
                        isActive: false
                    }));

                return {
                    ...state,
                    courts: [...state.courts, ...newCourts],
                };
            }
        }

        case 'TOGGLE_AUTO_ASSIGN':
            return {
                ...state,
                autoAssign: !state.autoAssign,
            };

        case 'FINISH_GAME': {
            const courtIndex = state.courts.findIndex(c => c.id === action.courtId);
            if (courtIndex === -1) return state;

            const newCourts = [...state.courts];
            newCourts[courtIndex] = {
                ...newCourts[courtIndex],
                players: [],
                isActive: false
            };

            return {
                ...state,
                courts: newCourts,
            };
        }

        case 'MOVE_TO_STANDBY':
            return {
                ...state,
                standbyPlayers: [
                    ...state.standbyPlayers,
                    ...action.players.filter(p => !state.standbyPlayers.some(sp => sp.id === p.id))
                ],
            };

        case 'ENABLE_PLAYER':
            return {
                ...state,
                standbyPlayers: [...state.standbyPlayers, action.player],
            };

        case 'DISABLE_PLAYER': {
            const { playerId } = action;

            // Remove from courts
            const newCourts = state.courts.map(court => ({
                ...court,
                players: court.players.filter(p => p.id !== playerId),
            }));

            // Remove from waiting queue
            const newQueue = state.waitingQueue.map(group => ({
                ...group,
                players: group.players.filter(p => p.id !== playerId),
            })).filter(group => group.players.length > 0);

            // Remove from standby
            const newStandby = state.standbyPlayers.filter(p => p.id !== playerId);

            return {
                ...state,
                courts: newCourts,
                waitingQueue: newQueue,
                standbyPlayers: newStandby,
            };
        }

        case 'ADD_PLAYER':
            return {
                ...state,
                standbyPlayers: [...state.standbyPlayers, action.player],
            };

        case 'AUTO_ASSIGN':
            return action.newState;

        default:
            return state;
    }
};
