import React from 'react';
import { CourtType } from '../types/court';

interface CourtProps {
    court: CourtType;
    onFinishGame?: (courtId: string) => void;
}

const Court: React.FC<CourtProps> = ({ court, onFinishGame }) => {
    const handleFinishGame = () => {
        onFinishGame?.(court.id);
    };

    return (
        <div className="border p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">Court {court.number}</h3>
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <span>Status: {court.isActive ? 'Active' : 'Available'}</span>
                    {court.isActive && (
                        <button
                            onClick={handleFinishGame}
                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Finish Game
                        </button>
                    )}
                </div>
                <div>
                    <h4 className="font-medium mb-1">Players:</h4>
                    <ul className="list-disc list-inside">
                        {court.players.map((player) => (
                            <li key={player.id}>{player.name}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Court; 