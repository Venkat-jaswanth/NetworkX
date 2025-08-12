drop extension if exists "pg_net";

create sequence "public"."Education_id_seq";

create sequence "public"."WorkExperience_id_seq";

alter type "public"."user_role" rename to "user_role__old_version_to_be_dropped";

create type "public"."user_role" as enum ('Student', 'Professional');


  create table "public"."Education" (
    "id" integer not null default nextval('"Education_id_seq"'::regclass),
    "user_id" uuid not null,
    "institution_name" character varying(255) not null,
    "degree" character varying(255) not null,
    "field_of_study" character varying(255) not null,
    "graduation_year" integer not null
      );


alter table "public"."Education" enable row level security;


  create table "public"."WorkExperience" (
    "id" integer not null default nextval('"WorkExperience_id_seq"'::regclass),
    "user_id" uuid not null,
    "company_name" character varying(255) not null,
    "job_title" character varying(255) not null,
    "start_date" date not null,
    "end_date" date
      );


alter table "public"."WorkExperience" enable row level security;

alter table "public"."db_user" alter column role type "public"."user_role" using role::text::"public"."user_role";

drop type "public"."user_role__old_version_to_be_dropped";

alter table "public"."db_user" add column "bio" text not null;

alter table "public"."db_user" add column "is_mentor" boolean default false;

alter table "public"."db_user" add column "is_seeking_mentor" boolean default false;

alter table "public"."db_user" add column "profile_picture_url" text;

alter table "public"."db_user" add column "skills" jsonb not null;

alter sequence "public"."Education_id_seq" owned by "public"."Education"."id";

alter sequence "public"."WorkExperience_id_seq" owned by "public"."WorkExperience"."id";

CREATE UNIQUE INDEX "Education_pkey" ON public."Education" USING btree (id);

CREATE UNIQUE INDEX "WorkExperience_pkey" ON public."WorkExperience" USING btree (id);

CREATE INDEX idx_education_user_id ON public."Education" USING btree (user_id);

CREATE INDEX idx_workexperience_user_id ON public."WorkExperience" USING btree (user_id);

alter table "public"."Education" add constraint "Education_pkey" PRIMARY KEY using index "Education_pkey";

alter table "public"."WorkExperience" add constraint "WorkExperience_pkey" PRIMARY KEY using index "WorkExperience_pkey";

alter table "public"."Education" add constraint "Education_user_id_fkey" FOREIGN KEY (user_id) REFERENCES db_user(id) ON DELETE CASCADE not valid;

alter table "public"."Education" validate constraint "Education_user_id_fkey";

alter table "public"."WorkExperience" add constraint "WorkExperience_user_id_fkey" FOREIGN KEY (user_id) REFERENCES db_user(id) ON DELETE CASCADE not valid;

alter table "public"."WorkExperience" validate constraint "WorkExperience_user_id_fkey";

alter table "public"."db_user" add constraint "db_user_mentor_constraint" CHECK (((is_mentor = false) OR (is_seeking_mentor = false))) not valid;

alter table "public"."db_user" validate constraint "db_user_mentor_constraint";

grant delete on table "public"."Education" to "anon";

grant insert on table "public"."Education" to "anon";

grant references on table "public"."Education" to "anon";

grant select on table "public"."Education" to "anon";

grant trigger on table "public"."Education" to "anon";

grant truncate on table "public"."Education" to "anon";

grant update on table "public"."Education" to "anon";

grant delete on table "public"."Education" to "authenticated";

grant insert on table "public"."Education" to "authenticated";

grant references on table "public"."Education" to "authenticated";

grant select on table "public"."Education" to "authenticated";

grant trigger on table "public"."Education" to "authenticated";

grant truncate on table "public"."Education" to "authenticated";

grant update on table "public"."Education" to "authenticated";

grant delete on table "public"."Education" to "service_role";

grant insert on table "public"."Education" to "service_role";

grant references on table "public"."Education" to "service_role";

grant select on table "public"."Education" to "service_role";

grant trigger on table "public"."Education" to "service_role";

grant truncate on table "public"."Education" to "service_role";

grant update on table "public"."Education" to "service_role";

grant delete on table "public"."WorkExperience" to "anon";

grant insert on table "public"."WorkExperience" to "anon";

grant references on table "public"."WorkExperience" to "anon";

grant select on table "public"."WorkExperience" to "anon";

grant trigger on table "public"."WorkExperience" to "anon";

grant truncate on table "public"."WorkExperience" to "anon";

grant update on table "public"."WorkExperience" to "anon";

grant delete on table "public"."WorkExperience" to "authenticated";

grant insert on table "public"."WorkExperience" to "authenticated";

grant references on table "public"."WorkExperience" to "authenticated";

grant select on table "public"."WorkExperience" to "authenticated";

grant trigger on table "public"."WorkExperience" to "authenticated";

grant truncate on table "public"."WorkExperience" to "authenticated";

grant update on table "public"."WorkExperience" to "authenticated";

grant delete on table "public"."WorkExperience" to "service_role";

grant insert on table "public"."WorkExperience" to "service_role";

grant references on table "public"."WorkExperience" to "service_role";

grant select on table "public"."WorkExperience" to "service_role";

grant trigger on table "public"."WorkExperience" to "service_role";

grant truncate on table "public"."WorkExperience" to "service_role";

grant update on table "public"."WorkExperience" to "service_role";


  create policy "Users can manage their own education"
  on "public"."Education"
  as permissive
  for all
  to public
using ((user_id = auth.uid()));



  create policy "Users can manage their own work experience"
  on "public"."WorkExperience"
  as permissive
  for all
  to public
using ((user_id = auth.uid()));



