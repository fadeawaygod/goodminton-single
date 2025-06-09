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
import { useCourtSystem } from '../contexts/CourtSystemContext';

interface CourtSettingsDialogProps {
    open: boolean;
    onClose: () => void;
}

const CourtSettingsDialog: React.FC<CourtSettingsDialogProps> = ({ open, onClose }) => {
    const { t } = useTranslation();
    const { courtCount, setCourtCount } = useCourtSystem();
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
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>{t('courtSettings.title')}</DialogTitle>
            <DialogContent>
                <Box sx={{ width: 300, mt: 2 }}>
                    <Typography gutterBottom>
                        {t('courtSettings.courtCount')}
                    </Typography>
                    <Slider
                        value={localCourtCount}
                        onChange={handleSliderChange}
                        min={1}
                        max={8}
                        marks
                        step={1}
                        valueLabelDisplay="auto"
                    />
                </Box>
            </DialogContent>
            <DialogActions>
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