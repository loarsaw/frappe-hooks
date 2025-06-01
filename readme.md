
# @rustedcompiler/frappe-hooks

A lightweight React.js wrapper for the [Frappe](https://docs.frappe.io/framework/user/en/api/rest) REST API.

## Features

- ✅ Easy login using username and password or API key/secret  
- ✅ Convenient methods for all standard REST operations  
- ❌ File upload/download support (coming soon)

## Installation

```bash
npm install @rustedcompiler/frappe-hooks
```

## Initialization

Wrap your application with the `FrappeProvider` to initialize the client globally:

```jsx
import { FrappeProvider } from '@rustedcompiler/frappe-hooks';

function App({ children }) {
  return (
    <FrappeProvider options={{ baseURL: 'https://asa.aksla.com'   
    // if using token 
    token: "api_key:api_secret"  }}>
      <body>{children}</body>
    </FrappeProvider>
  );
}
```

## Manual Instance (Optional)



## Example Usage

```jsx
import {useDocuments , useDocument } from "@rustedcompiler/frappe-hooks"
// Get all documents of a specific DocType
const { data } = useDocuments({
    docType: docType,
    // if you'd wait for some operations to get completed before call it 
    enabled: true,
  });
// pagination 
 const { data } = useDocuments({
    docType: docType,
    pagination: {
      fieldsArray: ['email', 'full_name'],
      limit_page_length: 40,
      limit_start: 10,
    },
    enabled: true,
  });

// Get a single document
  const { data } = useDocument(
    docType,
    documentId
  );


// Update a document
const { updateDocument } = useDocument(
   docType,
    documentId
  );

 await updateDocument(docType, documentId, {
  // data
  score: 0,
})


// Delete a document
const {  deleteDocument } = useDocument(
   docType,
   documentId
  );

 await deleteDocument(docType , documentId)
```

## Getting the Current User

```jsx
import { useEffect } from 'react';
import { useAuth } from '@rustedcompiler/frappe-hooks';

function MyComponent() {
 const { loginWithPassword , currentUser } = useAuth();

}
```
