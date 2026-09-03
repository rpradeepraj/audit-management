import React, { useState } from "react";
import { useAudit } from "../../context/AuditContext";
import { UserRole } from "../../types/audit";
import {
  CheckCircle2,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  ShieldCheck,
  Building2,
  UserCheck,
  ClipboardList,
  Eye as ViewerIcon,
} from "lucide-react";

export const AuthView: React.FC = () => {
  const { loginWithEmail, login, users } = useAudit();

  // Login form state - defaults to Admin credentials
  const [loginEmail, setLoginEmail] = useState("admin@auditfirm.com");
  const [loginPassword, setLoginPassword] = useState("password123");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleCredentialsLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    if (!loginEmail.trim()) {
      setLoginError("Please enter your email address.");
      return;
    }
    const res = loginWithEmail(loginEmail, loginPassword);
    if (!res.success) {
      setLoginError(res.error || "Invalid credentials.");
    }
  };

  const handleRoleQuickSelect = (userEmail: string) => {
    const userToLogin = users.find((u) => u.email.toLowerCase() === userEmail.toLowerCase());
    if (userToLogin) {
      login(userToLogin);
    } else {
      setLoginEmail(userEmail);
    }
  };

  const roleAccounts: {
    role: UserRole;
    name: string;
    email: string;
    org: string;
    icon: React.ReactNode;
    badgeStyle: string;
  }[] = [
    {
      role: "Admin",
      name: "Victoria Sterling",
      email: "admin@auditfirm.com",
      org: "Audit App Governance",
      icon: <ShieldCheck className="w-4 h-4 text-purple-400" />,
      badgeStyle: "bg-purple-900/50 text-purple-300 border-purple-700/50",
    },
    {
      role: "Company Admin",
      name: "Marcus Brody",
      email: "marcus.brody@veritasassurance.com",
      org: "Audit Firm Partners",
      icon: <Building2 className="w-4 h-4 text-blue-400" />,
      badgeStyle: "bg-blue-900/50 text-blue-300 border-blue-700/50",
    },
    {
      role: "Audit Manager",
      name: "Elena Vance",
      email: "elena.vance@veritasassurance.com",
      org: "Audit Firm Partners",
      icon: <ClipboardList className="w-4 h-4 text-indigo-400" />,
      badgeStyle: "bg-indigo-900/50 text-indigo-300 border-indigo-700/50",
    },
    {
      role: "Auditor",
      name: "David Chen",
      email: "david.chen@veritasassurance.com",
      org: "Audit Firm Partners",
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
      badgeStyle: "bg-emerald-900/50 text-emerald-300 border-emerald-700/50",
    },
    {
      role: "Customer Representative",
      name: "Sarah Jenkins",
      email: "s.jenkins@apexlogistics.com",
      org: "Apex Global Logistics",
      icon: <UserCheck className="w-4 h-4 text-amber-400" />,
      badgeStyle: "bg-amber-900/50 text-amber-300 border-amber-700/50",
    },
    {
      role: "Customer Viewer",
      name: "Robert Hayes",
      email: "r.hayes@apexlogistics.com",
      org: "Apex Global Logistics",
      icon: <ViewerIcon className="w-4 h-4 text-slate-400" />,
      badgeStyle: "bg-slate-800 text-slate-300 border-slate-700",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-100">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 mb-3">
            <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Audit App</h1>
          <p className="text-xs text-slate-400 mt-1">Enterprise Audit Lifecycle & Compliance Assurance</p>
        </div>

        {/* Card Container */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-5">
          <div className="border-b border-slate-800/80 pb-3 flex items-center justify-between">
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-indigo-400" />
              <span>Sign In to Audit App</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
              Secure Access
            </span>
          </div>

          {/* Login Form */}
          <form onSubmit={handleCredentialsLogin} className="space-y-4">
            {loginError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showLoginPassword ? "text" : "password"}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Switcher */}
          <div className="pt-3 border-t border-slate-800">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
              Quick Role Sign In (Demo Profiles)
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {roleAccounts.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => handleRoleQuickSelect(account.email)}
                  className="p-2.5 bg-slate-950/80 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 rounded-xl text-left transition-all flex items-center gap-2.5 group cursor-pointer"
                >
                  <div className="shrink-0 p-1.5 rounded-lg bg-slate-900 group-hover:bg-slate-800 border border-slate-800">
                    {account.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-200 group-hover:text-white truncate">
                      {account.name}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`text-[9px] px-1.5 py-0.2 rounded border font-semibold ${account.badgeStyle}`}>
                        {account.role}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
