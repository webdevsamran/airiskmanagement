import { Types } from 'mongoose';
import { DocumentModel } from '../models/document.model';
import { OrganizationModel } from '../models/organization.model';
import { RiskScoreModel } from '../models/risk-score.model';
import { UserModel } from '../models/user.model';
import { isAdmin, hasPermission, isSelf } from '../utils/auth';

export const riskScoreResolvers = {
  Query: {
    riskScores: async (_: any, __: any, context: any) => {
      if (!context.userId) throw new Error('Not authenticated');

      // Admin: fetch all non-deleted
      if (isAdmin(context)) {
        return await RiskScoreModel.find({ deletedAt: null });
      }

      // Non-admin: needs READ_RISK_SCORES and then only own (createdBy)
      if (hasPermission(context, 'READ_RISK_SCORES')) {
        return await RiskScoreModel.find({
          createdBy: context.userId,
          deletedAt: null,
        });
      }

      return []; // no access → empty list
    },

    riskScore: async (_: any, { id }: { id: string }, context: any) => {
      if (!context.userId) throw new Error('Not authenticated');

      const rs = await RiskScoreModel.findById(id);
      if (!rs || rs.deletedAt) return null;

      // Admin may see any
      if (isAdmin(context)) {
        return rs;
      }

      // Non-admin: needs READ_RISK_SCORES and must be creator
      const owns = isSelf(context, rs.createdBy.toString());
      if (hasPermission(context, 'READ_RISK_SCORES') && owns) {
        return rs;
      }

      throw new Error('Access denied');
    },
  },

  Mutation: {
    createRiskScore: async (_: any, { input }: any, context: any) => {
      if (!context.userId) throw new Error('Not authenticated');

      const canCreate =
        isAdmin(context) || hasPermission(context, 'CREATE_RISK_SCORES');
      if (!canCreate) throw new Error('Access denied');

      // If no calculatedAt provided, set now
      const calculatedAt =
        input.calculatedAt !== undefined ? new Date(input.calculatedAt) : new Date();

      const rs = new RiskScoreModel({
        ...input,
        calculatedAt,
        createdBy: context.userId,
      });

      return await rs.save();
    },

    updateRiskScore: async (_: any, { id, input }: any, context: any) => {
      if (!context.userId) throw new Error('Not authenticated');

      const existing = await RiskScoreModel.findById(id);
      if (!existing || existing.deletedAt) throw new Error('Not found');

      // Admin may update any
      if (isAdmin(context)) {
        return await RiskScoreModel.findByIdAndUpdate(
          id,
          { ...input, updatedBy: context.userId },
          { new: true }
        );
      }

      // Non-admin: needs UPDATE_RISK_SCORES and must be creator
      const owns = isSelf(context, existing.createdBy.toString());
      if (
        hasPermission(context, 'UPDATE_RISK_SCORES') &&
        owns
      ) {
        return await RiskScoreModel.findByIdAndUpdate(
          id,
          { ...input, updatedBy: context.userId },
          { new: true }
        );
      }

      throw new Error('Access denied');
    },

    deleteRiskScore: async (_: any, { id }: { id: string }, context: any) => {
      if (!context.userId) throw new Error('Not authenticated');

      const existing = await RiskScoreModel.findById(id);
      if (!existing || existing.deletedAt) throw new Error('Not found');

      // Admin may soft-delete any
      if (isAdmin(context)) {
        await RiskScoreModel.findByIdAndUpdate(id, {
          deletedBy: context.userId,
          deletedAt: new Date(),
        });
        return true;
      }

      // Non-admin: needs DELETE_RISK_SCORES and must be creator
      const owns = isSelf(context, existing.createdBy.toString());
      if (
        hasPermission(context, 'DELETE_RISK_SCORES') &&
        owns
      ) {
        await RiskScoreModel.findByIdAndUpdate(id, {
          deletedBy: context.userId,
          deletedAt: new Date(),
        });
        return true;
      }

      throw new Error('Access denied');
    },
  },

  RiskScore: {
    organization: async (parent: any) => {
      if (!Types.ObjectId.isValid(parent.organizationId)) return null;
      return await OrganizationModel.findById(parent.organizationId);
    },
    document: async (parent: any) => {
      if (!parent.documentId || !Types.ObjectId.isValid(parent.documentId)) return null;
      return await DocumentModel.findById(parent.documentId);
    },
    user: async (parent: any) => {
      if (!parent.userId || !Types.ObjectId.isValid(parent.userId)) return null;
      return await UserModel.findById(parent.userId);
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
