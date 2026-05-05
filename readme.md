# Frappe Hooks

[![npm version](https://badge.fury.io/js/@rustedcompiler%2Ffrappe-hooks.svg)](https://www.npmjs.com/package/@rustedcompiler/frappe-hooks)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

React hooks library for Frappe/ERPNext integration.

---

## Table of Contents

- [Overview](#overview)
- [Setup](#setup)
- [Usage Examples](#usage-examples)
- [Complete Examples](#complete-examples)
- [Security Best Practices](#security-best-practices)
- [API Reference](#api-reference)
- [Troubleshooting](#troubleshooting)

## Overview

Dynamic authentication allows your application to:
- Start without credentials and let users login later
- Switch between different accounts at runtime
- Support both password and API token authentication
- Provide a login/logout flow similar to traditional apps

---

## Setup

### Enable Dynamic Authentication

Wrap your app with `FrappeProvider` and enable the feature:

```tsx
import { FrappeProvider } from '@rustedcompiler/frappe-hooks';

function App() {
  return (
    <FrappeProvider
      options={{
        url: 'https://your-erpnext-site.com'
        // No credentials initially
      }}
      enableDynamicAuth={true}
    >
      <YourApp />
    </FrappeProvider>
  );
}
```

### `FrappeProvider` Props

```tsx
<FrappeProvider
  options={{ url: 'https://your-erpnext-site.com' }}
  enableDynamicAuth={true}
  cacheTTL={300000}
>
  <App />
</FrappeProvider>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | `FrappeClientOptions` | required | Base configuration for the Frappe client (see below). |
| `enableDynamicAuth` | `boolean` | `false` | Enables runtime credential updates via `useAuth`. Must be `true` to use `login`, `logout`, and `loginWithAPIToken`. |
| `cacheTTL` | `number` | `300000` | Cache time-to-live in milliseconds. Cached responses older than this are discarded and re-fetched. Default is 5 minutes. |

### `FrappeClientOptions`

```typescript
interface FrappeClientOptions {
  url: string;           // Base URL of your Frappe instance
  token?: string;        // API token in "key:secret" format
  username?: string;     // Username for basic auth
  password?: string;     // Password for basic auth
  useToken?: boolean;    // Whether to use token-based auth
}
```

| Option | Type | Description |
|--------|------|-------------|
| `url` | `string` | Base URL of your Frappe/ERPNext instance. Required. |
| `token` | `string` | API token in `"key:secret"` format. If provided, the client is considered authenticated on mount. |
| `username` | `string` | Username for session-based auth. If provided alongside `password`, the client is considered authenticated on mount. |
| `password` | `string` | Password for session-based auth. |
| `useToken` | `boolean` | When `true`, forces token-based authentication. |

#### cacheTTL Examples

```tsx
// Default — cache responses for 5 minutes
<FrappeProvider options={{ url: '...' }}>

// Aggressive caching — cache for 30 minutes
<FrappeProvider options={{ url: '...' }} cacheTTL={1800000}>

// No caching — always re-fetch
<FrappeProvider options={{ url: '...' }} cacheTTL={0}>

// Short TTL for frequently changing data
<FrappeProvider options={{ url: '...' }} cacheTTL={10000}>
```

> Cache is automatically cleared when credentials change via `updateCredentials` or `clearCredentials`.

---

## Usage Examples

### `useAuth`

```tsx
import { useAuth } from '@rustedcompiler/frappe-hooks';

function AuthExample() {
  const {
    login,
    loginWithAPIToken,
    dynamicLogin,
    logout,
    getCurrentUser,
    isLoading,
    error,
    isAuthenticated,
  } = useAuth();

  // Session-based login
  await login('Administrator', 'password');

  // Token-based login
  await loginWithAPIToken('api_key', 'api_secret');

  // Dynamic login — accepts either method
  await dynamicLogin({ username: 'Administrator', password: 'password' });
  await dynamicLogin({ apiKey: 'api_key', apiSecret: 'api_secret' });

  // Get current logged in user
  const user = await getCurrentUser();

  // Logout
  await logout();

  return (
    <div>
      <p>Status: {isAuthenticated ? 'Authenticated' : 'Not authenticated'}</p>
      {isLoading && <p>Loading...</p>}
      {error && <p>{error.message}</p>}
    </div>
  );
}
```

### 1. Login Form with Username/Password

```tsx
import { useAuth } from '@rustedcompiler/frappe-hooks';
import { useState } from 'react';

function LoginForm() {
  const { login, isLoading, error, isAuthenticated } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(username, password);
      console.log('Login successful!');
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  if (isAuthenticated) {
    return <div>You are logged in!</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login to ERPNext</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
      {error && <p style={{ color: 'red' }}>{error.message}</p>}
    </form>
  );
}
```

### 2. Login with API Token

```tsx
import { useAuth } from '@rustedcompiler/frappe-hooks';
import { useState } from 'react';

function APITokenLogin() {
  const { loginWithAPIToken, isLoading, error } = useAuth();
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await loginWithAPIToken(apiKey, apiSecret);
      console.log('Connected with API token!');
    } catch (err) {
      console.error('Connection failed:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Connect with API Token</h2>
      <input
        type="text"
        placeholder="API Key"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="API Secret"
        value={apiSecret}
        onChange={(e) => setApiSecret(e.target.value)}
        required
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Connecting...' : 'Connect'}
      </button>
      {error && <p style={{ color: 'red' }}>{error.message}</p>}
    </form>
  );
}
```

### 3. Logout

```tsx
import { useAuth } from '@rustedcompiler/frappe-hooks';

function LogoutButton() {
  const { logout, isLoading, isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  return (
    <button onClick={logout} disabled={isLoading}>
      {isLoading ? 'Logging out...' : 'Logout'}
    </button>
  );
}
```

### 4. Protected Routes

```tsx
import { useAuth } from '@rustedcompiler/frappe-hooks';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginForm />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
```

### 5. Dynamic Login (Both Methods)

```tsx
import { useAuth } from '@rustedcompiler/frappe-hooks';
import { useState } from 'react';

function FlexibleLogin() {
  const { dynamicLogin, isLoading, error } = useAuth();
  const [authMethod, setAuthMethod] = useState<'password' | 'token'>('password');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (authMethod === 'password') {
        await dynamicLogin({ username, password });
      } else {
        await dynamicLogin({ apiKey, apiSecret });
      }
    } catch (err) {
      console.error('Authentication failed:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        <input type="radio" value="password" checked={authMethod === 'password'}
          onChange={() => setAuthMethod('password')} />
        Username & Password
      </label>
      <label>
        <input type="radio" value="token" checked={authMethod === 'token'}
          onChange={() => setAuthMethod('token')} />
        API Token
      </label>
      {authMethod === 'password' ? (
        <>
          <input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </>
      ) : (
        <>
          <input placeholder="API Key" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
          <input type="password" placeholder="API Secret" value={apiSecret} onChange={(e) => setApiSecret(e.target.value)} />
        </>
      )}
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Authenticating...' : 'Login'}
      </button>
      {error && <p style={{ color: 'red' }}>{error.message}</p>}
    </form>
  );
}
```

### 6. Get Current User

```tsx
import { useAuth } from '@rustedcompiler/frappe-hooks';

function UserInfo() {
  const { getCurrentUser } = useAuth();
  const [user, setUser] = useState<any>(null);

  React.useEffect(() => {
    getCurrentUser().then(setUser).catch(console.error);
  }, []);

  return <p>Logged in as: {user?.message}</p>;
}
```

---

### `useDocuments`

Fetches a list of documents. Re-fetches automatically when `doctype` or `options` content changes.

```tsx
const { data, isLoading, error } = useDocuments(doctype, options);
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `doctype` | `string` | The Frappe doctype to query. |
| `options` | `QueryOptions` | Optional query options (see `QueryOptions` reference). |

#### Returns

| Field | Type | Description |
|-------|------|-------------|
| `data` | `T[]` | Array of documents. Empty array until loaded. |
| `isLoading` | `boolean` | `true` while the request is in progress. |
| `error` | `Error \| null` | Set if the request failed, otherwise `null`. |

**Basic fetch**
```tsx
import { useDocuments } from '@rustedcompiler/frappe-hooks';

function UserList() {
  const { data, isLoading, error } = useDocuments('User', {
    fields: ['name', 'email'],
    limit_page_length: 10,
  });

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <ul>
      {data.map(user => (
        <li key={user.name}>{user.email}</li>
      ))}
    </ul>
  );
}
```

**With AND / OR filters**
```tsx
// AND filters (default)
const { data } = useDocuments('User', {
  fields: ['name', 'email'],
  filters: [
    ['User', 'enabled', '=', 1],
    ['User', 'user_type', '=', 'System User'],
  ],
});

// OR filters
const { data } = useDocuments('User', {
  fields: ['name', 'email'],
  filters: [
    ['User', 'user_type', '=', 'System User'],
    ['User', 'user_type', '=', 'Website User'],
  ],
  is_or: true,
});
```

**With pagination**
```tsx
const [page, setPage] = useState(0);
const pageSize = 20;

const { data } = useDocuments('Customer', {
  fields: ['name', 'customer_name'],
  limit_start: page * pageSize,
  limit_page_length: pageSize,
  order_by: 'creation desc',
});
```

**With expanded link fields**
```tsx
// "priority" must be in both fields and expand
const { data } = useDocuments('Task', {
  fields: ['name', 'priority'],
  expand: ['priority'],
});

// data[0].priority is now an object, not just an ID
// { name: 'a1b2c3', title: 'Medium', creation: '...' }
```

**All options**
```tsx
const { data } = useDocuments('User', {
  fields: ['name', 'email'],
  filters: [['User', 'enabled', '=', 1]],
  limit_page_length: 10,
  limit_start: 0,
  order_by: 'creation desc',
  expand: ['role'],
  as_dict: true,
  debug: false,
  is_or: false,
});
```

---

### `useDocument`

Fetches a single document by name.

```tsx
const { data, isLoading, error } = useDocument(doctype, name, expandLinks);
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `doctype` | `string` | The Frappe doctype to query. |
| `name` | `string` | The name/ID of the document to fetch. |
| `expandLinks` | `boolean` | When `true`, expands all link fields inline. Default `false`. |

#### Returns

| Field | Type | Description |
|-------|------|-------------|
| `data` | `T \| null` | The document, or `null` until loaded. |
| `isLoading` | `boolean` | `true` while the request is in progress. |
| `error` | `Error \| null` | Set if the request failed, otherwise `null`. |

**Basic fetch**
```tsx
import { useDocument } from '@rustedcompiler/frappe-hooks';

function UserProfile({ userId }: { userId: string }) {
  const { data, isLoading, error } = useDocument('User', userId);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (!data) return null;

  return (
    <div>
      <h2>{data.full_name}</h2>
      <p>{data.email}</p>
    </div>
  );
}
```

**With expanded link fields**
```tsx
const { data } = useDocument('Task', 'TASK-0001', true);

// Link fields are returned as objects instead of IDs
// data.assigned_to = { name: 'user@example.com', full_name: 'John' }
```

---

### `useCreateDocument`

```tsx
import { useCreateDocument } from '@rustedcompiler/frappe-hooks';

function CreateExample() {
  const { mutate, isLoading, error } = useCreateDocument({
    onSuccess: (data) => console.log('Created:', data),
    onError: (err) => console.error('Failed:', err),
    invalidate: /^docs:/,  // invalidate matching cache keys after creation
  });

  const handleCreate = async () => {
    await mutate({
      docType: 'ToDo',
      data: { description: 'My new todo' },
    });
  };

  return (
    <button onClick={handleCreate} disabled={isLoading}>
      {isLoading ? 'Creating...' : 'Create'}
    </button>
  );
}
```

---

### `useUpdateDocument`

```tsx
import { useUpdateDocument } from '@rustedcompiler/frappe-hooks';

function UpdateExample() {
  const { mutate, isLoading, error } = useUpdateDocument({
    onSuccess: (data) => console.log('Updated:', data),
    onError: (err) => console.error('Failed:', err),
  });

  const handleUpdate = async () => {
    await mutate({
      docType: 'ToDo',
      documentId: 'todo-name-here',
      data: { description: 'Updated description' },
    });
  };

  return (
    <button onClick={handleUpdate} disabled={isLoading}>
      {isLoading ? 'Updating...' : 'Update'}
    </button>
  );
}
```

---

### `useDeleteDocument`

```tsx
import { useDeleteDocument } from '@rustedcompiler/frappe-hooks';

function DeleteExample() {
  const { mutate, isLoading, error } = useDeleteDocument({
    onSuccess: () => console.log('Deleted'),
    onError: (err) => console.error('Failed:', err),
  });

  const handleDelete = async () => {
    await mutate({
      docType: 'ToDo',
      documentId: 'todo-name-here',
    });
  };

  return (
    <button onClick={handleDelete} disabled={isLoading}>
      {isLoading ? 'Deleting...' : 'Delete'}
    </button>
  );
}
```

---

### `useUploadFile`

```tsx
import { useUploadFile } from '@rustedcompiler/frappe-hooks';

function UploadExample() {
  const { upload, isLoading, error, data } = useUploadFile({
    onSuccess: (res) => console.log('Uploaded to:', res.message.file_url),
    onError: (err) => console.error('Failed:', err),
  });

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await upload(file, {
      doctype: 'Customer',   // optional — attach to a document
      docname: 'CUST-0001',  // optional
      fieldname: 'image',    // optional
      isPrivate: true,       // optional — stored in /private/files if true
    });
  };

  return (
    <div>
      <input type="file" onChange={handleChange} disabled={isLoading} />
      {isLoading && <p>Uploading...</p>}
      {error && <p>{error.message}</p>}
      {data && <p>Uploaded: {data.message.file_url}</p>}
    </div>
  );
}
```

#### `UploadFileOptions`

```typescript
interface UploadFileOptions {
  doctype?: string;    // Attach the file to this doctype
  docname?: string;    // Attach the file to this document
  fieldname?: string;  // The field on the document to attach to
  isPrivate?: boolean; // When true, file is stored in /private/files. Default false.
}
```

#### Response Shape

```typescript
// data.message after a successful upload
{
  name: "0bc595b342",
  file_name: "App.tsx",
  file_url: "/private/files/App.tsx",
  file_size: 811,
  is_private: 1,
  folder: "Home",
  content_hash: "1ec3659508e631575d2e6d5c4d1c41ef",
  doctype: "File",
}
```

> **Note:** When `isPrivate: true`, the `file_url` is under `/private/files/` and requires authentication to access. Public files are served directly from `/files/`.

---

## Complete Examples

### Full Authentication Flow

```tsx
import React, { useState } from 'react';
import {
  FrappeProvider,
  useAuth,
  useDocuments
} from '@rustedcompiler/frappe-hooks';

function Login() {
  const { login, isLoading, error } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(username, password);
  };

  return (
    <form onSubmit={handleLogin}>
      <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
      <button type="submit" disabled={isLoading}>{isLoading ? 'Logging in...' : 'Login'}</button>
      {error && <p style={{ color: 'red' }}>{error.message}</p>}
    </form>
  );
}

function Dashboard() {
  const { logout } = useAuth();
  const { data: customers } = useDocuments('Customer', {
    fields: ['name', 'customer_name'],
    limit_page_length: 10,
  });

  return (
    <div>
      <button onClick={logout}>Logout</button>
      <ul>
        {customers.map(customer => (
          <li key={customer.name}>{customer.customer_name}</li>
        ))}
      </ul>
    </div>
  );
}

export default function Root() {
  return (
    <FrappeProvider
      options={{ url: 'https://your-erpnext-site.com' }}
      enableDynamicAuth={true}
    >
      <App />
    </FrappeProvider>
  );
}
```

---

## Security Best Practices

### 1. Never Hardcode Credentials

```tsx
// ❌ Bad
const apiKey = 'hardcoded_key';

// ✅ Good - Use environment variables
const apiKey = process.env.REACT_APP_FRAPPE_API_KEY;

// ✅ Better - Get from user input at runtime
const { loginWithAPIToken } = useAuth();
loginWithAPIToken(userProvidedKey, userProvidedSecret);
```

### 2. Store Credentials Securely

```tsx
// ❌ Bad - localStorage is not secure for sensitive data
localStorage.setItem('apiSecret', secret);

// ✅ Good - The library manages credentials in memory only
```

### 3. Use HTTPS

```tsx
// ❌ Bad
<FrappeProvider options={{ url: 'http://unsecure-site.com' }} />

// ✅ Good
<FrappeProvider options={{ url: 'https://secure-site.com' }} />
```

---

## API Reference

### `QueryOptions`

Options accepted by `useDocuments` and `useDocument`.

```typescript
interface QueryOptions {
  fields?: string[];
  filters?: Filter[];
  limit_start?: number;
  limit_page_length?: number;
  order_by?: string;
  expand?: string[];
  as_dict?: boolean;
  debug?: boolean;
  is_or?: boolean;
}
```

| Option | Type | Description |
|--------|------|-------------|
| `fields` | `string[]` | Fields to return. Defaults to all fields. |
| `filters` | `Filter[]` | Array of Frappe-style filters (see below). |
| `limit_start` | `number` | Offset for pagination. Default `0`. |
| `limit_page_length` | `number` | Number of records to return per page. |
| `order_by` | `string` | Sort order, e.g. `"creation desc"`. |
| `expand` | `string[]` | Link fields to expand inline. The field must also be included in `fields`, otherwise it returns `null`. |
| `as_dict` | `boolean` | When `false`, returns data as `List[List]` instead of `List[dict]`. Default `true`. |
| `debug` | `boolean` | When `true`, returns the executed SQL query and execution time under `exc` in the response. Keep `false` in production. |
| `is_or` | `boolean` | When `true`, combines multiple filters with `OR` instead of the default `AND`. |

#### Filter Format

```typescript
type Filter = [string, string, string, string | number | boolean];
//             doctype  field   operator  value
```

Supported operators: `=`, `!=`, `like`, `not like`, `>`, `<`, `>=`, `<=`, `in`, `not in`.

---

### `MutationOptions`

Options accepted by `useCreateDocument`, `useUpdateDocument`, and `useDeleteDocument`.

```typescript
interface MutationOptions<TData> {
  onSuccess?: (data: TData) => void;
  onError?: (error: Error) => void;
  invalidate?: string[] | string | RegExp;
}
```

| Option | Type | Description |
|--------|------|-------------|
| `onSuccess` | `(data: TData) => void` | Called with the response data on success. |
| `onError` | `(error: Error) => void` | Called with the error on failure. |
| `invalidate` | `string[] \| string \| RegExp` | Cache keys to invalidate after mutation. Accepts exact keys, an array of keys, or a regex pattern. |

---

### `useAuth()`

```typescript
{
  login: (username: string, password: string) => Promise<any>
  loginWithAPIToken: (apiKey: string, apiSecret: string) => Promise<{ success: true }>
  dynamicLogin: (credentials: LoginCredentials) => Promise<any>
  logout: () => Promise<{ success: true }>
  getCurrentUser: () => Promise<any>
  isLoading: boolean
  error: Error | null
  isAuthenticated: boolean
}
```

```typescript
interface LoginCredentials {
  username?: string;
  password?: string;
  apiKey?: string;
  apiSecret?: string;
}
```

---

## Troubleshooting

**Q: Credentials not updating?**
Ensure `enableDynamicAuth={true}` is set on `FrappeProvider`.

**Q: Cache showing old data after login?**
Cache is automatically cleared when credentials change.

**Q: Data is stale or not updating?**
Reduce `cacheTTL` on `FrappeProvider` or set it to `0` to disable caching entirely. Cache is keyed by doctype + query options, so changing any query parameter will always produce a fresh fetch regardless of TTL.

**Q: How to persist login across page refreshes?**
The library manages credentials in memory only. Implement your own session restore:

```tsx
const { loginWithAPIToken } = useAuth();

const storedToken = localStorage.getItem('frappe_token');
if (storedToken) {
  const [apiKey, apiSecret] = storedToken.split(':');
  loginWithAPIToken(apiKey, apiSecret);
}
```

**Q: expand returning null?**
Make sure the field is included in both `fields` and `expand`.

```tsx
// ❌ Bad — abc not in fields
const { data } = useDocuments('Parent', {
  expand: ['abc'],
});

// ✅ Good
const { data } = useDocuments('Parent', {
  fields: ['name', 'abc'],
  expand: ['abc'],
});
```

**Q: Cookies not being saved after login?**
Your HTTP client must be configured with `credentials: 'include'` (fetch) or `withCredentials: true` (axios) for cross-origin requests. Also ensure your Frappe `site_config.json` sets `allow_cors` to your exact frontend origin — a wildcard `*` will not work with credentialed requests.