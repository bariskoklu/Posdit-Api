import { Request, Response } from "express";
import { IPost, PostModel } from '../models/posts';
import { Result } from "../helpers";
import { UploadMedia, getSignedUrlForMedia } from "../helpers/s3Helper";
import { GetPostDto } from "dtos/postdto";

// @desc    create post
// @route   POST /api/posts
// @access  private
export const createPost = async (req: Request, res: Response) => {
  const [s3UploadError, s3FileKey] = await Result(UploadMedia(req.body.file));

  if (s3UploadError) {
    return res.status(400).json({
      success: false,
      error: s3UploadError.message,
    });
  }

  const postToCreate: IPost = {
    ...req.body,
    fileKey: s3FileKey
  }

  const [error, post] = await Result(PostModel.create(postToCreate));

  if (error) {
    return res.status(400).json({
      success: false,
      error: error.message,
    });
  }

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
  var postDtos: GetPostDto[];
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

  if (error) {
    return res.status(400).json({
      success: false,
      error: error.message,
    });
  }

  if (posts.length === 0) {
    return res.status(404).json({
      success: false,
      error: `Post not found with id of ${req.params.id}`,
    });
  }

  posts.forEach(async post => {
    const postDto: GetPostDto = {
      ...post,
      signedUrl: null
    };

    const [getSignedUrlerror, url] = await Result(getSignedUrlForMedia(post.fileKey));

    if (getSignedUrlerror) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    postDtos.push(postDto);
  });

  return res.status(200).json({
    success: true,
    count: postDtos.length,
    data: postDtos,
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

  const postDto: GetPostDto = {
    ...post,
    signedUrl: null
  };

  const [getSignedUrlerror, url] = await Result(getSignedUrlForMedia(post.fileKey));

  if (getSignedUrlerror) {
    return res.status(400).json({
      success: false,
      error: error.message,
    });
  }

  postDto.signedUrl = url;



  res.status(200).json({
    success: true,
    data: postDto,
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
