import React, { useState, useRef } from 'react';
import {
  Box,
  Heading,
  Button,
  Dialog,
  Portal,
  CloseButton,
  Table,
} from '@chakra-ui/react';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client';
import { useSelector } from 'react-redux';
import { selectIsAdmin, selectHasPermission } from '../store/authSlice';
import { IntegrationForm } from './IntegrationForm';

// GraphQL Queries & Mutations
const GET_INTEGRATIONS = gql`
  query GetIntegrations {
    integrations {
      _id
      organizationId
      provider
      config
      status
      lastSyncedAt
      createdAt
      organization {
        _id
        name
      }
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

const CREATE_INTEGRATION = gql`
  mutation CreateIntegration($input: IntegrationInput!) {
    createIntegration(input: $input) {
      _id
    }
  }
`;

const UPDATE_INTEGRATION = gql`
  mutation UpdateIntegration($id: ID!, $input: IntegrationUpdateInput!) {
    updateIntegration(id: $id, input: $input) {
      _id
    }
  }
`;

const DELETE_INTEGRATION = gql`
  mutation DeleteIntegration($id: ID!) {
    deleteIntegration(id: $id)
  }
`;

const toDateOnly = (timestamp: any): string => {
  const num = Number(timestamp);
  if (!isNaN(num)) {
    const date = new Date(num);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  }
  return '';
};

export const IntegrationList: React.FC = () => {
  const { data, refetch } = useQuery(GET_INTEGRATIONS);
  const { data: orgData } = useQuery(GET_ORGANIZATIONS);
  const [createIntegration] = useMutation(CREATE_INTEGRATION);
  const [updateIntegration] = useMutation(UPDATE_INTEGRATION);
  const [deleteIntegration] = useMutation(DELETE_INTEGRATION);

  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view' | null>(
    null
  );
  const [selectedIntegration, setSelectedIntegration] = useState<any>(null);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const dialogContentRef = useRef<HTMLDivElement>(null);

  // Check if user is admin or has permission to manage alerts
  const isAdmin = useSelector(selectIsAdmin);
  const canRead = useSelector(selectHasPermission('READ_INTEGRATIONS'));
  const canCreate = useSelector(selectHasPermission('CREATE_INTEGRATIONS'));
  const canUpdate = useSelector(selectHasPermission('UPDATE_INTEGRATIONS'));
  const canDelete = useSelector(selectHasPermission('DELETE_INTEGRATIONS'));

  const [formData, setFormData] = useState<any>({
    organizationId: [],
    provider: [],
    config: '',
    status: [],
    lastSyncedAt: '',
  });

  const openModal = (
    mode: 'create' | 'edit' | 'view',
    integration: any = null
  ) => {
    if ((mode === 'edit' || mode === 'view') && integration) {
      const iso = toDateOnly(integration.lastSyncedAt);

      setFormData({
        organizationId: [integration.organizationId],
        provider: [integration.provider],
        config: JSON.stringify(integration.config),
        status: [integration.status],
        lastSyncedAt: iso,
      });
      setSelectedIntegration(integration);
    } else {
      setFormData({
        organizationId: [],
        provider: [],
        config: '',
        status: [],
        lastSyncedAt: '',
      });
    }
    setModalMode(mode);
    setDialogOpen(true);
  };

  const closeModal = () => {
    setSelectedIntegration(null);
    setDialogOpen(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const orgId = Array.isArray(formData.organizationId)
        ? formData.organizationId[0]
        : formData.organizationId;
      const provider = Array.isArray(formData.provider)
        ? formData.provider[0]
        : formData.provider;
      const status = Array.isArray(formData.status)
        ? formData.status[0]
        : formData.status;

      const input: any = {
        organizationId: orgId,
        provider,
        config: JSON.parse(formData.config || '{}'),
        status,
        lastSyncedAt: formData.lastSyncedAt
          ? new Date(formData.lastSyncedAt).toISOString()
          : null,
      };

      if (modalMode === 'create' && (canCreate || isAdmin)) {
        await createIntegration({ variables: { input } });
        alert('Integration created successfully.');
      } else if (
        modalMode === 'edit' &&
        selectedIntegration?._id &&
        (canUpdate || isAdmin)
      ) {
        await updateIntegration({
          variables: { id: selectedIntegration._id, input },
        });
        alert('Integration updated successfully.');
      }

      await refetch();
      closeModal();
    } catch (error: any) {
      console.error('Error submitting form:', error);
      alert(`Error: ${error.message || 'An error occurred'}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!canDelete && !isAdmin) {
      alert('You do not have permission to delete integrations.');
      return;
    }
    await deleteIntegration({ variables: { id } });
    alert('Integration deleted successfully.');
    await refetch();
  };

  if (!isAdmin && !canRead) {
    return (
      <Box p={4}>
        <Text color="red.500">
          You do not have permission to view Integrations.
        </Text>
      </Box>
    );
  }

  return (
    <Box>
      <Heading size="md" mb={4}>
        Integrations
      </Heading>
      {(isAdmin || canCreate) && (
        <Button colorScheme="green" onClick={() => openModal('create')}>
          New Integration
        </Button>
      )}

      <Table.Root mt={4}>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Organization</Table.ColumnHeader>
            <Table.ColumnHeader>Provider</Table.ColumnHeader>
            <Table.ColumnHeader>Status</Table.ColumnHeader>
            <Table.ColumnHeader>Last Synced</Table.ColumnHeader>
            <Table.ColumnHeader>Actions</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {data?.integrations.map((intg: any) => (
            <Table.Row key={intg._id}>
              <Table.Cell>{intg.organization?.name}</Table.Cell>
              <Table.Cell>{intg.provider}</Table.Cell>
              <Table.Cell>{intg.status}</Table.Cell>
              <Table.Cell>
                {intg.lastSyncedAt
                  ? new Date(Number(intg.lastSyncedAt))
                      .toISOString()
                      .split('T')[0]
                  : '—'}
              </Table.Cell>
              <Table.Cell>
                <Button size="sm" onClick={() => openModal('view', intg)}>
                  View
                </Button>
                {(isAdmin || canUpdate) && (
                  <Button
                    size="sm"
                    ml={2}
                    onClick={() => openModal('edit', intg)}
                  >
                    Edit
                  </Button>
                )}
                {(isAdmin || canDelete) && (
                  <Button
                    size="sm"
                    ml={2}
                    colorScheme="red"
                    onClick={() => handleDelete(intg._id)}
                  >
                    Delete
                  </Button>
                )}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>

      {/* Modal Dialog */}
      <Dialog.Root
        open={isDialogOpen}
        onOpenChange={(open) => !open && closeModal()}
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content size="lg" ref={dialogContentRef}>
              <Dialog.Header>
                <Dialog.Title>
                  {modalMode === 'create'
                    ? 'Create Integration'
                    : modalMode === 'edit'
                    ? 'Edit Integration'
                    : modalMode === 'view'
                    ? 'View Integration'
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
                {modalMode === 'view' && selectedIntegration && (
                  <Table.Root size="sm">
                    <Table.Body>
                      <Table.Row>
                        <Table.ColumnHeader>Organization</Table.ColumnHeader>
                        <Table.Cell>
                          {selectedIntegration.organization?.name}
                        </Table.Cell>
                      </Table.Row>
                      <Table.Row>
                        <Table.ColumnHeader>Provider</Table.ColumnHeader>
                        <Table.Cell>{selectedIntegration.provider}</Table.Cell>
                      </Table.Row>
                      <Table.Row>
                        <Table.ColumnHeader>Status</Table.ColumnHeader>
                        <Table.Cell>{selectedIntegration.status}</Table.Cell>
                      </Table.Row>
                      <Table.Row>
                        <Table.ColumnHeader>Config</Table.ColumnHeader>
                        <Table.Cell>
                          <pre style={{ whiteSpace: 'pre-wrap' }}>
                            {JSON.stringify(
                              selectedIntegration.config,
                              null,
                              2
                            )}
                          </pre>
                        </Table.Cell>
                      </Table.Row>
                      <Table.Row>
                        <Table.ColumnHeader>Last Synced</Table.ColumnHeader>
                        <Table.Cell>
                          {selectedIntegration.lastSyncedAt
                            ? new Date(Number(selectedIntegration.lastSyncedAt))
                                .toISOString()
                                .split('T')[0]
                            : '—'}
                        </Table.Cell>
                      </Table.Row>
                      <Table.Row>
                        <Table.ColumnHeader>Created At</Table.ColumnHeader>
                        <Table.Cell>
                          {selectedIntegration.createdAt
                            ? new Date(Number(selectedIntegration.createdAt))
                                .toISOString()
                                .split('T')[0]
                            : '—'}
                        </Table.Cell>
                      </Table.Row>
                    </Table.Body>
                  </Table.Root>
                )}

                {(modalMode === 'create' || modalMode === 'edit') && (
                  <IntegrationForm
                    mode={modalMode}
                    formData={formData}
                    organizations={orgData?.organizations || []}
                    onChange={handleChange}
                    onChangeSelect={handleSelectChange}
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
