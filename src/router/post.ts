import express from "express";

import { createPost, getPost, getPosts, updatePost, deletePost, upvotePost, downvotePost } from "../controllers/post";
import { IsAuthenticated } from "../middleware/auth";
import { UploadSingle } from "../middleware/fileUpload";

export default (router: express.Router) => {
  router.post('/api/posts', IsAuthenticated, UploadSingle, createPost);
  router.get('/api/posts', IsAuthenticated, getPosts);
  router.get('/api/posts/:id', IsAuthenticated, getPost);
  router.put('/api/posts/:id', IsAuthenticated, updatePost);
  router.put('/api/postsupvote/:id', IsAuthenticated, upvotePost);
  router.put('/api/postsdownvote/:id', IsAuthenticated, downvotePost);
  router.delete('/api/posts/:id', IsAuthenticated, deletePost);
};