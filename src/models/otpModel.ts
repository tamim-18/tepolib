import mongoose, { Schema, Document } from "mongoose";

interface IOTP extends Document {
  phoneNumber: string;
  otp: string;
  expiry: Date;
  verified: boolean;
}

const otpSchema: Schema<IOTP> = new Schema(
  {
    phoneNumber: { type: String, required: true },
    otp: { type: String, required: true },
    expiry: { type: Date, required: true },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<IOTP>("OTP", otpSchema);
