import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '../../helpers/constants';
import { getAuthHeader } from '../../helpers/getAuthHeader';
import { EventArraySchema, EventSchema, type Event } from '../../lib/schemas/event';
import { validateOrReject } from '../../helpers/validateApi';

type EventState = {
    data: Event[];
    entities: Record<string, Event>;
    loading: boolean;
    error: string | null;
}

const initialState: EventState = {
    data: [],
    entities: {},
    loading: false,
    error: null
}

export const fetchEvents = createAsyncThunk<Event[], void, { rejectValue: string }>('events/fetchEvents', async (_, thunkAPI) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/events`, {
            headers: getAuthHeader()
        });

        const payload = response.data?.data ?? response.data;
        return validateOrReject(EventArraySchema, payload, thunkAPI) as Event[];
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            return thunkAPI.rejectWithValue(error.response?.data ?? String(error));
        }
        return thunkAPI.rejectWithValue(String(error));
    }
})

export const fetchEventById = createAsyncThunk<Event, number, { rejectValue: string }>(
    'events/fetchEventById',
    async (id: number, thunkAPI) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/events/${id}`, {
                headers: getAuthHeader()
            });

            const payload = response.data?.data ?? response.data;
            return validateOrReject(EventSchema, payload, thunkAPI) as Event;
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                return thunkAPI.rejectWithValue(error.response?.data ?? String(error));
            }
            return thunkAPI.rejectWithValue(String(error));
        }
    }
)

export const updateEvent = createAsyncThunk<Event, { id: number; name: string }, { rejectValue: string }>(
    'events/updateEvent',
    async (payload, thunkAPI) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/events/${payload.id}`, {
                name: payload.name,
            }, { headers: { ...getAuthHeader(), 'Content-Type': 'application/json' } });

            return validateOrReject(EventSchema, response.data?.data ?? response.data, thunkAPI) as Event;
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                return thunkAPI.rejectWithValue(error.response?.data ?? String(error));
            }
            return thunkAPI.rejectWithValue(String(error));
        }
    }
);

export const createEvent = createAsyncThunk<Event, { name: string }, { rejectValue: string }>(
    'events/createEvent',
    async (payload, thunkAPI) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/events`, {
                name: payload.name,
            }, { headers: { ...getAuthHeader(), 'Content-Type': 'application/json' } });

            return validateOrReject(EventSchema, response.data?.data ?? response.data, thunkAPI) as Event;
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                return thunkAPI.rejectWithValue(error.response?.data ?? String(error));
            }
            return thunkAPI.rejectWithValue(String(error));
        }
    }
);

export const deleteEvent = createAsyncThunk<{ message?: string }, number, { rejectValue: string }>(
    'events/deleteEvent',
    async (id: number, thunkAPI) => {
        try {
            const response = await axios.delete(`${API_BASE_URL}/events/${id}`, { headers: getAuthHeader() });
            return response.data;
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                return thunkAPI.rejectWithValue(error.response?.data ?? String(error));
            }
            return thunkAPI.rejectWithValue(String(error));
        }
    }
);

const eventSlice = createSlice({
    name: 'events',
    initialState,
    reducers: {},
    extraReducers(builder) {
        builder
            .addCase(fetchEvents.pending, (state) => {
                state.loading = true;
                state.error = null;
            }
            )
            .addCase(fetchEvents.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchEvents.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? 'Failed to fetch events';
            })
            .addCase(fetchEventById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchEventById.fulfilled, (state, action) => {
                state.loading = false;
                state.entities[String(action.payload.id)] = action.payload;
            })
            .addCase(fetchEventById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? 'Failed to fetch event';
            })
            .addCase(updateEvent.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateEvent.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(createEvent.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createEvent.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(createEvent.rejected, (state, action) => {
                state.loading = false;
                const payload = action.payload as { message?: string } | string | undefined;
                state.error = (typeof payload === 'object' && payload?.message) || (typeof payload === 'string' ? payload : action.error.message) || 'Failed to create event';
            })
            .addCase(updateEvent.rejected, (state, action) => {
                state.loading = false;
                const payload = action.payload as { message?: string } | string | undefined;
                state.error = (typeof payload === 'object' && payload?.message) || (typeof payload === 'string' ? payload : action.error.message) || 'Failed to update event';
            })
            .addCase(deleteEvent.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteEvent.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(deleteEvent.rejected, (state, action) => {
                state.loading = false;
                const payload = action.payload as { message?: string } | string | undefined;
                state.error = (typeof payload === 'object' && payload?.message) || (typeof payload === 'string' ? payload : action.error.message) || 'Failed to delete event';
            })
    }
})

export default eventSlice.reducer;
