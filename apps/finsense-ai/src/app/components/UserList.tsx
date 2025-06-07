import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Heading,
  Stack,
  Table,
  Text,
  Dialog,
  Portal,
  Flex,
  CloseButton,
} from '@chakra-ui/react';
import { gql, useQuery, useMutation } from '@apollo/client';
import { useSelector } from 'react-redux';
import { selectIsAdmin, selectHasPermission } from '../store/authSlice';
import { UserForm } from './UserForm';

const GET_USERS = gql`
  query GetUsers {
    users {
      _id
      email
      fullName
      organizationId
      roleId
      organization {
        _id
        name
      }
      role {
        _id
        name
      }
      status
    }
  }
`;

const GET_ORGANIZATIONS = gql`
  query GetOrganizations {
    organizations {
      _id
      name
    }
  }
`;

const GET_ROLES = gql`
  query GetRoles {
    roles {
      _id
      name
    }
  }
`;

const CREATE_USER = gql`
  mutation CreateUser(
    $email: String!
    $fullName: String!
    $passwordHash: String!
    $roleId: String!
    $organizationId: ID!
  ) {
    createUser(
      email: $email
      fullName: $fullName
      passwordHash: $passwordHash
      roleId: $roleId
      organizationId: $organizationId
    ) {
      _id
      fullName
      email
    }
  }
`;

const UPDATE_USER = gql`
  mutation UpdateUser(
    $id: ID!
    $fullName: String
    $roleId: String
    $organizationId: ID!
    $status: UserStatus
  ) {
    updateUser(
      id: $id
      fullName: $fullName
      roleId: $roleId
      organizationId: $organizationId
      status: $status
    ) {
      _id
      fullName
      email
    }
  }
`;

const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id)
  }
