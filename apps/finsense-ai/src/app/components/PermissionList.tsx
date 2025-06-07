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
import { PermissionForm } from './PermissionForm';

const GET_PERMISSIONS = gql`
  query GetPermissions {
    permissions {
      _id
      name
      createdAt
      updatedAt
    }
  }
`;

const CREATE_PERMISSION = gql`
  mutation CreatePermission($input: CreatePermissionInput!) {
    createPermission(input: $input) {
      _id
      name
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_PERMISSION = gql`
  mutation UpdatePermission($id: ID!, $input: UpdatePermissionInput!) {
    updatePermission(id: $id, input: $input) {
      _id
      name
      createdAt
      updatedAt
    }
  }
`;

const DELETE_PERMISSION = gql`
  mutation DeletePermission($id: ID!) {
    deletePermission(id: $id)
  }
`;

export const PermissionList: React.FC = () => {
  const { data, loading, error, refetch } = useQuery(GET_PERMISSIONS);
  const [createPermission] = useMutation(CREATE_PERMISSION);
  const [updatePermission] = useMutation(UPDATE_PERMISSION);
  const [deletePermission] = useMutation(DELETE_PERMISSION);

  // Modal state
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view' | null>(
    null
  );
  const [selectedPermission, setSelectedPermission] = useState<any>(null);
  const [isDialogOpen, setDialogOpen] = useState(false);

  const dialogContentRef = useRef<HTMLDivElement>(null);

  // Check if user is admin or has permission to manage alerts
  const isAdmin = useSelector(selectIsAdmin);
  const canRead = useSelector(selectHasPermission('READ_PERMISSIONS'));
  const canCreate = useSelector(selectHasPermission('CREATE_PERMISSIONS'));
  const canUpdate = useSelector(selectHasPermission('UPDATE_PERMISSIONS'));
  const canDelete = useSelector(selectHasPermission('DELETE_PERMISSIONS'));

  // Local formData state
  const [formData, setFormData] = useState({
    name: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openModal = (mode: 'create' | 'edit' | 'view', permission?: any) => {
    if ((mode === 'edit' || mode === 'view') && permission) {
      setSelectedPermission(permission);
      setFormData({
        name: permission.name,
      });
    } else {
      setSelectedPermission(null);
      setFormData({
        name: '',
      });
    }
    setModalMode(mode);
    setDialogOpen(true);
  };

  const closeModal = () => {
    setSelectedPermission(null);
    setModalMode(null);
    setDialogOpen(false);
    setFormData({ name: '' });
  };

  const handleSubmit = async () => {
    try {
      if (modalMode === 'create' && (canCreate || isAdmin)) {
        await createPermission({
          variables: { input: { name: formData.name } },
        });
      } else if (
        modalMode === 'edit' &&
        selectedPermission &&
        (canUpdate || isAdmin)
      ) {
        await updatePermission({
          variables: {
            id: selectedPermission._id,
            input: { name: formData.name },
          },
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
        alert('You do not have permission to delete permissions');
        return;
      }
      await deletePermission({ variables: { id } });
      await refetch();
    } catch (err: any) {
      alert('Error deleting permission: ' + err.message);
      console.error(err);
    }
  };

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error loading permissions</Text>;

  if (!isAdmin && !canRead) {
    return (
      <Box p={4}>
        <Text color="red.500">
          You do not have permission to view Permissions.
        </Text>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Stack direction="row" justify="space-between" mb={4}>
        <Heading size="md">Permissions</Heading>
        {(isAdmin || canCreate) && (
          <Button colorScheme="teal" onClick={() => openModal('create')}>
            Add Permission
          </Button>
        )}
      </Stack>

      <Table.Root size="sm">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Name</Table.ColumnHeader>
            <Table.ColumnHeader>Created At</Table.ColumnHeader>
            <Table.ColumnHeader>Updated At</Table.ColumnHeader>
            <Table.ColumnHeader>Actions</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {data.permissions.map((perm: any) => (
            <Table.Row key={perm._id}>
              <Table.Cell>{perm.name}</Table.Cell>
              <Table.Cell>
                {new Date(Number(perm.createdAt)).toLocaleString()}
              </Table.Cell>
              <Table.Cell>
                {new Date(Number(perm.updatedAt)).toLocaleString()}
              </Table.Cell>
              <Table.Cell>
                <Button
                  size="sm"
                  onClick={() => openModal('view', perm)}
                  mr={2}
                >
                  View
                </Button>
                {(isAdmin || canUpdate) && (
                  <Button
                    size="sm"
                    onClick={() => openModal('edit', perm)}
                    mr={2}
                  >
                    Edit
                  </Button>
                )}
                {(isAdmin || canDelete) && (
                  <Button
                    size="sm"
                    colorScheme="red"
                    onClick={() => handleDelete(perm._id)}
                  >
                    Delete
                  </Button>
                )}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>

      {/* Chakra Dialog for Create/Edit/View Permission */}
      <Dialog.Root
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) closeModal();
        }}
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content size="md" ref={dialogContentRef}>
              <Dialog.Header>
                <Dialog.Title>
                  {modalMode === 'create'
                    ? 'Create Permission'
                    : modalMode === 'edit'
                    ? 'Edit Permission'
                    : 'View Permission'}
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
                {modalMode === 'view' && selectedPermission && (
                  <>
                    <Text>
                      <strong>Name:</strong> {selectedPermission.name}
                    </Text>
                    <Text>
                      <strong>Created At:</strong>{' '}
                      {new Date(
                        Number(selectedPermission.createdAt)
                      ).toLocaleString()}
                    </Text>
                    <Text>
                      <strong>Updated At:</strong>{' '}
                      {new Date(
                        Number(selectedPermission.updatedAt)
                      ).toLocaleString()}
                    </Text>
                  </>
                )}

                {(modalMode === 'create' || modalMode === 'edit') && (
                  <PermissionForm
                    mode={modalMode!}
                    formData={formData}
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
