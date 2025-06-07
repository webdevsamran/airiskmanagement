import { Schema, model, Document as MongooseDocument, Types } from 'mongoose';

export interface Integration extends MongooseDocument {
  organizationId: Types.ObjectId;
  provider: 'slack' | 'jira' | 'salesforce' | 'gdrive' | 'aws';
  config: any;
  status: 'active' | 'disconnected';
  lastSyncedAt?: Date;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  deletedBy?: Types.ObjectId;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const IntegrationSchema = new Schema<Integration>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    provider: {
      type: String,
      enum: ['slack', 'jira', 'salesforce', 'gdrive', 'aws'],
      required: true,
    },
    config: { type: Schema.Types.Mixed, required: true },
    status: { type: String, enum: ['active', 'disconnected'], default: 'active' },
    lastSyncedAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    deletedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

export const IntegrationModel = model<Integration>('Integration', IntegrationSchema);
