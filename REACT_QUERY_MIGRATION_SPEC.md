# React Query Migration Strategy for NetworkX

## Overview

This document outlines the migration strategy for implementing React Query (TanStack Query) in the NetworkX application to achieve data persistence across component rebuilds with minimal complexity.

## Current State Analysis

### Existing Hooks
1. **`useAuth`** - Authentication state management
2. **`useProfile`** - User profile data with complex state management
3. **`useMessages`** - Real-time messaging with Supabase subscriptions
4. **`useFollowStatus`** - Follow/unfollow status per user
5. **`useOnboarding`** - Onboarding completion status
6. **`useIntersectionObserver`** - UI utility hook (no data fetching)

### Current Issues
- **Data refetched on every mount** - No persistence across component rebuilds
- **Loading states everywhere** - Each hook manages its own loading state
- **Complex state management** - Multiple useState calls for simple data
- **No background updates** - Users see stale data until manual refresh

## Migration Benefits

### User Experience
- ✅ **Instant data display** - Cached data shown immediately on navigation
- ✅ **Reduced loading screens** - Data persists across component rebuilds
- ✅ **Background updates** - Fresh data loaded in background when needed

### Developer Experience
- ✅ **Data persistence** - Data persists across component rebuilds
- ✅ **Less boilerplate** - No manual cache management
- ✅ **Built-in loading/error states** - Consistent across app
- ✅ **Type safety** - Better TypeScript integration

## Migration Plan

### Phase 1: Setup & Infrastructure (Week 1)

#### 1.1 Install Dependencies
```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```

#### 1.2 Configure Query Client
```typescript
// src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 3,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});
```

#### 1.3 Setup Provider
```typescript
// src/App.tsx
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/lib/queryClient';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Your app components */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### Phase 2: Core Data Hooks (Week 2)

#### 2.1 Authentication Hook with React Query
```typescript
// src/hooks/queries/useAuth.ts
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const useAuth = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      // Set auth state directly when auth state changes
      queryClient.setQueryData(['auth', 'user'], session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [queryClient]);

  return useQuery({
    queryKey: ['auth', 'user'],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data.user;
    },
    staleTime: Infinity, // Auth state doesn't go stale
    gcTime: Infinity, // Never garbage collect auth
  });
};
```

#### 2.2 Updated App.tsx
```typescript
// src/App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '@/hooks/queries/useAuth';
import Loader from '@/components/Loader';
import Login from '@/Login';
import NetworkX from '@/NetworkX';

const queryClient = new QueryClient();

function AppContent() {
  const { data: user, isLoading } = useAuth();

  if (isLoading) return <Loader />;
  return user ? <NetworkX /> : <Login />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;
```

#### 2.3 User Profile Hook
```typescript
// src/hooks/queries/useProfile.ts
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { getFollowerCount, getFollowingCount } from '@/services/followsService';
import { getAppUser } from '@/services/userService';
import type { AppUser } from '@/types/app.types';

export const useProfile = () => {
  const queryClient = useQueryClient();
  const { data: authUser } = useAuth();

  const profileQuery = useQuery({
    queryKey: ['profile', 'current'],
    queryFn: async () => {
      const [appUser, followerCount, followingCount] = await Promise.all([
        getAppUser(),
        getFollowerCount(authUser.id),
        getFollowingCount(authUser.id),
      ]);
      return { 
        user: appUser, 
        followerCount, 
        followingCount 
      };
    },
    enabled: !!authUser,
  });

  // Function to refresh profile data
  const refreshProfile = () => {
    queryClient.invalidateQueries({ queryKey: ['profile', 'current'] });
  };

  return {
    ...profileQuery,
    refreshProfile,
  };
};
```

**Note**: The current `useProfile` hook manages complex state for forms, modals, and CRUD operations. For React Query migration, we'll keep the data fetching in React Query but maintain the existing state management pattern for UI interactions.

#### 2.4 Follow Status Hook
```typescript
// src/hooks/queries/useFollowStatus.ts
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { isFollowing, followUser, unfollowUser } from '@/services/followsService';

export const useFollowStatus = (userId: string) => {
  const queryClient = useQueryClient();

  const followQuery = useQuery({
    queryKey: ['follow', userId],
    queryFn: () => isFollowing(userId),
    enabled: !!userId,
  });

  // Functions for actions
  const follow = async () => {
    await followUser(userId);
    queryClient.invalidateQueries({ queryKey: ['follow', userId] });
  };

  const unfollow = async () => {
    await unfollowUser(userId);
    queryClient.invalidateQueries({ queryKey: ['follow', userId] });
  };

  return {
    following: followQuery.data ?? false,
    isLoading: followQuery.isLoading,
    follow,
    unfollow,
  };
};
```

### Phase 3: Messages & Real-time Data (Week 3)

#### 3.1 Conversations Query Hook
```typescript
// src/hooks/queries/useConversationsQuery.ts
import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthQuery } from './useAuth';
import { getUnreadMessageCount, getConversationsWithDetails, subscribeToMessages } from '@/services/messagesService';

