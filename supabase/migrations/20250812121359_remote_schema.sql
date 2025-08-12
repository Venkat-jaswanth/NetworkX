alter table "public"."Education" alter column "id" set default uuid_generate_v4();

alter table "public"."Education" alter column "id" set data type uuid using "id"::uuid;

alter table "public"."WorkExperience" alter column "id" set default uuid_generate_v4();

alter table "public"."WorkExperience" alter column "id" set data type uuid using "id"::uuid;

drop sequence if exists "public"."Education_id_seq";

drop sequence if exists "public"."WorkExperience_id_seq";


