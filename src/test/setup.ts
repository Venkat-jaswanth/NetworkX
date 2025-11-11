import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Extend expect matchers
expect.extend({});

// Stub browser-specific globals used in services
// happy-dom does not implement alert by default
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).alert = (globalThis as any).alert || vi.fn();
