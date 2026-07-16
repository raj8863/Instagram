import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  likeNotification: [],
};

const realTimeNotificationSlice = createSlice({
  name: "realTimeNotification",
  initialState,
  reducers: {
    addLikeNotification(state, action) {
      const notification = action.payload;
      const exists = state.likeNotification.some(
        (item) =>
          item.postId === notification.postId &&
          item.userId === notification.userId
      );
      if (!exists) {
        state.likeNotification.unshift(notification);
      }
    },
    removeLikeNotification(state, action) {
      const { postId, userId } = action.payload;
      // ✅ Explicitly return the structural change so Redux toolkit updates reactively
      return {
        ...state,
        likeNotification: state.likeNotification.filter(
          (item) => item.postId !== postId || item.userId !== userId
        ),
      };
    },
    clearLikeNotifications(state) {
      state.likeNotification = [];
    },
  },
});

export const {
  addLikeNotification,
  removeLikeNotification,
  clearLikeNotifications,
} = realTimeNotificationSlice.actions;

export default realTimeNotificationSlice.reducer;