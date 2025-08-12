-- Migration to update user schema to match the target schema
-- This migration alters db_user table and adds WorkExperience and Education tables

-- First, let's update the user_role enum to match the target schema
ALTER TYPE "public"."user_role" RENAME TO "user_role_old";

CREATE TYPE "public"."user_role" AS ENUM (
    'Student',
    'Professional'
);

-- Truncate the db_user table
TRUNCATE TABLE "public"."db_user" CASCADE;

-- Alter the existing db_user table to add new columns
ALTER TABLE "public"."db_user" 
ADD COLUMN "profile_picture_url" TEXT,
ADD COLUMN "bio" TEXT NOT NULL,
ADD COLUMN "skills" JSONB NOT NULL,
ADD COLUMN "is_mentor" BOOLEAN DEFAULT FALSE,
ADD COLUMN "is_seeking_mentor" BOOLEAN DEFAULT FALSE,
ADD CONSTRAINT "db_user_mentor_constraint" CHECK ("is_mentor" = FALSE OR "is_seeking_mentor" = FALSE);

-- Update the role column to use the new enum
ALTER TABLE "public"."db_user" 
ALTER COLUMN "role" TYPE "public"."user_role" 
USING CASE 
    WHEN "role" = 'student' THEN 'Student'::"public"."user_role"
    WHEN "role" = 'professional' THEN 'Professional'::"public"."user_role"
    ELSE 'Student'::"public"."user_role"
END;

-- Create WorkExperience table with UUID user_id
CREATE TABLE "public"."WorkExperience" (
    "id" SERIAL PRIMARY KEY,
    "user_id" UUID NOT NULL REFERENCES "public"."db_user"("id") ON DELETE CASCADE,
    "company_name" VARCHAR(255) NOT NULL,
    "job_title" VARCHAR(255) NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE
);

-- Create Education table with UUID user_id
CREATE TABLE "public"."Education" (
    "id" SERIAL PRIMARY KEY,
    "user_id" UUID NOT NULL REFERENCES "public"."db_user"("id") ON DELETE CASCADE,
    "institution_name" VARCHAR(255) NOT NULL,
    "degree" VARCHAR(255) NOT NULL,
    "field_of_study" VARCHAR(255) NOT NULL,
    "graduation_year" INTEGER NOT NULL
);

-- Drop the old enum
DROP TYPE "public"."user_role_old";

-- Add indexes for performance
CREATE INDEX idx_workexperience_user_id ON "public"."WorkExperience"("user_id");
CREATE INDEX idx_education_user_id ON "public"."Education"("user_id");

-- Enable RLS on new tables
ALTER TABLE "public"."WorkExperience" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Education" ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for WorkExperience table
CREATE POLICY "Users can manage their own work experience" ON "public"."WorkExperience" 
FOR ALL USING ("user_id" = "auth"."uid"());

-- Create RLS policies for Education table
CREATE POLICY "Users can manage their own education" ON "public"."Education" 
FOR ALL USING ("user_id" = "auth"."uid"());

 