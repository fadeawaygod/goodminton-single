import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SettingsState {
    language: string;
    theme: 'light' | 'dark';
}

const initialState: SettingsState = {
    language: 'zh-TW',
    theme: 'light',
};

const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        setLanguage: (state, action: PayloadAction<string>) => {
            state.language = action.payload;
        },
        setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
            state.theme = action.payload;
        },
    },
});

export const { setLanguage, setTheme } = settingsSlice.actions;
export default settingsSlice.reducer; 