import React, { useState } from 'react';
import mongoose from "mongoose";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";

// Mongoose Schema
const PostSchema = mongoose.Schema({
  postMsg: { type: String, required: true },
  email: { type: String, required: true },
  likes: {
    count: { type: Number, default: 0 },
    users: { type: [String], default: [] },
  },
}, {
  timestamps: { createdAt: true, updatedAt: false },
});

const PostModel = mongoose.model("posts", PostSchema);

// Initial State for Redux Slice
const initialState = {
  posts: [],
  status: 'idle',
  error: null,
};

// Async Thunk to Save Post
export const savePost = createAsyncThunk("posts/savePost", async (postData) => {
  const response = await axios.post('http://localhost:3001/savePost', postData);
  return response.data.post;
});

// Redux Slice
const postSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(savePost.pending, (state) => {
        state.status = "loading";
      })
      .addCase(savePost.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.posts.unshift(action.payload);
      })
      .addCase(savePost.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

// React Component for Posting
const PostComponent = () => {
  const [postMsg, setPostMsg] = useState('');
  const email = 'user@example.com'; // Replace with actual user email from your auth context
  const dispatch = useDispatch();
  const status = useSelector((state) => state.posts.status);
  const error = useSelector((state) => state.posts.error);

  const handlePost = async () => {
    if (!postMsg.trim()) {
      alert("Post message is required.");
      return;
    }

    const postData = { postMsg, email };
    await dispatch(savePost(postData));
    setPostMsg("");
  };

  return (
    <div>
      <textarea 
        value={postMsg} 
        onChange={(e) => setPostMsg(e.target.value)} 
        placeholder="What's on your mind?" 
      />
      <button onClick={handlePost} disabled={status === 'loading'}>
        {status === 'loading' ? 'Posting...' : 'Post'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

// Export the reducer and model
export default postSlice.reducer;
export { PostModel, PostComponent };