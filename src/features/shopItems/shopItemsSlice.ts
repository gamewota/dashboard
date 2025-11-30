import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '../../helpers/constants';
import { ShopItemArraySchema, ShopItemSchema, type ShopItem } from '../../lib/schemas/shopItem';
import { validateOrReject } from '../../helpers/validateApi';

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

export const fetchShopItems = createAsyncThunk<ShopItem[], void, { rejectValue: string }>(
  'shopItems/fetchShopItems',
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/shop/items`);
      const payload = response.data?.data ?? response.data;
      return validateOrReject(ShopItemArraySchema, payload, thunkAPI) as ShopItem[];
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return thunkAPI.rejectWithValue(error.response?.data?.message ?? String(error));
      }
      return thunkAPI.rejectWithValue(String(error));
    }
  }
)

export const addShopItem = createAsyncThunk<
  ShopItem,
  Omit<ShopItem, 'id' | 'deleted_at' | 'isVisible'>,
  { rejectValue: string }
>(
  'shopItems/addShopItem',
  async (newItem, thunkAPI) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/shop/item/add`, newItem);
      return validateOrReject(ShopItemSchema, response.data?.data ?? response.data, thunkAPI) as ShopItem;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to add shop item');
      }
      return thunkAPI.rejectWithValue(String(error ?? 'Failed to add shop item'));
    }
  }
)

type UpdateResult<T> = { updatedFields: T; message?: string };

export const updateShopItem = createAsyncThunk<
  UpdateResult<Partial<Omit<ShopItem, 'deleted_at'>>>,
  { updatedData: Partial<Omit<ShopItem, 'deleted_at'>> },
  { rejectValue: string }
>(
  'shopItems/updateShopItem',
  async (
    { updatedData },
    thunkAPI
  ) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/shop/item/update`, updatedData);
      return { updatedFields: updatedData, message: response.data?.message };
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to update shop item');
      }
      return thunkAPI.rejectWithValue(String(error ?? 'Failed to update shop item'));
    }
  }
);

export const updateShopVisibility = createAsyncThunk<
  UpdateResult<Partial<Omit<ShopItem, 'name' | 'type' | 'price' | 'currency' | 'description' | 'stock' | 'deleted_at'>>>,
  { updatedData: Partial<Omit<ShopItem, 'name' | 'type' | 'price' | 'currency' | 'description' | 'stock' | 'deleted_at'>> },
  { rejectValue: string }
>(
  'shopItems/updateShopVisibility',
  async (
    { updatedData },
    thunkAPI
  ) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/shop/item/update/visibility`, updatedData);
      return { updatedFields: updatedData, message: response.data?.message };
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to update shop item');
      }
      return thunkAPI.rejectWithValue(String(error ?? 'Failed to update shop item'));
    }
  }
);


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
                state.error = (action.payload as string) ?? action.error.message ?? 'Failed to fetch shop items';
            })
              
    }
})


export default shopItemSlice.reducer;