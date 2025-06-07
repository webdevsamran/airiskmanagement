import { Schema, model, Document as MongooseDocument, Types } from 'mongoose';

export interface Setting extends MongooseDocument {
  organizationId: Types.ObjectId;
  encryptionLevel: 'standard' | 'FIPS-140-2';
  dataRetentionDays: number;
  notifyOnHighRisk: boolean;
  allowedFileTypes: string[];
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  deletedBy?: Types.ObjectId;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SettingSchema = new Schema<Setting>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    encryptionLevel: { type: String, enum: ['standard', 'FIPS_140_2'], required: true },
    dataRetentionDays: { type: Number, required: true },
    notifyOnHighRisk: { type: Boolean, required: true },
    allowedFileTypes: { type: [String], required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    deletedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

export const SettingModel = model<Setting>('Setting', SettingSchema);
