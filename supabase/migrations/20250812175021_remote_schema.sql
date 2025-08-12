create sequence "public"."Messages_id_seq";

drop policy "Users can insert their own profile" on "public"."db_user";

drop policy "Users can update their own profile" on "public"."db_user";

drop policy "Users can view their own data" on "public"."db_user";

revoke delete on table "public"."db_user" from "anon";

revoke insert on table "public"."db_user" from "anon";

revoke references on table "public"."db_user" from "anon";

revoke select on table "public"."db_user" from "anon";

revoke trigger on table "public"."db_user" from "anon";

revoke truncate on table "public"."db_user" from "anon";

revoke update on table "public"."db_user" from "anon";

revoke delete on table "public"."db_user" from "authenticated";

revoke insert on table "public"."db_user" from "authenticated";

revoke references on table "public"."db_user" from "authenticated";

revoke select on table "public"."db_user" from "authenticated";

revoke trigger on table "public"."db_user" from "authenticated";

revoke truncate on table "public"."db_user" from "authenticated";

revoke update on table "public"."db_user" from "authenticated";

revoke delete on table "public"."db_user" from "service_role";

revoke insert on table "public"."db_user" from "service_role";

revoke references on table "public"."db_user" from "service_role";

revoke select on table "public"."db_user" from "service_role";

revoke trigger on table "public"."db_user" from "service_role";

revoke truncate on table "public"."db_user" from "service_role";

revoke update on table "public"."db_user" from "service_role";

alter table "public"."db_user" drop constraint "db_user_id_fkey";

alter table "public"."db_user" drop constraint "db_user_mentor_constraint";

alter table "public"."Education" drop constraint "Education_user_id_fkey";

alter table "public"."WorkExperience" drop constraint "WorkExperience_user_id_fkey";

alter table "public"."db_user" drop constraint "db_user_pkey";

drop index if exists "public"."db_user_pkey";

