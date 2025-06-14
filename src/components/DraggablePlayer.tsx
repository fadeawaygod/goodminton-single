import React, { useCallback, useEffect, useState } from 'react';
import { Chip, Box } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { Player } from '../types/court';
import { ItemTypes } from '../constants/court';
import { getLevelColor } from '../constants/playerLevelColors';
import EditPlayerDialog from './EditPlayerDialog';

// 定義性別對應的顏色
const genderColors = {
    male: '#0D47A1',    // 深藍色
    female: '#E91E63',  // 粉紅色
    unknown: '#BDBDBD'  // 淺灰色
};

interface DraggablePlayerProps {
    player: Player;
    onPlayerUpdate?: (player: Player) => void;
}

export const DraggablePlayer: React.FC<DraggablePlayerProps> = ({ player, onPlayerUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
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
    const colors = levelColor;

    const handleClick = (e: React.MouseEvent) => {
        // 如果正在拖拽，不觸發點擊事件
        if (isDragging) return;

        // 如果球員正在比賽或排隊中，不允許編輯
        if (player.isPlaying || player.isQueuing) return;

        e.stopPropagation();
        setIsEditing(true);
    };

    const handleSave = (updatedPlayer: Player) => {
        if (onPlayerUpdate) {
            onPlayerUpdate(updatedPlayer);
        }
    };

    return (
        <>
            <div
                ref={elementRef}
                style={{
                    opacity: isDragging ? 0.5 : 1,
                    cursor: (player.isPlaying || player.isQueuing) ? 'move' : 'pointer',
                    display: 'inline-block',
                    touchAction: 'none',
                }}
                onClick={handleClick}
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
                            backgroundColor: colors.light,
                            border: `1px solid ${colors.main}`,
                            '&:hover': {
                                backgroundColor: colors.main,
                            },
                            transition: 'all 0.3s ease',
                        }}
                    />
                </Box>
            </div>
            <EditPlayerDialog
                open={isEditing}
                player={player}
                onClose={() => setIsEditing(false)}
                onSave={handleSave}
            />
        </>
    );
};