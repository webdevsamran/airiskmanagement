import { createContext, useContext, ReactNode } from 'react';
import { gql, useApolloClient } from '@apollo/client';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { setCredentials, clearCredentials } from './store/authSlice';

const LOGOUT_MUTATION = gql`
  mutation {
    logout
  }
`;

interface AuthContextType {
  token: string | null;
  user: any;
  role: any;
  permissions: any[];
  login: (token: string, user: any, role: any, permissions: any[]) => void;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const dispatch = useAppDispatch();
  const apolloClient = useApolloClient();
  const { token, user, role, permissions } = useAppSelector((state) => state.auth);

  const login = (token: string, user: any, role: any, permissions: any[]) => {
    localStorage.setItem('token', token);
    dispatch(setCredentials({ token, user, role, permissions }));
  };

  const logout = async () => {
    try {
      if (token) {
        await apolloClient.mutate({
          mutation: LOGOUT_MUTATION,
          context: {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        });
      }
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      localStorage.removeItem('token');
      dispatch(clearCredentials());
      await apolloClient.clearStore();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        role,
        permissions,
        login,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
