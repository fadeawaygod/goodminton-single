import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Player, PlayerGroup, CourtType, CourtSystemState } from '../types/court';
import { useCourtSystem } from '../contexts/CourtSystemContext';

export const useCourtSystemState = (onSnackbarMessage?: (message: string, severity: 'success' | 'info' | 'warning' | 'error') => void) => {
    const {
        courts,
        waitingQueue,
        autoAssign,
        standbyPlayers,
        setCourtCount,
        finishGame: contextFinishGame,
        movePlayersToStandby,
        courtCount
    } = useCourtSystem();

    const [systemState, setSystemState] = useState<CourtSystemState>({
        courts,
        waitingQueue,
        standbyPlayers,
        autoAssign,
    });

    const handleFinishGame = useCallback((courtId: string) => {
        const court = systemState.courts.find(c => c.id === courtId);
        if (!court || !court.isActive) return;

        contextFinishGame(courtId);
        onSnackbarMessage?.('court.gameFinished', 'success');
    }, [systemState.courts, contextFinishGame, onSnackbarMessage]);

    const handlePlayerDrop = useCallback((player: Player, targetCourtId?: string) => {
        setSystemState(prevState => {
            if (targetCourtId) {
                const targetCourt = prevState.courts.find(c => c.id === targetCourtId);
                if (targetCourt && !targetCourt.isActive) {
                    if (targetCourt.players.length > 0 && targetCourt.players.length < 4) {
                        if (targetCourt.players.some(p => p.id === player.id)) {
                            onSnackbarMessage?.('court.playerAlreadyInCourt', 'warning');
                            return prevState;
                        }
                        const updatedCourts = prevState.courts.map(court => {
                            if (court.id === targetCourtId) {
                                return {
                                    ...court,
                                    players: [...court.players, { ...player, isPlaying: true, isQueuing: false }],
                                    isActive: court.players.length + 1 === 4
                                };
                            }
                            if (court.players.some(p => p.id === player.id)) {
                                const remainingPlayers = court.players.filter(p => p.id !== player.id);
                                return {
                                    ...court,
                                    players: remainingPlayers,
                                    isActive: remainingPlayers.length === 4
                                };
                            }
                            return court;
                        });

                        const updatedStandbyPlayers = prevState.standbyPlayers.filter(p => p.id !== player.id);
                        const updatedWaitingQueue = prevState.waitingQueue
                            .map(group => ({
                                ...group,
                                players: group.players.filter(p => p.id !== player.id)
                            }))
                            .filter(group => group.players.length > 0);

                        return {
                            ...prevState,
                            courts: updatedCourts,
                            waitingQueue: updatedWaitingQueue,
                            standbyPlayers: updatedStandbyPlayers,
                        };
                    } else if (targetCourt.players.length === 0) {
                        const updatedCourts = prevState.courts.map(court => {
                            if (court.id === targetCourtId) {
                                return {
                                    ...court,
                                    players: [{ ...player, isPlaying: true, isQueuing: false }],
                                    isActive: false
                                };
                            }
                            if (court.players.some(p => p.id === player.id)) {
                                const remainingPlayers = court.players.filter(p => p.id !== player.id);
                                return {
                                    ...court,
                                    players: remainingPlayers,
                                    isActive: remainingPlayers.length === 4
                                };
                            }
                            return court;
                        });

                        const updatedStandbyPlayers = prevState.standbyPlayers.filter(p => p.id !== player.id);
                        const updatedWaitingQueue = prevState.waitingQueue
                            .map(group => ({
                                ...group,
                                players: group.players.filter(p => p.id !== player.id)
                            }))
                            .filter(group => group.players.length > 0);

                        return {
                            ...prevState,
                            courts: updatedCourts,
                            waitingQueue: updatedWaitingQueue,
                            standbyPlayers: updatedStandbyPlayers,
                        };
                    }
                }
            }

            const newGroup: PlayerGroup = {
                id: uuidv4(),
                players: [{ ...player, isQueuing: true, isPlaying: false }],
                createdAt: new Date(),
            };

            const updatedCourts = prevState.courts.map(court => {
                if (court.players.some(p => p.id === player.id)) {
                    const remainingPlayers = court.players.filter(p => p.id !== player.id);
                    return {
                        ...court,
                        players: remainingPlayers,
                        isActive: remainingPlayers.length === 4
                    };
                }
                return court;
            });

            const updatedStandbyPlayers = prevState.standbyPlayers.filter(p => p.id !== player.id);
            const updatedWaitingQueue = [
                ...prevState.waitingQueue.map(group => ({
                    ...group,
                    players: group.players.filter(p => p.id !== player.id)
                })).filter(group => group.players.length > 0),
                newGroup
            ];

            onSnackbarMessage?.(targetCourtId ? 'court.playerAddedToCourt' : 'court.newGroupCreated', 'info');

            return {
                ...prevState,
                courts: updatedCourts,
                waitingQueue: updatedWaitingQueue,
                standbyPlayers: updatedStandbyPlayers,
            };
        });
    }, [onSnackbarMessage]);

    const handlePlayerDropToGroup = useCallback((player: Player, groupId: string) => {
        setSystemState(prevState => {
            const targetGroup = prevState.waitingQueue.find(g => g.id === groupId);
            if (!targetGroup || targetGroup.players.length >= 4) {
                onSnackbarMessage?.('court.maxPlayersSelected', 'error');
                return prevState;
            }
            if (targetGroup.players.some(p => p.id === player.id)) {
                onSnackbarMessage?.('court.playerAlreadyInGroup', 'warning');
                return prevState;
            }

            const updatedCourts = prevState.courts.map(court => {
                if (court.players.some(p => p.id === player.id)) {
                    const remainingPlayers = court.players.filter(p => p.id !== player.id);
                    return {
                        ...court,
                        players: remainingPlayers,
                        isActive: remainingPlayers.length === 4
                    };
                }
                return court;
            });

            const updatedStandbyPlayers = prevState.standbyPlayers.filter(p => p.id !== player.id);
            const updatedWaitingQueue = prevState.waitingQueue.map(group => {
                if (group.id === groupId) {
                    return {
                        ...group,
                        players: [...group.players, { ...player, isPlaying: false, isQueuing: true }]
                    };
                }
                return {
                    ...group,
                    players: group.players.filter(p => p.id !== player.id)
                };
            }).filter(group => group.players.length > 0);

            return {
                ...prevState,
                courts: updatedCourts,
                waitingQueue: updatedWaitingQueue,
                standbyPlayers: updatedStandbyPlayers,
            };
        });
    }, [onSnackbarMessage]);

    const handleQueueReorder = useCallback((dragIndex: number, hoverIndex: number) => {
        setSystemState(prevState => {
            const updatedQueue = [...prevState.waitingQueue];
            const [draggedGroup] = updatedQueue.splice(dragIndex, 1);
            updatedQueue.splice(hoverIndex, 0, draggedGroup);

            return {
                ...prevState,
                waitingQueue: updatedQueue
            };
        });
    }, []);

    const handleCourtGroupMove = useCallback((fromCourtId: string, toCourtId: string) => {
        setSystemState(prevState => {
            const fromCourt = prevState.courts.find(c => c.id === fromCourtId);
            const toCourt = prevState.courts.find(c => c.id === toCourtId);

            if (!fromCourt || !toCourt || toCourt.isActive) return prevState;

            const updatedCourts = prevState.courts.map(court => {
                if (court.id === fromCourtId) {
                    return { ...court, players: [], isActive: false, startTime: undefined };
                }
                if (court.id === toCourtId) {
                    return {
                        ...court,
                        players: fromCourt.players,
                        isActive: true,
                        startTime: new Date(),
                    };
                }
                return court;
            });

            onSnackbarMessage?.('court.groupMovedToCourt', 'success');

            return {
                ...prevState,
                courts: updatedCourts,
            };
        });
    }, [onSnackbarMessage]);

    const handlePlayerMoveToStandby = useCallback((player: Player) => {
        setSystemState(prevState => {
            const updatedWaitingQueue = prevState.waitingQueue.map(group => ({
                ...group,
                players: group.players.filter(p => p.id !== player.id)
            })).filter(group => group.players.length > 0);

            const updatedPlayer = { ...player, isQueuing: false, isPlaying: false };

            return {
                ...prevState,
                waitingQueue: updatedWaitingQueue,
                standbyPlayers: [...prevState.standbyPlayers, updatedPlayer],
            };
        });
    }, []);

    const handleAutoAssignToggle = useCallback(() => {
        setSystemState(prevState => ({
            ...prevState,
            autoAssign: !prevState.autoAssign
        }));

        onSnackbarMessage?.(
            systemState.autoAssign ? 'court.autoAssignDisabled' : 'court.autoAssignEnabled',
            'info'
        );
    }, [systemState.autoAssign, onSnackbarMessage]);

    const handleGroupAssign = useCallback((groupId: string, courtId: string) => {
        setSystemState(prevState => {
            const group = prevState.waitingQueue.find(g => g.id === groupId);
            if (!group) return prevState;

            const court = prevState.courts.find(c => c.id === courtId);
            if (!court || court.isActive || court.players.length > 0) return prevState;

            const updatedCourts = prevState.courts.map(c =>
                c.id === courtId
                    ? {
                        ...c,
                        players: group.players.map(p => ({ ...p, isPlaying: true, isQueuing: false })),
                        isActive: group.players.length === 4,
                        startTime: group.players.length === 4 ? new Date() : undefined,
                    }
                    : c
            );

            const updatedWaitingQueue = prevState.waitingQueue.filter(g => g.id !== groupId);

            onSnackbarMessage?.('court.groupMovedToCourt', 'success');

            return {
                ...prevState,
                courts: updatedCourts,
                waitingQueue: updatedWaitingQueue,
            };
        });
    }, [onSnackbarMessage]);

    const handlePlayingGroupToQueue = useCallback((players: Player[]) => {
        setSystemState(prev => {
            const fromCourt = prev.courts.find(court =>
                court.players.some(p => players.some(pl => pl.id === p.id))
            );
            if (!fromCourt) return prev;

            const cleanedQueue = prev.waitingQueue.map(group => ({
                ...group,
                players: group.players.filter(p => !players.some(pl => pl.id === p.id))
            })).filter(group => group.players.length > 0);

            const newGroup: PlayerGroup = {
                id: uuidv4(),
                players: players.map(p => ({ ...p, isPlaying: false, isQueuing: true })),
                createdAt: new Date(),
            };

            return {
                ...prev,
                courts: prev.courts.map(court => {
                    if (court.id === fromCourt.id) {
                        return { ...court, players: [], isActive: false, startTime: undefined };
                    }
                    return court;
                }),
                waitingQueue: [...cleanedQueue, newGroup],
            };
        });

        onSnackbarMessage?.('court.groupMovedToQueue', 'info');
    }, [onSnackbarMessage]);

    const handleGroupDissolve = useCallback((players: Player[]) => {
        const fromCourt = systemState.courts.find(court =>
            court.players.some(p => players.includes(p))
        );

        if (!fromCourt) return;

        movePlayersToStandby(players);
        onSnackbarMessage?.('court.groupDissolved', 'info');
    }, [systemState.courts, movePlayersToStandby, onSnackbarMessage]);

    return {
        systemState,
        setSystemState,
        handleFinishGame,
        handlePlayerDrop,
        handlePlayerDropToGroup,
        handleQueueReorder,
        handleCourtGroupMove,
        handlePlayerMoveToStandby,
        handleAutoAssignToggle,
        handleGroupAssign,
        handlePlayingGroupToQueue,
        handleGroupDissolve,
    };
}; 