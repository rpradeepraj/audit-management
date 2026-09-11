export interface GeneratedTemplatePayload {
  title?: string;
  industry?: string;
  standard?: string;
  scope?: string;
  questionsCount?: number;
}

export interface GeneratedFindingAnalysisPayload {
  findingTitle: string;
  description: string;
  severity: string;
  standardClause?: string;
  auditorNotes?: string;
  evidenceNotes?: string;
}

export interface GeneratedReportSummaryPayload {
  auditTitle: string;
  customerName: string;
  standard: string;
  totalScore: number;
  passedQuestions: number;
  failedQuestions: number;
  findingsSummary: any[];
  leadAuditor: string;
}

export interface RiskAdvisorPayload {
  customerName: string;
  industry: string;
  previousAuditScore: number;
  pastIncidents?: string;
  plannedStandard: string;
}

export const aiService = {
  async generateTemplate(payload: GeneratedTemplatePayload) {
    const res = await fetch("/api/ai/generate-template", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to generate audit template");
    }
    return res.json();
  },

  async analyzeFinding(payload: GeneratedFindingAnalysisPayload) {
    const res = await fetch("/api/ai/analyze-finding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to analyze finding");
    }
    return res.json();
  },

  async generateReportSummary(payload: GeneratedReportSummaryPayload) {
    const res = await fetch("/api/ai/generate-report-summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to generate report executive summary");
    }
    return res.json();
  },

  async getRiskAdvice(payload: RiskAdvisorPayload) {
    const res = await fetch("/api/ai/risk-advisor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to run risk advisor");
    }
    return res.json();
  },
};

export default aiService;
