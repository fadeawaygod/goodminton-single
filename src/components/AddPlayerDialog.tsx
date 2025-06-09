import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    Box,
    FormHelperText,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useCourtSystem } from '../contexts/CourtSystemContext';
import { Gender } from '../types/court';

interface AddPlayerDialogProps {
    open: boolean;
    onClose: () => void;
}

const LEVEL_RANGE = Array.from({ length: 14 }, (_, i) => i + 1);

export const AddPlayerDialog: React.FC<AddPlayerDialogProps> = ({ open, onClose }) => {
    const { t } = useTranslation();
    const { addPlayer, allPlayers } = useCourtSystem();
    const [formData, setFormData] = useState({
        name: '',
        gender: 'unknown' as Gender,
        level: 7,
        labels: [] as string[],
    });
    const [customLabel, setCustomLabel] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // 檢查名稱是否已存在
        if (allPlayers.some(p => p.name === formData.name.trim())) {
            setError(t('playerList.errors.nameExists'));
            return;
        }

        addPlayer({
            ...formData,
            name: formData.name.trim(),
        });
        handleClose();
    };

    const handleClose = () => {
        setFormData({
            name: '',
            gender: 'unknown',
            level: 7,
            labels: [],
        });
        setCustomLabel('');
        setError(null);
        onClose();
    };

    const handleAddLabel = () => {
        if (customLabel.trim() && !formData.labels.includes(customLabel.trim())) {
            setFormData(prev => ({
                ...prev,
                labels: [...prev.labels, customLabel.trim()]
            }));
            setCustomLabel('');
        }
    };

    const handleRemoveLabel = (labelToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            labels: prev.labels.filter(label => label !== labelToRemove)
        }));
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>{t('playerList.addNewPlayer')}</DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            autoFocus
                            fullWidth
                            value={formData.name}
                            onChange={(e) => {
                                setFormData(prev => ({ ...prev, name: e.target.value }));
                                setError(null);
                            }}
                            label={t('playerList.playerName')}
                            error={!!error}
                            helperText={error}
                            required
                        />

                        <FormControl fullWidth>
                            <InputLabel>{t('playerList.gender')}</InputLabel>
                            <Select
                                value={formData.gender}
                                onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value as Gender }))}
                                label={t('playerList.gender')}
                            >
                                <MenuItem value="male">{t('playerList.genders.male')}</MenuItem>
                                <MenuItem value="female">{t('playerList.genders.female')}</MenuItem>
                                <MenuItem value="unknown">{t('playerList.genders.unknown')}</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl fullWidth>
                            <InputLabel>{t('playerList.level')}</InputLabel>
                            <Select
                                value={formData.level}
                                onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value as number }))}
                                label={t('playerList.level')}
                            >
                                {LEVEL_RANGE.map(level => (
                                    <MenuItem key={level} value={level}>
                                        {level}
                                    </MenuItem>
                                ))}
                            </Select>
                            <FormHelperText>{t('playerList.levelHelp')}</FormHelperText>
                        </FormControl>

                        <Box>
                            <Box sx={{ mb: 1 }}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    value={customLabel}
                                    onChange={(e) => setCustomLabel(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddLabel();
                                        }
                                    }}
                                    placeholder={t('playerList.addLabel')}
                                    InputProps={{
                                        endAdornment: (
                                            <Button
                                                onClick={handleAddLabel}
                                                disabled={!customLabel.trim()}
                                                size="small"
                                            >
                                                {t('playerList.add')}
                                            </Button>
                                        ),
                                    }}
                                />
                            </Box>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {formData.labels.map((label) => (
                                    <Chip
                                        key={label}
                                        label={label}
                                        onDelete={() => handleRemoveLabel(label)}
                                        size="small"
                                    />
                                ))}
                            </Box>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>
                        {t('common.cancel')}
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={!formData.name.trim()}
                    >
                        {t('common.confirm')}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}; 