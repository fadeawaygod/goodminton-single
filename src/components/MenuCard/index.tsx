import React from 'react';
import { Paper, Typography, Button } from '@mui/material';
import { MenuItem } from '../../types/menu';

interface MenuCardProps {
    item: MenuItem;
    onNavigate: (path: string) => void;
    buttonText: string;
}

export const MenuCard: React.FC<MenuCardProps> = ({
    item,
    onNavigate,
    buttonText
}) => {
    const handleClick = () => {
        onNavigate(item.path);
    };

    return (
        <Paper
            sx={{
                p: { xs: 2, sm: 3 },
                display: 'flex',
                flexDirection: 'column',
                height: { xs: 180, sm: 200 },
                cursor: 'pointer',
                '&:hover': {
                    backgroundColor: 'action.hover',
                },
            }}
            onClick={handleClick}
            elevation={3}
            data-testid={`menu-card-${item.path}`}
        >
            <Typography
                variant="h5"
                component="h2"
                gutterBottom
                sx={{
                    fontSize: {
                        xs: '1.3rem',
                        sm: '1.5rem'
                    }
                }}
            >
                {item.title}
            </Typography>
            <Typography
                variant="body1"
                sx={{
                    flex: 1,
                    fontSize: {
                        xs: '0.9rem',
                        sm: '1rem'
                    }
                }}
            >
                {item.description}
            </Typography>
            <Button
                variant="contained"
                color="primary"
                fullWidth
                sx={{
                    mt: { xs: 1, sm: 2 },
                    py: { xs: 0.5, sm: 1 }
                }}
                onClick={handleClick}
                data-testid={`menu-button-${item.path}`}
            >
                {buttonText}
            </Button>
        </Paper>
    );
}; 