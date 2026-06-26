import { configureStore } from '@reduxjs/toolkit';
import { dashboardReducer } from '../modules/Dashboard/store/Dashboard.Slice';

export const store = configureStore({
  reducer: {
    dashboard: dashboardReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // JSMpeg references and non-serializable websocket events
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
