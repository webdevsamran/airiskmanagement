import { Types } from 'mongoose';
import { OrganizationModel } from '../models/organization.model';
import { SettingModel } from '../models/setting.model';
import { UserModel } from '../models/user.model';
import { isAdmin, hasPermission, isSelf } from '../utils/auth';

export const settingResolvers = {
  Query: {
    settings: async (_: any, __: any, context: any) => {
      if (!context.userId) throw new Error('Not authenticated');

      // Admin: fetch all non-deleted settings
      if (isAdmin(context)) {
        return await SettingModel.find({ deletedAt: null });
      }

      // Non-admin: needs READ_SETTINGS and only own (createdBy)
      if (hasPermission(context, 'READ_SETTINGS')) {
        return await SettingModel.find({
          createdBy: context.userId,
          deletedAt: null,
        });
      }

      return []; // no access → empty list
    },

    setting: async (_: any, { id }: { id: string }, context: any) => {
      if (!context.userId) throw new Error('Not authenticated');

      const setting = await SettingModel.findById(id);
      if (!setting || setting.deletedAt) return null;

      // Admin may see any
      if (isAdmin(context)) {
        return setting;
      }

      // Non-admin: needs READ_SETTINGS and must be creator
      const owns = isSelf(context, setting.createdBy.toString());
      if (hasPermission(context, 'READ_SETTINGS') && owns) {
        return setting;
      }

      throw new Error('Access denied');
    },
  },

  Mutation: {
    createSetting: async (_: any, { input }: any, context: any) => {
      if (!context.userId) throw new Error('Not authenticated');

      const canCreate =
        isAdmin(context) || hasPermission(context, 'CREATE_SETTINGS');
      if (!canCreate) throw new Error('Access denied');

      const setting = new SettingModel({
        ...input,
        createdBy: context.userId,
      });

      return await setting.save();
    },

    updateSetting: async (_: any, { id, input }: any, context: any) => {
      if (!context.userId) throw new Error('Not authenticated');

      const existing = await SettingModel.findById(id);
      if (!existing || existing.deletedAt) throw new Error('Not found');

      // Admin may update any
      if (isAdmin(context)) {
        return await SettingModel.findByIdAndUpdate(
          id,
          { ...input, updatedBy: context.userId },
          { new: true }
        );
      }

      // Non-admin: needs UPDATE_SETTINGS and must be creator
      const owns = isSelf(context, existing.createdBy.toString());
      if (
        hasPermission(context, 'UPDATE_SETTINGS') &&
        owns
      ) {
        return await SettingModel.findByIdAndUpdate(
          id,
          { ...input, updatedBy: context.userId },
          { new: true }
        );
      }

      throw new Error('Access denied');
    },

    deleteSetting: async (_: any, { id }: { id: string }, context: any) => {
      if (!context.userId) throw new Error('Not authenticated');

      const existing = await SettingModel.findById(id);
      if (!existing || existing.deletedAt) throw new Error('Not found');

      // Admin may soft-delete any
      if (isAdmin(context)) {
        await SettingModel.findByIdAndUpdate(id, {
          deletedBy: context.userId,
          deletedAt: new Date(),
        });
        return true;
      }

      // Non-admin: needs DELETE_SETTINGS and must be creator
      const owns = isSelf(context, existing.createdBy.toString());
      if (
        hasPermission(context, 'DELETE_SETTINGS') &&
        owns
      ) {
        await SettingModel.findByIdAndUpdate(id, {
          deletedBy: context.userId,
          deletedAt: new Date(),
        });
        return true;
      }

      throw new Error('Access denied');
    },
  },

  Setting: {
    organization: async (parent: any) => {
      if (!Types.ObjectId.isValid(parent.organizationId)) return null;
      return await OrganizationModel.findById(parent.organizationId);
    },

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
