# NetworkX Platform Implementation Specification

Status: Implementation Ready
Owners: Development Team
Stakeholders: Users, Product Team
Last Updated: 2025-01-08

## TL;DR
Complete implementation of NetworkX professional networking platform with 6 core features: Feed, Interview Experiences, Resources, Opportunities, Roadmaps, and Find a Mentor. Built on React + TypeScript + Vite with Supabase backend and React Query for state management.

## Background / Context
NetworkX is a professional networking platform currently with basic user management, messaging, search, and profile features. The sidebar contains 6 placeholder pages that need full implementation to create a comprehensive career development platform.

**Current State:**
- ✅ Authentication & User Management (Supabase Auth)
- ✅ User Profiles with Education/Work Experience
- ✅ Real-time Messaging System
- ✅ User Search & Follow System
- ✅ React Query Migration (in progress)
- ❌ Feed System (placeholder)
- ❌ Interview Experiences (placeholder)
- ❌ Resources Library (placeholder)
- ❌ Job Opportunities (placeholder)
- ❌ Learning Roadmaps (placeholder)
- ❌ Mentor Matching (placeholder)

## Goals
1. **Complete Platform Implementation** - Transform all 6 placeholder pages into fully functional features
2. **Consistent User Experience** - Maintain design patterns and interaction flows across all features
3. **Real-time Capabilities** - Implement live updates where appropriate (feed, notifications)
4. **Scalable Architecture** - Use established patterns (React Query, service layer, component structure)
5. **Professional Networking Focus** - Enable career development, knowledge sharing, and mentorship

## Non-Goals
- External job board integrations (Phase 2)
- Advanced analytics/reporting
- Mobile app development
- Video/audio calling features
- Payment processing for premium features

## Users & Personas
**Primary Users:**
- **Job Seekers** - Recent graduates and career changers seeking opportunities and guidance
- **Professionals** - Experienced workers sharing knowledge and seeking career advancement
- **Mentors** - Senior professionals offering guidance and expertise

**Secondary Users:**
- **Recruiters** - Companies posting opportunities and finding talent
- **Content Creators** - Users sharing resources and educational content

## User Stories
- As a **job seeker**, I want to see relevant posts in my feed so that I stay updated on industry trends
- As a **professional**, I want to share my interview experiences so that others can learn from them
- As a **learner**, I want to access curated resources so that I can develop new skills
- As a **job seeker**, I want to browse opportunities so that I can find relevant positions
- As a **career changer**, I want to follow learning roadmaps so that I can systematically develop skills
- As a **mentee**, I want to find and connect with mentors so that I can get career guidance
- As a **mentor**, I want to manage mentorship requests so that I can help others effectively

## Requirements
### Functional Requirements
- **FR-1** Feed system with posts, likes, comments, and following-based content
- **FR-2** Interview experience sharing with company, role, difficulty, and outcome tracking
- **FR-3** Resource library with categorization, tagging, and "new since last visit" indicators
- **FR-4** Job opportunities board with filtering and application tracking
- **FR-5** Learning roadmaps with step-by-step progression tracking
- **FR-6** Mentor discovery and request management system
- **FR-7** Real-time notifications for interactions and updates
- **FR-8** Badge system for unread counts and new content indicators

### Non-Functional Requirements
- **Performance:** Page load times < 2s, API responses < 500ms
- **Reliability:** 99.9% uptime, graceful error handling
- **Security:** Row-level security, input validation, XSS protection
- **Accessibility:** WCAG 2.1 AA compliance, keyboard navigation
- **Responsive:** Mobile-first design, works on all screen sizes

## Scope
**In Scope:**
- Complete implementation of all 6 sidebar features
- Database schema design and migration
- Service layer implementation
- React Query integration
- Real-time subscriptions
- Badge/notification system
- Responsive UI components

**Out of Scope:**
- External API integrations
- Advanced search/filtering
- File upload beyond profile pictures
- Email notifications
- Admin dashboard

## Assumptions
- React Query migration is completed for existing features
- Supabase database and auth are properly configured
- Current design system and CSS patterns will be maintained
- Users have completed onboarding before accessing new features
- Real-time features use Supabase subscriptions

## High-Level Architecture

### System Overview
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React Client  │────│  Supabase API    │────│   PostgreSQL    │
│   (TypeScript)  │    │  (Auth + DB)     │    │   Database      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │
         │              ┌──────────────────┐
         └──────────────│ React Query      │
                        │ (State Mgmt)     │
                        └──────────────────┘
