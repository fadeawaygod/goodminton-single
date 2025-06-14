import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    SelectChangeEvent,
    InputAdornment,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '../store/hooks';
import { updatePlayer } from '../store/slices/playerSlice';
import { Player } from '../types/court';

interface EditPlayerDialogProps {
    open: boolean;
    player: Player | null;
    onClose: () => void;
    onSave: (player: Player) => void;
}

const EditPlayerDialog: React.FC<EditPlayerDialogProps> = ({
    open,
    player,
    onClose,
    onSave,
}) => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const [name, setName] = useState('');
    const [level, setLevel] = useState<number>(1);
    const [gender, setGender] = useState<'male' | 'female' | 'unknown'>('unknown');
    const [gamesPlayed, setGamesPlayed] = useState<number>(0);

    useEffect(() => {
        if (player) {
            setName(player.name);
            setLevel(player.level);
            setGender(player.gender);
            setGamesPlayed(player.gamesPlayed);
        }
    }, [player]);

    const handleSave = () => {
        if (player) {
            // 更新 Redux store
            dispatch(updatePlayer({
                id: player.id,
                name: name.trim(),
                level,
                gender,
                gamesPlayed,
            }));

            // 更新本地狀態（用於即時顯示）
            onSave({
                ...player,
                name: name.trim(),
                level,
                gender,
                gamesPlayed,
            });
        }
        onClose();
    };

    const handleGenderChange = (event: SelectChangeEvent) => {
        setGender(event.target.value as 'male' | 'female' | 'unknown');
    };

    const handleGamesPlayedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(event.target.value) || 0;
        setGamesPlayed(Math.max(0, value)); // 確保不會有負數
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{t('playerList.editPlayer')}</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                    <TextField
                        autoFocus
                        label={t('playerList.playerName')}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        fullWidth
                    />
                    <FormControl fullWidth>
                        <InputLabel>{t('playerList.level')}</InputLabel>
                        <Select
                            value={level}
                            label={t('playerList.level')}
                            onChange={(e) => setLevel(Number(e.target.value))}
                        >
                            {Array.from({ length: 14 }, (_, i) => i + 1).map((lvl) => (
                                <MenuItem key={lvl} value={lvl}>
                                    {t('playerList.level')} {lvl}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth>
                        <InputLabel>{t('playerList.gender')}</InputLabel>
                        <Select
                            value={gender}
                            label={t('playerList.gender')}
                            onChange={handleGenderChange}
                        >
                            <MenuItem value="male">{t('playerList.male')}</MenuItem>
                            <MenuItem value="female">{t('playerList.female')}</MenuItem>
                            <MenuItem value="unknown">{t('playerList.unknown')}</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        label={t('playerList.gamesPlayed')}
                        type="number"
                        value={gamesPlayed}
                        onChange={handleGamesPlayedChange}
                        fullWidth
                        InputProps={{
                            inputProps: { min: 0 },
                            endAdornment: <InputAdornment position="end">{t('playerList.games')}</InputAdornment>,
                        }}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{t('common.cancel')}</Button>
                <Button onClick={handleSave} variant="contained" color="primary">
                    {t('common.save')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default EditPlayerDialog; 