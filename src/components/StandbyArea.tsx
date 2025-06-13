import React, { useCallback, useRef } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { useDrop } from 'react-dnd';
import { Player, Court } from '../types/court';
import { ItemTypes, chameleonColors } from '../constants/court';
import { DraggablePlayer } from './DraggablePlayer';
import { useTranslation } from 'react-i18next';

interface StandbyAreaProps {
    players: Player[];
    onPlayerDrop: (player: Player) => void;
    onPlayerMoveToStandby: (player: Player) => void;
    onGroupDissolve: (players: Player[]) => void;
    courts: Court[];
}

export const StandbyArea: React.FC<StandbyAreaProps> = ({
    players,
    onPlayerDrop,
    onPlayerMoveToStandby,
    onGroupDissolve,
    courts
}) => {
    const { t } = useTranslation();
    const dropTargetRef = useRef<HTMLDivElement>(null);

    const [{ isOver }, dropRef] = useDrop(() => ({
        accept: [ItemTypes.PLAYER, ItemTypes.GROUP],
        drop: (item: any) => {
            if (item.type === ItemTypes.PLAYER) {
                if (item.isPlaying) {
                    onPlayerDrop(item);
                } else if (item.isQueuing) {
                    onPlayerMoveToStandby(item);
                }
            } else if (item.type === ItemTypes.GROUP && item.isPlayingGroup) {
                onGroupDissolve(item.players);
            }
            return {};
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    }));

    const elementRef = useCallback((node: HTMLDivElement | null) => {
        dropTargetRef.current = node;
        dropRef(node);
    }, [dropRef]);

    return (
        <Paper
            elevation={1}
            ref={elementRef}
            data-testid="standby-area"
            role="region"
            aria-label="standby area"
            sx={{
                p: { xs: 1, sm: 2 },
                height: { xs: '300px', sm: '400px' },
                overflow: 'auto',
                backgroundColor: isOver ? `${chameleonColors.hover}40` : chameleonColors.background,
                transition: 'all 0.3s ease',
                border: '1px solid',
                borderColor: chameleonColors.border,
                borderRadius: 2,
            }}
        >
            <Typography
                variant="subtitle1"
                sx={{
                    mb: 1,
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                    color: chameleonColors.primary,
                    fontWeight: 'bold',
                }}
            >
                {t('court.standbyArea')}
            </Typography>
            <Box sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 0.5
            }}>
                {players.map(player => (
                    <DraggablePlayer
                        key={player.id}
                        player={player}
                    />
                ))}
            </Box>
        </Paper>
    );
}; 