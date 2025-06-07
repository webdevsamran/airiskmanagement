import { gql } from 'apollo-server';

export const userTypeDefs = gql`
  enum UserStatus {
    active
    suspended
    invited
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

  type Permission {
    _id: ID!
    name: String!
    createdAt: String
    updatedAt: String
  }

  type Role {
    _id: ID!
    name: String!
    createdAt: String!
    updatedAt: String!
  }

  type User {
    _id: ID!
    email: String!
    fullName: String!
    passwordHash: String!
    roleId: String!
    organizationId: ID!
    status: UserStatus!
    mfaEnabled: Boolean!
    lastLoginAt: String
    createdAt: String!
    updatedAt: String!
    deletedAt: String
    createdBy: ID!
    updatedBy: ID
    deletedBy: ID
    organization: Organization
    role: Role
    createdByUser: User
    updatedByUser: User
    deletedByUser: User
  }

  type AuthPayload {
    token: String!
    user: User!
    role: Role
    permissions: [Permission!]!
  }

  type Query {
    users: [User!]!
    user(id: ID!): User
    me: User
  }

  type Mutation {
    createUser(
      email: String!
      fullName: String!
      passwordHash: String!
      roleId: String!
      organizationId: ID!
    ): User!

    updateUser(
      id: ID!
      fullName: String
      roleId: String
      organizationId: ID
      status: UserStatus
      mfaEnabled: Boolean
    ): User!

    deleteUser(id: ID!): Boolean!

    login(email: String!, password: String!): AuthPayload!
    logout: Boolean!
  }
`;
