import { Types } from 'mongoose';
import { PermissionModel } from '../models/permission.model';
import { UserModel } from '../models/user.model';
import { isAdmin, hasPermission, isSelf } from '../utils/auth';

export const permissionResolvers = {
  Query: {
    permissions: async (_: any, __: any, context: any) => {
      if (!context.userId) throw new Error('Not authenticated');

      // Admin: fetch all non-deleted
      if (isAdmin(context)) {
        return await PermissionModel.find({ deletedAt: null });
      }

      // Non-admin: must have READ_PERMISSIONS and only own (createdBy)
      if (hasPermission(context, 'READ_PERMISSIONS')) {
        return await PermissionModel.find({
          createdBy: context.userId,
          deletedAt: null,
        });
      }

      return []; // no access → empty list
    },

    permission: async (_: any, { id }: { id: string }, context: any) => {
      if (!context.userId) throw new Error('Not authenticated');

      const perm = await PermissionModel.findById(id);
      if (!perm || perm.deletedAt) return null;

      // Admin may see any
      if (isAdmin(context)) {
        return perm;
      }

      // Non-admin: needs READ_PERMISSIONS and must be creator
      const owns = isSelf(context, perm.createdBy.toString());
      if (hasPermission(context, 'READ_PERMISSIONS') && owns) {
        return perm;
      }

      throw new Error('Access denied');
    },
  },

  Mutation: {
    createPermission: async (_: any, { input }: any, context: any) => {
      if (!context.userId) throw new Error('Not authenticated');

      const canCreate =
        isAdmin(context) || hasPermission(context, 'CREATE_PERMISSIONS');
      if (!canCreate) throw new Error('Access denied');

      const permission = new PermissionModel({
        ...input,
        createdBy: context.userId,
      });

      return await permission.save();
    },

    updatePermission: async (_: any, { id, input }: any, context: any) => {
      if (!context.userId) throw new Error('Not authenticated');

      const existing = await PermissionModel.findById(id);
      if (!existing || existing.deletedAt) throw new Error('Not found');

      // Admin may update any
      if (isAdmin(context)) {
        return await PermissionModel.findByIdAndUpdate(
          id,
          { ...input, updatedBy: context.userId },
          { new: true }
        );
      }

      // Non-admin: needs UPDATE_PERMISSIONS and must be creator
      const owns = isSelf(context, existing.createdBy.toString());
      if (
        hasPermission(context, 'UPDATE_PERMISSIONS') &&
        owns
      ) {
        return await PermissionModel.findByIdAndUpdate(
          id,
          { ...input, updatedBy: context.userId },
          { new: true }
        );
      }

      throw new Error('Access denied');
    },

    deletePermission: async (_: any, { id }: { id: string }, context: any) => {
      if (!context.userId) throw new Error('Not authenticated');

      const existing = await PermissionModel.findById(id);
      if (!existing || existing.deletedAt) throw new Error('Not found');

      // Admin may soft-delete any
      if (isAdmin(context)) {
        await PermissionModel.findByIdAndUpdate(id, {
          deletedBy: context.userId,
          deletedAt: new Date(),
        });
        return true;
      }

      // Non-admin: needs DELETE_PERMISSIONS and must be creator
      const owns = isSelf(context, existing.createdBy.toString());
      if (
        hasPermission(context, 'DELETE_PERMISSIONS') &&
        owns
      ) {
        await PermissionModel.findByIdAndUpdate(id, {
          deletedBy: context.userId,
          deletedAt: new Date(),
        });
        return true;
      }

      throw new Error('Access denied');
    },
  },

  Permission: {
    createdByUser: async (parent: any) => {
      if (!Types.ObjectId.isValid(parent.createdBy)) return null;
      return await UserModel.findById(parent.createdBy);
    },
    updatedByUser: async (parent: any) => {
      if (!parent.updatedBy || !Types.ObjectId.isValid(parent.updatedBy)) return null;
      return await UserModel.findById(parent.updatedBy);
    },
    deletedByUser: async (parent: any) => {
      if (!parent.deletedBy || !Types.ObjectId.isValid(parent.deletedBy)) return null;
      return await UserModel.findById(parent.deletedBy);
    },
  },
};
