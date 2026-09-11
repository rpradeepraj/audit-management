-- Migration: Remove firm_id from users table and create user_firms table for multi-firm user association

-- 1. Create user_firms junction table
CREATE TABLE IF NOT EXISTS public.user_firms (
    id TEXT PRIMARY KEY DEFAULT ('uf_' || replace(uuid_generate_v4()::text, '-', '')),
    firm_id TEXT NOT NULL REFERENCES public.firm(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    create_by TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_on DATE DEFAULT CURRENT_DATE NOT NULL,
    last_modifyed_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_modtfy_on DATE DEFAULT CURRENT_DATE NOT NULL,
    UNIQUE (user_id, firm_id)
);

-- 2. Migrate existing user-firm associations into user_firms if firm_id exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'firm_id'
    ) THEN
        INSERT INTO public.user_firms (id, firm_id, user_id, create_by, created_at, created_on, last_modifyed_at, last_modtfy_on)
        SELECT 
            'uf_' || replace(uuid_generate_v4()::text, '-', ''),
            firm_id,
            id,
            id,
            now(),
            CURRENT_DATE,
            now(),
            CURRENT_DATE
        FROM public.users
        WHERE firm_id IS NOT NULL
        ON CONFLICT (user_id, firm_id) DO NOTHING;
    END IF;
END $$;

-- 3. Drop dependent view(s) before dropping column
DROP VIEW IF EXISTS public.view_firm_details CASCADE;

-- 4. Drop column firm_id from users table (if it exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'firm_id'
    ) THEN
        ALTER TABLE public.users DROP COLUMN firm_id CASCADE;
    END IF;
END $$;

-- 5. Recreate view_firm_details using user_firms junction table
CREATE OR REPLACE VIEW public.view_firm_details AS
SELECT 
    f.id,
    f.code,
    f.name,
    f.contact_email,
    f.phone,
    f.address,
    f.website,
    f.established_year,
    f.quality_policy,
    f."Scope_Surveillance",
    f.is_active,
    f.created_at,
    f.created_on,
    f.last_modified_at,
    f.last_modified_on,
    COUNT(DISTINCT uf.user_id) AS total_active_staff_count,
    COUNT(DISTINCT ft.id) AS total_firm_templates_count,
    COUNT(DISTINCT ap.id) AS total_audits_count
FROM public.firm f
LEFT JOIN public.user_firms uf ON f.id = uf.firm_id
LEFT JOIN public.users u ON uf.user_id = u.id AND u.is_active = true
LEFT JOIN public.firm_templates ft ON f.id = ft.firm_id AND ft.is_active = true
LEFT JOIN public.audit_plans ap ON f.id = ap.firm_id
GROUP BY f.id;

-- 6. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_firms_user ON public.user_firms(user_id);
CREATE INDEX IF NOT EXISTS idx_user_firms_firm ON public.user_firms(firm_id);

-- 7. Row Level Security (RLS) policies
ALTER TABLE public.user_firms ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_firms' AND policyname = 'Allow authenticated read user_firms'
    ) THEN
        CREATE POLICY "Allow authenticated read user_firms" 
        ON public.user_firms FOR SELECT TO authenticated USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_firms' AND policyname = 'Allow service role all user_firms'
    ) THEN
        CREATE POLICY "Allow service role all user_firms" 
        ON public.user_firms FOR ALL TO service_role USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_firms' AND policyname = 'Allow anon select user_firms'
    ) THEN
        CREATE POLICY "Allow anon select user_firms" 
        ON public.user_firms FOR SELECT TO anon USING (true);
    END IF;
END $$;
