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

type TaskFormProps = {
  mode: 'create' | 'edit';
  formData: {
    violationId: string[];
    assignedTo: string[];
    dueDate: string;
    status: string[];
    notes: string;
  };
  violations: { _id: string; /* optionally include display fields */ }[];
  users: { _id: string; fullName: string }[];
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  onSubmit: () => void;
  onCancel: () => void;
  dialogContentRef?: React.RefObject<HTMLDivElement>;
};

export const TaskForm: React.FC<TaskFormProps> = ({
  mode,
  formData,
  violations,
  users,
  onChange,
  onSubmit,
  onCancel,
  dialogContentRef,
}) => {
  const violationCollection = createListCollection({
    items: violations.map((v) => ({
      label: v.flaggedTextSnippet, // or some human-readable field if available
      value: v._id,
    })),
  });

  const userCollection = createListCollection({
    items: users.map((u) => ({
      label: u.fullName,
      value: u._id,
    })),
  });

  const statusCollection = createListCollection({
    items: [
      { label: 'pending', value: 'pending' },
      { label: 'in_progress', value: 'in_progress' },
      { label: 'done', value: 'done' },
    ],
  });

  // Synthetic event for selects
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
        {/* Violation */}
        <Field.Root>
          <Field.Label>Violation</Field.Label>
          <NewSelect.Root
            collection={violationCollection}
            value={formData.violationId}
            onValueChange={(e) =>
              handleSelectChange('violationId', e.value)
            }
          >
            <NewSelect.HiddenSelect name="violationId" />
            <NewSelect.Control>
              <NewSelect.Trigger>
                <NewSelect.ValueText placeholder="Select violation" />
              </NewSelect.Trigger>
              <NewSelect.IndicatorGroup>
                <NewSelect.Indicator />
              </NewSelect.IndicatorGroup>
            </NewSelect.Control>
            <Portal container={dialogContentRef}>
              <NewSelect.Positioner>
                <NewSelect.Content>
                  {violationCollection.items.map((item) => (
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

        {/* Assigned To */}
        <Field.Root>
          <Field.Label>Assigned To</Field.Label>
          <NewSelect.Root
            collection={userCollection}
            value={formData.assignedTo}
            onValueChange={(e) =>
              handleSelectChange('assignedTo', e.value)
            }
          >
            <NewSelect.HiddenSelect name="assignedTo" />
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

        {/* Due Date */}
        <Field.Root>
          <Field.Label>Due Date</Field.Label>
          <Input
            name="dueDate"
            type="datetime-local"
            value={formData.dueDate}
            onChange={onChange}
          />
        </Field.Root>

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

        {/* Notes */}
        <Field.Root>
          <Field.Label>Notes</Field.Label>
          <Input
            name="notes"
            value={formData.notes}
            onChange={onChange}
            placeholder="Optional notes"
          />
        </Field.Root>

        <Button colorScheme="green" onClick={onSubmit}>
          {mode === 'create' ? 'Create Task' : 'Update Task'}
        </Button>
        <Button onClick={onCancel}>Cancel</Button>
      </VStack>
    </Box>
  );
};
