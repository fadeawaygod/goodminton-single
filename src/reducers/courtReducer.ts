import { Player, Court, PlayerGroup, CourtSystemState } from '../types/court';
import { v4 as uuidv4 } from "uuid";

type CourtAction =
    | { type: 'UPDATE_COURT_COUNT'; count: number }
    | { type: 'TOGGLE_AUTO_ASSIGN' }
    | { type: 'FINISH_GAME'; courtId: string }
    | { type: 'MOVE_TO_STANDBY'; players: Player[] }
    | { type: 'ENABLE_PLAYER'; player: Player }
    | { type: 'DISABLE_PLAYER'; playerId: string }
    | { type: 'ADD_PLAYER'; player: Player }
    | { type: 'AUTO_ASSIGN'; newState: CourtSystemState };

