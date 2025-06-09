import { Player } from '../types/court';
import { v4 as uuidv4 } from 'uuid';

// 生成測試球員數據
export const generateTestPlayers = (): Player[] => {
    const names = [
        '張三', '李四', '王五', '趙六', '孫七', '周八', '吳九', '鄭十',
        '劉備', '關羽', '張飛', '諸葛亮', '曹操', '孫權', '周瑜', '黃蓋',
        '馬超', '趙雲', '黃忠', '魏延', '龐統', '徐晃', '許褚', '典韋',
        'John', 'Mary', 'Tom', 'Jerry', 'Mike', 'Sarah', 'David', 'Linda'
    ];

    return names.map(name => ({
        id: uuidv4(),
        name,
        isPlaying: false,
        isQueuing: false
    }));
}; 