export const useConversationsQuery = () => {
  const queryClient = useQueryClient();
  const { data: user } = useAuthQuery();

  // Real-time subscription for conversations
  useEffect(() => {
    if (!user?.id) return;

    const unsubscribe = subscribeToMessages(user.id, {
      onNewMessage: () => {
        // Update conversations list when any new message arrives
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
      },
      
      onMessageUpdate: () => {
        // Update conversations list when any message is updated
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
      },
      
      onMessageDelete: () => {
        // Update conversations list when any message is deleted
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
      },
    });

    return unsubscribe;
  }, [user?.id, queryClient]);

  return useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const [conversations, totalUnreadCount] = await Promise.all([
        getConversationsWithDetails(user!),
        getUnreadMessageCount(user!),
      ]);
      return { conversations, totalUnreadCount };
    },
    enabled: !!user,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};
```

#### 3.2 Messages Query Hook
```typescript
// src/hooks/queries/useMessagesQuery.ts
import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthQuery } from './useAuth';
import { getConversation, subscribeToMessages } from '@/services/messagesService';

export const useMessagesQuery = (conversationId: string | null) => {
  const queryClient = useQueryClient();
  const { data: user } = useAuthQuery();

  // Real-time subscription for specific conversation messages
  useEffect(() => {
    if (!user?.id || !conversationId) return;

    const unsubscribe = subscribeToMessages(user.id, {
      onNewMessage: (newMessage) => {
        // Update messages if this conversation is affected
        const messageConversationId = newMessage.sender_id === user.id ? newMessage.receiver_id : newMessage.sender_id;
        if (conversationId === messageConversationId) {
          queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
        }
      },
      
      onMessageUpdate: (updatedMessage) => {
        // Update messages if this conversation is affected
        const messageConversationId = updatedMessage.sender_id === user.id ? updatedMessage.receiver_id : updatedMessage.sender_id;
        if (conversationId === messageConversationId) {
          queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
        }
      },
      
      onMessageDelete: (messageId) => {
        // Update messages if this conversation is affected
        queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      },
    });

    return unsubscribe;
  }, [user?.id, conversationId, queryClient]);

  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      return await getConversation(user!, conversationId!);
    },
    enabled: !!user && !!conversationId,
  });
};
```

#### 3.3 Messages Hook with React Query
```typescript
// src/hooks/useMessages.ts
import { useEffect, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthQuery } from './queries/useAuth';
import { useConversationsQuery } from './queries/useConversationsQuery';
import { useMessagesQuery } from './queries/useMessagesQuery';
import { sendMessage as sendMessageService, markConversationAsRead } from '@/services/messagesService';

export const useMessages = () => {
  const queryClient = useQueryClient();
  const { data: user } = useAuthQuery();
  
  // React Query for data fetching
  const conversationsQuery = useConversationsQuery();
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const messagesQuery = useMessagesQuery(activeConversation);

  // Extract data from queries
  const conversations = conversationsQuery.data?.conversations ?? [];
  const messages = messagesQuery.data ?? [];
  const unreadCount = conversationsQuery.data?.totalUnreadCount ?? 0;
  const loading = conversationsQuery.isLoading;

  // Function to refresh conversations
  const loadConversations = () => {
    queryClient.invalidateQueries({ queryKey: ['conversations'] });
  };

  // Function to refresh specific conversation
  const loadConversation = (userId: string) => {
    setActiveConversation(userId);
    queryClient.invalidateQueries({ queryKey: ['messages', userId] });
  };

  // Send message
  const sendMessage = useCallback(async (receiverId: string, body: string) => {
    if (!user?.id || !body.trim()) return;
    
    try {
      await sendMessageService(user, receiverId, body);
      
      // Invalidate both conversations and messages
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['messages', receiverId] });
      
      // Mark conversation as read
      await markConversationAsRead(user, receiverId);
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }, [user?.id, queryClient]);

  // Load conversations on mount
  useEffect(() => {
    if (user?.id) {
      loadConversations();
    }
  }, [user?.id]);

  return {
    conversations,
    messages,
    activeConversation,
    unreadCount,
    loading,
    sendMessage,
    loadConversation,
    loadConversations,
    setActiveConversation
  };
};
```

### Phase 4: Search & User Discovery (Week 4)

#### 4.1 Search Hook
```typescript
// src/hooks/queries/useSearch.ts
import { useQuery } from '@tanstack/react-query';
import { searchUsers, getSearchSuggestions } from '@/services/userService';

