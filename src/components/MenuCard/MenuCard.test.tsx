import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { MenuCard } from './index';

describe('MenuCard', () => {
    const mockItem = {
        title: 'Test Title',
        path: '/test',
        description: 'Test Description'
    };

    const mockNavigate = jest.fn();
    const mockButtonText = 'Test Button';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders correctly with all props', () => {
        render(
            <MenuCard
                item={mockItem}
                onNavigate={mockNavigate}
                buttonText={mockButtonText}
            />
        );

        expect(screen.getByText(mockItem.title)).toBeInTheDocument();
        expect(screen.getByText(mockItem.description)).toBeInTheDocument();
        expect(screen.getByText(mockButtonText)).toBeInTheDocument();
    });

    it('calls onNavigate when clicking the card', () => {
        render(
            <MenuCard
                item={mockItem}
                onNavigate={mockNavigate}
                buttonText={mockButtonText}
            />
        );

        fireEvent.click(screen.getByTestId(`menu-card-${mockItem.path}`));
        expect(mockNavigate).toHaveBeenCalledWith(mockItem.path);
    });

    it('calls onNavigate when clicking the button', () => {
        render(
            <MenuCard
                item={mockItem}
                onNavigate={mockNavigate}
                buttonText={mockButtonText}
            />
        );

        fireEvent.click(screen.getByTestId(`menu-button-${mockItem.path}`));
        expect(mockNavigate).toHaveBeenCalledWith(mockItem.path);
    });
}); 