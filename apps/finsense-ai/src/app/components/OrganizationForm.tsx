'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Input,
  Stack,
  Field,
  Select,
  Portal,
  createListCollection,
} from '@chakra-ui/react';
import { useMutation, gql } from '@apollo/client';

const CREATE_ORGANIZATION = gql`
  mutation CreateOrganization($input: OrganizationInput!) {
    createOrganization(input: $input) {
      _id
    }
  }
`;

const UPDATE_ORGANIZATION = gql`
  mutation UpdateOrganization($id: ID!, $input: OrganizationInput!) {
    updateOrganization(id: $id, input: $input) {
      _id
    }
  }
`;

const industryOptions = createListCollection({
  items: [
    { label: 'Fintech', value: 'fintech' },
    { label: 'Legal', value: 'legal' },
    { label: 'Security', value: 'security' },
    { label: 'Other', value: 'other' },
  ],
});

const tierOptions = createListCollection({
  items: [
    { label: 'Free', value: 'free' },
    { label: 'Pro', value: 'pro' },
    { label: 'Enterprise', value: 'enterprise' },
  ],
});

interface OrganizationFormProps {
  onCompleted: () => void;
  editingOrg: any;
  setEditingOrg: (org: any) => void;
  dialogContentRef: React.RefObject<HTMLDivElement>;
}

const OrganizationForm = ({
  onCompleted,
  dialogContentRef,
  editingOrg,
  setEditingOrg,
}: OrganizationFormProps) => {
  const [formState, setFormState] = useState({
    name: '',
    industry: [],
    domain: '',
    tier: [],
    regulatoryFrameworks: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [createOrganization] = useMutation(CREATE_ORGANIZATION);
  const [updateOrganization] = useMutation(UPDATE_ORGANIZATION);

  useEffect(() => {
    if (editingOrg) {
      // Initialize form state with editing organization data
      setFormState({
        name: editingOrg.name,
        industry: [editingOrg.industry],
        domain: editingOrg.domain,
        tier: [editingOrg.tier],
        regulatoryFrameworks: editingOrg.regulatoryFrameworks.join(', '),
      });
    }
  }, [editingOrg]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const variables = {
      ...formState,
      industry: formState.industry?.[0] || '', // Convert array to first item string
      tier: formState.tier?.[0] || '', // Convert array to first item string
      regulatoryFrameworks: formState.regulatoryFrameworks
        .split(',')
        .map((rf) => rf.trim())
        .filter((rf) => rf),
    };

    try {
      if (editingOrg) {
        await updateOrganization({
          variables: { id: editingOrg._id, input: variables },
        });
        setEditingOrg(null);
      } else {
        await createOrganization({
          variables: { input: variables },
        });
      }

      setFormState({
        name: '',
        industry: [],
        domain: '',
        tier: [],
        regulatoryFrameworks: '',
      });
      onCompleted();
    } catch (error) {
      console.error('Error submitting form:', error);

      const validationErrors =
        error?.graphQLErrors?.[0]?.extensions?.exception?.errors;
      if (validationErrors) {
        const extracted: Record<string, string> = {};
        for (const field in validationErrors) {
          extracted[field] = validationErrors[field].message;
        }
        setErrors(extracted);
      }
    }
  };

  return (
    <Container fluid>
      <Box mb={4}>
        <form onSubmit={handleSubmit}>
          <Stack spacing={4}>
            {/* Name */}
            <Field.Root required>
              <Field.Label>Name</Field.Label>
              <Input
                name="name"
                value={formState.name}
                onChange={handleChange}
              />
              {errors.name && (
                <Box color="red.500" fontSize="sm">
                  {errors.name}
                </Box>
              )}
            </Field.Root>

            {/* Industry */}
            <Field.Root required>
              <Field.Label>Industry</Field.Label>
              <Select.Root
                collection={industryOptions}
                // value={industryOptions.items.find((item) => item.value === formState.industry)}
                value={formState.industry}
                onValueChange={(e) => {
                  setFormState((prev) => ({
                    ...prev,
                    industry: e.value || formState.industry,
                  }));
                }}
              >
                <Select.HiddenSelect />
                <Select.Control>
                  <Select.Trigger>
                    <Select.ValueText placeholder="Choose industry" />
                  </Select.Trigger>
                  <Select.IndicatorGroup>
                    <Select.Indicator />
                  </Select.IndicatorGroup>
                </Select.Control>
                <Portal container={dialogContentRef}>
                  <Select.Positioner>
                    <Select.Content>
                      {industryOptions.items.map((item) => (
                        <Select.Item key={item.value} item={item}>
                          {item.label}
                          <Select.ItemIndicator />
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Positioner>
                </Portal>
              </Select.Root>
              {errors.industry && (
                <Box color="red.500" fontSize="sm">
                  {errors.industry}
                </Box>
              )}
            </Field.Root>

            {/* Domain */}
            <Field.Root required>
              <Field.Label>Domain</Field.Label>
              <Input
                name="domain"
                value={formState.domain}
                onChange={handleChange}
              />
              {errors.domain && (
                <Box color="red.500" fontSize="sm">
                  {errors.domain}
                </Box>
              )}
            </Field.Root>

            {/* Tier */}
            <Field.Root required>
              <Field.Label>Tier</Field.Label>
              <Select.Root
                collection={tierOptions}
                // value={tierOptions.items.find((item) => item.value === formState.tier)}
                value={formState.tier}
                onValueChange={(e) => {
                  setFormState((prev) => ({
                    ...prev,
                    tier: e.value || formState.tier,
                  }));
                }}
              >
                <Select.HiddenSelect />
                <Select.Control>
                  <Select.Trigger>
                    <Select.ValueText placeholder="Choose tier" />
                  </Select.Trigger>
                  <Select.IndicatorGroup>
                    <Select.Indicator />
                  </Select.IndicatorGroup>
                </Select.Control>
                <Portal container={dialogContentRef}>
                  <Select.Positioner>
                    <Select.Content>
                      {tierOptions.items.map((item) => (
                        <Select.Item key={item.value} item={item}>
                          {item.label}
                          <Select.ItemIndicator />
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Positioner>
                </Portal>
              </Select.Root>
              {errors.tier && (
                <Box color="red.500" fontSize="sm">
                  {errors.tier}
                </Box>
              )}
            </Field.Root>

            {/* Regulatory Frameworks */}
            <Field.Root required>
              <Field.Label>Regulatory Frameworks (comma-separated)</Field.Label>
              <Input
                name="regulatoryFrameworks"
                value={formState.regulatoryFrameworks}
                onChange={handleChange}
              />
            </Field.Root>

            <Button type="submit" colorScheme="teal">
              {editingOrg ? 'Update' : 'Create'}
            </Button>
          </Stack>
        </form>
      </Box>
    </Container>
  );
};

export default OrganizationForm;
