import React, { createContext, useContext, useState, useEffect } from 'react';
import { Player, Court, PlayerGroup, } from '../types/court'; import { useAppSelector, useAppDispatch } from '../store/hooks';
import { selectAllPlayers } from '../store/playerSlice';

const STORAGE_KEY = 'goodminton_players';
const INIT_COURTS = 4;

const loadPlayersFromStorage = (): Player[] => {
    try {
        const playersJson = localStorage.getItem('players');
        if (!playersJson) return [];
        const players = JSON.parse(playersJson);
        if (!Array.isArray(players)) return [];
        return players.map((p: Player) => ({
            ...p,
        }));
    } catch (e) {
        console.error('Failed to parse players from localStorage:', e);
        return [];
    }
};

interface CourtSystemContextType {
    players: Player[];
    courts: Court[];
    standbyPlayers: Player[];
    waitingQueue: PlayerGroup[];
    autoAssign: boolean;
    courtCount: number;
    allPlayers: Player[];
    addPlayer: (player: Omit<Player, 'id' | 'enabled' | 'isPlaying' | 'isQueuing' | 'gamesPlayed'>) => void;
    removePlayer: (id: string) => void;
    togglePlayerEnabled: (id: string) => void;
    updatePlayerStatus: (playerId: string, isPlaying: boolean, isQueuing: boolean) => void;
    incrementGameCount: (playerId: string) => void;
    moveToStandby: (players: Player[]) => void;
    removeFromStandby: (playerIds: string[]) => void;
    addCourt: (court: Omit<Court, 'id'>) => void;
    removeCourt: (id: string) => void;
    toggleCourtEnabled: (id: string) => void;
    updateCourtPlayers: (courtId: string, playerIds: string[]) => void;
    setCourtCount: (count: number) => void;
    finishGame: (courtId: string) => void;
    movePlayersToStandby: (players: Player[]) => void;
    setAutoAssign: (value: boolean) => void;
}

export const CourtSystemContext = createContext<CourtSystemContextType | undefined>(undefined);

export const CourtSystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [players, setPlayers] = useState<Player[]>(loadPlayersFromStorage());
    const [courts, setCourts] = useState<Court[]>([]);
    const [standbyPlayers, setStandbyPlayers] = useState<Player[]>([]);
    const [waitingQueue, setWaitingQueue] = useState<PlayerGroup[]>([]);
    const [autoAssign, setAutoAssign] = useState(false);
    const [courtCount, setCourtCount] = useState(INIT_COURTS);
    const allPlayers = useAppSelector(selectAllPlayers);

    // Initialize courts
    useEffect(() => {
        const initialCourts: Court[] = Array.from({ length: courtCount }, (_, i) => ({
            id: `court-${i + 1}`,
            name: `Court ${i + 1}`,
            number: i + 1,
            players: [],
            maxPlayers: 4,
            enabled: true,
            isActive: false
        }));
        setCourts(initialCourts);
    }, [courtCount]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(players));
    }, [players]);

    useEffect(() => {
        // 當球員列表變化時，更新待命區
        // 1. 保留所有已經在待命區且仍然啟用的球員
        // 2. 添加所有新啟用的球員到待命區
        const updatedStandbyPlayers = allPlayers.filter(player =>
            player.enabled && !player.isPlaying && !player.isQueuing
        );

        setStandbyPlayers(updatedStandbyPlayers);
    }, [allPlayers]);

    const addPlayer = (playerData: Omit<Player, 'id' | 'enabled' | 'isPlaying' | 'isQueuing' | 'gamesPlayed'>) => {
        const newPlayer: Player = {
            ...playerData,
            id: crypto.randomUUID(),
            enabled: true,
            isPlaying: false,
            isQueuing: false,
            gamesPlayed: 0
        };
        setPlayers(prev => [...prev, newPlayer]);
    };

    const removePlayer = (id: string) => {
        setPlayers(prev => prev.filter(p => p.id !== id));
    };

    const togglePlayerEnabled = (id: string) => {
        setPlayers(prev => prev.map(p => {
            if (p.id === id) {
                return {
                    ...p,
                    enabled: !p.enabled
                };
            }
            return p;
        }));
    };

    const updatePlayerStatus = (playerId: string, isPlaying: boolean, isQueuing: boolean) => {
        setStandbyPlayers(prev => {
            // 如果球員變成非打球和非排隊狀態，且是啟用的，就加入待命區
            const player = allPlayers.find(p => p.id === playerId);
            if (!isPlaying && !isQueuing && player?.enabled) {
                if (!prev.some(p => p.id === playerId)) {
                    return [...prev, player];
                }
            }
            // 如果球員開始打球或排隊，就從待命區移除
            if (isPlaying || isQueuing) {
                return prev.filter(p => p.id !== playerId);
            }
            return prev;
        });
    };

    const incrementGameCount = (playerId: string) => {
        setPlayers(prev => prev.map(p => {
            if (p.id === playerId) {
                return {
                    ...p,
                    gamesPlayed: p.gamesPlayed + 1,
                };
            }
            return p;
        }));
    };

    const moveToStandby = (players: Player[]) => {
        setStandbyPlayers(prev => {
            const newPlayers = players.filter(p =>
                p.enabled && // 只添加已啟用的球員
                !prev.some(existingPlayer => existingPlayer.id === p.id) // 避免重複
            );
            return [...prev, ...newPlayers];
        });
    };

    const removeFromStandby = (playerIds: string[]) => {
        setStandbyPlayers(prev => prev.filter(player => !playerIds.includes(player.id)));
    };

    const addCourt = (courtData: Omit<Court, 'id'>) => {
        const newCourt: Court = {
            ...courtData,
            id: crypto.randomUUID()
        };
        setCourts(prev => [...prev, newCourt]);
    };

    const removeCourt = (id: string) => {
        setCourts(prev => prev.filter(c => c.id !== id));
    };

    const toggleCourtEnabled = (id: string) => {
        setCourts(prev => prev.map(c => {
            if (c.id === id) {
                return {
                    ...c,
                    enabled: !c.enabled
                };
            }
            return c;
        }));
    };

    const updateCourtPlayers = (courtId: string, playerIds: string[]) => {
        setCourts(prev => prev.map(c => {
            if (c.id === courtId) {
                return {
                    ...c,
                    players: playerIds,
                    isActive: playerIds.length > 0
                };
            }
            return c;
        }));
    };

    const finishGame = (courtId: string) => {
        const court = courts.find(c => c.id === courtId);
        if (court) {
            // Update player game counts
            court.players.forEach(playerId => {
                incrementGameCount(playerId);
            });
            // Clear court
            updateCourtPlayers(courtId, []);
        }
    };

    const movePlayersToStandby = moveToStandby;

    return (
        <CourtSystemContext.Provider value={{
            players,
            courts,
            standbyPlayers,
            waitingQueue,
            autoAssign,
            courtCount,
            allPlayers,
            addPlayer,
            removePlayer,
            togglePlayerEnabled,
            updatePlayerStatus,
            incrementGameCount,
            moveToStandby,
            removeFromStandby,
            addCourt,
            removeCourt,
            toggleCourtEnabled,
            updateCourtPlayers,
            setCourtCount,
            finishGame,
            movePlayersToStandby,
            setAutoAssign
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