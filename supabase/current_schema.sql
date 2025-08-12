 CREATE TABLE public.db_user (
  id uuid NOT NULL,
  full_name text NOT NULL,
  role USER-DEFINED NOT NULL,
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT db_user_pkey PRIMARY KEY (id),
  CONSTRAINT db_user_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);