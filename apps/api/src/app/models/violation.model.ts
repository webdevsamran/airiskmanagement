import { Schema, model, Document as MongooseDocument, Types } from 'mongoose';

export interface Violation extends MongooseDocument {
  organizationId: Types.ObjectId;
  ruleId: Types.ObjectId;
  documentId: Types.ObjectId;
  triggeredBy: Types.ObjectId;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_review' | 'resolved';
  resolutionNote?: string;
  flaggedTextSnippet: string;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  deletedBy?: Types.ObjectId;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ViolationSchema = new Schema<Violation>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    ruleId: { type: Schema.Types.ObjectId, ref: 'ComplianceRule', required: true },
    documentId: { type: Schema.Types.ObjectId, ref: 'Document', required: true },
    triggeredBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: true,
    },
    status: {
      type: String,
      enum: ['open', 'in_review', 'resolved'],
      required: true,
    },
    resolutionNote: { type: String },
    flaggedTextSnippet: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    deletedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

export const ViolationModel = model<Violation>('Violation', ViolationSchema);
