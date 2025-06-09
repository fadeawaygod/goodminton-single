export interface Court {
    id: string;
    name: string;
    isAvailable: boolean;
}

export interface Match {
    id: string;
    courtId: string;
    players: string[];
    startTime: string;
    endTime: string;
    status: 'pending' | 'ongoing' | 'completed';
}

export interface TimeSlot {
    id: string;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
} 