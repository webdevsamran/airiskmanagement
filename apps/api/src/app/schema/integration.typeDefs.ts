import { gql } from 'apollo-server';

export const integrationTypeDefs = gql`
  enum IntegrationProvider {
    slack
    jira
    salesforce
    gdrive
    aws
  }

  enum IntegrationStatus {
    active
    disconnected
  }

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

  type Integration {
    _id: ID!
    organizationId: ID!
    provider: IntegrationProvider!
    config: JSON!
    status: IntegrationStatus!
    lastSyncedAt: String
    createdAt: String!
    updatedAt: String!
    deletedAt: String
    createdBy: ID!
    updatedBy: ID
    deletedBy: ID
    organization: Organization
    createdByUser: User
    updatedByUser: User
    deletedByUser: User
  }

  input IntegrationInput {
    organizationId: ID!
    provider: IntegrationProvider!
    config: JSON!
    status: IntegrationStatus
    lastSyncedAt: String
  }

  input IntegrationUpdateInput {
    organizationId: ID
    provider: IntegrationProvider
    config: JSON
    status: IntegrationStatus
    lastSyncedAt: String
  }

  type Query {
    integrations: [Integration!]!
    integration(id: ID!): Integration
  }

  type Mutation {
    createIntegration(input: IntegrationInput!): Integration!
    updateIntegration(id: ID!, input: IntegrationUpdateInput!): Integration!
    deleteIntegration(id: ID!): Boolean!
  }
`;
