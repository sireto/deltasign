import { Action, combineReducers, configureStore } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web
import { persistReducer, persistStore } from "redux-persist";
import { apiSlice } from "./demo";
import { authAPI } from "@/shared/store/api/user-auth";
import userReducer from "./slice/user-slice";
import { documentsAPI } from "@/app/documents/api/documents";
import { contractsAPI } from "@/app/documents/api/contracts";
import { RESET_STATE_ACTION_TYPE } from "./actions/resetState";
import { setupListeners } from "@reduxjs/toolkit/query";

const middlewares = [
  apiSlice.middleware,
  authAPI.middleware,
  documentsAPI.middleware,
  contractsAPI.middleware
]

const userInfoPersistConfig = {
  key: "userInfo", 
  storage,
  whitelist: ["userInfo"], 
};

const persistedUserInforReducer = persistReducer(userInfoPersistConfig, userReducer);

const combinedReducer = combineReducers({
  [apiSlice.reducerPath]: apiSlice.reducer,
  [authAPI.reducerPath]: authAPI.reducer,
  [documentsAPI.reducerPath]: documentsAPI.reducer,
  [contractsAPI.reducerPath]: contractsAPI.reducer,
  user: persistedUserInforReducer,
});

export const rootReducer = (state: ReturnType<typeof combinedReducer> | undefined, action : Action) => {
  if (action.type === RESET_STATE_ACTION_TYPE) {
    state = undefined; 
  }
  return combinedReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(middlewares),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

setupListeners(store.dispatch)