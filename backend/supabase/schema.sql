-- ============================================================================
-- AUDIT MANAGEMENT SYSTEM (AMS) - SUPABASE / POSTGRESQL PRODUCTION SCHEMA
-- ============================================================================
-- Clean, fully normalized relational schema without redundant text fields.
-- Architecture:
--   - Global Template Hierarchy (global_templates, global_sections, global_questions)
--   - Firm Template Hierarchy (firm_templates, firm_sections, firm_questions)
--   - Unified Audit Execution & Workflow Suite:
--       * audit_plans
--       * audit_team_members
--       * audit_checklist_responses (clause evaluation & compliance scoring)
--       * audit_findings (logged non-conformances & observations)
--       * audit_finding_responses (formal auditee/auditor responses & containment)
--       * audit_corrective_actions (CAPA & 5-Why root cause analysis)
--       * audit_attachments (artifacts, evidence & verification documents)
--       * audit_logs (immutable system audit trail)
-- Includes standardized audit timestamp tracking:
--   created_at (TIMESTAMPTZ), created_on (DATE),
--   last_modified_at (TIMESTAMPTZ), last_modified_on (DATE)
-- With automated triggers, comprehensive indexes, database views, and RLS.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 0. CLEAN RESET (DROP EXISTING TABLES, VIEWS, TRIGGERS & ENUMS)
-- ----------------------------------------------------------------------------
DROP VIEW IF EXISTS public.view_firm_template_hierarchy CASCADE;
DROP VIEW IF EXISTS public.view_global_template_hierarchy CASCADE;
DROP VIEW IF EXISTS public.view_audit_overview CASCADE;
DROP VIEW IF EXISTS public.view_firm_details CASCADE;

-- Drop Execution, Findings, CAPA & Attachment Tables
DROP TABLE IF EXISTS public.audit_attachments CASCADE;
DROP TABLE IF EXISTS public.evidence_attachments CASCADE;
DROP TABLE IF EXISTS public.audit_finding_responses CASCADE;
DROP TABLE IF EXISTS public.audit_corrective_actions CASCADE;
DROP TABLE IF EXISTS public.corrective_actions CASCADE;
DROP TABLE IF EXISTS public.audit_findings CASCADE;
DROP TABLE IF EXISTS public.findings CASCADE;
DROP TABLE IF EXISTS public.audit_checklist_responses CASCADE;
DROP TABLE IF EXISTS public.checklist_responses CASCADE;
DROP TABLE IF EXISTS public.audit_team_members CASCADE;
DROP TABLE IF EXISTS public.audit_plans CASCADE;
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;

-- Drop Firm Template Hierarchy
DROP TABLE IF EXISTS public.firm_questions CASCADE;
DROP TABLE IF EXISTS public.firm_sections CASCADE;
DROP TABLE IF EXISTS public.firm_templates CASCADE;

-- Drop Global Template Hierarchy
DROP TABLE IF EXISTS public.global_questions CASCADE;
DROP TABLE IF EXISTS public.global_sections CASCADE;
DROP TABLE IF EXISTS public.global_templates CASCADE;

-- Drop Legacy Template & Scope Tables
DROP TABLE IF EXISTS public.template_questions CASCADE;
DROP TABLE IF EXISTS public.template_sections CASCADE;
DROP TABLE IF EXISTS public.firm_maintained_templates CASCADE;
DROP TABLE IF EXISTS public.audit_templates CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.customers CASCADE;
DROP TABLE IF EXISTS public.firm_roles CASCADE;
DROP TABLE IF EXISTS public.firm_scopes CASCADE;
DROP TABLE IF EXISTS public.firm CASCADE;
DROP TABLE IF EXISTS public.audit_firms CASCADE;
DROP TABLE IF EXISTS public.industry_scopes CASCADE;

-- Drop Enums
DROP TYPE IF EXISTS public.finding_response_type_enum CASCADE;
DROP TYPE IF EXISTS public.notification_type_enum CASCADE;
DROP TYPE IF EXISTS public.recurrence_type_enum CASCADE;
DROP TYPE IF EXISTS public.location_type_enum CASCADE;
DROP TYPE IF EXISTS public.risk_level_type CASCADE;
DROP TYPE IF EXISTS public.question_response_status_type CASCADE;
DROP TYPE IF EXISTS public.capa_status_type CASCADE;
DROP TYPE IF EXISTS public.finding_status_type CASCADE;
DROP TYPE IF EXISTS public.finding_severity_type CASCADE;
DROP TYPE IF EXISTS public.audit_type_enum CASCADE;
DROP TYPE IF EXISTS public.audit_status_type CASCADE;
DROP TYPE IF EXISTS public.user_role_type CASCADE;

-- ----------------------------------------------------------------------------
-- 1. EXTENSIONS
-- ----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 2. ENUM TYPES
-- ----------------------------------------------------------------------------
CREATE TYPE user_role_type AS ENUM (
    'Platform Admin',
    'Firm Admin',
    'Company Admin',
    'Audit Manager',
    'Lead Auditor',
    'Auditor',
    'Auditee Representative',
    'Auditee Viewer'
);

