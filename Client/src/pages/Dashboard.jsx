import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bug, Clock3, CheckCircle2, AlertCircle, LoaderCircle } from "lucide-react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { PriorityBadge, StatusBadge, TypeBadge } from "../components/StatusBadges";
import BugCard from "../components/BugCard";
import { countByStatus, relativeTime } from "../utils/helpers";

const DEV_ROLES = ["frontend", "backend", "server"];

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isDev = DEV_ROLES.includes(user?.role);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const response = await api.get(isDev ? "/bugs/my-bugs" : "/bugs");
        setBugs(response.data.bugs || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    if (user) load();
  }, [user, isDev]);

  const stats = useMemo(
    () => [
      { label: "Total Bugs", value: bugs.length, icon: Bug, color: "bg-blue-50 text-blue-600" },
      {
        label: "Open",
        value: countByStatus(bugs, "open") + countByStatus(bugs, "reopened"),
        icon: AlertCircle,
        color: "bg-red-50 text-red-600",
      },
      {
        label: "In Progress",
        value: countByStatus(bugs, "in-progress"),
        icon: Clock3,
        color: "bg-amber-50 text-amber-600",
      },
      {
        label: "Closed",
        value: countByStatus(bugs, "closed"),
        icon: CheckCircle2,
        color: "bg-green-50 text-green-600",
      },
    ],
    [bugs]
  );

  const recentBugs = bugs.slice(0, 8);
  const openBug = (id) => navigate(`/bugs/${id}`);

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-slate-500 gap-2">
        <LoaderCircle className="animate-spin text-blue-600" size={22} />
        Loading dashboard...
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm sm:text-base text-slate-500 mt-1">
          Overview of bugs across your workspace
        </p>
      </div>

      {error && (
        <div className="mb-5 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-5 mb-6 sm:mb-7">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm sm:text-base text-slate-500 truncate">{stat.label}</p>
                  <h3 className="text-2xl sm:text-4xl font-bold text-slate-900 mt-1 sm:mt-2">
                    {stat.value}
                  </h3>
                </div>
                <div
                  className={`hidden sm:flex w-12 h-12 lg:w-14 lg:h-14 shrink-0 rounded-2xl items-center justify-center ${stat.color}`}
                >
                  <Icon size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-3 mb-3 sm:mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Recent Bugs</h2>
          <p className="text-sm text-slate-500">Latest reported issues</p>
        </div>
        <button
          onClick={() => navigate(isDev ? "/my-bugs" : "/bugs")}
          className="text-sm sm:text-base font-semibold text-blue-600 hover:text-blue-700 shrink-0"
        >
          View all
        </button>
      </div>

      {recentBugs.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl py-16 text-center text-slate-400">
          No bugs reported yet
        </div>
      ) : (
        <>
          {/* Mobile + tablet: cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 xl:hidden">
            {recentBugs.map((bug) => (
              <BugCard key={bug._id} bug={bug} showCreated onOpen={() => openBug(bug._id)} />
            ))}
          </div>

          {/* Laptop / desktop: table */}
          <div className="hidden xl:block bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3.5 font-semibold">Bug</th>
                    <th className="px-4 py-3.5 font-semibold">Type</th>
                    <th className="px-4 py-3.5 font-semibold">Priority</th>
                    <th className="px-4 py-3.5 font-semibold">Status</th>
                    <th className="px-4 py-3.5 font-semibold">Assigned To</th>
                    <th className="px-5 py-3.5 font-semibold">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentBugs.map((bug) => (
                    <tr
                      key={bug._id}
                      onClick={() => openBug(bug._id)}
                      className="hover:bg-slate-50 cursor-pointer"
                    >
                      <td className="px-5 py-4 max-w-[320px]">
                        <p className="text-sm font-semibold text-slate-800 truncate">{bug.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">
                          {bug.project?.name || "—"}
                        </p>
                      </td>
                      <td className="px-4 py-4"><TypeBadge type={bug.type} /></td>
                      <td className="px-4 py-4"><PriorityBadge priority={bug.priority} /></td>
                      <td className="px-4 py-4"><StatusBadge status={bug.status} /></td>
                      <td className="px-4 py-4 text-sm text-slate-600">
                        {bug.assignedTo?.name || "Unassigned"}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-500 whitespace-nowrap">
                        {relativeTime(bug.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;