drop table "public"."db_user";


  create table "public"."Follows" (
    "follower_id" uuid not null,
    "following_id" uuid not null,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."Follows" enable row level security;


  create table "public"."Messages" (
    "id" integer not null default nextval('"Messages_id_seq"'::regclass),
    "sender_id" uuid not null,
    "receiver_id" uuid not null,
    "body" text not null,
    "read_at" timestamp with time zone,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."Messages" enable row level security;


  create table "public"."Users" (
    "id" uuid not null,
    "full_name" text not null,
    "role" user_role not null,
    "created_at" timestamp without time zone not null default now(),
    "profile_picture_url" text,
    "bio" text not null,
    "skills" jsonb not null,
    "is_mentor" boolean default false,
    "is_seeking_mentor" boolean default false
      );


alter table "public"."Users" enable row level security;

alter table "public"."Education" alter column "id" set default uuid_generate_v4();

alter table "public"."Education" alter column "id" set data type uuid using "id"::uuid;

alter table "public"."WorkExperience" alter column "id" set default uuid_generate_v4();

alter table "public"."WorkExperience" alter column "id" set data type uuid using "id"::uuid;

alter sequence "public"."Messages_id_seq" owned by "public"."Messages"."id";

drop sequence if exists "public"."Education_id_seq";

drop sequence if exists "public"."WorkExperience_id_seq";

CREATE UNIQUE INDEX "Follows_pkey" ON public."Follows" USING btree (follower_id, following_id);

CREATE UNIQUE INDEX "Messages_pkey" ON public."Messages" USING btree (id);

CREATE INDEX idx_follows_created_at ON public."Follows" USING btree (created_at);

CREATE INDEX idx_follows_follower_id ON public."Follows" USING btree (follower_id);

CREATE INDEX idx_follows_following_id ON public."Follows" USING btree (following_id);

CREATE INDEX idx_messages_created_at ON public."Messages" USING btree (created_at);

CREATE INDEX idx_messages_read_at ON public."Messages" USING btree (read_at);

CREATE INDEX idx_messages_receiver_id ON public."Messages" USING btree (receiver_id);

CREATE INDEX idx_messages_sender_id ON public."Messages" USING btree (sender_id);

CREATE UNIQUE INDEX db_user_pkey ON public."Users" USING btree (id);

alter table "public"."Follows" add constraint "Follows_pkey" PRIMARY KEY using index "Follows_pkey";

alter table "public"."Messages" add constraint "Messages_pkey" PRIMARY KEY using index "Messages_pkey";

alter table "public"."Users" add constraint "db_user_pkey" PRIMARY KEY using index "db_user_pkey";

alter table "public"."Follows" add constraint "Follows_follower_id_fkey" FOREIGN KEY (follower_id) REFERENCES "Users"(id) ON DELETE CASCADE not valid;

alter table "public"."Follows" validate constraint "Follows_follower_id_fkey";

alter table "public"."Follows" add constraint "Follows_following_id_fkey" FOREIGN KEY (following_id) REFERENCES "Users"(id) ON DELETE CASCADE not valid;

alter table "public"."Follows" validate constraint "Follows_following_id_fkey";

alter table "public"."Messages" add constraint "Messages_receiver_id_fkey" FOREIGN KEY (receiver_id) REFERENCES "Users"(id) ON DELETE CASCADE not valid;

alter table "public"."Messages" validate constraint "Messages_receiver_id_fkey";

alter table "public"."Messages" add constraint "Messages_sender_id_fkey" FOREIGN KEY (sender_id) REFERENCES "Users"(id) ON DELETE CASCADE not valid;

alter table "public"."Messages" validate constraint "Messages_sender_id_fkey";

alter table "public"."Users" add constraint "db_user_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."Users" validate constraint "db_user_id_fkey";

alter table "public"."Users" add constraint "db_user_mentor_constraint" CHECK (((is_mentor = false) OR (is_seeking_mentor = false))) not valid;

alter table "public"."Users" validate constraint "db_user_mentor_constraint";

alter table "public"."Education" add constraint "Education_user_id_fkey" FOREIGN KEY (user_id) REFERENCES "Users"(id) ON DELETE CASCADE not valid;

alter table "public"."Education" validate constraint "Education_user_id_fkey";

alter table "public"."WorkExperience" add constraint "WorkExperience_user_id_fkey" FOREIGN KEY (user_id) REFERENCES "Users"(id) ON DELETE CASCADE not valid;

alter table "public"."WorkExperience" validate constraint "WorkExperience_user_id_fkey";

grant delete on table "public"."Follows" to "anon";

grant insert on table "public"."Follows" to "anon";

grant references on table "public"."Follows" to "anon";

grant select on table "public"."Follows" to "anon";

grant trigger on table "public"."Follows" to "anon";

grant truncate on table "public"."Follows" to "anon";

grant update on table "public"."Follows" to "anon";

grant delete on table "public"."Follows" to "authenticated";

grant insert on table "public"."Follows" to "authenticated";

grant references on table "public"."Follows" to "authenticated";

grant select on table "public"."Follows" to "authenticated";

grant trigger on table "public"."Follows" to "authenticated";

grant truncate on table "public"."Follows" to "authenticated";

grant update on table "public"."Follows" to "authenticated";

grant delete on table "public"."Follows" to "service_role";

grant insert on table "public"."Follows" to "service_role";

grant references on table "public"."Follows" to "service_role";

grant select on table "public"."Follows" to "service_role";

grant trigger on table "public"."Follows" to "service_role";

grant truncate on table "public"."Follows" to "service_role";

grant update on table "public"."Follows" to "service_role";

grant delete on table "public"."Messages" to "anon";

grant insert on table "public"."Messages" to "anon";

grant references on table "public"."Messages" to "anon";

grant select on table "public"."Messages" to "anon";

grant trigger on table "public"."Messages" to "anon";

grant truncate on table "public"."Messages" to "anon";

grant update on table "public"."Messages" to "anon";

grant delete on table "public"."Messages" to "authenticated";

grant insert on table "public"."Messages" to "authenticated";

grant references on table "public"."Messages" to "authenticated";

grant select on table "public"."Messages" to "authenticated";

grant trigger on table "public"."Messages" to "authenticated";

grant truncate on table "public"."Messages" to "authenticated";

grant update on table "public"."Messages" to "authenticated";

grant delete on table "public"."Messages" to "service_role";

grant insert on table "public"."Messages" to "service_role";

grant references on table "public"."Messages" to "service_role";

grant select on table "public"."Messages" to "service_role";

grant trigger on table "public"."Messages" to "service_role";

grant truncate on table "public"."Messages" to "service_role";

grant update on table "public"."Messages" to "service_role";

grant delete on table "public"."Users" to "anon";

grant insert on table "public"."Users" to "anon";

grant references on table "public"."Users" to "anon";

grant select on table "public"."Users" to "anon";

grant trigger on table "public"."Users" to "anon";

grant truncate on table "public"."Users" to "anon";

grant update on table "public"."Users" to "anon";

grant delete on table "public"."Users" to "authenticated";

grant insert on table "public"."Users" to "authenticated";

grant references on table "public"."Users" to "authenticated";

grant select on table "public"."Users" to "authenticated";

grant trigger on table "public"."Users" to "authenticated";

grant truncate on table "public"."Users" to "authenticated";

grant update on table "public"."Users" to "authenticated";

grant delete on table "public"."Users" to "service_role";

grant insert on table "public"."Users" to "service_role";

grant references on table "public"."Users" to "service_role";

grant select on table "public"."Users" to "service_role";

grant trigger on table "public"."Users" to "service_role";

grant truncate on table "public"."Users" to "service_role";

grant update on table "public"."Users" to "service_role";


  create policy "Users can create their own follows"
  on "public"."Follows"
  as permissive
  for insert
  to public
with check ((follower_id = auth.uid()));



  create policy "Users can delete their own follows"
  on "public"."Follows"
  as permissive
  for delete
  to public
using ((follower_id = auth.uid()));



  create policy "Users can view all follows"
  on "public"."Follows"
  as permissive
  for select
  to public
using (true);



  create policy "Users can create messages they send"
  on "public"."Messages"
  as permissive
  for insert
  to public
with check ((sender_id = auth.uid()));



  create policy "Users can delete messages they sent"
  on "public"."Messages"
  as permissive
  for delete
  to public
using ((sender_id = auth.uid()));



  create policy "Users can update messages they sent"
  on "public"."Messages"
  as permissive
  for update
  to public
using ((sender_id = auth.uid()))
with check ((sender_id = auth.uid()));



  create policy "Users can view messages they sent or received"
  on "public"."Messages"
  as permissive
  for select
  to public
using (((sender_id = auth.uid()) OR (receiver_id = auth.uid())));



  create policy "Users can insert their own profile"
  on "public"."Users"
  as permissive
  for insert
  to public
with check ((auth.uid() = id));



  create policy "Users can update their own profile"
  on "public"."Users"
  as permissive
  for update
  to public
using ((auth.uid() = id));



  create policy "Users can view their own data"
  on "public"."Users"
  as permissive
  for select
  to public
using ((auth.uid() = id));



