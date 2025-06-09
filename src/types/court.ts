// 球員基本資訊
export type Gender = 'male' | 'female' | 'unknown';

export interface Player {
  id: string;
  name: string;
  gender: Gender;
  level: number;
  labels: string[];
  enabled: boolean;
  isPlaying: boolean;
  isQueuing: boolean;
  gamesPlayed: number;
  lastGameEndTime?: Date;
}

export interface Court {
  id: string;
  name: string;
  number: number;
  players: string[];
  maxPlayers: number;
  enabled: boolean;
  isActive: boolean;
}

export type CourtType = Omit<Court, 'players'> & {
  players: Player[];
};

// 一組要上場的球員（4人一組）
export interface PlayerGroup {
  id: string;
  players: Player[];
  createdAt: Date;
}

// 整個排點系統的狀態
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
