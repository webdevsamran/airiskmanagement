import { Schema, model, Document as MongooseDocument, Types } from 'mongoose';

export interface RiskScore extends MongooseDocument {
  organizationId: Types.ObjectId;
  documentId?: Types.ObjectId;
  userId?: Types.ObjectId;
  entityType: 'document' | 'user' | 'integration';
  score: number;
  rationale: string;
  scoreBreakdown: any;
  calculatedAt: Date;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  deletedBy?: Types.ObjectId;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RiskScoreSchema = new Schema<RiskScore>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    documentId: { type: Schema.Types.ObjectId, ref: 'Document' },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    entityType: {
      type: String,
      enum: ['document', 'user', 'integration'],
      required: true,
    },
    score: { type: Number, required: true },
    rationale: { type: String, required: true },
    scoreBreakdown: { type: Schema.Types.Mixed, required: true },
    calculatedAt: { type: Date, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    deletedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

export const RiskScoreModel = model<RiskScore>('RiskScore', RiskScoreSchema);
