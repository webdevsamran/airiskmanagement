'use client';

import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Heading,
  Table,
  Text,
  Dialog,
  Portal,
  Stack,
  CloseButton,
} from '@chakra-ui/react';
import { gql, useQuery, useMutation } from '@apollo/client';
import { useSelector } from 'react-redux';
import { selectIsAdmin, selectHasPermission } from '../store/authSlice';
import { TaskForm } from './TaskForm';

const GET_TASKS = gql`
  query GetTasks {
    tasks {
      _id
      violationId
      assignedTo
      dueDate
      status
      notes
      createdAt
      updatedAt

      violation {
        _id
        severity
        status
        resolutionNote
        flaggedTextSnippet
      }
      assignee {
        _id
        fullName
      }
    }
  }
`;

const GET_VIOLATIONS = gql`
  query GetViolations {
    violations {
      _id
      severity
      status
      resolutionNote
      flaggedTextSnippet
    }
  }
`;

const GET_USERS = gql`
  query GetUsers {
    users {
      _id
      fullName
    }
  }
`;

const CREATE_TASK = gql`
  mutation CreateTask($input: TaskInput!) {
    createTask(input: $input) {
      _id
    }
  }
`;

const UPDATE_TASK = gql`
  mutation UpdateTask($id: ID!, $input: TaskUpdateInput!) {
    updateTask(id: $id, input: $input) {
      _id
    }
  }
`;

const DELETE_TASK = gql`
  mutation DeleteTask($id: ID!) {
    deleteTask(id: $id)
  }
`;

