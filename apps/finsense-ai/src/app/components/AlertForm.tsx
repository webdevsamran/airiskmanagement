// AlertForm.tsx
'use client';

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
  Checkbox,
} from '@chakra-ui/react';

type AlertFormProps = {
  mode: 'create' | 'edit';
  formData: {
    organizationId: string[];
    channel: string[];
    recipient: string;
    trigger: string;
    templateId: string;
    active: boolean;
  };
  organizations: { _id: string; name: string }[];
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  onChangeSelect: (name: string, value: string) => void; // new prop for selects
  onSubmit: () => void;
  onCancel: () => void;
  dialogContentRef?: React.RefObject<HTMLDivElement>;
};

export const AlertForm: React.FC<AlertFormProps> = ({
  mode,
  formData,
  organizations,
  onChange,
  onChangeSelect,
  onSubmit,
  onCancel,
  dialogContentRef,
}) => {
  // Build the list collections as before
  const organizationCollection = createListCollection({
    items: organizations.map((org) => ({
      label: org.name,
      value: org._id,
    })),
  });

  const channelCollection = createListCollection({
    items: [
      { label: 'email', value: 'email' },
      { label: 'slack', value: 'slack' },
      { label: 'sms', value: 'sms' },
    ],
  });

  return (
    <Box p={4} borderWidth="1px" mb={4} borderRadius="md">
      <VStack spacing={4} align="stretch">
        {/* Organization Select (value is a string) */}
        <Field.Root>
          <Field.Label>Organization</Field.Label>
          <NewSelect.Root
            collection={organizationCollection}
            value={formData.organizationId}
            onValueChange={(e) =>
              onChangeSelect('organizationId', e.value)
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

        {/* Channel Select (value is a string) */}
        <Field.Root>
          <Field.Label>Channel</Field.Label>
          <NewSelect.Root
            collection={channelCollection}
            value={formData.channel}
            onValueChange={(e) => onChangeSelect('channel', e.value)}
          >
            <NewSelect.HiddenSelect name="channel" />
            <NewSelect.Control>
              <NewSelect.Trigger>
                <NewSelect.ValueText placeholder="Select channel" />
              </NewSelect.Trigger>
              <NewSelect.IndicatorGroup>
                <NewSelect.Indicator />
              </NewSelect.IndicatorGroup>
            </NewSelect.Control>
            <Portal container={dialogContentRef}>
              <NewSelect.Positioner>
                <NewSelect.Content>
                  {channelCollection.items.map((item) => (
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

        {/* Recipient Input */}
        <Field.Root>
          <Field.Label>Recipient</Field.Label>
          <Input
            name="recipient"
            value={formData.recipient}
            onChange={onChange}
            placeholder="e.g. user@example.com or +1234567890"
          />
        </Field.Root>

        {/* Trigger Input */}
        <Field.Root>
          <Field.Label>Trigger</Field.Label>
          <Input
            name="trigger"
            value={formData.trigger}
            onChange={onChange}
            placeholder="e.g. document_uploaded"
          />
        </Field.Root>

        {/* Template ID Input */}
        <Field.Root>
          <Field.Label>Template ID</Field.Label>
          <Input
            name="templateId"
            value={formData.templateId}
            onChange={onChange}
            placeholder="ID of the alert template"
          />
        </Field.Root>

        {/* Active Checkbox (only in edit mode) */}
        {mode === 'edit' && (
          <Field.Root>
            <Checkbox.Root
              checked={formData.active}
              onCheckedChange={(details) => {
                const checked = !!details.checked;
                const fakeEvent = {
                  target: {
                    name: 'active',
                    value: checked,
                  },
                } as unknown as React.ChangeEvent<HTMLInputElement>;
                onChange(fakeEvent);
              }}
            >
              <Checkbox.HiddenInput name="active" />
              <Checkbox.Control />
              <Checkbox.Label>Active</Checkbox.Label>
            </Checkbox.Root>
          </Field.Root>
        )}

        {/* Submit & Cancel Buttons */}
        <Button colorScheme="green" onClick={onSubmit}>
          {mode === 'create' ? 'Create Alert' : 'Update Alert'}
        </Button>
        <Button onClick={onCancel}>Cancel</Button>
      </VStack>
    </Box>
  );
};
