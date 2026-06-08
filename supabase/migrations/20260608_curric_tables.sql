-- ============================================
-- CURRIC.APP — Teacher Job Marketplace Tables
-- ============================================

-- TEACHER PROFILES
-- One row per teacher who signs up
create table teacher_profiles (
  id uuid references auth.users not null primary key,
  full_name text not null,
  email text not null,
  phone text,
  nationality text,
  current_country text,
  city text,
  bio text,
  -- Teaching qualifications
  highest_education text,        -- e.g. 'Bachelor', 'Master', 'PGCE'
  degree_field text,             -- e.g. 'English Literature', 'Education'
  certifications text[],         -- e.g. ARRAY['TEFL','IELTS','CELTA']
  years_experience integer default 0,
  languages text[],              -- e.g. ARRAY['English','Arabic','Vietnamese']
  -- Teaching preferences
  preferred_countries text[],    -- e.g. ARRAY['Vietnam','Thailand','China']
  preferred_job_types text[],    -- e.g. ARRAY['Full-time','Part-time','Online']
  min_salary_usd integer,        -- minimum acceptable monthly salary
  -- Profile metadata
  avatar_url text,
  cv_url text,                   -- link to uploaded CV
  video_intro_url text,          -- optional intro video
  is_public boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table teacher_profiles enable row level security;
create policy "Teachers can view own profile" on teacher_profiles for select using (auth.uid() = id);
create policy "Teachers can update own profile" on teacher_profiles for update using (auth.uid() = id);
create policy "Teachers can insert own profile" on teacher_profiles for insert with check (auth.uid() = id);
create policy "Public profiles visible to all" on teacher_profiles for select using (is_public = true);

-- SCHOOL / EMPLOYER PROFILES
-- Schools, language centers, universities that post jobs
create table school_profiles (
  id uuid references auth.users not null primary key,
  org_name text not null,
  org_type text,                 -- 'international_school', 'language_center', 'university', 'online_school'
  country text not null,
  city text,
  website text,
  description text,
  logo_url text,
  contact_email text,
  contact_phone text,
  is_verified boolean default false,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table school_profiles enable row level security;
create policy "Schools can view own profile" on school_profiles for select using (auth.uid() = id);
create policy "Schools can update own profile" on school_profiles for update using (auth.uid() = id);
create policy "Schools can insert own profile" on school_profiles for insert with check (auth.uid() = id);
create policy "Active school profiles visible to all" on school_profiles for select using (is_active = true);

-- JOB LISTINGS
-- Each row is one job posted by a school
create table job_listings (
  id uuid default gen_random_uuid() primary key,
  school_id uuid references school_profiles not null,
  title text not null,
  description text not null,
  -- Job details
  country text not null,
  city text,
  job_type text not null,        -- 'full_time', 'part_time', 'contract', 'online'
  subject text,                  -- 'english', 'math', 'science', etc.
  grade_level text,              -- 'secondary', 'primary', 'adult', 'university'
  salary_min integer,            -- monthly USD
  salary_max integer,
  salary_currency text default 'USD',
  -- Requirements
  min_experience integer default 0,
  required_education text,
  required_certifications text[],
  -- Dates
  start_date date,
  application_deadline date,
  -- Status
  status text default 'active',  -- 'active', 'closed', 'draft', 'filled'
  is_featured boolean default false,
  views integer default 0,
  applications_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table job_listings enable row level security;
create policy "Schools can manage own listings" on job_listings for all using (auth.uid() = school_id);
create policy "Active listings visible to all" on job_listings for select using (status = 'active');
create policy "Public can view active listings" on job_listings for select using (status in ('active', 'closed'));

-- APPLICATIONS
-- Teacher applies to a job
create table applications (
  id uuid default gen_random_uuid() primary key,
  job_id uuid references job_listings not null,
  teacher_id uuid references teacher_profiles not null,
  status text default 'pending', -- 'pending', 'reviewed', 'shortlisted', 'interview', 'offered', 'accepted', 'rejected'
  cover_letter text,
  notes text,                    -- private notes from school
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(job_id, teacher_id)     -- one application per teacher per job
);

alter table applications enable row level security;
create policy "Teachers can view own applications" on applications for select using (auth.uid() = teacher_id);
create policy "Teachers can create applications" on applications for insert with check (auth.uid() = teacher_id);
create policy "Schools can view applications to their jobs" on applications for select using (
  exists (select 1 from job_listings where job_listings.id = applications.job_id and job_listings.school_id = auth.uid())
);
create policy "Schools can update applications to their jobs" on applications for update using (
  exists (select 1 from job_listings where job_listings.id = applications.job_id and job_listings.school_id = auth.uid())
);

-- SAVED JOBS
-- Teachers can bookmark jobs
create table saved_jobs (
  id uuid default gen_random_uuid() primary key,
  teacher_id uuid references teacher_profiles not null,
  job_id uuid references job_listings not null,
  created_at timestamptz default now(),
  unique(teacher_id, job_id)
);

alter table saved_jobs enable row level security;
create policy "Teachers can manage own saved jobs" on saved_jobs for all using (auth.uid() = teacher_id);

-- INDEXES for performance
create index idx_job_listings_country on job_listings(country);
create index idx_job_listings_status on job_listings(status);
create index idx_job_listings_school on job_listings(school_id);
create index idx_job_listings_created on job_listings(created_at desc);
create index idx_applications_teacher on applications(teacher_id);
create index idx_applications_job on applications(job_id);
create index idx_teacher_profiles_country on teacher_profiles(current_country);
