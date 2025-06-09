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
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Gender } from '../types/court';
import { useAppDispatch } from '../store/hooks';
import { addPlayer } from '../store/playerSlice';

interface AddPlayerDialogProps {
    open: boolean;
    onClose: () => void;
}

export const AddPlayerDialog: React.FC<AddPlayerDialogProps> = ({ open, onClose }) => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();

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
            onClose();
        }
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
            <DialogTitle>{t('playerList.addNewPlayer')}</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                    <TextField
                        label={t('playerList.name')}
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
                            <MenuItem value="male">{t('playerList.male')}</MenuItem>
                            <MenuItem value="female">{t('playerList.female')}</MenuItem>
                            <MenuItem value="unknown">{t('playerList.unknown')}</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl fullWidth>
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
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                            label={t('playerList.labels')}
                            value={newLabel}
                            onChange={(e) => setNewLabel(e.target.value)}
                            fullWidth
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
                            />
                        ))}
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit">
                    {t('common.cancel')}
                </Button>
                <Button
                    onClick={handleAddPlayer}
                    color="primary"
                    variant="contained"
                    disabled={!newPlayer.name.trim()}
                >
                    {t('playerList.add')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}; 