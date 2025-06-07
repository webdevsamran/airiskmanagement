'use client';

import React from 'react';
import {
  Box,
  VStack,
  Input,
  Button,
  Portal,
  createListCollection,
  Field,
  Select as NewSelect,
} from '@chakra-ui/react';

type ViolationFormProps = {
  mode: 'create' | 'edit';
  formData: {
    organizationId: string[];
    ruleId: string[];
    documentId: string[];
    triggeredBy: string[];
    severity: string[];
    status: string[];
    resolutionNote: string;
    flaggedTextSnippet: string;
  };
  organizations: { _id: string; name: string }[];
  rules: { _id: string; name: string }[];
  documents: { _id: string; name: string }[];
  users: { _id: string; fullName: string }[];
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  onSubmit: () => void;
  onCancel: () => void;
  dialogContentRef?: React.RefObject<HTMLDivElement>;
};

export const ViolationForm: React.FC<ViolationFormProps> = ({
  mode,
  formData,
  organizations,
  rules,
  documents,
  users,
  onChange,
  onSubmit,
  onCancel,
  dialogContentRef,
}) => {
  const organizationCollection = createListCollection({
    items: organizations.map((org) => ({
      label: org.name,
      value: org._id,
    })),
  });

  const ruleCollection = createListCollection({
    items: rules.map((r) => ({
      label: r.name,
      value: r._id,
    })),
  });

  const documentCollection = createListCollection({
    items: documents.map((d) => ({
      label: d.name,
      value: d._id,
    })),
  });

  const userCollection = createListCollection({
    items: users.map((u) => ({
      label: u.fullName,
      value: u._id,
    })),
  });

  const severityCollection = createListCollection({
    items: [
      { label: 'low', value: 'low' },
      { label: 'medium', value: 'medium' },
      { label: 'high', value: 'high' },
      { label: 'critical', value: 'critical' },
    ],
  });

  const statusCollection = createListCollection({
    items: [
      { label: 'open', value: 'open' },
      { label: 'in_review', value: 'in_review' },
      { label: 'resolved', value: 'resolved' },
    ],
  });

  // Produce a synthetic‐event‐like object for select changes
  const handleSelectChange = (name: string, value: string) => {
    const event = {
      target: {
        name,
        value,
      },
    } as unknown as React.ChangeEvent<HTMLInputElement | HTMLSelectElement>;
    onChange(event);
  };

  return (
    <Box p={4} borderWidth="1px" borderRadius="md" mb={4}>
      <VStack spacing={4} align="stretch">
        {/* Organization */}
        {mode === 'create' && (
        <Field.Root>
          <Field.Label>Organization</Field.Label>
          <NewSelect.Root
            collection={organizationCollection}
            value={formData.organizationId}
            onValueChange={(e) =>
              handleSelectChange('organizationId', e.value)
            }
          >
            <NewSelect.HiddenSelect name="organizationId" />
            <NewSelect.Control>
              <NewSelect.Trigger>
                <NewSelect.ValueText placeholder="Select organization" />
              </NewSelect.Trigger>
              <NewSelect.IndicatorGroup>
                <NewSelect.Indicator />
              </NewSelect.IndicatorGroup>
            </NewSelect.Control>
            <Portal container={dialogContentRef}>
              <NewSelect.Positioner>
                <NewSelect.Content>
                  {organizationCollection.items.map((item) => (
                    <NewSelect.Item item={item} key={item.value}>
                      {item.label}
                      <NewSelect.ItemIndicator />
                    </NewSelect.Item>
                  ))}
                </NewSelect.Content>
              </NewSelect.Positioner>
            </Portal>
          </NewSelect.Root>
        </Field.Root>
        )}

        {/* Rule */}
        {mode === 'create' && (
        <Field.Root>
          <Field.Label>Compliance Rule</Field.Label>
          <NewSelect.Root
            collection={ruleCollection}
            value={formData.ruleId}
            onValueChange={(e) =>
              handleSelectChange('ruleId', e.value)
            }
          >
            <NewSelect.HiddenSelect name="ruleId" />
            <NewSelect.Control>
              <NewSelect.Trigger>
                <NewSelect.ValueText placeholder="Select rule" />
              </NewSelect.Trigger>
              <NewSelect.IndicatorGroup>
                <NewSelect.Indicator />
              </NewSelect.IndicatorGroup>
            </NewSelect.Control>
            <Portal container={dialogContentRef}>
              <NewSelect.Positioner>
                <NewSelect.Content>
                  {ruleCollection.items.map((item) => (
                    <NewSelect.Item item={item} key={item.value}>
                      {item.label}
                      <NewSelect.ItemIndicator />
                    </NewSelect.Item>
                  ))}
                </NewSelect.Content>
              </NewSelect.Positioner>
            </Portal>
          </NewSelect.Root>
        </Field.Root>
        )}

        {/* Document */}
        {mode === 'create' && (
        <Field.Root>
          <Field.Label>Document</Field.Label>
          <NewSelect.Root
            collection={documentCollection}
            value={formData.documentId}
            onValueChange={(e) =>
              handleSelectChange('documentId', e.value)
            }
          >
            <NewSelect.HiddenSelect name="documentId" />
            <NewSelect.Control>
              <NewSelect.Trigger>
                <NewSelect.ValueText placeholder="Select document" />
              </NewSelect.Trigger>
              <NewSelect.IndicatorGroup>
                <NewSelect.Indicator />
              </NewSelect.IndicatorGroup>
            </NewSelect.Control>
            <Portal container={dialogContentRef}>
              <NewSelect.Positioner>
                <NewSelect.Content>
                  {documentCollection.items.map((item) => (
                    <NewSelect.Item item={item} key={item.value}>
                      {item.label}
                      <NewSelect.ItemIndicator />
                    </NewSelect.Item>
                  ))}
                </NewSelect.Content>
              </NewSelect.Positioner>
            </Portal>
          </NewSelect.Root>
        </Field.Root>
        )}

        {/* Triggered By */}
        {mode === 'create' && (
        <Field.Root>
          <Field.Label>Triggered By</Field.Label>
          <NewSelect.Root
            collection={userCollection}
            value={formData.triggeredBy}
            onValueChange={(e) =>
              handleSelectChange('triggeredBy', e.value)
            }
          >
            <NewSelect.HiddenSelect name="triggeredBy" />
            <NewSelect.Control>
              <NewSelect.Trigger>
                <NewSelect.ValueText placeholder="Select user" />
              </NewSelect.Trigger>
              <NewSelect.IndicatorGroup>
                <NewSelect.Indicator />
              </NewSelect.IndicatorGroup>
            </NewSelect.Control>
            <Portal container={dialogContentRef}>
              <NewSelect.Positioner>
                <NewSelect.Content>
                  {userCollection.items.map((item) => (
                    <NewSelect.Item item={item} key={item.value}>
                      {item.label}
                      <NewSelect.ItemIndicator />
                    </NewSelect.Item>
                  ))}
                </NewSelect.Content>
              </NewSelect.Positioner>
            </Portal>
          </NewSelect.Root>
        </Field.Root>
        )}

        {/* Severity */}
        {mode === 'create' && (
        <Field.Root>
          <Field.Label>Severity</Field.Label>
          <NewSelect.Root
            collection={severityCollection}
            value={formData.severity}
            onValueChange={(e) =>
              handleSelectChange('severity', e.value)
            }
          >
            <NewSelect.HiddenSelect name="severity" />
            <NewSelect.Control>
              <NewSelect.Trigger>
                <NewSelect.ValueText placeholder="Select severity" />
              </NewSelect.Trigger>
              <NewSelect.IndicatorGroup>
                <NewSelect.Indicator />
              </NewSelect.IndicatorGroup>
            </NewSelect.Control>
            <Portal container={dialogContentRef}>
              <NewSelect.Positioner>
                <NewSelect.Content>
                  {severityCollection.items.map((item) => (
                    <NewSelect.Item item={item} key={item.value}>
                      {item.label}
                      <NewSelect.ItemIndicator />
                    </NewSelect.Item>
                  ))}
                </NewSelect.Content>
              </NewSelect.Positioner>
            </Portal>
          </NewSelect.Root>
        </Field.Root>
        )}

        {/* Status */}
        <Field.Root>
          <Field.Label>Status</Field.Label>
          <NewSelect.Root
            collection={statusCollection}
            value={formData.status}
            onValueChange={(e) =>
              handleSelectChange('status', e.value)
            }
          >
            <NewSelect.HiddenSelect name="status" />
            <NewSelect.Control>
              <NewSelect.Trigger>
                <NewSelect.ValueText placeholder="Select status" />
              </NewSelect.Trigger>
              <NewSelect.IndicatorGroup>
                <NewSelect.Indicator />
              </NewSelect.IndicatorGroup>
            </NewSelect.Control>
            <Portal container={dialogContentRef}>
              <NewSelect.Positioner>
                <NewSelect.Content>
                  {statusCollection.items.map((item) => (
                    <NewSelect.Item item={item} key={item.value}>
                      {item.label}
                      <NewSelect.ItemIndicator />
                    </NewSelect.Item>
                  ))}
                </NewSelect.Content>
              </NewSelect.Positioner>
            </Portal>
          </NewSelect.Root>
        </Field.Root>

        {/* Resolution Note (only meaningful in edit mode) */}
        {mode === 'edit' && (
          <Field.Root>
            <Field.Label>Resolution Note</Field.Label>
            <Input
              name="resolutionNote"
              value={formData.resolutionNote}
              onChange={onChange}
              placeholder="Enter resolution details (optional)"
            />
          </Field.Root>
        )}

        {/* Flagged Text Snippet */}
        <Field.Root>
          <Field.Label>Flagged Text Snippet</Field.Label>
          <Input
            name="flaggedTextSnippet"
            value={formData.flaggedTextSnippet}
            onChange={onChange}
            placeholder="Exact text that triggered violation"
          />
        </Field.Root>

        <Button colorScheme="green" onClick={onSubmit}>
          {mode === 'create' ? 'Create Violation' : 'Update Violation'}
        </Button>
      </VStack>
    </Box>
  );
};
