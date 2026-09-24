
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LoaderCircle,
  AlertCircle,
  ImageOff,
  Link as LinkIcon,
  Video,
  ExternalLink,
} from "lucide-react";

import api from "../api/client";

import {
  PriorityBadge,
  StatusBadge,
  TypeBadge,
} from "../components/StatusBadges";

import DeveloperStatusSelect from "../components/DeveloperStatusSelect";
import FixProofPopover from "../components/FixProofPopover";
import { countByStatus } from "../utils/helpers";

// =====================================================
// Convert backend upload path into complete URL
// =====================================================
const asUrl = (path) => {
  if (!path) return null;

  // Already a complete URL
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // Backend uploaded file
  if (path.startsWith("/uploads")) {
    return `${import.meta.env.VITE_API_URL.replace("/api", "")}${path}`;
  }

  return path;
};

const MyBugs = () => {
  const navigate = useNavigate();

  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filter, setFilter] = useState("all");

  const [updatingId, setUpdatingId] = useState(null);
  const [savingProofId, setSavingProofId] = useState(null);

  const [previewUrl, setPreviewUrl] = useState(null);

  // =====================================================
  // LOAD DEVELOPER BUGS
  // =====================================================
  const loadBugs = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/bugs/my-bugs");

      setBugs(response.data.bugs || []);
    } catch (err) {
      console.log(
        "MY BUGS ERROR:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
          "Failed to load your bugs"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBugs();
  }, []);

  // =====================================================
  // STATS
  // =====================================================
  const stats = useMemo(
    () => [
      {
        key: "all",
        label: "Assigned",
        value: bugs.length,
      },
      {
        key: "in-progress",
        label: "In Progress",
        value: countByStatus(bugs, "in-progress"),
      },
      {
        key: "fixed",
        label: "Fixed",
        value: countByStatus(bugs, "fixed"),
      },
      {
        key: "reopened",
        label: "Reopened",
        value: countByStatus(bugs, "reopened"),
      },
    ],
    [bugs]
  );

  // =====================================================
  // FILTER BUGS
  // =====================================================
  const filteredBugs = useMemo(() => {
    if (filter === "all") {
      return bugs;
    }

    return bugs.filter(
      (bug) => bug.status === filter
    );
  }, [bugs, filter]);

  // =====================================================
  // UPDATE BUG IN STATE
  // =====================================================
  const applyUpdatedBug = (bugId, updated) => {
    if (!updated) return;

    setBugs((prev) =>
      prev.map((bug) =>
        bug._id === bugId
          ? {
              ...bug,
              ...updated,
            }
          : bug
      )
    );
  };

  // =====================================================
  // UPDATE BUG STATUS
  // =====================================================
  const updateStatus = async (bugId, status) => {
    try {
      setUpdatingId(bugId);
      setError("");

      const response = await api.put(
        `/bugs/status/${bugId}`,
        { status }
      );

      const updated = response.data.bug;

      if (updated) {
        applyUpdatedBug(bugId, updated);
      } else {
        await loadBugs();
      }
    } catch (err) {
      console.log(
        "STATUS UPDATE ERROR:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Failed to update status"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // =====================================================
  // SAVE FIX PROOF
  // =====================================================
  const saveFixProof = async (bugId, proof) => {
    try {
      setSavingProofId(bugId);
      setError("");

      const payload = new FormData();

      if (proof.type === "video") {
        payload.append("fixVideo", proof.file);
      } else {
        payload.append("fixLink", proof.link);
      }

      const response = await api.patch(
        `/bugs/fix-proof/${bugId}`,
        payload,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      applyUpdatedBug(
        bugId,
        response.data.bug
      );
    } catch (err) {
      console.log(
        "FIX PROOF ERROR:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Failed to save fix proof"
      );
    } finally {
      setSavingProofId(null);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================
  if (loading) {
    return (
      <div className="py-16 flex items-center justify-center gap-2 text-slate-500 text-base">
        <LoaderCircle
          className="animate-spin text-blue-600"
          size={24}
        />

        Loading bugs...
      </div>
    );
  }

  // =====================================================
  // MAIN UI
  // =====================================================
  return (
    <div>
      {/* =================================================
          PAGE HEADER
      ================================================= */}
      <div className="mb-7">
        <h1 className="text-3xl font-bold text-slate-900">
          My Bugs
        </h1>

        <p className="text-base text-slate-500 mt-1">
          View assigned bugs, QA evidence and update status
        </p>
      </div>

      {/* =================================================
          STATS
      ================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        {stats.map((stat) => (
          <button
            key={stat.key}
            onClick={() => setFilter(stat.key)}
            className={`rounded-2xl border p-5 text-left transition ${
              filter === stat.key
                ? "border-blue-500 bg-blue-50"
                : "border-slate-200 bg-white hover:bg-slate-50"
            }`}
          >
            <p className="text-base text-slate-500">
              {stat.label}
            </p>

            <p className="text-3xl font-bold text-slate-900 mt-1">
              {stat.value}
            </p>
          </button>
        ))}
      </div>

      {/* =================================================
          ERROR
      ================================================= */}
      {error && (
        <div className="mb-5 flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3 text-base">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* =================================================
          BUG TABLE
      ================================================= */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {filteredBugs.length === 0 ? (
          <div className="py-16 text-center text-base text-slate-400">
            No bugs in this category
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1350px] text-left">
              {/* =================================================
                  TABLE HEADER
              ================================================= */}
              <thead className="bg-slate-50 text-sm uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">
                    Bug
                  </th>

                  <th className="px-5 py-4 font-semibold">
                    Project
                  </th>

                  <th className="px-5 py-4 font-semibold">
                    Type
                  </th>

                  <th className="px-5 py-4 font-semibold">
                    Priority
                  </th>

                  <th className="px-5 py-4 font-semibold">
                    Screenshot
                  </th>

                  <th className="px-5 py-4 font-semibold">
                    QA Reference
                  </th>

                  <th className="px-5 py-4 font-semibold">
                    Fix Proof
                  </th>

                  <th className="px-5 py-4 font-semibold">
                    Current Status
                  </th>

                  <th className="px-5 py-4 font-semibold">
                    Change Status
                  </th>
                </tr>
              </thead>

              {/* =================================================
                  TABLE BODY
              ================================================= */}
              <tbody className="divide-y divide-slate-100">
                {filteredBugs.map((bug) => {
                  // -------------------------------
                  // URLs
                  // -------------------------------
                  const screenshotUrl = asUrl(
                    bug.screenshotUrl
                  );

                  const issueVideoUrl = asUrl(
                    bug.issueVideoUrl
                  );

                  const fixVideoUrl = asUrl(
                    bug.fixVideoUrl
                  );

                  const fixLinkUrl =
                    bug.fixLink || null;

                  return (
                    <tr
                      key={bug._id}
                      className="hover:bg-slate-50"
                    >
                      {/* =================================================
                          BUG
                      ================================================= */}
                      <td className="px-5 py-4">
                        <button
                          onClick={() =>
                            navigate(
                              `/bugs/${bug._id}`
                            )
                          }
                          className="text-base font-semibold text-slate-800 hover:text-blue-600 text-left"
                        >
                          {bug.title}
                        </button>
                      </td>

                      {/* =================================================
                          PROJECT
                      ================================================= */}
                      <td className="px-5 py-4 text-base text-slate-600">
                        {bug.project?.name || "—"}
                      </td>

                      {/* =================================================
                          TYPE
                      ================================================= */}
                      <td className="px-5 py-4">
                        <TypeBadge
                          type={bug.type}
                        />
                      </td>

                      {/* =================================================
                          PRIORITY
                      ================================================= */}
                      <td className="px-5 py-4">
                        <PriorityBadge
                          priority={bug.priority}
                        />
                      </td>

                      {/* =================================================
                          SCREENSHOT
                      ================================================= */}
                      <td className="px-5 py-4">
                        {screenshotUrl ? (
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewUrl(
                                screenshotUrl
                              )
                            }
                            className="block w-14 h-14 rounded-lg overflow-hidden border border-slate-200 hover:ring-2 hover:ring-blue-200"
                          >
                            <img
                              src={screenshotUrl}
                              alt={`Screenshot for ${bug.title}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ) : (
                          <span className="flex items-center gap-1 text-sm text-slate-300">
                            <ImageOff size={16} />
                            —
                          </span>
                        )}
                      </td>

                      {/* =================================================
                          QA REFERENCE
                      ================================================= */}
                      <td className="px-5 py-4">
                        {bug.issueLink ? (
                          <a
                            href={bug.issueLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) =>
                              e.stopPropagation()
                            }
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition text-sm font-semibold"
                          >
                            <LinkIcon size={15} />

                            Open Link

                            <ExternalLink
                              size={14}
                            />
                          </a>
                        ) : bug.issueVideoUrl ? (
                          <a
                            href={issueVideoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) =>
                              e.stopPropagation()
                            }
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition text-sm font-semibold"
                          >
                            <Video size={15} />

                            View Video

                            <ExternalLink
                              size={14}
                            />
                          </a>
                        ) : (
                          <span className="text-sm text-slate-300">
                            —
                          </span>
                        )}
                      </td>

                      {/* =================================================
                          FIX PROOF
                      ================================================= */}
                      <td className="px-5 py-4">
                        {fixLinkUrl ||
                        fixVideoUrl ? (
                          <div className="flex items-center gap-2">
                            <a
                              href={
                                fixLinkUrl ||
                                fixVideoUrl
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) =>
                                e.stopPropagation()
                              }
                              className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-600 hover:text-green-700"
                            >
                              {fixVideoUrl ? (
                                <Video
                                  size={15}
                                />
                              ) : (
                                <LinkIcon
                                  size={15}
                                />
                              )}

                              {fixVideoUrl
                                ? "View video"
                                : "View link"}

                              <ExternalLink
                                size={14}
                              />
                            </a>

                            <FixProofPopover
                              onSave={(proof) =>
                                saveFixProof(
                                  bug._id,
                                  proof
                                )
                              }
                              loading={
                                savingProofId ===
                                bug._id
                              }
                              compact
                            />
                          </div>
                        ) : (
                          <FixProofPopover
                            onSave={(proof) =>
                              saveFixProof(
                                bug._id,
                                proof
                              )
                            }
                            loading={
                              savingProofId ===
                              bug._id
                            }
                          />
                        )}
                      </td>

                      {/* =================================================
                          CURRENT STATUS
                      ================================================= */}
                      <td className="px-5 py-4">
                        <StatusBadge
                          status={bug.status}
                        />
                      </td>

                      {/* =================================================
                          CHANGE STATUS
                      ================================================= */}
                      <td className="px-5 py-4">
                        <DeveloperStatusSelect
                          status={bug.status}
                          loading={
                            updatingId === bug._id
                          }
                          onChange={(status) =>
                            updateStatus(
                              bug._id,
                              status
                            )
                          }
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =================================================
          SCREENSHOT PREVIEW
      ================================================= */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-6"
          onClick={() => setPreviewUrl(null)}
        >
          <div className="relative max-w-5xl max-h-full">
            <button
              type="button"
              onClick={() => setPreviewUrl(null)}
              className="absolute -top-10 right-0 text-white text-2xl"
            >
              ×
            </button>

            <img
              src={previewUrl}
              alt="Bug screenshot preview"
              className="max-w-full max-h-[85vh] rounded-xl shadow-2xl"
              onClick={(e) =>
                e.stopPropagation()
              }
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBugs;


