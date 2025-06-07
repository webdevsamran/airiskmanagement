import { Types } from 'mongoose';
import { TaskModel } from '../models/task.model';
import { UserModel } from '../models/user.model';
import { ViolationModel } from '../models/violation.model';
import { isAdmin, hasPermission, isSelf } from '../utils/auth';

export const taskResolvers = {
  Query: {
    tasks: async (_: any, __: any, context: any) => {
      if (!context.userId) throw new Error('Not authenticated');

      // Admin: fetch all non-deleted tasks
      if (isAdmin(context)) {
        return await TaskModel.find({ deletedAt: null });
      }

      // Non-admin: needs READ_TASKS and only own (createdBy)
      if (hasPermission(context, 'READ_TASKS')) {
        return await TaskModel.find({
          createdBy: context.userId,
          deletedAt: null,
        });
      }

      return []; // no access → empty list
    },

    task: async (_: any, { id }: { id: string }, context: any) => {
      if (!context.userId) throw new Error('Not authenticated');

      const task = await TaskModel.findById(id);
      if (!task || task.deletedAt) return null;

      // Admin may see any
      if (isAdmin(context)) {
        return task;
      }

      // Non-admin: needs READ_TASKS and must be creator
      const owns = isSelf(context, task.createdBy.toString());
      if (hasPermission(context, 'READ_TASKS') && owns) {
        return task;
      }

      throw new Error('Access denied');
    },
  },

  Mutation: {
    createTask: async (_: any, { input }: any, context: any) => {
      if (!context.userId) throw new Error('Not authenticated');

      const canCreate =
        isAdmin(context) || hasPermission(context, 'CREATE_TASKS');
      if (!canCreate) throw new Error('Access denied');

      const task = new TaskModel({
        ...input,
        createdBy: context.userId,
      });

      return await task.save();
    },

    updateTask: async (_: any, { id, input }: any, context: any) => {
      if (!context.userId) throw new Error('Not authenticated');

      const existing = await TaskModel.findById(id);
      if (!existing || existing.deletedAt) throw new Error('Not found');

      // Admin may update any
      if (isAdmin(context)) {
        return await TaskModel.findByIdAndUpdate(
          id,
          { ...input, updatedBy: context.userId },
          { new: true }
        );
      }

      // Non-admin: needs UPDATE_TASKS and must be creator
      const owns = isSelf(context, existing.createdBy.toString());
      if (
        hasPermission(context, 'UPDATE_TASKS') &&
        owns
      ) {
        return await TaskModel.findByIdAndUpdate(
          id,
          { ...input, updatedBy: context.userId },
          { new: true }
        );
      }

      throw new Error('Access denied');
    },

    deleteTask: async (_: any, { id }: { id: string }, context: any) => {
      if (!context.userId) throw new Error('Not authenticated');

      const existing = await TaskModel.findById(id);
      if (!existing || existing.deletedAt) throw new Error('Not found');

      // Admin may soft-delete any
      if (isAdmin(context)) {
        await TaskModel.findByIdAndUpdate(id, {
          deletedBy: context.userId,
          deletedAt: new Date(),
        });
        return true;
      }

      // Non-admin: needs DELETE_TASKS and must be creator
      const owns = isSelf(context, existing.createdBy.toString());
      if (
        hasPermission(context, 'DELETE_TASKS') &&
        owns
      ) {
        await TaskModel.findByIdAndUpdate(id, {
          deletedBy: context.userId,
          deletedAt: new Date(),
        });
        return true;
      }

      throw new Error('Access denied');
    },
  },

  Task: {
    violation: async (parent: any) => {
      if (!Types.ObjectId.isValid(parent.violationId)) return null;
      return await ViolationModel.findById(parent.violationId);
    },
    assignee: async (parent: any) => {
      if (!Types.ObjectId.isValid(parent.assignedTo)) return null;
      return await UserModel.findById(parent.assignedTo);
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
