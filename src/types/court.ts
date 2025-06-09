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
  lastEnabledTime?: Date;
  gameCount: number;
}

// 一個場地的狀態
export interface CourtType {
  id: string;
  number: number; // 場地編號
  players: Player[]; // 當前在場的球員，固定4人
  startTime?: Date; // 開始時間
  isActive: boolean; // 是否正在使用
}

// 一組要上場的球員（4人一組）
export interface PlayerGroup {
  id: string;
  players: Player[]; // 固定4人
  createdAt: Date; // 創建時間，用於排序
}

// 整個排點系統的狀態
export interface CourtSystemState {
  courts: CourtType[]; // 所有場地
  waitingQueue: PlayerGroup[]; // 排隊區（4人一組）
  standbyPlayers: Player[]; // 待命區（單人）
  autoAssign: boolean; // 是否自動上場
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
