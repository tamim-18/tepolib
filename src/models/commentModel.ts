import mongoose, { Schema, Document } from "mongoose";

interface IComment extends Document {
  content: string;
  proofImages: string[];
  proofVideo?: string;
  user: mongoose.Types.ObjectId;
  crimeReport: mongoose.Types.ObjectId;
}

const commentSchema: Schema<IComment> = new Schema(
  {
    content: { type: mongoose.Schema.Types.String, required: true },
    proofImages: { type: [mongoose.Schema.Types.String], required: true },
    proofVideo: { type: mongoose.Schema.Types.String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    crimeReport: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CrimeReport",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IComment>("Comment", commentSchema);
