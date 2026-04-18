import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface UserDocument extends Document {
  email: string;
  passwordHash: string;
  name?: string;
}

const userSchema = new Schema<UserDocument>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, trim: true },
  },
  { timestamps: true }
);

userSchema.index({ email: 1 });

export const User: Model<UserDocument> =
  mongoose.models.User || mongoose.model<UserDocument>("User", userSchema);
