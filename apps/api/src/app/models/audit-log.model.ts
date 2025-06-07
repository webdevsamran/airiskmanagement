import { Schema, model, Document, Types } from 'mongoose';

export interface AuditLog extends Document {
  organizationId: Types.ObjectId;
  userId: Types.ObjectId;
  action: string;
  resource: string;
  resourceId: Types.ObjectId;
  ipAddress: string;
  userAgent: string;
  metadata: any;
  timestamp: Date;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  deletedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

const AuditLogSchema = new Schema<AuditLog>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    resource: { type: String, required: true },
    resourceId: Schema.Types.ObjectId,
    ipAddress: { type: String, required: true },
    userAgent: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
    timestamp: { type: Date, required: true, default: Date.now },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    deletedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

export const AuditLogModel = model<AuditLog>('AuditLog', AuditLogSchema);
