import { gql } from 'apollo-server';

export const permissionTypeDefs = gql`
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

  type Permission {
    _id: ID!
    name: String!
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

  input CreatePermissionInput {
    name: String!
  }

  input UpdatePermissionInput {
    name: String
  }

  extend type Query {
    permissions: [Permission!]!
    permission(id: ID!): Permission
  }

  extend type Mutation {
    createPermission(input: CreatePermissionInput!): Permission!
    updatePermission(id: ID!, input: UpdatePermissionInput!): Permission!
    deletePermission(id: ID!): Boolean!
  }
`;
