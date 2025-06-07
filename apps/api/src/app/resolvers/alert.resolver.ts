import { AlertModel } from '../models/alert.model';
import { OrganizationModel } from '../models/organization.model';
import { UserModel } from '../models/user.model';
import { isAdmin, hasPermission, isSelf } from '../utils/auth';

export const alertResolvers = {
  Query: {
    alerts: async (_: any, __: any, context: any) => {
      if (!context.userId) throw new Error('Not authenticated');

      if (isAdmin(context)) {
        return AlertModel.find({ deletedAt: { $exists: false } });
      }

      if (!hasPermission(context, 'READ_ALERT')) {
        return []; // No permission
      }

      return AlertModel.find({
        createdBy: context.userId,
        deletedAt: { $exists: false },
      });
    },

    alert: async (_: any, { id }: any, context: any) => {
      if (!context.userId) throw new Error('Not authenticated');

      const alert = await AlertModel.findOne({ _id: id, deletedAt: { $exists: false } });

      if (!alert) return null;

      if (isAdmin(context)) return alert;

      if (
        hasPermission(context, 'READ_ALERT') &&
        isSelf(context, alert.createdBy.toString())
      ) {
        return alert;
      }

      return null; // Not allowed
    },
  },

  Mutation: {
    createAlert: async (_: any, { input }: any, context: any) => {
      if (!context.userId) throw new Error('Not authenticated');
      if (!(isAdmin(context) || hasPermission(context, 'CREATE_ALERT'))) {
        throw new Error('Access denied');
      }

      const alert = new AlertModel({
        ...input,
        createdBy: context.userId,
      });

      return alert.save();
    },

    updateAlert: async (_: any, { id, input }: any, context: any) => {
      if (!context.userId) throw new Error('Not authenticated');

      const alert = await AlertModel.findOne({ _id: id, deletedAt: { $exists: false } });

      if (!alert) throw new Error('Alert not found');

      if (isAdmin(context)) {
        return AlertModel.findByIdAndUpdate(
          id,
          { ...input, updatedBy: context.userId },
          { new: true }
        );
      }

      if (
        hasPermission(context, 'UPDATE_ALERT') &&
        isSelf(context, alert.createdBy.toString())
      ) {
        return AlertModel.findByIdAndUpdate(
          id,
          { ...input, updatedBy: context.userId },
          { new: true }
        );
      }

      throw new Error('Access denied');
    },

    deleteAlert: async (_: any, { id }: any, context: any) => {
      if (!context.userId) throw new Error('Not authenticated');

      const alert = await AlertModel.findOne({ _id: id, deletedAt: { $exists: false } });

      if (!alert) throw new Error('Alert not found');

      if (isAdmin(context)) {
        await AlertModel.findByIdAndUpdate(id, {
          deletedAt: new Date(),
          deletedBy: context.userId,
        });
        return true;
      }

      if (
        hasPermission(context, 'DELETE_ALERT') &&
        isSelf(context, alert.createdBy.toString())
      ) {
        await AlertModel.findByIdAndUpdate(id, {
          deletedAt: new Date(),
          deletedBy: context.userId,
        });
        return true;
      }

      throw new Error('Access denied');
    },
  },

  Alert: {
    organization: async (parent) => {
      return await OrganizationModel.findById(parent.organizationId);
    },
    createdBy: async (parent) => {
      return await UserModel.findById(parent.createdBy);
    },
    updatedBy: async (parent) => {
      return parent.updatedBy ? await UserModel.findById(parent.updatedBy) : null;
    },
    deletedBy: async (parent) => {
      return parent.deletedBy ? await UserModel.findById(parent.deletedBy) : null;
    },
  },
};
