import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { courtReducer, createInitialState } from '../reducers/courtReducer';
import { checkAndAssignCourt } from '../utils/courtUtils';
import { CourtType, PlayerGroup, Player, Gender } from '../types/court';

const STORAGE_KEY = 'goodminton_players';

// 從 localStorage 讀取球員資料，如果沒有則返回空陣列
const loadPlayersFromStorage = (): Player[] => {
    const storedPlayers = localStorage.getItem(STORAGE_KEY);
    if (storedPlayers) {
        try {
            const players = JSON.parse(storedPlayers);
            // 確保日期欄位正確轉換回 Date 物件
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
    addPlayer: (playerData: { name: string; gender: Gender; level: number; labels: string[] }) => void;
}

const CourtSystemContext = createContext<CourtSystemContextType | undefined>(undefined);

const INIT_COURTS = 4;

export const CourtSystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(courtReducer, INIT_COURTS, (initialCount) =>
        createInitialState(initialCount, loadPlayersFromStorage())
    );
    const [allPlayers, setAllPlayers] = React.useState<Player[]>(loadPlayersFromStorage());

    // 當球員列表變更時，保存到 localStorage
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allPlayers));
    }, [allPlayers]);

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

    const addPlayer = (playerData: { name: string; gender: Gender; level: number; labels: string[] }) => {
        const newPlayer: Player = {
            id: `player-${Date.now()}`,
            ...playerData,
            enabled: true,
            isPlaying: false,
            isQueuing: false,
            lastEnabledTime: new Date(),
            gameCount: 0
        };

        setAllPlayers(prev => [...prev, newPlayer]);
        dispatch({ type: 'ADD_PLAYER', player: newPlayer });
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
            addPlayer,
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