import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Heading,
  Button,
  Dialog,
  Portal,
  Table,
  CloseButton,
} from '@chakra-ui/react';
import { gql, useQuery, useMutation } from '@apollo/client';
import { useSelector } from 'react-redux';
import { selectIsAdmin, selectHasPermission } from '../store/authSlice';
import { AuditLogForm } from './AuditLogForm';

// --------------------------------------
// 1) GraphQL Queries for AuditLogs + Lookups
// --------------------------------------
const GET_AUDIT_LOGS = gql`
  query GetAuditLogs {
    auditLogs {
      _id
      organizationId
      userId
      action
      resource
      resourceId
      ipAddress
      userAgent
      metadata
      timestamp
      user {
        _id
        fullName
      }
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

const GET_ORGANIZATIONS = gql`
  query GetOrganizations {
    organizations {
      _id
      name
    }
  }
`;

// const GET_DOCUMENTS = gql`
//   query GetDocuments {
//     documents {
//       _id
//       title
//     }
//   }
// `;

const GET_COMPLIANCE_RULES = gql`
  query GetComplianceRules {
    complianceRules {
      _id
      name
    }
  }
`;

// (…If you have Violations, Tasks, etc., you’d add:
//  const GET_VIOLATIONS = gql`query { violations { _id name } }`; )

// --------------------------------------
// 2) Mutations
// --------------------------------------
const CREATE_AUDIT_LOG = gql`
  mutation CreateAuditLog($input: AuditLogInput!) {
    createAuditLog(input: $input) {
      _id
    }
  }
`;

const UPDATE_AUDIT_LOG = gql`
  mutation UpdateAuditLog($id: ID!, $input: AuditLogUpdateInput!) {
    updateAuditLog(id: $id, input: $input) {
      _id
    }
  }
`;

const DELETE_AUDIT_LOG = gql`
  mutation DeleteAuditLog($id: ID!) {
    deleteAuditLog(id: $id)
  }
`;

