import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    List,
    ListItem,
    ListItemText,
    Switch,
    Box,
    Button
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useCourtSystem } from '../contexts/CourtSystemContext';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import { AddPlayerDialog } from './AddPlayerDialog';

const StyledSwitch = styled(Switch)(({ theme }) => ({
    '& .MuiSwitch-switchBase.Mui-checked': {
        color: theme.palette.success.main,
        '&:hover': {
            backgroundColor: theme.palette.success.light
        }
    },
    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
        backgroundColor: theme.palette.success.main
    }
}));

interface PlayerListDialogProps {
    open: boolean;
    onClose: () => void;
}

export const PlayerListDialog: React.FC<PlayerListDialogProps> = ({ open, onClose }) => {
    const { t } = useTranslation();
    const { allPlayers, togglePlayerEnabled } = useCourtSystem();
    const [isAddPlayerDialogOpen, setIsAddPlayerDialogOpen] = useState(false);

    return (
        <>
            <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
                <DialogTitle>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {t('playerList.title')}
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => setIsAddPlayerDialogOpen(true)}
                            size="small"
                        >
                            {t('playerList.addPlayer')}
                        </Button>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <List>
                        {allPlayers.map((player) => (
                            <ListItem
                                key={player.id}
                                secondaryAction={
                                    <StyledSwitch
                                        edge="end"
                                        checked={player.enabled}
                                        onChange={() => togglePlayerEnabled(player.id)}
                                    />
                                }
                                sx={{
                                    opacity: player.enabled ? 1 : 0.5,
                                    transition: 'opacity 0.2s'
                                }}
                            >
                                <ListItemText
                                    primary={player.name}
                                    secondary={
                                        player.isPlaying
                                            ? t('playerList.status.playing')
                                            : player.isQueuing
                                                ? t('playerList.status.waiting')
                                                : t('playerList.status.standby')
                                    }
                                    primaryTypographyProps={{
                                        variant: 'body1',
                                        fontWeight: player.enabled ? 500 : 400
                                    }}
                                    secondaryTypographyProps={{
                                        sx: {
                                            color: player.isPlaying
                                                ? 'success.main'
                                                : player.isQueuing
                                                    ? 'info.main'
                                                    : 'text.secondary'
                                        }
                                    }}
                                />
                            </ListItem>
                        ))}
                    </List>
                </DialogContent>
            </Dialog>
            <AddPlayerDialog
                open={isAddPlayerDialogOpen}
                onClose={() => setIsAddPlayerDialogOpen(false)}
            />
        </>
    );
}; 