import mongoose from 'mongoose';

export interface IPost extends mongoose.Document {
  title: string;
  content: string;
  upvotes: [mongoose.Schema.Types.ObjectId];
  downvotes: [mongoose.Schema.Types.ObjectId];
  createUser: mongoose.Schema.Types.ObjectId,
  createDate: Date
}

const PostSchema = new mongoose.Schema<IPost>({
  title: { type: String, required: true },
  content: { type: String, required: true },
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createDate: { type: Date }
});

export const PostModel = mongoose.model("Post", PostSchema);
