import { CourtSystemState, PlayerGroup } from '../types/court';

export const findAvailableCourt = (courts: CourtSystemState['courts']) => {
    return courts.find(court => !court.isActive && court.players.length === 0);
};

export const findNextFullGroup = (waitingQueue: PlayerGroup[]) => {
    const firstFullGroupIndex = waitingQueue.findIndex(g => g.players.length === 4);
    // 如果4人組前面還有其他組，不進行上場
    if (firstFullGroupIndex > 0) return null;
    return waitingQueue.find(group => group.players.length === 4);
};

export const checkAndAssignCourt = (state: CourtSystemState): CourtSystemState | null => {
    // 如果沒有等待的組別，不需要分配
    if (state.waitingQueue.length === 0) {
        return null;
    }

    // 尋找空閒的場地
    const availableCourt = state.courts.find(court => !court.isActive && court.players.length === 0);
    if (!availableCourt) {
        return null;
    }

    // 取得等待時間最長的組別
    const nextGroup = state.waitingQueue[0];
    if (!nextGroup || nextGroup.players.length !== 4) {
        return null;
    }

    // 分配場地
    const newCourts = state.courts.map(court =>
        court.id === availableCourt.id
            ? {
                ...court,
                players: nextGroup.players.map(p => ({ ...p, isPlaying: true, isQueuing: false })),
                isActive: true,
                startTime: new Date(),
            }
            : court
    );

    // 更新等待隊列
    const newWaitingQueue = state.waitingQueue.slice(1);

    return {
        ...state,
        courts: newCourts,
        waitingQueue: newWaitingQueue,
    };
}; 