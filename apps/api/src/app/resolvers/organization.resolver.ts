import { Types } from 'mongoose';
import { OrganizationModel } from '../models/organization.model';
import { UserModel } from '../models/user.model';
import { isAdmin, hasPermission, isSelf } from '../utils/auth';

export const organizationResolvers = {
  Query: {
    organizations: async (_: any, __: any, context: any) => {
      if (!context.userId) throw new Error('Not authenticated');

      // Admin: fetch all non-deleted
      // if (isAdmin(context)) {
      //   return await OrganizationModel.find({ deletedAt: null });
      // }

      // Non-admin: must have READ_ORGANIZATIONS and only own (createdBy)
      // if (hasPermission(context, 'READ_ORGANIZATIONS')) {
      //   return await OrganizationModel.find({
      //     createdBy: context.userId,
      //     deletedAt: null,
      //   });
      // }

      return await OrganizationModel.find({ deletedAt: null });

      return []; // no access → empty list
    },

    organization: async (_: any, { id }: { id: string }, context: any) => {
      if (!context.userId) throw new Error('Not authenticated');

      const org = await OrganizationModel.findById(id);
      if (!org || org.deletedAt) return null;

      // Admin may see any
      if (isAdmin(context)) {
        return org;
      }

      // Non-admin: needs READ_ORGANIZATIONS and must be creator
      const owns = isSelf(context, org.createdBy.toString());
      if (hasPermission(context, 'READ_ORGANIZATIONS') && owns) {
        return org;
      }

      throw new Error('Access denied');
    },
  },

  Mutation: {
    createOrganization: async (_: any, { input }: any, context: any) => {
      if (!context.userId) throw new Error('Not authenticated');

      const canCreate =
        isAdmin(context) || hasPermission(context, 'CREATE_ORGANIZATIONS');
      if (!canCreate) throw new Error('Access denied');

      const organization = new OrganizationModel({
        ...input,
        createdBy: context.userId,
      });

      return await organization.save();
    },

    updateOrganization: async (_: any, { id, input }: any, context: any) => {
      if (!context.userId) throw new Error('Not authenticated');

      const existing = await OrganizationModel.findById(id);
      if (!existing || existing.deletedAt) throw new Error('Not found');

      // Admin may update any
      if (isAdmin(context)) {
        return await OrganizationModel.findByIdAndUpdate(
          id,
          { ...input, updatedBy: context.userId },
          { new: true }
        );
      }

      // Non-admin: needs UPDATE_ORGANIZATIONS and must be creator
      const owns = isSelf(context, existing.createdBy.toString());
      if (
        hasPermission(context, 'UPDATE_ORGANIZATIONS') &&
        owns
      ) {
        return await OrganizationModel.findByIdAndUpdate(
          id,
          { ...input, updatedBy: context.userId },
          { new: true }
        );
      }

      throw new Error('Access denied');
    },

    deleteOrganization: async (_: any, { id }: any, context: any) => {
      if (!context.userId) throw new Error('Not authenticated');

      const existing = await OrganizationModel.findById(id);
      if (!existing || existing.deletedAt) throw new Error('Not found');

      // Admin may soft-delete any
      if (isAdmin(context)) {
        await OrganizationModel.findByIdAndUpdate(id, {
          deletedBy: context.userId,
          deletedAt: new Date(),
        });
        return true;
      }

      // Non-admin: needs DELETE_ORGANIZATIONS and must be creator
      const owns = isSelf(context, existing.createdBy.toString());
      if (
        hasPermission(context, 'DELETE_ORGANIZATIONS') &&
        owns
      ) {
        await OrganizationModel.findByIdAndUpdate(id, {
          deletedBy: context.userId,
          deletedAt: new Date(),
        });
        return true;
      }

      throw new Error('Access denied');
    },
  },

  Organization: {
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
