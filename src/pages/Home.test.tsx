import React from 'react';
import { render, screen } from '@testing-library/react';
import { Home } from './Home';
import { useNavigate } from 'react-router-dom';
import { useMenuItems } from '../hooks/useMenuItems';

// Mock dependencies
jest.mock('react-router-dom', () => ({
    useNavigate: jest.fn(),
}));

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

jest.mock('../hooks/useMenuItems');

describe('Home', () => {
    const mockNavigate = jest.fn();
    const mockMenuItems = [
        {
            title: 'Test Title 1',
            path: '/test1',
            description: 'Test Description 1'
        },
        {
            title: 'Test Title 2',
            path: '/test2',
            description: 'Test Description 2'
        }
    ];

    beforeEach(() => {
        (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
        (useMenuItems as jest.Mock).mockReturnValue(mockMenuItems);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders welcome messages', () => {
        render(<Home />);

        expect(screen.getByTestId('welcome-title')).toHaveTextContent('home.welcome');
        expect(screen.getByTestId('welcome-description')).toHaveTextContent('home.description');
    });

    it('renders all menu cards', () => {
        render(<Home />);

        mockMenuItems.forEach(item => {
            expect(screen.getByText(item.title)).toBeInTheDocument();
            expect(screen.getByText(item.description)).toBeInTheDocument();
        });
    });

    it('renders the correct number of menu cards', () => {
        render(<Home />);

        const menuCards = screen.getAllByTestId(/^menu-card-/);
        expect(menuCards).toHaveLength(mockMenuItems.length);
    });
}); 