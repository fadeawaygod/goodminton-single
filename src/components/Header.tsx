import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Box,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Button,
    Menu,
    MenuItem,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import TranslateIcon from '@mui/icons-material/Translate';
import SettingsIcon from '@mui/icons-material/Settings';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const Header: React.FC = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [languageMenuAnchor, setLanguageMenuAnchor] = useState<null | HTMLElement>(null);

    const handleDrawerToggle = () => {
        setDrawerOpen(!drawerOpen);
    };

    const handleLanguageMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setLanguageMenuAnchor(event.currentTarget);
    };

    const handleLanguageMenuClose = () => {
        setLanguageMenuAnchor(null);
    };

    const changeLanguage = (lang: string) => {
        i18n.changeLanguage(lang);
        handleLanguageMenuClose();
    };

    const handleNavigate = (path: string) => {
        navigate(path);
        setDrawerOpen(false);
    };

    const menuItems = [
        { text: t('header.home'), icon: <HomeIcon />, path: '/' },
        { text: t('court.courts'), icon: <SportsTennisIcon />, path: '/courts' },
        { text: t('common.settings'), icon: <SettingsIcon />, path: '/settings' },
    ];

    const languageMap: Record<string, string> = {
        'zh-TW': '中文',
        'zh': '中文',
        'en': 'English',
    };
    const currentLanguage = languageMap[i18n.language] || i18n.language;

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2 }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography
                        variant="h6"
                        component="div"
                        sx={{
                            flexGrow: 1,
                            cursor: 'pointer'
                        }}
                        onClick={() => handleNavigate('/')}
                    >
                        {t('header.title')}
                    </Typography>

                    {/* 主導航按鈕 */}
                    <Box sx={{ display: { xs: 'none', md: 'flex' }, mr: 2 }}>
                        {menuItems.map((item) => (
                            <Button
                                key={item.path}
                                color="inherit"
                                onClick={() => handleNavigate(item.path)}
                                sx={{
                                    mx: 1,
                                    borderBottom: location.pathname === item.path ? '2px solid white' : 'none'
                                }}
                                startIcon={item.icon}
                            >
                                {item.text}
                            </Button>
                        ))}
                    </Box>

                    {/* 語言切換按鈕 */}
                    <Button
                        color="inherit"
                        onClick={handleLanguageMenuOpen}
                        endIcon={<KeyboardArrowDownIcon />}
                        startIcon={<TranslateIcon />}
                    >
                        {currentLanguage}
                    </Button>
                    <Menu
                        anchorEl={languageMenuAnchor}
                        open={Boolean(languageMenuAnchor)}
                        onClose={handleLanguageMenuClose}
                    >
                        <MenuItem onClick={() => changeLanguage('zh-TW')} selected={i18n.language === 'zh-TW'}>
                            中文
                        </MenuItem>
                        <MenuItem onClick={() => changeLanguage('en')} selected={i18n.language === 'en'}>
                            English
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>
            <Drawer
                variant="temporary"
                anchor="left"
                open={drawerOpen}
                onClose={handleDrawerToggle}
                ModalProps={{
                    keepMounted: true,
                }}
                sx={{
                    '& .MuiDrawer-paper': {
                        width: 240,
                        boxSizing: 'border-box',
                    },
                }}
            >
                <Toolbar />
                <List>
                    {menuItems.map((item) => (
                        <ListItem
                            button
                            key={item.text}
                            onClick={() => handleNavigate(item.path)}
                            selected={location.pathname === item.path}
                        >
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItem>
                    ))}
                </List>
            </Drawer>
        </Box>
    );
};

export default Header;