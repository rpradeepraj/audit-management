import React from "react";
import { useAudit } from "../../context/AuditContext";
import { FirmAuditPlanningTab } from "../company-admin/FirmAuditPlanningTab";

/**
 * Audit Planning Screen
 * Renders the full Audit Firm -> Audit Planning tab, pre-configured with CyberGuard Compliance Registrars
 * and featuring the accredited "Schedule New Audit Plan for CyberGuard Compliance Registrars" popup workflow.
 */
export const AuditPlanningView: React.FC = () => {
  const { firms, selectedFirm, setSelectedFirmId, setActiveTab } = useAudit();

  // Find CyberGuard Compliance Registrars as requested
  const cyberGuardFirm =
    firms.find((f) => f.id === "firm_cyber_guard" || f.name.includes("CyberGuard")) ||
    selectedFirm ||
    firms[0];

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6 animate-in fade-in duration-150">
      <FirmAuditPlanningTab
        selectedFirm={cyberGuardFirm}
        onSelectFirm={(f) => setSelectedFirmId(f.id)}
        onOpenFirmDetail={() => setActiveTab("company-admin")}
      />
    </div>
  );
};
