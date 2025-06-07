import { Types } from 'mongoose';
import { ComplianceRuleModel } from '../models/compliance-rule.model';
import { DocumentModel } from '../models/document.model';
import { OrganizationModel } from '../models/organization.model';
import { UserModel } from '../models/user.model';
import { ViolationModel } from '../models/violation.model';
import { isAdmin, hasPermission, isSelf } from '../utils/auth';

export const violationResolvers = {
  Query: {
    violations: async (_: any, __: any, context: any) => {
      if (!context.userId) throw new Error('Not authenticated');

      // Admin: fetch all non-deleted
      if (isAdmin(context)) {
        return await ViolationModel.find({ deletedAt: null });
      }

      // Non-admin: needs READ_VIOLATIONS and only own (createdBy)
      if (hasPermission(context, 'READ_VIOLATIONS')) {
        return await ViolationModel.find({
          createdBy: context.userId,
          deletedAt: null,
        });
      }

      return []; // no access → empty list
    },

    violation: async (_: any, { id }: { id: string }, context: any) => {
      if (!context.userId) throw new Error('Not authenticated');

      const violation = await ViolationModel.findById(id);
      if (!violation || violation.deletedAt) return null;

      // Admin may see any
      if (isAdmin(context)) {
        return violation;
      }

      // Non-admin: needs READ_VIOLATIONS and must be creator
      const owns = isSelf(context, violation.createdBy.toString());
      if (hasPermission(context, 'READ_VIOLATIONS') && owns) {
        return violation;
      }

      throw new Error('Access denied');
    },
  },

  Mutation: {
    createViolation: async (_: any, { input }: any, context: any) => {
      if (!context.userId) throw new Error('Not authenticated');

      const canCreate =
        isAdmin(context) || hasPermission(context, 'CREATE_VIOLATIONS');
      if (!canCreate) throw new Error('Access denied');

      const violation = new ViolationModel({
        ...input,
        createdBy: context.userId,
      });

      return await violation.save();
    },

    updateViolation: async (
      _: any,
      { id, status, resolutionNote }: any,
      context: any
    ) => {
      if (!context.userId) throw new Error('Not authenticated');

      const existing = await ViolationModel.findById(id);
      if (!existing || existing.deletedAt) throw new Error('Not found');

      // Admin may update any
      if (isAdmin(context)) {
        return await ViolationModel.findByIdAndUpdate(
          id,
          { status, resolutionNote, updatedBy: context.userId },
          { new: true }
        );
      }

      // Non-admin: needs UPDATE_VIOLATIONS and must be creator
      const owns = isSelf(context, existing.createdBy.toString());
      if (
        hasPermission(context, 'UPDATE_VIOLATIONS') &&
        owns
      ) {
        return await ViolationModel.findByIdAndUpdate(
          id,
          { status, resolutionNote, updatedBy: context.userId },
          { new: true }
        );
      }

      throw new Error('Access denied');
    },

    deleteViolation: async (_: any, { id }: { id: string }, context: any) => {
      if (!context.userId) throw new Error('Not authenticated');

      const existing = await ViolationModel.findById(id);
      if (!existing || existing.deletedAt) throw new Error('Not found');

      // Admin may soft-delete any
      if (isAdmin(context)) {
        await ViolationModel.findByIdAndUpdate(id, {
          deletedBy: context.userId,
          deletedAt: new Date(),
        });
        return true;
      }

      // Non-admin: needs DELETE_VIOLATIONS and must be creator
      const owns = isSelf(context, existing.createdBy.toString());
      if (
        hasPermission(context, 'DELETE_VIOLATIONS') &&
        owns
      ) {
        await ViolationModel.findByIdAndUpdate(id, {
          deletedBy: context.userId,
          deletedAt: new Date(),
        });
        return true;
      }

      throw new Error('Access denied');
    },
  },

  Violation: {
    organization: async (parent: any) => {
      if (!Types.ObjectId.isValid(parent.organizationId)) return null;
      return await OrganizationModel.findById(parent.organizationId);
    },
    rule: async (parent: any) => {
      if (!Types.ObjectId.isValid(parent.ruleId)) return null;
      return await ComplianceRuleModel.findById(parent.ruleId);
    },
    document: async (parent: any) => {
      if (!Types.ObjectId.isValid(parent.documentId)) return null;
      return await DocumentModel.findById(parent.documentId);
    },
    triggeredByUser: async (parent: any) => {
      if (!Types.ObjectId.isValid(parent.triggeredBy)) return null;
      return await UserModel.findById(parent.triggeredBy);
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
