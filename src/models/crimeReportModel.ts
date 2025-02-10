import mongoose, { Schema, Document } from "mongoose";

export interface ICrimeReport extends Document {
  title: string;
  description: string;
  division: string;
  district: string;
  images: string[];
  video?: string;
  crimeTime: Date;
  user: mongoose.Schema.Types.ObjectId;
  verificationScore: number;
}

const crimeReportSchema: Schema<ICrimeReport> = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    division: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    images: { type: [String], required: true, default: [] }, // Ensures an array exists
    video: { type: String, default: null },
    crimeTime: { type: Date, required: true },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    }, // ✅ Indexed for fast queries
    verificationScore: { type: Number, default: 0 },
  },
  { timestamps: true } // ✅ Automatically adds `createdAt` and `updatedAt`
);

// ✅ Indexing for faster query performance
crimeReportSchema.index({ postTime: -1 });
crimeReportSchema.index({ division: 1, district: 1 });

export default mongoose.model<ICrimeReport>("CrimeReport", crimeReportSchema);
