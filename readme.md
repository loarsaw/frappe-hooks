# @rustedcompiler/frappe-hooks

A lightweight react.js wrapper for the [Frappe](https://docs.frappe.io/framework/user/en/api/rest) REST API. 

## Features

- ❌ Easy login using API key/secret or session-based authentication
- ✅ Convenient methods for all standard REST operations
- ❌ File upload/download support
- ❌ Works in both Node.js and modern frontend apps (with CORS support)

## Installation

```bash
npm install @rustedcompiler/frappe-hooks

```jsx
import { FrappeClient } from '@rustedcompiler/frappe-hooks'

export const frappeInstance = new FrappeClient({ baseURL: "https://abc.com/api/resource" })

```
