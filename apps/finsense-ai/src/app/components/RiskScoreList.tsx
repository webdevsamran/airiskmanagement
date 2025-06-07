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
  Flex,
  CloseButton,
} from '@chakra-ui/react';
import { gql, useQuery, useMutation } from '@apollo/client';
import { useSelector } from 'react-redux';
import { selectIsAdmin, selectHasPermission } from '../store/authSlice';
import { RiskScoreForm } from './RiskScoreForm';

const GET_RISK_SCORES = gql`
  query GetRiskScores {
    riskScores {
      _id
      organizationId
      documentId
      userId
      entityType
      score
      rationale
      scoreBreakdown
      calculatedAt
      organization {
        _id
        name
      }
      user {
        _id
        fullName
      }
      document {
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

const GET_USERS = gql`
  query GetUsers {
    users {
      _id
      fullName
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

const CREATE_RISK_SCORE = gql`
  mutation CreateRiskScore($input: RiskScoreInput!) {
    createRiskScore(input: $input) {
      _id
    }
  }
`;

const UPDATE_RISK_SCORE = gql`
  mutation UpdateRiskScore($id: ID!, $input: RiskScoreUpdateInput!) {
    updateRiskScore(id: $id, input: $input) {
      _id
    }
  }
`;

const DELETE_RISK_SCORE = gql`
  mutation DeleteRiskScore($id: ID!) {
    deleteRiskScore(id: $id)
  }
`;

export const RiskScoreList: React.FC = () => {
  const { data, loading, error, refetch } = useQuery(GET_RISK_SCORES);
  const { data: orgData, loading: orgLoading } = useQuery(GET_ORGANIZATIONS);
  const { data: userData, loading: userLoading } = useQuery(GET_USERS);
  const { data: docData, loading: docLoading } = useQuery(GET_DOCUMENTS);

  const [createRiskScore] = useMutation(CREATE_RISK_SCORE);
  const [updateRiskScore] = useMutation(UPDATE_RISK_SCORE);
  const [deleteRiskScore] = useMutation(DELETE_RISK_SCORE);

  // Modal management
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view' | null>(
    null
  );
  const [selectedRiskScore, setSelectedRiskScore] = useState<any>(null);
  const [isDialogOpen, setDialogOpen] = useState(false);

  // Ref for dialog content (needed for selects)
  const dialogContentRef = useRef<HTMLDivElement>(null);

  // Check if user is admin or has permission to manage alerts
  const isAdmin = useSelector(selectIsAdmin);
  const canRead = useSelector(selectHasPermission('READ_RISK_SCORES'));
  const canCreate = useSelector(selectHasPermission('CREATE_RISK_SCORES'));
  const canUpdate = useSelector(selectHasPermission('UPDATE_RISK_SCORES'));
  const canDelete = useSelector(selectHasPermission('DELETE_RISK_SCORES'));

  // Local formData state
  const [formData, setFormData] = useState({
    organizationId: [] as string[],
    documentId: [] as string[],
    userId: [] as string[],
    entityType: ['document'] as string[],
    score: '',
    rationale: '',
    scoreBreakdown: '',
    calculatedAt: new Date().toISOString().slice(0, 16),
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openModal = (mode: 'create' | 'edit' | 'view', risk?: any) => {
    if ((mode === 'edit' || mode === 'view') && risk) {
      setSelectedRiskScore(risk);
      setFormData({
        organizationId: [risk.organizationId],
        documentId: risk.documentId ? [risk.documentId] : [],
        userId: risk.userId ? [risk.userId] : [],
        entityType: [risk.entityType],
        score: risk.score.toString(),
        rationale: risk.rationale,
        scoreBreakdown: JSON.stringify(risk.scoreBreakdown, null, 2),
        // Convert ISO string to datetime-local format
        calculatedAt: new Date(Number(risk.calculatedAt))
          .toISOString()
          .slice(0, 16),
      });
    } else {
      // 'create' mode: reset form
      setSelectedRiskScore(null);
      setFormData({
        organizationId: [],
        documentId: [],
        userId: [],
        entityType: ['document'],
        score: '',
        rationale: '',
        scoreBreakdown: '',
        calculatedAt: new Date().toISOString().slice(0, 16),
      });
    }
    setModalMode(mode);
    setDialogOpen(true);
  };

  const closeModal = () => {
    setSelectedRiskScore(null);
    setModalMode(null);
    setDialogOpen(false);
    // Reset formData if desired
    setFormData({
      organizationId: [],
      documentId: [],
      userId: [],
      entityType: ['document'],
      score: '',
      rationale: '',
      scoreBreakdown: '',
      calculatedAt: new Date().toISOString().slice(0, 16),
    });
  };

  const handleSubmit = async () => {
    try {
      const orgId = Array.isArray(formData.organizationId)
        ? formData.organizationId[0]
        : (formData.organizationId as unknown as string);
      const docId = Array.isArray(formData.documentId)
        ? formData.documentId[0]
        : (formData.documentId as unknown as string);
      const uId = Array.isArray(formData.userId)
        ? formData.userId[0]
        : (formData.userId as unknown as string);
      const entType = Array.isArray(formData.entityType)
        ? formData.entityType[0]
        : (formData.entityType as unknown as string);

      const input = {
        organizationId: orgId,
        documentId: docId || null,
        userId: uId || null,
        entityType: entType,
        score: parseFloat(formData.score),
        rationale: formData.rationale,
        scoreBreakdown: JSON.parse(formData.scoreBreakdown),
        calculatedAt: new Date(formData.calculatedAt).toISOString(),
      };

      if (modalMode === 'create' && (canCreate || isAdmin)) {
        await createRiskScore({ variables: { input } });
      } else if (
        modalMode === 'edit' &&
        selectedRiskScore &&
        (canUpdate || isAdmin)
      ) {
        await updateRiskScore({
          variables: { id: selectedRiskScore._id, input },
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
        alert('You do not have permission to delete risk scores');
        return;
      }
      await deleteRiskScore({ variables: { id } });
      await refetch();
    } catch (err: any) {
      alert('Error deleting risk score: ' + err.message);
      console.error(err);
    }
  };

  if (loading || orgLoading || userLoading || docLoading)
    return <Text>Loading...</Text>;
  if (error) return <Text>Error loading risk scores</Text>;

  if (!isAdmin && !canRead) {
    return (
      <Box p={4}>
        <Text color="red.500">
          You do not have permission to view Risk Scores.
        </Text>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Stack direction="row" justify="space-between" mb={4}>
        <Heading size="md">Risk Scores</Heading>
        {(isAdmin || canCreate) && (
          <Button
            colorScheme="teal"
            onClick={() => openModal('create')}
            marginEnd="auto"
          >
            Create Risk Score
          </Button>
        )}
      </Stack>

      <Table.Root size="sm">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Entity</Table.ColumnHeader>
            <Table.ColumnHeader>Score</Table.ColumnHeader>
            <Table.ColumnHeader>Rationale</Table.ColumnHeader>
            <Table.ColumnHeader>Calculated At</Table.ColumnHeader>
            <Table.ColumnHeader>Organization</Table.ColumnHeader>
            <Table.ColumnHeader>User</Table.ColumnHeader>
            <Table.ColumnHeader>Document</Table.ColumnHeader>
            <Table.ColumnHeader>Actions</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {data.riskScores.map((risk: any) => (
            <Table.Row key={risk._id}>
              <Table.Cell>{risk.entityType}</Table.Cell>
              <Table.Cell>{risk.score}</Table.Cell>
              <Table.Cell>{risk.rationale}</Table.Cell>
              <Table.Cell>
                {new Date(risk.calculatedAt).toLocaleString()}
              </Table.Cell>
              <Table.Cell>{risk.organization?.name || '-'}</Table.Cell>
              <Table.Cell>{risk.user?.fullName || '-'}</Table.Cell>
              <Table.Cell>{risk.document?.name || '-'}</Table.Cell>
              <Table.Cell>
                <Button
                  size="sm"
                  onClick={() => openModal('view', risk)}
                  mr={2}
                >
                  View
                </Button>
                {(isAdmin || canUpdate) && (
                  <Button
                    size="sm"
                    onClick={() => openModal('edit', risk)}
                    mr={2}
                  >
                    Edit
                  </Button>
                )}
                {(isAdmin || canDelete) && (
                  <Button
                    size="sm"
                    colorScheme="red"
                    onClick={() => handleDelete(risk._id)}
                  >
                    Delete
                  </Button>
                )}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>

      {/* Chakra Dialog for Create/Edit/View RiskScore */}
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
                    ? 'Create Risk Score'
                    : modalMode === 'edit'
                    ? 'Edit Risk Score'
                    : 'View Risk Score'}
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
                {modalMode === 'view' && selectedRiskScore && (
                  <>
                    <Text>
                      <strong>Entity Type:</strong>{' '}
                      {selectedRiskScore.entityType}
                    </Text>
                    <Text>
                      <strong>Score:</strong> {selectedRiskScore.score}
                    </Text>
                    <Text>
                      <strong>Rationale:</strong> {selectedRiskScore.rationale}
                    </Text>
                    <Text>
                      <strong>Score Breakdown:</strong>{' '}
                      {JSON.stringify(
                        selectedRiskScore.scoreBreakdown,
                        null,
                        2
                      )}
                    </Text>
                    <Text>
                      <strong>Calculated At:</strong>{' '}
                      {new Date(
                        Number(selectedRiskScore.calculatedAt)
                      ).toLocaleString()}
                    </Text>
                    <Text>
                      <strong>Organization:</strong>{' '}
                      {selectedRiskScore.organization?.name || '-'}
                    </Text>
                    <Text>
                      <strong>User:</strong>{' '}
                      {selectedRiskScore.user?.fullName || '-'}
                    </Text>
                    <Text>
                      <strong>Document:</strong>{' '}
                      {selectedRiskScore.document?.name || '-'}
                    </Text>
                  </>
                )}

                {(modalMode === 'create' || modalMode === 'edit') && (
                  <RiskScoreForm
                    mode={modalMode!}
                    formData={formData}
                    organizations={orgData.organizations}
                    users={userData.users}
                    documents={docData.documents}
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
