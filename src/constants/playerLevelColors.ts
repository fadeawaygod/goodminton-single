import { alpha } from '@mui/material/styles';

// 定義彩虹色系
const rainbowColors = {
    red: '#FF0000',      // 紅色 (13-14級)
    orange: '#FF7F00',   // 橙色 (11-12級)
    yellow: '#FFFF00',   // 黃色 (9-10級)
    green: '#00FF00',    // 綠色 (7-8級)
    cyan: '#00FFFF',     // 青色 (5-6級)
    blue: '#0000FF',     // 藍色 (3-4級)
    purple: '#8B00FF',   // 紫色 (1-2級)
};

// 定義等級範圍對應的顏色
export const levelColorMap = {
    // 13-14級: 紅色
    13: {
        main: rainbowColors.red,
        light: alpha(rainbowColors.red, 0.2),
        dark: alpha(rainbowColors.red, 0.8),
    },
    14: {
        main: rainbowColors.red,
        light: alpha(rainbowColors.red, 0.2),
        dark: alpha(rainbowColors.red, 0.8),
    },
    // 11-12級: 橙色
    11: {
        main: rainbowColors.orange,
        light: alpha(rainbowColors.orange, 0.2),
        dark: alpha(rainbowColors.orange, 0.8),
    },
    12: {
        main: rainbowColors.orange,
        light: alpha(rainbowColors.orange, 0.2),
        dark: alpha(rainbowColors.orange, 0.8),
    },
    // 9-10級: 黃色
    9: {
        main: rainbowColors.yellow,
        light: alpha(rainbowColors.yellow, 0.2),
        dark: alpha(rainbowColors.yellow, 0.8),
    },
    10: {
        main: rainbowColors.yellow,
        light: alpha(rainbowColors.yellow, 0.2),
        dark: alpha(rainbowColors.yellow, 0.8),
    },
    // 7-8級: 綠色
    7: {
        main: rainbowColors.green,
        light: alpha(rainbowColors.green, 0.2),
        dark: alpha(rainbowColors.green, 0.8),
    },
    8: {
        main: rainbowColors.green,
        light: alpha(rainbowColors.green, 0.2),
        dark: alpha(rainbowColors.green, 0.8),
    },
    // 5-6級: 青色
    5: {
        main: rainbowColors.cyan,
        light: alpha(rainbowColors.cyan, 0.2),
        dark: alpha(rainbowColors.cyan, 0.8),
    },
    6: {
        main: rainbowColors.cyan,
        light: alpha(rainbowColors.cyan, 0.2),
        dark: alpha(rainbowColors.cyan, 0.8),
    },
    // 3-4級: 藍色
    3: {
        main: rainbowColors.blue,
        light: alpha(rainbowColors.blue, 0.2),
        dark: alpha(rainbowColors.blue, 0.8),
    },
    4: {
        main: rainbowColors.blue,
        light: alpha(rainbowColors.blue, 0.2),
        dark: alpha(rainbowColors.blue, 0.8),
    },
    // 1-2級: 紫色
    1: {
        main: rainbowColors.purple,
        light: alpha(rainbowColors.purple, 0.2),
        dark: alpha(rainbowColors.purple, 0.8),
    },
    2: {
        main: rainbowColors.purple,
        light: alpha(rainbowColors.purple, 0.2),
        dark: alpha(rainbowColors.purple, 0.8),
    },
};

// 獲取等級對應的顏色
export const getLevelColor = (level: number) => {
    // 確保等級在有效範圍內
    const validLevel = Math.max(1, Math.min(14, level));
    return levelColorMap[validLevel as keyof typeof levelColorMap] || levelColorMap[1];
}; 