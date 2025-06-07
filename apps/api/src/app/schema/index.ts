import { userTypeDefs } from './user.typeDefs';
import { organizationTypeDefs } from './organization.typeDefs';
import { roleTypeDefs } from './role.typeDefs';
import { documentTypeDefs } from './document.typeDefs';
import { complianceRuleTypeDefs } from './compliance-rule.typedef';
import { violationTypeDefs } from './violation.typedef';
import { auditLogTypeDefs } from './audit-log.typeDefs';
import { riskScoreTypeDefs } from './risk-score.typeDefs';
import { taskTypeDefs } from './task.typeDefs';
import { alertTypeDefs } from './alert.typeDefs';
import { integrationTypeDefs } from './integration.typeDefs';
import { settingTypeDefs } from './setting.typeDefs';
import { permissionTypeDefs } from './permission.typeDefs';
import { mergeTypeDefs } from '@graphql-tools/merge';

export const typeDefs = mergeTypeDefs([
  userTypeDefs,
  organizationTypeDefs,
  roleTypeDefs,
  documentTypeDefs,
  complianceRuleTypeDefs,
  violationTypeDefs,
  auditLogTypeDefs,
  riskScoreTypeDefs,
  taskTypeDefs,
  alertTypeDefs,
  integrationTypeDefs,
  settingTypeDefs,
  permissionTypeDefs
]);
