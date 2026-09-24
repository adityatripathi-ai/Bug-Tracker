import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { RoleBadge } from "../components/StatusBadges";
import { formatRole, getInitials } from "../utils/helpers";

const Settings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-5 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm sm:text-base text-slate-500 mt-1">
          Manage your account preferences
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Profile header with brand gradient */}
        <div className="bg-brand px-4 sm:px-6 py-5 sm:py-6 flex items-center gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-full bg-white/20 text-white flex items-center justify-center text-lg sm:text-xl font-bold">
            {getInitials(user?.name)}
          </div>
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-white truncate">
              {user?.name}
            </h2>
            <p className="text-sm text-white/80 truncate">{user?.email}</p>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-3 py-3 border-b border-slate-100">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-700">Role</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Your workspace access level
                </p>
              </div>
              <RoleBadge role={user?.role} />
            </div>

            <div className="flex items-center justify-between gap-3 py-3 border-b border-slate-100">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-700">Account type</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {formatRole(user?.role)} member
                </p>
              </div>
              <span className="shrink-0 text-xs font-semibold text-green-600 bg-green-50 border border-green-100 px-2.5 py-1 rounded-md">
                Active
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="mt-6 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;