import { findAvailableCourt, findNextFullGroup, checkAndAssignCourt } from '../courtUtils';
import { Court, PlayerGroup, CourtSystemState } from '../../types/court';
import { v4 as uuidv4 } from 'uuid';

describe('courtUtils', () => {
    describe('findAvailableCourt', () => {
        it('should return first available empty court', () => {
            // Arrange
            const courts: Court[] = [
                { id: 'court-1', number: 1, players: [{ id: '1', name: 'Player 1', isPlaying: true, isQueuing: false }], isActive: false },
                { id: 'court-2', number: 2, players: [], isActive: false },
                { id: 'court-3', number: 3, players: [], isActive: true },
            ];

            // Act
            const result = findAvailableCourt(courts);

            // Assert
            expect(result?.id).toBe('court-2');
        });

        it('should return undefined when no available court', () => {
            // Arrange
            const courts: Court[] = [
                { id: 'court-1', number: 1, players: [], isActive: true },
                { id: 'court-2', number: 2, players: [{ id: '1', name: 'Player 1', isPlaying: true, isQueuing: false }], isActive: false },
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
                    isPlaying: false,
                    isQueuing: true,
                })),
                createdAt: new Date(),
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
                    isPlaying: false,
                    isQueuing: true,
                })),
                createdAt: new Date(),
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
                    isPlaying: false,
                    isQueuing: true,
                })),
                createdAt: new Date(),
            };
            const state: CourtSystemState = {
                courts: [
                    { id: 'court-1', number: 1, players: [], isActive: false },
                ],
                waitingQueue: [fullGroup],
                standbyPlayers: [],
                autoAssign: true,
            };

            // Act
            const result = checkAndAssignCourt(state);

            // Assert
            expect(result).not.toBeNull();
            expect(result?.courts[0].players).toHaveLength(4);
            expect(result?.courts[0].isActive).toBeTruthy();
            expect(result?.waitingQueue).toHaveLength(0);
        });

        it('should return null when auto assign is disabled', () => {
            // Arrange
            const state: CourtSystemState = {
                courts: [{ id: 'court-1', number: 1, players: [], isActive: false }],
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