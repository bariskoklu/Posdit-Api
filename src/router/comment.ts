import express from "express";

import { createComment, getComment, getComments, updateComment, deleteComment } from "../controllers/comment";
import { IsAuthenticated } from "../middleware/auth";

export default (router: express.Router) => {
  router.post('/api/comments', IsAuthenticated, createComment);
  router.get('/api/comments', IsAuthenticated, getComments);
  router.get('/api/comments/:id', IsAuthenticated, getComment);
  router.put('/api/comments/:id', IsAuthenticated, updateComment);
  router.delete('/api/comments/:id', IsAuthenticated, deleteComment);
};