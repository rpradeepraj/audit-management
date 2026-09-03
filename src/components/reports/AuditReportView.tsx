import React, { useState } from "react";
import { useAudit } from "../../context/AuditContext";
import {
  FileText,
  Printer,
  Download,
  CheckCircle2,
  AlertTriangle,
  Building,
  UserCheck,
  Calendar,
  Layers,
  Award,
  Clock,
  ShieldCheck,
  Edit3,
  Check,
  RotateCcw,
  ExternalLink,
  Copy,
  FileDown,
  ArrowLeft,
} from "lucide-react";

export interface AuditReportViewProps {
  onBack?: () => void;
  auditId?: string;
}

export const AuditReportView: React.FC<AuditReportViewProps> = ({
  onBack,
  auditId,
}) => {
  const {
    audits,
    templates,
    findings,
    capas,
    activeAuditId,
    setActiveAuditId,
    currentUser,
    signAuditReport,
    companyProfile,
  } = useAudit();

  const [selectedAuditId, setSelectedAuditId] = useState<string>(
    auditId ||
      activeAuditId ||
      audits.find((a) => a.status === "Completed" || a.status === "Under Review")?.id ||
      audits[0]?.id ||
      ""
  );

  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [customSummaryText, setCustomSummaryText] = useState<string>("");
  const [copyFeedback, setCopyFeedback] = useState(false);

  const currentAudit = audits.find((a) => a.id === selectedAuditId) || audits[0];
  const template = templates.find((t) => t.id === currentAudit?.templateId) || templates[0];
  const auditFindings = findings.filter((f) => f.auditId === currentAudit?.id);

  if (!currentAudit) {
    return (
      <div className="p-8 text-center text-slate-500">
        <FileText className="w-12 h-12 mx-auto text-slate-300 mb-3" />
        <p>No audit found for report generation.</p>
      </div>
    );
  }

  const isPassed = (currentAudit.overallScore || 0) >= (template?.passingScore || 80);

  const defaultSummary =
    currentAudit.executiveSummary ||
    `The ${currentAudit.standard} compliance audit of ${currentAudit.customerName} was conducted between ${currentAudit.startDate} and ${currentAudit.endDate} by Lead Auditor ${currentAudit.leadAuditorName}. The evaluation assessed operational processes, management governance, documentation controls, and evidence sampling against the ${currentAudit.standard} criteria. Overall compliance was calculated at ${currentAudit.overallScore || 88}%, with ${currentAudit.findingsCount?.major || 0} major and ${currentAudit.findingsCount?.minor || 0} minor non-conformities identified. Corrective action plans (CAPA) have been established with specified remediation due dates.`;

  const activeExecutiveSummary = customSummaryText || defaultSummary;

  const generateReportHtml = () => {
    return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Audit Report - ${currentAudit.auditNumber} - ${currentAudit.customerName}</title>
    <style>
      @page { size: A4 portrait; margin: 12mm; }
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        color: #0f172a;
        line-height: 1.5;
        margin: 0;
        padding: 20px;
        background: #ffffff;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .header { border-bottom: 3px solid #0f172a; padding-bottom: 14px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-start; }
      .title { font-size: 24px; font-weight: 800; margin: 0; color: #0f172a; }
      .subtitle { font-size: 13px; color: #64748b; margin-top: 4px; }
      .meta-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 14px; border-radius: 8px; margin-bottom: 20px; font-size: 12px; }
      .meta-label { font-size: 10px; text-transform: uppercase; color: #94a3b8; font-weight: 700; margin-bottom: 2px; }
      .meta-val { font-weight: 700; color: #1e293b; }
      .score-box { background: #0f172a; color: #ffffff; padding: 16px 20px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
      .score-outcome { font-size: 18px; font-weight: 800; }
      .score-num { font-size: 28px; font-weight: 900; }
      .section-title { font-size: 13px; font-weight: 800; text-transform: uppercase; color: #0f172a; margin-top: 20px; margin-bottom: 8px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; }
      .text-content { font-size: 12px; color: #334155; line-height: 1.6; background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 6px; }
      table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 11px; page-break-inside: avoid; }
      th { background: #f1f5f9; text-align: left; padding: 8px; font-weight: 700; border-bottom: 2px solid #cbd5e1; }
      td { padding: 8px; border-bottom: 1px solid #e2e8f0; }
      .badge-maj { background: #ffe4e6; color: #9f1239; font-weight: 700; padding: 2px 6px; border-radius: 4px; }
      .badge-min { background: #fef3c7; color: #92400e; font-weight: 700; padding: 2px 6px; border-radius: 4px; }
      .signatures { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-top: 30px; page-break-inside: avoid; }
      .sign-box { border: 1px solid #cbd5e1; padding: 12px; border-radius: 6px; background: #fafafa; }
      .sign-title { font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; }
      .sign-name { font-size: 12px; font-weight: 700; color: #0f172a; margin: 4px 0; }
      .sign-status { font-size: 11px; color: #059669; font-weight: 700; }
      .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px; }
    </style>
  </head>
  <body>
    <div class="header">
      <div>
        <div style="font-size: 11px; font-weight: 800; color: #4338ca; text-transform: uppercase; letter-spacing: 1px;">${companyProfile?.name || "Veritas Auditing & Assurance Partners"}</div>
        <h1 class="title">Formal Compliance Audit Report</h1>
        <div class="subtitle">Standard: <strong>${currentAudit.standard}</strong> • Template: ${template?.title || "Enterprise Audit Framework"}</div>
      </div>
      <div style="text-align: right;">
        <div style="font-size: 10px; font-weight: 700; color: #94a3b8;">DOSSIER REFERENCE</div>
        <div style="font-size: 16px; font-weight: 900; color: #312e81;">${currentAudit.auditNumber}</div>
        <div style="font-size: 11px; color: #64748b;">Issued: ${currentAudit.endDate}</div>
      </div>
    </div>

    <div class="meta-grid">
      <div>
        <div class="meta-label">Auditee Organization</div>
        <div class="meta-val">${currentAudit.customerName}</div>
      </div>
      <div>
        <div class="meta-label">Audit Engagement</div>
        <div class="meta-val">${currentAudit.auditType} Audit</div>
      </div>
      <div>
        <div class="meta-label">Lead Auditor</div>
        <div class="meta-val">${currentAudit.leadAuditorName}</div>
      </div>
      <div>
        <div class="meta-label">Auditee Representative</div>
        <div class="meta-val">${currentAudit.customerRepName || "Designated QA Lead"}</div>
      </div>
    </div>

    <div class="score-box">
      <div>
        <div style="font-size: 11px; text-transform: uppercase; color: #a5b4fc; font-weight: 700;">Audit Certification Result</div>
        <div class="score-outcome">${isPassed ? "✓ CONFORMITY VERIFIED" : "⚠ MAJOR DEFICIENCIES NOTED"}</div>
        <div style="font-size: 11px; color: #cbd5e1; margin-top: 2px;">Passing Standard: ${template?.passingScore || 80}%</div>
      </div>
      <div style="text-align: right;">
        <div style="font-size: 10px; text-transform: uppercase; color: #cbd5e1;">Overall Score</div>
        <div class="score-num">${currentAudit.overallScore || 0}%</div>
      </div>
    </div>

    <div class="section-title">1. Executive Summary & Assessment Scope</div>
    <div class="text-content">
      ${activeExecutiveSummary}
    </div>

    <div class="section-title">2. Section Compliance Breakdown</div>
    <table>
      <thead>
        <tr>
          <th>Section Title</th>
          <th>Questions Verified</th>
          <th>Conformance Rate</th>
        </tr>
      </thead>
      <tbody>
        ${(template?.sections || [])
          .map((sec) => {
            const secQuestions = sec.questions || [];
            const passedInSec = secQuestions.filter(
              (q) => currentAudit.responses[q.id]?.status === "PASS"
            ).length;
            const pct =
              secQuestions.length > 0 ? Math.round((passedInSec / secQuestions.length) * 100) : 100;
            return `
              <tr>
                <td><strong>${sec.title}</strong></td>
                <td>${passedInSec} of ${secQuestions.length} Compliant</td>
                <td><strong>${pct}%</strong></td>
              </tr>
            `;
          })
          .join("")}
      </tbody>
    </table>

    <div class="section-title">3. Identified Non-Conformities & Findings (${auditFindings.length})</div>
    ${
      auditFindings.length === 0
        ? `<div class="text-content" style="color: #059669; font-weight: 600;">✓ No non-conformities identified during this surveillance assessment.</div>`
        : `<table>
            <thead>
              <tr>
                <th>Finding #</th>
                <th>Clause</th>
                <th>Severity</th>
                <th>Finding Description</th>
                <th>Due Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${auditFindings
                .map(
                  (f) => `
                <tr>
                  <td><strong>${f.findingNumber}</strong></td>
                  <td><code>${f.requirementId}</code></td>
                  <td><span class="${f.severity === "Major" ? "badge-maj" : "badge-min"}">${f.severity}</span></td>
                  <td>${f.title}</td>
                  <td>${f.dueDate}</td>
                  <td><strong>${f.status}</strong></td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>`
    }

    <div class="section-title">4. Governance Sign-Off & Authorization</div>
    <div class="signatures">
      <div class="sign-box">
        <div class="sign-title">Lead Auditor</div>
        <div class="sign-name">${currentAudit.leadAuditorName}</div>
        <div class="sign-status">${currentAudit.signatures?.leadAuditor ? "✓ Signed: " + currentAudit.signatures.leadAuditor : "Pending Signature"}</div>
      </div>
      <div class="sign-box">
        <div class="sign-title">QA / Audit Manager</div>
        <div class="sign-name">QA Governance Authority</div>
        <div class="sign-status">${currentAudit.signatures?.manager ? "✓ Approved: " + currentAudit.signatures.manager : "Pending Approval"}</div>
      </div>
      <div class="sign-box">
        <div class="sign-title">Auditee Acknowledgment</div>
        <div class="sign-name">${currentAudit.customerRepName || "Auditee Representative"}</div>
        <div class="sign-status">${currentAudit.signatures?.customerRep ? "✓ Acknowledged: " + currentAudit.signatures.customerRep : "Pending Acknowledgment"}</div>
      </div>
    </div>

    <div class="footer">
      Accredited Body: ${companyProfile?.name || "Veritas Assurance Partners"} • Accreditation No: ${companyProfile?.accreditationNumber || "ANAB-CB-2026-8891"} • Confidential Audit Record
    </div>
  </body>
</html>`;
  };

  const formatSignature = (sig: any): string => {
    if (!sig) return "";
    if (typeof sig === "string") return sig;
    return `${sig.name || "Authorized"} • ${sig.signedAt || "Signed"}`;
  };

  const handlePrint = () => {
    // 100% Reliable Print Strategy:
    // Try printing with direct window.print() and iframe fallback for sandboxed environments
    try {
      window.print();
    } catch {
      try {
        const existingFrame = document.getElementById("audit-print-hidden-iframe");
        if (existingFrame) {
          existingFrame.remove();
        }

        const iframe = document.createElement("iframe");
        iframe.id = "audit-print-hidden-iframe";
        iframe.style.position = "fixed";
        iframe.style.right = "0";
        iframe.style.bottom = "0";
        iframe.style.width = "0px";
        iframe.style.height = "0px";
        iframe.style.border = "none";
        document.body.appendChild(iframe);

        const htmlContent = generateReportHtml();
        const doc = iframe.contentWindow?.document || iframe.contentDocument;
        if (doc) {
          doc.open();
          doc.write(htmlContent);
          doc.close();

          setTimeout(() => {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
          }, 300);
        }
      } catch (e) {
        console.error("Print error:", e);
      }
    }
  };

  const handleCopyReportText = () => {
    const textReport = `=====================================================
${companyProfile?.name || "Veritas Auditing & Assurance Partners"}
FORMAL COMPLIANCE AUDIT ASSESSMENT REPORT
=====================================================
Audit Reference : ${currentAudit.auditNumber}
Auditee         : ${currentAudit.customerName}
Standard        : ${currentAudit.standard}
Lead Auditor    : ${currentAudit.leadAuditorName}
Audit Dates     : ${currentAudit.startDate} to ${currentAudit.endDate}
Overall Score   : ${currentAudit.overallScore || 0}% (${isPassed ? "CONFORMITY VERIFIED" : "MAJOR DEFICIENCIES NOTED"})

1. EXECUTIVE SUMMARY:
${activeExecutiveSummary}

2. FINDINGS SUMMARY (${auditFindings.length} Total):
${
  auditFindings.length === 0
    ? "✓ No non-conformities identified."
    : auditFindings
        .map(
          (f) =>
            `- [${f.findingNumber}] ${f.severity.toUpperCase()} (${f.requirementId}): ${f.title} (Due: ${f.dueDate})`
        )
        .join("\n")
}

3. DIGITAL AUTHORIZATIONS:
- Lead Auditor: ${formatSignature(currentAudit.signatures?.leadAuditor) || "Pending"}
- QA Manager  : ${formatSignature(currentAudit.signatures?.manager) || "Pending"}
- Auditee Rep : ${formatSignature(currentAudit.signatures?.customerRep) || "Pending"}
=====================================================`;

    navigator.clipboard.writeText(textReport);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2500);
  };

  const handleSign = (role: "leadAuditor" | "manager" | "customerRep") => {
    signAuditReport(currentAudit.id, role, currentUser.name);
  };

  return (
    <div className="w-full p-2 sm:p-4 space-y-4 print:p-0 print:m-0 animate-in fade-in duration-150">
      {/* Top Single Unified Controls Bar (Hidden during printing) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-2xs text-xs print:hidden">
        {/* Left: Back button + Select Audit Dossier */}
        <div className="flex items-center gap-3 flex-wrap">
          {onBack && (
            <button
              onClick={onBack}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-300 shadow-2xs shrink-0"
              title="Return to Execution Workstation"
            >
              <ArrowLeft className="w-4 h-4 text-slate-600" />
              <span>Back to Execution Workstation</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600 whitespace-nowrap">Select Audit Dossier:</span>
            <select
              value={selectedAuditId}
              onChange={(e) => {
                setSelectedAuditId(e.target.value);
                setActiveAuditId(e.target.value);
              }}
              className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
            >
              {audits.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.auditNumber} - {a.customerName} ({a.status} - {a.overallScore || 0}%)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right: Actions (Edit Summary, Print Report / Save PDF) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsEditingSummary(!isEditingSummary)}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditingSummary ? "Done Editing" : "Edit Summary"}</span>
          </button>

          <button
            id="btn-print-audit-report"
            onClick={handlePrint}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs shadow-indigo-200 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Formal Audit Report Document */}
      <div
        id="audit-report-printable-area"
        className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-lg space-y-8 print:shadow-none print:border-none print:p-0 print:space-y-6"
      >
        {/* Document Header */}
        <div className="border-b-2 border-slate-900 pb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-700 text-xs font-bold uppercase tracking-widest mb-1">
              <span>{companyProfile?.name || "Veritas Auditing & Assurance Partners"}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Compliance Audit Assessment Report
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Standard: <strong>{currentAudit.standard}</strong> • Framework: {template?.title}
            </p>
          </div>

          <div className="text-right sm:self-center">
            <div className="text-[10px] uppercase font-mono font-bold text-slate-400">
              DOSSIER IDENTIFIER
            </div>
            <div className="text-base font-black font-mono text-indigo-900">
              {currentAudit.auditNumber}
            </div>
            <div className="text-[11px] text-slate-500">Issued: {currentAudit.endDate}</div>
          </div>
        </div>

        {/* Audit Metadata Summary Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Auditee Organization
            </span>
            <div className="font-bold text-slate-900 mt-0.5">{currentAudit.customerName}</div>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Audit Type</span>
            <div className="font-bold text-slate-900 mt-0.5">{currentAudit.auditType} Engagement</div>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Lead Auditor</span>
            <div className="font-bold text-slate-900 mt-0.5">{currentAudit.leadAuditorName}</div>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Customer Representative
            </span>
            <div className="font-bold text-slate-900 mt-0.5">
              {currentAudit.customerRepName || "Designated QA Lead"}
            </div>
          </div>
        </div>

        {/* Executive Score & Certification Outcome */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md print:bg-slate-900 print:text-white">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-xs uppercase font-bold text-indigo-300 tracking-wider">
              Overall Compliance Result
            </span>
            <div className="text-xl sm:text-2xl font-black flex items-center gap-2 justify-center sm:justify-start">
              {isPassed ? (
                <>
                  <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                  <span>CONFORMITY VERIFIED</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-7 h-7 text-amber-400" />
                  <span>MAJOR DEFICIENCIES NOTED</span>
                </>
              )}
            </div>
            <p className="text-xs text-slate-300">
              Required Passing Standard: {template?.passingScore || 80}% • Conformance Status:{" "}
              {isPassed ? "Recommendation for ISO Certification" : "Requires Corrective Actions"}
            </p>
          </div>

          <div className="text-center sm:text-right bg-white/10 px-6 py-4 rounded-xl backdrop-blur-xs border border-white/10">
            <span className="text-[10px] uppercase tracking-widest text-slate-300 font-bold block">
              Weighted Conformance Score
            </span>
            <div className="text-4xl font-black tracking-tight text-white mt-0.5">
              {currentAudit.overallScore || 0}%
            </div>
          </div>
        </div>

        {/* Executive Summary Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              1. Executive Summary & Audit Observations
            </h3>
          </div>

          {isEditingSummary ? (
            <div className="space-y-2">
              <textarea
                rows={5}
                value={customSummaryText || defaultSummary}
                onChange={(e) => setCustomSummaryText(e.target.value)}
                className="w-full p-3 text-xs text-slate-700 bg-slate-50 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed font-sans"
              />
              <button
                onClick={() => setIsEditingSummary(false)}
                className="px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-lg"
              >
                Save Summary
              </button>
            </div>
          ) : (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
              {activeExecutiveSummary}
            </div>
          )}
        </div>

        {/* Section Compliance Table */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            2. Section Compliance Breakdown
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Section Standard Scope</th>
                  <th className="p-3 text-center">Items Verified</th>
                  <th className="p-3 text-center">Weight</th>
                  <th className="p-3 text-right">Conformance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(template?.sections || []).map((sec, idx) => {
                  const secQuestions = sec.questions || [];
                  const passedInSec = secQuestions.filter(
                    (q) => currentAudit.responses[q.id]?.status === "PASS"
                  ).length;
                  const pct =
                    secQuestions.length > 0
                      ? Math.round((passedInSec / secQuestions.length) * 100)
                      : 100;

                  return (
                    <tr key={sec.id || idx} className="hover:bg-slate-50/50">
                      <td className="p-3 font-semibold text-slate-800">{sec.title}</td>
                      <td className="p-3 text-center text-slate-600 font-mono">
                        {passedInSec} / {secQuestions.length} Pass
                      </td>
                      <td className="p-3 text-center text-slate-600 font-mono">{sec.weight}%</td>
                      <td className="p-3 text-right">
                        <span
                          className={`px-2 py-0.5 rounded font-bold font-mono text-[11px] ${
                            pct >= 80
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {pct}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Identified Non-Conformities & Findings Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              3. Identified Non-Conformities & Findings ({auditFindings.length})
            </h3>
          </div>

          {auditFindings.length === 0 ? (
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>
                Zero non-conformities identified. Full compliance verified across all tested
                requirements.
              </span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Ref #</th>
                    <th className="p-3">Clause</th>
                    <th className="p-3">Severity</th>
                    <th className="p-3">Finding Description</th>
                    <th className="p-3">Due Date</th>
                    <th className="p-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {auditFindings.map((f) => (
                    <tr key={f.id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-mono font-bold text-indigo-700">{f.findingNumber}</td>
                      <td className="p-3 font-mono text-slate-600">{f.requirementId}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            f.severity === "Critical"
                              ? "bg-rose-100 text-rose-800"
                              : f.severity === "Major"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {f.severity}
                        </span>
                      </td>
                      <td className="p-3 font-medium text-slate-800 max-w-xs">{f.title}</td>
                      <td className="p-3 font-mono text-slate-600">{f.dueDate}</td>
                      <td className="p-3 text-right">
                        <span className="font-semibold text-slate-700">{f.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Tri-Party Digital Sign-Off Authorization */}
        <div className="space-y-3 pt-4 border-t-2 border-slate-200 text-xs">
          <h3 className="font-bold text-slate-900 uppercase tracking-wider">
            4. Digital Authorization & Governance Sign-Offs
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Lead Auditor Sign */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Lead Auditor Sign-Off
              </span>
              <div className="font-bold text-slate-900">{currentAudit.leadAuditorName}</div>
              {currentAudit.signatures?.leadAuditor ? (
                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg text-[10px] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Digitally Authorized: {formatSignature(currentAudit.signatures.leadAuditor)}</span>
                </div>
              ) : (
                <button
                  onClick={() => handleSign("leadAuditor")}
                  className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs print:hidden shadow-xs"
                >
                  Sign as Lead Auditor
                </button>
              )}
            </div>

            {/* Audit Manager Sign */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Audit Manager Approval
              </span>
              <div className="font-bold text-slate-900">QA Governance Manager</div>
              {currentAudit.signatures?.manager ? (
                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg text-[10px] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approved: {formatSignature(currentAudit.signatures.manager)}</span>
                </div>
              ) : (
                <button
                  onClick={() => handleSign("manager")}
                  className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs print:hidden shadow-xs"
                >
                  Sign as Manager
                </button>
              )}
            </div>

            {/* Customer Representative Sign */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Customer Acknowledgment
              </span>
              <div className="font-bold text-slate-900">
                {currentAudit.customerRepName || "Designated QA Lead"}
              </div>
              {currentAudit.signatures?.customerRep ? (
                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg text-[10px] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Acknowledged: {formatSignature(currentAudit.signatures.customerRep)}</span>
                </div>
              ) : (
                <button
                  onClick={() => handleSign("customerRep")}
                  className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs print:hidden shadow-xs"
                >
                  Sign as Customer Rep
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Accredited Auditing Body Footer */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400">
          <div>
            <span>Accredited Auditing Body: </span>
            <strong className="text-slate-600">{companyProfile?.name}</strong>
          </div>
          <div>
            <span>Accreditation Ref: </span>
            <strong className="text-slate-600">{companyProfile?.accreditationNumber}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
