import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Typography,
    Box,
    Switch,
    styled,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';
import { Player } from '../types/court';

// 自定義 Switch 組件樣式
const CustomSwitch = styled(Switch)(({ theme }) => ({
    '& .MuiSwitch-switchBase': {
        '&.Mui-checked': {
            color: '#4CAF50',
            '& + .MuiSwitch-track': {
                backgroundColor: '#4CAF50',
                opacity: 0.5,
            },
            '&.Mui-disabled': {
                color: theme.palette.grey[400],
            },
        },
        '&.Mui-disabled + .MuiSwitch-track': {
            opacity: 0.3,
        },
    },
    '& .MuiSwitch-track': {
        backgroundColor: theme.palette.grey[400],
        opacity: 0.3,
    },
}));

interface PlayerListDialogProps {
    open: boolean;
    onClose: () => void;
    players: Player[];
    onTogglePlayer: (playerId: string, enabled: boolean) => void;
}

const PlayerListDialog: React.FC<PlayerListDialogProps> = ({
    open,
    onClose,
    players,
    onTogglePlayer
}) => {
    const { t } = useTranslation();

    const handleToggle = (player: Player) => {
        onTogglePlayer(player.id, !player.enabled);
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Typography variant="h6">
                        {t('players.playerList')}
                    </Typography>
                    <IconButton
                        edge="end"
                        color="inherit"
                        onClick={onClose}
                        aria-label="close"
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>
            <DialogContent dividers>
                {players.length === 0 ? (
                    <Typography color="textSecondary" align="center" py={2}>
                        {t('players.noPlayers')}
                    </Typography>
                ) : (
                    <List>
                        {players.map((player) => (
                            <ListItem
                                key={player.id}
                                sx={{
                                    opacity: player.enabled ? 1 : 0.6,
                                    transition: 'opacity 0.3s ease',
                                }}
                            >
                                <ListItemText
                                    primary={
                                        <Typography
                                            component="span"
                                            variant="body1"
                                            sx={{
                                                fontWeight: player.enabled ? 500 : 400,
                                                color: player.enabled ? 'text.primary' : 'text.secondary',
                                            }}
                                        >
                                            {player.name}
                                        </Typography>
                                    }
                                    secondary={
                                        <Typography
                                            component="span"
                                            variant="body2"
                                            sx={{
                                                color: player.enabled ?
                                                    (player.isPlaying ? 'success.main' :
                                                        player.isQueuing ? 'info.main' : 'text.secondary')
                                                    : 'text.disabled'
                                            }}
                                        >
                                            {player.isPlaying
                                                ? t('court.playing')
                                                : player.isQueuing
                                                    ? t('court.waiting')
                                                    : t('court.standby')}
                                        </Typography>
                                    }
                                />
                                <ListItemSecondaryAction>
                                    <CustomSwitch
                                        edge="end"
                                        checked={player.enabled}
                                        onChange={() => handleToggle(player)}
                                    />
                                </ListItemSecondaryAction>
                            </ListItem>
                        ))}
                    </List>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default PlayerListDialog; 