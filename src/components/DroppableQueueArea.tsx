import React, { useCallback } from 'react';
import { Box, List, ListItem, Typography } from '@mui/material';
import { useDrop } from 'react-dnd';
import { Player, PlayerGroup } from '../types/court';
import { ItemTypes } from '../constants/court';
import { DraggableGroup } from './DraggableGroup';
import { useTranslation } from 'react-i18next';

interface DroppableQueueAreaProps {
    waitingQueue: PlayerGroup[];
    onCreateNewGroup: (player: Player) => void;
    onPlayerDropToGroup: (player: Player, groupId: string) => void;
    onQueueReorder: (dragIndex: number, hoverIndex: number) => void;
    onPlayingGroupDrop: (players: Player[]) => void;
}

export const DroppableQueueArea: React.FC<DroppableQueueAreaProps> = ({
    waitingQueue,
    onCreateNewGroup,
    onPlayerDropToGroup,
    onQueueReorder,
    onPlayingGroupDrop
}) => {
    const { t } = useTranslation();

    const [{ isOver }, dropRef] = useDrop(() => ({
        accept: [ItemTypes.PLAYER, ItemTypes.GROUP],
        drop: (item: any, monitor) => {
            const didDropInChild = monitor.didDrop();
            if (!didDropInChild) {
                if (item.type === ItemTypes.PLAYER) {
                    onCreateNewGroup(item);
                } else if (item.type === ItemTypes.GROUP && item.fromCourt) {
                    onPlayingGroupDrop(item.players);
                }
            }
            return {};
        },
        collect: (monitor) => ({
            isOver: monitor.isOver({ shallow: true }),
        }),
    }), [onCreateNewGroup, onPlayingGroupDrop]);

    const elementRef = useCallback(
        (node: HTMLElement | null) => {
            dropRef(node);
        },
        [dropRef]
    );

    return (
        <Box
            ref={elementRef}
            data-testid="waiting-queue"
            role="region"
            aria-label="waiting queue"
            sx={{
                minHeight: {
                    xs: waitingQueue.length > 0 ? '200px' : 'auto',
                    sm: waitingQueue.length > 0 ? '400px' : 'auto'
                },
                maxHeight: {
                    xs: '400px',
                    sm: '600px'
                },
                position: 'relative',
                backgroundColor: isOver ? 'action.hover' : 'transparent',
                transition: 'background-color 0.2s',
                overflow: waitingQueue.length > 0 ? 'auto' : 'hidden',
                overscrollBehavior: 'contain',
                WebkitOverflowScrolling: 'touch',
            }}
        >
            {isOver && (
                <Typography
                    variant="body2"
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        color: 'text.secondary',
                        textAlign: 'center',
                        pointerEvents: 'none',
                    }}
                >
                    {t('court.dropToCreateGroup')}
                </Typography>
            )}
            <List sx={{
                pt: 3,
                height: '100%',
                '& > *:last-child': {
                    mb: 0
                }
            }}>
                {waitingQueue.map((group, index) => (
                    <ListItem key={group.id} sx={{ display: 'block', mb: 3 }}>
                        <DraggableGroup
                            group={group}
                            index={index}
                            onPlayerDrop={(player) => onPlayerDropToGroup(player, group.id)}
                            onGroupMove={onQueueReorder}
                        />
                    </ListItem>
                ))}
            </List>
        </Box>
    );
}; 