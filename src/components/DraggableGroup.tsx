import React, { useCallback, useEffect, useRef } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { useDrag, useDrop } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { Player, PlayerGroup } from '../types/court';
import { ItemTypes, chameleonColors } from '../constants/court';
import { DraggablePlayer } from './DraggablePlayer';
import { useTranslation } from 'react-i18next';

interface DraggableGroupProps {
    group: PlayerGroup;
    index: number;
    onPlayerDrop: (player: Player) => void;
    onGroupMove: (dragIndex: number, hoverIndex: number) => void;
}

export const DraggableGroup: React.FC<DraggableGroupProps> = ({
    group,
    index,
    onPlayerDrop,
    onGroupMove
}) => {
    const { t } = useTranslation();
    const dropTargetRef = useRef<HTMLDivElement>(null);

    const [{ isDragging }, dragRef, preview] = useDrag(() => ({
        type: ItemTypes.GROUP,
        item: () => ({
            type: ItemTypes.GROUP,
            groupId: group.id,
            players: group.players,
            index,
            isPlayingGroup: false,
            fromQueue: true
        }),
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }), [group.id, group.players, index]);

    useEffect(() => {
        preview(getEmptyImage(), { captureDraggingState: true });
    }, [preview]);

    const [{ isOver }, dropRef] = useDrop(() => ({
        accept: [ItemTypes.GROUP, ItemTypes.PLAYER],
        hover: (item: any, monitor) => {
            if (!dropTargetRef.current) return;

            if (item.type === ItemTypes.PLAYER) return;
            if (item.isPlayingGroup) return;

            const dragIndex = item.index;
            const hoverIndex = index;

            if (dragIndex === hoverIndex) return;

            const hoverBoundingRect = dropTargetRef.current.getBoundingClientRect();
            const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
            const clientOffset = monitor.getClientOffset();
            if (!clientOffset) return;

            const hoverClientY = clientOffset.y - hoverBoundingRect.top;

            if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;
            if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;

            onGroupMove(dragIndex, hoverIndex);
            item.index = hoverIndex;
        },
        drop: (item: any) => {
            if (item.type === ItemTypes.PLAYER) {
                onPlayerDrop(item);
            }
            return {};
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    }), [index, onGroupMove]);

    const ref = useCallback((node: HTMLDivElement | null) => {
        dropTargetRef.current = node;
        dragRef(node);
        dropRef(node);
    }, [dragRef, dropRef]);

    return (
        <div
            ref={ref}
            data-testid={`group-${index}`}
            style={{
                width: '100%',
                opacity: isDragging ? 0.5 : 1,
                position: 'relative',
                marginBottom: '16px',
                cursor: 'move',
                transform: isDragging ? 'scale(1.02)' : 'scale(1)',
                transition: 'transform 0.2s ease',
            }}
        >
            <Paper
                elevation={isDragging ? 4 : 2}
                sx={{
                    p: 2,
                    border: '1px solid',
                    borderColor: isOver ? chameleonColors.success : chameleonColors.group.border,
                    backgroundColor: isOver ? `${chameleonColors.success}40` : chameleonColors.group.background,
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                }}
            >
                <Box
                    sx={{
                        position: 'absolute',
                        top: -20,
                        left: 10,
                        backgroundColor: chameleonColors.group.header,
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: '4px 4px 0 0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        zIndex: 1,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    }}
                >
                    <DragIndicatorIcon fontSize="small" />
                    <Typography variant="caption">
                        {t('court.group')} #{index + 1}
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {group.players.map(player => (
                        <DraggablePlayer
                            key={player.id}
                            player={player}
                        />
                    ))}
                </Box>
            </Paper>
        </div>
    );
}; 