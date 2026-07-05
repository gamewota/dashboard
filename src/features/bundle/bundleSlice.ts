import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '../../helpers/constants';
import { getAuthHeader } from '../../helpers/getAuthHeader';
import { handleThunkError } from '../../helpers/handleThunkError';
import { validateOrReject } from '../../helpers/validateApi';
import {
    BundleStatusSchema,
    BundleTriggerResponseSchema,
    type BundleStatus,
    type BundleTriggerResponse,
} from '../../lib/schemas/bundle';

type BundleState = {
    status: BundleStatus | null;
    loading: boolean;
    triggering: boolean;
    error: string | null;
    lastTriggeredAt: string | null;
};

const initialState: BundleState = {
    status: null,
    loading: false,
    triggering: false,
    error: null,
    lastTriggeredAt: null,
};

export const fetchBundleStatus = createAsyncThunk<
    BundleStatus,
    void,
    { rejectValue: string }
>(
    'bundle/fetchStatus',
    async (_, thunkAPI) => {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/bundle/status`,
                { headers: getAuthHeader() },
            );
            return validateOrReject(BundleStatusSchema, response.data, thunkAPI) as BundleStatus;
        } catch (error) {
            return handleThunkError(error, thunkAPI);
        }
    },
);

export const triggerBundleBuild = createAsyncThunk<
    BundleTriggerResponse,
    void,
    { rejectValue: string }
>(
    'bundle/trigger',
    async (_, thunkAPI) => {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/bundle/trigger`,
                {},
                { headers: getAuthHeader() },
            );
            return validateOrReject(BundleTriggerResponseSchema, response.data, thunkAPI) as BundleTriggerResponse;
        } catch (error) {
            return handleThunkError(error, thunkAPI);
        }
    },
);

const bundleSlice = createSlice({
    name: 'bundle',
    initialState,
    reducers: {
        resetBundleError(state) {
            state.error = null;
        },
    },
    extraReducers(builder) {
        builder
            .addCase(fetchBundleStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBundleStatus.fulfilled, (state, action) => {
                state.loading = false;
                state.status = action.payload;
            })
            .addCase(fetchBundleStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? action.error.message ?? 'Failed to load bundle status';
            })
            .addCase(triggerBundleBuild.pending, (state) => {
                state.triggering = true;
                state.error = null;
            })
            .addCase(triggerBundleBuild.fulfilled, (state) => {
                state.triggering = false;
                state.lastTriggeredAt = new Date().toISOString();
            })
            .addCase(triggerBundleBuild.rejected, (state, action) => {
                state.triggering = false;
                state.error = action.payload ?? action.error.message ?? 'Failed to trigger bundle build';
            });
    },
});

export const { resetBundleError } = bundleSlice.actions;
export default bundleSlice.reducer;
