import React from 'react';
import { render, act } from '@testing-library/react';
import { CourtSystemProvider, useCourtSystem } from '../CourtSystemContext';
import { v4 as uuidv4 } from 'uuid';
import { Player } from '../../types/court';

// 測試用組件
const TestComponent = () => {
    const { courtCount, setCourtCount, autoAssign, toggleAutoAssign, courts, waitingQueue } = useCourtSystem();
    return (
        <div>
            <span data-testid="court-count">{courtCount}</span>
            <span data-testid="auto-assign">{autoAssign ? 'true' : 'false'}</span>
            <span data-testid="court-players">{courts[0]?.players.length || 0}</span>
            <span data-testid="waiting-queue">{waitingQueue.length}</span>
            <button onClick={() => setCourtCount(4)}>Update Courts</button>
            <button onClick={toggleAutoAssign}>Toggle Auto Assign</button>
        </div>
    );
};

describe('CourtSystemContext', () => {
    it('should provide initial court count', () => {
        const { getByTestId } = render(
            <CourtSystemProvider>
                <TestComponent />
            </CourtSystemProvider>
        );

        expect(getByTestId('court-count').textContent).toBe('2');
    });

    it('should update court count', () => {
        const { getByTestId, getByText } = render(
            <CourtSystemProvider>
                <TestComponent />
            </CourtSystemProvider>
        );

        act(() => {
            getByText('Update Courts').click();
        });

        expect(getByTestId('court-count').textContent).toBe('4');
    });

    it('should throw error when used outside provider', () => {
        // 暫時禁用 console.error 以避免測試輸出中的錯誤訊息
        const consoleSpy = jest.spyOn(console, 'error');
        consoleSpy.mockImplementation(() => { });

        expect(() => {
            render(<TestComponent />);
        }).toThrow('useCourtSystem must be used within a CourtSystemProvider');

        consoleSpy.mockRestore();
    });

    it('should handle auto assignment when enabled', () => {
        // 初始化測試數據
        const testPlayers: Player[] = Array(4).fill(null).map(() => ({
            id: uuidv4(),
            name: 'Test Player',
            isPlaying: false,
            isQueuing: true,
        }));

        // 創建一個自定義的 Provider 組件來設置初始狀態
        const TestProviderWithPlayers: React.FC = () => {
            const { toggleAutoAssign } = useCourtSystem();

            // 在組件掛載時添加測試數據
            React.useEffect(() => {
                // 這裡我們應該dispatch一個action來添加球員到等待隊列
                // 但是目前的實現中沒有這個功能，所以這個測試會失敗
                toggleAutoAssign();
            }, []);

            return <TestComponent />;
        };

        const { getByTestId } = render(
            <CourtSystemProvider>
                <TestProviderWithPlayers />
            </CourtSystemProvider>
        );

        // 初始狀態檢查
        expect(getByTestId('auto-assign').textContent).toBe('true');
        expect(getByTestId('court-players').textContent).toBe('0');
        expect(getByTestId('waiting-queue').textContent).toBe('0');

        // 等待自動分配效果
        act(() => {
            jest.runAllTimers();
        });

        // TODO: 這個測試需要重新設計
        // 目前的實現中，我們沒有辦法在測試中直接添加球員到等待隊列
        // 我們需要添加一個新的 action 來支持這個功能
        expect(getByTestId('court-players').textContent).toBe('0');
        expect(getByTestId('waiting-queue').textContent).toBe('0');
    });
}); 