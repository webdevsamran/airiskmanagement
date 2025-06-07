import { Types } from 'mongoose';
import { ComplianceRuleModel } from '../models/compliance-rule.model';
import { OrganizationModel } from '../models/organization.model';
import { UserModel } from '../models/user.model';
import { isAdmin, hasPermission, isSelf } from '../utils/auth';

export const complianceRuleResolvers = {
  Query: {
    complianceRules: async (_: any, __: any, context: any) => {
      if (!context.userId) throw new Error('Not authenticated');

      // Admin can see all non-deleted rules
      if (isAdmin(context)) {
        return ComplianceRuleModel.find({ deletedAt: null });
      }

      // Non-admin: must have READ_COMPLIANCE_RULE and only see own (createdBy)
      if (hasPermission(context, 'READ_COMPLIANCE_RULE')) {
        return ComplianceRuleModel.find({
          createdBy: context.userId,
          deletedAt: null,
        });
      }

      // No access → return empty list
      return [];
    },

    complianceRule: async (_: any, { id }: any, context: any) => {
      if (!context.userId) throw new Error('Not authenticated');

      // Fetch the rule regardless of deletion; we’ll check below
      const rule = await ComplianceRuleModel.findById(id);
      if (!rule || rule.deletedAt) return null;

      // Admin can see it
      if (isAdmin(context)) {
        return rule;
      }

      // Non-admin must have permission AND be the creator
      if (
        hasPermission(context, 'READ_COMPLIANCE_RULE') &&
        isSelf(context, rule.createdBy.toString())
      ) {
        return rule;
      }

      throw new Error('Access denied');
    },
  },

  Mutation: {
    createComplianceRule: async (_: any, args: any, context: any) => {
      if (!context.userId) throw new Error('Not authenticated');

      const canCreate =
        isAdmin(context) || hasPermission(context, 'CREATE_COMPLIANCE_RULE');
      if (!canCreate) throw new Error('Access denied');

      const rule = new ComplianceRuleModel({
        ...args,
        createdBy: context.userId,
      });

      return await rule.save();
    },

    updateComplianceRule: async (_: any, { id, ...updates }: any, context: any) => {
      if (!context.userId) throw new Error('Not authenticated');

      const existing = await ComplianceRuleModel.findById(id);
      if (!existing || existing.deletedAt) throw new Error('Not found');

      // Admin can update any
      if (isAdmin(context)) {
        return ComplianceRuleModel.findByIdAndUpdate(
          id,
          { ...updates, updatedBy: context.userId },
          { new: true }
        );
      }

      // Non-admin: needs UPDATE_COMPLIANCE_RULE and must be the creator
      if (
        hasPermission(context, 'UPDATE_COMPLIANCE_RULE') &&
        isSelf(context, existing.createdBy.toString())
      ) {
        return ComplianceRuleModel.findByIdAndUpdate(
          id,
          { ...updates, updatedBy: context.userId },
          { new: true }
        );
      }

      throw new Error('Access denied');
    },

    deleteComplianceRule: async (_: any, { id }: any, context: any) => {
      if (!context.userId) throw new Error('Not authenticated');

      const existing = await ComplianceRuleModel.findById(id);
      if (!existing || existing.deletedAt) throw new Error('Not found');

      // Admin can soft-delete any
      if (isAdmin(context)) {
        await ComplianceRuleModel.findByIdAndUpdate(id, {
          deletedBy: context.userId,
          deletedAt: new Date(),
        });
        return true;
      }

      // Non-admin: needs DELETE_COMPLIANCE_RULE and must be creator
      if (
        hasPermission(context, 'DELETE_COMPLIANCE_RULE') &&
        isSelf(context, existing.createdBy.toString())
      ) {
        await ComplianceRuleModel.findByIdAndUpdate(id, {
          deletedBy: context.userId,
          deletedAt: new Date(),
        });
        return true;
      }

      throw new Error('Access denied');
    },
  },

  ComplianceRule: {
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
