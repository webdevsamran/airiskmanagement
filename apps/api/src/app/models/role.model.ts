import { Schema, model, Document as MongooseDocument, Types } from 'mongoose';

export interface Role extends MongooseDocument {
  name: string;
  permissions: Types.ObjectId[];
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  deletedBy?: Types.ObjectId;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RoleSchema = new Schema<Role>(
  {
    name: { type: String, required: true, unique: true },
    permissions: [
      { type: Schema.Types.ObjectId, ref: 'Permission', required: true },
    ],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    deletedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

export const RoleModel = model<Role>('Role', RoleSchema);
