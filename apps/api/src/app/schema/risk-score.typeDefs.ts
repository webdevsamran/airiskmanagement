import { gql } from 'apollo-server';

export const riskScoreTypeDefs = gql`
  scalar JSON

  enum EntityType {
    document
    user
    integration
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

  type RiskScore {
    _id: ID!
    organizationId: ID!
    documentId: ID
    userId: ID
    entityType: EntityType!
    score: Float!
    rationale: String!
    scoreBreakdown: JSON!
    calculatedAt: String!
    createdAt: String!
    updatedAt: String!
    deletedAt: String
    createdBy: ID!
    updatedBy: ID
    deletedBy: ID
    organization: Organization
    document: Document
    user: User
    createdByUser: User
    updatedByUser: User
    deletedByUser: User
  }

  input RiskScoreInput {
    organizationId: ID!
    documentId: ID
    userId: ID
    entityType: EntityType!
    score: Float!
    rationale: String!
    scoreBreakdown: JSON!
    calculatedAt: String
  }

  input RiskScoreUpdateInput {
    organizationId: ID
    documentId: ID
    userId: ID
    entityType: EntityType
    score: Float
    rationale: String
    scoreBreakdown: JSON
    calculatedAt: String
  }

  type Query {
    riskScores: [RiskScore!]!
    riskScore(id: ID!): RiskScore
  }

  type Mutation {
    createRiskScore(input: RiskScoreInput!): RiskScore!
    updateRiskScore(id: ID!, input: RiskScoreUpdateInput!): RiskScore!
    deleteRiskScore(id: ID!): Boolean!
  }
`;
