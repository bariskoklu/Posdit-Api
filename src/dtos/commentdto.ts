import mongoose from "mongoose";

interface GetCommentDto {
    comment: string;
    postId: mongoose.Schema.Types.ObjectId;
    parentId: mongoose.Schema.Types.ObjectId;
    replies: [mongoose.Schema.Types.ObjectId];
    upvotes: [mongoose.Schema.Types.ObjectId];
    downvotes: [mongoose.Schema.Types.ObjectId];
    createUser: mongoose.Schema.Types.ObjectId;
    createDate: Date;
    upvoteCount: Number;
    downVoteCount: Number;
    IsUpvotedByUser: boolean;
    IsDownvotedByUser: boolean;
    repliesDetailed?: GetCommentDto[];
};
export { GetCommentDto };