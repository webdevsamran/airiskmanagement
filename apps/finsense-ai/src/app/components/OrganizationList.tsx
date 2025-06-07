import { useQuery, gql, useMutation } from '@apollo/client';
import {
  Table,
  Container,
  Button,
  Spinner,
  Box,
  Heading,
  Text,
  Dialog,
  Portal,
  Flex,
  CloseButton,
} from '@chakra-ui/react';
import { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { selectIsAdmin, selectHasPermission } from '../store/authSlice';
import OrganizationForm from './OrganizationForm';

const GET_ORGANIZATIONS = gql`
  query GetOrganizations {
    organizations {
      _id
      name
      industry
      domain
      tier
      regulatoryFrameworks
    }
  }
`;

const DELETE_ORGANIZATION = gql`
  mutation DeleteOrganization($id: ID!) {
    deleteOrganization(id: $id)
  }
`;

const OrganizationList = () => {
  const { loading, error, data, refetch } = useQuery(GET_ORGANIZATIONS);
  const [deleteOrganization] = useMutation(DELETE_ORGANIZATION);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view' | null>(
    null
  );
  const [selectedOrg, setSelectedOrg] = useState<any>(null);
  const [isDialogOpen, setDialogOpen] = useState(false);

  // Check if user is admin or has permission to manage alerts
  const isAdmin = useSelector(selectIsAdmin);
  const canRead = useSelector(selectHasPermission('READ_ORGANIZATIONS'));
  const canCreate = useSelector(selectHasPermission('CREATE_ORGANIZATIONS'));
  const canUpdate = useSelector(selectHasPermission('UPDATE_ORGANIZATIONS'));
  const canDelete = useSelector(selectHasPermission('DELETE_ORGANIZATIONS'));

  const contentRef = useRef<HTMLDivElement>(null);

  if (loading) return <Spinner />;
  if (error) return <p>Error: {error.message}</p>;

  const handleDelete = async (id: string) => {
    await deleteOrganization({ variables: { id } });
    refetch();
  };

  const openModal = (mode: 'create' | 'edit' | 'view', org: any = null) => {
    setSelectedOrg(org);
    setModalMode(mode);
    setDialogOpen(true);
  };

  const closeModal = () => {
    setSelectedOrg(null);
    setModalMode(null);
    setDialogOpen(false);
  };

  if (!isAdmin && !canRead) {
    return (
      <Box p={4}>
        <Text color="red.500">
          You do not have permission to view Organizations.
        </Text>
      </Box>
    );
  }

  return (
    <Container maxW="container.lg">
      <Box mt={8} mb={8}>
        <Flex gap="4" justify="space-between">
          <Flex>
            <Heading mb={4}>Organizations</Heading>
          </Flex>
          <Flex>
            {(isAdmin || canCreate) && (
              <Button
                colorScheme="teal"
                mb={4}
                onClick={() => openModal('create')}
                marginEnd="auto"
              >
                Create +
              </Button>
            )}
          </Flex>
        </Flex>

        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Name</Table.ColumnHeader>
              <Table.ColumnHeader>Industry</Table.ColumnHeader>
              <Table.ColumnHeader>Domain</Table.ColumnHeader>
              <Table.ColumnHeader>Tier</Table.ColumnHeader>
              <Table.ColumnHeader>Regulatory Frameworks</Table.ColumnHeader>
              <Table.ColumnHeader>Actions</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {data.organizations.length > 0 ? (
              data.organizations.map((org: any) => (
                <Table.Row key={org._id}>
                  <Table.Cell>{org.name}</Table.Cell>
                  <Table.Cell>{org.industry}</Table.Cell>
                  <Table.Cell>{org.domain}</Table.Cell>
                  <Table.Cell>{org.tier}</Table.Cell>
                  <Table.Cell>{org.regulatoryFrameworks.join(', ')}</Table.Cell>
                  <Table.Cell>
                    {(isAdmin || canUpdate) && (
                      <Button
                        size="sm"
                        colorScheme="blue"
                        mr={2}
                        onClick={() => openModal('edit', org)}
                      >
                        Edit
                      </Button>
                    )}

                    <Button
                      size="sm"
                      colorScheme="gray"
                      mr={2}
                      onClick={() => openModal('view', org)}
                    >
                      View
                    </Button>
                    {(isAdmin || canDelete) && (
                      <Button
                        size="sm"
                        colorScheme="red"
                        onClick={() => handleDelete(org._id)}
                      >
                        Delete
                      </Button>
                    )}
                  </Table.Cell>
                </Table.Row>
              ))
            ) : (
              <Table.Row>
                <Table.Cell colSpan={6}>No organizations found.</Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table.Root>

        {/* Chakra Dialog primitive */}
        <Dialog.Root
          open={isDialogOpen}
          onOpenChange={(open) => !open && closeModal()}
        >
          <Portal>
            <Dialog.Backdrop />
            <Dialog.Positioner>
              <Dialog.Content size="lg" ref={contentRef}>
                <Dialog.Header>
                  <Dialog.Title>
                    {modalMode === 'create'
                      ? 'Create Organization'
                      : modalMode === 'edit'
                      ? 'Edit Organization'
                      : 'View Organization'}
                  </Dialog.Title>
                  <Dialog.CloseTrigger asChild>
                    <CloseButton
                      size="sm"
                      position="absolute"
                      top="1rem"
                      right="1rem"
                      onClick={closeModal}
                    />
                  </Dialog.CloseTrigger>
                </Dialog.Header>

                <Dialog.Body>
                  {modalMode === 'view' && selectedOrg ? (
                    <>
                      <Text>
                        <strong>Name:</strong> {selectedOrg.name}
                      </Text>
                      <Text>
                        <strong>Industry:</strong> {selectedOrg.industry}
                      </Text>
                      <Text>
                        <strong>Domain:</strong> {selectedOrg.domain}
                      </Text>
                      <Text>
                        <strong>Tier:</strong> {selectedOrg.tier}
                      </Text>
                      <Text>
                        <strong>Regulatory Frameworks:</strong>{' '}
                        {selectedOrg.regulatoryFrameworks.join(', ')}
                      </Text>
                    </>
                  ) : (
                    <OrganizationForm
                      editingOrg={selectedOrg}
                      setEditingOrg={setSelectedOrg}
                      dialogContentRef={contentRef}
                      onCompleted={() => {
                        refetch();
                        closeModal();
                      }}
                    />
                  )}
                </Dialog.Body>
              </Dialog.Content>
            </Dialog.Positioner>
          </Portal>
        </Dialog.Root>
      </Box>
    </Container>
  );
};

export default OrganizationList;
