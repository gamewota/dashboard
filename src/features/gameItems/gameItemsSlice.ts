import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '../../helpers/constants';
import { getAuthHeader } from '../../helpers/getAuthHeader';
import { handleThunkError } from '../../helpers/handleThunkError';
import { uploadAssetWithPresigned } from '../../helpers/uploadAsset';

type GameItemsType = {
    id: number;
    name: string;
    description: string;
    tier: number;
    asset_id: number;
    element_id: number;
    game_items_type_id: number;
    created_at: string;
    updated_at: string;
}

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

export const fetchGameItems = createAsyncThunk<GameItemsType[], void, { rejectValue: string }>(
    'gameItems/fetchGameItems',
    async (_, thunkAPI) => {
        try {
                const response = await axios.get(`${API_BASE_URL}/items`, {
                        headers: getAuthHeader()
                });

                return response.data;
        } catch (error: unknown) {
                return handleThunkError(error, thunkAPI);
        }
    }
)

export const createGameItem = createAsyncThunk(
    'gameItems/createGameItem',
    async (
        payload: {
            name: string;
            description?: string;
            tier?: number;
            assetFile?: File | Blob;
            assetId?: number;
            element_id?: number;
            game_items_type_id?: number;
        },
        thunkAPI
    ) => {
        try {
            let asset_id = payload.assetId;

                        if (payload.assetFile && !asset_id) {
                                // For game items, only image uploads are accepted
                                        // Read content type from the provided file/blob (avoid instanceof File checks)
                                        const assetFile = payload.assetFile as Blob | undefined;
                                        const contentType = assetFile?.type;
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

            const resp = await axios.post(`${API_BASE_URL}/items`, body, { headers: { ...getAuthHeader(), 'Content-Type': 'application/json' } });
            return resp.data;
        } catch (error: unknown) {
            return handleThunkError(error, thunkAPI);
        }
    }
);

export const updateGameItem = createAsyncThunk(
    'gameItems/updateGameItem',
    async (
        payload: {
            id: number;
            name?: string;
            description?: string;
            tier?: number;
            assetFile?: File | Blob;
            assetId?: number;
            element_id?: number;
            game_items_type_id?: number;
        },
        thunkAPI
    ) => {
        try {
            let asset_id = payload.assetId;
                        if (payload.assetFile && !asset_id) {
                                // For game items, only image uploads are accepted
                                        // Read content type from the provided file/blob (avoid instanceof File checks)
                                        const assetFile = payload.assetFile as Blob | undefined;
                                        const contentType = assetFile?.type;
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
            return resp.data;
        } catch (error: unknown) {
            return handleThunkError(error, thunkAPI);
        }
    }
);

export const deleteGameItem = createAsyncThunk(
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
    }
})

export default gameItemsSlice.reducer;