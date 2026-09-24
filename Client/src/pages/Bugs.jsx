import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  LoaderCircle,
  AlertCircle,
  ChevronDown,
  Link as LinkIcon,
  Video,
} from "lucide-react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { PriorityBadge, StatusBadge, TypeBadge } from "../components/StatusBadges";
import AssignBugModal from "../components/AssignBugModal";
import BugCard from "../components/BugCard";

const FixProof = ({ bug }) => {
  const url = bug.fixLink || bug.fixVideoUrl;
  if (!url) return <span className="text-sm text-slate-400">No fix proof</span>;
  const Icon = bug.fixLink ? LinkIcon : Video;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-600 hover:text-green-700"
    >
      <Icon size={14} />
      {bug.fixLink ? "View link" : "View video"}
    </a>
  );
};

const Bugs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bugs, setBugs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [assignBug, setAssignBug] = useState(null);

  const isAdmin = user?.role === "admin";

  const loadBugs = async () => {
    try {
      setLoading(true);
      const [bugsRes, projectsRes] = await Promise.all([
        api.get("/bugs"),
        api.get("/projects"),
      ]);
      setBugs(bugsRes.data.bugs || []);
      setProjects(projectsRes.data.projects || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load bugs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBugs();
  }, []);

  const filteredBugs = useMemo(() => {
    return bugs.filter((bug) => {
      const matchesSearch = bug.title?.toLowerCase().includes(search.toLowerCase());
      const matchesProject =
        !projectFilter || String(bug.project?._id || bug.project) === projectFilter;
      const matchesStatus = !statusFilter || bug.status === statusFilter;
      const matchesPriority = !priorityFilter || bug.priority === priorityFilter;
      return matchesSearch && matchesProject && matchesStatus && matchesPriority;
    });
  }, [bugs, search, projectFilter, statusFilter, priorityFilter]);

  const filters = [
    {
      value: projectFilter,
      setter: setProjectFilter,
      options: [
        { value: "", label: "All Projects" },
        ...projects.map((p) => ({ value: p._id, label: p.name })),
      ],
    },
    {
      value: statusFilter,
      setter: setStatusFilter,
      options: [
        { value: "", label: "All Status" },
        { value: "open", label: "Open" },
        { value: "in-progress", label: "In Progress" },
        { value: "fixed", label: "Fixed" },
        { value: "reopened", label: "Reopened" },
        { value: "closed", label: "Closed" },
      ],
    },
    {
      value: priorityFilter,
      setter: setPriorityFilter,
      options: [
        { value: "", label: "All Priority" },
        { value: "low", label: "Low" },
        { value: "medium", label: "Medium" },
        { value: "high", label: "High" },
        { value: "critical", label: "Critical" },
      ],
    },
  ];

  const AssignAction = ({ bug }) =>
    !bug.assignedTo ? (
      <button
        onClick={(e) => {
          e.stopPropagation();
          setAssignBug(bug);
        }}
        className="text-sm font-semibold text-blue-600 hover:text-blue-700"
      >
        Assign
      </button>
    ) : (
      <span className="text-xs text-slate-400">Assigned</span>
    );

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-5 sm:mb-6">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Bugs</h1>
          <p className="text-sm sm:text-base text-slate-500 mt-1">
            Browse and filter all reported bugs
          </p>
        </div>
        {user?.role === "qa" && (
          <button
            onClick={() => navigate("/report-bug")}
            className="shrink-0 ml-auto inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-semibold"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Report Bug</span>
            <span className="sm:hidden">Report</span>
          </button>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 mb-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search bugs..."
            className="w-full h-11 pl-9 pr-3 rounded-lg border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {filters.map((filter, index) => (
          <div key={index} className="relative">
            <select
              value={filter.value}
              onChange={(e) => filter.setter(e.target.value)}
              className="w-full h-11 appearance-none px-3 pr-9 rounded-lg border border-slate-200 text-sm bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              {filter.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="absolute right-3 top-3.5 text-slate-400 pointer-events-none"
            />
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-5 flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3 text-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-2xl py-16 flex items-center justify-center gap-2 text-slate-500">
          <LoaderCircle className="animate-spin text-blue-600" size={22} />
          Loading bugs...
        </div>
      ) : filteredBugs.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl py-16 text-center text-sm text-slate-400">
          No bugs match these filters
        </div>
      ) : (
        <>
          {/* Mobile + tablet: cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 xl:hidden">
            {filteredBugs.map((bug) => (
              <BugCard key={bug._id} bug={bug} onOpen={() => navigate(`/bugs/${bug._id}`)}>
                <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
                  <FixProof bug={bug} />
                  {isAdmin && <AssignAction bug={bug} />}
                </div>
              </BugCard>
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
                    <th className="px-4 py-3.5 font-semibold">Fix Proof</th>
                    <th className="px-4 py-3.5 font-semibold">Assigned To</th>
                    {isAdmin && <th className="px-5 py-3.5 font-semibold">Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBugs.map((bug) => (
                    <tr key={bug._id} className="hover:bg-slate-50">
                      <td className="px-5 py-4 max-w-[300px]">
                        <button
                          onClick={() => navigate(`/bugs/${bug._id}`)}
                          className="text-sm font-semibold text-slate-800 hover:text-blue-600 text-left block max-w-full truncate"
                        >
                          {bug.title}
                        </button>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">
                          {bug.project?.name || "—"}
                        </p>
                      </td>
                      <td className="px-4 py-4"><TypeBadge type={bug.type} /></td>
                      <td className="px-4 py-4"><PriorityBadge priority={bug.priority} /></td>
                      <td className="px-4 py-4"><StatusBadge status={bug.status} /></td>
                      <td className="px-4 py-4"><FixProof bug={bug} /></td>
                      <td className="px-4 py-4 text-sm text-slate-600">
                        {bug.assignedTo?.name || "Unassigned"}
                      </td>
                      {isAdmin && (
                        <td className="px-5 py-4"><AssignAction bug={bug} /></td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {assignBug && (
        <AssignBugModal
          bug={assignBug}
          onClose={() => setAssignBug(null)}
          onAssigned={() => loadBugs()}
        />
      )}
    </div>
  );
};

export default Bugs;