# Dynamic Authentication - Usage Guide

This guide covers the dynamic authentication feature that allows users to provide credentials at runtime.

## Table of Contents

- [Overview](#overview)
- [Setup](#setup)
- [Usage Examples](#usage-examples)
- [Complete Examples](#complete-examples)
- [Security Best Practices](#security-best-practices)

## Overview

Dynamic authentication allows your application to:
- Start without credentials and let users login later
- Switch between different accounts at runtime
- Support both password and API token authentication
- Provide a login/logout flow similar to traditional apps

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
      enableDynamicAuth={true} // Enable dynamic authentication
    >
      <YourApp />
    </FrappeProvider>
  );
}
```

## Usage Examples

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

### 3. Flexible Login (Both Methods)

```tsx
import { useAuth } from '@rustedcompiler/frappe-hooks';
import { useState } from 'react';

function FlexibleLogin() {
  const { dynamicLogin, isLoading, error } = useAuth();
  const [authMethod, setAuthMethod] = useState<'password' | 'token'>('password');
  
  // Password fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Token fields
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
      console.log('Authentication successful!');
    } catch (err) {
      console.error('Authentication failed:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login to ERPNext</h2>
      
      {/* Auth method selector */}
      <div>
        <label>
          <input
            type="radio"
            value="password"
            checked={authMethod === 'password'}
            onChange={(e) => setAuthMethod(e.target.value as 'password')}
          />
          Username & Password
        </label>
        <label>
          <input
            type="radio"
            value="token"
            checked={authMethod === 'token'}
            onChange={(e) => setAuthMethod(e.target.value as 'token')}
          />
          API Token
        </label>
      </div>

      {/* Conditional fields based on auth method */}
      {authMethod === 'password' ? (
        <>
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
        </>
      ) : (
        <>
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

### 4. Logout

```tsx
import { useAuth } from '@rustedcompiler/frappe-hooks';

function LogoutButton() {
  const { logout, isLoading, isAuthenticated } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      console.log('Logged out successfully');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <button onClick={handleLogout} disabled={isLoading}>
      {isLoading ? 'Logging out...' : 'Logout'}
    </button>
  );
}
```

### 5. Protected Routes

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

// Usage
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

### 6. Using useAuthManager for Advanced Control

```tsx
import { useAuthManager } from '@rustedcompiler/frappe-hooks';

function AdvancedAuthControl() {
  const { loginWithPassword, loginWithToken, logout, isAuthenticated } = useAuthManager();

  const quickTokenLogin = () => {
    // Login with token without API verification
    loginWithToken('your_api_key', 'your_api_secret');
  };

  const switchAccount = async () => {
    // Logout and login with different credentials
    logout();
    setTimeout(() => {
      loginWithPassword('another_user', 'another_password');
    }, 100);
  };

  return (
    <div>
      <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
      <button onClick={quickTokenLogin}>Quick Token Login</button>
      <button onClick={switchAccount}>Switch Account</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## Complete Examples

### Full Authentication Flow

```tsx
import React, { useState } from 'react';
import { 
  FrappeProvider, 
  useAuth, 
  useDocuments 
} from '@rustedcompiler/frappe-hooks';

// Login Component
function Login() {
  const { dynamicLogin, isLoading, error } = useAuth();
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    apiKey: '',
    apiSecret: ''
  });
  const [useToken, setUseToken] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await dynamicLogin(
      useToken 
        ? { apiKey: credentials.apiKey, apiSecret: credentials.apiSecret }
        : { username: credentials.username, password: credentials.password }
    );
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin}>
        <h2>Login to ERPNext</h2>
        
        <label>
          <input
            type="checkbox"
            checked={useToken}
            onChange={(e) => setUseToken(e.target.checked)}
          />
          Use API Token
        </label>

        {useToken ? (
          <>
            <input
              type="text"
              placeholder="API Key"
              value={credentials.apiKey}
              onChange={(e) => setCredentials({ ...credentials, apiKey: e.target.value })}
            />
            <input
              type="password"
              placeholder="API Secret"
              value={credentials.apiSecret}
              onChange={(e) => setCredentials({ ...credentials, apiSecret: e.target.value })}
            />
          </>
        ) : (
          <>
            <input
              type="text"
              placeholder="Username"
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
            />
            <input
              type="password"
              placeholder="Password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
            />
          </>
        )}

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
        
        {error && <p className="error">{error.message}</p>}
      </form>
    </div>
  );
}

// Dashboard Component
function Dashboard() {
  const { logout, getCurrentUser } = useAuth();
  const { data: customers } = useDocuments('Customer', {
    fields: ['name', 'customer_name'],
    limit_page_length: 10
  });

  const [currentUser, setCurrentUser] = useState<any>(null);

  React.useEffect(() => {
    getCurrentUser().then(setCurrentUser).catch(console.error);
  }, []);

  return (
    <div className="dashboard">
      <header>
        <h1>Welcome, {currentUser?.message || 'User'}!</h1>
        <button onClick={logout}>Logout</button>
      </header>
      
      <main>
        <h2>Customers</h2>
        <ul>
          {customers?.map(customer => (
            <li key={customer.name}>{customer.customer_name}</li>
          ))}
        </ul>
      </main>
    </div>
  );
}

// Main App
function App() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="app">
      {isAuthenticated ? <Dashboard /> : <Login />}
    </div>
  );
}

// Root Component
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

### Multi-Tenant Application

```tsx
import { useState } from 'react';
import { FrappeProvider, useAuth, useAuthManager } from '@rustedcompiler/frappe-hooks';

function TenantSelector() {
  const { loginWithToken } = useAuthManager();
  const [selectedTenant, setSelectedTenant] = useState('');

  const tenants = [
    { name: 'Company A', url: 'https://company-a.erpnext.com', apiKey: 'key1', apiSecret: 'secret1' },
    { name: 'Company B', url: 'https://company-b.erpnext.com', apiKey: 'key2', apiSecret: 'secret2' },
  ];

  const switchTenant = (tenant: typeof tenants[0]) => {
    // Note: You'd need to also update the base URL
    // This example shows credential switching
    loginWithToken(tenant.apiKey, tenant.apiSecret);
    setSelectedTenant(tenant.name);
  };

  return (
    <div>
      <h3>Select Organization</h3>
      {tenants.map(tenant => (
        <button key={tenant.name} onClick={() => switchTenant(tenant)}>
          {tenant.name}
        </button>
      ))}
      {selectedTenant && <p>Connected to: {selectedTenant}</p>}
    </div>
  );
}
```

## Security Best Practices

### 1. Never Hardcode Credentials

```tsx
// ❌ Bad
const apiKey = 'hardcoded_key';
const apiSecret = 'hardcoded_secret';

// ✅ Good - Use environment variables
const apiKey = process.env.REACT_APP_FRAPPE_API_KEY;
const apiSecret = process.env.REACT_APP_FRAPPE_API_SECRET;

// ✅ Better - Get from user input at runtime
const { loginWithAPIToken } = useAuth();
loginWithAPIToken(userProvidedKey, userProvidedSecret);
```

### 2. Store Credentials Securely

```tsx
// ❌ Bad - localStorage is not secure for sensitive data
localStorage.setItem('apiSecret', secret);

// ✅ Good - Let the library handle it, or use secure session storage
// The library manages credentials in memory only
```

### 3. Clear Credentials on Logout

```tsx
const { logout } = useAuth();

// Credentials are automatically cleared when logout() is called
await logout();
```

### 4. Use HTTPS

```tsx
// ❌ Bad
<FrappeProvider options={{ url: 'http://unsecure-site.com' }} />

// ✅ Good
<FrappeProvider options={{ url: 'https://secure-site.com' }} />
```

### 5. Validate Credentials

```tsx
const { dynamicLogin, getCurrentUser } = useAuth();

const handleLogin = async (credentials) => {
  try {
    await dynamicLogin(credentials);
    
    // Verify by fetching user info
    const user = await getCurrentUser();
    console.log('Logged in as:', user);
  } catch (err) {
    console.error('Invalid credentials');
  }
};
```

## API Reference

### useAuth()

Returns:
```typescript
{
  login: (username: string, password: string) => Promise<any>
  loginWithAPIToken: (apiKey: string, apiSecret: string) => Promise<any>
  dynamicLogin: (credentials: LoginCredentials) => Promise<any>
  logout: () => Promise<any>
  getCurrentUser: () => Promise<any>
  isLoading: boolean
  error: Error | null
  isAuthenticated: boolean
}
```

### useAuthManager()

Returns:
```typescript
{
  loginWithPassword: (username: string, password: string) => void
  loginWithToken: (apiKey: string, apiSecret: string) => void
  logout: () => void
  isAuthenticated: boolean
}
```

## Migration from Static to Dynamic Auth

If you're currently using static authentication:

```tsx
// Before
<FrappeProvider
  options={{
    url: 'https://site.com',
    token: 'key:secret'
  }}
>
```

Enable dynamic auth while keeping initial credentials:

```tsx
// After
<FrappeProvider
  options={{
    url: 'https://site.com',
    token: 'key:secret' // Initial credentials (optional)
  }}
  enableDynamicAuth={true} // Users can now change credentials at runtime
>
```

## Troubleshooting

**Q: Credentials not updating?**
- Ensure `enableDynamicAuth={true}` is set on FrappeProvider

**Q: Cache showing old data after login?**
- Cache is automatically cleared when credentials change

**Q: How to persist login across page refreshes?**
- Implement your own session management using localStorage/sessionStorage
- Store credentials securely and restore them on app load

Example:
```tsx
const storedCreds = localStorage.getItem('creds');
if (storedCreds) {
  const { apiKey, apiSecret } = JSON.parse(storedCreds);
  loginWithAPIToken(apiKey, apiSecret);
}
```

---

This feature makes your library much more flexible and user-friendly! 🚀
