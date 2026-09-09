-- ============================================================================
-- Migration: Change audit_team_members to reference firm_id instead of audit_id
-- Table: public.audit_team_members (firm_id, user_id)
-- ============================================================================

-- 1. Drop dependent view(s) safely before modifying columns
DROP VIEW IF EXISTS public.view_audit_summary CASCADE;
DROP VIEW IF EXISTS public.view_audit_overview CASCADE;

-- 2. Modify audit_team_members table structure
DO $$
BEGIN
    -- If audit_id exists and firm_id does not, drop audit_id column
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'audit_team_members' 
        AND column_name = 'audit_id'
    ) THEN
        ALTER TABLE public.audit_team_members DROP COLUMN IF EXISTS audit_id CASCADE;
    END IF;

    -- If firm_id column does not exist, add it referencing public.firm(id)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'audit_team_members' 
        AND column_name = 'firm_id'
    ) THEN
        ALTER TABLE public.audit_team_members ADD COLUMN firm_id TEXT REFERENCES public.firm(id) ON DELETE CASCADE;
    END IF;

    -- Drop role_in_team if exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'audit_team_members' 
        AND column_name = 'role_in_team'
    ) THEN
        ALTER TABLE public.audit_team_members DROP COLUMN role_in_team CASCADE;
    END IF;
    
    -- Drop role_in_member if exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'audit_team_members' 
        AND column_name = 'role_in_member'
    ) THEN
        ALTER TABLE public.audit_team_members DROP COLUMN role_in_member CASCADE;
    END IF;
END $$;

-- 3. Ensure clean table creation if not exists
CREATE TABLE IF NOT EXISTS public.audit_team_members (
    id TEXT PRIMARY KEY DEFAULT ('atm_' || replace(uuid_generate_v4()::text, '-', '')),
    firm_id TEXT NOT NULL REFERENCES public.firm(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_on DATE DEFAULT CURRENT_DATE NOT NULL,
    UNIQUE (firm_id, user_id)
);

-- 4. Re-create unique constraint on (firm_id, user_id) if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'audit_team_members_firm_id_user_id_key'
    ) THEN
        ALTER TABLE public.audit_team_members DROP CONSTRAINT IF EXISTS audit_team_members_audit_id_user_id_key;
        ALTER TABLE public.audit_team_members ADD CONSTRAINT audit_team_members_firm_id_user_id_key UNIQUE (firm_id, user_id);
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        NULL;
END $$;

-- 5. Create performance indexes
CREATE INDEX IF NOT EXISTS idx_audit_team_firm ON public.audit_team_members(firm_id);
CREATE INDEX IF NOT EXISTS idx_audit_team_user ON public.audit_team_members(user_id);

-- 6. Enable Row Level Security (RLS)
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

-- 7. Recreate view_audit_overview with correct audit_plans columns
CREATE OR REPLACE VIEW public.view_audit_overview AS
SELECT 
    a.id,
    a.audit_number,
    a.title,
    a.auditee_name,
    a.auditee_code,
    a.auditee_contact_person,
    a.auditee_email,
    a.auditee_risk_level,
    a.firm_id,
    f.name AS firm_name,
    f.code AS firm_code,
    a.firm_template_id,
    ft.title AS firm_template_title,
    a.global_template_id,
    gt.title AS global_template_title,
    a.standard,
    a.audit_type,
    a.scope,
    a.start_date,
    a.end_date,
    a.status,
    a.overall_score,
    a.passing_score,
    a.lead_auditor_id,
    u.name AS lead_auditor_name,
    a.created_at,
    a.created_on,
    a.last_modified_at,
    a.last_modified_on,
    COALESCE(
        jsonb_agg(
            DISTINCT jsonb_build_object(
                'user_id', atm.user_id,
                'user_name', tu.name,
                'role', tu.role
            )
        ) FILTER (WHERE atm.id IS NOT NULL),
        '[]'::jsonb
    ) AS audit_team,
    COUNT(DISTINCT r.id) AS total_checklist_responses_count,
    COUNT(DISTINCT fnd.id) AS total_findings_count,
    COUNT(DISTINCT afr.id) AS total_finding_responses_count,
    COUNT(DISTINCT cap.id) AS total_capas_count,
    COUNT(DISTINCT att.id) AS total_attachments_count
FROM public.audit_plans a
LEFT JOIN public.firm f ON a.firm_id = f.id
LEFT JOIN public.firm_templates ft ON a.firm_template_id = ft.id
LEFT JOIN public.global_templates gt ON a.global_template_id = gt.id
LEFT JOIN public.users u ON a.lead_auditor_id = u.id
LEFT JOIN public.audit_team_members atm ON a.firm_id = atm.firm_id
LEFT JOIN public.users tu ON atm.user_id = tu.id
LEFT JOIN public.audit_checklist_responses r ON a.id = r.audit_id
LEFT JOIN public.audit_findings fnd ON a.id = fnd.audit_id
LEFT JOIN public.audit_finding_responses afr ON a.id = afr.audit_id
LEFT JOIN public.audit_corrective_actions cap ON a.id = cap.audit_id
LEFT JOIN public.audit_attachments att ON a.id = att.audit_id
GROUP BY a.id, f.name, f.code, ft.title, gt.title, u.name;
