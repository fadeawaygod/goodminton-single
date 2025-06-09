import React, { useCallback, useEffect } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { Player } from '../types/court';
import { ItemTypes, chameleonColors } from '../constants/court';
import { DraggablePlayer } from './DraggablePlayer';
import { useTranslation } from 'react-i18next';

interface CourtGroupProps {
    players: Player[];
    courtNumber: number;
    courtId: string;
}

export const CourtGroup: React.FC<CourtGroupProps> = ({ players, courtNumber, courtId }) => {
    const { t } = useTranslation();

    const [{ isDragging }, dragRef, preview] = useDrag(() => ({
        type: ItemTypes.GROUP,
        item: {
            type: ItemTypes.GROUP,
            players,
            isPlayingGroup: true,
            fromCourt: true,
            courtId,
            courtNumber
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }), [players, courtNumber, courtId]);

    useEffect(() => {
        preview(getEmptyImage(), { captureDraggingState: true });
    }, [preview]);

    const elementRef = useCallback(
        (node: HTMLDivElement | null) => {
            dragRef(node);
        },
        [dragRef]
    );

    return (
        <div
            ref={elementRef}
            style={{
                opacity: isDragging ? 0.5 : 1,
                cursor: 'move',
                position: 'relative',
                transform: isDragging ? 'scale(1.02)' : 'scale(1)',
                transition: 'transform 0.2s ease',
            }}
        >
            <Paper
                elevation={isDragging ? 4 : 2}
                sx={{
                    p: 2,
                    border: '1px solid',
                    borderColor: chameleonColors.border,
                    backgroundColor: chameleonColors.background,
                    borderRadius: 2,
                }}
            >
                <Box
                    sx={{
                        position: 'absolute',
                        top: -20,
                        left: 10,
                        backgroundColor: chameleonColors.primary,
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
                        {t('court.playing')}
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {players.map(player => (
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