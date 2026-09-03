import React from "react";
import { useAudit } from "../../context/AuditContext";
import { X, Check, Bell, AlertTriangle, Info, CheckCircle2, ShieldAlert } from "lucide-react";
import { ActiveTab } from "../../types/audit";

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    setActiveTab,
    setActiveAuditId,
    setActiveFindingId,
    setActiveCapaId,
  } = useAudit();

  if (!isOpen) return null;

  const handleNotificationClick = (notif: typeof notifications[0]) => {
    markNotificationRead(notif.id);
    if (notif.linkTab) {
      setActiveTab(notif.linkTab as ActiveTab);
      if (notif.linkTab === "planning" || notif.linkTab === "perform" || notif.linkTab === "reports") {
        if (notif.linkEntityId) setActiveAuditId(notif.linkEntityId);
      } else if (notif.linkTab === "findings") {
        if (notif.linkEntityId) setActiveFindingId(notif.linkEntityId);
      } else if (notif.linkTab === "capa") {
        if (notif.linkEntityId) setActiveCapaId(notif.linkEntityId);
      }
      onClose();
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "danger":
        return <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />;
      case "success":
        return <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-indigo-500 shrink-0" />;
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 transition-opacity"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 max-w-xl w-full bg-white shadow-2xl z-50 flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Bell className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-base">Notifications & Alerts</h3>
            <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full font-semibold">
              {notifications.length}
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={markAllNotificationsRead}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold px-2.5 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              Mark all read
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-sm">
              No notifications at this time.
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  notif.read
                    ? "bg-slate-50/70 border-slate-200 text-slate-600"
                    : "bg-indigo-50/40 border-indigo-200 shadow-xs text-slate-800 hover:bg-indigo-50/70"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{getIcon(notif.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-bold text-slate-900 truncate">
                        {notif.title}
                      </h4>
                      <span className="text-xs text-slate-400 shrink-0 font-medium">
                        {notif.timestamp}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
                      {notif.message}
                    </p>
                    {notif.linkTab && (
                      <div className="mt-2.5 flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700">
                        <span>View details in {notif.linkTab.toUpperCase()}</span>
                        <span>→</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};
