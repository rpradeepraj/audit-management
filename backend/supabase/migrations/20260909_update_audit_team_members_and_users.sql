-- Migration: Update audit_team_members table and remove role_in_team / role_in_member column

DO $$
BEGIN
    -- 1. Drop role_in_team column if it exists in audit_team_members
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'audit_team_members' 
        AND column_name = 'role_in_team'
    ) THEN
        ALTER TABLE public.audit_team_members DROP COLUMN role_in_team CASCADE;
    END IF;

    -- 2. Drop role_in_member column if it exists in audit_team_members
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'audit_team_members' 
        AND column_name = 'role_in_member'
    ) THEN
        ALTER TABLE public.audit_team_members DROP COLUMN role_in_member CASCADE;
    END IF;
END $$;

-- 3. Ensure audit_team_members table exists with clean schema
CREATE TABLE IF NOT EXISTS public.audit_team_members (
    id TEXT PRIMARY KEY DEFAULT ('atm_' || replace(uuid_generate_v4()::text, '-', '')),
    audit_id TEXT NOT NULL REFERENCES public.audit_plans(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_on DATE DEFAULT CURRENT_DATE NOT NULL,
    UNIQUE (audit_id, user_id)
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.audit_team_members ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'audit_team_members' AND policyname = 'Allow public read-write for AMS operations'
    ) THEN
        CREATE POLICY "Allow public read-write for AMS operations" 
        ON public.audit_team_members FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;
