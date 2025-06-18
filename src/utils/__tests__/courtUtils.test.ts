import { findAvailableCourt, findNextFullGroup, checkAndAssignCourt } from '../courtUtils';
import { Court, PlayerGroup, CourtSystemState } from '../../types/court';
import { v4 as uuidv4 } from 'uuid';

describe('courtUtils', () => {
    describe('findAvailableCourt', () => {
        it('should return first available empty court', () => {
            // Arrange
            const courts: Court[] = [
                { id: 'court-1', name: '1', isActive: false, group: undefined },
                { id: 'court-2', name: '2', isActive: false, group: undefined },
                { id: 'court-3', name: '3', isActive: true, group: undefined },
            ];

            // Act
            const result = findAvailableCourt(courts);

            // Assert
            expect(result?.id).toBe('court-2');
        });

        it('should return undefined when no available court', () => {
            // Arrange
            const courts: Court[] = [
                { id: 'court-1', name: '1', isActive: true, group: undefined },
                { id: 'court-2', name: '2', isActive: false, group: undefined },
            ];

            // Act
            const result = findAvailableCourt(courts);

            // Assert
            expect(result).toBeUndefined();
        });
    });

    describe('findNextFullGroup', () => {
        it('should return first full group if it is at the front of queue', () => {
            // Arrange
            const fullGroup: PlayerGroup = {
                id: uuidv4(),
                players: Array(4).fill(null).map(() => ({
                    id: uuidv4(),
                    name: 'Player',
                    gender: 'unknown',
                    level: 1,
                    enabled: true,
                    isPlaying: false,
                    isQueuing: true,
                    gamesPlayed: 0,
                })),
                createdAt: new Date(),
                court: undefined,
            };
            const waitingQueue = [
                fullGroup,
                { ...fullGroup, id: uuidv4(), players: [fullGroup.players[0]] },
            ];

            // Act
            const result = findNextFullGroup(waitingQueue);

            // Assert
            expect(result?.id).toBe(fullGroup.id);
        });

        it('should return null if full group is not at front of queue', () => {
            // Arrange
            const fullGroup: PlayerGroup = {
                id: uuidv4(),
                players: Array(4).fill(null).map(() => ({
                    id: uuidv4(),
                    name: 'Player',
                    gender: 'unknown',
                    level: 1,
                    enabled: true,
                    isPlaying: false,
                    isQueuing: true,
                    gamesPlayed: 0,
                })),
                createdAt: new Date(),
                court: undefined,
            };
            const waitingQueue = [
                { ...fullGroup, id: uuidv4(), players: [fullGroup.players[0]] },
                fullGroup,
            ];

            // Act
            const result = findNextFullGroup(waitingQueue);

            // Assert
            expect(result).toBeNull();
        });
    });

    describe('checkAndAssignCourt', () => {
        it('should assign full group to empty court when auto assign is enabled', () => {
            // Arrange
            const fullGroup: PlayerGroup = {
                id: uuidv4(),
                players: Array(4).fill(null).map(() => ({
                    id: uuidv4(),
                    name: 'Player',
                    gender: 'unknown',
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
                courts: [
                    { id: 'court-1', name: '1', isActive: false, group: undefined },
                ],
                waitingQueue: [fullGroup],
                standbyPlayers: [],
                autoAssign: true,
            };

            // Act
            const result = checkAndAssignCourt(state);

            // Assert
            expect(result).not.toBeNull();
            expect(result?.courts[0].group?.players).toHaveLength(4);
            expect(result?.courts[0].isActive).toBeTruthy();
            expect(result?.waitingQueue).toHaveLength(0);
        });

        it('should return null when auto assign is disabled', () => {
            // Arrange
            const state: CourtSystemState = {
                courts: [{ id: 'court-1', name: '1', isActive: false, group: undefined }],
                waitingQueue: [],
                standbyPlayers: [],
                autoAssign: false,
            };

            // Act
            const result = checkAndAssignCourt(state);

            // Assert
            expect(result).toBeNull();
        });
    });
}); 