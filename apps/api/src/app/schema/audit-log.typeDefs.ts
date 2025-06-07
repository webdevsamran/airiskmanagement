import { gql } from 'apollo-server';

export const auditLogTypeDefs = gql`
  scalar JSON

  type Organization {
    _id: ID!
    name: String!
    industry: String!
    domain: String!
    tier: String!
    regulatoryFrameworks: [String!]!
    createdAt: String!
    updatedAt: String!
  }

  type User {
    _id: ID!
    name: String!
    email: String!
    passwordHash: String!
    roleId: String!
    organizationId: ID!
    lastLoginAt: String
    createdAt: String!
    updatedAt: String!
  }

  type AuditLog {
  _id: ID!
  organizationId: ID!
  userId: ID!
  action: String!
  resource: String!
  resourceId: ID!
  ipAddress: String!
  userAgent: String!
  metadata: JSON
  timestamp: String!
  createdAt: String!
  updatedAt: String!
  deletedAt: String
  createdBy: ID!
  updatedBy: ID
  deletedBy: ID
  organization: Organization
  user: User
}

input AuditLogInput {
  organizationId: ID!
  userId: ID!
  action: String!
  resource: String!
  resourceId: ID!
  ipAddress: String!
  userAgent: String!
  metadata: JSON
  timestamp: String
}

input AuditLogUpdateInput {
  organizationId: ID
  userId: ID
  action: String
  resource: String
  resourceId: ID
  ipAddress: String
  userAgent: String
  metadata: JSON
  timestamp: String
}

  type Query {
    auditLogs: [AuditLog!]!
    auditLog(id: ID!): AuditLog
  }

  type Mutation {
    createAuditLog(input: AuditLogInput!): AuditLog!
    updateAuditLog(id: ID!, input: AuditLogUpdateInput!): AuditLog!
    deleteAuditLog(id: ID!): Boolean!
  }
`;
