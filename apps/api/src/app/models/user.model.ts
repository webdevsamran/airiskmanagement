import { Schema, model, Document as MongooseDocument, Types } from 'mongoose';

export interface User extends MongooseDocument {
  email: string;
  fullName: string;
  passwordHash: string;
  roleId: Types.ObjectId;
  organizationId: Types.ObjectId;
  status: 'active' | 'suspended' | 'invited';
  mfaEnabled: boolean;
  lastLoginAt?: Date;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  deletedBy?: Types.ObjectId;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<User>(
  {
    email: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    passwordHash: { type: String, required: true },
    roleId: { type: Schema.Types.ObjectId, ref: 'Role', required: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    status: {
      type: String,
      enum: ['active', 'suspended', 'invited'],
      default: 'invited',
    },
    mfaEnabled: { type: Boolean, default: false },
    lastLoginAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    deletedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

export const UserModel = model<User>('User', UserSchema);
