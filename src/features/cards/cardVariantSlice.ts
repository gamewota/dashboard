import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import { API_BASE_URL } from '../../helpers/constants'
import { getAuthHeader } from '../../helpers/getAuthHeader'
import { CardVariantArraySchema, type CardVariant } from '../../lib/schemas/cardVariant'
import { validateOrReject } from '../../helpers/validateApi'
import type { RootState } from '../../store'

type CardVariantState = {
    data: CardVariant[]
    loading: boolean
    error: string | null
}

const initialState: CardVariantState = {
    data: [],
    loading: false,
    error: null
}

export const fetchCardVariants = createAsyncThunk<CardVariant[], void, { rejectValue: string }>('cardVariants/fetchCardVariants', async (_, thunkAPI) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/cards/variant`, {
            headers: getAuthHeader()
        })
        const payload = response.data?.data ?? response.data
        return validateOrReject(CardVariantArraySchema, payload, thunkAPI) as CardVariant[]
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            const data = error.response?.data
            let message: string
            if (typeof data === 'string') {
                message = data
            } else if (data && typeof data === 'object' && 'message' in data) {
                message = String((data as { message: unknown }).message)
            } else if (data !== undefined) {
                message = JSON.stringify(data)
            } else {
                message = String(error)
            }
            return thunkAPI.rejectWithValue(message)
        }
        return thunkAPI.rejectWithValue(String(error))
    }
})

const cardVariantSlice = createSlice({
    name: 'cardVariants',
    initialState,
    reducers: {},
    extraReducers(builder) {
        builder
            .addCase(fetchCardVariants.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchCardVariants.fulfilled, (state, action) => {
                state.loading = false
                state.data = action.payload
            })
            .addCase(fetchCardVariants.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload ?? action.error.message ?? 'Failed to fetch card variants'
            })
    }
})

export const selectCardVariants = (state: RootState) => state.cardVariants.data
export const selectCardVariantsLoading = (state: RootState) => state.cardVariants.loading
export const selectCardVariantsError = (state: RootState) => state.cardVariants.error

export default cardVariantSlice.reducer


