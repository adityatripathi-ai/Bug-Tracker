import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  LoaderCircle,
  AlertCircle,
  ExternalLink,
  Video,
  Link as LinkIcon,
} from "lucide-react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import {
  PriorityBadge,
  StatusBadge,
  TypeBadge,
} from "../components/StatusBadges";
import AssignBugModal from "../components/AssignBugModal";
import DeveloperStatusSelect from "../components/DeveloperStatusSelect";
import FixProofPopover from "../components/FixProofPopover";
import { relativeTime } from "../utils/helpers";

const lifecycleSteps = ["open", "in-progress", "fixed", "closed"];

const getStepIndex = (status) => {
  if (status === "reopened") return 0;
  const index = lifecycleSteps.indexOf(status);
  return index >= 0 ? index : 0;
};

const BugDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bug, setBug] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [savingProof, setSavingProof] = useState(false);
  const [error, setError] = useState("");
  const [showAssign, setShowAssign] = useState(false);

  const loadBug = async () => {
    try {
      setLoading(true);
      const isDev = ["frontend", "backend", "server"].includes(user?.role);
      const response = await api.get(isDev ? "/bugs/my-bugs" : "/bugs");
      let found = (response.data.bugs || []).find(
        (item) => String(item._id) === String(id)
      );

      if (!found && isDev) {
        const allRes = await api.get("/bugs");
        found = (allRes.data.bugs || []).find(
          (item) => String(item._id) === String(id)
        );
      }

      if (!found) {
        setError("Bug not found");
        return;
      }
      setBug(found);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load bug");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadBug();
  }, [id, user]);

  const isAssignee =
    ["frontend", "backend", "server"].includes(user?.role) &&
    String(bug?.assignedTo?._id || bug?.assignedTo) ===
      String(user?.id || user?._id);

  const updateStatus = async (status) => {
    try {
      setUpdating(true);
      setError("");
      const response = await api.put(`/bugs/status/${bug._id}`, { status });
      if (response.data.bug) {
        setBug(response.data.bug);
      } else {
        await loadBug();
      }
    } catch (err) {
      console.log("STATUS UPDATE ERROR:", err.response?.data || err.message);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Failed to update status"
      );
    } finally {
      setUpdating(false);
    }
  };

  const saveFixProof = async (proof) => {
    try {
      setSavingProof(true);
      setError("");

      const payload = new FormData();
      if (proof.type === "video") {
        payload.append("fixVideo", proof.file);
      } else {
        payload.append("fixLink", proof.link);
      }

      const response = await api.patch(`/bugs/fix-proof/${bug._id}`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.data.bug) setBug(response.data.bug);
    } catch (err) {
      console.log("FIX PROOF ERROR:", err.response?.data || err.message);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Failed to save fix proof"
      );
    } finally {
      setSavingProof(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center gap-2 text-slate-500 text-base">
        <LoaderCircle size={24} className="animate-spin text-blue-600" />
        Loading bug...
      </div>
    );
  }

  if (error && !bug) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 text-center max-w-md mx-auto">
        <AlertCircle size={36} className="mx-auto text-red-500" />
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mt-4">
          Bug Not Found
        </h2>
        <p className="text-sm sm:text-base text-slate-500 mt-2">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-5 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-base font-semibold"
        >
          Go Back
        </button>
      </div>
    );
  }

  const activeIndex = getStepIndex(bug.status);
  const hasFixProof = bug.fixLink || bug.fixVideoUrl;

  const proofBtn =
    "inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-white text-sm font-semibold";

  return (
    <div className="max-w-5xl">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm sm:text-base font-medium text-slate-500 hover:text-blue-600 mb-4 sm:mb-5"
      >
        <ArrowLeft size={18} />
        Back
      </button>

      {/* Title + actions */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5 sm:mb-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <PriorityBadge priority={bug.priority} />
            <StatusBadge status={bug.status} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 break-words">
            {bug.title}
          </h1>
        </div>

        {user?.role === "admin" && !bug.assignedTo && (
          <button
            onClick={() => setShowAssign(true)}
            className="w-full sm:w-auto shrink-0 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold"
          >
            Assign Bug
          </button>
        )}
      </div>

      {error && (
        <div className="mb-5 flex items-start gap-2 bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3 text-sm sm:text-base">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {/* Developer: update status */}
      {isAssignee && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 sm:p-5 mb-4 sm:mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <p className="text-base font-bold text-slate-800">Update Status</p>
            <p className="text-sm text-slate-500 mt-0.5">
              Mark this bug as In Progress or Fixed
            </p>
          </div>
          <DeveloperStatusSelect
            className="w-full sm:w-auto"
            status={bug.status}
            loading={updating}
            onChange={updateStatus}
          />
        </div>
      )}

      {/* QA reference */}
      {(bug.issueLink || bug.issueVideoUrl) && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 mb-4 sm:mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <p className="text-base font-bold text-slate-800">QA Reference</p>
            <p className="text-sm text-slate-500 mt-0.5">
              Shared by QA when this bug was reported
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {bug.issueLink && (
              <a
                href={bug.issueLink}
                target="_blank"
                rel="noopener noreferrer"
                className={`${proofBtn} bg-slate-700 hover:bg-slate-800`}
              >
                <LinkIcon size={16} />
                Open Link
                <ExternalLink size={14} />
              </a>
            )}
            {bug.issueVideoUrl && (
              <a
                href={bug.issueVideoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`${proofBtn} bg-slate-700 hover:bg-slate-800`}
              >
                <Video size={16} />
                View Video
                <ExternalLink size={14} />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Fix proof */}
      {(isAssignee || hasFixProof) && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 mb-4 sm:mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <p className="text-base font-bold text-slate-800">Fix Proof</p>
            <p className="text-sm text-slate-500 mt-0.5">
              {hasFixProof
                ? "Shared by the developer to show the fix"
                : "Add a link or short video showing the fix"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {bug.fixLink && (
              <a
                href={bug.fixLink}
                target="_blank"
                rel="noopener noreferrer"
                className={`${proofBtn} bg-green-600 hover:bg-green-700`}
              >
                <LinkIcon size={16} />
                Open Link
                <ExternalLink size={14} />
              </a>
            )}
            {bug.fixVideoUrl && (
              <a
                href={bug.fixVideoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`${proofBtn} bg-green-600 hover:bg-green-700`}
              >
                <Video size={16} />
                View Video
                <ExternalLink size={14} />
              </a>
            )}
            {isAssignee && (
              <FixProofPopover
                onSave={saveFixProof}
                loading={savingProof}
                compact={hasFixProof}
              />
            )}
          </div>
        </div>
      )}

      {/* Details */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm mb-4 sm:mb-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <div className="min-w-0">
            <p className="text-sm text-slate-400 mb-1">Project</p>
            <p className="text-sm sm:text-base font-semibold text-slate-700 break-words">
              {bug.project?.name || "—"}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-400 mb-1">Type</p>
            <TypeBadge type={bug.type} />
          </div>
          <div className="min-w-0">
            <p className="text-sm text-slate-400 mb-1">Reported By</p>
            <p className="text-sm sm:text-base font-semibold text-slate-700 break-words">
              {bug.reportedBy?.name || "—"}
            </p>
          </div>
          <div className="min-w-0">
            <p className="text-sm text-slate-400 mb-1">Assigned To</p>
            <p className="text-sm sm:text-base font-semibold text-slate-700 break-words">
              {bug.assignedTo?.name || "Unassigned"}
            </p>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm mb-4 sm:mb-5">
        <h2 className="text-lg font-bold text-slate-800 mb-3">Description</h2>
        <p className="text-sm sm:text-base leading-7 text-slate-600 whitespace-pre-wrap break-words">
          {bug.description}
        </p>
      </div>

      {/* Lifecycle: Fit in one row on mobile */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-5 sm:mb-6">Lifecycle</h2>
        <div className="flex items-start justify-center">
          {lifecycleSteps.map((step, index) => {
            const done = index <= activeIndex;
            return (
              <div key={step} className="contents">
                <div className="flex flex-col items-center text-center w-16 sm:w-24 shrink-0">
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                      done ? "bg-brand text-white" : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <p
                    className={`text-xs sm:text-sm font-semibold mt-2 capitalize leading-tight ${
                      done ? "text-slate-800" : "text-slate-400"
                    }`}
                  >
                    {step.replace("-", " ")}
                  </p>
                  {index === 0 && (
                    <p className="text-[11px] sm:text-xs text-slate-400 mt-1">
                      {relativeTime(bug.createdAt)}
                    </p>
                  )}
                </div>
                {index < lifecycleSteps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mt-[17px] sm:mt-[18px] mx-1 rounded ${
                      index < activeIndex ? "bg-blue-600" : "bg-slate-200"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {showAssign && (
        <AssignBugModal
          bug={bug}
          onClose={() => setShowAssign(false)}
          onAssigned={() => loadBug()}
        />
      )}
    </div>
  );
};

export default BugDetails;