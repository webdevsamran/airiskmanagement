import { Types } from 'mongoose';
import { UserModel } from '../models/user.model';
import { BlacklistedTokenModel } from '../models/blacklisted-token.model';
import { OrganizationModel } from '../models/organization.model';
import { RoleModel } from '../models/role.model';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { isAdmin, hasPermission, isSelf } from '../utils/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const createToken = (user: any) =>
  jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });

export const userResolvers = {
  Query: {
    users: async (_: any, __: any, context: any) => {
      if (!context.userId) throw new Error('Not authenticated');

      // Admin may fetch all non‐deleted users
      if (isAdmin(context)) {
        return await UserModel.find({ deletedAt: null });
      }

      // Non‐admin: needs READ_USER and only own (createdBy)
      if (hasPermission(context, 'READ_USER')) {
        return await UserModel.find({
          createdBy: context.userId,
          deletedAt: null,
        });
      }

      return []; // no access → empty list
    },

    user: async (_: any, { id }: { id: string }, context: any) => {
      if (!context.userId) throw new Error('Not authenticated');

      const user = await UserModel.findById(id);
      if (!user || user.deletedAt) return null;

      // Admin may see any
      if (isAdmin(context)) {
        return user;
      }

      // Non‐admin: needs READ_USER and must be creator or self
      const owns = isSelf(context, user.createdBy.toString());
      if (hasPermission(context, 'READ_USER') && owns) {
        return user;
      }
      if (isSelf(context, id)) {
        return user; // Also allow looking up own record
      }

      throw new Error('Access denied');
    },

    me: async (_: any, __: any, context: any) => {
      if (!context.userId) throw new Error('Not authenticated');

      const me = await UserModel.findById(context.userId);
      if (!me || me.deletedAt) return null;
      return me;
    },
  },

  Mutation: {
    createUser: async (_: any, args: any, context: any) => {
      // If no context.userId, treat as “signup” (public):
      if (!context.userId) {
        // PUBLIC SIGNUP - no permission check
      } else {
        // Already logged in → require admin or CREATE_USER permission
        if (
          !(isAdmin(context) || hasPermission(context, 'CREATE_USER'))
        ) {
          throw new Error('Access denied');
        }
      }

      const existing = await UserModel.findOne({ email: args.email });
      if (existing) throw new Error('Email already in use');

      const passwordHash = await bcrypt.hash(args.passwordHash, 10);
      const toSave: any = {
        email: args.email,
        fullName: args.fullName,
        passwordHash,
        roleId: args.roleId,
        organizationId: args.organizationId,
        // Audit: if signup, after saving we’ll set createdBy; if admin‐create, createdBy = context.userId
      };

      const newUser = new UserModel({
        ...toSave,
        createdBy: context.userId || null, // temporarily null if signup
      });

      await newUser.save();

      return newUser;
    },

    updateUser: async (_: any, { id, ...updates }: any, context: any) => {
      if (!context.userId) throw new Error('Not authenticated');

      const existing = await UserModel.findById(id);
      if (!existing || existing.deletedAt) throw new Error('Not found');

      // Admin may update any
      if (isAdmin(context)) {
        return await UserModel.findByIdAndUpdate(
          id,
          { ...updates, updatedBy: context.userId },
          { new: true }
        );
      }

      // Non‐admin: needs UPDATE_USER and must be creator or self
      const owns = isSelf(context, existing.createdBy.toString());
      if (
        hasPermission(context, 'UPDATE_USER') &&
        owns
      ) {
        return await UserModel.findByIdAndUpdate(
          id,
          { ...updates, updatedBy: context.userId },
          { new: true }
        );
      }
      if (isSelf(context, id) && !updates.roleId && !updates.organizationId) {
        // allow self to update only non‐privileged fields
        return await UserModel.findByIdAndUpdate(
          id,
          { ...updates, updatedBy: context.userId },
          { new: true }
        );
      }

      throw new Error('Access denied');
    },

    deleteUser: async (_: any, { id }: { id: string }, context: any) => {
      if (!context.userId) throw new Error('Not authenticated');

      const existing = await UserModel.findById(id);
      if (!existing || existing.deletedAt) throw new Error('Not found');

      // Admin may soft‐delete any
      if (isAdmin(context)) {
        await UserModel.findByIdAndUpdate(id, {
          deletedBy: context.userId,
          deletedAt: new Date(),
        });
        return true;
      }

      // Non‐admin: needs DELETE_USER and must be creator or self
      const owns = isSelf(context, existing.createdBy.toString());
      if (
        hasPermission(context, 'DELETE_USER') &&
        owns
      ) {
        await UserModel.findByIdAndUpdate(id, {
          deletedBy: context.userId,
          deletedAt: new Date(),
        });
        return true;
      }
      if (isSelf(context, id)) {
        // allow self‐deletion
        await UserModel.findByIdAndUpdate(id, {
          deletedBy: context.userId,
          deletedAt: new Date(),
        });
        return true;
      }

      throw new Error('Access denied');
    },

    login: async (_: any, { email, password }: any) => {
      console.log('Login attempt for:', email);
      const user = await UserModel.findOne({ email });
      if (!user || user.deletedAt) throw new Error('User not found');

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) throw new Error('Invalid credentials');

      user.lastLoginAt = new Date();
      await user.save();

      let role = null;
      let permissions = [];

      if (user.roleId) {
        const populatedRole = await RoleModel.findById(user.roleId)
          .populate('permissions')
          .lean();

        if (populatedRole) {
          role = {
            _id: populatedRole._id.toString(),
            name: populatedRole.name,
            createdAt: populatedRole.createdAt,
            updatedAt: populatedRole.updatedAt,
            permissions: (populatedRole.permissions || []).map((perm: any) => ({
              _id: perm._id.toString(),
              name: perm.name,
              createdAt: perm.createdAt,
              updatedAt: perm.updatedAt,
            })),
          };

          permissions = role.permissions;
        }
      }

      return {
        token: createToken(user),
        user,
        role,
        permissions,
      };
    },

    logout: async (_: any, __: any, context: any) => {
      const token = context.token;
      if (!token) return true;
      try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        await BlacklistedTokenModel.create({
          token,
          expiresAt: new Date(decoded.exp * 1000),
        });
        return true;
      } catch {
        return false;
      }
    },
  },

  User: {
    organization: async (parent: any) => {
      if (!Types.ObjectId.isValid(parent.organizationId)) return null;
      return await OrganizationModel.findById(parent.organizationId);
    },
    role: async (parent: any) => {
      if (!Types.ObjectId.isValid(parent.roleId)) return null;
      return await RoleModel.findById(parent.roleId);
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
