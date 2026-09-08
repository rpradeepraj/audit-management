-- ============================================================================
-- AUDIT MANAGEMENT SYSTEM (AMS) - PRODUCTION SEED DATA
-- ============================================================================
-- Fully populated relational dataset including:
--   1. Audit Firms (Certification Bodies & Assurance Agencies)
--   2. Users (Platform Admins, Firm Admins, Lead Auditors, Auditors & Auditees)
--   3. Global Templates, Sections & Clauses (ISO 9001, ISO 27001, ISO 14001, GMP, SOC 2, etc.)
--   4. Firm Customized Templates, Sections & Questions
--   5. Audit Plans & Engagements (Multi-status: Scheduled, In Progress, Completed, Closed)
--   6. Audit Team Assignments
--   7. Checklist Evaluations & Compliance Scores
--   8. Audit Findings & Non-Conformances
--   9. Auditee Finding Responses & Containment Notes
--  10. Corrective & Preventive Action Plans (CAPA & 5-Why Root Cause Analysis)
--  11. Evidence Attachments & Verification Proofs
--  12. System Audit Trail Logs
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. AUDIT FIRMS
-- ----------------------------------------------------------------------------
INSERT INTO public.firm (
    id, code, name, contact_email, phone, address, website, established_year, quality_policy, is_active
) VALUES 
(
    'firm_veritas',
    'VAP-GLOBAL',
    'Veritas Assurance Partners',
    'governance@veritasassurance.com',
    '+1 (800) 555-8374',
    '450 Assurance Blvd, Suite 800, Global QA Tower, New York, NY 10001',
    'https://www.veritasassurance.com',
    '2014',
    'Committed to delivering uncompromising impartiality, rigorous evidence-backed compliance verification, and continuous improvement for enterprise quality ecosystems.',
    true
),
(
    'firm_apex_cert',
    'ACS-CORP',
    'Apex Certification Services',
    'audit-board@apexcert.co.uk',
    '+44 20 7946 0912',
    '25 Gresham Street, 4th Floor, London EC2V 7HN, United Kingdom',
    'https://www.apexcert.co.uk',
    '2017',
    'Championing sustainable compliance, industrial safety, and supply chain transparency with accredited European surveillance oversight.',
    true
),
(
    'firm_cyber_guard',
    'CGCR-SEC',
    'CyberGuard Compliance Registrars',
    'assessments@cyberguardregistrars.io',
    '+1 (415) 555-0182',
    '101 California St, Suite 2800, San Francisco, CA 94111',
    'https://www.cyberguardregistrars.io',
    '2019',
    'Ensuring uncompromising cyber resilience, cryptographic verification, and independent SOC 2 / ISO 27001 evaluation.',
    true
),
(
    'firm_pharma_qual',
    'PBGA-GMP',
    'PharmaBio Global Audits',
    'quality-oversight@pharmabioglobal.ch',
    '+41 22 819 9200',
    'Chemin des Mines 2, 1202 Geneva, Switzerland',
    'https://www.pharmabioglobal.ch',
    '2016',
    'Dedicated to life science compliance, sterile product safety, and zero-compromise patient risk mitigation.',
    true
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    contact_email = EXCLUDED.contact_email,
    quality_policy = EXCLUDED.quality_policy;

-- ----------------------------------------------------------------------------
-- 2. USERS & CREDENTIALS
-- ----------------------------------------------------------------------------
INSERT INTO public.users (
    id, email, password_hash, name, role, phone, avatar, firm_id, is_active
) VALUES
(
    'usr_admin_01',
    'admin@auditmanagement.com',
    crypt('password123', gen_salt('bf')),
    'Elena Rostova',
    'Platform Admin',
    '+1 (555) 019-2831',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'firm_veritas',
    true
),
(
    'usr_veritas_dir',
    'david.vance@veritasassurance.com',
    crypt('password123', gen_salt('bf')),
    'Dr. David Vance',
    'Company Admin',
    '+1 (555) 019-4472',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'firm_veritas',
    true
),
(
    'usr_lead_marcus',
    'marcus.chen@veritasassurance.com',
    crypt('password123', gen_salt('bf')),
    'Marcus Chen',
    'Lead Auditor',
    '+1 (555) 019-7723',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    'firm_veritas',
    true
),
(
    'usr_auditor_sarah',
    'sarah.jenkins@veritasassurance.com',
    crypt('password123', gen_salt('bf')),
    'Sarah Jenkins',
    'Auditor',
    '+1 (555) 019-9941',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    'firm_veritas',
    true
),
(
    'usr_apex_lead_emma',
    'emma.watson@apexcert.co.uk',
    crypt('password123', gen_salt('bf')),
    'Emma Watson',
    'Lead Auditor',
    '+44 20 7946 0111',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    'firm_apex_cert',
    true
),
(
    'usr_cyber_alex',
    'alex.rivera@cyberguardregistrars.io',
    crypt('password123', gen_salt('bf')),
    'Alex Rivera',
    'Audit Manager',
    '+1 (415) 555-8832',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    'firm_cyber_guard',
    true
),
(
    'usr_pharma_claire',
    'claire.dubois@pharmabioglobal.ch',
    crypt('password123', gen_salt('bf')),
    'Dr. Claire Dubois',
    'Lead Auditor',
    '+41 22 819 9233',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    'firm_pharma_qual',
    true
),
(
    'usr_auditee_michael',
    'michael.ross@novapharma.com',
    crypt('password123', gen_salt('bf')),
    'Michael Ross',
    'Auditee Representative',
    '+1 (555) 882-9912',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    NULL,
    true
),
(
    'usr_auditee_priya',
    'priya.sharma@cloudscale.io',
    crypt('password123', gen_salt('bf')),
    'Priya Sharma',
    'Auditee Representative',
    '+1 (555) 341-9988',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    NULL,
    true
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    avatar = EXCLUDED.avatar;

-- ----------------------------------------------------------------------------
-- 3. GLOBAL TEMPLATE CATALOG (STANDARDS & CONTROLS)
-- ----------------------------------------------------------------------------

-- 3.1 ISO 27001:2022 Information Security Management System
INSERT INTO public.global_templates (
    id, code, title, standard, industry, version, passing_score, tags, description, created_by
) VALUES (
    'gtmpl_iso27001',
    'ISO-27001-2022',
    'ISO/IEC 27001:2022 Information Security Management System',
    'ISO/IEC 27001:2022',
    'Information Technology / Cyber Security',
    '2022.2',
    85.00,
    ARRAY['ISMS', 'Security', 'ISO 27001', 'Annex A', 'Cyber'],
    'International standard for information security management systems covering Annex A controls and organizational risk governance.',
    'usr_admin_01'
) ON CONFLICT (code) DO NOTHING;

INSERT INTO public.global_sections (id, global_template_id, title, description, weight, order_index)
VALUES
    ('gsec_iso27001_s5', 'gtmpl_iso27001', 'Annex A.5: Organizational Controls', 'Policies for information security, threat intelligence, and cloud services.', 25.00, 1),
    ('gsec_iso27001_s6', 'gtmpl_iso27001', 'Annex A.6: People Controls', 'Screening, terms of employment, awareness training, and remote working.', 25.00, 2),
    ('gsec_iso27001_s8', 'gtmpl_iso27001', 'Annex A.8: Technological Controls', 'Privileged access, secure coding, data leakage prevention, and backup.', 50.00, 3)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.global_questions (id, global_section_id, requirement_id, question, guidance, scoring_type, weight, mandatory, order_index)
VALUES
    ('gq_iso27001_51', 'gsec_iso27001_s5', 'ISO 27001: A.5.1', 'Are information security policies defined, approved by management, and communicated to personnel?', 'Review ISMS board approval records and annual policy review dates.', 'PASS_FAIL', 10.00, true, 1),
    ('gq_iso27001_63', 'gsec_iso27001_s6', 'ISO 27001: A.6.3', 'Do all employees and contractors receive appropriate information security awareness training?', 'Verify quarterly security training completion certificates and simulated phishing statistics.', 'PASS_FAIL', 10.00, true, 1),
    ('gq_iso27001_82', 'gsec_iso27001_s8', 'ISO 27001: A.8.2', 'Is privileged access rights allocation strictly restricted and controlled via MFA and PAM?', 'Audit root/admin access logs, PAM session recordings, and quarterly entitlement reviews.', 'PASS_FAIL', 15.00, true, 1),
    ('gq_iso27001_812', 'gsec_iso27001_s8', 'ISO 27001: A.8.12', 'Are data leakage prevention (DLP) controls applied to sensitive data across endpoints and egress gateways?', 'Inspect endpoint DLP configurations, USB blocking policies, and cloud CASB policies.', 'PASS_FAIL', 15.00, true, 2)
ON CONFLICT (id) DO NOTHING;

-- 3.2 EU & US FDA Good Manufacturing Practice (GMP)
INSERT INTO public.global_templates (
    id, code, title, standard, industry, version, passing_score, tags, description, created_by
) VALUES (
    'gtmpl_gmp_pharma',
    'EU-GMP-VOL4',
    'EU GMP Vol 4 & FDA 21 CFR 211 Good Manufacturing Practice',
    'EU GMP Vol 4 / 21 CFR Part 211',
    'Pharmaceuticals & Biotechnology',
    '2024.1',
    90.00,
    ARRAY['GMP', 'Pharma', 'Cleanroom', 'FDA', 'EU Vol 4', 'Sterility'],
    'Stringent regulatory standard governing medicinal product manufacturing, sterile facilities, cleanrooms, and data integrity.',
    'usr_admin_01'
) ON CONFLICT (code) DO NOTHING;

INSERT INTO public.global_sections (id, global_template_id, title, description, weight, order_index)
VALUES
    ('gsec_gmp_s1', 'gtmpl_gmp_pharma', 'Chapter 1: Pharmaceutical Quality System', 'Quality risk management, product quality reviews, and change control.', 30.00, 1),
    ('gsec_gmp_s3', 'gtmpl_gmp_pharma', 'Chapter 3: Premises & Cleanroom Equipment', 'HVAC differential pressure, particulate monitoring, and cross-contamination prevention.', 35.00, 2),
    ('gsec_gmp_s4', 'gtmpl_gmp_pharma', 'Chapter 4: Documentation & ALCOA+ Data Integrity', 'Batch manufacturing records, electronic signatures, and audit trails.', 35.00, 3)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.global_questions (id, global_section_id, requirement_id, question, guidance, scoring_type, weight, mandatory, order_index)
VALUES
    ('gq_gmp_11', 'gsec_gmp_s1', 'GMP: 1.4', 'Is a comprehensive Pharmaceutical Quality System established with active senior management oversight?', 'Inspect Quality Manual, PQR cadence, and CAPA effectiveness trends.', 'PASS_FAIL', 15.00, true, 1),
    ('gq_gmp_32', 'gsec_gmp_s3', 'GMP: 3.12', 'Are Grade A/B aseptic cleanroom areas maintained under continuous differential pressure and particle monitoring?', 'Inspect BMS differential pressure delta graphs, smoke study videos, and HEPA filter certs.', 'PASS_FAIL', 20.00, true, 1),
    ('gq_gmp_41', 'gsec_gmp_s4', 'GMP: 4.8', 'Are electronic batch manufacturing records (eBMR) fully compliant with 21 CFR Part 11 ALCOA+ principles?', 'Verify system audit trail review SOPs, unique logins, and non-modifiable audit logs.', 'PASS_FAIL', 20.00, true, 1)
ON CONFLICT (id) DO NOTHING;

-- 3.3 ISO 14001:2015 Environmental Management Systems
INSERT INTO public.global_templates (
    id, code, title, standard, industry, version, passing_score, tags, description, created_by
) VALUES (
    'gtmpl_iso14001',
    'ISO-14001-2015',
    'ISO 14001:2015 Environmental Management System',
    'ISO 14001:2015',
    'Environmental / Energy / Industrial',
    '2015.1',
    80.00,
    ARRAY['EMS', 'Environmental', 'ISO 14001', 'Sustainability', 'Waste'],
    'Framework to protect the environment and respond to changing environmental conditions in balance with socio-economic needs.',
    'usr_admin_01'
) ON CONFLICT (code) DO NOTHING;

INSERT INTO public.global_sections (id, global_template_id, title, description, weight, order_index)
VALUES
    ('gsec_iso14001_s6', 'gtmpl_iso14001', 'Clause 6: Environmental Planning & Aspects', 'Identification of environmental aspects, life cycle impacts, and compliance obligations.', 50.00, 1),
    ('gsec_iso14001_s8', 'gtmpl_iso14001', 'Clause 8: Operation & Emergency Preparedness', 'Operational control of effluent, air emissions, hazardous waste, and spill response.', 50.00, 2)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.global_questions (id, global_section_id, requirement_id, question, guidance, scoring_type, weight, mandatory, order_index)
VALUES
    ('gq_iso14001_612', 'gsec_iso14001_s6', 'ISO 14001: 6.1.2', 'Has the organization identified significant environmental aspects from a life cycle perspective?', 'Review aspects register, emission inventories, and risk scoring methodology.', 'PASS_FAIL', 15.00, true, 1),
    ('gq_iso14001_82', 'gsec_iso14001_s8', 'ISO 14001: 8.2', 'Are emergency preparedness procedures tested periodically for chemical spills and hazardous release?', 'Review drill reports, spill kit inspections, and local fire department coordination.', 'PASS_FAIL', 15.00, true, 1)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 4. FIRM CUSTOMIZED TEMPLATES (FIRM PROPRIETARY CHECKLISTS)
-- ----------------------------------------------------------------------------
INSERT INTO public.firm_templates (
    id, firm_id, global_template_id, code, title, standard, industry, version, passing_score, tags, description, is_custom, created_by
) VALUES
(
    'ftmpl_veritas_qms',
    'firm_veritas',
    'gtmpl_iso9001',
    'VAP-QMS-2026',
    'Veritas Enterprise ISO 9001 Quality Audit Framework',
    'ISO 9001:2015',
    'Manufacturing & Enterprise Technology',
    '3.2',
    82.00,
    ARRAY['Veritas Spec', 'QMS', 'ISO 9001'],
    'Veritas proprietary enterprise quality audit protocol with enhanced statistical process control and supplier risk criteria.',
    true,
    'usr_veritas_dir'
),
(
    'ftmpl_cyber_cloud_soc2',
    'firm_cyber_guard',
    'gtmpl_soc2',
    'CG-SOC2-CLOUD',
    'CyberGuard Cloud Security & SOC 2 Continuous Surveillance',
    'AICPA SOC 2 Type II',
    'FinTech & Multi-Tenant SaaS',
    '2026.1',
    88.00,
    ARRAY['CyberGuard', 'SOC 2', 'Cloud Security', 'Zero Trust'],
    'Rigorous cloud security framework with automated CI/CD pipeline checks and secrets management auditing.',
    true,
    'usr_cyber_alex'
),
(
    'ftmpl_pharma_sterile_gmp',
    'firm_pharma_qual',
    'gtmpl_gmp_pharma',
    'PBGA-STERILE-GMP',
    'PharmaBio Aseptic Cleanroom & Biotech GMP Protocol',
    'EU GMP Vol 4 / 21 CFR Part 211',
    'Biotech & Sterile Injectables',
    '4.0',
    92.00,
    ARRAY['PharmaBio', 'Aseptic', 'Cleanroom', 'Data Integrity'],
    'Specialized protocol for parenteral medicinal manufacturing, environmental monitoring, and isolator technologies.',
    true,
    'usr_pharma_claire'
)
ON CONFLICT (id) DO NOTHING;

-- Firm Sections & Questions for Veritas QMS
INSERT INTO public.firm_sections (id, firm_template_id, global_section_id, title, description, weight, order_index)
VALUES
    ('fsec_vqms_s1', 'ftmpl_veritas_qms', 'gsec_iso9001_s4', 'Clause 4: Organizational Context & Risk Horizon', 'Assessment of organizational strategic objectives and stakeholder requirements.', 20.00, 1),
    ('fsec_vqms_s2', 'ftmpl_veritas_qms', 'gsec_iso9001_s8', 'Clause 8: Operations & Process Capability (Cpk)', 'Manufacturing control plans, machine calibration, and poka-yoke validation.', 40.00, 2),
    ('fsec_vqms_s3', 'ftmpl_veritas_qms', 'gsec_iso9001_s7', 'Clause 7: Metrology & Calibration Traceability', 'NIST traceable calibration standards and gauge R&R studies.', 40.00, 3)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.firm_questions (id, firm_section_id, global_question_id, requirement_id, question, guidance, scoring_type, weight, mandatory, order_index)
VALUES
    ('fq_vqms_41', 'fsec_vqms_s1', 'gq_iso9001_41', 'VAP-QMS: 4.1', 'Has the business established verifiable internal and external risk registers with annual executive reviews?', 'Check risk matrix, mitigation SLAs, and executive committee sign-off.', 'PASS_FAIL', 10.00, true, 1),
    ('fq_vqms_82', 'fsec_vqms_s2', 'gq_iso9001_87', 'VAP-QMS: 8.5.1', 'Are all critical manufacturing processes monitored via real-time Statistical Process Control (SPC) with Cpk >= 1.33?', 'Review control charts, out-of-control action plans (OCAP), and first-pass yield reports.', 'PASS_FAIL', 15.00, true, 1),
    ('fq_vqms_715', 'fsec_vqms_s3', 'gq_iso9001_75', 'VAP-QMS: 7.1.5', 'Are all inspection and measuring equipment calibrated against accredited national/international standards (NIST)?', 'Check calibration certificates, out-of-calibration impact assessments, and tool quarantine lockers.', 'PASS_FAIL', 15.00, true, 1)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 5. AUDIT PLANS (ENGAGEMENTS ACROSS AUDITEES)
-- ----------------------------------------------------------------------------
INSERT INTO public.audit_plans (
    id, audit_number, title, firm_id, firm_template_id, global_template_id,
    auditee_name, auditee_code, auditee_contact_person, auditee_email, auditee_phone,
    auditee_address, auditee_risk_level, standard, audit_type, scope, objectives,
    start_date, end_date, start_time, end_time, opening_meeting_time, closing_meeting_time,
    recurrence, location_type, facility_address_or_link, safety_inductions,
    lead_auditor_id, status, overall_score, passing_score, executive_summary
) VALUES
(
    'aud_plan_001',
    'AUD-2026-9001',
    'NovaPharma Cleanroom ISO 9001 & GMP Annual Surveillance',
    'firm_veritas',
    'ftmpl_veritas_qms',
    'gtmpl_iso9001',
    'NovaPharma Life Sciences LLC',
    'CUST-NP-001',
    'Michael Ross (VP Quality Assurance)',
    'michael.ross@novapharma.com',
    '+1 (555) 882-9912',
    'Building 4B, BioTech Park, Cambridge, MA 02142',
    'Medium',
    'ISO 9001:2015',
    'Surveillance',
    'Full facility surveillance audit covering primary manufacturing cleanrooms, sterile buffer zones, raw material testing labs, and batch release protocols.',
    'Verify adherence to ISO 9001:2015 Clause 4 through 8, examine calibration logs, and evaluate resolution of previous non-conformances.',
    '2026-03-15',
    '2026-03-18',
    '08:30',
    '17:30',
    '09:00 AM',
    '04:30 PM',
    'Annual Surveillance',
    'On-Site',
    'NovaPharma Campus, Facility 4B Cleanroom Complex, Cambridge, MA',
    'Mandatory cleanroom gowning induction, sterile shoe covers, safety glasses, and chemical hazard orientation prior to entry.',
    'usr_lead_marcus',
    'In Progress',
    78.50,
    80.00,
    'Surveillance audit active. Cleanroom operational parameters in compliance; non-conformance identified in autoclave temperature sensor calibration interval.'
),
(
    'aud_plan_002',
    'AUD-2026-27001',
    'CloudScale Systems SOC 2 & ISO 27001 Security Recertification',
    'firm_cyber_guard',
    'ftmpl_cyber_cloud_soc2',
    'gtmpl_iso27001',
    'CloudScale Infrastructure Inc',
    'CUST-CS-002',
    'Priya Sharma (Chief Information Security Officer)',
    'priya.sharma@cloudscale.io',
    '+1 (555) 341-9988',
    '500 Cloud Parkway, Floor 12, Seattle, WA 98101',
    'Low',
    'ISO/IEC 27001:2022',
    'Certification',
    'Production AWS multi-region infrastructure, Kubernetes control planes, customer data isolation, zero-trust IAM, and GitHub Actions CI/CD deployment pipelines.',
    'Perform complete certification audit against ISO/IEC 27001:2022 Annex A controls and AICPA Trust Services Criteria CC6 and CC7.',
    '2026-02-10',
    '2026-02-14',
    '09:00',
    '18:00',
    '09:30 AM',
    '05:00 PM',
    'One-Time',
    'Remote',
    'https://meet.secure-audits.io/cloudscale-2026-eval',
    'Auditors granted read-only AWS CloudTrail, Datadog audit dashboards, and Okta privileged access audit tokens.',
    'usr_cyber_alex',
    'Completed',
    94.00,
    85.00,
    'Recertification successfully completed with distinction. All access controls, automated vulnerability scans, and CI/CD security gates conform to standard.'
),
(
    'aud_plan_003',
    'AUD-2026-14001',
    'Titan Automotive Environmental & Waste Discharge Surveillance',
    'firm_apex_cert',
    NULL,
    'gtmpl_iso14001',
    'Titan Heavy Industries Ltd',
    'CUST-THI-003',
    'Arthur Pendelton (Director of Health, Safety & Environment)',
    'a.pendelton@titanheavy.co.uk',
    '+44 121 496 0881',
    'Titan Industrial Complex, Foundry Lane, Birmingham B6 4TG, UK',
    'High',
    'ISO 14001:2015',
    'Surveillance',
    'Automotive stamping plant, electroplating effluent treatment facility, paint shop emission stacks, and hazardous waste containment zones.',
    'Evaluate regulatory compliance with UK Environment Agency permit parameters, chemical spill response readiness, and energy reduction targets.',
    '2026-04-02',
    '2026-04-05',
    '08:00',
    '16:30',
    '08:30 AM',
    '04:00 PM',
    'Semi-Annual',
    'On-Site',
    'Titan Heavy Industries Site 2, Foundry Lane, Birmingham',
    'High-visibility vest, steel-toed boots (S3), hard hat, hearing protection, and hazardous chemical response badge required.',
    'usr_apex_lead_emma',
    'Scheduled',
    NULL,
    80.00,
    'Upcoming surveillance engagement scheduled. Pre-audit document package received and preliminary scope verified.'
),
(
    'aud_plan_004',
    'AUD-2026-GMP-04',
    'BioAseptic Parenteral Fill-Finish GMP Validation',
    'firm_pharma_qual',
    'ftmpl_pharma_sterile_gmp',
    'gtmpl_gmp_pharma',
    'BioAseptic Therapeutics S.A.',
    'CUST-BAT-004',
    'Dr. Henri Laurent (Head of Regulatory Affairs)',
    'henri.laurent@bioaseptic.ch',
    '+41 21 693 4400',
    'Route de la Corniche 14, 1066 Epalinges, Switzerland',
    'High',
    'EU GMP Vol 4 / 21 CFR Part 211',
    'Regulatory',
    'Aseptic filling line 2, isolator glove integrity testing, lyophilization chambers, and sterile Water for Injection (WFI) loop.',
    'Inspect Grade A/B cleanroom HVAC qualification, media fill simulation records, and 21 CFR Part 11 electronic batch record audit trails.',
    '2026-01-20',
    '2026-01-24',
    '08:30',
    '17:00',
    '09:00 AM',
    '04:30 PM',
    'Annual Surveillance',
    'On-Site',
    'BioAseptic Campus, Building C Cleanroom Suites, Epalinges',
    'Comprehensive Grade A cleanroom gowning protocol, microbiological swab testing, and jewelry removal compliance.',
    'usr_pharma_claire',
    'Closed',
    91.50,
    90.00,
    'GMP audit finalized. Two minor non-conformances successfully closed following verifiable CAPA containment and evidence submission.'
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    status = EXCLUDED.status,
    overall_score = EXCLUDED.overall_score;

-- ----------------------------------------------------------------------------
-- 6. AUDIT TEAM ASSIGNMENTS
-- ----------------------------------------------------------------------------
INSERT INTO public.audit_team_members (id, audit_id, user_id, role_in_team)
VALUES
    ('atm_001_lead', 'aud_plan_001', 'usr_lead_marcus', 'Lead Auditor'),
    ('atm_001_audit', 'aud_plan_001', 'usr_auditor_sarah', 'Quality Specialist Auditor'),
    ('atm_002_lead', 'aud_plan_002', 'usr_cyber_alex', 'Lead Cyber Security Auditor'),
    ('atm_003_lead', 'aud_plan_003', 'usr_apex_lead_emma', 'Lead Environmental Auditor'),
    ('atm_004_lead', 'aud_plan_004', 'usr_pharma_claire', 'Lead GMP Auditor')
ON CONFLICT (audit_id, user_id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 7. AUDIT CHECKLIST RESPONSES & COMPLIANCE EVALUATIONS
-- ----------------------------------------------------------------------------
INSERT INTO public.audit_checklist_responses (
    id, audit_id, firm_question_id, global_question_id, requirement_id,
    question_text, status, compliance_score, auditor_comments, evidence_notes,
    severities, answered_by, answered_at
) VALUES
(
    'resp_001_41',
    'aud_plan_001',
    'fq_vqms_41',
    'gq_iso9001_41',
    'ISO 9001: 4.1',
    'Has the organization determined external and internal issues relevant to its purpose and strategic direction?',
    'PASS',
    95.00,
    'Comprehensive SWOT and quality risk register reviewed. Annual executive committee sign-off verified on 2026-01-10.',
    'Quality Risk Register Rev 4.2; Executive Minutes Doc #2026-EX-01.',
    '{}',
    'usr_lead_marcus',
    '2026-03-15 11:30:00+00'
),
(
    'resp_001_82',
    'aud_plan_001',
    'fq_vqms_82',
    'gq_iso9001_87',
    'ISO 9001: 8.7.1',
    'Does the organization ensure outputs that do not conform are identified and controlled?',
    'PASS',
    88.00,
    'Physical quarantine area for non-conforming sterile packaging is clearly delimited and access controlled.',
    'Quarantine Area Inspection Record #QA-2026-03; Defect Reject Log Q1.',
    '{}',
    'usr_auditor_sarah',
    '2026-03-16 14:15:00+00'
),
(
    'resp_001_715',
    'aud_plan_001',
    'fq_vqms_715',
    'gq_iso9001_75',
    'ISO 9001: 7.1.5',
    'Are all inspection and measuring equipment calibrated against accredited national/international standards (NIST)?',
    'MAJOR_NC',
    40.00,
    'Autoclave secondary temperature sensor #TEMP-AUT-04 past 180-day calibration cycle by 24 days without out-of-spec deviation log.',
    'Equipment ID: TEMP-AUT-04; Calibration Tag Expired: 2026-02-19.',
    ARRAY['Major Non-Conformance', 'Immediate Calibration Required'],
    'usr_lead_marcus',
    '2026-03-16 16:45:00+00'
),
(
    'resp_002_51',
    'aud_plan_002',
    NULL,
    'gq_iso27001_51',
    'ISO 27001: A.5.1',
    'Are information security policies defined, approved by management, and communicated to personnel?',
    'PASS',
    100.00,
    'Information security policies published on internal portal with 100% staff digital acknowledgment logs verified.',
    'Confluence ISMS Portal v2.4; LMS Compliance Export 2026.',
    '{}',
    'usr_cyber_alex',
    '2026-02-11 10:00:00+00'
),
(
    'resp_002_82',
    'aud_plan_002',
    NULL,
    'gq_iso27001_82',
    'ISO 27001: A.8.2',
    'Is privileged access rights allocation strictly restricted and controlled via MFA and PAM?',
    'PASS',
    96.00,
    'All AWS IAM root accounts hardware MFA enabled. Zero standing production SSH access; Teleport PAM with 8-hour ephemeral certificates enforced.',
    'Teleport Audit Session Logs; AWS IAM Security Hub 100% score.',
    '{}',
    'usr_cyber_alex',
    '2026-02-12 15:30:00+00'
),
(
    'resp_004_32',
    'aud_plan_004',
    NULL,
    'gq_gmp_32',
    'GMP: 3.12',
    'Are Grade A/B aseptic cleanroom areas maintained under continuous differential pressure and particle monitoring?',
    'MINOR_NC',
    75.00,
    'Differential pressure data logger in Buffer Airlock #3 logged a 3-minute transient pressure drop below 12.5 Pa during batch packaging transfer.',
    'BMS Differential Pressure Log Date: 2026-01-18 Time: 14:22 UTC.',
    ARRAY['Minor Non-Conformance', 'HVAC Balancing'],
    'usr_pharma_claire',
    '2026-01-21 11:00:00+00'
)
ON CONFLICT (id) DO UPDATE SET
    status = EXCLUDED.status,
    compliance_score = EXCLUDED.compliance_score,
    auditor_comments = EXCLUDED.auditor_comments;

-- ----------------------------------------------------------------------------
-- 8. AUDIT FINDINGS (NON-CONFORMANCES & OBSERVATIONS)
-- ----------------------------------------------------------------------------
INSERT INTO public.audit_findings (
    id, finding_number, audit_id, firm_question_id, global_question_id,
    requirement_id, title, description, evidence_notes, severity, status,
    category, due_date, assigned_to_user_id, logged_by_user_id, logged_at
) VALUES
(
    'fnd_001_autoclave',
    'FND-2026-001',
    'aud_plan_001',
    'fq_vqms_715',
    'gq_iso9001_75',
    'ISO 9001: 7.1.5.2',
    'Critical Autoclave Temperature Sensor Past Calibration Due Date',
    'Autoclave temperature sensor #TEMP-AUT-04 used in final sterile vial batch sterilization was past its 180-day recalibration deadline by 24 days without documented risk assessment or re-calibration extension ticket.',
    'Observed during on-site inspection in Cleanroom 4B on 2026-03-16. Calibration label indicated expiry 2026-02-19.',
    'Major',
    'CAPA In Progress',
    'Calibration & Metrology',
    '2026-04-15',
    'usr_auditee_michael',
    'usr_lead_marcus',
    '2026-03-16 17:00:00+00'
),
(
    'fnd_002_sop_dist',
    'FND-2026-002',
    'aud_plan_001',
    'fq_vqms_41',
    'gq_iso9001_75',
    'ISO 9001: 7.5.3.2',
    'Obsolete Revision of Cleanroom Cleaning SOP Found at Workstation 2',
    'Paper copy of SOP-CLN-012 Rev 2.1 was located on physical clipboard at Workstation 2, while electronic document control system showed Rev 3.0 has been effective since January 2026.',
    'Physical paper binder inspected at Cleanroom 4B airlock table.',
    'Minor',
    'Open',
    'Document Control',
    '2026-04-30',
    'usr_auditee_michael',
    'usr_auditor_sarah',
    '2026-03-17 11:30:00+00'
),
(
    'fnd_003_hvac_drop',
    'FND-2026-003',
    'aud_plan_004',
    NULL,
    'gq_gmp_32',
    'GMP Chapter 3: 3.12',
    'Aseptic Buffer Airlock Transient Differential Pressure Cascade Drop',
    'Continuous Building Management System (BMS) trend analysis showed a transient pressure excursion below the required 12.5 Pa gradient between Grade B and Grade C zones for 180 seconds during material loading.',
    'BMS automated alarm trend log #ALM-2026-01-18-B3.',
    'Minor',
    'Resolved',
    'Cleanroom Environment',
    '2026-02-28',
    'usr_pharma_claire',
    'usr_pharma_claire',
    '2026-01-21 14:00:00+00'
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    status = EXCLUDED.status,
    severity = EXCLUDED.severity;

-- Update foreign key link from audit_checklist_responses to audit_findings
UPDATE public.audit_checklist_responses
SET finding_id = 'fnd_001_autoclave'
WHERE id = 'resp_001_715';

UPDATE public.audit_checklist_responses
SET finding_id = 'fnd_003_hvac_drop'
WHERE id = 'resp_004_32';

-- ----------------------------------------------------------------------------
-- 9. AUDIT FINDING RESPONSES (AUDITEE CONTAINMENT & FEEDBACK)
-- ----------------------------------------------------------------------------
INSERT INTO public.audit_finding_responses (
    id, finding_id, audit_id, response_type, response_text,
    containment_summary, status_after_response, responded_by, responded_at
) VALUES
(
    'afr_001_initial',
    'fnd_001_autoclave',
    'aud_plan_001',
    'Auditee Initial Response',
    'NovaPharma acknowledges the finding regarding sensor #TEMP-AUT-04. Immediate containment has been executed.',
    'Sensor immediately quarantined from production. High-precision secondary backup sensor #TEMP-AUT-09 installed and verified.',
    'CAPA In Progress',
    'usr_auditee_michael',
    '2026-03-17 09:30:00+00'
),
(
    'afr_002_containment',
    'fnd_001_autoclave',
    'aud_plan_001',
    'Containment Action Plan',
    'Retrospective quality review conducted for all batches sterilized between Feb 19 and March 16. Biological indicator test ampoules confirmed 100% sterility kill.',
    'Batch release records for Lots #NP-8821 through #NP-8840 audited and placed on temporary QA review hold pending recalibration report.',
    'CAPA In Progress',
    'usr_auditee_michael',
    '2026-03-17 16:00:00+00'
),
(
    'afr_003_closure',
    'fnd_003_hvac_drop',
    'aud_plan_004',
    'Closure Confirmation',
    'Interlocking door seal replaced and air handling damper PID loop retuned. Verification smoke study confirmed laminar flow containment.',
    'Replaced pneumatic door gasket on Airlock #3 and re-qualified differential pressure cascade.',
    'Closed',
    'usr_pharma_claire',
    '2026-02-25 10:15:00+00'
)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 10. CORRECTIVE & PREVENTIVE ACTION PLANS (CAPA & 5-WHY ROOT CAUSE)
-- ----------------------------------------------------------------------------
INSERT INTO public.audit_corrective_actions (
    id, capa_number, finding_id, audit_id, five_whys, root_cause_summary,
    immediate_containment, corrective_action_plan, preventive_action_plan,
    assigned_owner_id, target_completion_date, status, manager_feedback,
    review_notes, reviewed_by, reviewed_at, submitted_by, submitted_at
) VALUES
(
    'capa_001_metrology',
    'CAPA-2026-001',
    'fnd_001_autoclave',
    'aud_plan_001',
    '[
        {"level": 1, "why": "Why was the sensor calibration expired?", "answer": "The technician did not submit the sensor to the external metrology lab on Feb 19."},
        {"level": 2, "why": "Why was the sensor not submitted?", "answer": "The CMMS automated reminder notification failed to trigger for this equipment tag."},
        {"level": 3, "why": "Why did the CMMS notification fail?", "answer": "The equipment asset record was classified under general facility instead of critical GMP metrology assets."},
        {"level": 4, "why": "Why was the classification incorrect?", "answer": "Manual data entry during the 2025 facility expansion omitted the GMP critical asset checkbox."},
        {"level": 5, "why": "Why was there no verification of the entry?", "answer": "No dual-signoff protocol existed for entering GMP-critical instruments into the CMMS."}
    ]'::jsonb,
    'Root cause identified as lack of automated dual verification when onboarding critical GMP sensor assets into the maintenance management system, allowing overdue calibration reminders to lapse.',
    'Quarantined sensor #TEMP-AUT-04, installed calibrated sensor #TEMP-AUT-09, and placed 4 affected batches on QA hold.',
    '1. Complete NIST re-calibration of #TEMP-AUT-04 with as-found/as-left measurement report. 2. Audit 100% of cleanroom sensor assets in CMMS.',
    'Implement mandatory dual QA sign-off in CMMS for any asset classified as GMP direct-impact, and add automated 30-day escalation alerts to QA leadership.',
    'usr_auditee_michael',
    '2026-04-10',
    'Submitted',
    'Solid 5-why analysis. Please ensure the as-found calibration report demonstrates zero measurement drift during the 24-day overdue window.',
    'Under review by Lead Auditor Marcus Chen.',
    'usr_lead_marcus',
    '2026-03-18 10:00:00+00',
    'usr_auditee_michael',
    '2026-03-17 18:00:00+00'
),
(
    'capa_002_hvac',
    'CAPA-2026-002',
    'fnd_003_hvac_drop',
    'aud_plan_004',
    '[
        {"level": 1, "why": "Why did the pressure drop below 12.5 Pa?", "answer": "Both inner and outer airlock doors were ajar simultaneously for 8 seconds."},
        {"level": 2, "why": "Why were both doors ajar?", "answer": "The pneumatic magnetic interlock delay timer was misconfigured at 15 seconds instead of zero."},
        {"level": 3, "why": "Why was the timer set to 15 seconds?", "answer": "A maintenance technician extended the timer during pallet delivery without restoring factory setting."}
    ]'::jsonb,
    'Root cause was improper adjustment of door interlock delay timers during material transport without a formal engineering change order.',
    'Reset interlock delay timer to 0 seconds and locked the PLC control panel with tamper-evident physical seals.',
    'Rewired interlock system to hardwired fail-safe relay preventing simultaneous door release regardless of software override.',
    'Instituted weekly visual interlock functional checks during cleanroom supervisor shift handover.',
    'usr_pharma_claire',
    '2026-02-20',
    'Accepted',
    'Engineering remediation verified and accepted. Closed with full evidence trail.',
    'Hardwired interlock logic and smoke study video accepted as proof of resolution.',
    'usr_pharma_claire',
    '2026-02-24 16:30:00+00',
    'usr_auditee_michael',
    '2026-02-22 09:00:00+00'
)
ON CONFLICT (id) DO UPDATE SET
    status = EXCLUDED.status,
    root_cause_summary = EXCLUDED.root_cause_summary;

-- Update foreign key link from audit_findings to audit_corrective_actions
UPDATE public.audit_findings
SET capa_id = 'capa_001_metrology'
WHERE id = 'fnd_001_autoclave';

UPDATE public.audit_findings
SET capa_id = 'capa_002_hvac'
WHERE id = 'fnd_003_hvac_drop';

-- ----------------------------------------------------------------------------
-- 11. EVIDENCE ATTACHMENTS & VERIFICATION DOCUMENTS
-- ----------------------------------------------------------------------------
INSERT INTO public.audit_attachments (
    id, audit_id, finding_id, finding_response_id, checklist_response_id, capa_id,
    file_name, file_size, file_type, url, description, uploaded_by
) VALUES
(
    'att_001_calib_cert',
    'aud_plan_001',
    'fnd_001_autoclave',
    'afr_001_initial',
    'resp_001_715',
    'capa_001_metrology',
    'TEMP-AUT-04_NIST_Calibration_Report.pdf',
    '2.4 MB',
    'application/pdf',
    'https://storage.ams-audit.io/evidence/veritas/TEMP-AUT-04_NIST_Report.pdf',
    'Official accredited metrology calibration certificate showing as-found tolerance within +/- 0.15 deg C.',
    'usr_auditee_michael'
),
(
    'att_002_quarantine_tag',
    'aud_plan_001',
    'fnd_001_autoclave',
    'afr_001_initial',
    NULL,
    NULL,
    'Cleanroom4B_Quarantine_Physical_Tag.jpg',
    '1.8 MB',
    'image/jpeg',
    'https://storage.ams-audit.io/evidence/veritas/Quarantine_Tag_AUT04.jpg',
    'Photographic evidence of red quarantine tag attached to autoclave sensor lead.',
    'usr_lead_marcus'
),
(
    'att_003_interlock_video',
    'aud_plan_004',
    'fnd_003_hvac_drop',
    'afr_003_closure',
    'resp_004_32',
    'capa_002_hvac',
    'Airlock3_Smoke_Study_Validation.mp4',
    '18.6 MB',
    'video/mp4',
    'https://storage.ams-audit.io/evidence/pharmabio/Airlock3_SmokeStudy.mp4',
    'Video recording of dynamic air velocity smoke study demonstrating zero particle backflow across buffer zone.',
    'usr_pharma_claire'
),
(
    'att_004_soc2_teleport',
    'aud_plan_002',
    NULL,
    NULL,
    'resp_002_82',
    NULL,
    'Teleport_PAM_Access_Audit_Export.csv',
    '850 KB',
    'text/csv',
    'https://storage.ams-audit.io/evidence/cyberguard/Teleport_PAM_Export.csv',
    'Export of all privileged administrative shell sessions showing zero permanent credential usage.',
    'usr_cyber_alex'
)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 12. IMMUTABLE SYSTEM AUDIT TRAIL LOGS
-- ----------------------------------------------------------------------------
INSERT INTO public.audit_logs (
    id, action, entity_type, entity_id, details, user_id, ip_address
) VALUES
(
    'log_001_audit_create',
    'CREATE_AUDIT_PLAN',
    'AuditPlan',
    'aud_plan_001',
    'Audit plan AUD-2026-9001 (NovaPharma Cleanroom ISO 9001) scheduled for 2026-03-15 to 2026-03-18 by Dr. David Vance.',
    'usr_veritas_dir',
    '198.51.100.24'
),
(
    'log_002_finding_log',
    'LOG_FINDING',
    'AuditFinding',
    'fnd_001_autoclave',
    'Major Non-Conformance FND-2026-001 (Autoclave Sensor Overdue Calibration) logged by Lead Auditor Marcus Chen.',
    'usr_lead_marcus',
    '198.51.100.55'
),
(
    'log_003_capa_submit',
    'SUBMIT_CAPA',
    'CorrectiveAction',
    'capa_001_metrology',
    'CAPA-2026-001 submitted by Auditee Rep Michael Ross with complete 5-Why root cause analysis.',
    'usr_auditee_michael',
    '203.0.113.88'
),
(
    'log_004_report_finalize',
    'COMPLETE_AUDIT',
    'AuditPlan',
    'aud_plan_002',
    'Audit AUD-2026-27001 (CloudScale Systems SOC 2) marked Completed with final overall score 94.00%.',
    'usr_cyber_alex',
    '192.0.2.14'
),
(
    'log_005_capa_close',
    'CLOSE_CAPA',
    'CorrectiveAction',
    'capa_002_hvac',
    'CAPA-2026-002 for Airlock Transient Pressure Drop accepted and closed by Dr. Claire Dubois.',
    'usr_pharma_claire',
    '198.51.100.91'
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- END OF AMS PRODUCTION SEED DATA
-- ============================================================================
