import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Slider
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useCourtSystem } from '../contexts/CourtSystemContext';
const MAX_COURTS = 12;

interface CourtSettingsDialogProps {
    open: boolean;
    onClose: () => void;
}

const CourtSettingsDialog: React.FC<CourtSettingsDialogProps> = ({ open, onClose }) => {
    const { t } = useTranslation();
    const { courtCount, setCourtCount } = useCourtSystem();
    const [localCourtCount, setLocalCourtCount] = React.useState(courtCount);

    // 當對話框打開時重置本地狀態
    React.useEffect(() => {
        if (open) {
            setLocalCourtCount(courtCount);
        }
    }, [open, courtCount]);

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
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    boxShadow: 3,
                }
            }}
        >
            <DialogTitle sx={{
                borderBottom: 1,
                borderColor: 'divider',
                pb: 2
            }}>
                {t('settings.courtSettings')}
            </DialogTitle>
            <DialogContent>
                <Box sx={{ my: 3 }}>
                    <Typography gutterBottom variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                        {t('settings.courtCount')}
                    </Typography>
                    <Slider
                        value={localCourtCount}
                        onChange={(_, value) => setLocalCourtCount(value as number)}
                        min={1}
                        max={MAX_COURTS}
                        marks
                        step={1}
                        valueLabelDisplay="auto"
                        sx={{ mt: 2 }}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {t('settings.currentCourts', { count: localCourtCount })}
                    </Typography>
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2, borderTop: 1, borderColor: 'divider' }}>
                <Button onClick={onClose} color="inherit">
                    {t('common.cancel')}
                </Button>
                <Button
                    onClick={handleSave}
                    variant="contained"
                    color="primary"
                    sx={{ minWidth: 100 }}
                >
                    {t('common.save')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CourtSettingsDialog;