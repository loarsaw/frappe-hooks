// src/vite-env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FRAPPE_URL: string;
  readonly VITE_FRAPPE_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