CREATE TYPE audit_status_type AS ENUM (
    'Draft',
    'Scheduled',
    'In Progress',
    'Under Review',
    'Completed',
    'Closed'
);

CREATE TYPE audit_type_enum AS ENUM (
    'Certification',
    'Surveillance',
    'Internal Quality',
    'Internal',
    'External',
    'Supplier Audit',
    'Supplier',
    'Security & Compliance',
    'Regulatory'
);

CREATE TYPE finding_severity_type AS ENUM (
    'Critical',
    'Major',
    'Minor',
    'Observation'
);

CREATE TYPE finding_status_type AS ENUM (
    'Open',
    'CAPA In Progress',
    'CAPA Submitted',
    'Pending Review',
    'Under Review',
    'Resolved',
    'Closed',
    'Rejected'
);

CREATE TYPE finding_response_type_enum AS ENUM (
    'Auditee Initial Response',
    'Auditee Explanation',
    'Containment Action Plan',
    'Auditor Feedback',
    'Clarification Request',
    'Verification Note',
    'Closure Confirmation'
);

CREATE TYPE capa_status_type AS ENUM (
    'Draft',
    'Submitted',
    'Accepted',
    'Rejected',
    'Under Verification'
);

CREATE TYPE question_response_status_type AS ENUM (
    'PASS',
    'FAIL',
    'MINOR_NC',
    'MAJOR_NC',
    'OFI',
    'NOT_APPLICABLE',
    'UNANSWERED'
);

CREATE TYPE risk_level_type AS ENUM (
    'Low',
    'Medium',
    'High'
);

CREATE TYPE location_type_enum AS ENUM (
    'On-Site',
    'Hybrid',
    'Remote'
);

CREATE TYPE recurrence_type_enum AS ENUM (
    'One-Time',
    'Monthly',
    'Quarterly',
    'Semi-Annual',
    'Annual Surveillance'
);

-- ----------------------------------------------------------------------------
-- 3. MASTER & RELATIONAL TABLES
-- ----------------------------------------------------------------------------

-- 3.1 Firm (Audit Agencies / Certification Bodies)
CREATE TABLE public.firm (
    id TEXT PRIMARY KEY DEFAULT ('firm_' || replace(uuid_generate_v4()::text, '-', '')),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    website VARCHAR(255),
    established_year VARCHAR(10),
    quality_policy TEXT,
    "Scope_Surveillance" TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_on DATE DEFAULT CURRENT_DATE NOT NULL,
    last_modified_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_modified_on DATE DEFAULT CURRENT_DATE NOT NULL
);

-- 3.2 Users (Identity, Access Credentials & Platform Profile)
CREATE TABLE public.users (
    id TEXT PRIMARY KEY DEFAULT ('usr_' || replace(uuid_generate_v4()::text, '-', '')),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL DEFAULT crypt('password123', gen_salt('bf')),
    name VARCHAR(255) NOT NULL,
    role user_role_type DEFAULT 'Auditor' NOT NULL,
    phone VARCHAR(50),
    avatar TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    last_login_at TIMESTAMPTZ,
    last_login_on DATE,
    failed_login_attempts INT DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_on DATE DEFAULT CURRENT_DATE NOT NULL,
    last_modified_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_modified_on DATE DEFAULT CURRENT_DATE NOT NULL,
    "Organization" TEXT
);