```

### Components Architecture
- **Pages:** `/src/main-layout/` - Feature-specific page components
- **Services:** `/src/services/` - Data access layer with Supabase client
- **Hooks:** `/src/hooks/queries/` - React Query hooks for data fetching
- **Components:** `/src/components/` - Reusable UI components
- **Types:** `/src/types/` - TypeScript definitions

### Data Flow
1. **User Interaction** → Component triggers hook
2. **React Query Hook** → Calls service function
3. **Service Function** → Makes Supabase API call
4. **Database Response** → Returns through service to hook
5. **Hook Updates** → Component re-renders with new data
6. **Real-time Updates** → Supabase subscriptions update React Query cache

## Data Model

### New Tables Schema

#### Feed System
```sql
-- Posts in the feed
CREATE TABLE "FeedPosts" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid REFERENCES "Users"(id) ON DELETE SET NULL,
  title text,
  body text NOT NULL,
  media_url text,
  tags text[] DEFAULT '{}',
  like_count integer NOT NULL DEFAULT 0,
  comment_count integer NOT NULL DEFAULT 0,
  visibility text NOT NULL DEFAULT 'public' CHECK (visibility IN ('public','followers')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Post likes (many-to-many)
CREATE TABLE "FeedLikes" (
  user_id uuid REFERENCES "Users"(id) ON DELETE CASCADE,
  post_id uuid REFERENCES "FeedPosts"(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, post_id)
);

-- Post comments
CREATE TABLE "FeedComments" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES "Users"(id) ON DELETE CASCADE,
  post_id uuid REFERENCES "FeedPosts"(id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

#### Interview Experiences
```sql
CREATE TABLE "InterviewPosts" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid REFERENCES "Users"(id) ON DELETE SET NULL,
  company text NOT NULL,
  role text NOT NULL,
  difficulty text CHECK (difficulty IN ('easy','medium','hard')),
  outcome text CHECK (outcome IN ('selected','rejected','pending','n/a')),
  body text NOT NULL,
  tags text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
```

#### Resources Library
```sql
CREATE TABLE "Resources" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL,
  url text NOT NULL,
  description text,
  tags text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Track when users last viewed resources
CREATE TABLE "ResourceViews" (
  user_id uuid REFERENCES "Users"(id) ON DELETE CASCADE,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id)
);
```

#### Job Opportunities
```sql
CREATE TABLE "Opportunities" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  company_name text NOT NULL,
  location text,
  url text,
  type text CHECK (type IN ('internship','full-time','contract','part-time')) DEFAULT 'full-time',
  seniority text,
  tags text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Track when users last viewed opportunities
CREATE TABLE "OpportunityViews" (
  user_id uuid REFERENCES "Users"(id) ON DELETE CASCADE,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id)
);
```

#### Learning Roadmaps
```sql
CREATE TABLE "Roadmaps" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE "RoadmapSteps" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  roadmap_id uuid REFERENCES "Roadmaps"(id) ON DELETE CASCADE,
  step_index integer NOT NULL,
  title text NOT NULL,
  description text,
  resource_ids uuid[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (roadmap_id, step_index)
);
```

#### Mentor System
```sql
CREATE TABLE "MentorProfiles" (
  user_id uuid PRIMARY KEY REFERENCES "Users"(id) ON DELETE CASCADE,
  headline text,
  expertise text[] DEFAULT '{}',
  availability text DEFAULT 'open' CHECK (availability IN ('open','limited','closed')),
  hourly_rate numeric,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE "MentorRequests" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid REFERENCES "Users"(id) ON DELETE CASCADE,
  mentor_id uuid REFERENCES "Users"(id) ON DELETE CASCADE,
  message text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected')),
  created_at timestamptz NOT NULL DEFAULT now()
);
```

#### Notifications (Shared)
```sql
CREATE TABLE "Notifications" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES "Users"(id) ON DELETE CASCADE,
  type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}',
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

### Relationships
- **Users** 1→N **FeedPosts**, **InterviewPosts**, **MentorRequests**
- **Users** N→N **FeedLikes** (junction table)
- **Users** 1→N **FeedComments**, **Notifications**
- **FeedPosts** 1→N **FeedLikes**, **FeedComments**
- **Roadmaps** 1→N **RoadmapSteps**
- **Users** 1→1 **MentorProfiles** (optional)

## Service Layer Contracts

### Feed Service (`feedService.ts`)
```typescript
// Get feed posts with pagination
getFeed(params: { scope: 'public' | 'following', cursor?: string }): Promise<FeedPost[]>

// Create new post
createFeedPost(payload: { title?: string, body: string, tags?: string[] }): Promise<FeedPost>

// Toggle like on post
toggleLike(postId: string): Promise<void>

// Add comment to post
addComment(postId: string, body: string): Promise<FeedComment>

// Get comments for post
getComments(postId: string): Promise<FeedComment[]>
```

### Interview Service (`interviewService.ts`)
```typescript
// List interview posts with filters
listInterviewPosts(params: { company?: string, difficulty?: string }): Promise<InterviewPost[]>

// Create interview post
createInterviewPost(payload: InterviewPostInput): Promise<InterviewPost>

// Get single interview post
getInterviewPost(id: string): Promise<InterviewPost>
```

### Resources Service (`resourcesService.ts`)
```typescript
// List resources with filters
listResources(params: { category?: string, tags?: string[] }): Promise<Resource[]>

// Mark resources as seen (updates last_seen_at)
markResourcesSeen(): Promise<void>

// Get new resources count since last visit
getNewResourcesCount(): Promise<number>
```

### Opportunities Service (`opportunitiesService.ts`)
```typescript
// List opportunities with filters
listOpportunities(params: { type?: string, location?: string }): Promise<Opportunity[]>

// Mark opportunities as seen
markOpportunitiesSeen(): Promise<void>

// Get new opportunities count
getNewOpportunitiesCount(): Promise<number>
```

### Roadmaps Service (`roadmapsService.ts`)
```typescript
// List all roadmaps
listRoadmaps(): Promise<Roadmap[]>

// Get roadmap with steps
getRoadmapWithSteps(roadmapId: string): Promise<{ roadmap: Roadmap, steps: RoadmapStep[] }>

// Admin functions
createRoadmap(payload: RoadmapInput): Promise<Roadmap>
addRoadmapStep(roadmapId: string, step: RoadmapStepInput): Promise<RoadmapStep>
```

### Mentor Service (`mentorService.ts`)
```typescript
// Search mentors with filters
searchMentors(params: { expertise?: string[], availability?: string }): Promise<MentorProfile[]>

// Create/update mentor profile
upsertMentorProfile(payload: MentorProfileInput): Promise<void>

// Send mentor request
createMentorRequest(mentorId: string, message: string): Promise<MentorRequest>

// List incoming requests (for mentors)
listIncomingRequests(): Promise<MentorRequest[]>

// Respond to mentor request
respondMentorRequest(requestId: string, status: 'accepted' | 'rejected'): Promise<void>

// Get pending requests count
getPendingRequestsCount(): Promise<number>
```

## React Query Hooks & Keys

### Query Key Patterns
Following established patterns with user.id inclusion:
```typescript
// Feed
['feed', 'public' | 'following', cursor?]
['feed', 'post', postId]
['feed', 'comments', postId]

// Interviews
['interviews', filters...]
['interview', interviewId]

// Resources
['resources', filters...]
['resources', 'count', user.id]

// Opportunities
['opportunities', filters...]
['opportunities', 'count', user.id]

// Roadmaps
['roadmaps']
['roadmap', roadmapId]

// Mentors
['mentors', 'search', filters...]
['mentors', 'requests', 'incoming', user.id]
['mentors', 'requests', 'count', user.id]
```

### Hook Examples
```typescript
// Feed hooks
export const useFeedQuery = (scope: 'public' | 'following') => {
  return useQuery({
    queryKey: ['feed', scope],
    queryFn: () => getFeed({ scope }),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Resources with badge count
export const useResourcesQuery = (filters: ResourceFilters) => {
  return useQuery({
    queryKey: ['resources', filters],
    queryFn: () => listResources(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useNewResourcesCount = () => {
  const { data: user } = useAuthQuery();
  return useQuery({
    queryKey: ['resources', 'count', user?.id],
    queryFn: getNewResourcesCount,
    enabled: !!user,
    staleTime: 30 * 1000, // 30 seconds
  });
};
```

## Implementation Plan

### Phase 0: Foundation Setup (2-3 days)
**Goal:** Prepare database schema and basic service infrastructure

**Tasks:**
1. **Database Migration**
   - Create all new tables with proper indices
   - Add foreign key constraints
   - Set up Row Level Security (RLS) policies
   - Generate TypeScript types: `npm run gen:types`

2. **Service Layer Scaffolding**
   - Create service files: `feedService.ts`, `interviewService.ts`, `resourcesService.ts`, `opportunitiesService.ts`, `roadmapsService.ts`, `mentorService.ts`
   - Implement basic CRUD operations
   - Add error handling patterns

3. **Type Definitions**
   - Update `app.types.ts` with new entity types
   - Create input/output type definitions
   - Add filter and pagination types

**Deliverables:**
- ✅ Database schema migrated
- ✅ Service layer structure created
- ✅ TypeScript types generated
- ✅ Basic error handling implemented

### Phase 1: Read-Only Features (1-1.5 weeks)
**Goal:** Implement list views and basic data display for all features

**Tasks:**
1. **Resources Page**
   - List resources with category filtering
   - Implement "new since last visit" badges
   - Add search and tag filtering
   - Create resource card component

2. **Opportunities Page**
   - List job opportunities with filters (type, location, seniority)
   - Implement "new since last visit" badges
   - Add opportunity card component
   - Basic responsive design

3. **Roadmaps Page**
   - List all available roadmaps
   - Roadmap detail view with steps
   - Progress tracking (read-only)
   - Step-by-step navigation

4. **Interview Experiences Page**
   - List interview posts with filters (company, difficulty, outcome)
   - Interview post detail view
   - Company and role filtering
   - Responsive card layout

5. **Feed Page (Read-Only)**
   - Display posts from followed users and public posts
   - Post card component with author info
   - Basic pagination or infinite scroll
   - Like and comment counts display

**React Query Integration:**
- Create query hooks for each feature
- Implement proper caching strategies
- Add loading and error states
- Set up query key patterns

**Deliverables:**
- ✅ All 5 pages display data correctly
- ✅ Filtering and search functionality
- ✅ Responsive design implemented
- ✅ Loading and error states
- ✅ "New content" badges working

### Phase 2: Interactive Features (1-1.5 weeks)
**Goal:** Add creation, editing, and interaction capabilities

**Tasks:**
1. **Feed Interactions**
   - Create new post modal/form
   - Like/unlike functionality
   - Comment system
   - Real-time updates via Supabase subscriptions

2. **Interview Post Creation**
   - Create interview experience form
   - Company and role autocomplete
   - Difficulty and outcome selection
   - Rich text editor for experience details

3. **Content Management (Admin/Editor)**
   - Resources: Create/edit/delete (role-gated)
   - Opportunities: Create/edit/delete (role-gated)
   - Roadmaps: Create/edit roadmaps and steps (admin only)

4. **User Interactions**
   - Mark resources/opportunities as seen
   - Track user engagement
   - Update badge counts in real-time

**Real-time Features:**
- Feed post likes/comments
- New content notifications
- Badge count updates

**Deliverables:**
- ✅ Post creation and interaction
- ✅ Content management interfaces
- ✅ Real-time updates working
- ✅ Role-based access control

### Phase 3: Mentor System (1 week)
**Goal:** Complete mentor discovery and request management

**Tasks:**
1. **Mentor Profile Management**
   - Create/edit mentor profile
   - Set availability status
   - Define expertise areas
   - Optional hourly rate setting

2. **Mentor Discovery**
   - Search mentors by expertise
   - Filter by availability
   - Mentor profile detail view
   - Contact/request functionality

3. **Request Management**
   - Send mentorship requests
   - Mentor request inbox
   - Accept/reject requests
   - Request status tracking

4. **Find a Mentor Page**
   - Replace placeholder with full implementation
   - Search and filter interface
   - Request management dashboard
   - Mentor profile cards

**Deliverables:**
- ✅ Complete mentor system
- ✅ Request workflow implemented
- ✅ Search and filtering
- ✅ Dashboard for mentors and mentees

### Phase 4: Polish & Real-time (3-5 days)
**Goal:** Add final polish, optimize performance, and enhance real-time features

**Tasks:**
1. **Badge System Enhancement**
   - Unread counts in sidebar
   - "New since last visit" indicators
   - Real-time badge updates
   - Notification system integration

2. **Performance Optimization**
   - Query optimization and caching
   - Implement hover prefetch
   - Optimize bundle size
   - Add pagination where needed

3. **Real-time Enhancements**
   - Live feed updates
   - Real-time notifications
   - Online status indicators
   - Optimistic updates

4. **Accessibility & Responsive**
   - WCAG 2.1 AA compliance
   - Keyboard navigation
   - Screen reader support
   - Mobile optimization

5. **Error Handling & Edge Cases**
   - Comprehensive error boundaries
   - Offline state handling
   - Empty state improvements
   - Loading state optimization

**Deliverables:**
- ✅ Complete badge system
- ✅ Optimized performance
- ✅ Full accessibility compliance
- ✅ Comprehensive error handling

## Technical Specifications

### Component Architecture
```
src/
├── main-layout/           # Feature pages
│   ├── Feed.tsx          # Social feed
│   ├── InterviewPosts.tsx # Interview experiences
│   ├── Resources.tsx     # Resource library
│   ├── Opportunities.tsx # Job opportunities
│   ├── Roadmap.tsx       # Learning roadmaps
│   └── FindMentor.tsx    # Mentor system
├── components/           # Reusable components
│   ├── cards/           # Card components
│   ├── forms/           # Form components
│   ├── modals/          # Modal components
│   └── badges/          # Badge components
├── hooks/queries/        # React Query hooks
├── services/            # Data access layer
└── types/              # TypeScript definitions
```

### State Management Strategy
- **React Query** for server state and caching
- **Local useState** for UI state (modals, forms)
- **Supabase subscriptions** for real-time updates
- **Query invalidation** for data consistency

### Real-time Implementation
```typescript
// Example: Feed real-time updates
useEffect(() => {
  const channel = supabase
    .channel('feed-updates')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'FeedPosts'
    }, (payload) => {
      queryClient.setQueryData(['feed', 'public'], (old: FeedPost[] = []) =>
        [payload.new as FeedPost, ...old]
      );
    })
    .subscribe();

  return () => supabase.removeChannel(channel);
}, [queryClient]);
```

### Badge System Implementation
```typescript
// Badge hook for sidebar
export const useBadgeCounts = () => {
  const { data: user } = useAuthQuery();

  const resourcesCount = useQuery({
    queryKey: ['resources', 'count', user?.id],
    queryFn: getNewResourcesCount,
    enabled: !!user,
  });

  const opportunitiesCount = useQuery({
    queryKey: ['opportunities', 'count', user?.id],
    queryFn: getNewOpportunitiesCount,
    enabled: !!user,
  });

  return {
    resources: resourcesCount.data ?? 0,
    opportunities: opportunitiesCount.data ?? 0,
  };
};
```

## Security & Privacy
- **Row Level Security (RLS)** on all tables
- **Input validation** on all forms
- **XSS protection** via proper escaping
- **CSRF protection** via Supabase auth
- **Rate limiting** on API endpoints
- **Data classification:** Public (posts), Internal (user data), Sensitive (messages)

## Performance Targets
- **Page Load:** < 2 seconds initial load
- **API Response:** < 500ms average
- **Real-time Updates:** < 100ms latency
- **Bundle Size:** < 1MB gzipped
- **Lighthouse Score:** > 90 for all metrics

## Testing Strategy
- **Unit Tests:** Service functions and utility hooks
- **Integration Tests:** React Query hooks with mock data
- **E2E Tests:** Critical user flows (create post, send message, mentor request)
- **Accessibility Tests:** Automated a11y testing
- **Performance Tests:** Bundle analysis and load testing

## Rollout Plan
1. **Phase 0:** Database migration and service setup
2. **Phase 1:** Read-only features (low risk)
3. **Phase 2:** Interactive features (medium risk)
4. **Phase 3:** Mentor system (medium risk)
5. **Phase 4:** Polish and optimization (low risk)

**Rollback Strategy:**
- Keep existing placeholder components as backup
- Feature flags for new functionality
- Database migration rollback scripts
- Gradual rollout with monitoring

## Success Metrics
- **User Engagement:** 50% increase in daily active users
- **Feature Adoption:** 70% of users try new features within 2 weeks
- **Performance:** 30% improvement in page load times
- **User Satisfaction:** 4.5+ rating in user feedback
- **Technical:** 99.9% uptime, < 1% error rate

## Open Questions
1. Should we implement push notifications for real-time updates?
2. Do we need advanced search with Elasticsearch/Algolia?
3. Should mentor requests include video call scheduling?
4. Do we need content moderation for posts and comments?
5. Should we implement a reputation/rating system for mentors?

## Next Steps
1. **Immediate:** Begin Phase 0 database migration
2. **Week 1:** Complete service layer and start Phase 1
3. **Week 2-3:** Complete read-only features
4. **Week 4-5:** Implement interactive features
5. **Week 6:** Complete mentor system and polish
