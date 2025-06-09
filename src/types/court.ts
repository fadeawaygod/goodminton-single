// 球員基本資訊
export type Gender = 'male' | 'female' | 'unknown';

export interface Player {
  id: string;
  name: string;
  gender: Gender;
  level: number;
  enabled: boolean;
  isPlaying: boolean;
  isQueuing: boolean;
  gamesPlayed: number;
}

// 一組要上場的球員（4人一組）
export interface PlayerGroup {
  id: string;
  players: Player[];
  createdAt: Date;
}

// 場地基本資訊
export interface Court {
  id: string;
  name: string;
  number: number;
  players: string[];
  maxPlayers: number;
  enabled: boolean;
  isActive: boolean;
}

// 場地類型（包含完整的球員資訊）
export interface CourtType extends Omit<Court, 'players'> {
  players: Player[];
}

// 系統狀態
export interface CourtSystemState {
  courts: CourtType[];
  waitingQueue: PlayerGroup[];
  standbyPlayers: Player[];
  autoAssign: boolean;
}

export interface DragItem extends Player {
  type: string;
  groupId?: string;
  index?: number;
}

export interface DragPreviewProps {
  item: DragItem | null;
  style: React.CSSProperties;
}

export interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'info' | 'warning' | 'error';
}
