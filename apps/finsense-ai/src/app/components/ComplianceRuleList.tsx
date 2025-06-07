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
import { ComplianceRuleForm } from './ComplianceRuleForm';

// ------------------------------------
// GraphQL Queries & Mutations (unchanged)
// ------------------------------------

const GET_COMPLIANCE_RULES = gql`
  query GetComplianceRules {
    complianceRules {
      _id
      organizationId
      name
      description
      category
      severity
      logic {
        type
        expression
        languageModelConfig {
          provider
          model
          promptTemplate
        }
      }
      enabled
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

const CREATE_COMPLIANCE_RULE = gql`
  mutation CreateComplianceRule(
    $organizationId: ID!
    $name: String!
    $description: String
    $category: ComplianceCategory!
    $severity: ComplianceSeverity!
    $logic: ComplianceLogicInput!
    $enabled: Boolean
  ) {
    createComplianceRule(
      organizationId: $organizationId
      name: $name
      description: $description
      category: $category
      severity: $severity
      logic: $logic
      enabled: $enabled
    ) {
      _id
    }
  }
`;

const UPDATE_COMPLIANCE_RULE = gql`
  mutation UpdateComplianceRule(
    $id: ID!
    $name: String
    $description: String
    $category: ComplianceCategory
    $severity: ComplianceSeverity
    $logic: ComplianceLogicInput
    $enabled: Boolean
  ) {
    updateComplianceRule(
      id: $id
      name: $name
      description: $description
      category: $category
      severity: $severity
      logic: $logic
      enabled: $enabled
    ) {
      _id
    }
  }
`;

const DELETE_COMPLIANCE_RULE = gql`
  mutation DeleteComplianceRule($id: ID!) {
    deleteComplianceRule(id: $id)
  }
