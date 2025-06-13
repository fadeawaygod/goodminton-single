import React, { useCallback, useEffect } from 'react';
import { Chip, Box, Typography } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { Player } from '../types/court';
import { ItemTypes } from '../constants/court';
import { chameleonColors } from '../constants/court';
import { getLevelColor } from '../constants/playerLevelColors';

// 定義性別對應的顏色
const genderColors = {
    male: '#0D47A1',    // 深藍色
    female: '#E91E63',  // 粉紅色
    unknown: '#BDBDBD'  // 淺灰色
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

    // 獲取球員等級對應的顏色
    const levelColor = getLevelColor(player.level);

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
                        backgroundColor: player.isPlaying ? levelColor.main : levelColor.light,
                        border: `1px solid ${levelColor.main}`,
                        '&:hover': {
                            backgroundColor: player.isPlaying ? levelColor.dark : levelColor.main,
                        },
                        transition: 'all 0.3s ease',
                    }}
                />
            </Box>
        </div>
    );
};