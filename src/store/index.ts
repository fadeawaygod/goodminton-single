import { configureStore } from '@reduxjs/toolkit';
import playerReducer from './playerSlice';

export const store = configureStore({
    reducer: {
        players: playerReducer,
    },
    middleware: (getDefaultMiddleware: any) =>
        getDefaultMiddleware({
            serializableCheck: false // 完全禁用序列化檢查
        })
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// 自動保存到 localStorage
store.subscribe(() => {
    const state = store.getState();
    if (state.players.lastSaved > (window as any).lastSaved || !(window as any).lastSaved) {
        localStorage.setItem('goodminton_players', JSON.stringify(state.players.players));
        (window as any).lastSaved = state.players.lastSaved;
    }
});

export default store; 