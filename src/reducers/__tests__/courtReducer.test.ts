import { courtReducer, createInitialState } from '../courtReducer';
import { Player, CourtSystemState, PlayerGroup, Gender, Court } from '../../types/court';
import { v4 as uuidv4 } from 'uuid';

describe('courtReducer', () => {
    let mockPlayer: Player;
    let initialState: CourtSystemState;

    beforeEach(() => {
        mockPlayer = {
            id: uuidv4(),
            name: 'Test Player',
            gender: 'unknown' as Gender,
            level: 1,
            enabled: true,
            isPlaying: false,
            isQueuing: false,
            gamesPlayed: 0,
        };
        initialState = createInitialState(2, [mockPlayer]);
    });

    describe('FINISH_GAME', () => {
        it('should move players from court to standby area when game is finished', () => {
            // Arrange
            const courtId = 'court-1';
            const players = [
                { ...mockPlayer, isPlaying: true },
                { 
                    id: uuidv4(), 
                    name: 'Player 2', 
                    gender: 'unknown' as Gender,
                    level: 1,
                    enabled: true,
                    isPlaying: true, 
                    isQueuing: false,
                    gamesPlayed: 0,
                },
            ];
            const group: PlayerGroup = {
                id: uuidv4(),
                players,
                createdAt: new Date(),
                court: undefined,
            };
            const state: CourtSystemState = {
                ...initialState,
                courts: initialState.courts.map(court =>
                    court.id === courtId
                        ? { ...court, group, isActive: true }
                        : court
                ),
                standbyPlayers: [],
            };

            // Act
            const newState = courtReducer(state, { type: 'FINISH_GAME', courtId });

            // Assert
            expect(newState.courts[0].group).toBeUndefined();
            expect(newState.courts[0].isActive).toBeFalsy();
            expect(newState.standbyPlayers).toHaveLength(2);
            expect(newState.standbyPlayers.every((p: Player) => !p.isPlaying)).toBeTruthy();
        });

        it('should not modify state when court is not active', () => {
            // Arrange
            const courtId = 'court-1';
            const state = {
                ...initialState,
                courts: [{ ...initialState.courts[0], isActive: false }],
            };

            // Act
            const newState = courtReducer(state, { type: 'FINISH_GAME', courtId });

            // Assert
            expect(newState).toEqual(state);
        });
    });

    describe('PLAYER_DROP', () => {
        it('should create new group in waiting queue when dropping player without target court', () => {
            // Act
            const newState = courtReducer(initialState, {
                type: 'PLAYER_DROP',
                player: mockPlayer,
            });

            // Assert
            expect(newState.waitingQueue).toHaveLength(1);
            expect(newState.waitingQueue[0].players).toHaveLength(1);
            expect(newState.waitingQueue[0].players[0].isQueuing).toBeTruthy();
            expect(newState.standbyPlayers).toHaveLength(0);
        });

        it('should add player to existing court group when target court has space', () => {
            // Arrange
            const courtId = 'court-1';
            const existingPlayers = [
                { 
                    id: uuidv4(), 
                    name: 'Player 2', 
                    gender: 'unknown' as Gender,
                    level: 1,
                    enabled: true,
                    isPlaying: true, 
                    isQueuing: false,
                    gamesPlayed: 0,
                },
            ];
            const group: PlayerGroup = {
                id: uuidv4(),
                players: existingPlayers,
                createdAt: new Date(),
                court: undefined,
            };
            const state: CourtSystemState = {
                ...initialState,
                courts: initialState.courts.map(court =>
                    court.id === courtId
                        ? { ...court, group }
                        : court
                ),
            };

            // Act
            const newState = courtReducer(state, {
                type: 'PLAYER_DROP',
                player: mockPlayer,
                targetCourtId: courtId,
            });

            // Assert
            const targetCourt = newState.courts.find((c: Court) => c.id === courtId);
            expect(targetCourt?.group?.players).toHaveLength(2);
            expect(targetCourt?.group?.players.some((p: Player) => p.id === mockPlayer.id)).toBeTruthy();
        });
    });

    describe('PLAYER_DROP_TO_GROUP', () => {
        it('should add player to existing group in waiting queue', () => {
            // Arrange
            const groupId = uuidv4();
            const existingGroup: PlayerGroup = {
                id: groupId,
                players: [{ 
                    id: uuidv4(), 
                    name: 'Player 2', 
                    gender: 'unknown' as Gender,
                    level: 1,
                    enabled: true,
                    isPlaying: false, 
                    isQueuing: true,
                    gamesPlayed: 0,
                }],
                createdAt: new Date(),
                court: undefined,
            };
            const state: CourtSystemState = {
                ...initialState,
                waitingQueue: [existingGroup],
            };

            // Act
            const newState = courtReducer(state, {
                type: 'PLAYER_DROP_TO_GROUP',
                player: mockPlayer,
                groupId,
            });

            // Assert
            expect(newState.waitingQueue[0].players).toHaveLength(2);
            expect(newState.waitingQueue[0].players.some((p: Player) => p.id === mockPlayer.id)).toBeTruthy();
        });

        it('should not modify state when target group is full', () => {
            // Arrange
            const groupId = uuidv4();
            const fullGroup: PlayerGroup = {
                id: groupId,
                players: Array(4).fill(null).map(() => ({
                    id: uuidv4(),
                    name: 'Player',
                    gender: 'unknown' as Gender,
                    level: 1,
                    enabled: true,
                    isPlaying: false,
                    isQueuing: true,
                    gamesPlayed: 0,
                })),
                createdAt: new Date(),
                court: undefined,
            };
            const state: CourtSystemState = {
                ...initialState,
                waitingQueue: [fullGroup],
            };

            // Act
            const newState = courtReducer(state, {
                type: 'PLAYER_DROP_TO_GROUP',
                player: mockPlayer,
                groupId,
            });

            // Assert
            expect(newState).toEqual(state);
        });
    });

    describe('QUEUE_REORDER', () => {
        it('should reorder groups in waiting queue', () => {
            // Arrange
            const group1: PlayerGroup = {
                id: uuidv4(),
                players: [mockPlayer],
                createdAt: new Date(),
                court: undefined,
            };
            const group2: PlayerGroup = {
                id: uuidv4(),
                players: [{ ...mockPlayer, id: uuidv4() }],
                createdAt: new Date(),
                court: undefined,
            };
            const state: CourtSystemState = {
                ...initialState,
                waitingQueue: [group1, group2],
            };

            // Act
            const newState = courtReducer(state, {
                type: 'QUEUE_REORDER',
                dragIndex: 0,
                hoverIndex: 1,
            });

            // Assert
            expect(newState.waitingQueue[0].id).toBe(group2.id);
            expect(newState.waitingQueue[1].id).toBe(group1.id);
        });
    });

    describe('UPDATE_COURT_COUNT', () => {
        it('should add new courts when increasing court count', () => {
            // Act
            const newState = courtReducer(initialState, {
                type: 'UPDATE_COURT_COUNT',
                count: 4,
            });

            // Assert
            expect(newState.courts).toHaveLength(4);
            expect(newState.courts[2].number).toBe(3);
            expect(newState.courts[3].number).toBe(4);
        });

        it('should move players to standby when reducing court count', () => {
            // Arrange
            const state: CourtSystemState = {
                ...initialState,
                courts: [
                    ...initialState.courts,
                    {
                        id: 'court-3',
                        number: 3,
                        players: [{ ...mockPlayer, isPlaying: true }],
                        isActive: true,
                    },
                ],
            };

            // Act
            const newState = courtReducer(state, {
                type: 'UPDATE_COURT_COUNT',
                count: 2,
            });

            // Assert
            expect(newState.courts).toHaveLength(2);
            expect(newState.standbyPlayers).toHaveLength(2);
            expect(newState.standbyPlayers.some(p => !p.isPlaying)).toBeTruthy();
        });

        it('should not modify state when court count is unchanged', () => {
            // Act
            const newState = courtReducer(initialState, {
                type: 'UPDATE_COURT_COUNT',
                count: 2,
            });

            // Assert
            expect(newState).toEqual(initialState);
        });
    });

    describe('TOGGLE_AUTO_ASSIGN', () => {
        it('should toggle auto assign state', () => {
            // Act
            const newState = courtReducer(initialState, { type: 'TOGGLE_AUTO_ASSIGN' });

            // Assert
            expect(newState.autoAssign).toBe(!initialState.autoAssign);
        });
    });
}); 