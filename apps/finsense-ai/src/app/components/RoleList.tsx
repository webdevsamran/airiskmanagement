'use client';

import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Container,
  Spinner,
  Heading,
  Text,
  Dialog,
  Portal,
  Flex,
  CloseButton,
  Stack,
} from '@chakra-ui/react';
import { gql, useQuery, useMutation } from '@apollo/client';
import { useSelector } from 'react-redux';
import { selectIsAdmin, selectHasPermission } from '../store/authSlice';
import { RoleForm } from './RoleForm';

const GET_ROLES = gql`
  query GetRoles {
    roles {
      _id
      name
      permissions {
        _id
        name
      }
      createdAt
      updatedAt
    }
  }
`;

const GET_PERMISSIONS = gql`
  query GetAllPermissions {
    permissions {
      _id
      name
    }
  }
`;

const CREATE_ROLE = gql`
  mutation CreateRole($input: CreateRoleInput!) {
    createRole(input: $input) {
      _id
      name
      permissions {
        _id
        name
      }
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_ROLE = gql`
  mutation UpdateRole($id: ID!, $input: UpdateRoleInput!) {
    updateRole(id: $id, input: $input) {
      _id
      name
      permissions {
        _id
        name
      }
      createdAt
      updatedAt
    }
  }
`;

const DELETE_ROLE = gql`
  mutation DeleteRole($id: ID!) {
    deleteRole(id: $id)
  }