export const useSearch = (query: string) => {
  const searchQuery = useQuery({
    queryKey: ['search', query],
    queryFn: () => searchUsers(query),
    enabled: query.length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const suggestionsQuery = useQuery({
    queryKey: ['search-suggestions', query],
    queryFn: () => getSearchSuggestions(query),
    enabled: query.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    results: searchQuery.data ?? [],
    suggestions: suggestionsQuery.data ?? [],
    isLoading: searchQuery.isLoading,
    isSuggestionsLoading: suggestionsQuery.isLoading,
  };
};
```

### Phase 5: Optimizations (Week 5)

#### 5.1 Prefetching (Optional)
```typescript
// src/hooks/queries/usePrefetch.ts
import { useQueryClient } from '@tanstack/react-query';

export const usePrefetch = () => {
  const queryClient = useQueryClient();

  const prefetchProfile = (userId: string) => {
    queryClient.prefetchQuery({
      queryKey: ['profile', userId],
      queryFn: () => getAppUser(userId),
    });
  };

  return { prefetchProfile };
};
```

## Migration Strategy

### Step-by-Step Implementation

#### Week 1: Foundation
1. **Install React Query**
2. **Setup Query Client**
3. **Configure Provider**
4. **Create basic query hooks**

#### Week 2: Core Data
1. **Migrate `useAuth`**
2. **Migrate `useProfile`**
3. **Migrate `useFollowStatus`**
4. **Update components to use new hooks**

#### Week 3: Real-time Data
1. **Migrate `useMessages`**
2. **Integrate with Supabase subscriptions**
3. **Test real-time functionality**

#### Week 4: Search & Discovery
1. **Migrate search functionality**
2. **Implement suggestions**

#### Week 5: Polish
1. **Add basic prefetching (optional)**
2. **Performance testing**

### Component Migration Order

1. **App.tsx** - Add QueryClientProvider
2. **NetworkX.tsx** - Update to use new auth hook
3. **Profile.tsx** - Migrate to useProfile hook
4. **Search.tsx** - Migrate to useSearch hook
5. **Messages.tsx** - Migrate to useMessages hook
6. **Home.tsx** - Update to use new hooks

## Error Handling

### Basic Error Handling
```typescript
export const useProfile = (userId?: string) => {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: getAppUser,
    retry: 3, // Simple retry 3 times
    onError: (error) => {
      console.error('Profile fetch failed:', error);
    },
  });
};
```

## Performance Benefits

### 1. Automatic Caching
- Data persists across component rebuilds
- No manual cache management needed

### 2. Background Refetching
- Keep data fresh automatically
- Reduce manual refresh needs

### 3. Prefetching (Optional)
- Preload data for likely user actions
- Reduce perceived loading time

## Testing

### Unit Tests
```typescript
// src/hooks/queries/__tests__/useProfile.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useProfile } from '../useProfile';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

test('useProfile returns user data', async () => {
  const { result } = renderHook(() => useProfile('user-id'), {
    wrapper: createWrapper(),
  });

  await waitFor(() => {
    expect(result.current.isLoading).toBe(false);
  });

  expect(result.current.user).toBeDefined();
});
```

## Monitoring

### React Query DevTools
- Monitor query states
- Inspect cache
- Debug performance issues

## Rollback Plan

### If Issues Arise
1. **Keep old hooks as backup**
2. **Gradual migration** - component by component
3. **Feature flags** - toggle between old and new
4. **Monitoring** - track performance and errors

### Rollback Steps
1. Remove QueryClientProvider
2. Restore old hooks
3. Update components to use old hooks
4. Remove React Query dependencies

## Success Metrics

### User Experience
- **Reduced loading screens** - Target: 50% reduction
- **Faster navigation** - Target: 30% improvement
- **Data persistence** - Target: 100% across component rebuilds

### Performance
- **Reduced API calls** - Target: 40% reduction
- **Faster data display** - Target: 60% improvement

### Developer Experience
- **Reduced boilerplate** - Target: 50% reduction
- **Simpler state management** - Target: 70% improvement

## Conclusion

This migration will provide data persistence across component rebuilds with minimal complexity. The approach focuses on:

1. **Automatic caching** - Data persists across navigation
2. **Reduced boilerplate** - No manual state management
3. **Better UX** - Instant data display with background updates
4. **Gradual migration** - Component-by-component approach

React Query will provide data persistence benefits adapted for React's component lifecycle. 