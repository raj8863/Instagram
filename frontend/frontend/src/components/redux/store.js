import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import postReducer from "./postSlice";
import chatReducer from "./chartSlice";
import socketReducer from "./socketSlice";
import rtnslice from './rtnSlice';
import {
  persistReducer,
  persistStore,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";

// Direct localStorage proxy wrapper
const storage = {
  getItem: (key) => {
    try {
      const item = localStorage.getItem(key);
      return Promise.resolve(item);
    } catch (error) {
      return Promise.reject(error);
    }
  },
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  },
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  },
};

const persistConfig = {
  key: "root",
  version: 1,
  storage,
  blacklist: ["socketio"], // Exclude non-serializable socket connection from storage
};

const rootReducer = combineReducers({
  auth: authReducer,
  post: postReducer,
  socketio: socketReducer,
  chat: chatReducer,
  realTimeNotification: rtnslice,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore internal redux-persist sync actions
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        // Safely bypass checking deep socket instances inside the state tree
        ignoredPaths: ["socketio.socket", "socketio.socketId"], 
      },
    }),
});

export const persistor = persistStore(store);