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
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Gender } from '../types/court';
import { useAppDispatch } from '../store/hooks';
import { addPlayer } from '../store/slices/playerSlice';

interface AddPlayerDialogProps {
    open: boolean;
    onClose: () => void;
}

export const AddPlayerDialog: React.FC<AddPlayerDialogProps> = ({ open, onClose }) => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();

    const [newPlayer, setNewPlayer] = useState({
        name: '',
        gender: 'male' as Gender,
        level: 7,
    });

    const handleAddPlayer = () => {
        if (newPlayer.name.trim()) {
            dispatch(addPlayer({
                name: newPlayer.name.trim(),
                gender: newPlayer.gender,
                level: newPlayer.level,
            }));
            setNewPlayer({
                name: '',
                gender: 'unknown',
                level: 3,
            });
            onClose();
        }
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>{t('playerList.addNewPlayer')}</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 300, mt: 1 }}>
                    <TextField
                        autoFocus
                        label={t('playerList.playerName')}
                        value={newPlayer.name}
                        onChange={(e) => setNewPlayer(prev => ({ ...prev, name: e.target.value }))}
                        fullWidth
                    />
                    <FormControl fullWidth>
                        <InputLabel>{t('playerList.gender')}</InputLabel>
                        <Select
                            value={newPlayer.gender}
                            label={t('playerList.gender')}
                            onChange={(e) => setNewPlayer(prev => ({ ...prev, gender: e.target.value as Gender }))}
                        >
                            <MenuItem value="male">{t('playerList.genders.male')}</MenuItem>
                            <MenuItem value="female">{t('playerList.genders.female')}</MenuItem>
                            <MenuItem value="unknown">{t('playerList.genders.unknown')}</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl fullWidth>
                        <InputLabel>{t('playerList.level')}</InputLabel>
                        <Select
                            value={newPlayer.level}
                            label={t('playerList.level')}
                            onChange={(e) => setNewPlayer(prev => ({ ...prev, level: e.target.value as number }))}
                        >
                            {Array.from({ length: 14 }, (_, i) => i + 1).map((level) => (
                                <MenuItem key={level} value={level}>{level}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{t('common.cancel')}</Button>
                <Button onClick={handleAddPlayer} variant="contained" color="primary">
                    {t('common.create')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}; 