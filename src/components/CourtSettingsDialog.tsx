import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Slider,
    Typography,
    Box
} from '@mui/material';
import { useTranslation } from 'react-i18next';

interface CourtSettingsDialogProps {
    open: boolean;
    onClose: () => void;
    courtCount: number;
    setCourtCount: (count: number) => void;
    ttsRate: number;
    setTtsRate: (rate: number) => void;
    fontSize: number;
    setFontSize: (size: number) => void;
}

const CourtSettingsDialog: React.FC<CourtSettingsDialogProps> = ({ open, onClose, courtCount, setCourtCount, ttsRate, setTtsRate, fontSize, setFontSize }) => {
    const { t } = useTranslation();
    const [localCourtCount, setLocalCourtCount] = React.useState(courtCount);
    const [localTtsRate, setLocalTtsRate] = React.useState(ttsRate);
    const [localFontSize, setLocalFontSize] = React.useState(fontSize);

    // Reset local state when dialog opens
    React.useEffect(() => {
        setLocalCourtCount(courtCount);
    }, [open, courtCount]);
    React.useEffect(() => {
        setLocalTtsRate(ttsRate);
    }, [open, ttsRate]);
    React.useEffect(() => {
        setLocalFontSize(fontSize);
    }, [open, fontSize]);

    const handleSliderChange = (_event: Event, newValue: number | number[]) => {
        setLocalCourtCount(newValue as number);
    };
    const handleTtsRateChange = (_event: Event, newValue: number | number[]) => {
        setLocalTtsRate(newValue as number);
    };
    const handleFontSizeChange = (_event: Event, newValue: number | number[]) => {
        setLocalFontSize(newValue as number);
    };

    const handleSave = () => {
        setCourtCount(localCourtCount);
        setTtsRate(localTtsRate);
        setFontSize(localFontSize);
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            sx={{
                '& .MuiDialog-paper': {
                    width: { xs: '95%', sm: '400px' },
                    maxWidth: '400px',
                    margin: { xs: '16px', sm: 'auto' }
                }
            }}
        >
            <DialogTitle>{t('settings.courtSettings')}</DialogTitle>
            <DialogContent>
                <Box sx={{
                    width: '100%',
                    mt: 2,
                    px: { xs: 1, sm: 0 }
                }}>
                    <Typography gutterBottom>
                        {t('settings.courtCount')}
                    </Typography>
                    <Slider
                        value={localCourtCount}
                        onChange={handleSliderChange}
                        min={1}
                        max={8}
                        marks
                        step={1}
                        valueLabelDisplay="auto"
                        sx={{
                            '& .MuiSlider-markLabel': {
                                fontSize: { xs: '0.75rem', sm: '0.875rem' }
                            }
                        }}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {t('settings.currentCourts', { count: localCourtCount })}
                    </Typography>
                    <Box sx={{ mt: 4 }}>
                        <Typography gutterBottom>
                            {t('settings.ttsRate', 'TTS語速')}
                        </Typography>
                        <Slider
                            value={localTtsRate}
                            onChange={handleTtsRateChange}
                            min={0.2}
                            max={1}
                            step={0.01}
                            valueLabelDisplay="auto"
                        />
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            {t('settings.ttsRate', 'TTS語速')}: {localTtsRate}
                        </Typography>
                    </Box>
                    <Box sx={{ mt: 4 }}>
                        <Typography gutterBottom>
                            {t('settings.playerFontSize', '球員字體大小')}
                        </Typography>
                        <Slider
                            value={localFontSize}
                            onChange={handleFontSizeChange}
                            min={0.8}
                            max={1.5}
                            step={0.05}
                            valueLabelDisplay="auto"
                        />
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            {t('settings.playerFontSize', '球員字體大小')}: {localFontSize}
                        </Typography>
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 3 } }}>
                <Button onClick={onClose} color="inherit">
                    {t('common.cancel')}
                </Button>
                <Button onClick={handleSave} color="primary" variant="contained">
                    {t('common.save')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CourtSettingsDialog;