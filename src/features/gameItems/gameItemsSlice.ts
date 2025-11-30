import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '../../helpers/constants';
import { getAuthHeader } from '../../helpers/getAuthHeader';
import { handleThunkError } from '../../helpers/handleThunkError';
import { uploadAssetWithPresigned } from '../../helpers/uploadAsset';
import { GameItemArraySchema, GameItemSchema, type GameItem } from '../../lib/schemas/gameItem';
import { validateOrReject } from '../../helpers/validateApi';

type GameItemsType = GameItem;

type GameItemsTypeState = {
    data: GameItemsType[];
    loading: boolean;
    error: string | null;
}

const initialState: GameItemsTypeState = {
    data: [],
    loading: false,
    error: null
}

export const fetchGameItems = createAsyncThunk<GameItem[], void, { rejectValue: string }>(
    'gameItems/fetchGameItems',
    async (_, thunkAPI) => {
        try {
        const response = await axios.get(`${API_BASE_URL}/items`, {
            headers: getAuthHeader()
        });

        const payload = response.data?.data ?? response.data;

        return validateOrReject(GameItemArraySchema, payload, thunkAPI) as GameItem[];
        } catch (error: unknown) {
                return handleThunkError(error, thunkAPI);
        }
    }
)

export const createGameItem = createAsyncThunk<GameItemsType, {
    name: string;
    description?: string;
    tier?: number;
    assetFile?: File | Blob;
    assetId?: number;
    element_id?: number;
    game_items_type_id?: number;
}, { rejectValue: string }
>(
    'gameItems/createGameItem',
    async (
        payload,
        thunkAPI
    ) => {
        try {
            let asset_id = payload.assetId;
            if (payload.assetFile && !asset_id) {
                // For game items, only image uploads are accepted
                // Read content type from the provided file/blob (avoid instanceof File checks)
                const assetFile = payload.assetFile;
                const contentType = assetFile?.type;
                if (!contentType || !contentType.startsWith('image/')) {
                    return thunkAPI.rejectWithValue('Only image files are allowed for game items');
                }
                const uploaded = await uploadAssetWithPresigned(assetFile, undefined, contentType, 1);
                asset_id = uploaded.id;
            }

            const body = {
                name: payload.name,
                description: payload.description,
                tier: payload.tier,
                asset_id,
                element_id: payload.element_id,
                game_items_type_id: payload.game_items_type_id,
            };

            const resp = await axios.post(`${API_BASE_URL}/items`, body, { headers: { ...getAuthHeader(), 'Content-Type': 'application/json' } });
            const respPayload = resp.data?.data ?? resp.data;
            return validateOrReject(GameItemSchema, respPayload, thunkAPI) as GameItem;
        } catch (error: unknown) {
            return handleThunkError(error, thunkAPI);
        }
    }
);

export const updateGameItem = createAsyncThunk<GameItemsType, {
    id: number;
    name?: string;
    description?: string;
    tier?: number;
    assetFile?: File | Blob;
    assetId?: number;
    element_id?: number;
    game_items_type_id?: number;
}, { rejectValue: string }
>(
    'gameItems/updateGameItem',
    async (
        payload,
        thunkAPI
    ) => {
        try {
            let asset_id = payload.assetId;
            if (payload.assetFile && !asset_id) {
                // For game items, only image uploads are accepted
                // Read content type from the provided file/blob (avoid instanceof File checks)
                const contentType = payload.assetFile?.type;
                if (!contentType || !contentType.startsWith('image/')) {
                    return thunkAPI.rejectWithValue('Only image files are allowed for game items');
                }
                const uploaded = await uploadAssetWithPresigned(payload.assetFile, undefined, contentType, 1);
                asset_id = uploaded.id;
            }

            const body = {
                name: payload.name,
                description: payload.description,
                tier: payload.tier,
                asset_id,
                element_id: payload.element_id,
                game_items_type_id: payload.game_items_type_id,
            };

            const resp = await axios.put(`${API_BASE_URL}/items/${payload.id}`, body, { headers: { ...getAuthHeader(), 'Content-Type': 'application/json' } });
            const respPayload = resp.data?.data ?? resp.data;
            return validateOrReject(GameItemSchema, respPayload, thunkAPI) as GameItem;
        } catch (error: unknown) {
            return handleThunkError(error, thunkAPI);
        }
    }
);

export const deleteGameItem = createAsyncThunk<{ id: number }, number, { rejectValue: string }>(
    'gameItems/deleteGameItem',
    async (id: number, thunkAPI) => {
        try {
            await axios.delete(`${API_BASE_URL}/items/${id}`, { headers: getAuthHeader() });
            return { id };
        } catch (error: unknown) {
            return handleThunkError(error, thunkAPI);
        }
    }
);

const gameItemsSlice = createSlice({
    name: 'gameItems',
    initialState,
    reducers: {},
    extraReducers(builder) {
        builder
            .addCase(fetchGameItems.pending, (state) => {
                state.loading = true;
                state.error = null;
            }
            )
            .addCase(fetchGameItems.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchGameItems.rejected, (state, action) => {
                state.loading = false;
                // prefer the payload returned via rejectWithValue for meaningful errors
                state.error = (action.payload as string) ?? action.error.message ?? 'Failed to fetch game items';
            })
            // create / update / delete handlers to keep state in sync
            .addCase(createGameItem.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createGameItem.fulfilled, (state, action) => {
                state.loading = false;
                // append created item
                const created = action.payload;
                if (created) state.data.push(created);
            })
            .addCase(createGameItem.rejected, (state, action) => {
                state.loading = false;
                state.error = (action.payload as string) ?? action.error.message ?? 'Failed to create game item';
            })
            .addCase(updateGameItem.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateGameItem.fulfilled, (state, action) => {
                state.loading = false;
                const updated = action.payload;
                if (updated) {
                    const idx = state.data.findIndex((it) => it.id === updated.id);
                    if (idx >= 0) state.data[idx] = updated;
                    else state.data.push(updated);
                }
            })
            .addCase(updateGameItem.rejected, (state, action) => {
                state.loading = false;
                state.error = (action.payload as string) ?? action.error.message ?? 'Failed to update game item';
            })
            .addCase(deleteGameItem.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteGameItem.fulfilled, (state, action) => {
                state.loading = false;
                const payload = action.payload;
                const id = payload?.id;
                if (typeof id === 'number') {
                    state.data = state.data.filter((it) => it.id !== id);
                }
            })
            .addCase(deleteGameItem.rejected, (state, action) => {
                state.loading = false;
                state.error = (action.payload as string) ?? action.error.message ?? 'Failed to delete game item';
            })
    }
})

export default gameItemsSlice.reducer;