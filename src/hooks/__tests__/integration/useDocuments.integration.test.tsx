/// <reference types="node" />
// src/hooks/__tests__/integration/useDocuments.integration.test.tsx
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import React from 'react';
import { FrappeProvider } from '../../../context/FrappeContext';
import { useDocuments } from '../../useDocuments';
/* eslint-disable no-undef */
const FRAPPE_URL = process.env.FRAPPE_URL ?? '';
const FRAPPE_TOKEN = process.env.FRAPPE_TOKEN;
/* eslint-enable no-undef */

const describeIf = FRAPPE_URL && FRAPPE_TOKEN ? describe : describe.skip;

describeIf('useDocuments — integration', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <FrappeProvider options={{ url: FRAPPE_URL, token: FRAPPE_TOKEN }}>{children}</FrappeProvider>
  );

  it('should fetch documents from Frappe', async () => {
    const { result } = renderHook(() => useDocuments('User'), { wrapper });

    await waitFor(
      () => {
        expect(result.current.isLoading).toBe(false);
      },
      { timeout: 10000 }
    );

    expect(result.current.error).toBeNull();
    expect(Array.isArray(result.current.data)).toBe(true);
  });
});
