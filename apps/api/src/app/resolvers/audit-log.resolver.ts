import { Types } from 'mongoose';
import { AuditLogModel } from '../models/audit-log.model';
import { OrganizationModel } from '../models/organization.model';
import { UserModel } from '../models/user.model';
import { isAdmin, hasPermission, isSelf } from '../utils/auth';

export const auditLogResolvers = {
  Query: {
    auditLogs: async (_: any, __: any, context: any) => {
      if (!context.userId) throw new Error('Not authenticated');

      if (isAdmin(context)) {
        return AuditLogModel.find({ deletedAt: null });
      }

      if (hasPermission(context, 'READ_AUDIT_LOG')) {
        return AuditLogModel.find({
          createdBy: context.userId,
          deletedAt: null,
        });
      }

      return []; // No access
    },

    auditLog: async (_: any, { id }: any, context: any) => {
      if (!context.userId) throw new Error('Not authenticated');

      const auditLog = await AuditLogModel.findById(id);
      if (!auditLog || auditLog.deletedAt) return null;

      const canAccess =
        isAdmin(context) ||
        (hasPermission(context, 'READ_AUDIT_LOG') &&
          isSelf(context, auditLog.createdBy?.toString()));

      if (!canAccess) throw new Error('Access denied');

      return auditLog;
    },
  },

  Mutation: {
    createAuditLog: async (_: any, { input }: any, context: any) => {
      if (!context.userId) throw new Error('Not authenticated');

      const canCreate =
        isAdmin(context) || hasPermission(context, 'CREATE_AUDIT_LOG');
      if (!canCreate) throw new Error('Access denied');

      const auditLog = new AuditLogModel({
        ...input,
        timestamp: input.timestamp || new Date(),
        createdBy: context.userId,
      });

      return await auditLog.save();
    },

    updateAuditLog: async (_: any, { id, input }: any, context: any) => {
      if (!context.userId) throw new Error('Not authenticated');

      const existing = await AuditLogModel.findById(id);
      if (!existing || existing.deletedAt) throw new Error('Not found');

      const canUpdate =
        isAdmin(context) ||
        (hasPermission(context, 'UPDATE_AUDIT_LOG') &&
          isSelf(context, existing.createdBy?.toString()));

      if (!canUpdate) throw new Error('Access denied');

      return await AuditLogModel.findByIdAndUpdate(
        id,
        { ...input, updatedBy: context.userId },
        { new: true }
      );
    },

    deleteAuditLog: async (_: any, { id }: any, context: any) => {
      if (!context.userId) throw new Error('Not authenticated');

      const existing = await AuditLogModel.findById(id);
      if (!existing || existing.deletedAt) throw new Error('Not found');

      const canDelete =
        isAdmin(context) ||
        (hasPermission(context, 'DELETE_AUDIT_LOG') &&
          isSelf(context, existing.createdBy?.toString()));

      if (!canDelete) throw new Error('Access denied');

      await AuditLogModel.findByIdAndUpdate(id, {
        deletedBy: context.userId,
        deletedAt: new Date(),
      });

      return true;
    },
  },

  AuditLog: {
    organization: async (parent: any) => {
      if (!Types.ObjectId.isValid(parent.organizationId)) return null;
      return await OrganizationModel.findById(parent.organizationId);
    },

    user: async (parent: any) => {
      if (!Types.ObjectId.isValid(parent.userId)) return null;
      return await UserModel.findById(parent.userId);
    },
  },
};
