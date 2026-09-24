import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FolderKanban, Plus, LoaderCircle, AlertCircle } from "lucide-react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import CreateProject from "../components/CreateProject";
import { countByStatus } from "../utils/helpers";

const Projects = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const canCreate = user?.role === "admin" || user?.role === "qa";

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [projectsRes, bugsRes] = await Promise.all([
        api.get("/projects"),
        api.get("/bugs").catch(() => ({ data: { bugs: [] } })),
      ]);
      setProjects(projectsRes.data.projects || []);
      setBugs(bugsRes.data.bugs || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const projectStats = useMemo(() => {
    const map = {};
    projects.forEach((project) => {
      const projectBugs = bugs.filter(
        (bug) => String(bug.project?._id || bug.project) === String(project._id)
      );
      map[project._id] = {
        total: projectBugs.length,
        open:
          countByStatus(projectBugs, "open") +
          countByStatus(projectBugs, "reopened"),
        closed: countByStatus(projectBugs, "closed"),
      };
    });
    return map;
  }, [projects, bugs]);

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-5 sm:mb-6">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Projects</h1>
          <p className="text-sm sm:text-base text-slate-500 mt-1">
            Manage and track your testing projects.
          </p>
        </div>
        {canCreate && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="shrink-0 ml-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-semibold"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Create Project</span>
            <span className="sm:hidden">New</span>
          </button>
        )}
      </div>

      {error && (
        <div className="mb-5 flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3 text-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {loading ? (
        <div className="min-h-[280px] flex items-center justify-center gap-2 text-slate-500">
          <LoaderCircle size={22} className="animate-spin text-blue-600" />
          Loading projects...
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <FolderKanban size={26} />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mt-4">
            No projects found
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Create your first project to start tracking bugs.
          </p>
          {canCreate && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-5 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold"
            >
              <Plus size={16} />
              Create Project
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4 sm:gap-5">
          {projects.map((project) => {
            const stats = projectStats[project._id] || {
              total: 0,
              open: 0,
              closed: 0,
            };
            return (
              <div
                key={project._id}
                className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition flex flex-col"
              >
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl bg-brand text-white flex items-center justify-center shrink-0">
                    <FolderKanban size={20} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 truncate">
                      {project.name}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                      {project.description || "No description available."}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-4 sm:mt-5">
                  <div className="rounded-xl bg-slate-50 px-2 sm:px-3 py-2 text-center">
                    <p className="text-xs text-slate-500">Total</p>
                    <p className="text-base font-bold text-slate-800">{stats.total}</p>
                  </div>
                  <div className="rounded-xl bg-red-50 px-2 sm:px-3 py-2 text-center">
                    <p className="text-xs text-red-500">Open</p>
                    <p className="text-base font-bold text-red-600">{stats.open}</p>
                  </div>
                  <div className="rounded-xl bg-green-50 px-2 sm:px-3 py-2 text-center">
                    <p className="text-xs text-green-600">Closed</p>
                    <p className="text-base font-bold text-green-700">
                      {stats.closed}
                    </p>
                  </div>
                </div>

                <div className="mt-4 sm:mt-5 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => navigate(`/projects/${project._id}`)}
                    className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                  >
                    View project →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showCreateModal && (
        <CreateProject
          onClose={() => setShowCreateModal(false)}
          onCreated={(project) =>
            setProjects((prev) => [project, ...prev])
          }
        />
      )}
    </div>
  );
};

export default Projects;