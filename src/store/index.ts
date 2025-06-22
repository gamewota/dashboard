import { configureStore } from '@reduxjs/toolkit';
import usersReducer from '../features/users/userSlice';
import songsReducer from '../features/songs/songSlice';
import quotesReducer from '../features/quotes/quoteSlice';
import shopItemsReducer from '../features/shopItems/shopItemsSlice';
import cardsReducer from '../features/cards/cardSlice';
import shopTransactionsReducer from '../features/shopTransactions/shopTransactionsSlice'
import transactionLogReducer from '../features/transactionLog/transactionLogSlice'
import authReducer from '../features/auth/authSlice'


export const store = configureStore({
    reducer: {
        users: usersReducer,
        songs: songsReducer,
        quotes: quotesReducer,
        shopItems: shopItemsReducer,
        cards: cardsReducer,
        shopTransactions: shopTransactionsReducer,
        transactionsLog: transactionLogReducer,
        auth: authReducer
    }
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;