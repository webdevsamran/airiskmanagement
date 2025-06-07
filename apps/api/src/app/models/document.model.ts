import { Schema, model, Document as MongooseDocument, Types } from 'mongoose';

export interface Document extends MongooseDocument {
  organizationId: Types.ObjectId;
  uploadedBy: Types.ObjectId;
  name: string;
  type: string;
  tags: string[];
  contentHash: string;
  aiSummary: string;
  classification: {
    pii: boolean;
    phi: boolean;
    financial: boolean;
    confidential: boolean;
  };
  version: number;
  previousVersionId: Types.ObjectId | null;
  storageUrl: string;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  deletedBy?: Types.ObjectId;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema = new Schema<Document>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    tags: { type: [String], default: [] },
    contentHash: { type: String, required: true },
    aiSummary: { type: String, default: '' },
    classification: {
      pii: { type: Boolean, default: false },
      phi: { type: Boolean, default: false },
      financial: { type: Boolean, default: false },
      confidential: { type: Boolean, default: false },
    },
    version: { type: Number, required: true },
    previousVersionId: { type: Schema.Types.ObjectId, ref: 'Document', default: null },
    storageUrl: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    deletedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    deletedAt: { type: Date },
  },
  { timestamps: true } // auto-defines `createdAt` and `updatedAt`
);

export const DocumentModel = model<Document>('Document', DocumentSchema);