`;

export const RoleList: React.FC = () => {
  const {
    data: roleData,
    loading: rolesLoading,
    error: rolesError,
    refetch: refetchRoles,
  } = useQuery(GET_ROLES);

  const {
    data: permData,
    loading: permsLoading,
    error: permsError,
  } = useQuery(GET_PERMISSIONS);

  const [createRole] = useMutation(CREATE_ROLE);
  const [updateRole] = useMutation(UPDATE_ROLE);
  const [deleteRole] = useMutation(DELETE_ROLE);

  // Check if user is admin or has permission to manage alerts
  const isAdmin = useSelector(selectIsAdmin);
  const canRead = useSelector(selectHasPermission('READ_ROLES'));
  const canCreate = useSelector(selectHasPermission('CREATE_ROLES'));
  const canUpdate = useSelector(selectHasPermission('UPDATE_ROLES'));
  const canDelete = useSelector(selectHasPermission('DELETE_ROLES'));

  // Dialog state can be 'create', 'edit', 'view', or null
  const [dialogMode, setDialogMode] = useState<
    'create' | 'edit' | 'view' | null
  >(null);

  // When viewing or editing, we store the selected role’s full data
  const [selectedRole, setSelectedRole] = useState<{
    _id: string;
    name: string;
    permissions: { _id: string; name: string }[];
    createdAt: string;
    updatedAt: string;
  } | null>(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Form state only used when in 'create' or 'edit'
  const [formData, setFormData] = useState({
    name: '',
    permissions: [] as string[],
  });

  if (rolesLoading || permsLoading) return <Spinner />;
  if (rolesError || permsError) return <Text>Error loading data.</Text>;

  const allPermissions = permData.permissions as {
    _id: string;
    name: string;
  }[];

  const handleDelete = async (id: string) => {
    try {
      if (!canDelete && !isAdmin) {
        console.error('You do not have permission to delete roles.');
        return;
      }
      await deleteRole({ variables: { id } });
      await refetchRoles();
    } catch (err) {
      console.error('Error deleting role:', err);
    }
  };

  const openCreateDialog = () => {
    setSelectedRole(null);
    setFormData({ name: '', permissions: [] });
    setDialogMode('create');
    setIsDialogOpen(true);
  };

  const openEditDialog = (role: {
    _id: string;
    name: string;
    permissions: { _id: string; name: string }[];
    createdAt: string;
    updatedAt: string;
  }) => {
    setSelectedRole(role);
    setFormData({
      name: role.name,
      permissions: role.permissions.map((p) => p._id),
    });
    setDialogMode('edit');
    setIsDialogOpen(true);
  };

  const openViewDialog = (role: {
    _id: string;
    name: string;
    permissions: { _id: string; name: string }[];
    createdAt: string;
    updatedAt: string;
  }) => {
    setSelectedRole(role);
    // No need to populate formData, since viewing is read-only
    setDialogMode('view');
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setSelectedRole(null);
    setDialogMode(null);
    setIsDialogOpen(false);
    setFormData({ name: '', permissions: [] });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePermissionsChange = (values: string[]) => {
    setFormData({ ...formData, permissions: values });
  };

  const handleSubmit = async () => {
    try {
      const input = {
        name: formData.name,
        permissions: formData.permissions,
      };

      if (dialogMode === 'create' && (canCreate || isAdmin)) {
        await createRole({ variables: { input } });
      } else if (
        dialogMode === 'edit' &&
        selectedRole &&
        (canUpdate || isAdmin)
      ) {
        await updateRole({
          variables: { id: selectedRole._id, input },
        });
      }

      await refetchRoles();
      closeDialog();
    } catch (err) {
      console.error('Error saving role:', err);
    }
  };

  if (!isAdmin && !canRead) {
    return (
      <Box p={4}>
        <Text color="red.500">You do not have permission to view Roles.</Text>
      </Box>
    );
  }

  return (
    <Container maxW="container.lg" mt={8} mb={8}>
      <Flex justify="space-between" align="center" mb={4}>
        <Heading>Roles</Heading>
        {(isAdmin || canCreate) && (
          <Button colorScheme="teal" onClick={openCreateDialog}>
            Create Role
          </Button>
        )}
      </Flex>

      <Stack spacing={4}>
        {roleData.roles.length > 0 ? (
          roleData.roles.map(
            (role: {
              _id: string;
              name: string;
              permissions: { _id: string; name: string }[];
              createdAt: string;
              updatedAt: string;
            }) => (
              <Box key={role._id} p={4} borderWidth="1px" borderRadius="md">
                <Flex justify="space-between" align="center">
                  <Box>
                    <Text fontWeight="bold">{role.name}</Text>
                    <Text fontSize="sm" color="gray.500">
                      Permissions:{' '}
                      {role.permissions.map((p) => p.name).join(', ')}
                    </Text>
                  </Box>
                  <Stack direction="row">
                    <Button size="sm" onClick={() => openViewDialog(role)}>
                      View
                    </Button>
                    {(isAdmin || canUpdate) && (
                      <Button size="sm" onClick={() => openEditDialog(role)}>
                        Edit
                      </Button>
                    )}
                    {(isAdmin || canDelete) && (
                      <Button
                        size="sm"
                        colorScheme="red"
                        onClick={() => handleDelete(role._id)}
                      >
                        Delete
                      </Button>
                    )}
                  </Stack>
                </Flex>
              </Box>
            )
          )
        ) : (
          <Text>No roles found.</Text>
        )}
      </Stack>

      {/* ───── Chakra Dialog Primitive ───── */}
      <Dialog.Root
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
      >
        <Portal>
          <Dialog.Backdrop />

          <Dialog.Positioner>
            <Dialog.Content size="lg" ref={contentRef}>
              <Dialog.Header>
                <Dialog.Title>
                  {dialogMode === 'create'
                    ? 'Create Role'
                    : dialogMode === 'edit'
                    ? 'Edit Role'
                    : 'View Role'}
                </Dialog.Title>
                <Dialog.CloseTrigger asChild>
                  <CloseButton
                    size="sm"
                    position="absolute"
                    top="1rem"
                    right="1rem"
                    onClick={closeDialog}
                  />
                </Dialog.CloseTrigger>
              </Dialog.Header>

              <Dialog.Body>
                {dialogMode === 'view' && selectedRole && (
                  <>
                    <Text>
                      <strong>Name:</strong> {selectedRole.name}
                    </Text>
                    <Text>
                      <strong>Permissions:</strong>{' '}
                      {selectedRole.permissions.map((p) => p.name).join(', ')}
                    </Text>
                    <Text>
                      <strong>Created At:</strong>{' '}
                      {new Date(
                        Number(selectedRole.createdAt)
                      ).toLocaleString()}
                    </Text>
                    <Text>
                      <strong>Updated At:</strong>{' '}
                      {new Date(
                        Number(selectedRole.updatedAt)
                      ).toLocaleString()}
                    </Text>
                  </>
                )}

                {(dialogMode === 'create' || dialogMode === 'edit') && (
                  <RoleForm
                    mode={dialogMode}
                    formData={formData}
                    allPermissions={allPermissions}
                    onChange={handleChange}
                    onPermissionsChange={handlePermissionsChange}
                    onSubmit={handleSubmit}
                    onCancel={closeDialog}
                    dialogContentRef={contentRef}
                  />
                )}
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </Container>
  );
};
