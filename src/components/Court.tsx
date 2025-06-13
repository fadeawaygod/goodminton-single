import React from 'react';
import { Box, Paper, Typography, Button } from '@mui/material';
import { Court as CourtType } from '../types/court';
import { CourtGroup } from './CourtGroup';
import { useTranslation } from 'react-i18next';
import { chameleonColors } from '../constants/court';

interface CourtProps {
    court: CourtType;
    onFinishGame?: (courtId: string) => void;
}

const Court: React.FC<CourtProps> = ({ court, onFinishGame }) => {
    const { t } = useTranslation();

    const handleFinishGame = () => {
        onFinishGame?.(court.id);
    };

    return (
        <Paper
            elevation={2}
            sx={{
                p: 2,
                border: '1px solid',
                borderColor: chameleonColors.border,
                backgroundColor: chameleonColors.background,
                borderRadius: 2,
                height: '100%',
            }}
        >
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">
                    {court.name}
                </Typography>
                {court.isActive && (
                    <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={handleFinishGame}
                    >
                        {t('court.finishGame')}
                    </Button>
                )}
            </Box>
            {court.players.length > 0 ? (
                <CourtGroup
                    players={court.players}
                    courtName={court.name}
                    courtId={court.id}
                />
            ) : (
                <Box
                    sx={{
                        p: 2,
                        border: '1px dashed',
                        borderColor: 'grey.400',
                        borderRadius: 1,
                        textAlign: 'center',
                        color: 'text.secondary',
                    }}
                >
                    <Typography>
                        {t('court.dropHere')}
                    </Typography>
                </Box>
            )}
        </Paper>
    );
};

export default Court; 