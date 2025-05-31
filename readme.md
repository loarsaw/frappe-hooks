# @rustedcompiler/frappe-hooks

A lightweight react.js wrapper for the [Frappe](https://docs.frappe.io/framework/user/en/api/rest) REST API. 

## Features

- ✅ Easy login using username and password API key/secret
- ✅ Easy login using API key/secret
- ✅ Convenient methods for all standard REST operations
- ❌ File upload/download support

## Installation

```bash
npm install @rustedcompiler/frappe-hooks
```

```jsx
import { FrappeClient } from '@rustedcompiler/frappe-hooks'

// only put the server url
export const frappeInstance = new FrappeClient({ baseURL: "https://abc.com" })

// only put the server url
export const frappeInstance = new FrappeClient({ baseURL: "https://abc.com" , token:"api_key:api_secret"})


```
## Example Usage
```jsx

// get all documents within a docType
await frappeInstance.getAllDocuments(docType);

// get single document
await frappeInstance.getDocument(docType, documentId);

//updating document
await frappeInstance.updateDocument(docType, documentId, {
  under_maintenance: 1,
});

//delete document
await frappeInstance.deleteDocument(docType, documentId);
```

## Getting Current User
```jsx

useEffect(()=>{
  getCurrentUser()
} , [])

async function getCurrentUser(){
  const user = await frappeInstance.getCurrentUser();
  return user
}


```