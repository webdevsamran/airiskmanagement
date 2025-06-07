import { gql } from 'apollo-server';

export const complianceRuleTypeDefs = gql`
  enum ComplianceCategory {
    privacy
    access
    security
    retention
  }

  enum ComplianceSeverity {
    low
    medium
    high
    critical
  }

  enum ComplianceLogicType {
    regex
    nlp
    llm
  }

  enum LanguageModelProvider {
    openai
    anthropic
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

  type LanguageModelConfig {
    provider: LanguageModelProvider
    model: String
    promptTemplate: String
  }

  type ComplianceLogic {
    type: ComplianceLogicType!
    expression: String!
    languageModelConfig: LanguageModelConfig
  }

  input LanguageModelConfigInput {
    provider: LanguageModelProvider
    model: String
    promptTemplate: String
  }

  input ComplianceLogicInput {
    type: ComplianceLogicType!
    expression: String!
    languageModelConfig: LanguageModelConfigInput
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
    updatedBy: ID
    deletedBy: ID
    deletedAt: String
    createdAt: String!
    updatedAt: String!
    organization: Organization
    createdByUser: User
    updatedByUser: User
    deletedByUser: User
  }

  extend type Query {
    complianceRules: [ComplianceRule!]!
    complianceRule(id: ID!): ComplianceRule
  }

  extend type Mutation {
    createComplianceRule(
      organizationId: ID!
      name: String!
      description: String
      category: ComplianceCategory!
      severity: ComplianceSeverity!
      logic: ComplianceLogicInput!
      enabled: Boolean
    ): ComplianceRule!

    updateComplianceRule(
      id: ID!
      name: String
      description: String
      category: ComplianceCategory
      severity: ComplianceSeverity
      logic: ComplianceLogicInput
      enabled: Boolean
    ): ComplianceRule!

    deleteComplianceRule(id: ID!): Boolean!
  }
`;
