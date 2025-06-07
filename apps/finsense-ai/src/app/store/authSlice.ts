import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './index';

interface Permission {
  _id: string;
  name: string;
}

interface Role {
  _id: string;
  name: string;
  permissions: Permission[];
}

interface User {
  _id: string;
  fullName: string;
  email: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  role: Role | null;
  permissions: Permission[];
}

const initialState: AuthState = {
  token: null,
  user: null,
  role: null,
  permissions: [],
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        token: string;
        user: User;
        role: Role;
        permissions: Permission[];
      }>
    ) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.role = action.payload.role;
      state.permissions = action.payload.permissions;
    },
    clearCredentials: (state) => {
      state.token = null;
      state.user = null;
      state.role = null;
      state.permissions = [];
    },
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;

export const selectIsAdmin = (state: RootState): boolean => {
  return state.auth.role?.name === 'Admin';
};

export const selectHasPermission =
  (permissionName: string) =>
  (state: RootState): boolean => {
    return state.auth.permissions.some((perm) => perm.name === permissionName);
};

export default authSlice.reducer;
