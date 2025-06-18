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
}

const CourtSettingsDialog: React.FC<CourtSettingsDialogProps> = ({ open, onClose, courtCount, setCourtCount }) => {
    const { t } = useTranslation();
    const [localCourtCount, setLocalCourtCount] = React.useState(courtCount);

    // Reset local state when dialog opens
    React.useEffect(() => {
        setLocalCourtCount(courtCount);
    }, [open, courtCount]);

    const handleSliderChange = (_event: Event, newValue: number | number[]) => {
        setLocalCourtCount(newValue as number);
    };

    const handleSave = () => {
        setCourtCount(localCourtCount);
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