`;

export const UserList: React.FC = () => {
  const { data, loading, error, refetch } = useQuery(GET_USERS);
  const { data: orgData } = useQuery(GET_ORGANIZATIONS);
  const { data: roleData } = useQuery(GET_ROLES);

  const [createUser] = useMutation(CREATE_USER);
  const [updateUser] = useMutation(UPDATE_USER);
  const [deleteUser] = useMutation(DELETE_USER);

  // Instead of `mode`, we now have modalMode + isDialogOpen
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isDialogOpen, setDialogOpen] = useState(false);

  // Ref for dialog content, in case the form needs to measure/scroll
  const dialogContentRef = useRef<HTMLDivElement>(null);

  // Check if user is admin or has permission to manage alerts
  const isAdmin = useSelector(selectIsAdmin);
  const canRead = useSelector(selectHasPermission('READ_USER'));
  const canCreate = useSelector(selectHasPermission('CREATE_USER'));
  const canUpdate = useSelector(selectHasPermission('UPDATE_USER'));
  const canDelete = useSelector(selectHasPermission('DELETE_USER'));

  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    passwordHash: '',
    organizationId: [] as string[],
    roleId: [] as string[],
    status: ['active'] as string[], // keep as array to match your form logic
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openModal = (mode: 'create' | 'edit', user: any = null) => {
    if (mode === 'edit' && user) {
      setSelectedUser(user);
      setFormData({
        email: user.email,
        fullName: user.fullName,
        passwordHash: '',
        organizationId: [user.organizationId],
        roleId: [user.roleId],
        status: [user.status],
      });
    } else {
      // 'create' mode: reset form
      setSelectedUser(null);
      setFormData({
        email: '',
        fullName: '',
        passwordHash: '',
        organizationId: [],
        roleId: [],
        status: ['active'],
      });
    }
    setModalMode(mode);
    setDialogOpen(true);
  };

  const closeModal = () => {
    setSelectedUser(null);
    setModalMode(null);
    setDialogOpen(false);
    // Optionally reset formData here if you want a hard reset on close:
    setFormData({
      email: '',
      fullName: '',
      passwordHash: '',
      organizationId: [],
      roleId: [],
      status: ['active'],
    });
  };

  const handleSubmit = async () => {
    try {
      // Unwrap organizationId & roleId (arrays) => plain string
      const orgId = Array.isArray(formData.organizationId)
        ? formData.organizationId[0]
        : (formData.organizationId as unknown as string);

      const rId = Array.isArray(formData.roleId)
        ? formData.roleId[0]
        : (formData.roleId as unknown as string);

      if (modalMode === 'create' && (canCreate || isAdmin)) {
        await createUser({
          variables: {
            email: formData.email,
            fullName: formData.fullName,
            passwordHash: formData.passwordHash,
            roleId: rId,
            organizationId: orgId,
            status: Array.isArray(formData.status)
              ? formData.status[0]
              : (formData.status as unknown as string),
          },
        });
        alert('User created successfully');
      } else if (
        modalMode === 'edit' &&
        selectedUser &&
        (canUpdate || isAdmin)
      ) {
        const { email, passwordHash, ...updateData } = formData;

        const updatedOrgId = Array.isArray(updateData.organizationId)
          ? updateData.organizationId[0]
          : (updateData.organizationId as unknown as string);

        const updatedRId = Array.isArray(updateData.roleId)
          ? updateData.roleId[0]
          : (updateData.roleId as unknown as string);

        const updatedStatus = Array.isArray(updateData.status)
          ? updateData.status[0]
          : (updateData.status as unknown as string);

        await updateUser({
          variables: {
            id: selectedUser._id,
            fullName: updateData.fullName,
            roleId: updatedRId,
            organizationId: updatedOrgId,
            status: updatedStatus,
          },
        });
        alert('User updated successfully');
      }

      await refetch();
      closeModal();
    } catch (err: any) {
      alert('Error in submission: ' + err.message);
      console.error('Submission error:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      if (!canDelete && !isAdmin) {
        alert("You don't have permission to delete users.");
        return;
      }
      await deleteUser({ variables: { id } });
      alert('User deleted successfully');
      await refetch();
    } catch (err: any) {
      alert('Error deleting user: ' + err.message);
      console.error('Delete error:', err);
    }
  };

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error loading users</Text>;

  if (!isAdmin && !canRead) {
    return (
      <Box p={4}>
        <Text color="red.500">You do not have permission to view users.</Text>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Stack direction="row" justify="space-between" mb={4}>
        <Heading size="md">Users</Heading>
        {(isAdmin || canCreate) && (
          <Button colorScheme="teal" onClick={() => openModal('create')}>
            Add User
          </Button>
        )}
      </Stack>

      <Table.Root size="sm">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Email</Table.ColumnHeader>
            <Table.ColumnHeader>Full Name</Table.ColumnHeader>
            <Table.ColumnHeader>Org</Table.ColumnHeader>
            <Table.ColumnHeader>Role</Table.ColumnHeader>
            <Table.ColumnHeader>Status</Table.ColumnHeader>
            <Table.ColumnHeader>Actions</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {data.users.map((user: any) => (
            <Table.Row key={user._id}>
              <Table.Cell>{user.email}</Table.Cell>
              <Table.Cell>{user.fullName}</Table.Cell>
              <Table.Cell>{user.organization?.name || '-'}</Table.Cell>
              <Table.Cell>{user.role?.name || '-'}</Table.Cell>
              <Table.Cell>{user.status}</Table.Cell>
              <Table.Cell>
                {(isAdmin || canUpdate) && (
                  <Button
                    size="sm"
                    onClick={() => openModal('edit', user)}
                    mr={2}
                  >
                    Edit
                  </Button>
                )}
                {(isAdmin || canDelete) && (
                  <Button
                    size="sm"
                    colorScheme="red"
                    onClick={() => handleDelete(user._id)}
                  >
                    Delete
                  </Button>
                )}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>

      {/* Chakra Dialog for Create/Edit User */}
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
                    ? 'Create User'
                    : modalMode === 'edit'
                    ? 'Edit User'
                    : ''}
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
                {(modalMode === 'create' || modalMode === 'edit') && (
                  <UserForm
                    mode={modalMode!}
                    formData={formData}
                    organizations={orgData?.organizations || []}
                    roles={roleData?.roles || []}
                    onChange={handleChange}
                    onSubmit={handleSubmit}
                    onCancel={closeModal}
                    dialogContentRef={dialogContentRef}
                  />
                )}
                {/* If you want a "view" mode, you could render a read-only summary here. */}
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </Box>
  );
};
