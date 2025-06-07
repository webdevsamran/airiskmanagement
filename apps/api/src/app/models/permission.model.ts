import { Schema, model, Document as MongooseDocument, Types } from 'mongoose';

export interface Permission extends MongooseDocument {
  name: string;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  deletedBy?: Types.ObjectId;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PermissionSchema = new Schema<Permission>(
  {
    name: { type: String, required: true, unique: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    deletedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

export const PermissionModel = model<Permission>(
  'Permission',
  PermissionSchema
);
