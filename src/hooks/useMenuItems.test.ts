import { renderHook } from '@testing-library/react';
import { useMenuItems } from './useMenuItems';

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('useMenuItems', () => {
  it('returns the correct menu items structure', () => {
    const { result } = renderHook(() => useMenuItems());

    expect(result.current).toHaveLength(3);
    expect(result.current[0]).toEqual({
      title: 'common.schedule',
      path: '/schedule',
      description: 'schedule.viewSchedule'
    });
    expect(result.current[1]).toEqual({
      title: 'common.players',
      path: '/players',
      description: 'players.playerList'
    });
    expect(result.current[2]).toEqual({
      title: 'common.settings',
      path: '/settings',
      description: 'settings.language'
    });
  });
}); 