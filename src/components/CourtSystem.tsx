import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Container,
    Grid,
    Paper,
    Typography,
    Box,
    List,
    ListItem,
    Chip,
    Alert,
    Snackbar,
    IconButton,
    Tooltip,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import LogoutIcon from '@mui/icons-material/Logout';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import SettingsIcon from '@mui/icons-material/Settings';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import PeopleIcon from '@mui/icons-material/People';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { MultiBackend, TouchTransition, Preview } from 'react-dnd-multi-backend';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { Court as CourtType, Player, PlayerGroup } from '../types/court';
import { v4 as uuidv4 } from 'uuid';
import CourtSettingsDialog from './CourtSettingsDialog';
import PlayerListDialog from './PlayerListDialog';
import { DraggablePlayer } from './DraggablePlayer';
import { useAppSelector } from '../store/hooks';
import { selectAllPlayers } from '../store/slices/playerSlice';

// Format milliseconds to MM:SS
const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

// 定義拖拽類型
const ItemTypes = {
    PLAYER: 'player',
    GROUP: 'group'
};

// 定義 MultiBackend 的配置
const HTML5toTouch = {
    backends: [
        {
            id: 'html5',
            backend: HTML5Backend,
            preview: true,
            transition: null
        },
        {
            id: 'touch',
            backend: TouchBackend,
            options: {
                enableMouseEvents: true,
                delayTouchStart: 50,
                enableKeyboardEvents: true
            },
            preview: true,
            transition: TouchTransition
        }
    ]
};

// 定義拖拽項目的類型
interface DragItem extends Player {
    type: string;
    groupId?: string;
    index?: number;
}

interface DragPreviewProps {
    item: DragItem | null;
    style: React.CSSProperties;
}

// 拖拽預覽組件
const DragPreview: React.FC<DragPreviewProps> = ({ item, style }) => {
    if (!item) return null;
    return (
        <div style={{ ...style, opacity: 0.8, backgroundColor: '#fff', padding: '4px', borderRadius: '16px' }}>
            <Chip
                label={item.name}
                icon={<PersonIcon />}
                size="small"
            />
        </div>
    );
};

// 定義卡馬龍色系
const chameleonColors = {
    primary: '#2E8B57',    // 海藻綠
    secondary: '#20B2AA',  // 淺海綠
    active: '#48D1CC',     // 中綠松石
    hover: '#98FB98',      // 淺綠
    border: '#3CB371',     // 中海綠
    background: '#F0FFF0', // 蜜瓜綠
    success: '#90EE90',    // 淺綠色
    group: {
        background: '#E0FFF0', // 淺薄荷綠
        border: '#8FBC8F',     // 暗海綠
        header: '#2E8B57',     // 海藻綠
    }
};

