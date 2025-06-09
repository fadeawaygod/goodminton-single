import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CourtSystemState {
    courtCount: number;
    maxCourts: number;
    autoAssign: boolean;
}

const initialState: CourtSystemState = {
    courtCount: 4,
    maxCourts: 12,
    autoAssign: true,
};

const courtSystemSlice = createSlice({
    name: 'courtSystem',
    initialState,
    reducers: {
        setCourtCount: (state, action: PayloadAction<number>) => {
            state.courtCount = Math.min(Math.max(1, action.payload), state.maxCourts);
        },
        setAutoAssign: (state, action: PayloadAction<boolean>) => {
            state.autoAssign = action.payload;
        },
    },
});

export const { setCourtCount, setAutoAssign } = courtSystemSlice.actions;
export default courtSystemSlice.reducer; 