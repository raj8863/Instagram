import { createSlice } from "@reduxjs/toolkit";

const socketSlice = createSlice({
  name: "socketio",
  initialState: {
    socket: null,
    connected: false,
  },
  reducers: {
    setSocket: (state, action) => {
      state.socket = action.payload;
      state.connected = !!action.payload;
    },
    removeSocket: (state) => {
      state.socket = null;
      state.connected = false;
    },
  },
});

export const { setSocket, removeSocket } = socketSlice.actions;
export default socketSlice.reducer;