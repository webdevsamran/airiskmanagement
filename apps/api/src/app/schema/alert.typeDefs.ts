import { gql } from 'apollo-server';

export const alertTypeDefs = gql`
  enum AlertChannel {
    email
    slack
    sms
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
  }

  type Alert {
    _id: ID!
    organizationId: ID!
    channel: AlertChannel!
    recipient: String!
    trigger: String!
    templateId: ID!
    active: Boolean!
    createdAt: String!
    updatedAt: String!
    deletedAt: String
    organization: Organization
    createdBy: User!
    updatedBy: User
    deletedBy: User
  }

  input AlertInput {
    organizationId: ID!
    channel: AlertChannel!
    recipient: String!
    trigger: String!
    templateId: ID!
    active: Boolean
  }

  input AlertUpdateInput {
    organizationId: ID
    channel: AlertChannel
    recipient: String
    trigger: String
    templateId: ID
    active: Boolean
  }

  type Query {
    alerts: [Alert!]!
    alert(id: ID!): Alert
  }

  type Mutation {
    createAlert(input: AlertInput!): Alert!
    updateAlert(id: ID!, input: AlertUpdateInput!): Alert!
    deleteAlert(id: ID!): Boolean!
  }
`;
