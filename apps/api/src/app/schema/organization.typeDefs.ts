import { gql } from 'apollo-server';

export const organizationTypeDefs = gql`
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

  type Organization {
    _id: ID!
    name: String!
    industry: String!
    domain: String!
    tier: String!
    regulatoryFrameworks: [String!]!
    createdAt: String!
    updatedAt: String!
    deletedAt: String
    createdBy: ID!
    updatedBy: ID
    deletedBy: ID
    createdByUser: User
    updatedByUser: User
    deletedByUser: User
  }

  input OrganizationInput {
    name: String!
    industry: String!
    domain: String!
    tier: String!
    regulatoryFrameworks: [String!]!
  }

  extend type Query {
    organizations: [Organization!]!
    organization(id: ID!): Organization
  }

  extend type Mutation {
    createOrganization(input: OrganizationInput!): Organization!
    updateOrganization(id: ID!, input: OrganizationInput!): Organization!
    deleteOrganization(id: ID!): Boolean!
  }
`;
