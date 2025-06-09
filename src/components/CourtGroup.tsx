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
    courtId: string;
}

export const CourtGroup: React.FC<CourtGroupProps> = ({ players, courtId }) => {
    const { t } = useTranslation();

    const [{ isDragging }, dragRef, preview] = useDrag(() => ({
        type: ItemTypes.GROUP,
        item: {
            type: ItemTypes.GROUP,
            players,
            fromCourtId: courtId,
            isPlayingGroup: true
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }), [courtId, players]);

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
            data-testid={`court-group-${courtId}`}
            style={{
                opacity: isDragging ? 0.5 : 1,
                cursor: 'move',
                width: '100%',
                height: '100%',
            }}
        >
            <Paper
                elevation={2}
                sx={{
                    p: 1,
                    border: '1px solid',
                    borderColor: chameleonColors.group.border,
                    backgroundColor: chameleonColors.group.background,
                    borderRadius: 2,
                    height: '100%',
                    position: 'relative',
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
                        gap: 0.5,
                        zIndex: 1,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    }}
                >
                    <DragIndicatorIcon fontSize="small" />
                    <Typography variant="caption">
                        {t('court.playing')}
                    </Typography>
                </Box>
                <Box sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 0.5,
                    pt: 1
                }}>
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