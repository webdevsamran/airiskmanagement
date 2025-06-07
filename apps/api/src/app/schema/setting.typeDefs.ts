import { gql } from 'apollo-server';

export const settingTypeDefs = gql`
  enum EncryptionLevel {
    standard
    FIPS_140_2
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
    roleId: String!
    organizationId: ID!
    createdAt: String!
    updatedAt: String!
  }

  type Setting {
    _id: ID!
    organizationId: ID!
    encryptionLevel: EncryptionLevel!
    dataRetentionDays: Int!
    notifyOnHighRisk: Boolean!
    allowedFileTypes: [String!]!
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

  input SettingInput {
    organizationId: ID!
    encryptionLevel: EncryptionLevel!
    dataRetentionDays: Int!
    notifyOnHighRisk: Boolean!
    allowedFileTypes: [String!]!
  }

  input SettingUpdateInput {
    organizationId: ID
    encryptionLevel: EncryptionLevel
    dataRetentionDays: Int
    notifyOnHighRisk: Boolean
    allowedFileTypes: [String!]
  }

  type Query {
    settings: [Setting!]!
    setting(id: ID!): Setting
  }

  type Mutation {
    createSetting(input: SettingInput!): Setting!
    updateSetting(id: ID!, input: SettingUpdateInput!): Setting!
    deleteSetting(id: ID!): Boolean!
  }
`;
