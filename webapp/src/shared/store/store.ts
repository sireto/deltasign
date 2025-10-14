import { combineReducers, configureStore } from '@reduxjs/toolkit';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web
import { persistReducer, persistStore } from 'redux-persist';
import { apiSlice } from './demo';
import { authAPI } from '@/shared/store/api/user-auth';
import userReducer from './slice/user-slice';
import { documentsAPI } from '@/app/documents/api/documents';
import { contractsAPI } from '@/app/documents/api/contracts';

const rootReducer = combineReducers({
  [apiSlice.reducerPath]: apiSlice.reducer,
  [authAPI.reducerPath]: authAPI.reducer,
  [documentsAPI.reducerPath]: documentsAPI.reducer,
  [contractsAPI.reducerPath]: contractsAPI.reducer,
  user: userReducer,
});

const persistConfig = {
  key: 'root', // key for localStorage
  storage,
  whitelist: ['user'], // only persist this slice
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    })
      .concat(apiSlice.middleware)
      .concat(authAPI.middleware)
      .concat(documentsAPI.middleware)
      .concat(contractsAPI.middleware),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
