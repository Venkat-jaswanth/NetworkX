import { vi } from 'vitest';

// Mock Supabase client
export const createMockSupabaseClient = () => {
  const mockFrom = vi.fn();
  const mockSelect = vi.fn();
  const mockInsert = vi.fn();
  const mockUpdate = vi.fn();
  const mockDelete = vi.fn();
  const mockEq = vi.fn();
  const mockIn = vi.fn();
  const mockOr = vi.fn();
  const mockOrder = vi.fn();
  const mockLimit = vi.fn();
  const mockSingle = vi.fn();
  const mockMaybeSingle = vi.fn();

  // Chain methods
  mockFrom.mockReturnValue({
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate,
    delete: mockDelete,
  });

  mockSelect.mockReturnValue({
    eq: mockEq,
    in: mockIn,
    or: mockOr,
    order: mockOrder,
    limit: mockLimit,
    single: mockSingle,
    maybeSingle: mockMaybeSingle,
  });

  mockInsert.mockReturnValue({
    select: mockSelect,
  });

  mockUpdate.mockReturnValue({
    eq: mockEq,
  });

  mockDelete.mockReturnValue({
    eq: mockEq,
  });

  mockEq.mockReturnValue({
    eq: mockEq,
    single: mockSingle,
    maybeSingle: mockMaybeSingle,
    order: mockOrder,
  });

  mockIn.mockReturnValue({
    in: mockIn,
    eq: mockEq,
  });

  mockOr.mockReturnValue({
    order: mockOrder,
  });

  mockOrder.mockReturnValue({
    limit: mockLimit,
    then: (resolve: any) => resolve({ data: [], error: null }),
  });

  mockLimit.mockReturnValue({
    then: (resolve: any) => resolve({ data: [], error: null }),
  });

  // Storage mock
  const mockUpload = vi.fn();
  const mockRemove = vi.fn();
  const mockGetPublicUrl = vi.fn();

  const mockStorage = {
    from: vi.fn().mockReturnValue({
      upload: mockUpload,
      remove: mockRemove,
      getPublicUrl: mockGetPublicUrl,
    }),
  };

  // Auth mock
  const mockAuth = {
    signInWithOAuth: vi.fn(),
    signOut: vi.fn(),
    getUser: vi.fn(),
  };

  return {
    from: mockFrom,
    storage: mockStorage,
    auth: mockAuth,
    // Expose individual mocks for assertions
    mocks: {
      from: mockFrom,
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
      eq: mockEq,
      in: mockIn,
      or: mockOr,
      order: mockOrder,
      limit: mockLimit,
      single: mockSingle,
      maybeSingle: mockMaybeSingle,
      upload: mockUpload,
      remove: mockRemove,
      getPublicUrl: mockGetPublicUrl,
      auth: mockAuth,
    },
  };
};

// Mock authenticated user
export const mockAuthUser = {
  id: 'test-user-id-123',
  email: 'test@example.com',
  user_metadata: {},
  app_metadata: {},
  aud: 'authenticated',
  created_at: '2024-01-01T00:00:00Z',
};
