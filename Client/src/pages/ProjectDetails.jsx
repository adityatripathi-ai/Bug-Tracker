import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  FolderKanban,
  Bug,
  CheckCircle2,
  Clock3,
  AlertCircle,
  Plus,
  LoaderCircle,
} from "lucide-react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { PriorityBadge, StatusBadge } from "../components/StatusBadges";
import { countByStatus } from "../utils/helpers";

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [projectsRes, bugsRes] = await Promise.all([
          api.get("/projects"),
          api.get("/bugs").catch(() => ({ data: { bugs: [] } })),
        ]);

        const found = (projectsRes.data.projects || []).find(
          (item) => String(item._id) === String(id)
        );

        if (!found) {
          setError("Project not found");
          return;
        }

        setProject(found);
        const projectBugs = (bugsRes.data.bugs || []).filter(
          (bug) => String(bug.project?._id || bug.project) === String(id)
        );
        setBugs(projectBugs);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load project");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center gap-2 text-slate-500">
        <LoaderCircle size={22} className="animate-spin text-blue-600" />
        Loading project...
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 text-center max-w-md mx-auto">
        <AlertCircle size={28} className="mx-auto text-red-500" />
        <h2 className="text-xl font-bold text-slate-800 mt-4">
          Project Not Found
        </h2>
        <p className="text-sm text-slate-500 mt-2">{error}</p>
        <button
          onClick={() => navigate("/projects")}
          className="mt-5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold"
        >
          Back to Projects
        </button>
      </div>
    );
  }

  const stats = [
    { label: "Total Bugs", value: bugs.length, icon: Bug, color: "bg-blue-50 text-blue-600" },
    {
      label: "Open",
      value: countByStatus(bugs, "open") + countByStatus(bugs, "reopened"),
      icon: AlertCircle,
      color: "bg-red-50 text-red-500",
    },
    {
      label: "In Progress",
      value: countByStatus(bugs, "in-progress"),
      icon: Clock3,
      color: "bg-amber-50 text-amber-500",
    },
    {
      label: "Closed",
      value: countByStatus(bugs, "closed"),
      icon: CheckCircle2,
      color: "bg-green-50 text-green-600",
    },
  ];

  return (
    <div>
      <button
        onClick={() => navigate("/projects")}
        className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 mb-4 sm:mb-5"
      >
        <ArrowLeft size={16} />
        Back to Projects
      </button>

      {/* Project header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm mb-4 sm:mb-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-start gap-3 sm:gap-4 min-w-0">
            <div className="w-11 h-11 sm:w-12 sm:h-12 shrink-0 rounded-2xl bg-brand text-white flex items-center justify-center">
              <FolderKanban size={22} />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 break-words">
                {project.name}
              </h1>
              <p className="text-sm text-slate-500 mt-1 max-w-2xl break-words">
                {project.description || "No description available."}
              </p>
            </div>
          </div>
          {user?.role === "qa" && (
            <button
              onClick={() =>
                navigate("/report-bug", {
                  state: { projectId: project._id },
                })
              }
              className="w-full lg:w-auto shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold"
            >
              <Plus size={16} />
              Report Bug
            </button>
          )}
        </div>
      </div>

      {/* Stats: on mobile 2 column */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm text-slate-500 truncate">{stat.label}</p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">
                    {stat.value}
                  </h3>
                </div>
                <div
                  className={`hidden sm:flex w-11 h-11 shrink-0 rounded-xl items-center justify-center ${stat.color}`}
                >
                  <Icon size={20} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bug list */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-4 sm:px-5 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-800">Project Bugs</h2>
        </div>
        {bugs.length === 0 ? (
          <div className="py-14 px-4 text-center text-sm text-slate-400">
            No bugs reported for this project
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {bugs.map((bug) => (
              <button
                key={bug._id}
                onClick={() => navigate(`/bugs/${bug._id}`)}
                className="w-full text-left px-4 sm:px-5 py-4 hover:bg-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 break-words">
                    {bug.title}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                    {bug.description}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <PriorityBadge priority={bug.priority} />
                  <StatusBadge status={bug.status} />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetails;