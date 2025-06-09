import { CourtSystemState, Player, PlayerGroup } from "../types/court";
import { v4 as uuidv4 } from "uuid";

export const createInitialState = (courtCount: number, initialPlayers: Player[] = []): CourtSystemState => ({
  courts: Array(courtCount)
    .fill(null)
    .map((_, index) => ({
      id: `court-${index + 1}`,
      number: index + 1,
      players: [],
      isActive: false,
    })),
  waitingQueue: [],
  standbyPlayers: [...initialPlayers],
  autoAssign: false,
});

type CourtAction =
  | { type: "FINISH_GAME"; courtId: string }
  | { type: "PLAYER_DROP"; player: Player; courtId?: string }
  | { type: "PLAYER_DROP_TO_GROUP"; player: Player; groupId: string }
  | { type: "QUEUE_REORDER"; dragIndex: number; hoverIndex: number }
  | { type: "COURT_GROUP_MOVE"; fromCourtId: string; toCourtId: string }
  | { type: "PLAYER_MOVE_TO_STANDBY"; player: Player }
  | { type: "TOGGLE_AUTO_ASSIGN" }
  | { type: "GROUP_ASSIGN"; groupId: string; courtId: string }
  | { type: "PLAYING_GROUP_TO_QUEUE"; players: Player[]; fromCourtId: string }
  | { type: "GROUP_DISSOLVE"; players: Player[]; courtId: string }
  | { type: "UPDATE_COURT_COUNT"; count: number }
  | { type: "UPDATE_MAX_COURTS"; count: number }
  | { type: "AUTO_ASSIGN"; newState: CourtSystemState }
  | { type: "MOVE_TO_STANDBY"; players: Player[] }
  | { type: "DISABLE_PLAYER"; playerId: string }
  | { type: "ENABLE_PLAYER"; player: Player };

export const courtReducer = (state: CourtSystemState, action: CourtAction): CourtSystemState => {
  switch (action.type) {
    case "FINISH_GAME": {
      const court = state.courts.find((c) => c.id === action.courtId);
      if (!court || !court.isActive) return state;

      const updatedStandbyPlayers = [...state.standbyPlayers, ...court.players.map((p) => ({ ...p, isPlaying: false }))];

      const updatedCourts = state.courts.map((c) =>
        c.id === action.courtId ? { ...c, players: [], isActive: false, startTime: undefined } : c
      );

      return {
        ...state,
        courts: updatedCourts,
        standbyPlayers: updatedStandbyPlayers,
      };
    }

    case "PLAYER_DROP": {
      if (action.courtId) {
        const targetCourt = state.courts.find((c) => c.id === action.courtId);
        if (targetCourt && !targetCourt.isActive) {
          if (targetCourt.players.length > 0 && targetCourt.players.length < 4) {
            const updatedCourts = state.courts.map((court) => {
              if (court.id === action.courtId) {
                return {
                  ...court,
                  players: [...court.players, { ...action.player, isPlaying: true, isQueuing: false }],
                  isActive: court.players.length + 1 === 4,
                };
              }
              if (court.players.some((p) => p.id === action.player.id)) {
                const remainingPlayers = court.players.filter((p) => p.id !== action.player.id);
                return {
                  ...court,
                  players: remainingPlayers,
                  isActive: remainingPlayers.length === 4,
                };
              }
              return court;
            });

            const updatedStandbyPlayers = state.standbyPlayers.filter((p) => p.id !== action.player.id);
            const updatedWaitingQueue = state.waitingQueue
              .map((group) => ({
                ...group,
                players: group.players.filter((p) => p.id !== action.player.id),
              }))
              .filter((group) => group.players.length > 0);

            return {
              ...state,
              courts: updatedCourts,
              waitingQueue: updatedWaitingQueue,
              standbyPlayers: updatedStandbyPlayers,
            };
          }
        }
      }

      // Create new group in waiting queue
      const newGroup: PlayerGroup = {
        id: uuidv4(),
        players: [{ ...action.player, isQueuing: true, isPlaying: false }],
        createdAt: new Date(),
      };

      const updatedCourts = state.courts.map((court) => {
        if (court.players.some((p) => p.id === action.player.id)) {
          const remainingPlayers = court.players.filter((p) => p.id !== action.player.id);
          return {
            ...court,
            players: remainingPlayers,
            isActive: remainingPlayers.length === 4,
          };
        }
        return court;
      });

      const updatedStandbyPlayers = state.standbyPlayers.filter((p) => p.id !== action.player.id);
      const updatedWaitingQueue = [
        ...state.waitingQueue
          .map((group) => ({
            ...group,
            players: group.players.filter((p) => p.id !== action.player.id),
          }))
          .filter((group) => group.players.length > 0),
        newGroup,
      ];

      return {
        ...state,
        courts: updatedCourts,
        waitingQueue: updatedWaitingQueue,
        standbyPlayers: updatedStandbyPlayers,
      };
    }

    case "PLAYER_DROP_TO_GROUP": {
      const targetGroup = state.waitingQueue.find((g) => g.id === action.groupId);
      if (!targetGroup || targetGroup.players.length >= 4) return state;

      const updatedCourts = state.courts.map((court) => {
        if (court.players.some((p) => p.id === action.player.id)) {
          const remainingPlayers = court.players.filter((p) => p.id !== action.player.id);
          return {
            ...court,
            players: remainingPlayers,
            isActive: remainingPlayers.length === 4,
          };
        }
        return court;
      });

      const updatedStandbyPlayers = state.standbyPlayers.filter((p) => p.id !== action.player.id);
      const updatedWaitingQueue = state.waitingQueue
        .map((group) => {
          if (group.id === action.groupId) {
            return {
              ...group,
              players: [...group.players, { ...action.player, isPlaying: false, isQueuing: true }],
            };
          }
          return {
            ...group,
            players: group.players.filter((p) => p.id !== action.player.id),
          };
        })
        .filter((group) => group.players.length > 0);

      return {
        ...state,
        courts: updatedCourts,
        waitingQueue: updatedWaitingQueue,
        standbyPlayers: updatedStandbyPlayers,
      };
    }

    case "QUEUE_REORDER": {
      const updatedQueue = [...state.waitingQueue];
      const [draggedGroup] = updatedQueue.splice(action.dragIndex, 1);
      updatedQueue.splice(action.hoverIndex, 0, draggedGroup);

      return {
        ...state,
        waitingQueue: updatedQueue,
      };
    }

    case "COURT_GROUP_MOVE": {
      const fromCourt = state.courts.find((c) => c.id === action.fromCourtId);
      const toCourt = state.courts.find((c) => c.id === action.toCourtId);

      if (!fromCourt || !toCourt || toCourt.isActive) return state;

      const updatedCourts = state.courts.map((court) => {
        if (court.id === action.fromCourtId) {
          return { ...court, players: [], isActive: false, startTime: undefined };
        }
        if (court.id === action.toCourtId) {
          return {
            ...court,
            players: fromCourt.players,
            isActive: true,
            startTime: new Date(),
          };
        }
        return court;
      });

      return {
        ...state,
        courts: updatedCourts,
      };
    }

    case "PLAYER_MOVE_TO_STANDBY": {
      const updatedWaitingQueue = state.waitingQueue
        .map((group) => ({
          ...group,
          players: group.players.filter((p) => p.id !== action.player.id),
        }))
        .filter((group) => group.players.length > 0);

      const updatedPlayer = { ...action.player, isQueuing: false, isPlaying: false };

      return {
        ...state,
        waitingQueue: updatedWaitingQueue,
        standbyPlayers: [...state.standbyPlayers, updatedPlayer],
      };
    }

    case "TOGGLE_AUTO_ASSIGN": {
      return {
        ...state,
        autoAssign: !state.autoAssign,
      };
    }

    case "GROUP_ASSIGN": {
      const group = state.waitingQueue.find((g) => g.id === action.groupId);
      if (!group) return state;

      const court = state.courts.find((c) => c.id === action.courtId);
      if (!court || court.isActive || court.players.length > 0) return state;

      const updatedCourts = state.courts.map((c) =>
        c.id === action.courtId
          ? {
              ...c,
              players: group.players.map((p) => ({ ...p, isPlaying: true, isQueuing: false })),
              isActive: group.players.length === 4,
              startTime: group.players.length === 4 ? new Date() : undefined,
            }
          : c
      );

      const updatedWaitingQueue = state.waitingQueue.filter((g) => g.id !== action.groupId);

      return {
        ...state,
        courts: updatedCourts,
        waitingQueue: updatedWaitingQueue,
      };
    }

    case "PLAYING_GROUP_TO_QUEUE": {
      const court = state.courts.find((c) => c.id === action.fromCourtId);
      if (!court) return state;

      const newGroup: PlayerGroup = {
        id: uuidv4(),
        players: action.players.map((player) => ({ ...player, isPlaying: false, isQueuing: true })),
        createdAt: new Date(),
      };

      const updatedCourts = state.courts.map((court) => {
        if (court.id === action.fromCourtId) {
          return { ...court, players: [], isActive: false, startTime: undefined };
        }
        return court;
      });

      return {
        ...state,
        courts: updatedCourts,
        waitingQueue: [...state.waitingQueue, newGroup],
      };
    }

    case "GROUP_DISSOLVE": {
      const updatedStandbyPlayers = [
        ...state.standbyPlayers,
        ...action.players.map((player) => ({ ...player, isPlaying: false, isQueuing: false })),
      ];

      const updatedCourts = state.courts.map((court) => {
        if (court.id === action.courtId) {
          return { ...court, players: [], isActive: false, startTime: undefined };
        }
        return court;
      });

      return {
        ...state,
        courts: updatedCourts,
        standbyPlayers: updatedStandbyPlayers,
      };
    }

    case "UPDATE_COURT_COUNT": {
      if (action.count > state.courts.length) {
        const newCourts = Array(action.count - state.courts.length)
          .fill(null)
          .map((_, index) => ({
            id: `court-${state.courts.length + index + 1}`,
            number: state.courts.length + index + 1,
            players: [],
            isActive: false,
          }));

        return {
          ...state,
          courts: [...state.courts, ...newCourts],
        };
      }

      if (action.count < state.courts.length) {
        const removedPlayers = state.courts
          .slice(action.count)
          .flatMap((court) => court.players)
          .map((player) => ({ ...player, isPlaying: false }));

        return {
          ...state,
          courts: state.courts.slice(0, action.count),
          standbyPlayers: [...state.standbyPlayers, ...removedPlayers],
        };
      }

      return state;
    }

    case "AUTO_ASSIGN": {
      return action.newState;
    }

    case "MOVE_TO_STANDBY": {
      const updatedStandbyPlayers = [
        ...state.standbyPlayers,
        ...action.players.map((p) => ({ ...p, isPlaying: false, isQueuing: false })),
      ];

      return {
        ...state,
        standbyPlayers: updatedStandbyPlayers,
      };
    }

    case "DISABLE_PLAYER": {
      // 從所有區域移除該球員
      const updatedCourts = state.courts.map(court => ({
        ...court,
        players: court.players.filter(p => p.id !== action.playerId),
        isActive: court.players.filter(p => p.id !== action.playerId).length === 4
      }));

      const updatedWaitingQueue = state.waitingQueue
        .map(group => ({
          ...group,
          players: group.players.filter(p => p.id !== action.playerId)
        }))
        .filter(group => group.players.length > 0);

      const updatedStandbyPlayers = state.standbyPlayers.filter(p => p.id !== action.playerId);

      return {
        ...state,
        courts: updatedCourts,
        waitingQueue: updatedWaitingQueue,
        standbyPlayers: updatedStandbyPlayers
      };
    }

    case "ENABLE_PLAYER": {
      // 將球員添加到待命區
      const updatedPlayer = {
        ...action.player,
        isPlaying: false,
        isQueuing: false
      };

      return {
        ...state,
        standbyPlayers: [...state.standbyPlayers, updatedPlayer]
      };
    }

    default:
      return state;
  }
};
