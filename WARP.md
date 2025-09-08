# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

NetworkX is a React-based social networking application with mentorship features. It's built with TypeScript, Vite, and Supabase, designed as a professional networking platform.

**Tech Stack:**
- Frontend: React 19, TypeScript, Vite
- Backend: Supabase (PostgreSQL + Auth + Realtime)
- State Management: React Query/TanStack Query
- Styling: Custom CSS (page-specific) + Styled Components
- UI: React Icons, P5.js, Vanta.js for animations

## Development Commands

### Core Development
```bash
npm install              # Install dependencies
npm run dev             # Start development server (Vite)
npm run build           # Build for production (TypeScript compile + Vite build)
npm run preview         # Preview production build
npm run lint            # Run ESLint with TypeScript rules
```

### Database Operations
```bash
npm run gen:types       # Generate Supabase TypeScript types from schema
```

### Supabase Local Development
```bash
supabase start          # Start local Supabase instance
supabase stop           # Stop local instance
supabase db reset       # Reset local database
```

## Architecture Overview

### Authentication Flow
The app uses a conditional rendering pattern based on Supabase auth:
1. `App.tsx` - QueryClient provider + auth check via `useAuthQuery`
2. Unauthenticated users → `Login.tsx` (Supabase auth)
3. Authenticated users → `NetworkX.tsx` with onboarding check

### State Management Architecture
- **React Query** (`@tanstack/react-query`) for server state
- **Custom hooks** in `src/hooks/` for business logic
- **Query patterns** in `src/hooks/queries/` for data fetching
- **Service layer** in `src/services/` for Supabase operations

### Component Architecture
- **Page-based routing** via state (`currentPage` in `NetworkX.tsx`)
- **Layout components**: `TopBar`, `LeftSideBar`, `NavBar`
- **Page components**: `Home`, `Profile`, `Search`, `Messages`, `Feed`
- **Feature components**: `OnboardingForm`, post types in `components/posts/`

### Database Architecture
Core Supabase tables:
- `Users` - Profile data with mentorship preferences (`role`, `is_mentor`, `is_seeking_mentor`)
- `Follows` - User following relationships (many-to-many)
- `Messages` - Direct messaging between users
- `Education` - User education history (one-to-many)
- `WorkExperience` - User work experience (one-to-many)

### Data Flow Pattern
```
Component → Custom Hook → React Query → Service Layer → Supabase Client
```

Example: `useProfile()` → `useProfileQuery()` → `userService.getProfile()` → `supabase.from('Users')`

### Styling Architecture
**Current**: Page-specific CSS approach with dedicated files:
- `src/css/networkx.css` - Main layout and navigation
- `src/css/home.css`, `src/css/profile.css`, etc. - Page-specific styles
- `src/index.css` - Global utilities and base styles
- Styled Components for component-specific styling

**Note**: Future migration to Tailwind CSS is planned.

### Key Configuration Files
- `vite.config.ts` - Build config with path aliases (`@/` → `src/`)
- `eslint.config.js` - TypeScript + React rules
- `supabase/config.toml` - Local development database config
- `tsconfig.json` - TypeScript project references setup

## Development Guidelines

### Code Organization
- **Absolute imports** using `@/` alias for `src/` directory
- **Feature-based** component organization in `src/components/`
- **Page-specific** CSS files for modular styling
- **Service layer** abstraction for all API operations

### React Query Patterns
- Query options defined as constants (e.g., `authQueryOptions`)
- Auth state synchronized with Supabase auth changes via `onAuthStateChange`
- Optimistic updates and error handling in mutations
- Stale time configured appropriately per data type

### TypeScript Integration
- **Generated types** from Supabase schema via `npm run gen:types`
- **Database types** in `src/types/supabase.types.ts`
- **Strict TypeScript** configuration with app and node-specific configs
- **Type-safe** service layer with proper return types

### Error Handling Pattern
- Service layer handles Supabase errors
- React Query error boundaries for UI error states
- Loading states managed through React Query `isLoading` flags
- User feedback via error messages in UI components

### Performance Considerations
- React Query caching with appropriate `staleTime` and `gcTime`
- Auth queries cached indefinitely (`staleTime: Infinity`)
- Component optimization via proper dependency arrays
- Bundle optimization through Vite build configuration

## Testing Approach
Run individual components/pages in development mode to test features. The app uses:
- ESLint for code quality and consistency
- TypeScript for compile-time error checking
- React Query DevTools for debugging data fetching

## Important Notes
- **Supabase keys** are exposed in client code (public anon key only)
- **Real-time features** configured via Supabase realtime subscriptions
- **Onboarding flow** required for new authenticated users
- **Mobile-responsive** design with mobile-first CSS approach
