import React from 'react';
import { Chip } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import { DragPreviewProps } from '../types/court';

export const DragPreview: React.FC<DragPreviewProps> = ({ item, style }) => {
    if (!item) return null;

    return (
        <div style={{
            ...style,
            opacity: 0.8,
            backgroundColor: '#fff',
            padding: '4px',
            borderRadius: '16px'
        }}>
            <Chip
                label={item.name}
                icon={<PersonIcon />}
                size="small"
            />
        </div>
    );
}; 