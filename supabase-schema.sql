-- ============================================================
-- HireHorizon - Supabase Database Schema
-- Chạy toàn bộ script này trong Supabase SQL Editor
-- ============================================================

-- 1. Bảng PROFILES (mở rộng auth.users, lưu role)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('candidate', 'recruiter', 'admin')),
  avatar_url TEXT,
  -- Candidate fields
  resume_url TEXT,
  skills TEXT[],
  -- Recruiter fields
  company_name TEXT,
  company_logo TEXT,
  company_website TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Bảng JOB_POSTINGS (chỉ recruiter mới tạo được)
CREATE TABLE IF NOT EXISTS public.job_postings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  company_logo TEXT,
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  salary TEXT,
  type TEXT NOT NULL CHECK (type IN ('Full-time', 'Part-time', 'Contract', 'Remote', 'Internship')),
  category TEXT NOT NULL CHECK (category IN ('Engineering', 'Design', 'Marketing', 'Sales', 'Product', 'Customer Support', 'Other')),
  description TEXT NOT NULL,
  requirements TEXT[] DEFAULT '{}',
  responsibilities TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'draft')),
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Bảng APPLICATIONS (ứng viên nộp đơn)
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.job_postings(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  cv_url TEXT NOT NULL,
  cover_letter TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'accepted', 'rejected')),
  applied_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  -- Mỗi ứng viên chỉ được apply 1 lần vào 1 job
  UNIQUE(job_id, candidate_id)
);

-- ============================================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_job_postings_updated_at
  BEFORE UPDATE ON public.job_postings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- AUTO-CREATE PROFILE khi user đăng ký (fallback trigger)
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Người dùng'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'candidate')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- PROFILES policies
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- JOB_POSTINGS policies
CREATE POLICY "Job postings are viewable by everyone"
  ON public.job_postings FOR SELECT USING (true);

CREATE POLICY "Recruiters can create job postings"
  ON public.job_postings FOR INSERT WITH CHECK (
    auth.uid() = recruiter_id AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'recruiter')
  );

CREATE POLICY "Recruiters can update own job postings"
  ON public.job_postings FOR UPDATE USING (
    auth.uid() = recruiter_id
  );

CREATE POLICY "Recruiters can delete own job postings"
  ON public.job_postings FOR DELETE USING (
    auth.uid() = recruiter_id
  );

-- APPLICATIONS policies
CREATE POLICY "Candidates can view own applications"
  ON public.applications FOR SELECT USING (
    auth.uid() = candidate_id OR
    EXISTS (
      SELECT 1 FROM public.job_postings
      WHERE id = job_id AND recruiter_id = auth.uid()
    )
  );

CREATE POLICY "Candidates can create applications"
  ON public.applications FOR INSERT WITH CHECK (
    auth.uid() = candidate_id AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'candidate')
  );

CREATE POLICY "Recruiters can update application status"
  ON public.applications FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.job_postings
      WHERE id = job_id AND recruiter_id = auth.uid()
    )
  );

-- ============================================================
-- STORAGE BUCKET cho CV upload
-- ============================================================
-- Chạy trong Supabase Dashboard > Storage > Create Bucket
-- Tên bucket: cvs
-- Public: true (để có public URL)

-- Policy cho storage bucket 'cvs':
-- Candidates can upload their own CVs
INSERT INTO storage.buckets (id, name, public)
VALUES ('cvs', 'cvs', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Candidates can upload CVs"
  ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'cvs' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "CVs are publicly readable"
  ON storage.objects FOR SELECT USING (bucket_id = 'cvs');

CREATE POLICY "Candidates can update own CVs"
  ON storage.objects FOR UPDATE USING (
    bucket_id = 'cvs' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
