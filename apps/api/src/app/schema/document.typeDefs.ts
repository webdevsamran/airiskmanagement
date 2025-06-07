import { gql } from 'apollo-server';

export const documentTypeDefs = gql`
  scalar Upload

  type Classification {
    pii: Boolean!
    phi: Boolean!
    financial: Boolean!
    confidential: Boolean!
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
    createdBy: ID!
    updatedBy: String
    deletedBy: String
    deletedAt: String
    createdAt: String!
    updatedAt: String!
    organization: Organization
    uploadedByUser: User
    createdByUser: User
    updatedByUser: User
    deletedByUser: User
  }

  input CreateDocumentInput {
    organizationId: ID!
    name: String!
    type: String!
    tags: [String!]!
    file: Upload!
  }

  input UpdateDocumentInput {
    name: String
    type: String
    tags: [String!]
    file: Upload
  }

  extend type Query {
    documents: [Document!]!
    document(id: ID!): Document
  }

  extend type Mutation {
    createDocument(input: CreateDocumentInput!): Document!
    updateDocument(id: ID!, input: UpdateDocumentInput!): Document!
    deleteDocument(id: ID!): Boolean!
  }
`;
