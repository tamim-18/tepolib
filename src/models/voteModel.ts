import mongoose, { Schema, Document } from "mongoose";

interface IVote extends Document {
  user: mongoose.Types.ObjectId;
  crimeReport: mongoose.Types.ObjectId;
  vote: "upvote" | "downvote";
}

const voteSchema: Schema<IVote> = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    crimeReport: {
      type: Schema.Types.ObjectId,
      ref: "CrimeReport",
      required: true,
    },
    vote: { type: String, enum: ["upvote", "downvote"], required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IVote>("Vote", voteSchema);
