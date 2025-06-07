// AlertList.tsx
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
  CloseButton,
  Checkbox,
} from '@chakra-ui/react';
import { gql, useQuery, useMutation } from '@apollo/client';
import { useSelector } from 'react-redux';
import { selectIsAdmin, selectHasPermission } from '../store/authSlice';
import { AlertForm } from './AlertForm';

// GraphQL Queries & Mutations (unchanged)
const GET_ALERTS = gql`
  query GetAlerts {
    alerts {
      _id
      organizationId
      channel
      recipient
      trigger
      templateId
      active
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

const CREATE_ALERT = gql`
  mutation CreateAlert(
    $organizationId: ID!
    $channel: AlertChannel!
    $recipient: String!
    $trigger: String!
    $templateId: ID!
    $active: Boolean
  ) {
    createAlert(
      input: {
        organizationId: $organizationId
        channel: $channel
        recipient: $recipient
        trigger: $trigger
        templateId: $templateId
        active: $active
      }
    ) {
      _id
      channel
      recipient
    }
  }
`;

const UPDATE_ALERT = gql`
  mutation UpdateAlert(
    $id: ID!
    $organizationId: ID
    $channel: AlertChannel
    $recipient: String
    $trigger: String
    $templateId: ID
    $active: Boolean
  ) {
    updateAlert(
      id: $id
      input: {
        organizationId: $organizationId
        channel: $channel
        recipient: $recipient
        trigger: $trigger
        templateId: $templateId
        active: $active
      }
    ) {
      _id
      channel
      recipient
    }
  }
`;

const DELETE_ALERT = gql`
  mutation DeleteAlert($id: ID!) {
    deleteAlert(id: $id)
  }
