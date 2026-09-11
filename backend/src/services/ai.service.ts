import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY || "";
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

export const aiBackendService = {
  /**
   * Generates audit template sections & questions with Gemini AI
   */
  async generateTemplate(payload: {
    title?: string;
    industry?: string;
    standard?: string;
    scope?: string;
    questionsCount?: number;
  }) {
    const prompt = `Generate a structured audit checklist for:
Standard: ${payload.standard || "ISO 9001:2015"}
Industry: ${payload.industry || "General"}
Title: ${payload.title || "Quality Management Audit"}
Scope: ${payload.scope || "Standard operational audit"}
Number of questions: ${payload.questionsCount || 10}

Return ONLY a valid JSON object matching this structure:
{
  "title": "${payload.title || "Audit Template"}",
  "standard": "${payload.standard || "ISO 9001:2015"}",
  "industry": "${payload.industry || "General"}",
  "sections": [
    {
      "id": "sec_1",
      "title": "Section Title",
      "weight": 25,
      "questions": [
        {
          "id": "q_1",
          "text": "Question statement?",
          "clause": "4.1",
          "guidance": "Auditor guidance notes",
          "maxScore": 5
        }
      ]
    }
  ]
}`;

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: GEMINI_MODEL,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          },
        });

        if (response.text) {
          return JSON.parse(response.text);
        }
      } catch (err) {
        console.warn("AI generation fallback:", err);
      }
    }

    // Fallback template structure
    return {
      title: payload.title || `${payload.standard || "ISO 9001"} Audit Checklist`,
      standard: payload.standard || "ISO 9001:2015",
      industry: payload.industry || "General",
      sections: [
        {
          id: `sec_${Date.now()}_1`,
          title: "Context of the Organization & Leadership",
          weight: 40,
          questions: [
            {
              id: `q_${Date.now()}_1`,
              text: "Has the organization determined external and internal issues relevant to its purpose?",
              clause: "4.1",
              guidance: "Review internal strategy documents and SWOT analysis.",
              maxScore: 5,
            },
            {
              id: `q_${Date.now()}_2`,
              text: "Does top management demonstrate leadership and commitment regarding the management system?",
              clause: "5.1",
              guidance: "Interview leadership and review policy communication records.",
              maxScore: 5,
            },
          ],
        },
        {
          id: `sec_${Date.now()}_2`,
          title: "Operations & Risk Evaluation",
          weight: 60,
          questions: [
            {
              id: `q_${Date.now()}_3`,
              text: "Are operational processes planned, implemented, and controlled in accordance with criteria?",
              clause: "8.1",
              guidance: "Inspect Standard Operating Procedures (SOPs) and execution logs.",
              maxScore: 5,
            },
            {
              id: `q_${Date.now()}_4`,
              text: "Are corrective actions tracked systematically to prevent recurrence?",
              clause: "10.2",
              guidance: "Check CAPA register and resolution timelines.",
              maxScore: 5,
            },
          ],
        },
      ],
    };
  },

  /**
   * Analyzes an audit finding and generates root cause and recommendations
   */
  async analyzeFinding(payload: {
    findingTitle: string;
    description: string;
    severity: string;
    standardClause?: string;
    auditorNotes?: string;
    evidenceNotes?: string;
  }) {
    const prompt = `Analyze this audit finding:
Finding Title: ${payload.findingTitle}
Severity: ${payload.severity}
Description: ${payload.description}
Standard Clause: ${payload.standardClause || "N/A"}
Auditor Notes: ${payload.auditorNotes || "N/A"}
Evidence Notes: ${payload.evidenceNotes || "N/A"}

Provide a root-cause analysis, recommended corrective actions, preventive measures, and risk classification.
Return ONLY valid JSON matching:
{
  "rootCauseAnalysis": "string",
  "recommendedCorrection": "string",
  "preventiveAction": "string",
  "riskRating": "High" | "Medium" | "Low",
  "complianceImpact": "string"
}`;

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: GEMINI_MODEL,
          contents: prompt,
          config: { responseMimeType: "application/json" },
        });
        if (response.text) {
          return JSON.parse(response.text);
        }
      } catch (err) {
        console.warn("AI analyze finding fallback:", err);
      }
    }

    return {
      rootCauseAnalysis: `Lack of consistent procedural adherence and process monitoring regarding ${payload.findingTitle}.`,
      recommendedCorrection: "Implement immediate containment and update standard operating procedures.",
      preventiveAction: "Conduct refresher training for responsible team members and establish monthly verification audits.",
      riskRating: payload.severity === "Major NC" ? "High" : payload.severity === "Minor NC" ? "Medium" : "Low",
      complianceImpact: `Requires resolution within 30 days to maintain full accreditation conformance with clause ${payload.standardClause || "requirements"}.`,
    };
  },

  /**
   * Generates Executive Report Summary
   */
  async generateReportSummary(payload: any) {
    if (ai) {
      try {
        const prompt = `Generate an Executive Summary for an audit report:
Audit: ${payload.auditTitle}
Customer: ${payload.customerName}
Standard: ${payload.standard}
Score: ${payload.totalScore}%
Passed: ${payload.passedQuestions}, Failed: ${payload.failedQuestions}
Lead Auditor: ${payload.leadAuditor}

Return ONLY valid JSON with:
{
  "executiveSummary": "string",
  "strengths": ["string"],
  "areasForImprovement": ["string"],
  "conclusion": "string"
}`;
        const response = await ai.models.generateContent({
          model: GEMINI_MODEL,
          contents: prompt,
          config: { responseMimeType: "application/json" },
        });
        if (response.text) return JSON.parse(response.text);
      } catch (err) {
        console.warn("AI report summary fallback:", err);
      }
    }

    return {
      executiveSummary: `Audit for ${payload.customerName} against ${payload.standard} was conducted successfully with an overall score of ${payload.totalScore}%.`,
      strengths: [
        "Robust document management procedures observed.",
        "High management commitment toward continuous quality improvement.",
      ],
      areasForImprovement: [
        "Timely closure of corrective and preventive actions (CAPA).",
        "Periodic internal audit cross-verification schedules.",
      ],
      conclusion: payload.totalScore >= 80 ? "Recommended for Certification." : "Conditional Certification pending CAPA verification.",
    };
  },

  /**
   * Risk Advisor AI analysis
   */
  async getRiskAdvice(payload: any) {
    if (ai) {
      try {
        const prompt = `Analyze risk for upcoming audit:
Customer: ${payload.customerName}
Industry: ${payload.industry}
Previous Score: ${payload.previousAuditScore}%
Standard: ${payload.plannedStandard}
Past Incidents: ${payload.pastIncidents || "None reported"}

Return ONLY valid JSON:
{
  "predictedRiskLevel": "Low" | "Medium" | "High",
  "focusAreas": ["string"],
  "advisoryNotes": "string"
}`;
        const response = await ai.models.generateContent({
          model: GEMINI_MODEL,
          contents: prompt,
          config: { responseMimeType: "application/json" },
        });
        if (response.text) return JSON.parse(response.text);
      } catch (err) {
        console.warn("AI risk advice fallback:", err);
      }
    }

    return {
      predictedRiskLevel: payload.previousAuditScore < 70 ? "High" : payload.previousAuditScore < 85 ? "Medium" : "Low",
      focusAreas: [
        "Core operational workflow compliance",
        "Staff competency matrix and training logs",
        "Incident management and mitigation records",
      ],
      advisoryNotes: `Based on previous score of ${payload.previousAuditScore}%, pay special attention to corrective actions before the final audit date.`,
    };
  },
};

export default aiBackendService;
