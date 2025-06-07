import React, { useMemo } from 'react';
import {
  Box,
  VStack,
  Input,
  Textarea,
  Button,
  Portal,
  createListCollection,
  Field,
  Select as NewSelect,
} from '@chakra-ui/react';

type AuditLogFormProps = {
  mode: 'create' | 'edit';
  formData: {
    _id?: string;
    organizationId: string[]; // single‐element array, per NewSelect API
    userId: string[];
    resource: string[];    // e.g. ["Organization"], ["User"], ["Document"], ["ComplianceRule"]
    resourceId: string[];  // the ObjectId array for whichever “resource” is selected
    action: string;
    ipAddress: string;
    userAgent: string;
    metadata: string;      // JSON string
    timestamp?: string;    // ISO string (readonly when editing)
  };
  // these lists come from parent:
  organizations: { _id: string; name: string }[];
  users: { _id: string; fullName: string }[];
  // documents: { _id: string; title: string }[];            // from GET_DOCUMENTS
  complianceRules: { _id: string; name: string }[];       // from GET_COMPLIANCE_RULES
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onChangeSelect: (fieldName: 'organizationId' | 'userId' | 'resource' | 'resourceId', value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  dialogContentRef?: React.RefObject<HTMLDivElement>;
};

export const AuditLogForm: React.FC<AuditLogFormProps> = ({
  mode,
  formData,
  organizations,
  users,
  // documents,
  complianceRules,
  onChange,
  onChangeSelect,
  onSubmit,
  onCancel,
  dialogContentRef,
}) => {
  //
  // 1) Build collection for “Organization” select
  //
  const orgCollection = createListCollection({
    items: organizations.map((org) => ({
      label: org.name,
      value: org._id,
    })),
  });

  //
  // 2) Build collection for “User” select
  //
  const userCollection = createListCollection({
    items: users.map((u) => ({
      label: u.fullName,
      value: u._id,
    })),
  });

  //
  // 3) Build collection for “Document” select
  //    (assume each document has `_id` and `title`)
  //
  // const docCollection = createListCollection({
  //   items: documents.map((d) => ({
  //     label: d.title,
  //     value: d._id,
  //   })),
  // });

  //
  // 4) Build collection for “ComplianceRule” select
  //    (assume each complianceRule has `_id` and `name`)
  //
  const crCollection = createListCollection({
    items: complianceRules.map((r) => ({
      label: r.name,
      value: r._id,
    })),
  });

  //
  // 5) A static collection of RESOURCE TYPES (the top‐level “resource” dropdown)
  //
  const resourceTypesCollection = createListCollection({
    items: [
      { label: 'Organization', value: 'Organization' },
      { label: 'User', value: 'User' },
      // { label: 'Document', value: 'Document' },
      { label: 'ComplianceRule', value: 'ComplianceRule' },
      // …add more if you have Violations, Tasks, Alerts, etc.
    ],
  });

  //
  // 6) Depending on formData.resource[0], pick the correct collection for “resourceId”
  //
  const resourceIdCollection = useMemo(() => {
    const resType = formData.resource[0];
    switch (resType) {
      case 'Organization':
        return orgCollection;
      case 'User':
        return userCollection;
      // case 'Document':
      //   return docCollection;
      case 'ComplianceRule':
        return crCollection;
      default:
        // empty fallback
        return createListCollection({ items: [] });
    }
  }, [
    formData.resource, // whenever the user picks a different resource type
    orgCollection,
    userCollection,
    // docCollection,
    crCollection,
  ]);

  return (
    <Box p={4} borderWidth="1px" mb={4} borderRadius="md">
      <VStack spacing={4} align="stretch" ref={dialogContentRef}>
        {/* ─── Organization Select ─── */}
        <Field.Root>
          <Field.Label>Organization</Field.Label>
          <NewSelect.Root
            collection={orgCollection}
            value={formData.organizationId}
            onValueChange={(item) =>
              onChangeSelect('organizationId', item.value)
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

        {/* ─── User Select ─── */}
        <Field.Root>
          <Field.Label>User</Field.Label>
          <NewSelect.Root
            collection={userCollection}
            value={formData.userId}
            onValueChange={(item) => onChangeSelect('userId', item.value)}
          >
            <NewSelect.HiddenSelect name="userId" />
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

        {/* ─── Action (free‐text) ─── */}
        <Field.Root>
          <Field.Label>Action</Field.Label>
          <Input
            name="action"
            value={formData.action}
            onChange={onChange}
            placeholder="e.g. CREATE, UPDATE, DELETE"
          />
        </Field.Root>

        {/* ─── Resource Type Select ─── */}
        <Field.Root>
          <Field.Label>Resource</Field.Label>
          <NewSelect.Root
            collection={resourceTypesCollection}
            value={formData.resource}
            onValueChange={(item) => {
              // whenever resource type changes, reset resourceId to [] as well
              onChangeSelect('resource', item.value);
              onChangeSelect('resourceId', []);
            }}
          >
            <NewSelect.HiddenSelect name="resource" />
            <NewSelect.Control>
              <NewSelect.Trigger>
                <NewSelect.ValueText placeholder="Select resource type" />
              </NewSelect.Trigger>
              <NewSelect.IndicatorGroup>
                <NewSelect.Indicator />
              </NewSelect.IndicatorGroup>
            </NewSelect.Control>
            <Portal container={dialogContentRef}>
              <NewSelect.Positioner>
                <NewSelect.Content>
                  {resourceTypesCollection.items.map((item) => (
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

        {/* ─── Resource‐ID Select (dependent on “resource” above) ─── */}
        <Field.Root>
          <Field.Label>Resource ID</Field.Label>
          <NewSelect.Root
            collection={resourceIdCollection}
            value={formData.resourceId}
            onValueChange={(item) => onChangeSelect('resourceId', item.value)}
          >
            <NewSelect.HiddenSelect name="resourceId" />
            <NewSelect.Control>
              <NewSelect.Trigger>
                <NewSelect.ValueText placeholder="Select resource ID" />
              </NewSelect.Trigger>
              <NewSelect.IndicatorGroup>
                <NewSelect.Indicator />
              </NewSelect.IndicatorGroup>
            </NewSelect.Control>
            <Portal container={dialogContentRef}>
              <NewSelect.Positioner>
                <NewSelect.Content>
                  {resourceIdCollection.items.map((item) => (
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

        {/* ─── IP Address ─── */}
        <Field.Root>
          <Field.Label>IP Address</Field.Label>
          <Input
            name="ipAddress"
            value={formData.ipAddress}
            onChange={onChange}
            placeholder="e.g. 192.168.0.1"
          />
        </Field.Root>

        {/* ─── User Agent ─── */}
        <Field.Root>
          <Field.Label>User Agent</Field.Label>
          <Input
            name="userAgent"
            value={formData.userAgent}
            onChange={onChange}
            placeholder="e.g. Mozilla/5.0…"
          />
        </Field.Root>

        {/* ─── Metadata (JSON) ─── */}
        <Field.Root>
          <Field.Label>Metadata (JSON)</Field.Label>
          <Textarea
            name="metadata"
            value={formData.metadata}
            onChange={onChange}
            placeholder='e.g. {"foo":"bar"}'
            rows={4}
          />
        </Field.Root>

        {/* ─── Buttons ─── */}
        <Button colorScheme="blue" onClick={onSubmit}>
          {mode === 'create' ? 'Create Audit Log' : 'Update Audit Log'}
        </Button>
      </VStack>
    </Box>
  );
};
