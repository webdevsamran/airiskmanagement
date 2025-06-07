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
} from '@chakra-ui/react';

type UserFormProps = {
  mode: 'create' | 'edit';
  formData: {
    email: string;
    fullName: string;
    passwordHash: string;
    organizationId: string;
    roleId: string;
    status: string;
  };
  organizations: any[];
  roles: any[];
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  onSubmit: () => void;
  onCancel: () => void;
  dialogContentRef?: React.RefObject<HTMLDivElement>;
};

export const UserForm: React.FC<UserFormProps> = ({
  mode,
  formData,
  organizations,
  roles,
  onChange,
  onSubmit,
  onCancel,
  dialogContentRef
}) => {
  // Create collections for composable selects
  const organizationCollection = createListCollection({
    items: organizations.map((org) => ({
      label: org.name,
      value: org._id,
    })),
  });

  const roleCollection = createListCollection({
    items: roles.map((role) => ({
      label: role.name,
      value: role._id,
    })),
  });

  const statusCollection = createListCollection({
    items: [
      { label: 'active', value: 'active' },
      { label: 'suspended', value: 'suspended' },
      { label: 'invited', value: 'invited' },
    ],
  });

  // Custom onChange handlers to simulate synthetic events
  const handleSelectChange = (name: string, value: string) => {
    const event = {
      target: {
        name,
        value,
      },
    } as React.ChangeEvent<HTMLInputElement | HTMLSelectElement>;
    onChange(event);
  };

  return (
    <Box p={4} borderWidth="1px" mb={4} borderRadius="md">
      <VStack spacing={4} align="stretch">
        <Field.Root>
          <Field.Label>Full Name</Field.Label>
          <Input
            name="fullName"
            value={formData.fullName}
            onChange={onChange}
          />
        </Field.Root>
        {mode === 'create' && (
          <Field.Root>
            <Field.Label>Email</Field.Label>
            <Input
              name="email"
              value={formData.email}
              onChange={onChange}
              isDisabled={mode === 'edit'}
            />
          </Field.Root>
        )}
        {mode === 'create' && (
          <Field.Root>
            <Field.Label>Password</Field.Label>
            <Input
              name="passwordHash"
              type="password"
              value={formData.passwordHash}
              onChange={onChange}
            />
          </Field.Root>
        )}

        <Field.Root>
          <Field.Label>Organization</Field.Label>
          <NewSelect.Root
            collection={organizationCollection}
            value={formData.organizationId}
            onValueChange={(e) => handleSelectChange('organizationId', e.value)}
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

        <Field.Root>
          <Field.Label>Role</Field.Label>
          <NewSelect.Root
            collection={roleCollection}
            value={formData.roleId}
            onValueChange={(e) => handleSelectChange('roleId', e.value)}
          >
            <NewSelect.HiddenSelect name="roleId" />
            <NewSelect.Control>
              <NewSelect.Trigger>
                <NewSelect.ValueText placeholder="Select role" />
              </NewSelect.Trigger>
              <NewSelect.IndicatorGroup>
                <NewSelect.Indicator />
              </NewSelect.IndicatorGroup>
            </NewSelect.Control>
            <Portal container={dialogContentRef}>
              <NewSelect.Positioner>
                <NewSelect.Content>
                  {roleCollection.items.map((item) => (
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
        {mode === 'edit' && (
          <Field.Root>
            <Field.Label>Status</Field.Label>
            <NewSelect.Root
              collection={statusCollection}
              value={formData.status}
              onValueChange={(e) => handleSelectChange('status', e.value)}
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
        )}
        <Button colorScheme="green" onClick={onSubmit}>
          Submit
        </Button>
        <Button onClick={onCancel}>Cancel</Button>
      </VStack>
    </Box>
  );
};
