import { gql } from 'apollo-server';

export const violationTypeDefs = gql`
  enum ViolationSeverity {
    low
    medium
    high
    critical
  }

  enum ViolationStatus {
    open
    in_review
    resolved
  }

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

  type ComplianceRule {
    _id: ID!
    organizationId: ID!
    name: String!
    description: String
    category: ComplianceCategory!
    severity: ComplianceSeverity!
    logic: ComplianceLogic!
    enabled: Boolean!
    createdBy: ID!
    createdAt: String!
    updatedAt: String!
  }

  type Document {
    _id: ID!
    organizationId: ID!
    uploadedBy: String!
    name: String!
    type: String!
    tags: [String!]!
    contentHash: String!
    aiSummary: String!
    classification: Classification!
    version: Int!
    previousVersionId: String
    storageUrl: String!
    createdAt: String!
    updatedAt: String!
  }

  type Violation {
    _id: ID!
    organizationId: ID!
    ruleId: ID!
    documentId: ID!
    triggeredBy: ID!
    severity: ViolationSeverity!
    status: ViolationStatus!
    resolutionNote: String
    flaggedTextSnippet: String!
    createdAt: String!
    updatedAt: String!
    deletedAt: String
    createdBy: ID!
    updatedBy: ID
    deletedBy: ID
    organization: Organization
    rule: ComplianceRule
    document: Document
    triggeredByUser: User

    createdByUser: User
    updatedByUser: User
    deletedByUser: User
  }

  input ViolationInput {
    organizationId: ID!
    ruleId: ID!
    documentId: ID!
    triggeredBy: ID!
    severity: ViolationSeverity!
    status: ViolationStatus!
    resolutionNote: String
    flaggedTextSnippet: String!
  }

  extend type Query {
    violations: [Violation!]!
    violation(id: ID!): Violation
  }

  extend type Mutation {
    createViolation(input: ViolationInput!): Violation!
    updateViolation(
      id: ID!
      status: ViolationStatus
      resolutionNote: String
    ): Violation!
    deleteViolation(id: ID!): Boolean!
  }
`;
