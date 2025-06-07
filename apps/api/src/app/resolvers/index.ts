import { userResolvers } from './user.resolver';
import { organizationResolvers } from './organization.resolver';
import { roleResolvers } from './role.resolver';
import { documentResolvers } from './document.resolver';
import { complianceRuleResolvers } from './compliance-rule.resolver';
import { violationResolvers } from './violation.resolver';
import { auditLogResolvers } from './audit-log.resolver';
import { riskScoreResolvers } from './risk-score.resolver';
import { taskResolvers } from './task.resolver';
import { alertResolvers } from './alert.resolver';
import { integrationResolvers } from './integration.resolver';
import { settingResolvers } from './setting.resolver';
import { permissionResolvers } from './permission.resolvers';
import { mergeResolvers } from '@graphql-tools/merge';


export const resolvers = mergeResolvers([
  userResolvers,
  organizationResolvers,
  roleResolvers,
  documentResolvers,
  complianceRuleResolvers,
  violationResolvers,
  auditLogResolvers,
  riskScoreResolvers,
  taskResolvers,
  alertResolvers,
  integrationResolvers,
  settingResolvers,
  permissionResolvers
]);
