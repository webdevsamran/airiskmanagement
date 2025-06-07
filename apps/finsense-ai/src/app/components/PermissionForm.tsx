'use client';

import React from 'react';
import {
  Box,
  VStack,
  Input,
  Button,
  Field,
  Portal,
} from '@chakra-ui/react';

type PermissionFormProps = {
  mode: 'create' | 'edit';
  formData: {
    name: string;
  };
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  onSubmit: () => void;
  onCancel: () => void;
  dialogContentRef?: React.RefObject<HTMLDivElement>;
};

export const PermissionForm: React.FC<PermissionFormProps> = ({
  mode,
  formData,
  onChange,
  onSubmit,
  onCancel,
  dialogContentRef,
}) => {
  return (
    <Box p={4} borderWidth="1px" borderRadius="md" mb={4}>
      <VStack spacing={4} align="stretch">
        <Field.Root>
          <Field.Label>Permission Name</Field.Label>
          <Input
            name="name"
            value={formData.name}
            onChange={onChange}
            placeholder="e.g. read:users"
          />
        </Field.Root>

        <Button colorScheme="green" onClick={onSubmit}>
          {mode === 'create' ? 'Create Permission' : 'Update Permission'}
        </Button>
      </VStack>
    </Box>
  );
};
