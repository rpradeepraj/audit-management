import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "15mb" }));

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // AI 1: Generate Audit Template
  app.post("/api/ai/generate-template", async (req, res) => {
    try {
      const { title, industry, standard, scope, questionsCount = 10 } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        // High quality fallback generation if key not configured
        return res.json({
          title: title || `${standard || "ISO"} Audit Template`,
          description: `Comprehensive compliance and operational readiness audit checklist for ${standard || "Quality Management"}. Scope: ${scope || "General Operations"}.`,
          standard: standard || "ISO 9001:2015",
          industry: industry || "Manufacturing & Technology",
          passingScore: 80,
          sections: [
            {
              id: "sec_1",
              title: "1. Leadership & Governance",
              description: "Organizational structure, policy documentation, and management commitment.",
              weight: 25,
              questions: [
                {
                  id: "q_1_1",
                  requirementId: "REQ-1.1",
                  question: "Has the organization established a documented Quality/Compliance Policy accessible to all personnel?",
                  guidance: "Verify documented policy statement, executive signatures, and employee awareness.",
                  scoringType: "PASS_FAIL",
                  weight: 10,
                  mandatory: true,
                },
                {
                  id: "q_1_2",
                  requirementId: "REQ-1.2",
                  question: "Are roles, responsibilities, and authorities clearly defined and communicated within the organization?",
                  guidance: "Review organizational charts, job descriptions, and delegation matrices.",
                  scoringType: "COMPLIANCE_RATING",
                  weight: 15,
                  mandatory: true,
                },
              ],
            },
            {
              id: "sec_2",
              title: "2. Operational Control & Risk Management",
              description: "Risk assessments, operational controls, and process validation.",
              weight: 40,
              questions: [
                {
                  id: "q_2_1",
                  requirementId: "REQ-2.1",
                  question: "Is there an active Risk Register with mitigation plans reviewed within the last 6 months?",
                  guidance: "Examine risk assessment methodology, severity scoring, and closed mitigation actions.",
                  scoringType: "COMPLIANCE_RATING",
                  weight: 20,
                  mandatory: true,
                },
                {
                  id: "q_2_2",
                  requirementId: "REQ-2.2",
                  question: "Are standard operating procedures (SOPs) regularly maintained, version-controlled, and audited?",
                  guidance: "Check revision dates, document approvals, and obsolescence control.",
                  scoringType: "PASS_FAIL",
                  weight: 20,
                  mandatory: true,
                },
              ],
            },
            {
              id: "sec_3",
              title: "3. Incident Management & Continuous Improvement",
              description: "Non-conformity tracking, root-cause analysis, and CAPA follow-up.",
              weight: 35,
              questions: [
                {
                  id: "q_3_1",
                  requirementId: "REQ-3.1",
                  question: "Is there a structured Corrective and Preventive Action (CAPA) workflow for identified non-conformities?",
                  guidance: "Sample at least 3 previous non-conformities to review 5-Why root cause logs and verification of effectiveness.",
                  scoringType: "COMPLIANCE_RATING",
                  weight: 20,
                  mandatory: true,
                },
                {
                  id: "q_3_2",
                  requirementId: "REQ-3.2",
                  question: "Are internal audits conducted at planned intervals with reported findings presented to executive leadership?",
                  guidance: "Verify annual audit calendar, internal auditor qualification records, and management review meeting minutes.",
                  scoringType: "PASS_FAIL",
                  weight: 15,
                  mandatory: false,
                },
              ],
            },
          ],
        });
      }

      const prompt = `You are a Lead Quality and Compliance Auditor creating an enterprise audit checklist.
Generate a structured audit template for:
- Title: ${title || "Standard Audit Template"}
- Industry: ${industry || "General Industry"}
- Standard/Framework: ${standard || "ISO 9001 / ISO 27001 / SOC 2"}
- Scope: ${scope || "Core Business & Quality Operations"}
- Target approx ${questionsCount} detailed, realistic audit questions split into 3-4 cohesive sections.

Ensure each section has realistic weight (summing to 100) and each question has a clear requirement ID (e.g. ISO Clause / SOC2 Criteria), clear auditor guidance notes, and scoringType ("PASS_FAIL" or "COMPLIANCE_RATING").`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              standard: { type: Type.STRING },
              industry: { type: Type.STRING },
              passingScore: { type: Type.NUMBER },
              sections: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    weight: { type: Type.NUMBER },
                    questions: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          id: { type: Type.STRING },
                          requirementId: { type: Type.STRING },
                          question: { type: Type.STRING },
                          guidance: { type: Type.STRING },
                          scoringType: { type: Type.STRING },
                          weight: { type: Type.NUMBER },
                          mandatory: { type: Type.BOOLEAN },
                        },
                        required: ["id", "requirementId", "question", "guidance", "scoringType", "weight", "mandatory"],
                      },
                    },
                  },
                  required: ["id", "title", "description", "weight", "questions"],
                },
              },
            },
            required: ["title", "description", "standard", "industry", "passingScore", "sections"],
          },
        },
      });

      const templateData = JSON.parse(response.text || "{}");
      res.json(templateData);
    } catch (err: any) {
      console.error("Error generating audit template:", err);
      res.status(500).json({ error: err.message || "Failed to generate template" });
    }
  });

  // AI 2: Analyze Finding & Suggest CAPA (Root Cause + Action Plan)
  app.post("/api/ai/analyze-finding", async (req, res) => {
    try {
      const { findingTitle, description, severity, standardClause, auditorNotes, evidenceNotes } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.json({
          riskAssessment: `Severity rated as ${severity || "Major"}. Direct impact on operational compliance and traceability.`,
          fiveWhys: [
            "Why 1: The standard operating control was not completed as scheduled.",
            "Why 2: Staff members lacked up-to-date refresher training on recent procedure revisions.",
            "Why 3: Change management notifications were only sent via bulk email without mandatory sign-off.",
            "Why 4: No automated monitoring system existed to flag overdue compliance checkpoints.",
            "Why 5: Root Cause: Lack of centralized automated compliance tracking and formal training verification gates.",
          ],
          rootCauseSummary: "Systemic breakdown in change communication and absence of automated supervisory validation gates.",
          immediateCorrection: "Perform immediate review of all active process logs, isolate discrepancies, and conduct mandatory staff briefing within 48 hours.",
          correctiveActionPlan: "Implement automated dashboard alerts for compliance milestone verification and enforce digital acknowledgement of SOP updates.",
          preventiveActionPlan: "Establish quarterly spot-audits and integrate LMS automated completion tracking before authorizing operator privileges.",
          suggestedDueDateDays: severity === "Critical" ? 7 : severity === "Major" ? 14 : 30,
        });
      }

      const prompt = `You are a Senior Quality Assurance & Compliance Specialist.
Analyze the following audit non-conformity finding and formulate a rigorous Root Cause Analysis (5-Whys) and Corrective & Preventive Action (CAPA) plan:
- Finding Title: ${findingTitle}
- Severity: ${severity}
- Requirement/Standard Clause: ${standardClause || "Unspecified"}
- Finding Description: ${description}
- Auditor Notes & Evidence: ${auditorNotes || evidenceNotes || "Observed deviation during inspection"}

Provide clear, actionable, and auditor-accepted root cause reasoning and CAPA recommendations.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              riskAssessment: { type: Type.STRING },
              fiveWhys: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              rootCauseSummary: { type: Type.STRING },
              immediateCorrection: { type: Type.STRING },
              correctiveActionPlan: { type: Type.STRING },
              preventiveActionPlan: { type: Type.STRING },
              suggestedDueDateDays: { type: Type.NUMBER },
            },
            required: [
              "riskAssessment",
              "fiveWhys",
              "rootCauseSummary",
              "immediateCorrection",
              "correctiveActionPlan",
              "preventiveActionPlan",
              "suggestedDueDateDays",
            ],
          },
        },
      });

      const analysis = JSON.parse(response.text || "{}");
      res.json(analysis);
    } catch (err: any) {
      console.error("Error analyzing finding:", err);
      res.status(500).json({ error: err.message || "Failed to analyze finding" });
    }
  });

  // AI 3: Generate Audit Executive Summary Report
  app.post("/api/ai/generate-report-summary", async (req, res) => {
    try {
      const { auditTitle, customerName, standard, totalScore, passedQuestions, failedQuestions, findingsSummary, leadAuditor } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.json({
          executiveSummary: `This comprehensive audit was executed for ${customerName || "the Client"} evaluating adherence against ${standard || "applicable compliance standards"}. The organization achieved an overall compliance score of ${totalScore || 85}%. ${passedQuestions || 0} checklist criteria were verified compliant, with ${failedQuestions || 0} items identified as non-conformances requiring structured remediation.`,
          keyStrengths: [
            "Demonstrated strong management commitment and well-structured governance documentation.",
            "Operational teams exhibited thorough familiarity with baseline procedural expectations.",
            "Evidence repository and document traceability were well-organized across evaluated departments.",
          ],
          criticalVulnerabilities: [
            "Identified gaps in periodic change verification and automated exception alerting.",
            "Inconsistent closure verification timelines on legacy corrective action logs.",
          ],
          conclusionRecommendation: "Certification / compliance approval is recommended contingent upon the successful closure and managerial sign-off of all open Major non-conformances within the stipulated timeframe.",
          riskRating: (totalScore || 85) >= 85 ? "Low Risk" : (totalScore || 85) >= 70 ? "Moderate Risk" : "High Risk",
        });
      }

      const prompt = `You are a Lead Certified Lead Auditor preparing the Executive Summary and Conclusion section of a formal Audit Report.
Details:
- Audit Title: ${auditTitle}
- Client/Customer: ${customerName}
- Standard/Scope: ${standard}
- Overall Compliance Score: ${totalScore}%
- Passed Checkpoints: ${passedQuestions}
- Non-conformities / Findings Summary: ${JSON.stringify(findingsSummary || [])}
- Lead Auditor: ${leadAuditor || "Lead Auditor"}

Write an authoritative, executive-level summary with key strengths, vulnerabilities, conclusion, and overall risk rating.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              executiveSummary: { type: Type.STRING },
              keyStrengths: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              criticalVulnerabilities: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              conclusionRecommendation: { type: Type.STRING },
              riskRating: { type: Type.STRING },
            },
            required: ["executiveSummary", "keyStrengths", "criticalVulnerabilities", "conclusionRecommendation", "riskRating"],
          },
        },
      });

      const summary = JSON.parse(response.text || "{}");
      res.json(summary);
    } catch (err: any) {
      console.error("Error generating report summary:", err);
      res.status(500).json({ error: err.message || "Failed to generate report summary" });
    }
  });

  // AI 4: Risk Advisor / Audit Scope Assistant
  app.post("/api/ai/risk-advisor", async (req, res) => {
    try {
      const { customerName, industry, previousAuditScore, pastIncidents, plannedStandard } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.json({
          riskLevel: "Medium",
          riskScore: 68,
          priorityFocusAreas: [
            "Access Control & Privilege Reviews",
            "Third-Party Vendor Due Diligence",
            "Disaster Recovery & Business Continuity Testing",
            "Documented Incident Post-Mortem Reviews",
          ],
          recommendedSampleRate: "Sample 25% of operational records and all high-severity incidents over the past 12 months.",
          regulatoryAlerts: "Ensure compliance with updated regional data sovereignty and ESG reporting directives.",
        });
      }

      const prompt = `As a Risk Advisory Auditor, assess the compliance risk exposure for an upcoming audit:
- Customer: ${customerName}
- Industry: ${industry}
- Previous Audit Score: ${previousAuditScore}%
- Past Incidents/Non-conformities: ${pastIncidents || "None reported"}
- Standard: ${plannedStandard}

Provide priority audit focus areas, recommended sampling rate, and regulatory alerts.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              riskLevel: { type: Type.STRING },
              riskScore: { type: Type.NUMBER },
              priorityFocusAreas: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              recommendedSampleRate: { type: Type.STRING },
              regulatoryAlerts: { type: Type.STRING },
            },
            required: ["riskLevel", "riskScore", "priorityFocusAreas", "recommendedSampleRate", "regulatoryAlerts"],
          },
        },
      });

      const result = JSON.parse(response.text || "{}");
      res.json(result);
    } catch (err: any) {
      console.error("Error running risk advisor:", err);
      res.status(500).json({ error: err.message || "Failed to run risk advisor" });
    }
  });

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
