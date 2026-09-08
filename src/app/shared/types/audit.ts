export type UserRole =
  | "Platform Admin"
  | "Admin"
  | "Company Admin"
  | "Audit Manager"
  | "Auditor"
  | "Customer Representative"
  | "Client Representative"
  | "Customer Viewer"
  | string;

export interface FirmRole {
  id: string;
  name: string;
  description: string;
  category: "Firm Staff" | "Client Representative" | "External Specialist";
  permissions: string[];
  isSystemRole?: boolean;
  usersCount?: number;
  createdAt?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  companyName: string;
  companyId: string;
  Organization?: string;
  isCustomerUser?: boolean;
  department?: string;
  phone?: string;
  status?: "Active" | "Inactive";
  joinedDate?: string;
}

export interface AuditFirm {
  id: string;
  name: string;
  code: string;
  accreditationNumber: string;
  accreditationStandard: string;
  industryScope: string;
  contactEmail: string;
  phone: string;
  address: string;
  website: string;
  logoInitials: string;
  establishedYear: string;
  qualityPolicy: string;
  status: "Active" | "Pending Accreditation" | "Suspended";
  maintainedTemplateIds: string[];
  notes?: string;
  createdAt?: string;
}

export type CompanyProfile = AuditFirm;

export interface Customer {
  id: string;
  name: string;
  code: string;
  industry: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  complianceRating: number; // 0 - 100
  riskLevel: "Low" | "Medium" | "High";
  activeAuditsCount: number;
  totalAuditsCount: number;
  createdAt: string;
  assignedManagerId: string;
  assignedManagerName: string;
}

export type ScoringType = "PASS_FAIL" | "COMPLIANCE_RATING" | "SEVERITY_BASED";

export interface ChecklistQuestion {
  id: string;
  requirementId: string; // e.g. "ISO 9001: 7.1.3" or "SOC 2: CC6.1"
  question: string;
  guidance: string;
  scoringType: ScoringType;
  weight: number; // e.g. 10
  mandatory: boolean;
}

export interface ChecklistSection {
  id: string;
  title: string;
  description: string;
  weight: number; // section percentage
  questions: ChecklistQuestion[];
}

