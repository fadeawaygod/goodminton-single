import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { courtReducer, createInitialState } from '../reducers/courtReducer';
import { checkAndAssignCourt } from '../utils/courtUtils';
import { CourtType, PlayerGroup, Player } from '../types/court';
import { generateTestPlayers } from '../utils/testData';

interface CourtSystemContextType {
    courtCount: number;
    setCourtCount: (count: number) => void;
    autoAssign: boolean;
    toggleAutoAssign: () => void;
    courts: CourtType[];
    waitingQueue: PlayerGroup[];
    standbyPlayers: Player[];
    allPlayers: Player[];
    finishGame: (courtId: string) => void;
    movePlayersToStandby: (players: Player[]) => void;
    togglePlayerEnabled: (playerId: string) => void;
}

const CourtSystemContext = createContext<CourtSystemContextType | undefined>(undefined);

const INIT_COURTS = 4;

export const CourtSystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(courtReducer, INIT_COURTS, (initialCount) =>
        createInitialState(initialCount, generateTestPlayers())
    );
    const [allPlayers, setAllPlayers] = React.useState<Player[]>(generateTestPlayers());

    useEffect(() => {
        if (state.autoAssign) {
            const newState = checkAndAssignCourt(state);
            if (newState) {
                dispatch({ type: 'AUTO_ASSIGN', newState });
            }
        }
    }, [state]);

    useEffect(() => {
        const courtPlayers = state.courts.flatMap(court => court.players);
        const queuePlayers = state.waitingQueue.flatMap(group => group.players);
        const activePlayerIds = new Set([
            ...courtPlayers.map(p => p.id),
            ...queuePlayers.map(p => p.id),
            ...state.standbyPlayers.map(p => p.id)
        ]);

        setAllPlayers(prev => prev.map(player => ({
            ...player,
            enabled: activePlayerIds.has(player.id)
        })));
    }, [state.courts, state.waitingQueue, state.standbyPlayers]);

    const setCourtCount = (count: number) => {
        dispatch({ type: 'UPDATE_COURT_COUNT', count });
    };

    const toggleAutoAssign = () => {
        dispatch({ type: 'TOGGLE_AUTO_ASSIGN' });
    };

    const finishGame = (courtId: string) => {
        dispatch({ type: 'FINISH_GAME', courtId });
    };

    const movePlayersToStandby = (players: Player[]) => {
        dispatch({ type: 'MOVE_TO_STANDBY', players });
    };

    const togglePlayerEnabled = (playerId: string) => {
        const player = allPlayers.find(p => p.id === playerId);
        if (!player) return;

        if (player.enabled) {
            dispatch({ type: 'DISABLE_PLAYER', playerId });
        } else {
            dispatch({ type: 'ENABLE_PLAYER', player });
        }
    };

    return (
        <CourtSystemContext.Provider value={{
            courtCount: state.courts.length,
            setCourtCount,
            autoAssign: state.autoAssign,
            toggleAutoAssign,
            courts: state.courts,
            waitingQueue: state.waitingQueue,
            standbyPlayers: state.standbyPlayers,
            allPlayers,
            finishGame,
            movePlayersToStandby,
            togglePlayerEnabled,
        }}>
            {children}
        </CourtSystemContext.Provider>
    );
};

export const useCourtSystem = () => {
    const context = useContext(CourtSystemContext);
    if (context === undefined) {
        throw new Error('useCourtSystem must be used within a CourtSystemProvider');
    }
    return context;
};