export const TaskList: React.FC = () => {
  const { data, loading, error, refetch } = useQuery(GET_TASKS);
  const { data: violationData, loading: violationLoading } =
    useQuery(GET_VIOLATIONS);
  const { data: userData, loading: userLoading } = useQuery(GET_USERS);

  const [createTask] = useMutation(CREATE_TASK);
  const [updateTask] = useMutation(UPDATE_TASK);
  const [deleteTask] = useMutation(DELETE_TASK);

  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view' | null>(
    null
  );
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isDialogOpen, setDialogOpen] = useState(false);

  const dialogContentRef = useRef<HTMLDivElement>(null);

  // Check if user is admin or has permission to manage alerts
  const isAdmin = useSelector(selectIsAdmin);
  const canRead = useSelector(selectHasPermission('READ_TASKS'));
  const canCreate = useSelector(selectHasPermission('CREATE_TASKS'));
  const canUpdate = useSelector(selectHasPermission('UPDATE_TASKS'));
  const canDelete = useSelector(selectHasPermission('DELETE_TASKS'));

  const [formData, setFormData] = useState({
    violationId: [] as string[],
    assignedTo: [] as string[],
    dueDate: new Date().toISOString().slice(0, 16),
    status: ['pending'] as string[],
    notes: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openModal = (mode: 'create' | 'edit' | 'view', task?: any) => {
    if ((mode === 'edit' || mode === 'view') && task) {
      setSelectedTask(task);
      setFormData({
        violationId: [task.violationId],
        assignedTo: [task.assignedTo],
        // Convert ISO to datetime-local
        dueDate: new Date(Number(task.dueDate)).toISOString().slice(0, 16),
        status: [task.status],
        notes: task.notes || '',
      });
    } else {
      setSelectedTask(null);
      setFormData({
        violationId: [],
        assignedTo: [],
        dueDate: new Date().toISOString().slice(0, 16),
        status: ['pending'],
        notes: '',
      });
    }
    setModalMode(mode);
    setDialogOpen(true);
  };

  const closeModal = () => {
    setSelectedTask(null);
    setModalMode(null);
    setDialogOpen(false);
    setFormData({
      violationId: [],
      assignedTo: [],
      dueDate: new Date().toISOString().slice(0, 16),
      status: ['pending'],
      notes: '',
    });
  };

  const handleSubmit = async () => {
    try {
      const vId = Array.isArray(formData.violationId)
        ? formData.violationId[0]
        : (formData.violationId as unknown as string);
      const aId = Array.isArray(formData.assignedTo)
        ? formData.assignedTo[0]
        : (formData.assignedTo as unknown as string);
      const stat = Array.isArray(formData.status)
        ? formData.status[0]
        : (formData.status as unknown as string);

      const input = {
        violationId: vId,
        assignedTo: aId,
        dueDate: new Date(formData.dueDate).toISOString(),
        status: stat,
        notes: formData.notes,
      };

      if (modalMode === 'create' && (canCreate || isAdmin)) {
        await createTask({ variables: { input } });
      } else if (
        modalMode === 'edit' &&
        selectedTask &&
        (canUpdate || isAdmin)
      ) {
        await updateTask({
          variables: { id: selectedTask._id, input },
        });
      }

      await refetch();
      closeModal();
    } catch (err: any) {
      alert('Error in submission: ' + err.message);
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      if (!canDelete && !isAdmin) {
        alert('You do not have permission to delete tasks.');
        return;
      }
      await deleteTask({ variables: { id } });
      await refetch();
    } catch (err: any) {
      alert('Error deleting task: ' + err.message);
      console.error(err);
    }
  };

  if (loading || violationLoading || userLoading)
    return <Text>Loading...</Text>;
  if (error) return <Text>Error loading tasks</Text>;

  if (!isAdmin && !canRead) {
    return (
      <Box p={4}>
        <Text color="red.500">You do not have permission to view tasks.</Text>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Stack direction="row" justify="space-between" mb={4}>
        <Heading size="md">Tasks</Heading>
        {(isAdmin || canCreate) && (
          <Button colorScheme="teal" onClick={() => openModal('create')}>
            Add Task
          </Button>
        )}
      </Stack>

      <Table.Root size="sm">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Violation</Table.ColumnHeader>
            <Table.ColumnHeader>Assignee</Table.ColumnHeader>
            <Table.ColumnHeader>Due Date</Table.ColumnHeader>
            <Table.ColumnHeader>Status</Table.ColumnHeader>
            <Table.ColumnHeader>Notes</Table.ColumnHeader>
            <Table.ColumnHeader>Actions</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {data.tasks.map((t: any) => (
            <Table.Row key={t._id}>
              <Table.Cell>{t.violation?.flaggedTextSnippet || '-'}</Table.Cell>
              <Table.Cell>{t.assignee?.fullName || '-'}</Table.Cell>
              <Table.Cell>
                {new Date(Number(t.dueDate)).toLocaleString()}
              </Table.Cell>
              <Table.Cell>{t.status}</Table.Cell>
              <Table.Cell>{t.notes}</Table.Cell>
              <Table.Cell>
                <Button size="sm" onClick={() => openModal('view', t)} mr={2}>
                  View
                </Button>
                {(isAdmin || canUpdate) && (
                  <Button size="sm" onClick={() => openModal('edit', t)} mr={2}>
                    Edit
                  </Button>
                )}
                {(isAdmin || canDelete) && (
                  <Button
                    size="sm"
                    colorScheme="red"
                    onClick={() => handleDelete(t._id)}
                  >
                    Delete
                  </Button>
                )}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>

      {/* Chakra Dialog for Create/Edit/View Task */}
      <Dialog.Root
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) closeModal();
        }}
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content size="lg" ref={dialogContentRef}>
              <Dialog.Header>
                <Dialog.Title>
                  {modalMode === 'create'
                    ? 'Create Task'
                    : modalMode === 'edit'
                    ? 'Edit Task'
                    : 'View Task'}
                </Dialog.Title>
                <Dialog.CloseTrigger asChild>
                  <CloseButton
                    size="sm"
                    position="absolute"
                    top="1rem"
                    right="1rem"
                    onClick={closeModal}
                  />
                </Dialog.CloseTrigger>
              </Dialog.Header>

              <Dialog.Body>
                {modalMode === 'view' && selectedTask && (
                  <>
                    <Text>
                      <strong>Violation:</strong>{' '}
                      {selectedTask.violation?.flaggedTextSnippet || '-'}
                    </Text>
                    <Text>
                      <strong>Assigned To:</strong>{' '}
                      {selectedTask.assignee?.fullName || '-'}
                    </Text>
                    <Text>
                      <strong>Due Date:</strong>{' '}
                      {new Date(Number(selectedTask.dueDate)).toLocaleString()}
                    </Text>
                    <Text>
                      <strong>Status:</strong> {selectedTask.status}
                    </Text>
                    <Text>
                      <strong>Notes:</strong> {selectedTask.notes || '-'}
                    </Text>
                    <Text>
                      <strong>Created At:</strong>{' '}
                      {new Date(
                        Number(selectedTask.createdAt)
                      ).toLocaleString()}
                    </Text>
                    <Text>
                      <strong>Updated At:</strong>{' '}
                      {new Date(
                        Number(selectedTask.updatedAt)
                      ).toLocaleString()}
                    </Text>
                  </>
                )}

                {(modalMode === 'create' || modalMode === 'edit') && (
                  <TaskForm
                    mode={modalMode!}
                    formData={formData}
                    violations={violationData.violations}
                    users={userData.users}
                    onChange={handleChange}
                    onSubmit={handleSubmit}
                    onCancel={closeModal}
                    dialogContentRef={dialogContentRef}
                  />
                )}
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </Box>
  );
};
