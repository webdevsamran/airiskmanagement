import { Types } from 'mongoose';
import { IntegrationModel } from '../models/integration.model';
import { OrganizationModel } from '../models/organization.model';
import { UserModel } from '../models/user.model';
import { isAdmin, hasPermission, isSelf } from '../utils/auth';

export const integrationResolvers = {
  Query: {
    integrations: async (_: any, __: any, context: any) => {
      if (!context.userId) throw new Error('Not authenticated');

      // Admin may see all non-deleted integrations
      if (isAdmin(context)) {
        return await IntegrationModel.find({ deletedAt: null });
      }

      // Non-admin: must have READ_INTEGRATIONS and see only own (createdBy)
      if (hasPermission(context, 'READ_INTEGRATIONS')) {
        return await IntegrationModel.find({
          createdBy: context.userId,
          deletedAt: null,
        });
      }

      return []; // no access → empty list
    },

    integration: async (_: any, { id }: { id: string }, context: any) => {
      if (!context.userId) throw new Error('Not authenticated');

      const integration = await IntegrationModel.findById(id);
      if (!integration || integration.deletedAt) return null;

      // Admin may see any
      if (isAdmin(context)) {
        return integration;
      }

      // Non-admin: needs READ_INTEGRATIONS and must be creator
      const owns = isSelf(context, integration.createdBy.toString());
      if (hasPermission(context, 'READ_INTEGRATIONS') && owns) {
        return integration;
      }

      throw new Error('Access denied');
    },
  },

  Mutation: {
    createIntegration: async (_: any, { input }: any, context: any) => {
      if (!context.userId) throw new Error('Not authenticated');

      const canCreate =
        isAdmin(context) || hasPermission(context, 'CREATE_INTEGRATIONS');
      if (!canCreate) throw new Error('Access denied');

      const integration = new IntegrationModel({
        ...input,
        createdBy: context.userId,
      });

      return await integration.save();
    },

    updateIntegration: async (_: any, { id, input }: any, context: any) => {
      if (!context.userId) throw new Error('Not authenticated');

      const existing = await IntegrationModel.findById(id);
      if (!existing || existing.deletedAt) throw new Error('Not found');

      // Admin may update any
      if (isAdmin(context)) {
        return await IntegrationModel.findByIdAndUpdate(
          id,
          { ...input, updatedBy: context.userId },
          { new: true }
        );
      }

      // Non-admin: needs UPDATE_INTEGRATIONS and must be creator
      const owns = isSelf(context, existing.createdBy.toString());
      if (
        hasPermission(context, 'UPDATE_INTEGRATIONS') &&
        owns
      ) {
        return await IntegrationModel.findByIdAndUpdate(
          id,
          { ...input, updatedBy: context.userId },
          { new: true }
        );
      }

      throw new Error('Access denied');
    },

    deleteIntegration: async (_: any, { id }: { id: string }, context: any) => {
      if (!context.userId) throw new Error('Not authenticated');

      const existing = await IntegrationModel.findById(id);
      if (!existing || existing.deletedAt) throw new Error('Not found');

      // Admin may soft-delete any
      if (isAdmin(context)) {
        await IntegrationModel.findByIdAndUpdate(id, {
          deletedBy: context.userId,
          deletedAt: new Date(),
        });
        return true;
      }

      // Non-admin: needs DELETE_INTEGRATIONS and must be creator
      const owns = isSelf(context, existing.createdBy.toString());
      if (
        hasPermission(context, 'DELETE_INTEGRATIONS') &&
        owns
      ) {
        await IntegrationModel.findByIdAndUpdate(id, {
          deletedBy: context.userId,
          deletedAt: new Date(),
        });
        return true;
      }

      throw new Error('Access denied');
    },
  },

  Integration: {
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
