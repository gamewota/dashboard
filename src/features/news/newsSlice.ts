import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '../../helpers/constants';
import { getAuthHeader } from '../../helpers/getAuthHeader';
import { handleThunkError } from '../../helpers/handleThunkError';

type FetchAllResp = NewsArticle[] | { success: boolean; data: NewsArticle[] };
type FetchByIdResp = NewsArticle | { success: boolean; data: NewsArticle };

const isWrappedArray = (p: unknown): p is { success: boolean; data: NewsArticle[] } => {
    return (
        p != null &&
        typeof p === 'object' &&
        'data' in (p as Record<string, unknown>) &&
        Array.isArray((p as Record<string, unknown>).data)
    );
};

const isWrappedItem = (p: unknown): p is { success: boolean; data: NewsArticle } => {
    return (
        p != null &&
        typeof p === 'object' &&
        'data' in (p as Record<string, unknown>) &&
        !Array.isArray((p as Record<string, unknown>).data)
    );
};

export const fetchNews = createAsyncThunk<FetchAllResp, void, { rejectValue: string }>(
    'news/fetchNews',
    async (_: void, thunkAPI) => {
        try {
            const resp = await axios.get(`${API_BASE_URL}/news`, { headers: getAuthHeader() });
            return resp.data;
        } catch (err: unknown) {
            return handleThunkError(err, thunkAPI);
        }
    }
);

export const fetchNewsById = createAsyncThunk<FetchByIdResp, number, { rejectValue: string }>(
    'news/fetchNewsById',
    async (id: number, thunkAPI) => {
        try {
            const resp = await axios.get(`${API_BASE_URL}/news/${id}`, { headers: getAuthHeader() });
            return resp.data;
        } catch (err: unknown) {
            return handleThunkError(err, thunkAPI);
        }
    }
);


export interface NewsArticle {
    id: number;
    title: string;
    content: string;
    summary?: string;
    author?: string;
    imageUrl?: string;
    header_image?: string;
    news_type?: string;
    created_at?: string;
    updated_at?: string;
    category?: string;
    tags?: string[];
}

export interface NewsState {
    entities: Record<string, NewsArticle>;
    ids: string[];
    isLoading: boolean;
    error?: string;
    currentArticle?: string;
}

const initialState: NewsState = {
    entities: {},
    ids: [],
    isLoading: false,
};

const newsSlice = createSlice({
    name: 'news',
    initialState,
    reducers: {
        upsertArticle(state, action: PayloadAction<NewsArticle>) {
            const { id } = action.payload;
            const idStr = String(id);
            state.entities[idStr] = action.payload;
            if (!state.ids.includes(idStr)) {
                state.ids.push(idStr);
            }
        },
        setCurrentArticle(state, action: PayloadAction<string | undefined>) {
            state.currentArticle = action.payload;
        },
        clearError(state) {
            state.error = undefined;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch all news
            .addCase(fetchNews.pending, (state) => {
                state.isLoading = true;
                state.error = undefined;
            })
            .addCase(fetchNews.fulfilled, (state, action: PayloadAction<FetchAllResp>) => {
                state.isLoading = false;
                // backend may return { success: true, data: [...] } or plain array
                const payload = action.payload;
                let list: NewsArticle[];
                if (Array.isArray(payload)) {
                    list = payload;
                } else if (isWrappedArray(payload)) {
                    list = payload.data;
                } else {
                    list = [];
                }
                list.forEach((article) => {
                    const id = String(article.id);
                    state.entities[id] = article;
                    if (!state.ids.includes(id)) {
                        state.ids.push(id);
                    }
                });
            })
            .addCase(fetchNews.rejected, (state, action) => {
                state.isLoading = false;
                state.error = (action.payload as string) ?? action.error.message;
            })
            // Fetch single article
            .addCase(fetchNewsById.pending, (state) => {
                state.isLoading = true;
                state.error = undefined;
            })
            .addCase(fetchNewsById.fulfilled, (state, action: PayloadAction<FetchByIdResp>) => {
                state.isLoading = false;
                // backend may return { success: true, data: {...} } or the article directly
                const payload = action.payload;
                let article: NewsArticle;
                if (isWrappedItem(payload)) {
                    article = payload.data;
                } else {
                    article = payload as NewsArticle;
                }
                const id = String(article.id);
                state.entities[id] = article;
                if (!state.ids.includes(id)) {
                    state.ids.push(id);
                }
                state.currentArticle = id;
            })
            .addCase(fetchNewsById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = (action.payload as string) ?? action.error.message;
            });
    },
});

export const { upsertArticle, setCurrentArticle, clearError } = newsSlice.actions;
export default newsSlice.reducer;