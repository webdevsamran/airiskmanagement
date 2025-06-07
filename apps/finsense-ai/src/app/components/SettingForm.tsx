import React from 'react';
import {
  Box,
  VStack,
  Input,
  Button,
  Checkbox,
  Portal,
  Select as NewSelect,
  createListCollection,
  Field,
} from '@chakra-ui/react';

type SettingFormProps = {
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

export const SettingForm: React.FC<SettingFormProps> = ({
  mode,
  formData,
  organizations,
  onChange,
  onChangeSelect,
  onSubmit,
  onCancel,
  dialogContentRef,
}) => {
  const orgCollection = createListCollection({
    items: organizations.map((org) => ({ label: org.name, value: org._id })),
  });

  const encryptionCollection = createListCollection({
    items: [
      { label: 'standard', value: 'standard' },
      { label: 'FIPS 140-2', value: 'FIPS_140_2' },
    ],
  });

  return (
    <Box p={4} borderWidth="1px" mb={4} borderRadius="md">
      <VStack spacing={4} align="stretch">
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

        <Field.Root>
          <Field.Label>Encryption Level</Field.Label>
          <NewSelect.Root
            collection={encryptionCollection}
            value={formData.encryptionLevel}
            onValueChange={(e) => onChangeSelect('encryptionLevel', e.value)}
          >
            <NewSelect.HiddenSelect name="encryptionLevel" />
            <NewSelect.Control>
              <NewSelect.Trigger>
                <NewSelect.ValueText placeholder="Select encryption" />
              </NewSelect.Trigger>
              <NewSelect.IndicatorGroup>
                <NewSelect.Indicator />
              </NewSelect.IndicatorGroup>
            </NewSelect.Control>
            <Portal container={dialogContentRef}>
              <NewSelect.Positioner>
                <NewSelect.Content>
                  {encryptionCollection.items.map((item) => (
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
          <Field.Label>Data Retention (days)</Field.Label>
          <Input
            name="dataRetentionDays"
            value={formData.dataRetentionDays}
            onChange={onChange}
          />
        </Field.Root>

        <Field.Root>
          <Field.Label>Allowed File Types (comma separated)</Field.Label>
          <Input
            name="allowedFileTypes"
            value={formData.allowedFileTypes}
            onChange={onChange}
          />
        </Field.Root>

        <Field.Root>
          <Checkbox.Root
            checked={formData.notifyOnHighRisk}
            onCheckedChange={(details) => {
              const checked = !!details.checked;
              const fakeEvent = {
                target: {
                  name: 'notifyOnHighRisk',
                  value: checked,
                },
              } as unknown as React.ChangeEvent<HTMLInputElement>;
              onChange(fakeEvent);
            }}
          >
            <Checkbox.HiddenInput name="notifyOnHighRisk" />
            <Checkbox.Control />
            <Checkbox.Label>Notify on High Risk</Checkbox.Label>
          </Checkbox.Root>
        </Field.Root>

        <Button colorScheme="blue" onClick={onSubmit}>
          {mode === 'create' ? 'Create Setting' : 'Update Setting'}
        </Button>
      </VStack>
    </Box>
  );
};
