import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Chip,
    Box,
    Fab,
    Typography,
    Switch,
    Tooltip,
    Snackbar,
    Alert,
    Stack,
    Button
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon, ContentPaste as ContentPasteIcon, Edit as EditIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { selectAllPlayers, deletePlayer, togglePlayerEnabled, addPlayer } from '../store/slices/playerSlice';
import { AddPlayerDialog } from './AddPlayerDialog';
import EditPlayerDialog from './EditPlayerDialog';
import { Player } from '../types/court';

interface PlayerListDialogProps {
    open: boolean;
    onClose: () => void;
}

const PlayerListDialog: React.FC<PlayerListDialogProps> = ({ open, onClose }) => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const players = useAppSelector(selectAllPlayers);
    const [addPlayerOpen, setAddPlayerOpen] = useState(false);
    const [editPlayerOpen, setEditPlayerOpen] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
    const [confirmDeleteAllOpen, setConfirmDeleteAllOpen] = useState(false);
    const [importResult, setImportResult] = useState<{
        success: number;
        duplicate: number;
        show: boolean;
        duplicateNames?: string[];
    } | null>(null);
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: 'success' | 'warning' | 'error';
    }>({
        open: false,
        message: '',
        severity: 'success'
    });

    const handleDeletePlayer = (playerId: string) => {
        dispatch(deletePlayer(playerId));
    };

    const handleToggleEnabled = (playerId: string) => {
        dispatch(togglePlayerEnabled(playerId));
    };

    const handleEditPlayer = (player: Player) => {
        setSelectedPlayer(player);
        setEditPlayerOpen(true);
    };

    const handleCloseEditDialog = () => {
        setEditPlayerOpen(false);
        setSelectedPlayer(null);
    };

    const handleSavePlayer = (updatedPlayer: Player) => {
        // 這裡可以添加額外的邏輯，比如顯示成功訊息
        console.log('Player updated:', updatedPlayer);
    };

    const handleDeleteAllPlayers = () => {
        // 檢查是否有球員正在比賽或排隊中
        const activePlayers = players.filter(p => p.isPlaying || p.isQueuing);
        if (activePlayers.length > 0) {
            setSnackbar({
                open: true,
                message: t('playerList.cannotDeleteActivePlayers'),
                severity: 'warning'
            });
            return;
        }

        // 顯示確認對話框
        setConfirmDeleteAllOpen(true);
    };

    const handleConfirmDeleteAll = () => {
        // 刪除所有球員
        players.forEach(player => {
            dispatch(deletePlayer(player.id));
        });

        setSnackbar({
            open: true,
            message: t('playerList.allPlayersDeleted'),
            severity: 'success'
        });

        setConfirmDeleteAllOpen(false);
    };

    const handleCancelDeleteAll = () => {
        setConfirmDeleteAllOpen(false);
    };

    const handleImportFromClipboard = async () => {
        try {
            const text = await navigator.clipboard.readText();
            const lines = text.split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0);

            // 檢查格式並提取球員名稱，同時處理數字+. 和 @ 的情況
            const names = lines.map(line => {
                // 先移除數字+. 格式，再移除可能的 @ 符號
                const match = line.match(/^\d+\.\s*(?:@)?(.+)$/);
                return match ? match[1].trim() : null;
            }).filter((name): name is string => name !== null);

            if (names.length === 0) {
                setImportResult({
                    success: 0,
                    duplicate: 0,
                    show: true
                });
                return;
            }

            let successCount = 0;
            let duplicateCount = 0;
            const duplicateNames: string[] = [];

            for (const name of names) {
                if (players.some(p => p.name === name)) {
                    duplicateCount++;
                    duplicateNames.push(name);
                    continue;
                }

                dispatch(addPlayer({
                    name,
                    gender: 'male',
                    level: 7
                }));
                successCount++;
            }

            setImportResult({
                success: successCount,
                duplicate: duplicateCount,
                show: true,
                duplicateNames
            });
        } catch (error) {
            console.error('Failed to read clipboard:', error);
            setImportResult({
                success: 0,
                duplicate: 0,
                show: true
            });
        }
    };

    const handleCloseImportResult = () => {
        setImportResult(null);
    };

    return (
        <>
            <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
                <DialogTitle sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    pr: 2
                }}>
                    <Typography variant="h6" component="div">
                        {t('playerList.title')}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title={t('playerList.deleteAllPlayers')}>
                            <Fab
                                size="small"
                                color="error"
                                onClick={handleDeleteAllPlayers}
                                sx={{ boxShadow: 1 }}
                                disabled={players.length === 0}
                            >
                                <DeleteIcon />
                            </Fab>
                        </Tooltip>
                        <Tooltip title={t('playerList.importFromClipboard')}>
                            <Fab
                                size="small"
                                color="primary"
                                onClick={handleImportFromClipboard}
                                sx={{ boxShadow: 1 }}
                            >
                                <ContentPasteIcon />
                            </Fab>
                        </Tooltip>
                        <Tooltip title={t('playerList.addPlayer')}>
                            <Fab
                                size="small"
                                color="primary"
                                onClick={() => setAddPlayerOpen(true)}
                                sx={{ boxShadow: 1 }}
                            >
                                <AddIcon />
                            </Fab>
                        </Tooltip>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <List>
                        {players.map((player) => (
                            <ListItem
                                key={player.id}
                                secondaryAction={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Switch
                                            edge="end"
                                            checked={player.enabled}
                                            onChange={() => handleToggleEnabled(player.id)}
                                            disabled={player.isPlaying || player.isQueuing}
                                        />
                                        <Tooltip title={t('playerList.editPlayer')}>
                                            <IconButton
                                                edge="end"
                                                aria-label="edit"
                                                onClick={() => handleEditPlayer(player)}
                                                disabled={player.isPlaying || player.isQueuing}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title={t('playerList.deletePlayer', '刪除球員')}>
                                            <IconButton
                                                edge="end"
                                                aria-label="delete"
                                                onClick={() => handleDeletePlayer(player.id)}
                                                disabled={player.isPlaying || player.isQueuing}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                }
                            >
                                <ListItemText
                                    primary={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography>{player.name}</Typography>
                                            <Chip
                                                size="small"
                                                label={`Lv.${player.level}`}
                                                sx={{
                                                    bgcolor: player.enabled ? 'primary.main' : 'grey.300',
                                                    color: player.enabled ? 'white' : 'grey.600'
                                                }}
                                            />
                                            <Chip
                                                size="small"
                                                label={t(`playerList.genders.${player.gender}`)}
                                                sx={{
                                                    bgcolor: player.gender === 'male' ? 'info.main' : 'secondary.main',
                                                    color: 'white'
                                                }}
                                            />
                                        </Box>
                                    }
                                />
                            </ListItem>
                        ))}
                    </List>
                </DialogContent>
            </Dialog>

            <Snackbar
                open={importResult?.show ?? false}
                autoHideDuration={6000}
                onClose={handleCloseImportResult}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleCloseImportResult}
                    severity={importResult && importResult.success > 0 ? "success" : "warning"}
                    sx={{ width: '100%' }}
                >
                    <Stack spacing={0.5}>
                        {importResult && importResult.success > 0 && (
                            <Typography>
                                {t('playerList.importResult.success', { count: importResult.success })}
                            </Typography>
                        )}
                        {importResult && importResult.duplicate > 0 && (
                            <>
                                <Typography>
                                    {t('playerList.importResult.duplicate', { count: importResult.duplicate })}
                                </Typography>
                                {importResult.duplicateNames && importResult.duplicateNames.length > 0 && (
                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                        {t('playerList.importResult.duplicateNames', {
                                            names: importResult.duplicateNames.join(', ')
                                        })}
                                    </Typography>
                                )}
                            </>
                        )}
                        {(!importResult || (importResult.success === 0 && importResult.duplicate === 0)) && (
                            <Typography>
                                {t('playerList.importResult.noPlayers')}
                            </Typography>
                        )}
                    </Stack>
                </Alert>
            </Snackbar>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    severity={snackbar.severity}
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>

            <AddPlayerDialog
                open={addPlayerOpen}
                onClose={() => setAddPlayerOpen(false)}
            />
            <EditPlayerDialog
                open={editPlayerOpen}
                onClose={handleCloseEditDialog}
                player={selectedPlayer}
                onSave={handleSavePlayer}
            />

            {/* 確認刪除所有球員對話框 */}
            <Dialog
                open={confirmDeleteAllOpen}
                onClose={handleCancelDeleteAll}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    {t('playerList.confirmDeleteAllTitle')}
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        {t('playerList.confirmDeleteAllMessage', { count: players.length })}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelDeleteAll} color="primary">
                        {t('common.cancel')}
                    </Button>
                    <Button onClick={handleConfirmDeleteAll} color="error" variant="contained">
                        {t('playerList.confirmDeleteAll')}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default PlayerListDialog; 