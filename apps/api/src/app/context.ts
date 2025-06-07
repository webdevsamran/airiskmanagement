import jwt from 'jsonwebtoken';
import { Request } from 'express';
import { BlacklistedTokenModel } from './models/blacklisted-token.model';
import { UserModel } from './models/user.model';
import { RoleModel } from './models/role.model';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

export const createContext = async ({ req }: { req: Request }) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  let userId = null;
  let role = null;
  let permissions = [];

  if (token) {
    const isBlacklisted = await BlacklistedTokenModel.findOne({ token });
    if (isBlacklisted) {
      throw new Error('Token is blacklisted. Please login again.');
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      userId = decoded.id;

      // Fetch user
      const user = await UserModel.findById(userId).lean();
      if (!user) throw new Error('User not found');

      // Fetch role and permissions
      if (user.roleId) {
        const populatedRole = await RoleModel.findById(user.roleId)
          .populate('permissions') // Assuming `permissions` in Role is `ref: 'Permission'`
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
    } catch (err) {
      console.error('Auth error:', err);
      throw new Error('Invalid or expired token');
    }
  }

  return {
    userId,
    token,
    role, // Fully populated Role including permissions
    permissions, // Flattened array of permissions for convenience
  };
};
