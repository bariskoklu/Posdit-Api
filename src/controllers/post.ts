import { Request, Response } from "express";
import { IPost, PostModel } from '../models/posts';
import { Result } from "../helpers";

// @desc    create post
// @route   POST /api/posts
// @access  private
export const createPost = async (req: Request, res: Response) => {

  const searchQuery = req.params.query;
  console.log(searchQuery);
  const pipeline = [];

  pipeline.push({
    $search: {
      index: 'posts',
      text: {
        query: searchQuery,
        path: ['context', 'title'],
        fuzzy: {},
      },
    },
  });
  const post = await PostModel.create(req.body);
  return res.status(200).json({
    success: true,
    data: post,
  });
};

// @desc    show all posts
// @route   GET /api/posts
// @access  public
export const getPosts = async (req: Request, res: Response) => {
  const searchQuery = req.query.query;
  var posts: IPost[];
  var error: Error;

  if (searchQuery) {
    const pipeline = [];

    pipeline.push({
      $search: {
        index: 'posts',
        text: {
          query: searchQuery,
          path: ['context', 'title'],
          fuzzy: {},
        },
      },
    });

    [error, posts] = await Result(PostModel.aggregate(pipeline));

  }
  else {
    [error, posts] = await Result(PostModel.find());
  }

  return res.status(200).json({
    success: true,
    count: posts.length,
    data: posts,
  });
};

// @desc    show single post
// @route   GET /api/posts/:id
// @access  public
export const getPost = async (req: Request, res: Response) => {
  const [error, post] = await Result(PostModel.findById(req.params.id));

  if (error) {
    return res.status(400).json({
      success: false,
      error: error.message,
    });
  }

  if (!post) {
    return res.status(404).json({
      success: false,
      error: `Post not found with id of ${req.params.id}`,
    });
  }

  res.status(200).json({
    success: true,
    data: post,
  });
};

// @desc    update post
// @route   PUT /api/posts/:id
// @access  private
export const updatePost = async (req: Request, res: Response) => {
  const [error, post] = await Result(PostModel.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }));

  if (error) {
    return res.status(400).json({
      success: false,
      error: error.message,
    });
  }

  if (!post) {
    return res.status(404).json({
      success: false,
      error: `Post not found with id of ${req.params.id}`,
    });
  }

  res.status(200).json({
    success: true,
    data: post,
  });
};

// @desc    upvote post
// @route   PUT /api/posts-upvote/:id
// @access  private
export const upvotePost = async (req: Request, res: Response) => {
  var [error, post] = await Result(PostModel.findById(req.params.id));

  if (error) {
    return res.status(400).json({
      success: false,
      error: error.message,
    });
  }

  if (!post) {
    return res.status(404).json({
      success: false,
      error: `Post not found with id of ${req.params.id}`,
    });
  }

  var userIndex = post.downvotes.indexOf(req.user._id);

  if (userIndex > -1) {
    post.downvotes.splice(userIndex, 1);
  }

  userIndex = post.upvotes.indexOf(req.user._id);

  if (userIndex > -1) {
    return res.status(404).json({
      success: false,
      error: `This post is already upvoted by the user`,
    });
  }

  [error, post] = await Result(PostModel.findByIdAndUpdate(req.params.id, post, {
    new: true,
    runValidators: true,
  }));

  if (error) {
    return res.status(400).json({
      success: false,
      error: error.message,
    });
  }

  if (!post) {
    return res.status(404).json({
      success: false,
      error: `Post not found with id of ${req.params.id}`,
    });
  }

  res.status(200).json({
    success: true,
    data: post,
  });
};

// @desc    downvote post
// @route   PUT /api/posts-downvote/:id
// @access  private
export const downvotePost = async (req: Request, res: Response) => {
  var [error, post] = await Result(PostModel.findById(req.params.id));

  if (error) {
    return res.status(400).json({
      success: false,
      error: error.message,
    });
  }

  if (!post) {
    return res.status(404).json({
      success: false,
      error: `Post not found with id of ${req.params.id}`,
    });
  }

  var userIndex = post.downvotes.indexOf(req.user._id);

  if (userIndex > -1) {

    return res.status(404).json({
      success: false,
      error: `This post is already downvoted by the user`,
    });
  }

  userIndex = post.upvotes.indexOf(req.user._id);

  if (userIndex > -1) {
    post.upvotes.splice(userIndex, 1);
  }

  [error, post] = await Result(PostModel.findByIdAndUpdate(req.params.id, post, {
    new: true,
    runValidators: true,
  }));

  if (error) {
    return res.status(400).json({
      success: false,
      error: error.message,
    });
  }

  if (!post) {
    return res.status(404).json({
      success: false,
      error: `Post not found with id of ${req.params.id}`,
    });
  }

  res.status(200).json({
    success: true,
    data: post,
  });
};

// @desc    delete post
// @route   DELETE /api/posts/:id
// @access  private
export const deletePost = async (req: Request, res: Response) => {
  const [error, post] = await Result(PostModel.findByIdAndDelete(req.params.id));

  if (error) {
    return res.status(400).json({
      success: false,
      error: error.message,
    });
  }

  if (!post) {
    return res.status(404).json({
      success: false,
      error: `Post not found with id of ${req.params.id}`,
    });
  }

  res.status(200).json({
    success: true,
    data: {},
  });
};
