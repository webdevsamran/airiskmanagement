// DocumentList.tsx
import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Heading,
  Stack,
  Text,
  HStack,
  CloseButton,
  Dialog,
  Portal,
  Table,
} from '@chakra-ui/react';
import { gql, useQuery, useMutation } from '@apollo/client';
import { useSelector } from 'react-redux';
import { selectIsAdmin, selectHasPermission } from '../store/authSlice';
import { DocumentForm } from './DocumentForm';

// ———————————————————————————————
// GraphQL Queries & Mutations
// ———————————————————————————————
const GET_DOCUMENTS = gql`
  query GetDocuments {
    documents {
      _id
      name
      type
      tags
      contentHash
      aiSummary
      classification {
        pii
        phi
        financial
        confidential
      }
      version
      previousVersionId
      storageUrl
      createdAt
      updatedAt

      organization {
        _id
        name
        industry
        domain
        tier
        regulatoryFrameworks
        createdAt
        updatedAt
      }

      uploadedByUser {
        _id
        email
        fullName
        roleId
        organizationId
        status
        mfaEnabled
        lastLoginAt
        createdAt
        updatedAt
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

const CREATE_DOCUMENT = gql`
  mutation CreateDocument($input: CreateDocumentInput!) {
    createDocument(input: $input) {
      _id
      name
    }
  }
`;

const UPDATE_DOCUMENT = gql`
  mutation UpdateDocument($id: ID!, $input: UpdateDocumentInput!) {
    updateDocument(id: $id, input: $input) {
      _id
      name
    }
  }
`;

const DELETE_DOCUMENT = gql`
  mutation DeleteDocument($id: ID!) {
    deleteDocument(id: $id)
  }
