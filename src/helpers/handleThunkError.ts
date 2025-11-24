import axios from 'axios';

// Helper to normalize axios/unknown errors inside async thunks
export function handleThunkError<T = unknown>(error: unknown, thunkAPI: { rejectWithValue: (v: string) => T }): T {
  if (axios.isAxiosError(error)) {
    const respData = error.response?.data;
    const payload = typeof respData === 'string'
      ? respData
      : (respData && typeof respData === 'object')
        ? (respData.message ?? JSON.stringify(respData))
        : String(error);

    return thunkAPI.rejectWithValue(payload);
  }

  return thunkAPI.rejectWithValue(String(error));
}
