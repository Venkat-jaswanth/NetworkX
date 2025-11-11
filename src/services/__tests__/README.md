# Service Tests

This directory contains unit tests for the NetworkX service modules.

## Test Coverage

### ✅ storageService.test.ts
Tests for file storage operations including:
- **validateImageFile()** - File type and size validation
- **uploadProfilePicture()** - Profile picture uploads
- **uploadImage()** - Generic image uploads to different buckets
- **deleteImage()** - Image deletion
- **deleteProfilePicture()** - Profile picture deletion
- **storeGoogleProfilePicture()** - Google OAuth profile picture storage

**Total Tests:** ~25 test cases

### ✅ followsService.test.ts
Tests for user follow/unfollow operations including:
- **followUser()** - Following a user
- **unfollowUser()** - Unfollowing a user
- **isFollowing()** - Check follow status with error handling
- **getMutualFollowers()** - Complex query for mutual follows
- **getFollowing()** - Get list of users being followed
- **getFollowers()** - Get list of followers
- **getFollowerCount()** - Count aggregation
- **getFollowingCount()** - Count aggregation

**Total Tests:** ~30 test cases

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (default)
npm test

# Run tests once (CI mode)
npm test -- --run

# Run tests with UI
npm test:ui

# Run tests with coverage
npm test:coverage

# Run specific test file
npm test storageService

# Run specific test suite
npm test -- -t "validateImageFile"
```

## Test Structure

### Mocking Strategy
- **Supabase Client**: Mocked using `createMockSupabaseClient()` from `@/test/mocks/supabase.mock.ts`
- **Auth Service**: Mocked to return a test user by default
- **File Operations**: Uses browser File API with mocked properties

### Test Organization
Each service test file follows this structure:
1. **Setup**: Import service functions and mocks
2. **Describe blocks**: Group tests by function
3. **Test cases**: Cover success, error, and edge cases
4. **Assertions**: Verify function behavior and mock calls

## Key Testing Patterns

### 1. Mocking Supabase Queries
```typescript
mockSupabase.mocks.select.mockReturnValue({
  eq: vi.fn().mockReturnValue({
    single: vi.fn().mockResolvedValue({ data: mockData, error: null }),
  }),
});
```

### 2. Testing Error Handling
```typescript
const error = new Error('Database error');
mockSupabase.mocks.insert.mockResolvedValue({ data: null, error });
await expect(followUser('user-id')).rejects.toThrow('Database error');
```

### 3. Testing Authentication Requirements
```typescript
mockGetAuthUser.mockResolvedValue(null);
await expect(uploadImage(file)).rejects.toThrow('Not authenticated');
```

## Coverage Goals

- **Line Coverage**: > 80%
- **Branch Coverage**: > 75%
- **Function Coverage**: > 90%

## Adding New Tests

When adding tests for a new service:

1. Create `__tests__/[serviceName].test.ts`
2. Import necessary mocks from `@/test/mocks/`
3. Mock external dependencies (Supabase, auth, etc.)
4. Write tests covering:
   - ✅ Success cases
   - ✅ Error cases
   - ✅ Edge cases
   - ✅ Authentication requirements
   - ✅ Input validation

## Troubleshooting

### Common Issues

**Issue**: `Cannot find module '@/lib/supabase'`
- **Solution**: Ensure path aliases are configured in `vitest.config.ts`

**Issue**: Tests fail with "supabase is not a function"
- **Solution**: Check that mocks are properly set up in `beforeEach`

**Issue**: Type errors with mock data
- **Solution**: Verify mock data matches the actual type definitions in `@/types/`

## Next Steps

Consider adding tests for:
- `userService.ts` - User CRUD operations
- `feedService.ts` - Feed posts and interactions
- `authService.ts` - Authentication flows
- `messagesService.ts` - Messaging functionality
