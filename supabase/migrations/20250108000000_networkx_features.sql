-- NetworkX Platform Features Migration
-- Creates tables for Feed, Interview Experiences, Resources, Opportunities, Roadmaps, and Mentor System

-- =============================================
-- FEED SYSTEM
-- =============================================

-- Posts in the feed
CREATE TABLE IF NOT EXISTS "FeedPosts" (
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

-- Post likes (many-to-many junction table)
CREATE TABLE IF NOT EXISTS "FeedLikes" (
  user_id uuid REFERENCES "Users"(id) ON DELETE CASCADE,
  post_id uuid REFERENCES "FeedPosts"(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, post_id)
);

-- Post comments
CREATE TABLE IF NOT EXISTS "FeedComments" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES "Users"(id) ON DELETE CASCADE,
  post_id uuid REFERENCES "FeedPosts"(id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================
-- INTERVIEW EXPERIENCES
-- =============================================

CREATE TABLE IF NOT EXISTS "InterviewPosts" (
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

-- =============================================
-- RESOURCES LIBRARY
-- =============================================

CREATE TABLE IF NOT EXISTS "Resources" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL,
  url text NOT NULL,
  description text,
  tags text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Track when users last viewed resources (for "new since last visit" badges)
CREATE TABLE IF NOT EXISTS "ResourceViews" (
  user_id uuid REFERENCES "Users"(id) ON DELETE CASCADE,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id)
);

-- =============================================
-- JOB OPPORTUNITIES
-- =============================================

CREATE TABLE IF NOT EXISTS "Opportunities" (
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
CREATE TABLE IF NOT EXISTS "OpportunityViews" (
  user_id uuid REFERENCES "Users"(id) ON DELETE CASCADE,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id)
);

-- =============================================
-- LEARNING ROADMAPS
-- =============================================

CREATE TABLE IF NOT EXISTS "Roadmaps" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "RoadmapSteps" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  roadmap_id uuid REFERENCES "Roadmaps"(id) ON DELETE CASCADE,
  step_index integer NOT NULL,
  title text NOT NULL,
  description text,
  resource_ids uuid[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (roadmap_id, step_index)
);

-- =============================================
-- MENTOR SYSTEM
-- =============================================

CREATE TABLE IF NOT EXISTS "MentorProfiles" (
  user_id uuid PRIMARY KEY REFERENCES "Users"(id) ON DELETE CASCADE,
  headline text,
  expertise text[] DEFAULT '{}',
  availability text DEFAULT 'open' CHECK (availability IN ('open','limited','closed')),
  hourly_rate numeric,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "MentorRequests" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid REFERENCES "Users"(id) ON DELETE CASCADE,
  mentor_id uuid REFERENCES "Users"(id) ON DELETE CASCADE,
  message text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================
-- NOTIFICATIONS (SHARED)
-- =============================================

CREATE TABLE IF NOT EXISTS "Notifications" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES "Users"(id) ON DELETE CASCADE,
  type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}',
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================
-- INDICES FOR PERFORMANCE
-- =============================================

-- Feed indices
CREATE INDEX IF NOT EXISTS idx_feedposts_author_created ON "FeedPosts"(author_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedposts_created ON "FeedPosts"(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedposts_visibility ON "FeedPosts"(visibility);
CREATE INDEX IF NOT EXISTS idx_feedlikes_post ON "FeedLikes"(post_id);
CREATE INDEX IF NOT EXISTS idx_feedcomments_post_created ON "FeedComments"(post_id, created_at DESC);

-- Interview posts indices
CREATE INDEX IF NOT EXISTS idx_interviewposts_company ON "InterviewPosts"(company);
CREATE INDEX IF NOT EXISTS idx_interviewposts_created ON "InterviewPosts"(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_interviewposts_author ON "InterviewPosts"(author_id);

-- Resources indices
CREATE INDEX IF NOT EXISTS idx_resources_category ON "Resources"(category);
CREATE INDEX IF NOT EXISTS idx_resources_created ON "Resources"(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_resources_tags ON "Resources" USING GIN(tags);

-- Opportunities indices
CREATE INDEX IF NOT EXISTS idx_opportunities_type ON "Opportunities"(type);
CREATE INDEX IF NOT EXISTS idx_opportunities_created ON "Opportunities"(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_opportunities_company ON "Opportunities"(company_name);
CREATE INDEX IF NOT EXISTS idx_opportunities_tags ON "Opportunities" USING GIN(tags);

-- Roadmap indices
CREATE INDEX IF NOT EXISTS idx_roadmapsteps_roadmap_index ON "RoadmapSteps"(roadmap_id, step_index);

-- Mentor indices
CREATE INDEX IF NOT EXISTS idx_mentorprofiles_availability ON "MentorProfiles"(availability);
CREATE INDEX IF NOT EXISTS idx_mentorprofiles_expertise ON "MentorProfiles" USING GIN(expertise);
CREATE INDEX IF NOT EXISTS idx_mentorrequests_mentor_status ON "MentorRequests"(mentor_id, status);
CREATE INDEX IF NOT EXISTS idx_mentorrequests_requester ON "MentorRequests"(requester_id);

-- Notifications indices
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON "Notifications"(user_id, read_at);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON "Notifications"(created_at DESC);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE "FeedPosts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FeedLikes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FeedComments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "InterviewPosts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Resources" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ResourceViews" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Opportunities" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OpportunityViews" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Roadmaps" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RoadmapSteps" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MentorProfiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MentorRequests" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Notifications" ENABLE ROW LEVEL SECURITY;

-- Feed Posts: Public posts visible to all, followers-only posts visible to followers
CREATE POLICY "Public feed posts are viewable by everyone" ON "FeedPosts"
  FOR SELECT USING (visibility = 'public');

CREATE POLICY "Followers feed posts viewable by followers" ON "FeedPosts"
  FOR SELECT USING (
    visibility = 'followers' AND (
      author_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM "Follows" 
        WHERE follower_id = auth.uid() AND following_id = author_id
      )
    )
  );

CREATE POLICY "Users can create their own posts" ON "FeedPosts"
  FOR INSERT WITH CHECK (author_id = auth.uid());

CREATE POLICY "Users can update their own posts" ON "FeedPosts"
  FOR UPDATE USING (author_id = auth.uid());

CREATE POLICY "Users can delete their own posts" ON "FeedPosts"
  FOR DELETE USING (author_id = auth.uid());

-- Feed Likes: Users can like/unlike posts they can see
CREATE POLICY "Users can manage their own likes" ON "FeedLikes"
  FOR ALL USING (user_id = auth.uid());

-- Feed Comments: Users can comment on posts they can see
CREATE POLICY "Users can view comments on visible posts" ON "FeedComments"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "FeedPosts" 
      WHERE id = post_id AND (
        visibility = 'public' OR
        author_id = auth.uid() OR
        (visibility = 'followers' AND EXISTS (
          SELECT 1 FROM "Follows" 
          WHERE follower_id = auth.uid() AND following_id = author_id
        ))
      )
    )
  );

CREATE POLICY "Users can create comments" ON "FeedComments"
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own comments" ON "FeedComments"
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own comments" ON "FeedComments"
  FOR DELETE USING (user_id = auth.uid());

-- Interview Posts: All authenticated users can view, only authors can modify
CREATE POLICY "Interview posts are viewable by authenticated users" ON "InterviewPosts"
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create interview posts" ON "InterviewPosts"
  FOR INSERT WITH CHECK (author_id = auth.uid());

CREATE POLICY "Users can update their own interview posts" ON "InterviewPosts"
  FOR UPDATE USING (author_id = auth.uid());

CREATE POLICY "Users can delete their own interview posts" ON "InterviewPosts"
  FOR DELETE USING (author_id = auth.uid());

-- Resources: All authenticated users can view
CREATE POLICY "Resources are viewable by authenticated users" ON "Resources"
  FOR SELECT USING (auth.role() = 'authenticated');

-- Resource Views: Users can manage their own view tracking
CREATE POLICY "Users can manage their own resource views" ON "ResourceViews"
  FOR ALL USING (user_id = auth.uid());

-- Opportunities: All authenticated users can view
CREATE POLICY "Opportunities are viewable by authenticated users" ON "Opportunities"
  FOR SELECT USING (auth.role() = 'authenticated');

-- Opportunity Views: Users can manage their own view tracking
CREATE POLICY "Users can manage their own opportunity views" ON "OpportunityViews"
  FOR ALL USING (user_id = auth.uid());

-- Roadmaps: All authenticated users can view
CREATE POLICY "Roadmaps are viewable by authenticated users" ON "Roadmaps"
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Roadmap steps are viewable by authenticated users" ON "RoadmapSteps"
  FOR SELECT USING (auth.role() = 'authenticated');

-- Mentor Profiles: All authenticated users can view
CREATE POLICY "Mentor profiles are viewable by authenticated users" ON "MentorProfiles"
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can manage their own mentor profile" ON "MentorProfiles"
  FOR ALL USING (user_id = auth.uid());

-- Mentor Requests: Users can view their own requests (sent or received)
CREATE POLICY "Users can view their mentor requests" ON "MentorRequests"
  FOR SELECT USING (requester_id = auth.uid() OR mentor_id = auth.uid());

CREATE POLICY "Users can create mentor requests" ON "MentorRequests"
  FOR INSERT WITH CHECK (requester_id = auth.uid());

CREATE POLICY "Mentors can update requests sent to them" ON "MentorRequests"
  FOR UPDATE USING (mentor_id = auth.uid());

-- Notifications: Users can only see their own notifications
CREATE POLICY "Users can view their own notifications" ON "Notifications"
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON "Notifications"
  FOR UPDATE USING (user_id = auth.uid());
