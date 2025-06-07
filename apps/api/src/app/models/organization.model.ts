import { Schema, model, Document as MongooseDocument, Types } from 'mongoose';

export interface Organization extends MongooseDocument {
  name: string;
  industry: 'fintech' | 'legal' | 'security' | 'other';
  domain: string;
  tier: 'free' | 'pro' | 'enterprise';
  regulatoryFrameworks: string[];
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  deletedBy?: Types.ObjectId;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OrganizationSchema = new Schema<Organization>(
  {
    name: { type: String, required: true },
    industry: {
      type: String,
      enum: ['fintech', 'legal', 'security', 'other'],
      required: true,
    },
    domain: { type: String, required: true },
    tier: { type: String, enum: ['free', 'pro', 'enterprise'], required: true },
    regulatoryFrameworks: { type: [String], default: [] },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    deletedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

export const OrganizationModel = model<Organization>(
  'Organization',
  OrganizationSchema
);
