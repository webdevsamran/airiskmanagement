import { gql } from 'apollo-server';

export const taskTypeDefs = gql`
  enum TaskStatus {
    pending
    in_progress
    done
  }

  type Violation {
    _id: ID!
    organizationId: ID!
    ruleId: ID!
    documentId: ID!
    triggeredBy: ID!
    severity: ViolationSeverity!
    status: ViolationStatus!
    resolutionNote: String
    flaggedTextSnippet: String!
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

  type Task {
    _id: ID!
    violationId: ID!
    assignedTo: ID!
    dueDate: String!
    status: TaskStatus!
    notes: String!
    createdAt: String!
    updatedAt: String!
    deletedAt: String
    createdBy: ID!
    updatedBy: ID
    deletedBy: ID
    violation: Violation
    assignee: User
    createdByUser: User
    updatedByUser: User
    deletedByUser: User
  }

  input TaskInput {
    violationId: ID!
    assignedTo: ID!
    dueDate: String!
    status: TaskStatus
    notes: String
  }

  input TaskUpdateInput {
    violationId: ID
    assignedTo: ID
    dueDate: String
    status: TaskStatus
    notes: String
  }

  type Query {
    tasks: [Task!]!
    task(id: ID!): Task
  }

  type Mutation {
    createTask(input: TaskInput!): Task!
    updateTask(id: ID!, input: TaskUpdateInput!): Task!
    deleteTask(id: ID!): Boolean!
  }
`;
