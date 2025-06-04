import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';


type ShopItem = {
    id: number;
    name: string;
    type: string;
    price: number;
    currency: string;
    description: string;
    stock: number;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

type ShopItemState = {
    data: ShopItem[];
    loading: boolean;
    error: string | null;
}

const initialState: ShopItemState = {
    data: [],
    loading: false,
    error: null
}

export const fetchShopItems = createAsyncThunk('shopItems/fetchShopItems', async () => {
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/shop/items`);
    return response.data.data;
})

export const addShopItem = createAsyncThunk('shopItems/addShopItem', async (newItem: Omit<ShopItem, 'id' | 'deleted_at'>, { rejectWithValue} ) => {
    try {
        const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/shop/item/add`, newItem);
        return response.data;
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || 'Failed to add shop item')
    }
})

const shopItemSlice = createSlice({
    name: 'shopItems',
    initialState,
    reducers: {},
    extraReducers(builder) {
        builder
            .addCase(fetchShopItems.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchShopItems.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchShopItems.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch shop items';
            })
    }
})


export default shopItemSlice.reducer;