-- ============================================================================
-- Digital ToolVerse — Course platform schema
-- Run this once in the Supabase SQL Editor (Dashboard → SQL → New query).
-- Safe to re-run: guarded with "if not exists" / "on conflict".
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

-- User profiles (1:1 with auth.users). is_admin gates the admin dashboard.
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text,
  full_name  text,
  is_admin   boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.courses (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  title         text not null,
  subtitle      text,
  description   text,
  category      text default 'Business',
  level         text default 'All levels',
  price_pkr     integer not null default 0,
  thumbnail_url text,
  published     boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Episodes / lectures belonging to a course.
-- video_kind: 'upload' (Supabase Storage), 'external' (YouTube/link), 'none' (text only).
create table if not exists public.lectures (
  id            uuid primary key default gen_random_uuid(),
  course_id     uuid not null references public.courses(id) on delete cascade,
  section       text default 'Course Content',
  title         text not null,
  description   text,
  position      integer not null default 0,
  video_kind    text not null default 'none' check (video_kind in ('upload','external','none')),
  video_path    text,          -- storage object path in bucket 'course-videos' (private)
  video_url     text,          -- external / YouTube URL
  resource_path text,          -- downloadable file path in 'course-resources' (private)
  resource_name text,
  duration_seconds integer,
  is_preview    boolean not null default false,  -- viewable without enrollment
  created_at    timestamptz not null default now()
);
create index if not exists lectures_course_idx on public.lectures(course_id, position);

-- Enrollment requests. status flips to 'approved' by an admin after payment.
create table if not exists public.enrollments (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  course_id   uuid not null references public.courses(id) on delete cascade,
  status      text not null default 'pending' check (status in ('pending','approved','rejected')),
  note        text,
  created_at  timestamptz not null default now(),
  approved_at timestamptz,
  unique (user_id, course_id)
);

-- ---------------------------------------------------------------------------
-- Helper functions (security definer so they can read tables under RLS)
-- ---------------------------------------------------------------------------

create or replace function public.is_admin(uid uuid)
returns boolean language sql security definer stable
set search_path = public as $$
  select coalesce((select is_admin from public.profiles where id = uid), false);
$$;

create or replace function public.has_course_access(uid uuid, cid uuid)
returns boolean language sql security definer stable
set search_path = public as $$
  select public.is_admin(uid)
      or exists (
        select 1 from public.enrollments
        where user_id = uid and course_id = cid and status = 'approved'
      );
$$;

-- Auto-create a profile row when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer
set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles    enable row level security;
alter table public.courses     enable row level security;
alter table public.lectures    enable row level security;
alter table public.enrollments enable row level security;

-- profiles
drop policy if exists "profiles_read"   on public.profiles;
drop policy if exists "profiles_insert" on public.profiles;
drop policy if exists "profiles_update" on public.profiles;
create policy "profiles_read"   on public.profiles for select using (auth.uid() = id or public.is_admin(auth.uid()));
create policy "profiles_insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on public.profiles for update using (auth.uid() = id);

-- courses: anyone can read published courses; admins manage everything
drop policy if exists "courses_read"  on public.courses;
drop policy if exists "courses_write" on public.courses;
create policy "courses_read"  on public.courses for select using (published or public.is_admin(auth.uid()));
create policy "courses_write" on public.courses for all
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- lectures: curriculum (titles) visible for published courses; admins manage all.
-- Sensitive columns (video_url/video_path/resource_path) are revoked below so
-- non-admins can see the episode list but never the raw media pointers — those
-- are only handed out by server functions after an access check.
drop policy if exists "lectures_read"  on public.lectures;
drop policy if exists "lectures_write" on public.lectures;
create policy "lectures_read" on public.lectures for select using (
  public.is_admin(auth.uid())
  or exists (select 1 from public.courses c where c.id = course_id and c.published)
);
create policy "lectures_write" on public.lectures for all
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- Hide media pointers from client roles. Server functions use the SECRET key
-- (service role) which bypasses these grants.
revoke select (video_url, video_path, resource_path) on public.lectures from anon, authenticated;

-- enrollments: users see & create their own; admins see & update all
drop policy if exists "enroll_read"         on public.enrollments;
drop policy if exists "enroll_insert_own"   on public.enrollments;
drop policy if exists "enroll_admin_update" on public.enrollments;
create policy "enroll_read"         on public.enrollments for select using (auth.uid() = user_id or public.is_admin(auth.uid()));
create policy "enroll_insert_own"   on public.enrollments for insert with check (auth.uid() = user_id);
create policy "enroll_admin_update" on public.enrollments for update using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- ---------------------------------------------------------------------------
-- Storage buckets
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public) values
  ('course-videos',     'course-videos',     false),
  ('course-resources',  'course-resources',  false),
  ('course-thumbnails', 'course-thumbnails', true)
on conflict (id) do nothing;

-- Uploads/reads of private buckets go through server functions (service role),
-- so no permissive storage policies are required for them. Public thumbnails
-- are world-readable by virtue of the bucket being public.

-- ---------------------------------------------------------------------------
-- Make yourself an admin (run AFTER you have signed up once in the app):
--   update public.profiles set is_admin = true where email = 'you@example.com';
-- ---------------------------------------------------------------------------
