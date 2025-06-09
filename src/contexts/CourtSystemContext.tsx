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
    finishGame: (courtId: string) => void;
    movePlayersToStandby: (players: Player[]) => void;
}

const CourtSystemContext = createContext<CourtSystemContextType | undefined>(undefined);

const INIT_COURTS = 4;

export const CourtSystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // 使用測試數據初始化
    const [state, courtDispatch] = useReducer(courtReducer, INIT_COURTS, (initialCount) =>
        createInitialState(initialCount, generateTestPlayers())
    );

    // 自動分配場地的效果
    useEffect(() => {
        if (state.autoAssign) {
            const newState = checkAndAssignCourt(state);
            if (newState) {
                courtDispatch({ type: 'AUTO_ASSIGN', newState });
            }
        }
    }, [state]);

    const setCourtCount = (count: number) => {
        courtDispatch({ type: 'UPDATE_COURT_COUNT', count });
    };

    const toggleAutoAssign = () => {
        courtDispatch({ type: 'TOGGLE_AUTO_ASSIGN' });
    };

    const finishGame = (courtId: string) => {
        courtDispatch({ type: 'FINISH_GAME', courtId });
    };

    const movePlayersToStandby = (players: Player[]) => {
        courtDispatch({ type: 'MOVE_TO_STANDBY', players });
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
            finishGame,
            movePlayersToStandby,
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