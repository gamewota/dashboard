import { configureStore } from '@reduxjs/toolkit';
import usersReducer from '../features/users/userSlice';
import songsReducer from '../features/songs/songSlice';


export const store = configureStore({
    reducer: {
        users: usersReducer,
        songs: songsReducer
    }
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;