export interface AuditTemplate {
  id: string;
  title: string;
  code: string;
  description: string;
  standard: string; // e.g. "ISO 9001:2015", "ISO 27001:2022", "SOC 2 Type II", "GMP"
  industry: string;
  name?: string;
  isDefaultIndustryTemplate?: boolean;
  isCustom?: boolean;
  version: string;
  passingScore: number;
  sections: ChecklistSection[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export type AuditStatus =
  | "Draft"
  | "Scheduled"
  | "In Progress"
  | "Under Review"
  | "Completed"
  | "Closed";

export type AuditType =
  | "Certification"
  | "Surveillance"
  | "Internal Quality"
  | "Internal"
  | "External"
  | "Supplier Audit"
  | "Supplier"
  | "Security & Compliance"
  | "Regulatory";

export type ScheduleRecurrence =
  | "One-Time"
  | "Monthly"
  | "Quarterly"
  | "Semi-Annual"
  | "Annual Surveillance";

export type LocationType = "On-Site" | "Hybrid" | "Remote";

export interface EvidenceAttachment {
  id: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  url?: string;
  uploadedAt: string;
  uploadedBy: string;
  description?: string;
}

export type QuestionResponseStatus =
  | "PASS"
  | "FAIL"
  | "MINOR_NC"
  | "MAJOR_NC"
  | "OFI" // Opportunity for Improvement
  | "NOT_APPLICABLE"
  | "UNANSWERED";

export type ResponseStatus = QuestionResponseStatus;

export interface ChecklistItemResponse {
  questionId?: string;
  status: QuestionResponseStatus;
  complianceScore?: number; // 0 - 100
  score?: number; // alias
  auditorComments?: string;
  notes?: string; // alias
  evidenceNotes?: string;
  evidenceAttachments?: EvidenceAttachment[];
  evidenceFiles?: EvidenceAttachment[]; // alias
  findingId?: string; // Linked finding if failed/NC
  severities?: string[]; // Multi-select severities for Minor & Major NC
  severityTags?: string[]; // alias
  answeredAt?: string;
  answeredBy?: string;
}

export type ChecklistResponse = ChecklistItemResponse;

export interface AuditPlan {
  id: string;
  auditNumber: string; // e.g. "AUD-2026-089"
  title: string;
  customerId: string;
  customerName: string;
  firmId?: string;
  firmName?: string;
  firmCode?: string;
  templateId: string;
  templateTitle: string;
  templateStandard?: string;
  templateIds?: string[];
  templateTitles?: string[];
  standard: string;
  auditType: AuditType;
  scope: string;
  objectives: string;
  startDate: string;
  endDate: string;
  startTime?: string; // e.g. "09:00"
  endTime?: string; // e.g. "17:00"
  recurrence?: ScheduleRecurrence;
  locationType?: LocationType;
  location?: string; // "On-Site (Singapore)", "Hybrid", "Remote"
  facilityAddress?: string;
  meetingRoomOrLink?: string;
  openingMeetingTime?: string; // e.g. "09:30 AM"
  closingMeetingTime?: string; // e.g. "04:30 PM"
  scheduleNotes?: string;
  isScheduleConfirmed?: boolean;
  leadAuditorId: string;
  leadAuditorName: string;
  leadAuditorIds?: string[];
  leadAuditorNames?: string[];
  auditTeam?: string[]; // Names of team members
  auditorTeam?: string[]; // alias
  customerRepId?: string;
  customerRepName?: string;
  status: AuditStatus;
  overallScore?: number;
  passingScore?: number;
  responses: Record<string, ChecklistItemResponse>; // questionId -> response
  findingsCount: {
    critical?: number;
    major: number;
    minor: number;
    observation: number;
  };
  submittedAt?: string;
  reviewedAt?: string;
  completedAt?: string;
  reviewNotes?: string;
  executiveSummary?: string;
  signatures?: {
    leadAuditor?: any;
    manager?: any;
    auditManager?: any;
    customerRep?: any;
  };
}

export type FindingSeverity = "Critical" | "Major" | "Minor" | "Observation";

export type FindingStatus =
  | "Open"
  | "CAPA In Progress"
  | "CAPA Submitted"
  | "Pending Review"
  | "Under Review"
  | "Resolved"
  | "Closed"
  | "Rejected";

export interface Finding {
  id: string;
  findingNumber: string; // e.g. "FND-089-01"
  auditId: string;
  auditNumber: string;
  customerId: string;
  customerName: string;
  questionId?: string;
  requirementId: string;
  title: string;
  description: string;
  evidenceNotes: string;
  severity: FindingSeverity;
  status: FindingStatus;
  category: string; // e.g. "Access Control", "Document Control", "Risk Assessment"
  dueDate: string;
  assignedToCustomerRepId: string;
  assignedToCustomerRepName: string;
  loggedByAuditorName: string;
  loggedAt?: string;
  createdAt?: string;
  evidenceAttachments: EvidenceAttachment[];
  capaId?: string;
}

export type CapaStatus = "Draft" | "Submitted" | "Accepted" | "Rejected" | "Under Verification";

export interface CorrectiveAction {
  id: string;
  findingId: string;
  findingNumber: string;
  findingTitle: string;
  findingSeverity?: FindingSeverity;
  auditId?: string;
  auditNumber?: string;
  customerId?: string;
  customerName?: string;
  // RCA
  fiveWhys: string[];
  rootCause?: string;
  rootCauseSummary?: string;
  immediateCorrection: string;
  // Action Plans
  correctiveAction?: string;
  correctiveActionPlan?: string;
  preventiveAction?: string;
  preventiveActionPlan?: string;
  remediationDueDate?: string;
  targetCompletionDate?: string;
  assignedOwner?: string;
  evidenceAttachments?: EvidenceAttachment[];
  implementationEvidence?: EvidenceAttachment[];
  submittedBy: string;
  submittedAt?: string;
  // Review
  status: CapaStatus;
  managerFeedback?: string;
  reviewNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userName?: string;
  performedByName?: string;
  userRole?: UserRole;
  action: string;
  entityType: string;
  entityId?: string;
  details: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "warning" | "info" | "success" | "danger";
  timestamp: string;
  read: boolean;
  linkTab?: string;
  linkEntityId?: string;
}

export type ActiveTab =
  | "dashboard"
  | "customers"
  | "templates"
  | "planning"
  | "perform"
  | "findings"
  | "capa"
  | "reports"
  | "audit-trail"
  | "company-admin";
