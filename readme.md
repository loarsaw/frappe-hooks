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
```

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


### Getting all Documents

```jsx
import {useDocuments , useDocument } from "@rustedcompiler/frappe-hooks"
// Get all documents of a specific DocType
import { useDocuments } from '@rustedcompiler/frappe-hooks';

const { data } = useDocuments({
  docType: docType,
  enabled: true,
});

```

### Paginating Data

```jsx

// query 
const { data } = useDocuments({
  docType: docType,
  query: {
    fieldsArray: ['email', 'full_name'],
    limit_page_length: 40,
    limit_start: 10,
  },
  enabled: true,
});

```

### Fetching a Single Document 
```jsx
// Get a single document
import { useDocument } from '@rustedcompiler/frappe-hooks';

const { data } = useDocument(docType, documentId);  

```

```jsx
// Update a document
const { updateDocument } = useDocument(docType, documentId);

await updateDocument(docType, documentId, {
  score: 0,
});
```

```jsx

// Delete a document
const { deleteDocument } = useDocument(docType, documentId);

await deleteDocument(docType, documentId);

```

## Getting the Current User

```jsx
import { useEffect } from 'react';
import { useAuth } from '@rustedcompiler/frappe-hooks';

function MyComponent() {
  const { loginWithPassword, currentUser , logout } = useAuth();

  useEffect(() => {
    console.log(currentUser);
  }, [currentUser]);
}

```
