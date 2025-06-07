import { Types } from 'mongoose';
import { PermissionModel } from '../models/permission.model';
import { RoleModel } from '../models/role.model';
import { UserModel } from '../models/user.model';
import { isAdmin, hasPermission, isSelf } from '../utils/auth';

export const roleResolvers = {
  Query: {
    roles: async (_: any, __: any, context: any) => {
      if (!context.userId) throw new Error('Not authenticated');

      // Admin: fetch all non-deleted roles
      if (isAdmin(context)) {
        return await RoleModel.find({ deletedAt: null });
      }

      // Non-admin: needs READ_ROLES and only own (createdBy)
      if (hasPermission(context, 'READ_ROLES')) {
        return await RoleModel.find({
          createdBy: context.userId,
          deletedAt: null,
        });
      }

      return []; // no access → empty list
    },

    role: async (_: any, { id }: { id: string }, context: any) => {
      if (!context.userId) throw new Error('Not authenticated');

      const role = await RoleModel.findById(id);
      if (!role || role.deletedAt) return null;

      // Admin may see any
      if (isAdmin(context)) {
        return role;
      }

      // Non-admin: needs READ_ROLES and must be creator
      const owns = isSelf(context, role.createdBy.toString());
      if (hasPermission(context, 'READ_ROLES') && owns) {
        return role;
      }

      throw new Error('Access denied');
    },
  },

  Mutation: {
    createRole: async (_: any, { input }: any, context: any) => {
      if (!context.userId) throw new Error('Not authenticated');

      const canCreate =
        isAdmin(context) || hasPermission(context, 'CREATE_ROLES');
      if (!canCreate) throw new Error('Access denied');

      const role = new RoleModel({
        ...input,
        createdBy: context.userId,
      });

      return await role.save();
    },

    updateRole: async (_: any, { id, input }: any, context: any) => {
      if (!context.userId) throw new Error('Not authenticated');

      const existing = await RoleModel.findById(id);
      if (!existing || existing.deletedAt) throw new Error('Not found');

      // Admin may update any
      if (isAdmin(context)) {
        return await RoleModel.findByIdAndUpdate(
          id,
          { ...input, updatedBy: context.userId },
          { new: true }
        );
      }

      // Non-admin: needs UPDATE_ROLES and must be creator
      const owns = isSelf(context, existing.createdBy.toString());
      if (
        hasPermission(context, 'UPDATE_ROLES') &&
        owns
      ) {
        return await RoleModel.findByIdAndUpdate(
          id,
          { ...input, updatedBy: context.userId },
          { new: true }
        );
      }

      throw new Error('Access denied');
    },

    deleteRole: async (_: any, { id }: { id: string }, context: any) => {
      if (!context.userId) throw new Error('Not authenticated');

      const existing = await RoleModel.findById(id);
      if (!existing || existing.deletedAt) throw new Error('Not found');

      // Admin may soft-delete any
      if (isAdmin(context)) {
        await RoleModel.findByIdAndUpdate(id, {
          deletedBy: context.userId,
          deletedAt: new Date(),
        });
        return true;
      }

      // Non-admin: needs DELETE_ROLES and must be creator
      const owns = isSelf(context, existing.createdBy.toString());
      if (
        hasPermission(context, 'DELETE_ROLES') &&
        owns
      ) {
        await RoleModel.findByIdAndUpdate(id, {
          deletedBy: context.userId,
          deletedAt: new Date(),
        });
        return true;
      }

      throw new Error('Access denied');
    },
  },

  Role: {
    permissions: async (parent: any) => {
      return await PermissionModel.find({
        _id: { $in: parent.permissions },
      });
    },

    // Resolve the audit relationships:
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
