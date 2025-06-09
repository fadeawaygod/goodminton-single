import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Chip,
    Box,
    Fab,
    Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { selectAllPlayers, deletePlayer } from '../store/playerSlice';
import { AddPlayerDialog } from './AddPlayerDialog';

interface PlayerListDialogProps {
    open: boolean;
    onClose: () => void;
}

export const PlayerListDialog: React.FC<PlayerListDialogProps> = ({ open, onClose }) => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const players = useAppSelector(selectAllPlayers);
    const [addPlayerOpen, setAddPlayerOpen] = useState(false);

    const handleDeletePlayer = (playerId: string) => {
        dispatch(deletePlayer(playerId));
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    {t('playerList.title')}
                    <Fab
                        color="primary"
                        size="small"
                        onClick={() => setAddPlayerOpen(true)}
                    >
                        <AddIcon />
                    </Fab>
                </Box>
            </DialogTitle>
            <DialogContent>
                <List>
                    {players.map((player) => (
                        <ListItem
                            key={player.id}
                            secondaryAction={
                                <IconButton
                                    edge="end"
                                    aria-label="delete"
                                    onClick={() => handleDeletePlayer(player.id)}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            }
                        >
                            <ListItemText
                                primary={
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <Typography>{player.name}</Typography>
                                        <Chip
                                            size="small"
                                            label={t(`playerList.genders.${player.gender}`)}
                                        />
                                        <Chip
                                            size="small"
                                            label={`Lv.${player.level}`}
                                        />
                                        {player.isPlaying && (
                                            <Chip
                                                size="small"
                                                color="primary"
                                                label={t('playerList.status.playing')}
                                            />
                                        )}
                                        {player.isQueuing && (
                                            <Chip
                                                size="small"
                                                color="secondary"
                                                label={t('playerList.status.waiting')}
                                            />
                                        )}
                                        {!player.isPlaying && !player.isQueuing && (
                                            <Chip
                                                size="small"
                                                variant="outlined"
                                                label={t('playerList.status.standby')}
                                            />
                                        )}
                                    </Box>
                                }
                            />
                        </ListItem>
                    ))}
                </List>
            </DialogContent>
            <AddPlayerDialog
                open={addPlayerOpen}
                onClose={() => setAddPlayerOpen(false)}
            />
        </Dialog>
    );
}; 