import React from 'react';
import {
  Box,
  VStack,
  Input,
  Textarea,
  Button,
  Portal,
  Checkbox,
  createListCollection,
  Field,
  Select as NewSelect,
} from '@chakra-ui/react';

type ComplianceRuleFormProps = {
  mode: 'create' | 'edit';
  formData: any;
  organizations: { _id: string; name: string }[];
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onChangeSelect: (name: string, value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  dialogContentRef?: React.RefObject<HTMLDivElement>;
};

export const ComplianceRuleForm: React.FC<ComplianceRuleFormProps> = ({
  mode,
  formData,
  organizations,
  onChange,
  onChangeSelect,
  onSubmit,
  onCancel,
  dialogContentRef,
}) => {
  // --- Collections for selects ---
  const orgCollection = createListCollection({
    items: organizations.map((org) => ({ label: org.name, value: org._id })),
  });

  const categoryCollection = createListCollection({
    items: [
      { label: 'privacy', value: 'privacy' },
      { label: 'access', value: 'access' },
      { label: 'security', value: 'security' },
      { label: 'retention', value: 'retention' },
    ],
  });

  const severityCollection = createListCollection({
    items: [
      { label: 'low', value: 'low' },
      { label: 'medium', value: 'medium' },
      { label: 'high', value: 'high' },
      { label: 'critical', value: 'critical' },
    ],
  });

  const logicTypeCollection = createListCollection({
    items: [
      { label: 'regex', value: 'regex' },
      { label: 'nlp', value: 'nlp' },
      { label: 'llm', value: 'llm' },
    ],
  });

  const providerCollection = createListCollection({
    items: [
      { label: 'openai', value: 'openai' },
      { label: 'anthropic', value: 'anthropic' },
    ],
  });

  console.log("formData:", formData);

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

        {/* Name */}
        <Field.Root>
          <Field.Label>Name</Field.Label>
          <Input
            name="name"
            value={formData.name}
            onChange={onChange}
            placeholder="Rule name"
          />
        </Field.Root>

        {/* Description */}
        <Field.Root>
          <Field.Label>Description</Field.Label>
          <Textarea
            name="description"
            value={formData.description}
            onChange={onChange}
            placeholder="Optional description"
          />
        </Field.Root>

        {/* Category Select */}
        <Field.Root>
          <Field.Label>Category</Field.Label>
          <NewSelect.Root
            collection={categoryCollection}
            value={formData.category}
            onValueChange={(e) => onChangeSelect('category', e.value)}
          >
            <NewSelect.HiddenSelect name="category" />
            <NewSelect.Control>
              <NewSelect.Trigger>
                <NewSelect.ValueText placeholder="Select category" />
              </NewSelect.Trigger>
              <NewSelect.IndicatorGroup>
                <NewSelect.Indicator />
              </NewSelect.IndicatorGroup>
            </NewSelect.Control>
            <Portal container={dialogContentRef}>
              <NewSelect.Positioner>
                <NewSelect.Content>
                  {categoryCollection.items.map((item) => (
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

        {/* Severity Select */}
        <Field.Root>
          <Field.Label>Severity</Field.Label>
          <NewSelect.Root
            collection={severityCollection}
            value={formData.severity}
            onValueChange={(e) => onChangeSelect('severity', e.value)}
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

        {/* Logic Type Select */}
        <Field.Root>
          <Field.Label>Logic Type</Field.Label>
          <NewSelect.Root
            collection={logicTypeCollection}
            value={formData.logicType}
            onValueChange={(e) => onChangeSelect('logicType', e.value)}
          >
            <NewSelect.HiddenSelect name="logicType" />
            <NewSelect.Control>
              <NewSelect.Trigger>
                <NewSelect.ValueText placeholder="Select logic type" />
              </NewSelect.Trigger>
              <NewSelect.IndicatorGroup>
                <NewSelect.Indicator />
              </NewSelect.IndicatorGroup>
            </NewSelect.Control>
            <Portal container={dialogContentRef}>
              <NewSelect.Positioner>
                <NewSelect.Content>
                  {logicTypeCollection.items.map((item) => (
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

        {/* Expression */}
        <Field.Root>
          <Field.Label>Expression/Pattern</Field.Label>
          <Input
            name="expression"
            value={formData.expression}
            onChange={onChange}
            placeholder="e.g. ^[A-Z0-9]+$ or NLP prompt…"
          />
        </Field.Root>

        {/* LLM Config (only if logicType === 'llm') */}
        {formData.logicType[0] === 'llm' && (
          <>
            {/* Provider */}
            <Field.Root>
              <Field.Label>LLM Provider</Field.Label>
              <NewSelect.Root
                collection={providerCollection}
                value={formData.languageModelProvider}
                onValueChange={(e) => onChangeSelect('languageModelProvider', e.value)}
              >
                <NewSelect.HiddenSelect name="languageModelProvider" />
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

            {/* Model */}
            <Field.Root>
              <Field.Label>Model</Field.Label>
              <Input
                name="model"
                value={formData.model}
                onChange={onChange}
                placeholder="e.g. gpt-4"
              />
            </Field.Root>

            {/* Prompt Template */}
            <Field.Root>
              <Field.Label>Prompt Template</Field.Label>
              <Textarea
                name="promptTemplate"
                value={formData.promptTemplate}
                onChange={onChange}
                placeholder="Your prompt here…"
              />
            </Field.Root>
          </>
        )}

        {/* Enabled Switch */}
        <Field.Root>
  <Checkbox.Root
    checked={formData.enabled}
    onCheckedChange={(details) => {
      const checked = !!details.checked;
      const fakeEvent = {
        target: {
          name: 'enabled',
          value: checked,
        },
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      onChange(fakeEvent);
    }}
  >
    <Checkbox.HiddenInput name="enabled" />
    <Checkbox.Control />
    <Checkbox.Label>Enabled</Checkbox.Label>
  </Checkbox.Root>
</Field.Root>


        {/* Buttons */}
        <Button colorScheme="blue" onClick={onSubmit}>
          {mode === 'create' ? 'Create Rule' : 'Update Rule'}
        </Button>
      </VStack>
    </Box>
  );
};
