import { configureStore } from '@reduxjs/toolkit';
import usersReducer from '../features/users/userSlice';
import songsReducer from '../features/songs/songSlice';
import quotesReducer from '../features/quotes/quoteSlice';
import shopItemsReducer from '../features/shopItems/shopItemsSlice';
import cardsReducer from '../features/cards/cardSlice';


export const store = configureStore({
    reducer: {
        users: usersReducer,
        songs: songsReducer,
        quotes: quotesReducer,
        shopItems: shopItemsReducer,
        cards: cardsReducer
    }
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;