import { Player } from '../types/court';
import { v4 as uuidv4 } from 'uuid';
import { Gender } from '../types/court';

// 生成測試球員數據
export const generateTestPlayers = (): Player[] => {
    const names = [
        '王大明',
        '李小華',
        '張三豐',
        '陳小美',
        '林大山',
        '吳小雲',
        '黃小龍',
        '劉大寶'
    ];

    return names.map(name => ({
        id: uuidv4(),
        name,
        gender: 'unknown' as Gender,
        level: 7,
        labels: [],
        isPlaying: false,
        isQueuing: false,
        enabled: true,
        gamesPlayed: 0
    }));
}; 