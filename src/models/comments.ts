import mongoose from 'mongoose';

export interface IComment extends mongoose.Document {
  comment: string;
  postId: mongoose.Schema.Types.ObjectId;
  parentId: mongoose.Schema.Types.ObjectId;
  replies: [mongoose.Schema.Types.ObjectId];
  upvotes: [mongoose.Schema.Types.ObjectId];
  downvotes: [mongoose.Schema.Types.ObjectId];
  createUser: mongoose.Schema.Types.ObjectId;
  createDate: Date;
}

const CommentSchema = new mongoose.Schema<IComment>({
  comment: { type: String, required: true },
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
  // parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', autoPopulate: { maxDepth: 5 } }, //mongoose-autopopulate
  replies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createDate: { type: Date }
});

export const CommentModel = mongoose.model("Comment", CommentSchema);