`;

// ------------------------------------
// Component
// ------------------------------------

export const ComplianceRuleList: React.FC = () => {
  const {
    data: rulesData,
    loading: rulesLoading,
    refetch: refetchRules,
  } = useQuery(GET_COMPLIANCE_RULES);
  const { data: orgData, loading: orgLoading } = useQuery(GET_ORGANIZATIONS);

  const [createRule] = useMutation(CREATE_COMPLIANCE_RULE);
  const [updateRule] = useMutation(UPDATE_COMPLIANCE_RULE);
  const [deleteRule] = useMutation(DELETE_COMPLIANCE_RULE);

  // modalMode can be 'create' | 'edit' | 'view' | null
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view' | null>(
    null
  );
  const [selectedRule, setSelectedRule] = useState<any>(null);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const dialogContentRef = useRef<HTMLDivElement>(null);

  // Check if user is admin or has permission to manage alerts
  const isAdmin = useSelector(selectIsAdmin);
  const canRead = useSelector(selectHasPermission('READ_COMPLIANCE_RULE'));
  const canCreate = useSelector(selectHasPermission('CREATE_COMPLIANCE_RULE'));
  const canUpdate = useSelector(selectHasPermission('UPDATE_COMPLIANCE_RULE'));
  const canDelete = useSelector(selectHasPermission('DELETE_COMPLIANCE_RULE'));

  // formData drives all form fields (for create/edit)
  const [formData, setFormData] = useState<any>({
    organizationId: [] as string[],
    name: '',
    description: '',
    category: [] as string[],
    severity: [] as string[],
    logicType: [] as string[],
    expression: '',
    languageModelProvider: [] as string[],
    model: '',
    promptTemplate: '',
    enabled: true,
  });

  // Populate formData on edit/view
  useEffect(() => {
    if ((modalMode === 'edit' || modalMode === 'view') && selectedRule) {
      setFormData({
        organizationId: [selectedRule.organizationId],
        name: selectedRule.name,
        description: selectedRule.description || '',
        category: [selectedRule.category],
        severity: [selectedRule.severity],
        logicType: [selectedRule.logic.type],
        expression: selectedRule.logic.expression,
        languageModelProvider:
          selectedRule.logic.type === 'llm'
            ? [selectedRule.logic.languageModelConfig.provider]
            : [],
        model:
          selectedRule.logic.type === 'llm'
            ? selectedRule.logic.languageModelConfig.model
            : '',
        promptTemplate:
          selectedRule.logic.type === 'llm'
            ? selectedRule.logic.languageModelConfig.promptTemplate
            : '',
        enabled: selectedRule.enabled,
      });
    }
  }, [modalMode, selectedRule]);

  if (rulesLoading || orgLoading) {
    return <Box p={4}>Loading…</Box>;
  }

  // --- Handlers for Create / Edit / View / Delete ---

  const handleNew = () => {
    setSelectedRule(null);
    setFormData({
      organizationId: [],
      name: '',
      description: '',
      category: ['privacy'],
      severity: ['low'],
      logicType: ['regex'],
      expression: '',
      languageModelProvider: ['openai'],
      model: '',
      promptTemplate: '',
      enabled: true,
    });
    setModalMode('create');
    setDialogOpen(true);
  };

  const handleEdit = (rule: any) => {
    setSelectedRule(rule);
    setModalMode('edit');
    setDialogOpen(true);
  };

  const handleView = (rule: any) => {
    setSelectedRule(rule);
    setModalMode('view');
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this compliance rule?')) return;
    try {
      if (!canDelete && !isAdmin) {
        alert('You do not have permission to delete compliance rules.');
        return;
      }
      await deleteRule({ variables: { id } });
      alert('Rule deleted successfully.');
      await refetchRules();
    } catch (err: any) {
      alert(`Error deleting rule: ${err.message || 'Unknown error'}`);
      console.log('Error deleting rule:', err.message);
    }
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
    const orgId = Array.isArray(formData.organizationId)
      ? formData.organizationId[0]
      : formData.organizationId;
    const category = Array.isArray(formData.category)
      ? formData.category[0]
      : formData.category;
    const severity = Array.isArray(formData.severity)
      ? formData.severity[0]
      : formData.severity;
    const logicType = Array.isArray(formData.logicType)
      ? formData.logicType[0]
      : formData.logicType;
    const provider = Array.isArray(formData.languageModelProvider)
      ? formData.languageModelProvider[0]
      : formData.languageModelProvider;

    const logicInput: any = {
      type: logicType,
      expression: formData.expression,
    };
    if (logicType === 'llm') {
      logicInput.languageModelConfig = {
        provider,
        model: formData.model,
        promptTemplate: formData.promptTemplate,
      };
    }

    try {
      if (modalMode === 'create' && (canCreate || isAdmin)) {
        await createRule({
          variables: {
            organizationId: orgId,
            name: formData.name,
            description: formData.description,
            category,
            severity,
            logic: logicInput,
            enabled: formData.enabled,
          },
        });
        alert('Rule created successfully.');
      } else if (
        modalMode === 'edit' &&
        selectedRule?._id &&
        (canUpdate || isAdmin)
      ) {
        await updateRule({
          variables: {
            id: selectedRule._id,
            name: formData.name,
            description: formData.description,
            category,
            severity,
            logic: logicInput,
            enabled: formData.enabled,
          },
        });
        alert('Rule updated successfully.');
      }
      await refetchRules();
      setDialogOpen(false);
    } catch (err: any) {
      alert(`Error saving rule: ${err.message || 'Unknown error'}`);
      console.log('Error saving rule:', err.message);
    }
  };

  // Helper to find organization name by ID
  const lookupOrgName = (orgId: string) => {
    return orgData.organizations.find((o: any) => o._id === orgId)?.name || '—';
  };

  if (!isAdmin && !canRead) {
    return (
      <Box p={4}>
        <Text color="red.500">
          You do not have permission to view Compliance rules.
        </Text>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Heading size="md" mb={4}>
        Compliance Rules
      </Heading>
      {(isAdmin || canCreate) && (
        <Button colorScheme="green" onClick={handleNew}>
          New Rule
        </Button>
      )}

      {/* ──────── Main List Table ──────── */}
      <Table.Root mt={4} size="sm">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Organization</Table.ColumnHeader>
            <Table.ColumnHeader>Name</Table.ColumnHeader>
            <Table.ColumnHeader>Category</Table.ColumnHeader>
            <Table.ColumnHeader>Severity</Table.ColumnHeader>
            <Table.ColumnHeader>Type</Table.ColumnHeader>
            <Table.ColumnHeader>Enabled</Table.ColumnHeader>
            <Table.ColumnHeader>Actions</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {rulesData?.complianceRules.map((rule: any) => (
            <Table.Row key={rule._id}>
              <Table.Cell>{lookupOrgName(rule.organizationId)}</Table.Cell>
              <Table.Cell>{rule.name}</Table.Cell>
              <Table.Cell>{rule.category}</Table.Cell>
              <Table.Cell>{rule.severity}</Table.Cell>
              <Table.Cell>{rule.logic.type}</Table.Cell>
              <Table.Cell>{rule.enabled ? 'Yes' : 'No'}</Table.Cell>
              <Table.Cell>
                <Button
                  size="xs"
                  mr={2}
                  colorScheme="blue"
                  onClick={() => handleView(rule)}
                >
                  View
                </Button>
                {(isAdmin || canUpdate) && (
                  <Button size="xs" mr={2} onClick={() => handleEdit(rule)}>
                    Edit
                  </Button>
                )}
                {(isAdmin || canDelete) && (
                  <Button
                    size="xs"
                    colorScheme="red"
                    onClick={() => handleDelete(rule._id)}
                  >
                    Delete
                  </Button>
                )}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>

      {/* ──────── Modal Dialog ──────── */}
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
                    ? 'Create Compliance Rule'
                    : modalMode === 'edit'
                    ? 'Edit Compliance Rule'
                    : 'View Compliance Rule'}
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
                {modalMode === 'view' && selectedRule && (
                  <Box overflowX="auto">
                    {/* ──────── View Table (using Table.Root) ──────── */}
                    <Table.Root size="sm">
                      <Table.Body>
                        <Table.Row>
                          <Table.Cell>
                            <strong>Organization</strong>
                          </Table.Cell>
                          <Table.Cell>
                            {lookupOrgName(selectedRule.organizationId)}
                          </Table.Cell>
                        </Table.Row>
                        <Table.Row>
                          <Table.Cell>
                            <strong>Name</strong>
                          </Table.Cell>
                          <Table.Cell>{selectedRule.name}</Table.Cell>
                        </Table.Row>
                        <Table.Row>
                          <Table.Cell>
                            <strong>Description</strong>
                          </Table.Cell>
                          <Table.Cell>
                            {selectedRule.description || '—'}
                          </Table.Cell>
                        </Table.Row>
                        <Table.Row>
                          <Table.Cell>
                            <strong>Category</strong>
                          </Table.Cell>
                          <Table.Cell>{selectedRule.category}</Table.Cell>
                        </Table.Row>
                        <Table.Row>
                          <Table.Cell>
                            <strong>Severity</strong>
                          </Table.Cell>
                          <Table.Cell>{selectedRule.severity}</Table.Cell>
                        </Table.Row>
                        <Table.Row>
                          <Table.Cell>
                            <strong>Logic Type</strong>
                          </Table.Cell>
                          <Table.Cell>{selectedRule.logic.type}</Table.Cell>
                        </Table.Row>
                        <Table.Row>
                          <Table.Cell>
                            <strong>Expression</strong>
                          </Table.Cell>
                          <Table.Cell>
                            {selectedRule.logic.expression}
                          </Table.Cell>
                        </Table.Row>
                        {selectedRule.logic.type === 'llm' && (
                          <>
                            <Table.Row>
                              <Table.Cell>
                                <strong>LLM Provider</strong>
                              </Table.Cell>
                              <Table.Cell>
                                {
                                  selectedRule.logic.languageModelConfig
                                    .provider
                                }
                              </Table.Cell>
                            </Table.Row>
                            <Table.Row>
                              <Table.Cell>
                                <strong>Model</strong>
                              </Table.Cell>
                              <Table.Cell>
                                {selectedRule.logic.languageModelConfig.model}
                              </Table.Cell>
                            </Table.Row>
                            <Table.Row>
                              <Table.Cell>
                                <strong>Prompt Template</strong>
                              </Table.Cell>
                              <Table.Cell>
                                {
                                  selectedRule.logic.languageModelConfig
                                    .promptTemplate
                                }
                              </Table.Cell>
                            </Table.Row>
                          </>
                        )}
                        <Table.Row>
                          <Table.Cell>
                            <strong>Enabled</strong>
                          </Table.Cell>
                          <Table.Cell>
                            {selectedRule.enabled ? 'Yes' : 'No'}
                          </Table.Cell>
                        </Table.Row>
                      </Table.Body>
                    </Table.Root>

                    {/* Close Button below the table */}
                    <Box textAlign="right" mt={4}>
                      <Button onClick={() => setDialogOpen(false)}>
                        Close
                      </Button>
                    </Box>
                  </Box>
                )}

                {(modalMode === 'create' || modalMode === 'edit') && (
                  <ComplianceRuleForm
                    mode={modalMode!}
                    formData={formData}
                    organizations={orgData.organizations}
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
