import express from "express";

import { createPost, getPost, getPosts, updatePost, deletePost } from "../controllers/post";
import { IsAuthenticated } from "../middleware/auth";

export default (router: express.Router) => {
    router.post('/api/posts', IsAuthenticated, createPost);
    router.get('/api/posts', IsAuthenticated, getPosts);
    router.get('/api/posts/:id', IsAuthenticated, getPost);
    router.put('/api/posts/:id', IsAuthenticated, updatePost);
    router.delete('/api/posts/:id', IsAuthenticated, deletePost);
};