# @rustedcompiler/frappe-hooks

A lightweight React.js wrapper for the [Frappe REST API](https://docs.frappe.io/framework/user/en/api/rest), enabling easy integration with Frappe backend in your React applications.

## ✅ Features

- Easy login with username/password or API key/secret  
- Hooks for standard REST operations (GET, POST, PUT, DELETE)  
- File upload/download support *(coming soon)*

---

## 📦 Installation

```bash
npm install @rustedcompiler/frappe-hooks


## Initialization

Wrap your application with the `FrappeProvider` to initialize the client globally:

```jsx
import { FrappeProvider } from '@rustedcompiler/frappe-hooks';

function App({ children }) {
  return (
    <FrappeProvider
      options={{
        baseURL: 'https://asa.aksla.com',
        // Optional if using token authentication
        token: 'api_key:api_secret',
      }}
    >
      <body>{children}</body>
    </FrappeProvider>
  );
}

```


## Example Usage

```jsx
import {useDocuments , useDocument } from "@rustedcompiler/frappe-hooks"
// Get all documents of a specific DocType
import { useDocuments } from '@rustedcompiler/frappe-hooks';

const { data } = useDocuments({
  docType: 'User',
  enabled: true,
});

// query 
const { data } = useDocuments({
  docType: 'User',
  query: {
    fieldsArray: ['email', 'full_name'],
    limit_page_length: 40,
    limit_start: 10,
  },
  enabled: true,
});

// Get a single document
import { useDocument } from '@rustedcompiler/frappe-hooks';

const { data } = useDocument('User', 'USER-ID');


// Update a document
const { updateDocument } = useDocument('User', 'USER-ID');

await updateDocument('User', 'USER-ID', {
  score: 0,
});


// Delete a document
const { deleteDocument } = useDocument('User', 'USER-ID');

await deleteDocument('User', 'USER-ID');

```

## Getting the Current User

```jsx
import { useEffect } from 'react';
import { useAuth } from '@rustedcompiler/frappe-hooks';

function MyComponent() {
  const { loginWithPassword, currentUser } = useAuth();

  useEffect(() => {
    console.log(currentUser);
  }, [currentUser]);
}

```
