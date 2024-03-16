import { Request, Response } from "express";
import { IComment, CommentModel } from '../models/comments';
import { Result } from "../helpers";

// @desc    create comment
// @route   POST /api/comments
// @access  private
export const createComment =
  async (req: Request, res: Response) => {
    const comment = await CommentModel.create(req.body);
    return res.status(200).json({
      success: true,
      data: comment,
    });
  };

// @desc    show all comments
// @route   GET /api/comments
// @access  public
export const getComments = async (req: Request, res: Response) => {
  const comments = await CommentModel.find();

  return res.status(200).json({
    success: true,
    count: comments.length,
    data: comments,
  });
};

// @desc    show single comment
// @route   GET /api/comments/:id
// @access  public
export const getComment = async (req: Request, res: Response) => {
  const [error, comment] = await Result(CommentModel.findById(req.params.id));

  if (error) {
    return res.status(400).json({
      success: true,
      error: error.message,
    });
  }

  if (!comment) {
    return res.status(404).json({
      success: false,
      error: `Comment not found with id of ${req.params.id}`,
    });
  }

  res.status(200).json({
    success: true,
    data: comment,
  });
};

// @desc    update comment
// @route   PUT /api/comments/:id
// @access  private
export const updateComment = async (req: Request, res: Response) => {
  const [error, comment] = await Result(CommentModel.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }));

  if (error) {
    return res.status(400).json({
      success: true,
      error: error.message,
    });
  }

  if (!comment) {
    return res.status(404).json({
      success: false,
      error: `Comment not found with id of ${req.params.id}`,
    });
  }

  res.status(200).json({
    success: true,
    data: comment,
  });
};

// @desc    delete comment
// @route   DELETE /api/comments/:id
// @access  private
export const deleteComment = async (req: Request, res: Response) => {
  const [error, comment] = await Result(CommentModel.findByIdAndDelete(req.params.id));

  if (error) {
    return res.status(400).json({
      success: true,
      error: error.message,
    });
  }

  if (!comment) {
    return res.status(404).json({
      success: false,
      error: `Comment not found with id of ${req.params.id}`,
    });
  }

  res.status(200).json({
    success: true,
    data: {},
  });
};
