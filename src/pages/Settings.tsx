import React from 'react';
import {
    Container,
    Typography,
    Paper
} from '@mui/material';
import { useTranslation } from 'react-i18next';

const Settings: React.FC = () => {
    const { t } = useTranslation();

    return (
        <Container maxWidth="sm" sx={{ mt: 4 }}>
            <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
                <Typography variant="h4" gutterBottom>
                    {t('settings.title')}
                </Typography>
                {/* 這裡可加上語言、主題等全域設定表單 */}
            </Paper>
        </Container>
    );
};

export default Settings;