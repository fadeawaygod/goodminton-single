import React from 'react';
import { useTranslation } from 'react-i18next';
import { Container, Typography, Box, Grid, Card, CardContent, CardActionArea } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useMenuItems } from '../hooks/useMenuItems';

export const Home: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const menuItems = useMenuItems();

    return (
        <Container
            maxWidth="lg"
            sx={{ mt: { xs: 2, sm: 4 }, px: { xs: 2, sm: 3 } }}
            data-testid="home-container"
        >
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '30vh'
                }}
            >
                <Typography
                    variant="h3"
                    component="h1"
                    gutterBottom
                    align="center"
                    sx={{
                        fontSize: {
                            xs: '2rem',
                            sm: '2.5rem',
                            md: '3rem'
                        },
                        mb: 3
                    }}
                    data-testid="welcome-title"
                >
                    {t('home.welcome')}
                </Typography>
                <Typography
                    variant="h5"
                    component="h2"
                    gutterBottom
                    align="center"
                    sx={{
                        fontSize: {
                            xs: '1.2rem',
                            sm: '1.4rem',
                            md: '1.5rem'
                        },
                        color: 'text.secondary'
                    }}
                    data-testid="welcome-description"
                >
                    {t('home.description')}
                </Typography>
            </Box>

            <Grid container spacing={3} sx={{ mt: 4 }}>
                {menuItems.map((item, index) => (
                    <Grid item xs={12} sm={6} md={4} key={item.path}>
                        <Card>
                            <CardActionArea
                                onClick={() => navigate(item.path)}
                                data-testid={`menu-card-${index}`}
                            >
                                <CardContent>
                                    <Typography variant="h5" component="h3" gutterBottom>
                                        {item.title}
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary">
                                        {item.description}
                                    </Typography>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
};

export default Home; 