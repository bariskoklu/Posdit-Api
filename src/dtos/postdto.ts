import mongoose from "mongoose";

interface GetPostDto {
  title: string;
  content: string;
  signedUrl: string;
  upvotes: [mongoose.Schema.Types.ObjectId];
  downvotes: [mongoose.Schema.Types.ObjectId];
  createUser: mongoose.Schema.Types.ObjectId;
  createDate: Date;
};

export { GetPostDto };