-- 3.2.1 User-Firm Junction Table (Multi-Firm User Affiliation)
CREATE TABLE public.user_firms (
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

-- ----------------------------------------------------------------------------
-- 3.3 GLOBAL TEMPLATE HIERARCHY (Platform Master Standard Catalog)
-- ----------------------------------------------------------------------------

-- Global Template (e.g. ISO 9001:2015, SOC 2 Type II, ISO 27001:2022)
CREATE TABLE public.global_templates (
    id TEXT PRIMARY KEY DEFAULT ('gtmpl_' || replace(uuid_generate_v4()::text, '-', '')),
    code VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    standard VARCHAR(150) NOT NULL,
    industry VARCHAR(150) DEFAULT 'General Industry' NOT NULL,
    version VARCHAR(20) DEFAULT '1.0' NOT NULL,
    passing_score NUMERIC(5,2) DEFAULT 80.00 CHECK (passing_score >= 0 AND passing_score <= 100),
    tags TEXT[] DEFAULT '{}' NOT NULL,
    description TEXT,
    created_by TEXT REFERENCES public.users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_on DATE DEFAULT CURRENT_DATE NOT NULL,
    last_modified_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_modified_on DATE DEFAULT CURRENT_DATE NOT NULL
);

-- Global Section (Clause Categories under a Global Template)
CREATE TABLE public.global_sections (
    id TEXT PRIMARY KEY DEFAULT ('gsec_' || replace(uuid_generate_v4()::text, '-', '')),
    global_template_id TEXT NOT NULL REFERENCES public.global_templates(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    weight NUMERIC(5,2) DEFAULT 100.00,
    order_index INT DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_on DATE DEFAULT CURRENT_DATE NOT NULL,
    last_modified_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_modified_on DATE DEFAULT CURRENT_DATE NOT NULL
);

-- Global Question (Clauses, Controls, and Questions under a Global Section)
CREATE TABLE public.global_questions (
    id TEXT PRIMARY KEY DEFAULT ('gq_' || replace(uuid_generate_v4()::text, '-', '')),
    global_section_id TEXT NOT NULL REFERENCES public.global_sections(id) ON DELETE CASCADE,
    requirement_id VARCHAR(50) NOT NULL,
    question TEXT NOT NULL,
    guidance TEXT,
    scoring_type VARCHAR(50) DEFAULT 'PASS_FAIL' NOT NULL,
    weight NUMERIC(5,2) DEFAULT 10.00 NOT NULL,
    mandatory BOOLEAN DEFAULT false NOT NULL,
    order_index INT DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_on DATE DEFAULT CURRENT_DATE NOT NULL,
    last_modified_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_modified_on DATE DEFAULT CURRENT_DATE NOT NULL
);

-- ----------------------------------------------------------------------------
-- 3.4 FIRM TEMPLATE HIERARCHY (Firm Customized / Proprietary Checklists)
-- ----------------------------------------------------------------------------

-- Firm Template (Proprietary checklist owned by an audit firm, optionally derived from a global template)
CREATE TABLE public.firm_templates (
    id TEXT PRIMARY KEY DEFAULT ('ftmpl_' || replace(uuid_generate_v4()::text, '-', '')),
    firm_id TEXT NOT NULL REFERENCES public.firm(id) ON DELETE CASCADE,
    global_template_id TEXT REFERENCES public.global_templates(id) ON DELETE SET NULL,
    code VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    standard VARCHAR(150) NOT NULL,
    industry VARCHAR(150) DEFAULT 'General Industry' NOT NULL,
    version VARCHAR(20) DEFAULT '1.0' NOT NULL,
    passing_score NUMERIC(5,2) DEFAULT 80.00 CHECK (passing_score >= 0 AND passing_score <= 100),
    tags TEXT[] DEFAULT '{}' NOT NULL,
    description TEXT,
    is_custom BOOLEAN DEFAULT false NOT NULL,
    created_by TEXT REFERENCES public.users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_on DATE DEFAULT CURRENT_DATE NOT NULL,
    last_modified_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_modified_on DATE DEFAULT CURRENT_DATE NOT NULL,
    UNIQUE (firm_id, code)
);

-- Firm Section (Section categories within a Firm Template)
CREATE TABLE public.firm_sections (
    id TEXT PRIMARY KEY DEFAULT ('fsec_' || replace(uuid_generate_v4()::text, '-', '')),
    firm_template_id TEXT NOT NULL REFERENCES public.firm_templates(id) ON DELETE CASCADE,
    global_section_id TEXT REFERENCES public.global_sections(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    weight NUMERIC(5,2) DEFAULT 100.00,
    order_index INT DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_on DATE DEFAULT CURRENT_DATE NOT NULL,
    last_modified_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_modified_on DATE DEFAULT CURRENT_DATE NOT NULL
);

-- Firm Question (Specific requirements, questions, and guidance within a Firm Section)
CREATE TABLE public.firm_questions (
    id TEXT PRIMARY KEY DEFAULT ('fq_' || replace(uuid_generate_v4()::text, '-', '')),
    firm_section_id TEXT NOT NULL REFERENCES public.firm_sections(id) ON DELETE CASCADE,
    global_question_id TEXT REFERENCES public.global_questions(id) ON DELETE SET NULL,
    requirement_id VARCHAR(50) NOT NULL,
    question TEXT NOT NULL,
    guidance TEXT,
    scoring_type VARCHAR(50) DEFAULT 'PASS_FAIL' NOT NULL,
    weight NUMERIC(5,2) DEFAULT 10.00 NOT NULL,
    mandatory BOOLEAN DEFAULT false NOT NULL,
    order_index INT DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_on DATE DEFAULT CURRENT_DATE NOT NULL,
    last_modified_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_modified_on DATE DEFAULT CURRENT_DATE NOT NULL
);

-- ----------------------------------------------------------------------------
-- 3.5 AUDIT EXECUTION & MANAGEMENT
-- ----------------------------------------------------------------------------

-- Audit Plans (Engagements, Surveillance Schedules & Direct Auditee Details)
CREATE TABLE public.audit_plans (
    id TEXT PRIMARY KEY DEFAULT ('aud_' || replace(uuid_generate_v4()::text, '-', '')),
    audit_number VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    firm_id TEXT NOT NULL REFERENCES public.firm(id) ON DELETE CASCADE,
    firm_template_id TEXT REFERENCES public.firm_templates(id) ON DELETE SET NULL,
    global_template_id TEXT REFERENCES public.global_templates(id) ON DELETE SET NULL,
    auditee_name VARCHAR(255) NOT NULL,
    auditee_code VARCHAR(50),
    auditee_contact_person VARCHAR(255),
    auditee_email VARCHAR(255),
    auditee_phone VARCHAR(50),
    auditee_address TEXT,
    auditee_risk_level risk_level_type DEFAULT 'Low' NOT NULL,
    standard VARCHAR(150) NOT NULL,
    audit_type audit_type_enum DEFAULT 'Surveillance' NOT NULL,
    scope TEXT,
    objectives TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    start_time VARCHAR(20) DEFAULT '09:00',
    end_time VARCHAR(20) DEFAULT '17:00',
    opening_meeting_time VARCHAR(20) DEFAULT '09:30 AM',
    closing_meeting_time VARCHAR(20) DEFAULT '04:30 PM',
    recurrence recurrence_type_enum DEFAULT 'One-Time' NOT NULL,
    location_type location_type_enum DEFAULT 'On-Site' NOT NULL,
    facility_address_or_link TEXT,
    safety_inductions TEXT,
    lead_auditor_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
    status audit_status_type DEFAULT 'Scheduled' NOT NULL,
    overall_score NUMERIC(5,2) CHECK (overall_score IS NULL OR (overall_score >= 0 AND overall_score <= 100)),
    passing_score NUMERIC(5,2) DEFAULT 80.00 CHECK (passing_score >= 0 AND passing_score <= 100),
    executive_summary TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_on DATE DEFAULT CURRENT_DATE NOT NULL,
    last_modified_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_modified_on DATE DEFAULT CURRENT_DATE NOT NULL
);

-- Audit Team Members (Firm Team Roster)
CREATE TABLE public.audit_team_members (
    id TEXT PRIMARY KEY DEFAULT ('atm_' || replace(uuid_generate_v4()::text, '-', '')),
    firm_id TEXT NOT NULL REFERENCES public.firm(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_on DATE DEFAULT CURRENT_DATE NOT NULL,
    UNIQUE (firm_id, user_id)
);

-- Audit Checklist Responses (Evaluation, Scores & Severities per Checklist Question)
CREATE TABLE public.audit_checklist_responses (
    id TEXT PRIMARY KEY DEFAULT ('resp_' || replace(uuid_generate_v4()::text, '-', '')),
    audit_id TEXT NOT NULL REFERENCES public.audit_plans(id) ON DELETE CASCADE,
    firm_question_id TEXT REFERENCES public.firm_questions(id) ON DELETE SET NULL,
    global_question_id TEXT REFERENCES public.global_questions(id) ON DELETE SET NULL,
    requirement_id VARCHAR(50) NOT NULL,
    question_text TEXT NOT NULL,
    status question_response_status_type DEFAULT 'UNANSWERED' NOT NULL,
    compliance_score NUMERIC(5,2) CHECK (compliance_score IS NULL OR (compliance_score >= 0 AND compliance_score <= 100)),
    auditor_comments TEXT,
    evidence_notes TEXT,
    finding_id TEXT,
    severities TEXT[] DEFAULT '{}' NOT NULL,
    answered_by TEXT REFERENCES public.users(id) ON DELETE SET NULL,
    answered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_on DATE DEFAULT CURRENT_DATE NOT NULL,
    last_modified_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_modified_on DATE DEFAULT CURRENT_DATE NOT NULL,
    UNIQUE (audit_id, firm_question_id),
    UNIQUE (audit_id, global_question_id)
);

-- ----------------------------------------------------------------------------
-- 3.6 AUDIT FINDINGS, FINDING RESPONSES & CAPA WORKFLOW
-- ----------------------------------------------------------------------------

-- Audit Findings (Non-Conformances, Observations & Deficiencies)
CREATE TABLE public.audit_findings (
    id TEXT PRIMARY KEY DEFAULT ('fnd_' || replace(uuid_generate_v4()::text, '-', '')),
    finding_number VARCHAR(50) NOT NULL UNIQUE,
    audit_id TEXT NOT NULL REFERENCES public.audit_plans(id) ON DELETE CASCADE,
    firm_question_id TEXT REFERENCES public.firm_questions(id) ON DELETE SET NULL,
    global_question_id TEXT REFERENCES public.global_questions(id) ON DELETE SET NULL,
    requirement_id VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    evidence_notes TEXT,
    severity finding_severity_type DEFAULT 'Minor' NOT NULL,
    status finding_status_type DEFAULT 'Open' NOT NULL,
    category VARCHAR(150) NOT NULL,
    due_date DATE NOT NULL,
    assigned_to_user_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
    logged_by_user_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
    logged_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    capa_id TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_on DATE DEFAULT CURRENT_DATE NOT NULL,
    last_modified_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_modified_on DATE DEFAULT CURRENT_DATE NOT NULL
);

-- Foreign key link from audit_checklist_responses to audit_findings
ALTER TABLE public.audit_checklist_responses
    ADD CONSTRAINT fk_checklist_finding
    FOREIGN KEY (finding_id) REFERENCES public.audit_findings(id) ON DELETE SET NULL;

-- Audit Finding Responses (Formal Auditee Feedback, Disputes, Containment Actions & Auditor Reviews)
CREATE TABLE public.audit_finding_responses (
    id TEXT PRIMARY KEY DEFAULT ('afr_' || replace(uuid_generate_v4()::text, '-', '')),
    finding_id TEXT NOT NULL REFERENCES public.audit_findings(id) ON DELETE CASCADE,
    audit_id TEXT NOT NULL REFERENCES public.audit_plans(id) ON DELETE CASCADE,
    response_type finding_response_type_enum DEFAULT 'Auditee Initial Response' NOT NULL,
    response_text TEXT NOT NULL,
    containment_summary TEXT,
    status_after_response finding_status_type,
    responded_by TEXT REFERENCES public.users(id) ON DELETE SET NULL,
    responded_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_on DATE DEFAULT CURRENT_DATE NOT NULL,
    last_modified_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_modified_on DATE DEFAULT CURRENT_DATE NOT NULL
);

-- Audit Corrective Actions (CAPA, 5-Why RCA & Preventive Action Plans)
CREATE TABLE public.audit_corrective_actions (
    id TEXT PRIMARY KEY DEFAULT ('capa_' || replace(uuid_generate_v4()::text, '-', '')),
    capa_number VARCHAR(50) NOT NULL UNIQUE,
    finding_id TEXT NOT NULL REFERENCES public.audit_findings(id) ON DELETE CASCADE,
    audit_id TEXT NOT NULL REFERENCES public.audit_plans(id) ON DELETE CASCADE,
    five_whys JSONB DEFAULT '[]'::jsonb NOT NULL,
    root_cause_summary TEXT,
    immediate_containment TEXT NOT NULL,
    corrective_action_plan TEXT NOT NULL,
    preventive_action_plan TEXT NOT NULL,
    assigned_owner_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
    target_completion_date DATE NOT NULL,
    status capa_status_type DEFAULT 'Submitted' NOT NULL,
    manager_feedback TEXT,
    review_notes TEXT,
    reviewed_by TEXT REFERENCES public.users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    submitted_by TEXT REFERENCES public.users(id) ON DELETE SET NULL,
    submitted_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_on DATE DEFAULT CURRENT_DATE NOT NULL,
    last_modified_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_modified_on DATE DEFAULT CURRENT_DATE NOT NULL
);

-- Foreign key link from audit_findings to audit_corrective_actions
ALTER TABLE public.audit_findings
    ADD CONSTRAINT fk_findings_capa
    FOREIGN KEY (capa_id) REFERENCES public.audit_corrective_actions(id) ON DELETE SET NULL;

-- ----------------------------------------------------------------------------
-- 3.7 ATTACHMENTS & AUDIT TRAIL
-- ----------------------------------------------------------------------------

-- Audit Attachments (Evidence Documents, Response Artifacts, CAPA Verification Proofs)
CREATE TABLE public.audit_attachments (
    id TEXT PRIMARY KEY DEFAULT ('att_' || replace(uuid_generate_v4()::text, '-', '')),
    audit_id TEXT REFERENCES public.audit_plans(id) ON DELETE CASCADE,
    finding_id TEXT REFERENCES public.audit_findings(id) ON DELETE CASCADE,
    finding_response_id TEXT REFERENCES public.audit_finding_responses(id) ON DELETE CASCADE,
    checklist_response_id TEXT REFERENCES public.audit_checklist_responses(id) ON DELETE CASCADE,
    capa_id TEXT REFERENCES public.audit_corrective_actions(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_size VARCHAR(50) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    uploaded_by TEXT REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_on DATE DEFAULT CURRENT_DATE NOT NULL
);

-- Immutable Governance Audit Trail
CREATE TABLE public.audit_logs (
    id TEXT PRIMARY KEY DEFAULT ('log_' || replace(uuid_generate_v4()::text, '-', '')),
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id TEXT NOT NULL,
    details TEXT NOT NULL,
    user_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
    ip_address VARCHAR(50) DEFAULT '127.0.0.1',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_on DATE DEFAULT CURRENT_DATE NOT NULL
);

-- ----------------------------------------------------------------------------
-- 4. MASTER DATA PRE-POPULATION (GLOBAL STANDARD TEMPLATES)
-- ----------------------------------------------------------------------------

-- 4.1 Global Template: ISO 9001:2015 Quality Management Systems
INSERT INTO public.global_templates (id, code, title, standard, industry, version, passing_score, tags, description)
VALUES (
    'gtmpl_iso9001',
    'ISO-9001-2015',
    'ISO 9001:2015 Quality Management System',
    'ISO 9001:2015',
    'Cross-Industry / Manufacturing',
    '2015.1',
    80.00,
    ARRAY['QMS', 'Quality', 'ISO 9001', 'Standard'],
    'International standard that specifies requirements for a quality management system (QMS).'
) ON CONFLICT (code) DO NOTHING;

-- Global Sections for ISO 9001
INSERT INTO public.global_sections (id, global_template_id, title, description, weight, order_index)
VALUES
    ('gsec_iso9001_s4', 'gtmpl_iso9001', 'Clause 4: Context of the Organization', 'Understanding organization context, stakeholders, and QMS scope.', 20.00, 1),
    ('gsec_iso9001_s5', 'gtmpl_iso9001', 'Clause 5: Leadership & Commitment', 'Leadership accountability, quality policy, and organizational roles.', 20.00, 2),
    ('gsec_iso9001_s6', 'gtmpl_iso9001', 'Clause 6: Planning for the QMS', 'Actions to address risks and opportunities, quality objectives.', 20.00, 3),
    ('gsec_iso9001_s7', 'gtmpl_iso9001', 'Clause 7: Support & Resources', 'Resources, competence, awareness, and documented information.', 20.00, 4),
    ('gsec_iso9001_s8', 'gtmpl_iso9001', 'Clause 8: Operation & Execution', 'Operational planning, control, and nonconforming output management.', 20.00, 5)
ON CONFLICT (id) DO NOTHING;

-- Global Questions for ISO 9001
INSERT INTO public.global_questions (id, global_section_id, requirement_id, question, guidance, scoring_type, weight, mandatory, order_index)
VALUES
    ('gq_iso9001_41', 'gsec_iso9001_s4', 'ISO 9001: 4.1', 'Has the organization determined external and internal issues relevant to its purpose and strategic direction?', 'Review internal SWOT/PESTLE analysis and regular management review notes.', 'PASS_FAIL', 10.00, true, 1),
    ('gq_iso9001_51', 'gsec_iso9001_s5', 'ISO 9001: 5.1.1', 'Does top management demonstrate leadership and commitment with respect to the QMS?', 'Check leadership interviews and evidence of resource allocation.', 'PASS_FAIL', 10.00, true, 1),
    ('gq_iso9001_61', 'gsec_iso9001_s6', 'ISO 9001: 6.1.1', 'Are risks and opportunities addressed to give assurance that the QMS can achieve intended results?', 'Inspect risk assessment matrix and risk treatment plans.', 'PASS_FAIL', 10.00, true, 1),
    ('gq_iso9001_75', 'gsec_iso9001_s7', 'ISO 9001: 7.5.3', 'Is documented information controlled to ensure it is available, suitable, and adequately protected?', 'Verify version control, distribution list, and approval stamps.', 'PASS_FAIL', 10.00, true, 1),
    ('gq_iso9001_87', 'gsec_iso9001_s8', 'ISO 9001: 8.7.1', 'Does the organization ensure outputs that do not conform are identified and controlled?', 'Verify nonconformance quarantine areas, rejection logs, and disposition records.', 'PASS_FAIL', 10.00, true, 1)
ON CONFLICT (id) DO NOTHING;

-- 4.2 Global Template: SOC 2 Type II Security & Trust Principles
INSERT INTO public.global_templates (id, code, title, standard, industry, version, passing_score, tags, description)
VALUES (
    'gtmpl_soc2',
    'SOC2-TYPE-2',
    'SOC 2 Type II Security & Compliance Checklist',
    'AICPA SOC 2',
    'Cloud & Technology',
    '2024.1',
    85.00,
    ARRAY['SOC 2', 'Trust Principles', 'Security', 'Cloud'],
    'AICPA Trust Services Criteria for Security, Availability, and Confidentiality.'
) ON CONFLICT (code) DO NOTHING;

-- Global Sections for SOC 2
INSERT INTO public.global_sections (id, global_template_id, title, description, weight, order_index)
VALUES
    ('gsec_soc2_cc6', 'gtmpl_soc2', 'CC6: Logical and Physical Access Controls', 'User access management, credential protection, and MFA.', 50.00, 1),
    ('gsec_soc2_cc7', 'gtmpl_soc2', 'CC7: System Operations & Monitoring', 'Infrastructure vulnerability management and incident detection.', 50.00, 2)
ON CONFLICT (id) DO NOTHING;

-- Global Questions for SOC 2
INSERT INTO public.global_questions (id, global_section_id, requirement_id, question, guidance, scoring_type, weight, mandatory, order_index)
VALUES
    ('gq_soc2_cc61', 'gsec_soc2_cc6', 'SOC 2: CC6.1', 'Are logical access credentials and MFA enforced for all production system administrative access?', 'Inspect SSO configurations, IAM policies, and active privileged accounts.', 'PASS_FAIL', 15.00, true, 1),
    ('gq_soc2_cc71', 'gsec_soc2_cc7', 'SOC 2: CC7.1', 'Are automated vulnerability scanners executed continuously with critical patches deployed within 14 days?', 'Review vulnerability reports and change management tickets.', 'PASS_FAIL', 15.00, true, 1)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 5. AUTO-UPDATING TIMESTAMP TRIGGERS
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_last_modified_columns()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_modified_at = timezone('utc'::text, now());
    NEW.last_modified_on = CURRENT_DATE;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ 
DECLARE 
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND column_name = 'last_modified_at'
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS trigger_set_last_modified ON public.%I;
            CREATE TRIGGER trigger_set_last_modified
            BEFORE UPDATE ON public.%I
            FOR EACH ROW
            EXECUTE FUNCTION public.update_last_modified_columns();
        ', t, t);
    END LOOP;
END $$;

-- ----------------------------------------------------------------------------
-- 6. HIGH-PERFORMANCE INDEXES
-- ----------------------------------------------------------------------------

-- Firm & Users
CREATE INDEX idx_firm_code ON public.firm(code);
CREATE INDEX idx_firm_is_active ON public.firm(is_active);
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_user_firms_user ON public.user_firms(user_id);
CREATE INDEX idx_user_firms_firm ON public.user_firms(firm_id);
CREATE INDEX idx_users_role ON public.users(role);

-- Global Template Hierarchy
CREATE INDEX idx_global_templates_code ON public.global_templates(code);
CREATE INDEX idx_global_templates_standard ON public.global_templates(standard);
CREATE INDEX idx_global_templates_is_active ON public.global_templates(is_active);
CREATE INDEX idx_global_sections_template ON public.global_sections(global_template_id);
CREATE INDEX idx_global_sections_order ON public.global_sections(global_template_id, order_index);
CREATE INDEX idx_global_questions_section ON public.global_questions(global_section_id);
CREATE INDEX idx_global_questions_order ON public.global_questions(global_section_id, order_index);
CREATE INDEX idx_global_questions_req ON public.global_questions(requirement_id);

-- Firm Template Hierarchy
CREATE INDEX idx_firm_templates_firm ON public.firm_templates(firm_id);
CREATE INDEX idx_firm_templates_global_parent ON public.firm_templates(global_template_id);
CREATE INDEX idx_firm_templates_code ON public.firm_templates(firm_id, code);
CREATE INDEX idx_firm_templates_standard ON public.firm_templates(standard);
CREATE INDEX idx_firm_templates_is_active ON public.firm_templates(is_active);
CREATE INDEX idx_firm_sections_template ON public.firm_sections(firm_template_id);
CREATE INDEX idx_firm_sections_order ON public.firm_sections(firm_template_id, order_index);
CREATE INDEX idx_firm_questions_section ON public.firm_questions(firm_section_id);
CREATE INDEX idx_firm_questions_order ON public.firm_questions(firm_section_id, order_index);
CREATE INDEX idx_firm_questions_req ON public.firm_questions(requirement_id);

-- Audit Plans & Team
CREATE INDEX idx_audit_plans_number ON public.audit_plans(audit_number);
CREATE INDEX idx_audit_plans_firm ON public.audit_plans(firm_id);
CREATE INDEX idx_audit_plans_firm_template ON public.audit_plans(firm_template_id);
CREATE INDEX idx_audit_plans_global_template ON public.audit_plans(global_template_id);
CREATE INDEX idx_audit_plans_lead_auditor ON public.audit_plans(lead_auditor_id);
CREATE INDEX idx_audit_plans_status ON public.audit_plans(status);
CREATE INDEX idx_audit_team_firm ON public.audit_team_members(firm_id);
CREATE INDEX idx_audit_team_user ON public.audit_team_members(user_id);

-- Audit Checklist Responses
CREATE INDEX idx_audit_chk_responses_audit ON public.audit_checklist_responses(audit_id);
CREATE INDEX idx_audit_chk_responses_firm_q ON public.audit_checklist_responses(firm_question_id);
CREATE INDEX idx_audit_chk_responses_global_q ON public.audit_checklist_responses(global_question_id);
CREATE INDEX idx_audit_chk_responses_status ON public.audit_checklist_responses(status);

-- Audit Findings, Responses & CAPA
CREATE INDEX idx_audit_findings_audit ON public.audit_findings(audit_id);
CREATE INDEX idx_audit_findings_status ON public.audit_findings(status);
CREATE INDEX idx_audit_findings_severity ON public.audit_findings(severity);
CREATE INDEX idx_audit_findings_due_date ON public.audit_findings(due_date);
CREATE INDEX idx_audit_finding_responses_finding ON public.audit_finding_responses(finding_id);
CREATE INDEX idx_audit_finding_responses_audit ON public.audit_finding_responses(audit_id);
CREATE INDEX idx_audit_finding_responses_user ON public.audit_finding_responses(responded_by);
CREATE INDEX idx_audit_corrective_actions_finding ON public.audit_corrective_actions(finding_id);
CREATE INDEX idx_audit_corrective_actions_audit ON public.audit_corrective_actions(audit_id);
CREATE INDEX idx_audit_corrective_actions_status ON public.audit_corrective_actions(status);

-- Audit Attachments & Logs
CREATE INDEX idx_audit_attachments_audit ON public.audit_attachments(audit_id);
CREATE INDEX idx_audit_attachments_finding ON public.audit_attachments(finding_id);
CREATE INDEX idx_audit_attachments_finding_resp ON public.audit_attachments(finding_response_id);
CREATE INDEX idx_audit_attachments_chk_resp ON public.audit_attachments(checklist_response_id);
CREATE INDEX idx_audit_attachments_capa ON public.audit_attachments(capa_id);
CREATE INDEX idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- GIN Indexes for Array & JSONB Search
CREATE INDEX idx_global_templates_tags_gin ON public.global_templates USING GIN (tags);
CREATE INDEX idx_firm_templates_tags_gin ON public.firm_templates USING GIN (tags);
CREATE INDEX idx_audit_checklist_resp_severities_gin ON public.audit_checklist_responses USING GIN (severities);
CREATE INDEX idx_audit_corrective_actions_five_whys_gin ON public.audit_corrective_actions USING GIN (five_whys);

-- ----------------------------------------------------------------------------
-- 7. NORMALIZED DATABASE VIEWS (FOR EASY FRONTEND QUERIES)
-- ----------------------------------------------------------------------------

-- View: Complete Global Template Hierarchy (Template -> Sections -> Questions)
CREATE OR REPLACE VIEW public.view_global_template_hierarchy AS
SELECT 
    gt.id AS global_template_id,
    gt.code AS template_code,
    gt.title AS template_title,
    gt.standard,
    gt.industry,
    gt.version,
    gt.passing_score,
    gt.tags,
    gt.is_active,
    COALESCE(
        jsonb_agg(
            DISTINCT jsonb_build_object(
                'section_id', gs.id,
                'section_title', gs.title,
                'order_index', gs.order_index,
                'weight', gs.weight,
                'questions_count', (
                    SELECT COUNT(*) FROM public.global_questions gq WHERE gq.global_section_id = gs.id
                )
            )
        ) FILTER (WHERE gs.id IS NOT NULL),
        '[]'::jsonb
    ) AS sections,
    COUNT(DISTINCT gs.id) AS total_sections_count,
    COUNT(DISTINCT gq.id) AS total_questions_count
FROM public.global_templates gt
LEFT JOIN public.global_sections gs ON gt.id = gs.global_template_id
LEFT JOIN public.global_questions gq ON gs.id = gq.global_section_id
GROUP BY gt.id;

-- View: Complete Firm Template Hierarchy (Template -> Sections -> Questions)
CREATE OR REPLACE VIEW public.view_firm_template_hierarchy AS
SELECT 
    ft.id AS firm_template_id,
    ft.firm_id,
    f.name AS firm_name,
    ft.global_template_id,
    ft.code AS template_code,
    ft.title AS template_title,
    ft.standard,
    ft.industry,
    ft.version,
    ft.passing_score,
    ft.is_custom,
    ft.is_active,
    COALESCE(
        jsonb_agg(
            DISTINCT jsonb_build_object(
                'section_id', fs.id,
                'section_title', fs.title,
                'order_index', fs.order_index,
                'weight', fs.weight,
                'questions_count', (
                    SELECT COUNT(*) FROM public.firm_questions fq WHERE fq.firm_section_id = fs.id
                )
            )
        ) FILTER (WHERE fs.id IS NOT NULL),
        '[]'::jsonb
    ) AS sections,
    COUNT(DISTINCT fs.id) AS total_sections_count,
    COUNT(DISTINCT fq.id) AS total_questions_count
FROM public.firm_templates ft
JOIN public.firm f ON ft.firm_id = f.id
LEFT JOIN public.firm_sections fs ON ft.id = fs.firm_template_id
LEFT JOIN public.firm_questions fq ON fs.id = fq.firm_section_id
GROUP BY ft.id, f.name;

-- View: Complete Audit Firm Profile with Aggregated Templates and Active Staff
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

-- View: Audit Engagement Summary with Auditee, Firm, Lead Auditor, Team & Finding Counts
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

-- ----------------------------------------------------------------------------
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------
ALTER TABLE public.firm ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.firm_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.firm_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.firm_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_checklist_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_finding_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_corrective_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Operational Read/Write Security Policies
CREATE POLICY "Allow public read-write for AMS operations" ON public.firm FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for AMS operations" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for AMS operations" ON public.global_templates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for AMS operations" ON public.global_sections FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for AMS operations" ON public.global_questions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for AMS operations" ON public.firm_templates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for AMS operations" ON public.firm_sections FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for AMS operations" ON public.firm_questions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for AMS operations" ON public.audit_plans FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for AMS operations" ON public.audit_team_members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for AMS operations" ON public.audit_checklist_responses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for AMS operations" ON public.audit_findings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for AMS operations" ON public.audit_finding_responses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for AMS operations" ON public.audit_corrective_actions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for AMS operations" ON public.audit_attachments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for AMS operations" ON public.audit_logs FOR ALL USING (true) WITH CHECK (true);