// --------------------------------------
// 3) AuditLogList Component
// --------------------------------------
export const AuditLogList: React.FC = () => {
  // 3.1) Fetch all “lookup” collections plus auditLogs
  const {
    data: logsData,
    loading: logsLoading,
    refetch: refetchLogs,
  } = useQuery(GET_AUDIT_LOGS);

  const { data: userData, loading: userLoading } = useQuery(GET_USERS);

  const { data: orgData, loading: orgLoading } = useQuery(GET_ORGANIZATIONS);

  // const {
  //   data: docData,
  //   loading: docLoading,
  // } = useQuery(GET_DOCUMENTS);

  const { data: crData, loading: crLoading } = useQuery(GET_COMPLIANCE_RULES);

  // 3.2) Mutations
  const [createAuditLog] = useMutation(CREATE_AUDIT_LOG);
  const [updateAuditLog] = useMutation(UPDATE_AUDIT_LOG);
  const [deleteAuditLog] = useMutation(DELETE_AUDIT_LOG);

  // 3.3) Dialog state
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view' | null>(
    null
  );
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const dialogContentRef = useRef<HTMLDivElement>(null);

  // 3.4) formData drives all form fields
  const [formData, setFormData] = useState<any>({
    organizationId: [], // e.g. ['605c…']
    userId: [], // e.g. ['605d…']
    resource: [], // e.g. ['Document']
    resourceId: [], // e.g. ['607a…']
    action: '',
    ipAddress: '',
    userAgent: '',
    metadata: '',
    timestamp: '',
  });

  // Check if user is admin or has permission to manage alerts
  const isAdmin = useSelector(selectIsAdmin);
  const canRead = useSelector(selectHasPermission('READ_AUDIT_LOG'));
  const canCreate = useSelector(selectHasPermission('CREATE_AUDIT_LOG'));
  const canUpdate = useSelector(selectHasPermission('UPDATE_AUDIT_LOG'));
  const canDelete = useSelector(selectHasPermission('DELETE_AUDIT_LOG'));

  // 3.5) When we “Edit” or “View” an existing auditLog, populate formData
  useEffect(() => {
    if ((modalMode === 'edit' || modalMode === 'view') && selectedLog) {
      setFormData({
        organizationId: [selectedLog.organizationId],
        userId: [selectedLog.userId],
        resource: [selectedLog.resource],
        resourceId: [selectedLog.resourceId],
        action: selectedLog.action,
        ipAddress: selectedLog.ipAddress,
        userAgent: selectedLog.userAgent,
        metadata: JSON.stringify(selectedLog.metadata || {}, null, 2),
        timestamp: selectedLog.timestamp,
      });
    }
  }, [modalMode, selectedLog]);

  // 3.6) Show loading state if any of the queries are still in progress
  if (
    logsLoading ||
    userLoading ||
    orgLoading ||
    // docLoading ||
    crLoading
  ) {
    return <Box p={4}>Loading…</Box>;
  }

  // 3.7) Helper: lookup display‐names by ID
  const lookupOrgName = (orgId: string) => {
    return orgData.organizations.find((o: any) => o._id === orgId)?.name || '—';
  };
  const lookupUserName = (userId: string) => {
    return userData.users.find((u: any) => u._id === userId)?.fullName || '—';
  };

  // 3.8) Create new audit log
  const handleNew = () => {
    setSelectedLog(null);
    setFormData({
      organizationId: [],
      userId: [],
      resource: [],
      resourceId: [],
      action: '',
      ipAddress: '',
      userAgent: '',
      metadata: '',
      timestamp: '',
    });
    setModalMode('create');
    setDialogOpen(true);
  };

  // 3.9) Edit an existing audit log
  const handleEdit = (log: any) => {
    setSelectedLog(log);
    setModalMode('edit');
    setDialogOpen(true);
  };

  // 3.10) View a log (readonly)
  const handleView = (log: any) => {
    setSelectedLog(log);
    setModalMode('view');
    setDialogOpen(true);
  };

  // 3.11) Delete a log
  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this audit log?')) return;
    try {
      if (!canDelete && !isAdmin) {
        alert('You do not have permission to delete audit logs.');
        return;
      }
      await deleteAuditLog({ variables: { id } });
      alert('Audit log deleted successfully.');
      await refetchLogs();
    } catch (err: any) {
      alert(`Error deleting audit log: ${err.message || 'Unknown error'}`);
      console.error(err);
    }
  };

  // 3.12) Update formData when any input/select changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (
    fieldName: 'organizationId' | 'userId' | 'resource' | 'resourceId',
    value: string
  ) => {
    setFormData((prev: any) => ({ ...prev, [fieldName]: value }));
  };

  // 3.13) On submit, call create or update mutation
  const handleSubmit = async () => {
    // parse metadata JSON safely (fallback to {} if invalid)
    console.log("formData.metadata:", formData.metadata);
    const metadataObj = (() => {
      try {
        return JSON.parse(formData.metadata);
      } catch {
        return {};
      }
    })();
    console.log("metadataObj:", metadataObj);
    console.log("formData:", formData);

    try {
      const orgID = formData.organizationId[0] || '';
      const userID = formData.userId[0] || '';
      const resType = formData.resource[0] || '';
      const resID = formData.resourceId[0] || '';

      if (modalMode === 'create' && (canCreate || isAdmin)) {
        await createAuditLog({
          variables: {
            input: {
              organizationId: orgID,
              userId: userID,
              action: formData.action,
              resource: resType,
              resourceId: resID,
              ipAddress: formData.ipAddress,
              userAgent: formData.userAgent,
              metadata: metadataObj,
              // timestamp omitted so server defaults to Date.now
            },
          },
        });
        alert('Audit log created successfully.');
      } else if (
        modalMode === 'edit' &&
        selectedLog?._id &&
        (canUpdate || isAdmin)
      ) {
        await updateAuditLog({
          variables: {
            id: selectedLog._id,
            input: {
              organizationId: orgID,
              userId: userID,
              action: formData.action,
              resource: resType,
              resourceId: resID,
              ipAddress: formData.ipAddress,
              userAgent: formData.userAgent,
              metadata: metadataObj,
              timestamp: formData.timestamp,
            },
          },
        });
        alert('Audit log updated successfully.');
      }

      await refetchLogs();
      setDialogOpen(false);
    } catch (err: any) {
      alert(`Error saving audit log: ${err.message || 'Unknown error'}`);
      console.error(err);
    }
  };

  if (!isAdmin && !canRead) {
    return (
      <Box p={4}>
        <Text color="red.500">
          You do not have permission to view audit logs.
        </Text>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Heading size="md" mb={4}>
        Audit Logs
      </Heading>
      {(isAdmin || canCreate) && (
        <Button colorScheme="green" onClick={handleNew}>
          New Audit Log
        </Button>
      )}

      {/* ──────────────── Main List Table ──────────────── */}
      <Table.Root mt={4} size="sm">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Organization</Table.ColumnHeader>
            <Table.ColumnHeader>User</Table.ColumnHeader>
            <Table.ColumnHeader>Action</Table.ColumnHeader>
            <Table.ColumnHeader>Resource</Table.ColumnHeader>
            <Table.ColumnHeader>IP Address</Table.ColumnHeader>
            <Table.ColumnHeader>Timestamp</Table.ColumnHeader>
            <Table.ColumnHeader>Actions</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {logsData.auditLogs.map((log: any) => (
            <Table.Row key={log._id}>
              <Table.Cell>{lookupOrgName(log.organizationId)}</Table.Cell>
              <Table.Cell>{lookupUserName(log.userId)}</Table.Cell>
              <Table.Cell>{log.action}</Table.Cell>
              <Table.Cell>{log.resource}</Table.Cell>
              <Table.Cell>{log.ipAddress}</Table.Cell>
              <Table.Cell>
                {new Date(Number(log.timestamp)).toLocaleString()}
              </Table.Cell>
              <Table.Cell>
                <Button
                  size="xs"
                  mr={2}
                  colorScheme="blue"
                  onClick={() => handleView(log)}
                >
                  View
                </Button>
                {(isAdmin || canUpdate) && (
                  <Button size="xs" mr={2} onClick={() => handleEdit(log)}>
                    Edit
                  </Button>
                )}
                {(isAdmin || canDelete) && (
                  <Button
                    size="xs"
                    colorScheme="red"
                    onClick={() => handleDelete(log._id)}
                  >
                    Delete
                  </Button>
                )}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>

      {/* ──────────────── Modal Dialog ──────────────── */}
      <Dialog.Root
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) setDialogOpen(false);
        }}
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content size="lg" ref={dialogContentRef}>
              <Dialog.Header>
                <Dialog.Title>
                  {modalMode === 'create'
                    ? 'Create Audit Log'
                    : modalMode === 'edit'
                    ? 'Edit Audit Log'
                    : 'View Audit Log'}
                </Dialog.Title>
                <Dialog.CloseTrigger asChild>
                  <CloseButton
                    size="sm"
                    position="absolute"
                    top="1rem"
                    right="1rem"
                    onClick={() => setDialogOpen(false)}
                  />
                </Dialog.CloseTrigger>
              </Dialog.Header>

              <Dialog.Body>
                {modalMode === 'view' && selectedLog && (
                  <Box overflowX="auto">
                    <Table.Root size="sm">
                      <Table.Body>
                        <Table.Row>
                          <Table.Cell>
                            <strong>Organization</strong>
                          </Table.Cell>
                          <Table.Cell>
                            {lookupOrgName(selectedLog.organizationId)}
                          </Table.Cell>
                        </Table.Row>
                        <Table.Row>
                          <Table.Cell>
                            <strong>User</strong>
                          </Table.Cell>
                          <Table.Cell>
                            {lookupUserName(selectedLog.userId)}
                          </Table.Cell>
                        </Table.Row>
                        <Table.Row>
                          <Table.Cell>
                            <strong>Action</strong>
                          </Table.Cell>
                          <Table.Cell>{selectedLog.action}</Table.Cell>
                        </Table.Row>
                        <Table.Row>
                          <Table.Cell>
                            <strong>Resource</strong>
                          </Table.Cell>
                          <Table.Cell>{selectedLog.resource}</Table.Cell>
                        </Table.Row>
                        <Table.Row>
                          <Table.Cell>
                            <strong>Resource ID</strong>
                          </Table.Cell>
                          <Table.Cell>{selectedLog.resourceId}</Table.Cell>
                        </Table.Row>
                        <Table.Row>
                          <Table.Cell>
                            <strong>IP Address</strong>
                          </Table.Cell>
                          <Table.Cell>{selectedLog.ipAddress}</Table.Cell>
                        </Table.Row>
                        <Table.Row>
                          <Table.Cell>
                            <strong>User Agent</strong>
                          </Table.Cell>
                          <Table.Cell>{selectedLog.userAgent}</Table.Cell>
                        </Table.Row>
                        <Table.Row>
                          <Table.Cell>
                            <strong>Metadata</strong>
                          </Table.Cell>
                          <Table.Cell>
                            <pre>
                              {JSON.stringify(
                                selectedLog.metadata || {},
                                null,
                                2
                              )}
                            </pre>
                          </Table.Cell>
                        </Table.Row>
                        <Table.Row>
                          <Table.Cell>
                            <strong>Timestamp</strong>
                          </Table.Cell>
                          <Table.Cell>
                            {new Date(
                              Number(selectedLog.timestamp)
                            ).toLocaleString()}
                          </Table.Cell>
                        </Table.Row>
                      </Table.Body>
                    </Table.Root>

                    <Box textAlign="right" mt={4}>
                      <Button onClick={() => setDialogOpen(false)}>
                        Close
                      </Button>
                    </Box>
                  </Box>
                )}

                {(modalMode === 'create' || modalMode === 'edit') && (
                  <AuditLogForm
                    mode={modalMode}
                    formData={formData}
                    organizations={orgData.organizations}
                    users={userData.users}
                    // documents={docData.documents}
                    complianceRules={crData.complianceRules}
                    onChange={handleChange}
                    onChangeSelect={handleSelectChange}
                    onSubmit={handleSubmit}
                    onCancel={() => setDialogOpen(false)}
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