`;

export const AlertList: React.FC = () => {
  // Fetch all alerts
  const {
    data: alertData,
    loading: alertLoading,
    error: alertError,
    refetch: refetchAlerts,
  } = useQuery(GET_ALERTS);

  // Fetch organizations for the form’s select
  const { data: orgData } = useQuery(GET_ORGANIZATIONS);

  const [createAlert] = useMutation(CREATE_ALERT);
  const [updateAlert] = useMutation(UPDATE_ALERT);
  const [deleteAlert] = useMutation(DELETE_ALERT);

  // Modal & selection state
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  const [isDialogOpen, setDialogOpen] = useState(false);

  // Ref for dialog content
  const dialogContentRef = useRef<HTMLDivElement>(null);

  // Check if user is admin or has permission to manage alerts
  const isAdmin = useSelector(selectIsAdmin);
  const canRead = useSelector(selectHasPermission('READ_ALERT'));
  const canCreate = useSelector(selectHasPermission('CREATE_ALERT'));
  const canUpdate = useSelector(selectHasPermission('UPDATE_ALERT'));
  const canDelete = useSelector(selectHasPermission('DELETE_ALERT'));

  // Form data—store organizationId & channel as strings
  const [formData, setFormData] = useState<{
    organizationId: string;
    channel: string;
    recipient: string;
    trigger: string;
    templateId: string;
    active: boolean;
  }>({
    organizationId: [],
    channel: [],
    recipient: '',
    trigger: '',
    templateId: '',
    active: true,
  });

  // Called by <Input> and by the Checkbox fake change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === 'active') {
      setFormData((prev) => ({
        ...prev,
        active: value === 'true' || value === true,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Called by <AlertForm> when a select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const openModal = (mode: 'create' | 'edit', alertItem: any = null) => {
    if (mode === 'edit' && alertItem) {
      setSelectedAlert(alertItem);
      setFormData({
        organizationId: [alertItem.organizationId],
        channel: [alertItem.channel],
        recipient: alertItem.recipient,
        trigger: alertItem.trigger,
        templateId: alertItem.templateId,
        active: alertItem.active,
      });
    } else {
      // 'create' mode: reset form
      setSelectedAlert(null);
      setFormData({
        organizationId: [],
        channel: [],
        recipient: '',
        trigger: '',
        templateId: '',
        active: true,
      });
    }
    setModalMode(mode);
    setDialogOpen(true);
  };

  const closeModal = () => {
    setSelectedAlert(null);
    setModalMode(null);
    setDialogOpen(false);
    setFormData({
      organizationId: [],
      channel: [],
      recipient: '',
      trigger: '',
      templateId: '',
      active: true,
    });
  };

  const handleSubmit = async () => {
    try {
      const orgId = Array.isArray(formData.organizationId)
        ? formData.organizationId[0]
        : (formData.organizationId as unknown as string);

      const channelValue = Array.isArray(formData.channel)
        ? formData.channel[0]
        : (formData.channel as unknown as string);

      if (modalMode === 'create' && (canCreate || isAdmin)) {
        await createAlert({
          variables: {
            organizationId: orgId,
            channel: channelValue,
            recipient: formData.recipient,
            trigger: formData.trigger,
            templateId: formData.templateId,
            active: formData.active,
          },
        });
        alert('Alert created successfully');
      } else if (
        modalMode === 'edit' &&
        selectedAlert &&
        (canUpdate || isAdmin)
      ) {
        await updateAlert({
          variables: {
            id: selectedAlert._id,
            organizationId: orgId,
            channel: channelValue,
            recipient: formData.recipient,
            trigger: formData.trigger,
            templateId: formData.templateId,
            active: formData.active,
          },
        });
        alert('Alert updated successfully');
      }

      await refetchAlerts();
      closeModal();
    } catch (err: any) {
      alert('Error in submission: ' + err.message);
      console.error('Submission error:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      if (!canDelete && !isAdmin) {
        alert('You do not have permission to delete alerts.');
        return;
      }
      await deleteAlert({ variables: { id } });
      alert('Alert deleted successfully');
      await refetchAlerts();
    } catch (err: any) {
      alert('Error deleting alert: ' + err.message);
      console.error('Delete error:', err);
    }
  };

  if (alertLoading) return <Text>Loading alerts...</Text>;
  if (alertError) return <Text>Error loading alerts</Text>;

  if (!isAdmin && !canRead) {
    return (
      <Box p={4}>
        <Text color="red.500">You do not have permission to view alerts.</Text>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Stack direction="row" justify="space-between" mb={4}>
        <Heading size="md">Alerts</Heading>
        {(isAdmin || canCreate) && (
          <Button colorScheme="teal" onClick={() => openModal('create')}>
            Add Alert
          </Button>
        )}
      </Stack>

      <Table.Root size="sm">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Organization</Table.ColumnHeader>
            <Table.ColumnHeader>Channel</Table.ColumnHeader>
            <Table.ColumnHeader>Recipient</Table.ColumnHeader>
            <Table.ColumnHeader>Trigger</Table.ColumnHeader>
            <Table.ColumnHeader>Template ID</Table.ColumnHeader>
            <Table.ColumnHeader>Active</Table.ColumnHeader>
            <Table.ColumnHeader>Actions</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {alertData.alerts.map((alertItem: any) => (
            <Table.Row key={alertItem._id}>
              <Table.Cell>{alertItem.organization?.name || '-'}</Table.Cell>
              <Table.Cell>{alertItem.channel}</Table.Cell>
              <Table.Cell>{alertItem.recipient}</Table.Cell>
              <Table.Cell>{alertItem.trigger}</Table.Cell>
              <Table.Cell>{alertItem.templateId}</Table.Cell>
              <Table.Cell>
                <Checkbox.Root checked={alertItem.active} readOnly>
                  <Checkbox.HiddenInput />
                  <Checkbox.Control />
                </Checkbox.Root>
              </Table.Cell>
              <Table.Cell>
                {(isAdmin || canUpdate) && (
                  <Button
                    size="sm"
                    onClick={() => openModal('edit', alertItem)}
                    mr={2}
                  >
                    Edit
                  </Button>
                )}
                {(isAdmin || canDelete) && (
                  <Button
                    size="sm"
                    colorScheme="red"
                    onClick={() => handleDelete(alertItem._id)}
                  >
                    Delete
                  </Button>
                )}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>

      {/* Chakra Dialog for Create/Edit Alert */}
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
                    ? 'Create Alert'
                    : modalMode === 'edit'
                    ? 'Edit Alert'
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
                  <AlertForm
                    mode={modalMode!}
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
