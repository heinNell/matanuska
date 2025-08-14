# Client Data Management for Matanuska Transport Platform

This guide explains how to seed client data into Firestore and use the client dropdown components in your forms.

## Seeding Client Data

We've created a script to seed client data from `seedclientlist.cjs` into Firestore.

### Prerequisites

- Make sure Firebase Admin SDK is installed:
  ```
  npm install firebase-admin
  ```
- You need a service account key file for Firebase Admin SDK authentication. Place it in the project root as `serviceAccountKey.json` or set the `GOOGLE_APPLICATION_CREDENTIALS` environment variable.

### How to Run the Seeding Script

Run the following command from the project root:

```bash
node seedClients.mjs
```

This will:
1. Read client data from `seedclientlist.cjs`
2. Format document IDs from client names
3. Add metadata fields (createdAt, updatedAt, active)
4. Upload clients to the 'clients' collection in Firestore in batches

## Using Client Dropdown Components

We've created reusable dropdown components for selecting clients:

### Basic Usage

Import and use the `ClientDropdown` component:

```jsx
import ClientDropdown from '../components/clients/ClientDropdown';

function MyComponent() {
  const [selectedClientId, setSelectedClientId] = useState('');

  return (
    <ClientDropdown
      value={selectedClientId}
      onChange={setSelectedClientId}
      label="Client"
      required={true}
      includeContact={true}
    />
  );
}
```

### React Hook Form Integration

For forms using `react-hook-form`, use the `FormClientDropdown` component:

```jsx
import { useForm, FormProvider } from 'react-hook-form';
import FormClientDropdown from '../components/clients/FormClientDropdown';

function MyFormComponent() {
  const methods = useForm({
    defaultValues: {
      clientId: ''
    }
  });

  const onSubmit = (data) => {
    console.log('Selected client ID:', data.clientId);
    // Process form data...
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <FormClientDropdown
          name="clientId"
          label="Client"
          required={true}
          includeContact={true}
        />
        <button type="submit">Submit</button>
      </form>
    </FormProvider>
  );
}
```

### Direct Access to Client Data

To directly access client data, use the provided hooks:

```jsx
import { useClientDropdown, useClientSearch, useClient } from '../hooks/useClients';

function MyComponent() {
  // Get all clients
  const { clients, loading, error } = useClientDropdown();

  // Search clients
  const { results } = useClientSearch('search term');

  // Get a specific client
  const { client } = useClient('client-id');

  // Use client data as needed
  // ...
}
```

## Example Page

We've created an example page to demonstrate how to use these components.
Visit `/examples/clients` in the application to see:

1. Basic ClientDropdown usage
2. Form integration with FormClientDropdown
3. How client data is loaded and displayed

## Component Options

### ClientDropdown Props

| Prop | Type | Description |
|------|------|-------------|
| value | string | Selected client ID |
| onChange | function | Callback when selection changes |
| required | boolean | Whether selection is required |
| label | string | Label text for the dropdown |
| placeholder | string | Placeholder text when no selection |
| includeContact | boolean | Whether to show contact info in dropdown |
| disabled | boolean | Whether the dropdown is disabled |
| searchable | boolean | Whether to enable searching |
| options | object | Additional options for useClientDropdown |

### FormClientDropdown Props

Includes all ClientDropdown props plus:

| Prop | Type | Description |
|------|------|-------------|
| name | string | Field name in the form |
| rules | object | Validation rules for react-hook-form |
