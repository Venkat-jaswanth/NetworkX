-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.Education (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  institution_name character varying NOT NULL,
  degree character varying NOT NULL,
  field_of_study character varying NOT NULL,
  graduation_year integer NOT NULL,
  CONSTRAINT Education_pkey PRIMARY KEY (id),
  CONSTRAINT Education_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.Users(id)
);
CREATE TABLE public.Follows (
  follower_id uuid NOT NULL,
  following_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT Follows_pkey PRIMARY KEY (follower_id, following_id),
  CONSTRAINT Follows_follower_id_fkey FOREIGN KEY (follower_id) REFERENCES public.Users(id),
  CONSTRAINT Follows_following_id_fkey FOREIGN KEY (following_id) REFERENCES public.Users(id)
);
CREATE TABLE public.Messages (
  id integer NOT NULL DEFAULT nextval('"Messages_id_seq"'::regclass),
  sender_id uuid NOT NULL,
  receiver_id uuid NOT NULL,
  body text NOT NULL,
  read_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT Messages_pkey PRIMARY KEY (id),
  CONSTRAINT Messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.Users(id),
  CONSTRAINT Messages_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES public.Users(id)
);
CREATE TABLE public.Users (
  id uuid NOT NULL,
  full_name text NOT NULL,
  role USER-DEFINED NOT NULL,
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  profile_picture_url text,
  bio text NOT NULL,
  skills jsonb NOT NULL,
  is_mentor boolean DEFAULT false,
  is_seeking_mentor boolean DEFAULT false,
  CONSTRAINT Users_pkey PRIMARY KEY (id),
  CONSTRAINT db_user_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.WorkExperience (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  company_name character varying NOT NULL,
  job_title character varying NOT NULL,
  start_date date NOT NULL,
  end_date date,
  CONSTRAINT WorkExperience_pkey PRIMARY KEY (id),
  CONSTRAINT WorkExperience_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.Users(id)
);

 
