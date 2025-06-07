import React, { useState, useRef } from 'react';
import {
  Box,
  Heading,
  Table,
  Button,
  Dialog,
  Portal,
  CloseButton,
} from '@chakra-ui/react';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client';
import { useSelector } from 'react-redux';
import { selectIsAdmin, selectHasPermission } from '../store/authSlice';
import { SettingForm } from './SettingForm';

const GET_SETTINGS = gql`
  query GetSettings {
    settings {
      _id
      organizationId
      encryptionLevel
      dataRetentionDays
      notifyOnHighRisk
      allowedFileTypes
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

const CREATE_SETTING = gql`
  mutation CreateSetting($input: SettingInput!) {
    createSetting(input: $input) {
      _id
    }
  }
`;

const UPDATE_SETTING = gql`
  mutation UpdateSetting($id: ID!, $input: SettingUpdateInput!) {
    updateSetting(id: $id, input: $input) {
      _id
    }
  }
`;

const DELETE_SETTING = gql`
  mutation DeleteSetting($id: ID!) {
    deleteSetting(id: $id)
  }
`;

export const SettingList: React.FC = () => {
  const { data, refetch } = useQuery(GET_SETTINGS);
  const { data: orgData } = useQuery(GET_ORGANIZATIONS);
  const [createSetting] = useMutation(CREATE_SETTING);
  const [updateSetting] = useMutation(UPDATE_SETTING);
  const [deleteSetting] = useMutation(DELETE_SETTING);

  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [selectedSetting, setSelectedSetting] = useState<any>(null);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const dialogContentRef = useRef<HTMLDivElement>(null);

  // Check if user is admin or has permission to manage alerts
  const isAdmin = useSelector(selectIsAdmin);
  const canRead = useSelector(selectHasPermission('READ_SETTINGS'));
  const canCreate = useSelector(selectHasPermission('CREATE_SETTINGS'));
  const canUpdate = useSelector(selectHasPermission('UPDATE_SETTINGS'));
  const canDelete = useSelector(selectHasPermission('DELETE_SETTINGS'));

  const [formData, setFormData] = useState<any>({
    organizationId: [],
    encryptionLevel: [],
    dataRetentionDays: '',
    notifyOnHighRisk: false,
    allowedFileTypes: '',
  });

  const openModal = (mode: 'create' | 'edit', setting: any = null) => {
    if (mode === 'edit' && setting) {
      setFormData({
        organizationId: [setting.organizationId],
        encryptionLevel: [setting.encryptionLevel],
        dataRetentionDays: setting.dataRetentionDays,
        notifyOnHighRisk: setting.notifyOnHighRisk,
        allowedFileTypes: setting.allowedFileTypes.join(','),
      });
      setSelectedSetting(setting);
    } else {
      setFormData({
        organizationId: [],
        encryptionLevel: [],
        dataRetentionDays: '',
        notifyOnHighRisk: false,
        allowedFileTypes: '',
      });
    }
    setModalMode(mode);
    setDialogOpen(true);
  };

  const closeModal = () => {
    setSelectedSetting(null);
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
      console.log('Submitting form data:', formData);

      const orgId = Array.isArray(formData.organizationId)
        ? formData.organizationId[0]
        : formData.organizationId;

      const encryptionLevel = Array.isArray(formData.encryptionLevel)
        ? formData.encryptionLevel[0]
        : formData.encryptionLevel;

      const input = {
        ...formData,
        organizationId: orgId,
        encryptionLevel,
        allowedFileTypes: formData.allowedFileTypes
          .split(',')
          .map((x: string) => x.trim()),
        dataRetentionDays: parseInt(formData.dataRetentionDays as any, 10),
      };

      if (modalMode === 'create' && (canCreate || isAdmin)) {
        await createSetting({ variables: { input } });
        alert('Setting created successfully.');
      } else if (
        modalMode === 'edit' &&
        selectedSetting?._id &&
        (canUpdate || isAdmin)
      ) {
        await updateSetting({ variables: { id: selectedSetting._id, input } });
        alert('Setting updated successfully.');
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
      alert("You don't have permission to delete settings.");
      return;
    }
    await deleteSetting({ variables: { id } });
    alert('Setting deleted successfully.');
    await refetch();
  };

  if (!isAdmin && !canRead) {
    return (
      <Box p={4}>
        <Text color="red.500">
          You do not have permission to view Settings.
        </Text>
      </Box>
    );
  }

  return (
    <Box>
      <Heading size="md" mb={4}>
        Settings
      </Heading>
      {(isAdmin || canCreate) && (
        <Button colorScheme="green" onClick={() => openModal('create')}>
          New Setting
        </Button>
      )}
      <Table.Root mt={4}>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Organization</Table.ColumnHeader>
            <Table.ColumnHeader>Encryption</Table.ColumnHeader>
            <Table.ColumnHeader>Retention</Table.ColumnHeader>
            <Table.ColumnHeader>Notify</Table.ColumnHeader>
            <Table.ColumnHeader>Actions</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {data?.settings.map((s: any) => (
            <Table.Row key={s._id}>
              <Table.Cell>{s.organization?.name}</Table.Cell>
              <Table.Cell>{s.encryptionLevel}</Table.Cell>
              <Table.Cell>{s.dataRetentionDays} days</Table.Cell>
              <Table.Cell>{s.notifyOnHighRisk ? 'Yes' : 'No'}</Table.Cell>
              <Table.Cell>
                {(isAdmin || canUpdate) && (
                  <Button size="sm" onClick={() => openModal('edit', s)}>
                    Edit
                  </Button>
                )}
                {(isAdmin || canDelete) && (
                  <Button
                    size="sm"
                    ml={2}
                    colorScheme="red"
                    onClick={() => handleDelete(s._id)}
                  >
                    Delete
                  </Button>
                )}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>

      {/* Chakra Dialog for Create/Edit Setting */}
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
                    ? 'Create Setting'
                    : modalMode === 'edit'
                    ? 'Edit Setting'
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
                  <SettingForm
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
