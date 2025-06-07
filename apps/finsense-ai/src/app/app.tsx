// apps/finsense-ai/src/app/app.tsx
import React from 'react';
import { Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import { Button, Flex } from '@chakra-ui/react';
import { useSelector } from 'react-redux';

// pages
import Login from './pages/Login';
import Signup from './pages/Signup';

// context / auth
import { useAuth } from './auth-context';

// redux selectors
import {
  selectIsAdmin,
  selectHasPermission,
} from './store/authSlice';

// components / lists
import OrganizationList from './components/OrganizationList';
import { PermissionList } from './components/PermissionList';
import { RoleList } from './components/RoleList';
import { UserList } from './components/UserList';
import { AlertList } from './components/AlertList';
import { SettingList } from './components/SettingList';
import { IntegrationList } from './components/IntegrationList';
import { ComplianceRuleList } from './components/ComplianceRuleList';
import { AuditLogList } from './components/AuditLogList';
import { DocumentList } from './components/DocumentList';
import { RiskScoreList } from './components/RiskScoreList';
import { ViolationList } from './components/ViolationList';
import { TaskList } from './components/TaskList';

export function App() {
  const auth = useAuth();
  const navigate = useNavigate();

  const token = auth?.token;
  const logout = auth?.logout;

  // ------------------------------------
  // Grab “isAdmin” and all the READ_* flags:
  // ------------------------------------
  const isAdmin = useSelector(selectIsAdmin);

  const canReadOrganizations = useSelector(
    selectHasPermission('READ_ORGANIZATIONS')
  );
  const canReadPermissions = useSelector(
    selectHasPermission('READ_PERMISSIONS')
  );
  const canReadRoles = useSelector(selectHasPermission('READ_ROLES'));
  const canReadUsers = useSelector(selectHasPermission('READ_USER'));
  const canReadAlerts = useSelector(selectHasPermission('READ_ALERT'));
  const canReadSettings = useSelector(selectHasPermission('READ_SETTINGS'));
  const canReadIntegrations = useSelector(
    selectHasPermission('READ_INTEGRATIONS')
  );
  const canReadComplianceRules = useSelector(
    selectHasPermission('READ_COMPLIANCE_RULE')
  );
  const canReadAuditLogs = useSelector(
    selectHasPermission('READ_AUDIT_LOG')
  );
  const canReadDocuments = useSelector(selectHasPermission('READ_DOCUMENTS'));
  const canReadRiskScores = useSelector(
    selectHasPermission('READ_RISK_SCORES')
  );
  const canReadViolations = useSelector(
    selectHasPermission('READ_VIOLATIONS')
  );
  const canReadTasks = useSelector(selectHasPermission('READ_TASKS'));

  return (
    <div>
      <Flex justify="space-between" align="center" p={4} bg="gray.100">
        <Flex gap={4}>
          <Link to="/">Home</Link>

          {!token && (
            <>
              <Link to="/login">Login</Link>
              <Link to="/signup">Signup</Link>
            </>
          )}

          {token && (
            <>
              {/* Only show “Organizations” if Admin OR has READ_ORGANIZATIONS */}
              {(isAdmin || canReadOrganizations) && (
                <Link to="/organizations">Organizations</Link>
              )}

              {/* Only show “Permissions” if Admin OR has READ_PERMISSIONS */}
              {(isAdmin || canReadPermissions) && (
                <Link to="/permissions">Permissions</Link>
              )}

              {/* Only show “Roles” if Admin OR has READ_ROLES */}
              {(isAdmin || canReadRoles) && <Link to="/roles">Roles</Link>}

              {/* Only show “Users” if Admin OR has READ_USER */}
              {(isAdmin || canReadUsers) && <Link to="/users">Users</Link>}

              {/* Only show “Alerts” if Admin OR has READ_ALERT */}
              {(isAdmin || canReadAlerts) && <Link to="/alerts">Alerts</Link>}

              {/* Only show “Settings” if Admin OR has READ_SETTINGS */}
              {(isAdmin || canReadSettings) && (
                <Link to="/settings">Settings</Link>
              )}

              {/* Only show “Integrations” if Admin OR has READ_INTEGRATIONS */}
              {(isAdmin || canReadIntegrations) && (
                <Link to="/integrations">Integrations</Link>
              )}

              {/* Only show “Rules” if Admin OR has READ_COMPLIANCE_RULE */}
              {(isAdmin || canReadComplianceRules) && (
                <Link to="/rules">Rules</Link>
              )}

              {/* Only show “Audits” if Admin OR has READ_AUDIT_LOG */}
              {(isAdmin || canReadAuditLogs) && (
                <Link to="/audits">Audits</Link>
              )}

              {/* Only show “Documents” if Admin OR has READ_DOCUMENTS */}
              {(isAdmin || canReadDocuments) && (
                <Link to="/documents">Documents</Link>
              )}

              {/* Only show “Risk Score” if Admin OR has READ_RISK_SCORES */}
              {(isAdmin || canReadRiskScores) && (
                <Link to="/risk-scores">Risk Score</Link>
              )}

              {/* Only show “Violations” if Admin OR has READ_VIOLATIONS */}
              {(isAdmin || canReadViolations) && (
                <Link to="/violations">Violations</Link>
              )}

              {/* Only show “Tasks” if Admin OR has READ_TASKS */}
              {(isAdmin || canReadTasks) && <Link to="/tasks">Tasks</Link>}
            </>
          )}
        </Flex>

        {token && (
          <Button
            onClick={() => {
              logout();
              navigate('/login');
            }}
          >
            Logout
          </Button>
        )}
      </Flex>

      <Routes>
        <Route path="/" element={<div>Welcome to Finsense AI</div>} />

        <Route
          path="/login"
          element={!token ? <Login /> : <Navigate to="/" replace />}
        />
        <Route
          path="/signup"
          element={!token ? <Signup /> : <Navigate to="/" replace />}
        />

        {token && (
          <>
            {/* Only register the route if Admin OR has READ_ORGANIZATIONS */}
            {(isAdmin || canReadOrganizations) && (
              <Route path="/organizations" element={<OrganizationList />} />
            )}

            {/* Only register if Admin OR has READ_PERMISSIONS */}
            {(isAdmin || canReadPermissions) && (
              <Route path="/permissions" element={<PermissionList />} />
            )}

            {/* Only register if Admin OR has READ_ROLES */}
            {(isAdmin || canReadRoles) && (
              <Route path="/roles" element={<RoleList />} />
            )}

            {/* Only register if Admin OR has READ_USER */}
            {(isAdmin || canReadUsers) && (
              <Route path="/users" element={<UserList />} />
            )}

            {/* Only register if Admin OR has READ_ALERT */}
            {(isAdmin || canReadAlerts) && (
              <Route path="/alerts" element={<AlertList />} />
            )}

            {/* Only register if Admin OR has READ_SETTINGS */}
            {(isAdmin || canReadSettings) && (
              <Route path="/settings" element={<SettingList />} />
            )}

            {/* Only register if Admin OR has READ_INTEGRATIONS */}
            {(isAdmin || canReadIntegrations) && (
              <Route path="/integrations" element={<IntegrationList />} />
            )}

            {/* Only register if Admin OR has READ_COMPLIANCE_RULE */}
            {(isAdmin || canReadComplianceRules) && (
              <Route
                path="/rules"
                element={<ComplianceRuleList />}
              />
            )}

            {/* Only register if Admin OR has READ_AUDIT_LOG */}
            {(isAdmin || canReadAuditLogs) && (
              <Route path="/audits" element={<AuditLogList />} />
            )}

            {/* Only register if Admin OR has READ_DOCUMENTS */}
            {(isAdmin || canReadDocuments) && (
              <Route path="/documents" element={<DocumentList />} />
            )}

            {/* Only register if Admin OR has READ_RISK_SCORES */}
            {(isAdmin || canReadRiskScores) && (
              <Route path="/risk-scores" element={<RiskScoreList />} />
            )}

            {/* Only register if Admin OR has READ_VIOLATIONS */}
            {(isAdmin || canReadViolations) && (
              <Route path="/violations" element={<ViolationList />} />
            )}

            {/* Only register if Admin OR has READ_TASKS */}
            {(isAdmin || canReadTasks) && (
              <Route path="/tasks" element={<TaskList />} />
            )}
          </>
        )}
      </Routes>
    </div>
  );
}

export default App;