`;

// ———————————————————————————————
// DocumentList Component
// ———————————————————————————————
export const DocumentList: React.FC = () => {
  // 1) Fetch all documents
  const {
    data: docData,
    loading: docLoading,
    error: docError,
    refetch: refetchDocs,
  } = useQuery(GET_DOCUMENTS);

  // 2) Fetch organizations for the form's select
  const { data: orgData, loading: orgLoading } = useQuery(GET_ORGANIZATIONS);

  // 3) Prepare mutations
  const [createDocument] = useMutation(CREATE_DOCUMENT);
  const [updateDocument] = useMutation(UPDATE_DOCUMENT);
  const [deleteDocument] = useMutation(DELETE_DOCUMENT);

  // 4) Modal & selection state
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view' | null>(
    null
  );
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [isDialogOpen, setDialogOpen] = useState(false);

  // Check if user is admin or has permission to manage alerts
  const isAdmin = useSelector(selectIsAdmin);
  const canRead = useSelector(selectHasPermission('READ_DOCUMENTS'));
  const canCreate = useSelector(selectHasPermission('CREATE_DOCUMENTS'));
  const canUpdate = useSelector(selectHasPermission('UPDATE_DOCUMENTS'));
  const canDelete = useSelector(selectHasPermission('DELETE_DOCUMENTS'));

  // 5) Form state (including `file: File | null` separately)
  const [formData, setFormData] = useState<{
    name: string;
    type: string;
    tags: string;
    organizationId: string[];
    file: File | null;
  }>({
    name: '',
    type: '',
    tags: '',
    organizationId: [],
    file: null,
  });

  // 6) Ref for dialog content (for Select portal)
  const dialogContentRef = useRef<HTMLDivElement>(null);

  // 7) Open modal in create or edit mode
  const openModal = (mode: 'create' | 'edit' | 'view', doc: any = null) => {
    if ((mode === 'edit' || mode === 'view') && doc) {
      setSelectedDocument(doc);
      setFormData({
        name: doc.name,
        type: doc.type,
        tags: doc.tags.join(', '),
        organizationId: [doc.organization._id],
        file: null, // user may re‐upload if desired
      });
    } else {
      setSelectedDocument(null);
      setFormData({
        name: '',
        type: '',
        tags: '',
        organizationId: [],
        file: null,
      });
    }
    setModalMode(mode);
    setDialogOpen(true);
  };

  // 8) Close modal & reset
  const closeModal = () => {
    setSelectedDocument(null);
    setModalMode(null);
    setDialogOpen(false);
    setFormData({
      name: '',
      type: '',
      tags: '',
      organizationId: [],
      file: null,
    });
  };

  // 9) Handle text inputs (name, type, tags)
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 10) Handle Select changes (organizationId)
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 11) Handle file input
  const handleFileChange = (file: File | null) => {
    setFormData((prev) => ({ ...prev, file }));
  };

  // 12) Called on form submit (create or update)
  const handleSubmit = async () => {
    // Convert comma-separated tags → string[]
    const tagsArray = formData.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length);

    // Build the “input” that matches CreateDocumentInput / UpdateDocumentInput
    const input: any = {
      name: formData.name,
      type: formData.type,
      tags: tagsArray,
      organizationId: formData.organizationId[0] || '', // Ensure it's a string
    };

    // Only attach `file` if user actually selected one
    if (formData.file) {
      input.file = formData.file; // <-- this must be the real File object
    }

    console.log('Submitting input:', input);

    try {
      if (modalMode === 'create' && (canCreate || isAdmin)) {
        await createDocument({
          variables: { input },
        });
      } else if (
        modalMode === 'edit' &&
        selectedDocument &&
        (canUpdate || isAdmin)
      ) {
        // If editing, pass the same “input” shape. If no file re-uploaded, `input.file` is undefined and the server will skip it.
        await updateDocument({
          variables: { id: selectedDocument._id, input },
        });
      }

      // Refresh the list and close
      await refetchDocs();
      closeModal();
    } catch (err: any) {
      console.error('Submission error:', err);
    }
  };

  // 13) Delete handler
  const handleDelete = async (id: string) => {
    try {
      if (!canDelete && !isAdmin) {
        console.error('You do not have permission to delete documents');
        return;
      }
      await deleteDocument({ variables: { id } });
      await refetchDocs();
    } catch (err: any) {
      console.error('Error deleting document:', err);
    }
  };

  // 14) Loading / Error states
  if (docLoading || orgLoading) return <Text>Loading...</Text>;
  if (docError) return <Text>Error loading documents</Text>;

  if (!isAdmin && !canRead) {
    return (
      <Box p={4}>
        <Text color="red.500">
          You do not have permission to view documents.
        </Text>
      </Box>
    );
  }

  return (
    <Box p={4}>
      {/* Header and "Add Document" button */}
      <Stack direction="row" justify="space-between" mb={4}>
        <Heading size="md">Documents</Heading>
        {(isAdmin || canCreate) && (
          <Button colorScheme="teal" onClick={() => openModal('create')}>
            Add Document
          </Button>
        )}
      </Stack>

      {/* Documents Table */}
      <Table.Root size="md">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Name</Table.ColumnHeader>
            <Table.ColumnHeader>Type</Table.ColumnHeader>
            <Table.ColumnHeader>Tags</Table.ColumnHeader>
            <Table.ColumnHeader>Organization</Table.ColumnHeader>
            <Table.ColumnHeader>Actions</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {docData.documents.map((doc: any) => (
            <Table.Row key={doc._id}>
              <Table.Cell>{doc.name}</Table.Cell>
              <Table.Cell>{doc.type}</Table.Cell>
              <Table.Cell>{doc.tags.join(', ')}</Table.Cell>
              <Table.Cell>{doc.organization?.name}</Table.Cell>
              <Table.Cell>
                <HStack spacing={2}>
                  <Button size="sm" onClick={() => openModal('view', doc)}>
                    View
                  </Button>
                  {(isAdmin || canUpdate) && (
                    <Button size="sm" onClick={() => openModal('edit', doc)}>
                      Edit
                    </Button>
                  )}
                  {(isAdmin || canDelete) && (
                    <Button
                      size="sm"
                      colorScheme="red"
                      onClick={() => handleDelete(doc._id)}
                    >
                      Delete
                    </Button>
                  )}
                </HStack>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>

      {/* Dialog (Create / Edit Document) */}
      <Dialog.Root
        size="cover"
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) closeModal();
        }}
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content ref={dialogContentRef}>
              <Dialog.Header>
                <Dialog.Title>
                  {modalMode === 'create'
                    ? 'Create Document'
                    : modalMode === 'edit'
                    ? 'Edit Document'
                    : modalMode === 'view'
                    ? 'View Document'
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
                {modalMode === 'view' && selectedDocument && (
                  <Table.Root size="md">
                    <Table.Body>
                      {/* Row 1 */}
                      <Table.Row>
                        <Table.Cell>
                          <strong>Name</strong>
                        </Table.Cell>
                        <Table.Cell>{selectedDocument.name}</Table.Cell>
                        <Table.Cell>
                          <strong>Type</strong>
                        </Table.Cell>
                        <Table.Cell>{selectedDocument.type}</Table.Cell>
                      </Table.Row>

                      {/* Row 2 */}
                      <Table.Row>
                        <Table.Cell>
                          <strong>Tags</strong>
                        </Table.Cell>
                        <Table.Cell>
                          {selectedDocument.tags.join(', ')}
                        </Table.Cell>
                        <Table.Cell>
                          <strong>Content Hash</strong>
                        </Table.Cell>
                        <Table.Cell>{selectedDocument.contentHash}</Table.Cell>
                      </Table.Row>

                      {/* Row 3 */}
                      <Table.Row>
                        <Table.Cell>
                          <strong>AI Summary</strong>
                        </Table.Cell>
                        <Table.Cell>
                          {selectedDocument.aiSummary || '—'}
                        </Table.Cell>
                        <Table.Cell>
                          <strong>Version</strong>
                        </Table.Cell>
                        <Table.Cell>{selectedDocument.version}</Table.Cell>
                      </Table.Row>

                      {/* Row 4 */}
                      <Table.Row>
                        <Table.Cell>
                          <strong>Previous Version ID</strong>
                        </Table.Cell>
                        <Table.Cell>
                          {selectedDocument.previousVersionId || '—'}
                        </Table.Cell>
                        <Table.Cell>
                          <strong>Storage URL</strong>
                        </Table.Cell>
                        <Table.Cell>
                          <a
                            href={selectedDocument.storageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {selectedDocument.storageUrl}
                          </a>
                        </Table.Cell>
                      </Table.Row>

                      {/* Row 5 - Classification */}
                      <Table.Row>
                        <Table.Cell>
                          <strong>PII</strong>
                        </Table.Cell>
                        <Table.Cell>
                          {selectedDocument.classification.pii ? 'Yes' : 'No'}
                        </Table.Cell>
                        <Table.Cell>
                          <strong>PHI</strong>
                        </Table.Cell>
                        <Table.Cell>
                          {selectedDocument.classification.phi ? 'Yes' : 'No'}
                        </Table.Cell>
                      </Table.Row>

                      <Table.Row>
                        <Table.Cell>
                          <strong>Financial</strong>
                        </Table.Cell>
                        <Table.Cell>
                          {selectedDocument.classification.financial
                            ? 'Yes'
                            : 'No'}
                        </Table.Cell>
                        <Table.Cell>
                          <strong>Confidential</strong>
                        </Table.Cell>
                        <Table.Cell>
                          {selectedDocument.classification.confidential
                            ? 'Yes'
                            : 'No'}
                        </Table.Cell>
                      </Table.Row>

                      {/* Row 6 - Dates */}
                      <Table.Row>
                        <Table.Cell>
                          <strong>Created At</strong>
                        </Table.Cell>
                        <Table.Cell>
                          {new Date(
                            Number(selectedDocument.createdAt)
                          ).toLocaleString()}
                        </Table.Cell>
                        <Table.Cell>
                          <strong>Updated At</strong>
                        </Table.Cell>
                        <Table.Cell>
                          {new Date(
                            Number(selectedDocument.updatedAt)
                          ).toLocaleString()}
                        </Table.Cell>
                      </Table.Row>

                      {/* Row 7 - Related Info */}
                      <Table.Row>
                        <Table.Cell>
                          <strong>Organization Name</strong>
                        </Table.Cell>
                        <Table.Cell>
                          {selectedDocument.organization.name}
                        </Table.Cell>
                        <Table.Cell>
                          <strong>Uploaded By</strong>
                        </Table.Cell>
                        <Table.Cell>
                          {selectedDocument.uploadedByUser.fullName}
                        </Table.Cell>
                      </Table.Row>
                    </Table.Body>
                  </Table.Root>
                )}

                {(modalMode === 'create' || modalMode === 'edit') && (
                  <DocumentForm
                    mode={modalMode}
                    formData={formData}
                    organizations={orgData.organizations}
                    onChange={handleChange}
                    onChangeSelect={handleSelectChange}
                    onFileChange={handleFileChange}
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
