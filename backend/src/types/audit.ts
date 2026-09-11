export type ScoringType = "PASS_FAIL" | "COMPLIANCE_RATING" | "SEVERITY_BASED" | "NUMERIC";

export interface ChecklistQuestion {
  id: string;
  requirementId: string;
  question: string;
  guidance: string;
  scoringType: ScoringType;
  weight: number;
  mandatory: boolean;
}

export interface ChecklistSection {
  id: string;
  title: string;
  description: string;
  weight: number;
  questions: ChecklistQuestion[];
}

export interface AuditTemplate {
  id: string;
  title: string;
  code: string;
  description: string;
  standard: string;
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
  firmId?: string;
  globalTemplateId?: string;
}
