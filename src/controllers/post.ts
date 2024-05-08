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

// @desc    show all or some posts with query
// @route   GET /api/posts
// @access  public
export const getPosts = async (req: Request, res: Response) => {
  const searchQuery = req.query.query;
  let posts: IPost[];
  let postDtos: GetPostDto[] = [];
  let error: Error;

  let pipeline = [];

  if (searchQuery) {
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
  }

  pipeline.push({
    $project: {  // This stage specifies the fields to include or exclude
      title: 1,
      content: 1,
      fileKey: 1,
      upvotes: 1,
      downvotes: 1,
      createUser: 1,
      createDate: 1
    }
  });

  [error, posts] = await Result(PostModel.aggregate(pipeline));

  if (error) {
    return res.status(400).json({
      success: false,
      error: error.message,
    });
  }

  if (posts.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'No posts found',
    });
  }

  for (const post of posts) {
    console.log(post);
    const postDto: GetPostDto = {
      ...post,
      signedUrl: null
    };

    const [getSignedUrlError, url] = await Result(getSignedUrlForMedia(post.fileKey));

    if (getSignedUrlError) {
      return res.status(400).json({
        success: false,
        error: getSignedUrlError.message,
      });
    }

    if (url) {
      postDto.signedUrl = url;
    }

    postDtos.push(postDto);
  }

  console.log(postDtos);

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
