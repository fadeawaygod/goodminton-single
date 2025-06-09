import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Button,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Box,
    Chip,
    Typography,
    Tooltip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { deletePlayer, selectAllPlayers } from '../store/playerSlice';
import { AddPlayerDialog } from './AddPlayerDialog';

interface PlayerListDialogProps {
    open: boolean;
    onClose: () => void;
}

export const PlayerListDialog: React.FC<PlayerListDialogProps> = ({ open, onClose }) => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const players = useAppSelector(selectAllPlayers);
    const [addDialogOpen, setAddDialogOpen] = useState(false);

    const handleDeletePlayer = (playerId: string) => {
        dispatch(deletePlayer(playerId));
    };

    return (
        <>
            <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
                <DialogTitle>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {t('playerList.title')}
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => setAddDialogOpen(true)}
                        >
                            {t('playerList.addNewPlayer')}
                        </Button>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    {players.length === 0 ? (
                        <Typography color="textSecondary" align="center" sx={{ py: 2 }}>
                            {t('playerList.noPlayers')}
                        </Typography>
                    ) : (
                        <List>
                            {players.map((player) => (
                                <ListItem key={player.id}>
                                    <ListItemText
                                        primary={player.name}
                                        secondary={
                                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
                                                <Chip
                                                    size="small"
                                                    label={`${t('playerList.level')}: ${player.level}`}
                                                />
                                                <Chip
                                                    size="small"
                                                    label={t(`playerList.${player.gender}`)}
                                                />
                                                {player.labels.map((label) => (
                                                    <Chip
                                                        key={label}
                                                        size="small"
                                                        label={label}
                                                    />
                                                ))}
                                            </Box>
                                        }
                                    />
                                    <ListItemSecondaryAction>
                                        <Tooltip title={t('common.delete')}>
                                            <IconButton
                                                edge="end"
                                                onClick={() => handleDeletePlayer(player.id)}
                                                size="small"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            ))}
                        </List>
                    )}
                </DialogContent>
            </Dialog>
            <AddPlayerDialog
                open={addDialogOpen}
                onClose={() => setAddDialogOpen(false)}
            />
        </>
    );
}; 