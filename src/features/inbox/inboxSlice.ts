import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '../../helpers/constants';
import { getAuthHeader } from '../../helpers/getAuthHeader';
import { handleThunkError } from '../../helpers/handleThunkError';
import type { SendMailPayload } from '../../lib/schemas/inbox';

type InboxState = {
    sending: boolean;
    error: string | null;
    lastSentAt: string | null;
};

const initialState: InboxState = {
    sending: false,
    error: null,
    lastSentAt: null,
};

export const sendAdminMail = createAsyncThunk<
    { message: string },
    SendMailPayload,
    { rejectValue: string }
>(
    'inbox/sendAdminMail',
    async (payload, thunkAPI) => {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/inbox/send`,
                payload,
                { headers: getAuthHeader() },
            );
            return response.data;
        } catch (error) {
            return handleThunkError(error, thunkAPI);
        }
    },
);

const inboxSlice = createSlice({
    name: 'inbox',
    initialState,
    reducers: {
        resetInboxState(state) {
            state.sending = false;
            state.error = null;
        },
    },
    extraReducers(builder) {
        builder
            .addCase(sendAdminMail.pending, (state) => {
                state.sending = true;
                state.error = null;
            })
            .addCase(sendAdminMail.fulfilled, (state) => {
                state.sending = false;
                state.lastSentAt = new Date().toISOString();
            })
            .addCase(sendAdminMail.rejected, (state, action) => {
                state.sending = false;
                state.error = action.payload ?? action.error.message ?? 'Failed to send mail';
            });
    },
});

export const { resetInboxState } = inboxSlice.actions;
export default inboxSlice.reducer;