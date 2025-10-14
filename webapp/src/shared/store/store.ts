import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { apiSlice } from './demo';
import { authAPI } from '@/shared/store/api/user-auth';
import userReducer from './slice/user-slice';

const rootReducer = combineReducers({
  [apiSlice.reducerPath]: apiSlice.reducer,
  [authAPI.reducerPath]: authAPI.reducer,
  user : userReducer
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false })
      .concat(apiSlice.middleware)
      .concat(authAPI.middleware)
});

// (Optional) Infer types for TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
