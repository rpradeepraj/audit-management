-- Migration: Ensure user_role_type enum includes all 4 assigned roles:
-- 'Admin', 'Audit Manager', 'Auditor', 'Client Representative'

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type t
        JOIN pg_enum e ON t.oid = e.enumtypid
        WHERE t.typname = 'user_role_type' AND e.enumlabel = 'Client Representative'
    ) THEN
        ALTER TYPE public.user_role_type ADD VALUE IF NOT EXISTS 'Client Representative';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_type t
        JOIN pg_enum e ON t.oid = e.enumtypid
        WHERE t.typname = 'user_role_type' AND e.enumlabel = 'Admin'
    ) THEN
        ALTER TYPE public.user_role_type ADD VALUE IF NOT EXISTS 'Admin';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_type t
        JOIN pg_enum e ON t.oid = e.enumtypid
        WHERE t.typname = 'user_role_type' AND e.enumlabel = 'Auditor'
    ) THEN
        ALTER TYPE public.user_role_type ADD VALUE IF NOT EXISTS 'Auditor';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_type t
        JOIN pg_enum e ON t.oid = e.enumtypid
        WHERE t.typname = 'user_role_type' AND e.enumlabel = 'Audit Manager'
    ) THEN
        ALTER TYPE public.user_role_type ADD VALUE IF NOT EXISTS 'Audit Manager';
    END IF;
END $$;
