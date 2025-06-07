// apps/finsense-ai/src/app/pages/Signup.tsx
import { useState } from 'react';
import {
  Box,
  Button,
  Input,
  Heading,
  VStack,
  Portal,
  Select,
  createListCollection,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { gql, useMutation, useQuery } from '@apollo/client';

const SIGNUP_MUTATION = gql`
  mutation Signup(
    $email: String!
    $fullName: String!
    $passwordHash: String!
    $organizationId: String!
    $roleId: String!
  ) {
    createUser(
      email: $email
      fullName: $fullName
      passwordHash: $passwordHash
      organizationId: $organizationId
      roleId: $roleId
    ) {
      _id
      email
    }
  }
`;

const GET_ORGANIZATIONS = gql`
  query GetOrganizations {
    organizations {
      _id
      name
    }
  }
`;

const GET_ROLES = gql`
  query GetRoles {
    roles {
      _id
      name
    }
  }
`;

export default function Signup() {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [passwordHash, setPasswordHash] = useState('');
  const [organizationId, setOrganizationId] = useState('');
  const [roleId, setRoleId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const [signup, { loading }] = useMutation(SIGNUP_MUTATION);
  const { data: orgData } = useQuery(GET_ORGANIZATIONS);
  const { data: roleData } = useQuery(GET_ROLES);

  const organizationOptions = createListCollection({
    items: orgData?.organizations.map((org: any) => ({
      label: org.name,
      value: org._id,
    })) ?? [],
  });

  const roleOptions = createListCollection({
    items: roleData?.roles.map((role: any) => ({
      label: role.name,
      value: role._id,
    })) ?? [],
  });

  const handleSignup = async () => {
    try {
      const orgId = Array.isArray(organizationId?.value)
        ? organizationId.value[0]
        : organizationId;
      const rId = Array.isArray(roleId?.value)
        ? roleId.value[0]
        : roleId;
      const { data } = await signup({
        variables: { email, fullName, passwordHash, organizationId: orgId, roleId: rId },
      });

      if (data?.createUser?._id) {
        alert('Signup successful! Please log in.');
        navigate('/login');
      } else {
        alert('Signup failed');
      }
    } catch (err: any) {
      alert(err.message || 'Signup error');
      const graphQLErrors = err?.graphQLErrors;
      if (graphQLErrors?.length) {
        setErrorMessage(graphQLErrors.map((e: any) => e.message).join('\n'));
      } else {
        setErrorMessage(err.message || 'Signup error');
      }
    }
  };

  return (
    <Box maxW="md" mx="auto" mt={20}>
      <Heading mb={6}>Signup</Heading>
      {errorMessage && (
        <Box color="red.500" fontWeight="medium">
          {errorMessage}
        </Box>
      )}
      <VStack spacing={4}>
        <Input
        required
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        <Input
        required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
        required
          placeholder="Password"
          type="password"
          value={passwordHash}
          onChange={(e) => setPasswordHash(e.target.value)}
        />

        <Select.Root
        required
          collection={organizationOptions}
          onValueChange={(val) => setOrganizationId(val)}
        >
          <Select.HiddenSelect />
          <Select.Label>Select Organization</Select.Label>
          <Select.Control>
            <Select.Trigger>
              <Select.ValueText placeholder="Select organization" />
            </Select.Trigger>
            <Select.IndicatorGroup>
              <Select.Indicator />
            </Select.IndicatorGroup>
          </Select.Control>
          <Portal>
            <Select.Positioner>
              <Select.Content>
                {organizationOptions.items.map((org) => (
                  <Select.Item item={org} key={org.value}>
                    {org.label}
                    <Select.ItemIndicator />
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Positioner>
          </Portal>
        </Select.Root>

        <Select.Root
        required
          collection={roleOptions}
          onValueChange={(val) => setRoleId(val)}
        >
          <Select.HiddenSelect />
          <Select.Label>Select Role</Select.Label>
          <Select.Control>
            <Select.Trigger>
              <Select.ValueText placeholder="Select role" />
            </Select.Trigger>
            <Select.IndicatorGroup>
              <Select.Indicator />
            </Select.IndicatorGroup>
          </Select.Control>
          <Portal>
            <Select.Positioner>
              <Select.Content>
                {roleOptions.items.map((role) => (
                  <Select.Item item={role} key={role.value}>
                    {role.label}
                    <Select.ItemIndicator />
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Positioner>
          </Portal>
        </Select.Root>

        <Button
          colorScheme="green"
          onClick={handleSignup}
          isLoading={loading}
          isDisabled={!organizationId || !roleId}
        >
          Signup
        </Button>
      </VStack>
    </Box>
  );
}
