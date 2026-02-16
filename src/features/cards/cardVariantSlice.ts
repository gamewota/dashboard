import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import { API_BASE_URL } from '../../helpers/constants'
import type { RootState } from '../../store'

type CardVariant = {
    id: number
    variant_name: string
    variant_value: string
}

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

export const fetchCardVariants = createAsyncThunk('cardVariants/fetchCardVariants', async () => {
    const response = await axios.get(`${API_BASE_URL}/cards/variant`)
    return response.data
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
                state.error = action.error.message || 'Failed to fetch card variants'
            })
    }
})

export const selectCardVariants = (state: RootState) => state.cardVariants.data
export const selectCardVariantsLoading = (state: RootState) => state.cardVariants.loading
export const selectCardVariantsError = (state: RootState) => state.cardVariants.error

export default cardVariantSlice.reducer