// 可拖拽的隊伍組件
const DraggableGroup: React.FC<{
    group: PlayerGroup;
    index: number;
    onPlayerDropToGroup: (player: Player) => void;
    onGroupMove: (dragIndex: number, hoverIndex: number) => void;
    onPlayerUpdate: (player: Player) => void;
}> = ({ group, index, onPlayerDropToGroup, onGroupMove, onPlayerUpdate }) => {
    const { t } = useTranslation();
    const dropTargetRef = useRef<HTMLDivElement>(null);

    // 整個組的拖拽
    const [{ isDragging }, dragRef, preview] = useDrag(() => ({
        type: ItemTypes.GROUP,
        item: () => ({
            type: ItemTypes.GROUP,
            groupId: group.id,
            players: group.players,
            index,
            isPlayingGroup: false,
            group: group,
            fromQueue: true // 添加標記表示來自排隊區
        }),
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }), [group.id, group.players, index]);

    // 使用 preview 來隱藏預覽
    useEffect(() => {
        preview(getEmptyImage(), { captureDraggingState: true });
    }, [preview]);

    // 接收組的拖拽
    const [{ isOver }, dropRef] = useDrop(() => ({
        accept: [ItemTypes.GROUP, ItemTypes.PLAYER],
        hover: (item: any, monitor) => {
            if (!dropTargetRef.current) return;

            // 如果是球員的拖拽，不處理hover
            if (item.type === ItemTypes.PLAYER) return;

            // 如果是從場地拖來的組，不處理hover
            if (item.isPlayingGroup) return;

            const dragIndex = item.index;
            const hoverIndex = index;

            // 如果拖到自己身上，不做任何事
            if (dragIndex === hoverIndex) return;

            // 獲取拖拽元素和目標元素的矩形信息
            const hoverBoundingRect = dropTargetRef.current.getBoundingClientRect();

            // 獲取中點垂直位置
            const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

            // 獲取當前拖拽位置
            const clientOffset = monitor.getClientOffset();
            if (!clientOffset) return;

            // 獲取指針相對於目標元素頂部的垂直位置
            const hoverClientY = clientOffset.y - hoverBoundingRect.top;

            // 只在跨過中點時才進行移動
            // 向上拖動
            if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;
            // 向下拖動
            if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;

            onGroupMove(dragIndex, hoverIndex);
            item.index = hoverIndex;
        },
        drop: (item: any) => {
            if (item.type === ItemTypes.PLAYER) {
                onPlayerDropToGroup(item);
            }
            return {};
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    }), [index, onGroupMove]);

    // 組合 drag 和 drop ref
    const ref = useCallback((node: HTMLDivElement | null) => {
        dropTargetRef.current = node;
        dragRef(node);
        dropRef(node);
    }, [dragRef, dropRef]);

    return (
        <div
            ref={ref}
            data-testid={`group-${index}`}
            style={{
                width: '100%',
                opacity: isDragging ? 0.5 : 1,
                position: 'relative',
                marginBottom: '16px',
                cursor: 'move',
                transform: isDragging ? 'scale(1.02)' : 'scale(1)',
                transition: 'transform 0.2s ease',
            }}
        >
            <Paper
                elevation={isDragging ? 4 : 2}
                sx={{
                    p: 2,
                    border: '1px solid',
                    borderColor: isOver ? chameleonColors.success : chameleonColors.group.border,
                    backgroundColor: isOver ? `${chameleonColors.success}40` : chameleonColors.group.background,
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                }}
            >
                <Box
                    sx={{
                        position: 'absolute',
                        top: -20,
                        left: 10,
                        backgroundColor: chameleonColors.group.header,
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: '4px 4px 0 0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        zIndex: 1,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    }}
                >
                    <DragIndicatorIcon fontSize="small" />
                    <Typography variant="caption">
                        {t('court.group')} #{index + 1}
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {group.players.map(player => (
                        <DraggablePlayer
                            key={player.id}
                            player={player}
                            onPlayerUpdate={onPlayerUpdate}
                        />
                    ))}
                </Box>
            </Paper>
        </div>
    );
};

// 場地上的組別組件
const CourtGroup: React.FC<{
    group: PlayerGroup | undefined;
    courtId: string;
    onPlayerUpdate: (player: Player) => void;
}> = ({ group, courtId, onPlayerUpdate }) => {
    const { t } = useTranslation();
    const [timeElapsed, setTimeElapsed] = useState<number>(0);
    const startTimeRef = useRef<Date>(new Date());

    // 當球員數量變化時重置計時器
    useEffect(() => {
        startTimeRef.current = new Date();
        setTimeElapsed(0);
    }, [group?.players.length]);

    // 計時器
    useEffect(() => {
        const interval = setInterval(() => {
            setTimeElapsed(Date.now() - startTimeRef.current.getTime());
        }, 1000);
        return () => clearInterval(interval);
    }, []); // 只在組件掛載時啟動計時器

    const [{ isDragging }, dragRef, preview] = useDrag(() => ({
        type: ItemTypes.GROUP,
        item: {
            type: ItemTypes.GROUP,
            players: group?.players,
            fromCourtId: courtId,
            group: group,
            isPlayingGroup: true
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }), [courtId, group?.players]);

    // 使用 preview 來隱藏預覽
    useEffect(() => {
        preview(getEmptyImage(), { captureDraggingState: true });
    }, [preview]);

    const elementRef = useCallback(
        (node: HTMLElement | null) => {
            if (dragRef) {
                dragRef(node);
            }
        },
        [dragRef]
    );

    return (
        <div
            ref={elementRef}
            data-testid={`court-group-${courtId}`}
            style={{
                opacity: isDragging ? 0.5 : 1,
                cursor: 'move',
                width: '100%',
                height: '100%',
            }}
        >
            <Paper
                elevation={2}
                sx={{
                    p: 1,
                    border: '1px solid',
                    borderColor: chameleonColors.group.border,
                    backgroundColor: chameleonColors.group.background,
                    borderRadius: 2,
                    height: '100%',
                    position: 'relative',
                    transition: 'all 0.3s ease',
                }}
            >
                <Box
                    sx={{
                        position: 'absolute',
                        top: -20,
                        left: 10,
                        backgroundColor: chameleonColors.group.header,
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: '4px 4px 0 0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        zIndex: 1,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    }}
                >
                    <DragIndicatorIcon fontSize="small" />
                    <Typography variant="caption">
                        {t('court.playing')}
                    </Typography>
                    {
                        group?.players.length === 4 &&
                        <Typography variant="caption">
                            {formatTime(timeElapsed)}
                        </Typography>
                    }
                </Box>
                <Box sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 0.5,
                    pt: 1
                }}>
                    {group?.players.map(player => (
                        <DraggablePlayer
                            key={player.id}
                            player={player}
                            onPlayerUpdate={onPlayerUpdate}
                        />
                    ))}
                </Box>
            </Paper>
        </div>
    );
};

// 修改場地組件
const Court: React.FC<{
    court: CourtType;
    onFinishGame: (courtId: string) => void;
    onPlayerDropToGroup: (player: Player, courtId: string) => void;
    onCreateGroup: (player: Player, courtId: string) => void;
    onGroupAssign: (groupId: string, courtId: string) => void;
    onGroupMove: (fromCourtId: string, toCourtId: string) => void;
    onCourtNameChange?: (courtId: string, newName: string) => void;
    onPlayerUpdate: (player: Player) => void;
}> = ({ court, onFinishGame, onPlayerDropToGroup, onCreateGroup, onGroupAssign, onGroupMove, onCourtNameChange, onPlayerUpdate }) => {
    const { t } = useTranslation();
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(court.name);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleNameClick = () => {
        if (!court.isActive && onCourtNameChange) {
            setIsEditing(true);
            setEditName(court.name);
            setTimeout(() => inputRef.current?.focus(), 0);
        }
    };

    const handleNameSubmit = () => {
        if (editName.trim() && editName !== court.name && onCourtNameChange) {
            onCourtNameChange(court.id, editName.trim());
        } else {
            setEditName(court.name);
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleNameSubmit();
        } else if (e.key === 'Escape') {
            setEditName(court.name);
            setIsEditing(false);
        }
    };

    const [{ isOver, canDrop }, dropRef] = useDrop(() => ({
        accept: [ItemTypes.PLAYER, ItemTypes.GROUP],
        canDrop: (item: any) => {
            if (court.isActive) return false;

            if (item.type === ItemTypes.GROUP) {
                // 如果是組別拖拽，只有空場地可以接受
                if (court.group) return false;
                if (item.fromCourtId === court.id) return false;
                if (item.isPlayingGroup) return true;
                if (item.fromQueue) return true;
            }

            if (item.type === ItemTypes.PLAYER) {
                // 如果是球員拖拽，場地必須未滿4人
                return !court.group || court.group.players.length < 4;
            }

            return false;
        },
        drop: (item: any) => {
            if (item.type === ItemTypes.GROUP) {
                if (item.isPlayingGroup && item.fromCourtId) {
                    onGroupMove(item.fromCourtId, court.id);
                } else if (item.fromQueue && item.groupId) {
                    onGroupAssign(item.groupId, court.id);
                }
            } else if (item.type === ItemTypes.PLAYER && court.group) {
                onPlayerDropToGroup(item, court.group.id);
            } else if (item.type === ItemTypes.PLAYER && !court.group) {
                onCreateGroup(item, court.id);
            }
            return { dropped: true };
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    }), [court.id, court.isActive, court.group, onGroupMove, onGroupAssign, onCreateGroup]);

    const elementRef = useCallback(
        (node: HTMLElement | null) => {
            if (dropRef) {
                dropRef(node);
            }
        },
        [dropRef]
    );

    const hasGroup = court.group !== undefined

    return (
        <div ref={elementRef} data-testid={`court-${court.name}`}>
            <Paper
                elevation={1}
                sx={{
                    p: { xs: 1, sm: 2 },
                    height: { xs: '150px', sm: '200px' },
                    backgroundColor: hasGroup ? chameleonColors.active : chameleonColors.background,
                    '&:hover': hasGroup ? {
                        backgroundColor: chameleonColors.hover,
                    } : canDrop ? {
                        backgroundColor: isOver ? `${chameleonColors.success}40` : `${chameleonColors.hover}40`,
                    } : {},
                    display: 'flex',
                    flexDirection: 'column',
                    border: '1px solid',
                    borderColor: isOver && canDrop ? chameleonColors.success : chameleonColors.border,
                    position: 'relative',
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    opacity: canDrop && isOver ? 0.8 : 1,
                }}
            >
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1
                }}>
                    {isEditing && onCourtNameChange ? (
                        <input
                            ref={inputRef}
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onBlur={handleNameSubmit}
                            onKeyDown={handleKeyDown}
                            style={{
                                fontSize: 'inherit',
                                fontFamily: 'inherit',
                                fontWeight: 'bold',
                                border: 'none',
                                background: 'transparent',
                                padding: '2px 4px',
                                width: '60px',
                                color: chameleonColors.primary,
                                outline: 'none',
                                borderBottom: `1px solid ${chameleonColors.primary}`,
                            }}
                        />
                    ) : (
                        <Typography
                            variant="subtitle1"
                            onClick={handleNameClick}
                            sx={{
                                fontSize: { xs: '0.9rem', sm: '1rem' },
                                color: hasGroup ? chameleonColors.primary : 'text.secondary',
                                fontWeight: 'bold',
                                cursor: (court.isActive || !onCourtNameChange) ? 'default' : 'pointer',
                                '&:hover': {
                                    textDecoration: (court.isActive || !onCourtNameChange) ? 'none' : 'underline',
                                },
                            }}
                        >
                            {court.name}
                        </Typography>
                    )}
                    {hasGroup && (
                        <Tooltip title={t('court.finishGame')} placement="top">
                            <IconButton
                                size="small"
                                onClick={() => onFinishGame(court.id)}
                                sx={{
                                    color: chameleonColors.primary,
                                    '&:hover': {
                                        backgroundColor: `${chameleonColors.hover}40`,
                                    },
                                }}
                            >
                                <LogoutIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>
                {hasGroup && (
                    <Box sx={{
                        flex: 1,
                        position: 'relative',
                    }}>
                        <CourtGroup
                            group={court.group}
                            courtId={court.id}
                            onPlayerUpdate={onPlayerUpdate}
                        />
                    </Box>
                )}
            </Paper>
        </div>
    );
};

// 修改排隊區組件
const DroppableQueueArea: React.FC<{
    waitingQueue: PlayerGroup[];
    onCreateNewGroup: (player: Player) => void;
    onPlayerDropToGroup: (player: Player, groupId: string) => void;
    onQueueReorder: (dragIndex: number, hoverIndex: number) => void;
    onPlayingGroupDrop: (group: PlayerGroup) => void;
    onPlayerUpdate: (player: Player) => void;
}> = ({ waitingQueue, onCreateNewGroup, onPlayerDropToGroup, onQueueReorder, onPlayingGroupDrop, onPlayerUpdate }) => {
    const { t } = useTranslation();
    const [{ isOver }, dropRef] = useDrop(() => ({
        accept: [ItemTypes.PLAYER, ItemTypes.GROUP],
        drop: (item: any, monitor) => {
            const didDropInChild = monitor.didDrop();
            if (!didDropInChild) {
                if (item.type === ItemTypes.PLAYER) {
                    onCreateNewGroup(item);
                } else if (item.type === ItemTypes.GROUP && item.isPlayingGroup) {
                    // 允許場地上的 group 拖曳到排隊區
                    onPlayingGroupDrop(item.group);
                }
            }
            return {};
        },
        collect: (monitor) => ({
            isOver: monitor.isOver({ shallow: true }),
        }),
    }));

    return (
        <Box
            ref={dropRef as any}
            data-testid="waiting-queue"
            role="region"
            aria-label="waiting queue"
            sx={{
                minHeight: '200px',
                position: 'relative',
                backgroundColor: isOver ? 'action.hover' : 'transparent',
                transition: 'background-color 0.2s',
            }}
        >
            {isOver && (
                <Typography
                    variant="body2"
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        color: 'text.secondary',
                        textAlign: 'center',
                        pointerEvents: 'none',
                    }}
                >
                    {t('court.dropToCreateGroup')}
                </Typography>
            )}
            <List sx={{ pt: 1 }}>
                {waitingQueue.map((group, index) => (
                    <ListItem key={group.id} sx={{ display: 'block', mb: 1 }}>
                        <DraggableGroup
                            group={group}
                            index={index}
                            onPlayerDropToGroup={(player) => onPlayerDropToGroup(player, group.id)}
                            onGroupMove={onQueueReorder}
                            onPlayerUpdate={onPlayerUpdate}
                        />
                    </ListItem>
                ))}
            </List>
        </Box>
    );
};

// 修改待命區組件
const StandbyArea: React.FC<{
    players: Player[];
    onPlayerMoveToStandby: (player: Player) => void;
    onGroupDissolve: (group: PlayerGroup) => void;
    courts: CourtType[];
    onPlayerUpdate: (player: Player) => void;
}> = ({ players, onPlayerMoveToStandby, onGroupDissolve, courts, onPlayerUpdate }) => {
    const { t } = useTranslation();
    const dropTargetRef = useRef<HTMLDivElement>(null);

    const [{ isOver }, dropRef] = useDrop(() => ({
        accept: [ItemTypes.PLAYER, ItemTypes.GROUP],
        drop: (item: any) => {
            if (item.type === ItemTypes.PLAYER) {
                onPlayerMoveToStandby(item);
            } else if (item.type === ItemTypes.GROUP) {
                onGroupDissolve(item.group);
            }
            return {};
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    }));

    // 組合 ref
    const ref = useCallback((node: HTMLDivElement | null) => {
        dropTargetRef.current = node;
        dropRef(node);
    }, [dropRef]);

    return (
        <Paper
            elevation={1}
            ref={ref}
            data-testid="standby-area"
            role="region"
            aria-label="standby area"
            sx={{
                p: { xs: 1, sm: 2 },
                height: { xs: '300px', sm: '400px' },
                overflow: 'auto',
                backgroundColor: isOver ? `${chameleonColors.hover}40` : chameleonColors.background,
                transition: 'all 0.3s ease',
                border: '1px solid',
                borderColor: chameleonColors.border,
                borderRadius: 2,
            }}
        >
            <Typography
                variant="subtitle1"
                sx={{
                    mb: 1,
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                    color: chameleonColors.primary,
                    fontWeight: 'bold',
                }}
            >
                {t('court.standbyArea')}
            </Typography>
            <Box sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 0.5
            }}>
                {players.map(player => (
                    <DraggablePlayer
                        key={player.id}
                        player={player}
                        onPlayerUpdate={onPlayerUpdate}
                    />
                ))}
            </Box>
        </Paper>
    );
};

export const CourtSystem: React.FC = () => {
    const { t, i18n } = useTranslation();
    const [courts, setCourts] = useState<CourtType[]>([]);
    const [standbyPlayers, setStandbyPlayers] = useState<Player[]>([]);
    const [waitingQueue, setWaitingQueue] = useState<PlayerGroup[]>([]);
    const [autoAssign, setAutoAssign] = useState(false);
    const [courtCount, setCourtCount] = useState(4);
    const players = useAppSelector(selectAllPlayers);

    const [settingsOpen, setSettingsOpen] = useState(false);
    const [ttsEnabled, setTtsEnabled] = useState(true);
    const [isPlayerListOpen, setIsPlayerListOpen] = useState(false);
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: 'success' | 'info' | 'warning' | 'error';
    }>({ open: false, message: '', severity: 'info' });

    // 基礎 TTS 函數
    const playTTS = useCallback((text: string, lang: string = 'zh-TW') => {
        if (!ttsEnabled) return Promise.resolve();
        return new Promise<void>((resolve, reject) => {
            if (!window.speechSynthesis) {
                setSnackbar({
                    open: true,
                    message: '瀏覽器不支援語音合成',
                    severity: 'error'
                });
                reject();
                return;
            }

            // 創建語音實例
            const utterance = new window.SpeechSynthesisUtterance(text);
            utterance.lang = lang;
            utterance.rate = 0.6;
            utterance.pitch = 1;
            utterance.volume = 1;
            utterance.onend = () => resolve();
            utterance.onerror = (event: Event) => reject(event);

            // 設置語音
            const availableVoices = window.speechSynthesis.getVoices();
            const selectedVoice = availableVoices.find(v => v.lang === lang);
            if (selectedVoice) {
                utterance.voice = selectedVoice;
            }

            // 播放語音
            window.speechSynthesis.speak(utterance);
        });
    }, [ttsEnabled, setSnackbar]);

    // 場地 TTS 函數
    const playCourtTTS = useCallback(async (names: string[], number: string, lang?: string) => {
        if (!ttsEnabled) return;
        try {
            // 確定語言
            const ttsLang = lang || (i18n.language === 'zh-TW' || i18n.language === 'zh' ? 'zh-TW' : 'en');

            // 生成消息
            const msg = t('court.ttsCallToCourt', {
                names: names.join('、'),
                number: number
            });

            // 播放語音
            await playTTS(msg, ttsLang);
        } catch (e) {
            setSnackbar({
                open: true,
                message: '語音服務暫時無法使用，請稍後再試',
                severity: 'error'
            });
        }
    }, [ttsEnabled, i18n.language, t, playTTS, setSnackbar]);

    // 處理組別直接上場
    const handleGroupAssign = useCallback((groupId: string, courtId: string) => {
        const group = waitingQueue.find(g => g.id === groupId);
        const court = courts.find(c => c.id === courtId);
        if (!group || !court || court.isActive) return;

        // 更新場地狀態
        setCourts(prevCourts => prevCourts.map(court =>
            court.id === courtId
                ? {
                    ...court,
                    group: group,
                    isActive: true,
                    startTime: new Date(),
                }
                : court
        ));

        // 從等待隊列中移除該組
        setWaitingQueue(prevQueue => prevQueue.filter(g => g.id !== groupId));

        // 播放語音提示
        const playerNames = group.players.map(p => p.name);
        const courtNumber = court.name;
        const ttsLang = i18n.language === 'zh-TW' || i18n.language === 'zh' ? 'zh-TW' : 'en';
        playCourtTTS(playerNames, courtNumber, ttsLang);

        group.court = court;

        // 顯示提示
        setSnackbar({
            open: true,
            message: t('court.groupAssigned', { court: court.name }),
            severity: 'success'
        });
    }, [waitingQueue, courts, playCourtTTS, t, i18n.language, setSnackbar]);

    // 初始場地設置和場地數量變化處理
    useEffect(() => {
        // 如果沒有場地，進行初始化
        if (courts.length === 0) {
            const initialCourts = Array(courtCount).fill(null).map((_, i) => ({
                id: uuidv4(),
                name: `${i + 1}`,
                players: [],
                isActive: false,
                group: undefined,
            }));
            setCourts(initialCourts);
            return;
        }

        // 處理場地數量變化
        if (courtCount !== courts.length) {
            setCourts(prevCourts => {
                if (courtCount > prevCourts.length) {
                    // 擴充陣列 - 添加新的 court 物件，保留現有場地的名稱
                    const newCourts = [...prevCourts];
                    for (let i = prevCourts.length; i < courtCount; i++) {
                        newCourts.push({
                            id: uuidv4(),
                            name: `${i + 1}`, // 新場地使用數字名稱                       
                            isActive: false,
                            group: undefined,
                        });
                    }
                    return newCourts;
                } else if (courtCount < prevCourts.length) {
                    // 縮減陣列 - 移除多餘的 court 物件，保留前 N 個場地
                    return prevCourts.slice(0, courtCount).map(court => ({
                        ...court,
                        players: [],  // 清空被保留場地的球員
                        isActive: false,  // 重置活動狀態
                    }));
                }
                return prevCourts;
            });
        }
    }, [courtCount, courts.length]); // 添加必要的依賴項

    useEffect(() => {
        //TODO: 更新等待隊列和場地狀態
        // 更新待命區

        const existingPlayers = findPlayersOnCourtAndQueue()
        const existingPlayerNames = existingPlayers.map(p => p.name)

        const updatedStandbyPlayers = players.filter(player =>
            player.enabled && !player.group && !existingPlayerNames.includes(player.name)
        );
        setStandbyPlayers(updatedStandbyPlayers);
        // 更新場地中的players
        setCourts(prevCourts => prevCourts.map(court => {
            if (court.group) {
                return {
                    ...court,
                    group: {
                        ...court.group,
                        players: court.group.players.filter(player => player.enabled)
                    }
                };
            }
            return court;
        }));
        // 更新等待隊列
        setWaitingQueue(prevQueue => prevQueue.map(group => ({
            ...group,
            players: group.players.filter(player => player.enabled)
        })));
    }, [players]);

    // 檢查並自動安排球員上場
    const checkAndAssignCourt = useCallback(() => {
        if (waitingQueue.length === 0 || waitingQueue[0].players.length < 4) {
            return;
        }
        const emptyCourt = courts.find(court => !court.isActive && !court.group);
        if (!emptyCourt) return;

        const nextGroup = waitingQueue[0];
        emptyCourt.group = nextGroup
        nextGroup.court = emptyCourt

        // 更新場地狀態
        setCourts(prevCourts => prevCourts.map(court =>
            court.id === emptyCourt.id
                ? {
                    ...court,
                    group: nextGroup,
                    isActive: true,
                }
                : court
        ));

        // 從等待隊列中移除該組
        setWaitingQueue(prevQueue => prevQueue.filter(group => group.id !== nextGroup.id));
        const names = nextGroup.players.map(p => p.name);
        playCourtTTS(names, String(emptyCourt.name));
        // 顯示提示
        setSnackbar({
            open: true,
            message: t('court.groupMovedToCourt', { court: emptyCourt.name }),
            severity: 'success'
        });
    }, [t, courts, waitingQueue, playCourtTTS]);

    // 當自動分配開啟時檢查是否可以安排球員上場
    useEffect(() => {
        if (autoAssign) {
            checkAndAssignCourt();
        }
    }, [courts, players, checkAndAssignCourt, autoAssign]);

    // 處理比賽結束（下場）
    const handleFinishGame = (courtId: string) => {
        const court = courts.find(c => c.id === courtId);
        if (!court || !court.isActive || !court.group) return;

        // 更新球員的gamesPlayed
        for (const player of court.group.players) {
            player.gamesPlayed++;
        }

        // 更新本地狀態
        setCourts(prevCourts => prevCourts.map(c =>
            c.id === courtId
                ? { ...c, group: undefined, isActive: false }
                : c
        ));

        setStandbyPlayers(prevPlayers => [
            ...prevPlayers,
            ...court.group!.players.map(p => ({ ...p, isPlaying: false }))
        ]);

        // 播放語音提示
        playTTS(t('court.ttsGameFinished', { number: court.name }));

        // 顯示提示
        setSnackbar({
            open: true,
            message: t('court.gameFinished'),
            severity: 'success'
        });
    };

    // 處理球員拖拽到場地（改為加入等待隊列）
    const onCreateNewGroup = (player: Player, targetCourtId?: string) => {

        const targetCourt = courts.find(c => c.id === targetCourtId);

        // 如果沒有指定目標場地或目標場地不可用，則創建新組到排隊區
        const newGroup: PlayerGroup = {
            id: uuidv4(),
            players: [player],
            createdAt: new Date(),
            court: targetCourt
        };
        player.group = newGroup
        setCourts(prevCourts => prevCourts.map(court => {
            if (court.id === targetCourtId) {
                court.group = newGroup;
            }
            else if (court.group && court.group.players.some(p => p.id === player.id)) {
                const remainingPlayers = court.group.players.filter(p => p.id !== player.id);
                if (remainingPlayers.length === 0) {
                    return {
                        ...court,
                        group: undefined,
                        isActive: false
                    };
                } else {
                    return {
                        ...court,
                        group: {
                            ...court.group,
                            players: remainingPlayers
                        },
                        isActive: remainingPlayers.length === 4
                    };
                }
            }
            return court;
        }));

        // 從待命區移除該球員
        setStandbyPlayers(prevPlayers => prevPlayers.filter(p => p.id !== player.id));

        // 從其他隊伍中移除該球員
        setWaitingQueue(prevQueue => [
            ...prevQueue.map(group => ({
                ...group,
                players: group.players.filter(p => p.id !== player.id)
            })).filter(group => group.players.length > 0)
        ]);
        if (!targetCourt) {
            setWaitingQueue(prevQueue => [...prevQueue, newGroup]);
        }

        // 顯示提示
        setSnackbar({
            open: true,
            message: targetCourtId ? t('court.playerAddedToCourt') : t('court.newGroupCreated'),
            severity: 'info'
        });
    };

    // 處理球員拖拽到隊伍
    const handlePlayerDropToGroup = (player: Player, groupId: string) => {
        // 檢查目標組是否已滿
        let targetGroup = waitingQueue.find(g => g.id === groupId)
        if (!targetGroup) {
            targetGroup = courts.find(c => c.group?.id === groupId)?.group;
        }

        if (!targetGroup || targetGroup.players.length >= 4) {
            setSnackbar({
                open: true,
                message: t('court.maxPlayersSelected'),
                severity: 'error'
            });
            return;
        }
        if (targetGroup.players.find(p => p.id == player.id)) {
            setSnackbar({
                open: true,
                message: t('court.playerAlreadyInGroup'),
                severity: 'error'
            });
            return;
        }
        player.group = targetGroup

        // 從所有場地中移除該球員
        setCourts(prevCourts => prevCourts.map(court => {
            if (court.group && court.group.id != groupId && court.group.players.some(p => p.id === player.id)) {
                const remainingPlayers = court.group.players.filter(p => p.id !== player.id);
                if (remainingPlayers.length === 0) {
                    return {
                        ...court,
                        group: undefined,
                        isActive: false
                    };
                } else {
                    return {
                        ...court,
                        group: {
                            ...court.group,
                            players: remainingPlayers
                        },
                        isActive: remainingPlayers.length === 4
                    };
                }
            }
            else if (court.group && court.group.id === groupId && !court.group.players.includes(player)) {
                court.group.players.push(player)
            }
            return court;
        }));
        setStandbyPlayers(prevPlayers => prevPlayers.filter(p => p.id !== player.id));
        setWaitingQueue(prevQueue => prevQueue.map(group => {
            if (group.id === groupId) {
                return {
                    ...group,
                    players: [...group.players, { ...player, isPlaying: false, isQueuing: true }]
                };
            }
            return {
                ...group,
                players: group.players.filter(p => p.id !== player.id)
            };
        }).filter(group => group.players.length > 0));

    };

    // 處理等待隊列重新排序
    const handleQueueReorder = (dragIndex: number, hoverIndex: number) => {
        setWaitingQueue(prevQueue => {
            const updatedQueue = [...prevQueue];
            const [draggedGroup] = updatedQueue.splice(dragIndex, 1);
            updatedQueue.splice(hoverIndex, 0, draggedGroup);
            return updatedQueue;
        });
    };

    // 處理場地間組別移動
    const handleCourtGroupMove = (fromCourtId: string, toCourtId: string) => {
        const fromCourt = courts.find(c => c.id === fromCourtId);
        const toCourt = courts.find(c => c.id === toCourtId);

        if (!fromCourt || !toCourt || toCourt.isActive || !fromCourt.group) return;

        setCourts(prevCourts => prevCourts.map(court => {
            if (court.id === fromCourtId) {
                return { ...court, group: undefined, isActive: false };
            }
            if (court.id === toCourtId) {
                return {
                    ...court,
                    group: {
                        ...fromCourt.group!,
                        players: fromCourt.group!.players.map(p => ({ ...p, isPlaying: true, isQueuing: false })),
                        court: court
                    },
                    isActive: true,
                };
            }
            return court;
        }));

        setSnackbar({
            open: true,
            message: t('court.groupMovedToCourt', { court: toCourt.name }),
            severity: 'success'
        });
    };

    const handlePlayerMoveToStandby = (player: Player) => {
        if (player?.group?.court) {
            //remove player from group
            setCourts(prevCourts => prevCourts.map(court => {
                if (court.group && court.group.players.some(p => p.id === player.id)) {
                    const remainingPlayers = court.group.players.filter(p => p.id !== player.id);
                    if (remainingPlayers.length === 0) {
                        return {
                            ...court,
                            group: undefined,
                            isActive: false
                        };
                    } else {
                        return {
                            ...court,
                            group: {
                                ...court.group,
                                players: remainingPlayers
                            },
                            isActive: remainingPlayers.length === 4
                        };
                    }
                }
                return court;
            }));
            //remove empty group
        }
        else if (player?.group) {
            setWaitingQueue(prevQueue => prevQueue.map(group => ({
                ...group,
                players: group.players.filter(p => p.id !== player.id)
            })).filter(group => group.players.length > 0));
        }
        player.group = undefined

        // 將球員添加到待命區
        const updatedPlayer = { ...player, isQueuing: false, isPlaying: false };
        setStandbyPlayers(prevPlayers => [...prevPlayers, updatedPlayer]);
    };

    // 處理自動上場開關
    const handleAutoAssignToggle = () => {
        setAutoAssign(prev => !prev);

        // 顯示提示
        setSnackbar({
            open: true,
            message: t(autoAssign ? 'court.autoAssignDisabled' : 'court.autoAssignEnabled'),
            severity: 'info'
        });
    };

    // 處理場地組別移動到排隊區
    const handlePlayingGroupToQueue = useCallback((group: PlayerGroup) => {
        // 移除排隊區所有 group 中重複的球員
        if (group.court) {
            setCourts(prevCourts => prevCourts.map(c =>
                c.id === group.court?.id
                    ? { ...c, group: undefined, isActive: false }
                    : c
            ));
            group.court = undefined

        }
        setWaitingQueue(prevQueue => {
            return [...prevQueue, group];
        });

        setSnackbar({
            open: true,
            message: t('court.groupMovedToQueue'),
            severity: 'info'
        });
    }, [courts, t]);

    // 處理場地組別解散到待命區
    const handleGroupDissolve = (group: PlayerGroup) => {
        if (group.court) {
            setCourts(prevCourts => prevCourts.map(c =>
                c.id === group?.court?.id
                    ? { ...c, group: undefined, isActive: false }
                    : c
            ));
            group.court = undefined;
        }
        else {
            setWaitingQueue(prevQueue => prevQueue.filter(g => g.id !== group.id));
        }
        // 使用 context 的方法將球員移動到待命區
        movePlayersToStandby(group.players);

        setSnackbar({
            open: true,
            message: t('court.groupDissolved'),
            severity: 'info'
        });
    };

    const movePlayersToStandby = (players: Player[]) => {
        setStandbyPlayers(prev => {
            const newPlayers = players.filter(p =>
                p.enabled && // 只添加已啟用的球員
                !prev.some(existingPlayer => existingPlayer.id === p.id) // 避免重複
            );
            return [...prev, ...newPlayers];
        });
    };

    // 自動分配效果
    useEffect(() => {
        if (autoAssign && waitingQueue.length > 0) {
            const availableCourts = courts.filter(court => !court.isActive);
            if (availableCourts.length > 0) {
                const nextGroup = waitingQueue[0];
                if (nextGroup.players.length === 4) {
                    handleGroupAssign(nextGroup.id, availableCourts[0].id);
                }
            }
        }
    }, [autoAssign, waitingQueue, courts, handleGroupAssign, courtCount]);  // 添加 courtCount 依賴

    // 處理場地名稱修改
    const handleCourtNameChange = useCallback((courtId: string, newName: string) => {
        setCourts(prevCourts => prevCourts.map(court =>
            court.id === courtId
                ? { ...court, name: newName }
                : court
        ));
    }, []);

    // 處理球員更新
    const handlePlayerUpdate = useCallback((updatedPlayer: Player) => {
        // 更新所有相關狀態中的球員資訊
        setCourts(prevCourts => prevCourts.map(court => {
            if (court.group) {
                return {
                    ...court,
                    group: {
                        ...court.group,
                        players: court.group.players.map(p =>
                            p.id === updatedPlayer.id ? { ...p, ...updatedPlayer } : p
                        )
                    }
                };
            }
            return court;
        }));

        setWaitingQueue(prevQueue => prevQueue.map(group => ({
            ...group,
            players: group.players.map(p =>
                p.id === updatedPlayer.id ? { ...p, ...updatedPlayer } : p
            )
        })));

        setStandbyPlayers(prevPlayers => prevPlayers.map(p =>
            p.id === updatedPlayer.id ? { ...p, ...updatedPlayer } : p
        ));

        // 顯示提示
        setSnackbar({
            open: true,
            message: t('playerList.playerUpdated'),
            severity: 'success'
        });
    }, [t]);

    const findPlayersOnCourtAndQueue = () => {
        const playersOnCourt = courts.flatMap(court => court.group?.players || []);
        const playersInQueue = waitingQueue.flatMap(group => group.players);
        return [...playersOnCourt, ...playersInQueue];
    };

    return (
        <DndProvider backend={MultiBackend} options={HTML5toTouch}>
            <CourtSettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} courtCount={courtCount} setCourtCount={setCourtCount} />
            <PlayerListDialog
                open={isPlayerListOpen}
                onClose={() => setIsPlayerListOpen(false)}
            />
            <Container maxWidth="xl" sx={{ mt: { xs: 2, sm: 4 }, px: { xs: 1, sm: 3 } }}>
                <Grid container spacing={3}>
                    {/* 場地區域 */}
                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: { xs: 1, sm: 2 } }}>
                            <Typography variant="h6" sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' }, flexGrow: 1 }}>
                                {t('court.courts')}
                            </Typography>
                            {/* 靠右排列，球員列表按鈕在語音喇叭按鈕左邊 */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Tooltip title={t('players.viewPlayers')}>
                                    <IconButton
                                        onClick={() => setIsPlayerListOpen(true)}
                                        size="small"
                                        aria-label="view players"
                                    >
                                        <PeopleIcon />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title={ttsEnabled ? t('court.ttsOn', '語音開啟') : t('court.ttsOff', '語音關閉')}>
                                    <IconButton
                                        onClick={() => setTtsEnabled(v => !v)}
                                        color={ttsEnabled ? 'primary' : 'default'}
                                        aria-label="語音開關"
                                    >
                                        {ttsEnabled ? <VolumeUpIcon /> : <VolumeOffIcon />}
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title={t('settings.openSettings')}>
                                    <IconButton onClick={() => setSettingsOpen(true)} size="small">
                                        <SettingsIcon />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </Box>
                        <Grid container spacing={2}>
                            {courts.map(court => (
                                <Grid item xs={6} sm={6} md={3} key={court.id}>
                                    <Court
                                        court={court}
                                        onFinishGame={handleFinishGame}
                                        onPlayerDropToGroup={handlePlayerDropToGroup}
                                        onCreateGroup={onCreateNewGroup}
                                        onGroupAssign={handleGroupAssign}
                                        onGroupMove={handleCourtGroupMove}
                                        onCourtNameChange={handleCourtNameChange}
                                        onPlayerUpdate={handlePlayerUpdate}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    </Grid>

                    {/* 排隊區和待命區 */}
                    <Grid item xs={12} container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <Paper elevation={1} sx={{ p: { xs: 1, sm: 2 }, height: { xs: '300px', sm: '400px' }, overflow: 'auto' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="h6">
                                        {t('court.waitingQueue')}
                                    </Typography>
                                    <Tooltip title={t('court.autoAssign')}>
                                        <IconButton
                                            onClick={handleAutoAssignToggle}
                                            color={autoAssign ? "primary" : "default"}
                                            size="small"
                                        >
                                            <AutorenewIcon />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                                <DroppableQueueArea
                                    waitingQueue={waitingQueue}
                                    onCreateNewGroup={onCreateNewGroup}
                                    onPlayerDropToGroup={handlePlayerDropToGroup}
                                    onQueueReorder={handleQueueReorder}
                                    onPlayingGroupDrop={handlePlayingGroupToQueue}
                                    onPlayerUpdate={handlePlayerUpdate}
                                />
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <StandbyArea
                                players={standbyPlayers}
                                onPlayerMoveToStandby={handlePlayerMoveToStandby}
                                onGroupDissolve={handleGroupDissolve}
                                courts={courts}
                                onPlayerUpdate={handlePlayerUpdate}
                            />
                        </Grid>
                    </Grid>
                </Grid>

                {/* 提示訊息 */}
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

                <Preview generator={({ item, style }) => (
                    <DragPreview item={item as DragItem} style={style} />
                )}>
                </Preview>
            </Container>
        </DndProvider>
    );
};


export default CourtSystem;