import { Request, Response } from "express";
import { IComment, CommentModel } from '../models/comments';
import { Result } from "../helpers";

// @desc    create comment
// @route   POST /api/comments
// @access  private
export const createComment =
  async (req: Request, res: Response) => {


    const [error, comment] = await Result(CommentModel.create(req.body));

    if (req.body.parentId) {
      var [parentCommentError, parentComment] = await Result(CommentModel.findById(req.body.parentId));

      if (parentCommentError) {
        return res.status(400).json({
          success: true,
          error: parentCommentError.message,
        });
      }

      if (!parentComment) {
        return res.status(404).json({
          success: false,
          error: `Comment not found with id of ${req.body.parentId}`,
        });
      }

      parentComment.replies.push(comment.id);

      [parentCommentError, parentComment] = await Result(parentComment.save());

      if (parentCommentError) {
        return res.status(400).json({
          success: true,
          error: parentCommentError.message,
        });
      }

      if (!parentComment) {
        return res.status(404).json({
          success: false,
          error: `Comment not found with id of ${req.body.parentId}`,
        });
      }
    }

    return res.status(200).json({
      success: true,
      data: comment,
    });
  };

// @desc    show all comments
// @route   GET /api/comments
// @access  public
export const getComments = async (req: Request, res: Response) => {
  // const comments = await CommentModel.find();

  const [error, comments] = await Result(CommentModel.aggregate([
    {
      $lookup: {
        from: "Comment",
        localField: "$replies",
        foreignField: "_id",
        as: "repliesDetailed",
        pipeline: [
          {
            $lookup: {
              from: "Comment",
              localField: "$replies",
              foreignField: "_id",
              as: "repliesDetailed",
            }
          }
        ]
      }
    }
  ]))

  if (error) {
    return res.status(400).json({
      success: true,
      error: error.message,
    });
  }

  if (!comments) {
    return res.status(404).json({
      success: false,
      error: `Comment not found with id of ${req.params.id}`,
    });
  }

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
  // const [error, comment] = await Result(CommentModel.findById(req.params.id));

  // const [error, comment] = await Result(CommentModel.aggregate([
  //   {
  //     $match: {
  //       _id: req.params.id
  //     },
  //     $graphLookup: {
  //       from: "comment",
  //       startWith: "$parentId",
  //       connectFromField: "parentId",
  //       connectToField: "_id",
  //       as: "reportingHierarchy"
  //     }
  //   }
  // ]))
  var matchPipeline;

  if (req.params.id) {
    matchPipeline = {
      $match: {
        _id: req.params.id
      },
    }
  }
  else if (req.query.parentId) {
    matchPipeline = {
      $match: {
        parentId: req.query.parentId
      },
    }
  }



  const [error, comment] = await Result(CommentModel.aggregate([
    matchPipeline,
    {
      $lookup: {
        from: "Comment",
        localField: "$replies",
        foreignField: "_id",
        as: "repliesDetailed",
        pipeline: [
          {
            $lookup: {
              from: "Comment",
              localField: "$replies",
              foreignField: "_id",
              as: "repliesDetailed",
            }
          }
        ]
      }
    }
  ]))

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

  if (!comment.parentId) {
    var [parentCommentError, parentComment] = await Result(CommentModel.findById(req.body.parentId));

    if (parentCommentError) {
      return res.status(400).json({
        success: true,
        error: parentCommentError.message,
      });
    }

    if (!parentComment) {
      return res.status(404).json({
        success: false,
        error: `Comment not found with id of ${req.body.parentId}`,
      });
    }

    const index = parentComment.replies.indexOf(comment.id);
    if (index > -1) {
      parentComment.replies.splice(index, 1);
    }

    [parentCommentError, parentComment] = await Result(parentComment.save());

    if (parentCommentError) {
      return res.status(400).json({
        success: true,
        error: parentCommentError.message,
      });
    }

    if (!parentComment) {
      return res.status(404).json({
        success: false,
        error: `Comment not found with id of ${req.body.parentId}`,
      });
    }
  }

  res.status(200).json({
    success: true,
    data: {},
  });
};
