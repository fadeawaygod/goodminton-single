import { configureStore } from '@reduxjs/toolkit';
import settingsReducer from './slices/settingsSlice';
import courtSystemReducer from './slices/courtSystemSlice';

export const store = configureStore({
    reducer: {
        settings: settingsReducer,
        courtSystem: courtSystemReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 