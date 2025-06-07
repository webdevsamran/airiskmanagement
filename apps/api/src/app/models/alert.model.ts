import { Schema, model, Document, Types } from 'mongoose';

export interface Alert extends Document {
  organizationId: Types.ObjectId;
  channel: 'email' | 'slack' | 'sms';
  recipient: string;
  trigger: string;
  templateId: string;
  active: boolean;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  deletedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

const AlertSchema = new Schema<Alert>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    channel: { type: String, enum: ['email', 'slack', 'sms'], required: true },
    recipient: { type: String, required: true },
    trigger: { type: String, required: true },
    templateId: { type: String, required: true },
    active: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    deletedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    deletedAt: { type: Date },
  },
  { timestamps: true } // sets both createdAt and updatedAt
);

export const AlertModel = model<Alert>('Alert', AlertSchema);
