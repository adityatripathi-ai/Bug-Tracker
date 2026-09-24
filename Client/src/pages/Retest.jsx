import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check,
  X,
  LoaderCircle,
  AlertCircle,
  ClipboardCheck,
} from "lucide-react";
import api from "../api/client";
import {
  PriorityBadge,
  StatusBadge,
  TypeBadge,
} from "../components/StatusBadges";

const Retest = () => {
  const navigate = useNavigate();
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notes, setNotes] = useState({});
  const [submittingId, setSubmittingId] = useState(null);

  const loadBugs = async () => {
    try {
      setLoading(true);
      const response = await api.get("/bugs");
      const fixedBugs = (response.data.bugs || []).filter(
        (bug) => bug.status === "fixed"
      );
      setBugs(fixedBugs);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load retest queue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBugs();
  }, []);

  const handleRetest = async (bugId, result) => {
    try {
      setSubmittingId(bugId);
      setError("");
      await api.patch(`/bugs/retest/${bugId}`, { result });
      await loadBugs();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit retest");
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div>
      <div className="mb-5 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">QA Retest</h1>
        <p className="text-sm sm:text-base text-slate-500 mt-1">
          Verify fixed bugs and mark them as Pass or Fail
        </p>
      </div>

      {error && (
        <div className="mb-5 flex items-start gap-2 bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3 text-sm">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-16 flex items-center justify-center gap-2 text-slate-500">
          <LoaderCircle className="animate-spin text-blue-600" size={22} />
          Loading fixed bugs...
        </div>
      ) : bugs.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <ClipboardCheck size={26} />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mt-4">
            No bugs to retest
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Fixed bugs will appear here for QA verification.
          </p>
        </div>
      ) : (
        /* Laptop (xl) par 2 cards side by side, mobile par ek ke neeche ek */
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-5 items-start">
          {bugs.map((bug) => (
            <div
              key={bug._id}
              className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm"
            >
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <StatusBadge status={bug.status} />
                <PriorityBadge priority={bug.priority} />
                <TypeBadge type={bug.type} />
              </div>

              <button
                onClick={() => navigate(`/bugs/${bug._id}`)}
                className="text-base sm:text-lg font-bold text-slate-900 hover:text-blue-600 text-left break-words"
              >
                {bug.title}
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-sm">
                <div className="min-w-0">
                  <p className="text-xs text-slate-400">Project</p>
                  <p className="font-semibold text-slate-700 break-words">
                    {bug.project?.name || "—"}
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-400">Reported By</p>
                  <p className="font-semibold text-slate-700 break-words">
                    {bug.reportedBy?.name || "—"}
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-400">Assigned To</p>
                  <p className="font-semibold text-slate-700 break-words">
                    {bug.assignedTo?.name || "—"}
                  </p>
                </div>
              </div>

              <p className="text-sm text-slate-600 mt-4 line-clamp-3 break-words">
                {bug.description}
              </p>

              <div className="mt-5">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Retest notes (optional)
                </label>
                <textarea
                  value={notes[bug._id] || ""}
                  onChange={(e) =>
                    setNotes((prev) => ({ ...prev, [bug._id]: e.target.value }))
                  }
                  rows={2}
                  placeholder="Add verification notes..."
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 text-base sm:text-sm outline-none resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => handleRetest(bug._id, "passed")}
                  disabled={submittingId === bug._id}
                  className="flex items-center justify-center gap-2 h-12 rounded-xl bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold text-sm"
                >
                  <Check size={18} />
                  Pass: bug is fixed
                </button>
                <button
                  onClick={() => handleRetest(bug._id, "failed")}
                  disabled={submittingId === bug._id}
                  className="flex items-center justify-center gap-2 h-12 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold text-sm"
                >
                  <X size={18} />
                  Fail: bug still exists
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Retest;