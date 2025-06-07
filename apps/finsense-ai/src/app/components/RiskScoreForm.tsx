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

type RiskScoreFormProps = {
  mode: 'create' | 'edit';
  formData: {
    organizationId: string[];
    documentId: string[];
    userId: string[];
    entityType: string[];
    score: string;
    rationale: string;
    scoreBreakdown: string;
    calculatedAt: string;
  };
  organizations: { _id: string; name: string }[];
  users: { _id: string; fullName: string }[];
  documents: { _id: string; name: string }[];
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  onSubmit: () => void;
  onCancel: () => void;
  dialogContentRef?: React.RefObject<HTMLDivElement>;
};

export const RiskScoreForm: React.FC<RiskScoreFormProps> = ({
  mode,
  formData,
  organizations,
  users,
  documents,
  onChange,
  onSubmit,
  onCancel,
  dialogContentRef,
}) => {
  // Create collections for composable selects
  const organizationCollection = createListCollection({
    items: organizations.map((org) => ({
      label: org.name,
      value: org._id,
    })),
  });

  const userCollection = createListCollection({
    items: users.map((u) => ({
      label: u.fullName,
      value: u._id,
    })),
  });

  const documentCollection = createListCollection({
    items: documents.map((d) => ({
      label: d.name,
      value: d._id,
    })),
  });

  const entityTypeCollection = createListCollection({
    items: [
      { label: 'document', value: 'document' },
      { label: 'user', value: 'user' },
      { label: 'integration', value: 'integration' },
    ],
  });

  // Custom onChange for selects so they produce a SyntheticEvent-like shape
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

        {/* Document (optional) */}
        <Field.Root>
          <Field.Label>Document (optional)</Field.Label>
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

        {/* User (optional) */}
        <Field.Root>
          <Field.Label>User (optional)</Field.Label>
          <NewSelect.Root
            collection={userCollection}
            value={formData.userId}
            onValueChange={(e) =>
              handleSelectChange('userId', e.value)
            }
          >
            <NewSelect.HiddenSelect name="userId" />
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

        {/* Entity Type */}
        <Field.Root>
          <Field.Label>Entity Type</Field.Label>
          <NewSelect.Root
            collection={entityTypeCollection}
            value={formData.entityType}
            onValueChange={(e) =>
              handleSelectChange('entityType', e.value)
            }
          >
            <NewSelect.HiddenSelect name="entityType" />
            <NewSelect.Control>
              <NewSelect.Trigger>
                <NewSelect.ValueText placeholder="Select entity type" />
              </NewSelect.Trigger>
              <NewSelect.IndicatorGroup>
                <NewSelect.Indicator />
              </NewSelect.IndicatorGroup>
            </NewSelect.Control>
            <Portal container={dialogContentRef}>
              <NewSelect.Positioner>
                <NewSelect.Content>
                  {entityTypeCollection.items.map((item) => (
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

        {/* Score */}
        <Field.Root>
          <Field.Label>Score</Field.Label>
          <Input
            name="score"
            type="number"
            value={formData.score}
            onChange={onChange}
          />
        </Field.Root>

        {/* Rationale */}
        <Field.Root>
          <Field.Label>Rationale</Field.Label>
          <Input
            name="rationale"
            value={formData.rationale}
            onChange={onChange}
          />
        </Field.Root>

        {/* Score Breakdown (JSON) */}
        <Field.Root>
          <Field.Label>Score Breakdown (JSON)</Field.Label>
          <Input
            name="scoreBreakdown"
            value={formData.scoreBreakdown}
            onChange={onChange}
            placeholder='e.g. {"rule1": 5, "rule2": 10}'
          />
        </Field.Root>

        {/* Calculated At */}
        <Field.Root>
          <Field.Label>Calculated At</Field.Label>
          <Input
            name="calculatedAt"
            type="datetime-local"
            value={formData.calculatedAt}
            onChange={onChange}
          />
        </Field.Root>

        <Button colorScheme="green" onClick={onSubmit}>
          {mode === 'create' ? 'Create Risk Score' : 'Update Risk Score'}
        </Button>
      </VStack>
    </Box>
  );
};
