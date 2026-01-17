# Frappe Hooks - Usage Guide

A complete React hooks library for seamless Frappe/ERPNext integration.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Authentication](#authentication)
- [Available Hooks](#available-hooks)
  - [useDocuments](#usedocuments)
  - [useDocument](#usedocument)
  - [useCreateDocument](#usecreatedocument)
  - [useUpdateDocument](#updatedocument)
  - [useDeleteDocument](#usedeletedocument)
  - [useAuth](#useauth)
  - [useFrappeClient](#usefrappeclient)
- [Advanced Usage](#advanced-usage)
- [TypeScript Support](#typescript-support)
- [Examples](#examples)

## Installation

```bash
npm install @rustedcompiler/frappe-hooks
```

Or with yarn:

```bash
yarn add @rustedcompiler/frappe-hooks
```

## Quick Start

### 1. Wrap your app with FrappeProvider

```tsx
import React from 'react';
import { FrappeProvider } from '@rustedcompiler/frappe-hooks';
import App from './App';

function Root() {
  return (
    <FrappeProvider
      options={{
        url: 'https://your-erpnext-site.com',
        token: 'your-api-key:your-api-secret',
        useToken: true
      }}
      cacheTTL={300000} // Optional: Cache TTL in milliseconds (default: 5 minutes)
    >
      <App />
    </FrappeProvider>
  );
}

export default Root;
```

### 2. Use hooks in your components

```tsx
import { useDocuments } from '@rustedcompiler/frappe-hooks';

function ItemsList() {
  const { data, isLoading, error } = useDocuments('Item', {
    fields: ['name', 'item_name', 'item_group'],
    limit_page_length: 20
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {data?.map(item => (
        <li key={item.name}>{item.item_name}</li>
      ))}
    </ul>
  );
}
```

## Authentication

### Token-Based Authentication (Recommended)

Generate API keys from ERPNext:
1. Go to User List
2. Open your user
3. Scroll to "API Access" section
4. Click "Generate Keys"

```tsx
<FrappeProvider
  options={{
    url: 'https://your-site.erpnext.com',
    token: 'api_key:api_secret',
    useToken: true
  }}
>
  {/* Your app */}
</FrappeProvider>
```

### Password-Based Authentication

```tsx
<FrappeProvider
  options={{
    url: 'https://your-site.erpnext.com',
    username: 'your_username',
    password: 'your_password',
    useToken: false
  }}
>
  {/* Your app */}
</FrappeProvider>
```

## Available Hooks

### useDocuments

Fetch a list of documents from a DocType.

```tsx
import { useDocuments } from '@rustedcompiler/frappe-hooks';

function CustomersList() {
  const { data, isLoading, error } = useDocuments('Customer', {
    fields: ['name', 'customer_name', 'territory', 'customer_group'],
    filters: [['Customer', 'disabled', '=', 0]],
    limit_page_length: 50,
    order_by: 'customer_name asc'
  });

  if (isLoading) return <p>Loading customers...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h2>Customers ({data?.length})</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Territory</th>
            <th>Group</th>
          </tr>
        </thead>
        <tbody>
          {data?.map(customer => (
            <tr key={customer.name}>
              <td>{customer.customer_name}</td>
              <td>{customer.territory}</td>
              <td>{customer.customer_group}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

#### Options

```typescript
interface QueryOptions {
  fields?: string[];              // Fields to fetch
  filters?: Filter[];             // Filters to apply
  limit_start?: number;           // Pagination offset
  limit_page_length?: number;     // Number of records
  order_by?: string;              // Sort order
}

type Filter = [doctype, field, operator, value];
// Example: ['Item', 'item_group', '=', 'Products']
```

### useDocument

Fetch a single document by name.

```tsx
import { useDocument } from '@rustedcompiler/frappe-hooks';

function CustomerDetails({ customerId }: { customerId: string }) {
  const { data, isLoading, error } = useDocument('Customer', customerId);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h2>{data?.customer_name}</h2>
      <p>Email: {data?.email_id}</p>
      <p>Phone: {data?.mobile_no}</p>
      <p>Territory: {data?.territory}</p>
    </div>
  );
}
```

### useCreateDocument

Create a new document.

```tsx
import { useCreateDocument } from '@rustedcompiler/frappe-hooks';

function CreateCustomerForm() {
  const { mutate: createCustomer, isLoading } = useCreateDocument({
    onSuccess: (data) => {
      console.log('Customer created:', data);
      alert('Customer created successfully!');
    },
    onError: (error) => {
      console.error('Failed to create customer:', error);
      alert('Failed to create customer');
    }
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    await createCustomer({
      docType: 'Customer',
      data: {
        customer_name: formData.get('name'),
        customer_type: 'Individual',
        customer_group: 'Individual',
        territory: 'All Territories',
        email_id: formData.get('email'),
        mobile_no: formData.get('phone')
      }
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Customer Name" required />
      <input name="email" type="email" placeholder="Email" />
      <input name="phone" placeholder="Phone" />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Creating...' : 'Create Customer'}
      </button>
    </form>
  );
}
```

### useUpdateDocument

Update an existing document.

```tsx
import { useUpdateDocument } from '@rustedcompiler/frappe-hooks';

function UpdateCustomer({ customerId }: { customerId: string }) {
  const { mutate: updateCustomer, isLoading } = useUpdateDocument({
    onSuccess: () => alert('Customer updated!'),
    onError: (error) => alert('Update failed: ' + error.message)
  });

  const handleUpdate = async () => {
    await updateCustomer({
      docType: 'Customer',
      documentId: customerId,
      data: {
        mobile_no: '+1234567890',
        email_id: 'newemail@example.com'
      }
    });
  };

  return (
    <button onClick={handleUpdate} disabled={isLoading}>
      {isLoading ? 'Updating...' : 'Update Contact Info'}
    </button>
  );
}
```

### useDeleteDocument

Delete a document.

```tsx
import { useDeleteDocument } from '@rustedcompiler/frappe-hooks';

function DeleteCustomer({ customerId }: { customerId: string }) {
  const { mutate: deleteCustomer, isLoading } = useDeleteDocument({
    onSuccess: () => {
      alert('Customer deleted successfully');
      // Navigate away or refresh list
    },
    onError: (error) => {
      alert('Failed to delete: ' + error.message);
    }
  });

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this customer?')) {
      deleteCustomer({
        docType: 'Customer',
        documentId: customerId
      });
    }
  };

  return (
    <button onClick={handleDelete} disabled={isLoading}>
      {isLoading ? 'Deleting...' : 'Delete Customer'}
    </button>
  );
}
```

### useAuth

Handle login and logout.

```tsx
import { useAuth } from '@rustedcompiler/frappe-hooks';

function LoginForm() {
  const { login, logout, isLoading, error } = useAuth();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      await login(
        formData.get('username') as string,
        formData.get('password') as string
      );
      alert('Logged in successfully!');
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input name="username" placeholder="Username" required />
      <input name="password" type="password" placeholder="Password" required />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
      {error && <p style={{ color: 'red' }}>{error.message}</p>}
    </form>
  );
}
```

### useFrappeClient

Access the raw Frappe client for custom API calls.

```tsx
import { useFrappeClient } from '@rustedcompiler/frappe-hooks';

function CustomApiCall() {
  const { client, call, getDoc, getList } = useFrappeClient();

  const callCustomMethod = async () => {
    // Call a whitelisted method
    const result = await call('your_app.api.custom_method', {
      param1: 'value1',
      param2: 'value2'
    });
    console.log(result);
  };

  const fetchDocument = async () => {
    // Get a specific document
    const doc = await getDoc('Item', 'ITEM-001');
    console.log(doc);
  };

  const fetchList = async () => {
    // Get a list of documents
    const list = await getList('Customer', {
      fields: ['name', 'customer_name'],
      limit_page_length: 10
    });
    console.log(list);
  };

  // Direct API access
  const directCall = async () => {
    const result = await client.post('/api/method/custom_endpoint', {
      data: 'your data'
    });
    console.log(result);
  };

  return (
    <div>
      <button onClick={callCustomMethod}>Call Custom Method</button>
      <button onClick={fetchDocument}>Fetch Document</button>
      <button onClick={fetchList}>Fetch List</button>
      <button onClick={directCall}>Direct API Call</button>
    </div>
  );
}
```

## Advanced Usage

### Custom Filters

```tsx
// Simple filter
const { data } = useDocuments('Item', {
  filters: [['Item', 'item_group', '=', 'Products']]
});

// Multiple filters
const { data } = useDocuments('Sales Order', {
  filters: [
    ['Sales Order', 'status', '=', 'Draft'],
    ['Sales Order', 'customer', '=', 'CUST-001'],
    ['Sales Order', 'grand_total', '>', 1000]
  ]
});

// Complex filters with OR conditions
const { data } = useDocuments('Item', {
  filters: [
    ['Item', 'item_group', 'in', ['Products', 'Services']],
    ['Item', 'disabled', '=', 0]
  ]
});
```

### Pagination

```tsx
function PaginatedList() {
  const [page, setPage] = useState(0);
  const pageSize = 20;

  const { data, isLoading } = useDocuments('Customer', {
    limit_start: page * pageSize,
    limit_page_length: pageSize,
    order_by: 'creation desc'
  });

  return (
    <div>
      {/* Render data */}
      <div>
        <button 
          onClick={() => setPage(p => Math.max(0, p - 1))}
          disabled={page === 0}
        >
          Previous
        </button>
        <span>Page {page + 1}</span>
        <button 
          onClick={() => setPage(p => p + 1)}
          disabled={!data || data.length < pageSize}
        >
          Next
        </button>
      </div>
    </div>
  );
}
```

### Conditional Fetching

```tsx
function ConditionalFetch({ shouldFetch, itemId }: { shouldFetch: boolean; itemId: string }) {
  const { data, isLoading } = useDocument(
    'Item',
    shouldFetch ? itemId : '',
  );

  // Document will only be fetched when shouldFetch is true and itemId is not empty
  
  return <div>{data?.item_name}</div>;
}
```

### Error Handling

```tsx
function RobustComponent() {
  const { data, isLoading, error } = useDocuments('Item');

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="error">
        <h3>Failed to load items</h3>
        <p>{error.message}</p>
        <button onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return <EmptyState message="No items found" />;
  }

  return (
    <div>
      {/* Render data */}
    </div>
  );
}
```

## TypeScript Support

All hooks are fully typed. You can provide your own types:

```tsx
interface Customer {
  name: string;
  customer_name: string;
  customer_type: 'Company' | 'Individual';
  territory: string;
  email_id?: string;
  mobile_no?: string;
}

function TypedComponent() {
  const { data } = useDocuments<Customer>('Customer');
  const { data: customer } = useDocument<Customer>('Customer', 'CUST-001');
  
  const { mutate } = useCreateDocument<Customer>({
    onSuccess: (newCustomer) => {
      // newCustomer is typed as Customer
      console.log(newCustomer.customer_name);
    }
  });

  // Type-safe creation
  mutate({
    docType: 'Customer',
    data: {
      customer_name: 'John Doe',
      customer_type: 'Individual', // Autocomplete works!
      territory: 'All Territories'
    }
  });
}
```

## Examples

### Complete CRUD Example

```tsx
import React, { useState } from 'react';
import {
  useDocuments,
  useDocument,
  useCreateDocument,
  useUpdateDocument,
  useDeleteDocument
} from '@rustedcompiler/frappe-hooks';

function CustomerManager() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Fetch all customers
  const { data: customers, isLoading } = useDocuments('Customer', {
    fields: ['name', 'customer_name', 'territory'],
    order_by: 'customer_name asc'
  });

  // Fetch selected customer details
  const { data: selectedCustomer } = useDocument(
    'Customer',
    selectedId || ''
  );

  // Create mutation
  const { mutate: createCustomer } = useCreateDocument({
    onSuccess: () => {
      setIsCreating(false);
      alert('Customer created!');
    }
  });

  // Update mutation
  const { mutate: updateCustomer } = useUpdateDocument({
    onSuccess: () => alert('Customer updated!')
  });

  // Delete mutation
  const { mutate: deleteCustomer } = useDeleteDocument({
    onSuccess: () => {
      setSelectedId(null);
      alert('Customer deleted!');
    }
  });

  const handleCreate = (formData: any) => {
    createCustomer({
      docType: 'Customer',
      data: formData
    });
  };

  const handleUpdate = (formData: any) => {
    if (!selectedId) return;
    updateCustomer({
      docType: 'Customer',
      documentId: selectedId,
      data: formData
    });
  };

  const handleDelete = () => {
    if (!selectedId) return;
    if (confirm('Delete this customer?')) {
      deleteCustomer({
        docType: 'Customer',
        documentId: selectedId
      });
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div style={{ display: 'flex', gap: '2rem' }}>
      {/* Customer List */}
      <div>
        <h2>Customers</h2>
        <button onClick={() => setIsCreating(true)}>+ New Customer</button>
        <ul>
          {customers?.map(customer => (
            <li
              key={customer.name}
              onClick={() => setSelectedId(customer.name)}
              style={{
                cursor: 'pointer',
                fontWeight: selectedId === customer.name ? 'bold' : 'normal'
              }}
            >
              {customer.customer_name}
            </li>
          ))}
        </ul>
      </div>

      {/* Customer Details */}
      <div>
        {isCreating ? (
          <CustomerForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreating(false)}
          />
        ) : selectedCustomer ? (
          <div>
            <h2>{selectedCustomer.customer_name}</h2>
            <p>Territory: {selectedCustomer.territory}</p>
            <p>Email: {selectedCustomer.email_id}</p>
            <button onClick={() => handleUpdate({ mobile_no: '+123456' })}>
              Update
            </button>
            <button onClick={handleDelete}>Delete</button>
          </div>
        ) : (
          <p>Select a customer</p>
        )}
      </div>
    </div>
  );
}

// Simple form component
function CustomerForm({ 
  onSubmit, 
  onCancel 
}: { 
  onSubmit: (data: any) => void;
  onCancel: () => void;
}) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onSubmit({
      customer_name: formData.get('name'),
      customer_type: 'Individual',
      customer_group: 'Individual',
      territory: 'All Territories',
      email_id: formData.get('email')
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>New Customer</h3>
      <input name="name" placeholder="Name" required />
      <input name="email" type="email" placeholder="Email" />
      <button type="submit">Create</button>
      <button type="button" onClick={onCancel}>Cancel</button>
    </form>
  );
}
```

### Real-time Search

```tsx
import { useState, useMemo } from 'react';
import { useDocuments } from '@rustedcompiler/frappe-hooks';

function SearchableList() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: items } = useDocuments('Item', {
    fields: ['name', 'item_name', 'item_group'],
    limit_page_length: 100
  });

  const filteredItems = useMemo(() => {
    if (!searchTerm) return items;
    return items?.filter(item =>
      item.item_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [items, searchTerm]);

  return (
    <div>
      <input
        type="search"
        placeholder="Search items..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <ul>
        {filteredItems?.map(item => (
          <li key={item.name}>{item.item_name}</li>
        ))}
      </ul>
    </div>
  );
}
```

## Best Practices

1. **Use TypeScript**: Leverage type safety for better development experience
2. **Handle Loading States**: Always show loading indicators
3. **Handle Errors**: Implement proper error handling and user feedback
4. **Optimize Queries**: Only fetch the fields you need
5. **Cache Wisely**: Adjust `cacheTTL` based on your data update frequency
6. **Validate Before Mutation**: Validate form data before creating/updating documents

## Troubleshooting

### CORS Issues

If you encounter CORS errors, add your frontend URL to ERPNext's allowed origins:

```python
# In your site's site_config.json
{
  "allow_cors": "*",
  "cors_allowed_origins": [
    "http://localhost:3000",
    "https://your-frontend-domain.com"
  ]
}
```

### Authentication Errors

- Ensure your API keys are correct
- Check that the user has proper permissions
- Verify the ERPNext URL is correct (with https://)

### Type Errors

- Ensure you're using TypeScript 4.5+
- Install type definitions: `npm install --save-dev @types/react`

## Contributing

Found a bug or want to contribute? Check out our [GitHub repository](https://github.com/yourusername/frappe-hooks).

## License

MIT © [Your Name]
