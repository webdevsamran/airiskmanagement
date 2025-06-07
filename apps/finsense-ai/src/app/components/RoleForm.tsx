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

type RoleFormProps = {
  mode: 'create' | 'edit';
  formData: {
    name: string;
    permissions: string[];
  };
  allPermissions: { _id: string; name: string }[];
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPermissionsChange: (value: string[]) => void;
  onSubmit: () => void;
  onCancel: () => void;
  dialogContentRef?: React.RefObject<HTMLDivElement>;
};

export const RoleForm: React.FC<RoleFormProps> = ({
  mode,
  formData,
  allPermissions,
  onChange,
  onPermissionsChange,
  onSubmit,
  onCancel,
  dialogContentRef,
}) => {
  // Build a ListCollection from allPermissions
  const permissionCollection = createListCollection({
    items: allPermissions.map((p) => ({
      label: p.name,
      value: p._id,
    })),
  });

  // Whenever the Select’s value changes, we get an array of selected values
  const handleSelectChange = (selectedValues: string[]) => {
    onPermissionsChange(selectedValues);
  };

  return (
    <Box
      as="form"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      p={4}
      borderWidth="1px"
      borderRadius="md"
      mb={4}
    >
      <VStack spacing={4} align="stretch">
        <Field.Root>
          <Field.Label>Role Name</Field.Label>
          <Input
            name="name"
            value={formData.name}
            onChange={onChange}
            placeholder="e.g. Admin"
            required
          />
        </Field.Root>

        <Field.Root>
          <Field.Label>Permissions</Field.Label>
          <NewSelect.Root
            multiple
            collection={permissionCollection}
            value={formData.permissions}
            onValueChange={(e) =>
              // e is { value: string[], items: ListItem[] }
              handleSelectChange(e.value as string[])
            }
          >
            <NewSelect.HiddenSelect name="permissions" />
            <NewSelect.Control>
              <NewSelect.Trigger>
                <NewSelect.ValueText placeholder="Select permissions" />
              </NewSelect.Trigger>
              <NewSelect.IndicatorGroup>
                <NewSelect.Indicator />
              </NewSelect.IndicatorGroup>
            </NewSelect.Control>
            <Portal container={dialogContentRef}>
              <NewSelect.Positioner>
                <NewSelect.Content>
                  {permissionCollection.items.map((item) => (
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

        <VStack align="stretch" spacing={2}>
          <Button colorScheme="blue" type="submit">
            {mode === 'create' ? 'Create Role' : 'Update Role'}
          </Button>
        </VStack>
      </VStack>
    </Box>
  );
};
