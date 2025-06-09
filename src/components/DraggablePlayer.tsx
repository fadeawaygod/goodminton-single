import React, { useCallback, useEffect } from 'react';
import { Chip } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { Player } from '../types/court';
import { ItemTypes } from '../constants/court';
import { chameleonColors } from '../constants/court';

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
            <Chip
                label={player.name}
                icon={<PersonIcon />}
                color={player.isPlaying ? "primary" : "default"}
                sx={{
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    MozUserSelect: 'none',
                    '& .MuiChip-label': {
                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                    },
                    backgroundColor: player.isPlaying ? chameleonColors.primary : chameleonColors.secondary,
                    color: 'white',
                    '&:hover': {
                        backgroundColor: player.isPlaying ? chameleonColors.hover : chameleonColors.primary,
                    },
                    transition: 'all 0.3s ease',
                }}
            />
        </div>
    );
}; 