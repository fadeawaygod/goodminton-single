import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box,
    Chip,
    IconButton,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Switch,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Gender } from '../types/court';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addPlayer, togglePlayerEnabled } from '../store/playerSlice';

interface PlayerListDialogProps {
    open: boolean;
    onClose: () => void;
}

export const PlayerListDialog: React.FC<PlayerListDialogProps> = ({ open, onClose }) => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const players = useAppSelector(state => state.players.players);

    const [newPlayer, setNewPlayer] = useState({
        name: '',
        gender: 'unknown' as Gender,
        level: 3,
        labels: [] as string[],
    });
    const [newLabel, setNewLabel] = useState('');

    const handleAddPlayer = () => {
        if (newPlayer.name.trim()) {
            dispatch(addPlayer(newPlayer));
            setNewPlayer({
                name: '',
                gender: 'unknown',
                level: 3,
                labels: [],
            });
        }
    };

    const handleToggleEnabled = (playerId: string) => {
        dispatch(togglePlayerEnabled(playerId));
    };

    const handleAddLabel = () => {
        if (newLabel.trim() && !newPlayer.labels.includes(newLabel.trim())) {
            setNewPlayer(prev => ({
                ...prev,
                labels: [...prev.labels, newLabel.trim()],
            }));
            setNewLabel('');
        }
    };

    const handleRemoveLabel = (labelToRemove: string) => {
        setNewPlayer(prev => ({
            ...prev,
            labels: prev.labels.filter(label => label !== labelToRemove),
        }));
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{t('playerList.title')}</DialogTitle>
            <DialogContent>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        {t('playerList.addNewPlayer')}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <TextField
                            label={t('playerList.name')}
                            value={newPlayer.name}
                            onChange={(e) => setNewPlayer(prev => ({ ...prev, name: e.target.value }))}
                            size="small"
                        />
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>{t('playerList.gender')}</InputLabel>
                            <Select
                                value={newPlayer.gender}
                                label={t('playerList.gender')}
                                onChange={(e) => setNewPlayer(prev => ({ ...prev, gender: e.target.value as Gender }))}
                            >
                                <MenuItem value="male">{t('playerList.male')}</MenuItem>
                                <MenuItem value="female">{t('playerList.female')}</MenuItem>
                                <MenuItem value="unknown">{t('playerList.unknown')}</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>{t('playerList.level')}</InputLabel>
                            <Select
                                value={newPlayer.level}
                                label={t('playerList.level')}
                                onChange={(e) => setNewPlayer(prev => ({ ...prev, level: Number(e.target.value) }))}
                            >
                                {[1, 2, 3, 4, 5].map(level => (
                                    <MenuItem key={level} value={level}>
                                        {level}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                        <TextField
                            label={t('playerList.labels')}
                            value={newLabel}
                            onChange={(e) => setNewLabel(e.target.value)}
                            size="small"
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddLabel();
                                }
                            }}
                        />
                        <Button
                            variant="outlined"
                            onClick={handleAddLabel}
                            disabled={!newLabel.trim()}
                        >
                            {t('playerList.addLabel')}
                        </Button>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {newPlayer.labels.map(label => (
                            <Chip
                                key={label}
                                label={label}
                                onDelete={() => handleRemoveLabel(label)}
                                size="small"
                            />
                        ))}
                    </Box>
                </Box>
                <List>
                    {players.map(player => (
                        <ListItem key={player.id}>
                            <ListItemText
                                primary={player.name}
                                secondary={`${t(`playerList.${player.gender}`)} | ${t('playerList.level')}: ${player.level} | ${player.labels.join(', ')}`}
                            />
                            <ListItemSecondaryAction>
                                <Switch
                                    edge="end"
                                    checked={player.enabled}
                                    onChange={() => handleToggleEnabled(player.id)}
                                />
                            </ListItemSecondaryAction>
                        </ListItem>
                    ))}
                </List>
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={handleAddPlayer}
                    color="primary"
                    disabled={!newPlayer.name.trim()}
                >
                    {t('playerList.add')}
                </Button>
                <Button onClick={onClose} color="primary">
                    {t('common.close')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}; 