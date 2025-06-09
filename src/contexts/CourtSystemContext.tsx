import React, { createContext, useContext, useState, useEffect } from 'react';
import { Player, Gender, Court, PlayerGroup, CourtSystemState } from '../types/court';

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
}

export const CourtSystemContext = createContext<CourtSystemContextType | undefined>(undefined);

export const CourtSystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [players, setPlayers] = useState<Player[]>(loadPlayersFromStorage());
    const [courts, setCourts] = useState<Court[]>([]);
    const [standbyPlayers, setStandbyPlayers] = useState<Player[]>([]);
    const [waitingQueue, setWaitingQueue] = useState<PlayerGroup[]>([]);
    const [autoAssign, setAutoAssign] = useState(true);
    const [courtCount, setCourtCount] = useState(INIT_COURTS);

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
        setPlayers(prev => prev.map(p => {
            if (p.id === playerId) {
                const newPlayer = {
                    ...p,
                    isPlaying,
                    isQueuing,
                };
                if (!isPlaying && p.isPlaying) {
                    newPlayer.gamesPlayed += 1;
                }
                return newPlayer;
            }
            return p;
        }));
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

    const moveToStandby = (playersToMove: Player[]) => {
        const playerIds = playersToMove.map(p => p.id);
        setStandbyPlayers(prev => [
            ...prev,
            ...playersToMove.filter(p => !prev.some(sp => sp.id === p.id))
        ]);
        setPlayers(prev => prev.map(player => {
            if (playerIds.includes(player.id)) {
                return {
                    ...player,
                    isPlaying: false,
                    isQueuing: false
                };
            }
            return player;
        }));
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

    // Calculate allPlayers based on current state
    const allPlayers = players;

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
            movePlayersToStandby
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