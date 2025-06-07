import GraphQLUpload from 'graphql-upload/public/GraphQLUpload.js';
import { isAdmin, hasPermission, isSelf } from '../utils/auth';
import { DocumentModel } from '../models/document.model';
import { OrganizationModel } from '../models/organization.model';
import { UserModel } from '../models/user.model';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Define FileUpload type manually for TypeScript
type FileUpload = {
  filename: string;
  mimetype: string;
  encoding: string;
  createReadStream: () => NodeJS.ReadableStream;
};

export const documentResolvers = {
  Upload: GraphQLUpload, // make sure ApolloServer is configured for uploads

  Query: {
    documents: async (_: any, __: any, context: any) => {
      if (!context.userId) throw new Error('Not authenticated');

      // Admin: fetch all non-deleted
      if (isAdmin(context)) {
        return await DocumentModel.find({ deletedAt: null });
      }

      // Non-admin: needs READ_DOCUMENTS + only own (createdBy)
      if (hasPermission(context, 'READ_DOCUMENTS')) {
        return await DocumentModel.find({
          createdBy: context.userId,
          deletedAt: null,
        });
      }

      return []; // no access → empty list
    },

    document: async (_: any, { id }: { id: string }, context: any) => {
      if (!context.userId) throw new Error('Not authenticated');

      const doc = await DocumentModel.findById(id);
      if (!doc || doc.deletedAt) return null;

      // Admin may see any
      if (isAdmin(context)) {
        return doc;
      }

      // Non-admin: needs READ_DOCUMENTS + ownership (createdBy)
      const owns = isSelf(context, doc.createdBy.toString());
      if (hasPermission(context, 'READ_DOCUMENTS') && owns) {
        return doc;
      }

      throw new Error('Access denied');
    },
  },

  Mutation: {
    createDocument: async (
      _: any,
      {
        input,
      }: {
        input: {
          organizationId: string;
          name: string;
          type: string;
          tags: string[];
          file: FileUpload;
        };
      },
      context: any
    ) => {
      if (!context.userId) throw new Error('Not authenticated');

      const canCreate =
        isAdmin(context) || hasPermission(context, 'CREATE_DOCUMENTS');
      if (!canCreate) throw new Error('Access denied');

      // 1. Handle file upload
      const { createReadStream, filename } = await input.file;
      const uploadDir = path.resolve(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir);
      }
      const uniqueFilename = `${Date.now()}-${filename}`;
      const filePath = path.join(uploadDir, uniqueFilename);

      await new Promise<void>((resolve, reject) => {
        const stream = createReadStream();
        const out = fs.createWriteStream(filePath);
        stream.pipe(out);
        out.on('finish', () => resolve());
        out.on('error', (err) => reject(err));
      });

      // 2. Compute contentHash (SHA-256)
      const fileBuffer = fs.readFileSync(filePath);
      const contentHash = crypto
        .createHash('sha256')
        .update(fileBuffer)
        .digest('hex');

      // 3. Dummy AI summary & classification
      const aiSummary = 'AI-generated summary placeholder';
      const classification = {
        pii: false,
        phi: false,
        financial: false,
        confidential: false,
      };

      // 4. Initial version + previousVersionId
      const version = 1;
      const previousVersionId = null;

      // 5. storageUrl (adjust if hosting elsewhere)
      const storageUrl = `http://localhost:4000/uploads/${uniqueFilename}`;

      // 6. Save Document with audit fields
      const newDoc = new DocumentModel({
        organizationId: input.organizationId,
        uploadedBy: context.userId,
        name: input.name,
        type: input.type,
        tags: input.tags,
        contentHash,
        aiSummary,
        classification,
        version,
        previousVersionId,
        storageUrl,

        createdBy: context.userId, // audit
      });

      return await newDoc.save();
    },

    updateDocument: async (
      _: any,
      {
        id,
        input,
      }: {
        id: string;
        input: {
          name?: string;
          type?: string;
          tags?: string[];
          file?: FileUpload;
        };
      },
      context: any
    ) => {
      if (!context.userId) throw new Error('Not authenticated');

      const existing = await DocumentModel.findById(id);
      if (!existing || existing.deletedAt) throw new Error('Not found');

      // Admin may update any
      if (isAdmin(context)) {
        // proceed to update below
      } else {
        // Non-admin: needs UPDATE_DOCUMENTS + must be creator (createdBy)
        const owns = isSelf(context, existing.createdBy.toString());
        if (!(hasPermission(context, 'UPDATE_DOCUMENTS') && owns)) {
          throw new Error('Access denied');
        }
      }

      const updateFields: any = {};

      // Update simple fields if provided
      if (input.name !== undefined) updateFields.name = input.name;
      if (input.type !== undefined) updateFields.type = input.type;
      if (input.tags !== undefined) updateFields.tags = input.tags;

      // If new file: re-upload + recalc hash/AI/classification/version
      if (input.file) {
        const { createReadStream, filename } = await input.file;
        const uploadDir = path.resolve(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir);
        }
        const uniqueFilename = `${Date.now()}-${filename}`;
        const filePath = path.join(uploadDir, uniqueFilename);

        await new Promise<void>((resolve, reject) => {
          const stream = createReadStream();
          const out = fs.createWriteStream(filePath);
          stream.pipe(out);
          out.on('finish', () => resolve());
          out.on('error', (err) => reject(err));
        });

        // Recompute contentHash
        const fileBuffer = fs.readFileSync(filePath);
        const contentHash = crypto
          .createHash('sha256')
          .update(fileBuffer)
          .digest('hex');

        // Dummy AI/classification
        const aiSummary = 'Updated AI summary placeholder';
        const classification = {
          pii: false,
          phi: false,
          financial: false,
          confidential: false,
        };

        // Bump version + set previousVersionId
        updateFields.previousVersionId = existing._id;
        updateFields.version = existing.version + 1;

        updateFields.contentHash = contentHash;
        updateFields.aiSummary = aiSummary;
        updateFields.classification = classification;

        // New storageUrl
        updateFields.storageUrl = `http://localhost:4000/uploads/${uniqueFilename}`;
      }

      // Set updatedBy
      updateFields.updatedBy = context.userId;

      const updatedDoc = await DocumentModel.findByIdAndUpdate(
        id,
        updateFields,
        { new: true }
      );
      return updatedDoc;
    },

    deleteDocument: async (_: any, { id }: { id: string }, context: any) => {
      if (!context.userId) throw new Error('Not authenticated');

      const existing = await DocumentModel.findById(id);
      if (!existing || existing.deletedAt) throw new Error('Not found');

      // Admin may delete any
      if (isAdmin(context)) {
        // proceed to soft-delete below
      } else {
        // Non-admin: needs DELETE_DOCUMENTS + must be creator
        const owns = isSelf(context, existing.createdBy.toString());
        if (!(hasPermission(context, 'DELETE_DOCUMENTS') && owns)) {
          throw new Error('Access denied');
        }
      }

      // Soft-delete: set deletedAt + deletedBy
      await DocumentModel.findByIdAndUpdate(id, {
        deletedBy: context.userId,
        deletedAt: new Date(),
      });

      return true;
    },
  },

  Document: {
    organization: async (parent: any) => {
      return await OrganizationModel.findById(parent.organizationId);
    },
    uploadedByUser: async (parent: any) => {
      return await UserModel.findById(parent.uploadedBy);
    },
    createdByUser: async (parent: any) => {
      return await UserModel.findById(parent.createdBy);
    },
    updatedByUser: async (parent: any) => {
      if (!parent.updatedBy) return null;
      return await UserModel.findById(parent.updatedBy);
    },
    deletedByUser: async (parent: any) => {
      if (!parent.deletedBy) return null;
      return await UserModel.findById(parent.deletedBy);
    },
  },
};
