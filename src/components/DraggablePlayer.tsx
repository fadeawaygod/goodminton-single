import React, { useCallback, useEffect } from 'react';
import { Chip, Box } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { Player } from '../types/court';
import { ItemTypes } from '../constants/court';
import { getLevelColor } from '../constants/playerLevelColors';

// 定義性別對應的顏色
const genderColors = {
    male: '#0D47A1',    // 深藍色
    female: '#E91E63',  // 粉紅色
    unknown: '#BDBDBD'  // 淺灰色
};

// 定義比賽中的固定顏色
const playingColors = {
    main: '#2E8B57',    // 海藻綠
    light: '#E0FFF0',   // 淺薄荷綠
    dark: '#1B5E3C',    // 深海藻綠
};

interface DraggablePlayerProps {
    player: Player;
}

export const DraggablePlayer: React.FC<DraggablePlayerProps> = ({ player }) => {
    const [{ isDragging }, dragRef, preview] = useDrag(() => ({
        type: ItemTypes.PLAYER,
        item: { ...player, type: ItemTypes.PLAYER },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }), [player]);

    useEffect(() => {
        preview(getEmptyImage(), { captureDraggingState: true });
    }, [preview]);

    const elementRef = useCallback(
        (node: HTMLElement | null) => {
            if (dragRef) {
                dragRef(node);
            }
        },
        [dragRef]
    );

    // 獲取球員等級對應的顏色（只用於非比賽狀態）
    const levelColor = getLevelColor(player.level);

    // 根據球員狀態選擇顏色
    const colors = player.isPlaying ? playingColors : levelColor;

    return (
        <div
            ref={elementRef}
            style={{
                opacity: isDragging ? 0.5 : 1,
                cursor: 'move',
                display: 'inline-block',
                touchAction: 'none',
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Chip
                    label={`${player.name} ${player.gamesPlayed}`}
                    icon={<PersonIcon />}
                    color={player.isPlaying ? "primary" : "default"}
                    sx={{
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
                        MozUserSelect: 'none',
                        '& .MuiChip-label': {
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            color: '#000000',
                            fontWeight: 'bold',
                        },
                        '& .MuiChip-icon': {
                            color: `${genderColors[player.gender]} !important`
                        },
                        backgroundColor: player.isPlaying ? colors.main : colors.light,
                        border: `1px solid ${colors.main}`,
                        '&:hover': {
                            backgroundColor: player.isPlaying ? colors.dark : colors.main,
                        },
                        transition: 'all 0.3s ease',
                    }}
                />
            </Box>
        </div>
    );
};