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
import { ViolationForm } from './ViolationForm';

const GET_VIOLATIONS = gql`
  query GetViolations {
    violations {
      _id
      organizationId
      ruleId
      documentId
      triggeredBy
      severity
      status
      resolutionNote
      flaggedTextSnippet
      createdAt
      updatedAt

      organization {
        _id
        name
      }
      rule {
        _id
        name
      }
      document {
        _id
        name
      }
      triggeredByUser {
        _id
        fullName
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

const GET_RULES = gql`
  query GetRules {
    complianceRules {
      _id
      name
    }
  }
`;

const GET_DOCUMENTS = gql`
  query GetDocuments {
    documents {
      _id
      name
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

const CREATE_VIOLATION = gql`
  mutation CreateViolation($input: ViolationInput!) {
    createViolation(input: $input) {
      _id
    }
  }
`;

const UPDATE_VIOLATION = gql`
  mutation UpdateViolation(
    $id: ID!
    $status: ViolationStatus
    $resolutionNote: String
  ) {
    updateViolation(id: $id, status: $status, resolutionNote: $resolutionNote) {
      _id
    }
  }
`;

const DELETE_VIOLATION = gql`
  mutation DeleteViolation($id: ID!) {
    deleteViolation(id: $id)
  }
`;

export const ViolationList: React.FC = () => {
  const { data, loading, error, refetch } = useQuery(GET_VIOLATIONS);
  const { data: orgData, loading: orgLoading } = useQuery(GET_ORGANIZATIONS);
  const { data: ruleData, loading: ruleLoading } = useQuery(GET_RULES);
  const { data: docData, loading: docLoading } = useQuery(GET_DOCUMENTS);
  const { data: userData, loading: userLoading } = useQuery(GET_USERS);

  const [createViolation] = useMutation(CREATE_VIOLATION);
  const [updateViolation] = useMutation(UPDATE_VIOLATION);
  const [deleteViolation] = useMutation(DELETE_VIOLATION);

  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view' | null>(
    null
  );
  const [selectedViolation, setSelectedViolation] = useState<any>(null);
  const [isDialogOpen, setDialogOpen] = useState(false);

  const dialogContentRef = useRef<HTMLDivElement>(null);

  // Check if user is admin or has permission to manage alerts
  const isAdmin = useSelector(selectIsAdmin);
  const canRead = useSelector(selectHasPermission('READ_VIOLATIONS'));
  const canCreate = useSelector(selectHasPermission('CREATE_VIOLATIONS'));
  const canUpdate = useSelector(selectHasPermission('UPDATE_VIOLATIONS'));
  const canDelete = useSelector(selectHasPermission('DELETE_VIOLATIONS'));

  const [formData, setFormData] = useState({
    organizationId: [] as string[],
    ruleId: [] as string[],
    documentId: [] as string[],
    triggeredBy: [] as string[],
    severity: ['low'] as string[],
    status: ['open'] as string[],
    resolutionNote: '',
    flaggedTextSnippet: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openModal = (mode: 'create' | 'edit' | 'view', violation?: any) => {
    if ((mode === 'edit' || mode === 'view') && violation) {
      setSelectedViolation(violation);

      setFormData({
        organizationId: [violation.organizationId],
        ruleId: [violation.ruleId],
        documentId: [violation.documentId],
        triggeredBy: [violation.triggeredBy],
        severity: [violation.severity],
        status: [violation.status],
        resolutionNote: violation.resolutionNote || '',
        flaggedTextSnippet: violation.flaggedTextSnippet,
      });
    } else {
      setSelectedViolation(null);
      setFormData({
        organizationId: [],
        ruleId: [],
        documentId: [],
        triggeredBy: [],
        severity: ['low'],
        status: ['open'],
        resolutionNote: '',
        flaggedTextSnippet: '',
      });
    }

    setModalMode(mode);
    setDialogOpen(true);
  };

  const closeModal = () => {
    setSelectedViolation(null);
    setModalMode(null);
    setDialogOpen(false);
    setFormData({
      organizationId: [],
      ruleId: [],
      documentId: [],
      triggeredBy: [],
      severity: ['low'],
      status: ['open'],
      resolutionNote: '',
      flaggedTextSnippet: '',
    });
  };

  const handleSubmit = async () => {
    try {
      const orgId = Array.isArray(formData.organizationId)
        ? formData.organizationId[0]
        : (formData.organizationId as unknown as string);
      const rId = Array.isArray(formData.ruleId)
        ? formData.ruleId[0]
        : (formData.ruleId as unknown as string);
      const docId = Array.isArray(formData.documentId)
        ? formData.documentId[0]
        : (formData.documentId as unknown as string);
      const triggerId = Array.isArray(formData.triggeredBy)
        ? formData.triggeredBy[0]
        : (formData.triggeredBy as unknown as string);
      const sev = Array.isArray(formData.severity)
        ? formData.severity[0]
        : (formData.severity as unknown as string);
      const stat = Array.isArray(formData.status)
        ? formData.status[0]
        : (formData.status as unknown as string);

      if (modalMode === 'create' && (canCreate || isAdmin)) {
        await createViolation({
          variables: {
            input: {
              organizationId: orgId,
              ruleId: rId,
              documentId: docId,
              triggeredBy: triggerId,
              severity: sev,
              status: stat,
              resolutionNote: formData.resolutionNote,
              flaggedTextSnippet: formData.flaggedTextSnippet,
            },
          },
        });
      } else if (
        modalMode === 'edit' &&
        selectedViolation &&
        (canUpdate || isAdmin)
      ) {
        // Only status & resolutionNote can change on edit
        await updateViolation({
          variables: {
            id: selectedViolation._id,
            status: stat,
            resolutionNote: formData.resolutionNote,
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
        alert('You do not have permission to delete violations');
        return;
      }
      await deleteViolation({ variables: { id } });
      await refetch();
    } catch (err: any) {
      alert('Error deleting violation: ' + err.message);
      console.error(err);
    }
  };

  if (loading || orgLoading || ruleLoading || docLoading || userLoading)
    return <Text>Loading...</Text>;
  if (error) return <Text>Error loading violations</Text>;

  if (!isAdmin && !canRead) {
    return (
      <Box p={4}>
        <Text color="red.500">
          You do not have permission to view voilations.
        </Text>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Stack direction="row" justify="space-between" mb={4}>
        <Heading size="md">Violations</Heading>
        {(isAdmin || canCreate) && (
          <Button colorScheme="teal" onClick={() => openModal('create')}>
            Add Violation
          </Button>
        )}
      </Stack>

      <Table.Root size="sm">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Severity</Table.ColumnHeader>
            <Table.ColumnHeader>Status</Table.ColumnHeader>
            <Table.ColumnHeader>Organization</Table.ColumnHeader>
            <Table.ColumnHeader>Rule</Table.ColumnHeader>
            <Table.ColumnHeader>Document</Table.ColumnHeader>
            <Table.ColumnHeader>Triggered By</Table.ColumnHeader>
            <Table.ColumnHeader>Flagged Snippet</Table.ColumnHeader>
            <Table.ColumnHeader>Created At</Table.ColumnHeader>
            <Table.ColumnHeader>Actions</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {data.violations.map((v: any) => (
            <Table.Row key={v._id}>
              <Table.Cell>{v.severity}</Table.Cell>
              <Table.Cell>{v.status}</Table.Cell>
              <Table.Cell>{v.organization?.name || '-'}</Table.Cell>
              <Table.Cell>{v.rule?.name || '-'}</Table.Cell>
              <Table.Cell>{v.document?.name || '-'}</Table.Cell>
              <Table.Cell>{v.triggeredByUser?.fullName || '-'}</Table.Cell>
              <Table.Cell>{v.flaggedTextSnippet}</Table.Cell>
              <Table.Cell>
                {new Date(Number(v.createdAt)).toLocaleString()}
              </Table.Cell>
              <Table.Cell>
                <Button size="sm" onClick={() => openModal('view', v)} mr={2}>
                  View
                </Button>
                {(isAdmin || canUpdate) && (
                  <Button size="sm" onClick={() => openModal('edit', v)} mr={2}>
                    Edit
                  </Button>
                )}
                {(isAdmin || canDelete) && (
                  <Button
                    size="sm"
                    colorScheme="red"
                    onClick={() => handleDelete(v._id)}
                  >
                    Delete
                  </Button>
                )}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>

      {/* Chakra Dialog for Create/Edit/View Violation */}
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
                    ? 'Create Violation'
                    : modalMode === 'edit'
                    ? 'Edit Violation'
                    : 'View Violation'}
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
                {modalMode === 'view' && selectedViolation && (
                  <>
                    <Text>
                      <strong>Severity:</strong> {selectedViolation.severity}
                    </Text>
                    <Text>
                      <strong>Status:</strong> {selectedViolation.status}
                    </Text>
                    <Text>
                      <strong>Organization:</strong>{' '}
                      {selectedViolation.organization?.name || '-'}
                    </Text>
                    <Text>
                      <strong>Rule:</strong>{' '}
                      {selectedViolation.rule?.name || '-'}
                    </Text>
                    <Text>
                      <strong>Document:</strong>{' '}
                      {selectedViolation.document?.name || '-'}
                    </Text>
                    <Text>
                      <strong>Triggered By:</strong>{' '}
                      {selectedViolation.triggeredByUser?.fullName || '-'}
                    </Text>
                    <Text>
                      <strong>Flagged Snippet:</strong>{' '}
                      {selectedViolation.flaggedTextSnippet}
                    </Text>
                    <Text>
                      <strong>Resolution Note:</strong>{' '}
                      {selectedViolation.resolutionNote || '-'}
                    </Text>
                    <Text>
                      <strong>Created At:</strong>{' '}
                      {new Date(
                        Number(selectedViolation.createdAt)
                      ).toLocaleString()}
                    </Text>
                    <Text>
                      <strong>Updated At:</strong>{' '}
                      {new Date(
                        Number(selectedViolation.updatedAt)
                      ).toLocaleString()}
                    </Text>
                  </>
                )}

                {(modalMode === 'create' || modalMode === 'edit') && (
                  <ViolationForm
                    mode={modalMode!}
                    formData={formData}
                    organizations={orgData.organizations}
                    rules={ruleData.complianceRules}
                    documents={docData.documents}
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
