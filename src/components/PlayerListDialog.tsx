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
    Switch,
    Tooltip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { selectAllPlayers, deletePlayer, togglePlayerEnabled } from '../store/slices/playerSlice';
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

    const handleToggleEnabled = (playerId: string) => {
        dispatch(togglePlayerEnabled(playerId));
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
                                <Box display="flex" alignItems="center" gap={1}>
                                    <Tooltip title={player.enabled ? t('players.disablePlayer') : t('players.enablePlayer')}>
                                        <Switch
                                            edge="end"
                                            checked={player.enabled}
                                            onChange={() => handleToggleEnabled(player.id)}
                                            disabled={player.isPlaying || player.isQueuing}
                                        />
                                    </Tooltip>
                                    <IconButton
                                        edge="end"
                                        aria-label="delete"
                                        onClick={() => handleDeletePlayer(player.id)}
                                        disabled={player.isPlaying || player.isQueuing}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </Box>
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