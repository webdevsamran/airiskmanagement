import React from 'react';
import {
  Box,
  VStack,
  Input,
  Button,
  Portal,
  Select as NewSelect,
  createListCollection,
  Field,
} from '@chakra-ui/react';

type IntegrationFormProps = {
  mode: 'create' | 'edit';
  formData: any;
  organizations: { _id: string; name: string }[];
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  onChangeSelect: (name: string, value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  dialogContentRef?: React.RefObject<HTMLDivElement>;
};

export const IntegrationForm: React.FC<IntegrationFormProps> = ({
  mode,
  formData,
  organizations,
  onChange,
  onChangeSelect,
  onSubmit,
  onCancel,
  dialogContentRef,
}) => {
  // Collection for the “Organization” select:
  const orgCollection = createListCollection({
    items: organizations.map((org) => ({ label: org.name, value: org._id })),
  });

  // Collection for “Provider” select (matches your typedef enum):
  const providerCollection = createListCollection({
    items: [
      { label: 'slack', value: 'slack' },
      { label: 'jira', value: 'jira' },
      { label: 'salesforce', value: 'salesforce' },
      { label: 'gdrive', value: 'gdrive' },
      { label: 'aws', value: 'aws' },
    ],
  });

  // Collection for “Status” select (matches your typedef enum):
  const statusCollection = createListCollection({
    items: [
      { label: 'active', value: 'active' },
      { label: 'disconnected', value: 'disconnected' },
    ],
  });

  console.log('IntegrationForm rendered with formData:', formData);

  return (
    <Box p={4} borderWidth="1px" mb={4} borderRadius="md">
      <VStack spacing={4} align="stretch">
        {/* Organization Select */}
        <Field.Root>
          <Field.Label>Organization</Field.Label>
          <NewSelect.Root
            collection={orgCollection}
            value={formData.organizationId}
            onValueChange={(e) => onChangeSelect('organizationId', e.value)}
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
                  {orgCollection.items.map((item) => (
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

        {/* Provider Select */}
        <Field.Root>
          <Field.Label>Provider</Field.Label>
          <NewSelect.Root
            collection={providerCollection}
            value={formData.provider}
            onValueChange={(e) => onChangeSelect('provider', e.value)}
          >
            <NewSelect.HiddenSelect name="provider" />
            <NewSelect.Control>
              <NewSelect.Trigger>
                <NewSelect.ValueText placeholder="Select provider" />
              </NewSelect.Trigger>
              <NewSelect.IndicatorGroup>
                <NewSelect.Indicator />
              </NewSelect.IndicatorGroup>
            </NewSelect.Control>
            <Portal container={dialogContentRef}>
              <NewSelect.Positioner>
                <NewSelect.Content>
                  {providerCollection.items.map((item) => (
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

        {/* Config (JSON) */}
        <Field.Root>
          <Field.Label>Config (JSON)</Field.Label>
          <Input
            name="config"
            value={formData.config}
            placeholder='{"key":"value"}'
            onChange={onChange}
          />
        </Field.Root>

        {/* Status Select */}
        <Field.Root>
          <Field.Label>Status</Field.Label>
          <NewSelect.Root
            collection={statusCollection}
            value={formData.status}
            onValueChange={(e) => onChangeSelect('status', e.value)}
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

        {/* Last Synced At */}
        <Field.Root>
          <Field.Label>Last Synced At</Field.Label>
          <Input
            name="lastSyncedAt"
            type="date"
            value={formData.lastSyncedAt}
            onChange={onChange}
          />
        </Field.Root>

        <Button colorScheme="blue" onClick={onSubmit}>
          {mode === 'create' ? 'Create Integration' : 'Update Integration'}
        </Button>
      </VStack>
    </Box>
  );
};
