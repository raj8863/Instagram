import { createSlice } from "@reduxjs/toolkit";

const postSlice = createSlice({
  name: 'post',
  initialState: {
    posts: [],
  },
  reducers: {
    // Actions
    setPosts: (state, action) => {
      state.posts = action.payload;
    },
  
    setSelectedPost:(state,action)=>{
      state.selectedPost = action.payload;
    },

    removePost: (state, action) => {
      state.posts = state.posts.filter((post) => post._id !== action.payload);
    }
  }
});

export const { setPosts, removePost,setSelectedPost } = postSlice.actions;
export default postSlice.reducer;