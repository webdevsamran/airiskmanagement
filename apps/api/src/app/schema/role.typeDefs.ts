import { gql } from 'apollo-server';

export const roleTypeDefs = gql`
  type Permission {
    _id: ID!
    name: String!
    createdAt: String!
    updatedAt: String!
    deletedAt: String
    createdBy: ID!
    updatedBy: ID
    deletedBy: ID
  }

  type User {
    _id: ID!
    name: String!
    email: String!
    roleId: String!
    organizationId: ID!
    createdAt: String!
    updatedAt: String!
  }

  type Role {
    _id: ID!
    name: String!
    permissions: [Permission!]!
    createdBy: ID!
    updatedBy: ID
    deletedBy: ID
    deletedAt: String
    createdAt: String!
    updatedAt: String!
    createdByUser: User
    updatedByUser: User
    deletedByUser: User
  }

  input CreateRoleInput {
    name: String!
    permissions: [ID!]!
  }

  input UpdateRoleInput {
    name: String
    permissions: [ID!]!
  }

  extend type Query {
    roles: [Role!]!
    role(id: ID!): Role
  }

  extend type Mutation {
    createRole(input: CreateRoleInput!): Role!
    updateRole(id: ID!, input: UpdateRoleInput!): Role!
    deleteRole(id: ID!): Boolean!
  }
`;
