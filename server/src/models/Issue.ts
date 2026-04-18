import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";

export const ISSUE_STATUSES = ["open", "in_progress", "resolved", "closed"] as const;
export const ISSUE_PRIORITIES = ["low", "medium", "high", "urgent"] as const;
export const ISSUE_SEVERITIES = ["low", "medium", "high", "critical"] as const;

export type IssueStatus = (typeof ISSUE_STATUSES)[number];
export type IssuePriority = (typeof ISSUE_PRIORITIES)[number];
export type IssueSeverity = (typeof ISSUE_SEVERITIES)[number];

export interface IssueDocument extends Document {
  title: string;
  description: string;
  status: IssueStatus;
  priority: IssuePriority;
  severity: IssueSeverity;
  createdBy: Types.ObjectId;
}

const issueSchema = new Schema<IssueDocument>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, maxlength: 10000 },
    status: {
      type: String,
      enum: ISSUE_STATUSES,
      default: "open",
    },
    priority: {
      type: String,
      enum: ISSUE_PRIORITIES,
      default: "medium",
    },
    severity: {
      type: String,
      enum: ISSUE_SEVERITIES,
      default: "medium",
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  },
  { timestamps: true }
);

issueSchema.index({ createdBy: 1, status: 1 });
issueSchema.index({ createdBy: 1, createdAt: -1 });

export const Issue: Model<IssueDocument> =
  mongoose.models.Issue || mongoose.model<IssueDocument>("Issue", issueSchema);
