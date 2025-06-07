// DocumentForm.tsx
'use client';

import React from 'react';
import {
  Box,
  VStack,
  Input,
  Textarea,
  Button,
  Portal,
  Select as NewSelect,
  createListCollection,
  Field,
} from '@chakra-ui/react';

type DocumentFormProps = {
  mode: 'create' | 'edit';
  formData: {
    name: string;
    type: string;
    tags: string;
    organizationId: string;    // store a single ID (string), not string[]
    // We no longer store "file" inside formData, because onFileChange keeps it separately
  };
  organizations: { _id: string; name: string }[];
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  onChangeSelect: (name: string, value: string) => void;
  onFileChange: (file: File | null) => void; // receives a real File object
  onSubmit: () => void;
  onCancel: () => void;
  dialogContentRef?: React.RefObject<HTMLDivElement>;
};

export const DocumentForm: React.FC<DocumentFormProps> = ({
  mode,
  formData,
  organizations,
  onChange,
  onChangeSelect,
  onFileChange,
  onSubmit,
  onCancel,
  dialogContentRef,
}) => {
  // Build a list collection for the organization dropdown
  const organizationCollection = createListCollection({
    items: organizations.map((org) => ({
      label: org.name,
      value: org._id,
    })),
  });

  return (
    <Box p={4} borderWidth="1px" mb={4} borderRadius="md">
      <VStack spacing={4} align="stretch">
        {/* Name Input */}
        <Field.Root>
          <Field.Label>Name</Field.Label>
          <Input
            name="name"
            value={formData.name}
            onChange={onChange}
            placeholder="Document name"
            isRequired
          />
        </Field.Root>

        {/* Type Input */}
        <Field.Root>
          <Field.Label>Type</Field.Label>
          <Input
            name="type"
            value={formData.type}
            onChange={onChange}
            placeholder="e.g. pdf, word"
            isRequired
          />
        </Field.Root>

        {/* Tags Input */}
        <Field.Root>
          <Field.Label>Tags (comma-separated)</Field.Label>
          <Textarea
            name="tags"
            value={formData.tags}
            onChange={onChange}
            placeholder="e.g. finance, confidential"
          />
        </Field.Root>

        {/* Organization Select */}
        <Field.Root>
          <Field.Label>Organization</Field.Label>
          <NewSelect.Root
            collection={organizationCollection}
            value={formData.organizationId || ''}
            onValueChange={(val) =>
              onChangeSelect('organizationId', val.value)
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

        {/* File Upload */}
        <Field.Root>
          <Field.Label>Upload PDF</Field.Label>
          <Input
            type="file"
            accept="application/pdf"
            onChange={(e) =>
              onFileChange(e.target.files ? e.target.files[0] : null)
            }
            isRequired={mode === 'create'}
          />
        </Field.Root>

        {/* Submit Button */}
        <Button colorScheme="blue" onClick={onSubmit}>
          {mode === 'create' ? 'Create Document' : 'Update Document'}
        </Button>
      </VStack>
    </Box>
  );
};
