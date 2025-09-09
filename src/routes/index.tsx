import { createBrowserRouter, Navigate, useLocation } from 'react-router-dom';
import { useAuthQuery } from '@/hooks/queries/useAuthQuery';
import Loader from '@/components/Loader';
import Login from '@/Login';
import NetworkX from '@/NetworkX';
import OnboardingForm from '@/components/OnboardingForm';
import Profile from '@/pages/Profile';
import Search from '@/pages/Search';
import Messages from '@/pages/Messages';
import Feed from '@/main-layout/Feed';
import InterviewPosts from '@/main-layout/interviewposts';
import Resources from '@/main-layout/Resources';
import Opportunities from '@/main-layout/Opportunities';
import Roadmap from '@/main-layout/Roadmap';
import FindMentor from '@/main-layout/FindMentor';
import { useOnboarding } from '@/hooks/useOnboarding';

import type { Page } from '@/NetworkX';

// Route path mappings
export const ROUTE_PATHS = {
  feed: '/',
  profile: '/profile',
  search: '/search',
  messages: '/messages',
  interviews: '/interviews',
  resources: '/resources',
  opportunities: '/opportunities',
  roadmaps: '/roadmaps',
  'find-mentor': '/find-mentor',
} as const;

// Helper to convert Page type to route path
export const getRoutePath = (page: Page): string => {
  return ROUTE_PATHS[page];
};

// Helper to convert route path to Page type
export const getPageFromPath = (path: string): Page => {
  const entry = Object.entries(ROUTE_PATHS).find(([_, routePath]) => routePath === path);
  return entry ? (entry[0] as Page) : 'feed';
};

// Protected route wrapper component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useAuthQuery();
  const { hasCompletedOnboarding } = useOnboarding();
  const location = useLocation();

  if (isLoading) return <Loader />;
  
  if (!user) {
    return <Login />;
  }

  // If onboarding not complete, force to /onboarding except when already there
  if (!hasCompletedOnboarding && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}

// Root redirect component that handles the default route
function RootRedirect() {
  return <Navigate to="/" replace />;
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/onboarding',
    element: (
      <ProtectedRoute>
        <OnboardingForm onComplete={() => { window.location.replace('/'); }} />
      </ProtectedRoute>
    ),
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <NetworkX />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Feed />,
      },
      {
        path: 'profile',
        element: <Profile />,
      },
      {
        path: 'search',
        element: <Search />,
      },
      {
        path: 'messages',
        element: <Messages />,
      },
      {
        path: 'interviews',
        element: <InterviewPosts />,
      },
      {
        path: 'resources',
        element: <Resources />,
      },
      {
        path: 'opportunities',
        element: <Opportunities />,
      },
      {
        path: 'roadmaps',
        element: <Roadmap />,
      },
      {
        path: 'find-mentor',
        element: <FindMentor />,
      },
    ],
  },
  {
    path: '*',
    element: <RootRedirect />,
  },
]);
