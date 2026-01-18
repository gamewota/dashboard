import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '../../helpers/constants';
import { getAuthHeader } from '../../helpers/getAuthHeader';

export type AddGachaPackCardPayload = {
  gachaPackId: number;
  cardId: number | number[];
  weight?: number;
}

export const addGachaPackCard = createAsyncThunk('gachaPackCards/addGachaPackCard', async (payload: AddGachaPackCardPayload) => {
  const response = await axios.post(`${API_BASE_URL}/gacha/add-gacha-pack-card`, payload, { headers: { ...getAuthHeader(), 'Content-Type': 'application/json' } });
  return response.data;
});
