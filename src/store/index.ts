import { configureStore } from '@reduxjs/toolkit';
import usersReducer from '../features/users/userSlice';
import songsReducer from '../features/songs/songSlice';
import quotesReducer from '../features/quotes/quoteSlice';
import shopItemsReducer from '../features/shopItems/shopItemsSlice'


export const store = configureStore({
    reducer: {
        users: usersReducer,
        songs: songsReducer,
        quotes: quotesReducer,
        shopItems: shopItemsReducer
    }
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;