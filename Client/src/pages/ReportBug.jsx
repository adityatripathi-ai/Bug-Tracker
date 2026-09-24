import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  LoaderCircle,
  AlertCircle,
  Send,
  Image,
  X,
  Link as LinkIcon,
  Video,
} from "lucide-react";
import api from "../api/client";
import { formatRole } from "../utils/helpers";

const MAX_FILE_SIZE_MB = 5;
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

const MAX_VIDEO_MB = 50;
const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

const labelClass = "block text-sm sm:text-base font-semibold text-slate-700 mb-2";
const fieldClass =
  "w-full h-12 px-4 rounded-lg border border-slate-200 bg-white text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50";

const ReportBug = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const preselectedProjectId = location.state?.projectId || "";

  const [projects, setProjects] = useState([]);
  const [developers, setDevelopers] = useState([]);
  const [formData, setFormData] = useState({
    project: preselectedProjectId,
    title: "",
    description: "",
    type: "frontend",
    priority: "medium",
    assignedTo: "",
  });
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);

  // Reference: either a link or a video, not both
  const [referenceTab, setReferenceTab] = useState("link");
  const [referenceLink, setReferenceLink] = useState("");
  const [referenceVideo, setReferenceVideo] = useState(null);

  const [loading, setLoading] = useState(false);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [projectsRes, usersRes] = await Promise.all([
          api.get("/projects"),
          api.get("/users").catch(() => ({ data: { users: [] } })),
        ]);
        setProjects(projectsRes.data.projects || []);
        setDevelopers(
          (usersRes.data.users || []).filter((user) =>
            ["frontend", "backend", "server"].includes(user.role)
          )
        );
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load form data");
      } finally {
        setProjectsLoading(false);
      }
    };
    load();
  }, []);

  // Cleanup the object URL when it changes or on unmount
  useEffect(() => {
    return () => {
      if (screenshotPreview) URL.revokeObjectURL(screenshotPreview);
    };
  }, [screenshotPreview]);

  const filteredDevelopers = useMemo(
    () => developers.filter((user) => user.role === formData.type),
    [developers, formData.type]
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "type") {
        next.assignedTo = "";
      }
      return next;
    });
  };

  const handleScreenshotChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Only PNG, JPG or WEBP images are allowed");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`Screenshot must be under ${MAX_FILE_SIZE_MB}MB`);
      e.target.value = "";
      return;
    }

    setError("");
    setScreenshot(file);
    setScreenshotPreview(URL.createObjectURL(file));
  };

  const removeScreenshot = () => {
    setScreenshot(null);
    setScreenshotPreview(null);
  };

  const handleReferenceVideoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_VIDEO_TYPES.includes(file.type)) {
      setError("Only MP4, WEBM or MOV videos are allowed");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_VIDEO_MB * 1024 * 1024) {
      setError(`Video must be under ${MAX_VIDEO_MB}MB`);
      e.target.value = "";
      return;
    }

    setError("");
    setReferenceVideo(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.project) {
      setError("Please select a project");
      return;
    }
    if (!formData.title.trim()) {
      setError("Bug title is required");
      return;
    }
    if (!formData.description.trim()) {
      setError("Bug description is required");
      return;
    }
    if (referenceTab === "link" && referenceLink.trim()) {
      try {
        new URL(referenceLink.trim());
      } catch {
        setError("Please enter a valid reference link URL");
        return;
      }
    }

    try {
      setLoading(true);

      const payload = new FormData();
      payload.append("project", formData.project);
      payload.append("title", formData.title.trim());
      payload.append("description", formData.description.trim());
      payload.append("type", formData.type);
      payload.append("priority", formData.priority);
      if (formData.assignedTo) payload.append("assignedTo", formData.assignedTo);
      if (screenshot) payload.append("screenshot", screenshot);

      if (referenceTab === "video" && referenceVideo) {
        payload.append("issueVideo", referenceVideo);
      } else if (referenceTab === "link" && referenceLink.trim()) {
        payload.append("issueLink", referenceLink.trim());
      }

      await api.post("/bugs", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate("/bugs");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to report bug");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-5 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Report a Bug</h1>
        <p className="text-sm sm:text-base text-slate-500 mt-1">
          Help your team identify and fix a new bug.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
        <form onSubmit={handleSubmit}>
          <div className="p-4 sm:p-6 space-y-5">
            {/* Project + Priority: laptop par ek row me */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Project</label>
                <div className="relative">
                  <select
                    name="project"
                    value={formData.project}
                    onChange={handleChange}
                    disabled={projectsLoading || loading}
                    className={`${fieldClass} appearance-none pr-10`}
                  >
                    <option value="">
                      {projectsLoading ? "Loading projects..." : "Select project"}
                    </option>
                    {projects.map((project) => (
                      <option key={project._id} value={project._id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={18}
                    className="absolute right-3 top-3.5 text-slate-400 pointer-events-none"
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Priority</label>
                <div className="relative">
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    disabled={loading}
                    className={`${fieldClass} appearance-none pr-10`}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                  <ChevronDown
                    size={18}
                    className="absolute right-3 top-3.5 text-slate-400 pointer-events-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className={labelClass}>Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter bug title"
                disabled={loading}
                className={fieldClass}
              />
            </div>

            <div>
              <label className={labelClass}>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the issue in detail..."
                rows={5}
                disabled={loading}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 text-base outline-none resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
              />
            </div>

            {/* Bug type: tappable pills */}
            <div>
              <label className={labelClass}>Bug Type</label>
              <div className="grid grid-cols-3 gap-2 sm:flex sm:gap-3">
                {["frontend", "backend", "server"].map((type) => (
                  <label
                    key={type}
                    className={`flex items-center justify-center px-3 sm:px-5 py-2.5 rounded-lg border text-sm sm:text-base font-semibold capitalize cursor-pointer transition ${
                      formData.type === type
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="type"
                      value={type}
                      checked={formData.type === type}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    {type}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className={labelClass}>Assigned To</label>
              <div className="relative">
                <select
                  name="assignedTo"
                  value={formData.assignedTo}
                  onChange={handleChange}
                  disabled={loading}
                  className={`${fieldClass} appearance-none pr-10`}
                >
                  <option value="">
                    {filteredDevelopers.length === 0
                      ? `No ${formData.type} developers available`
                      : "Select developer (optional)"}
                  </option>
                  {filteredDevelopers.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name} — {formatRole(user.role)}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={18}
                  className="absolute right-3 top-3.5 text-slate-400 pointer-events-none"
                />
              </div>
              <p className="text-sm text-slate-400 mt-1.5">
                The developer list changes with the bug type you pick.
              </p>
            </div>

            {/* Screenshot */}
            <div>
              <label className={labelClass}>Screenshot (optional)</label>

              {!screenshotPreview ? (
                <label
                  htmlFor="screenshot-upload"
                  className={`flex flex-col items-center justify-center gap-2 px-4 py-6 text-center rounded-lg border-2 border-dashed border-slate-200 text-slate-400 cursor-pointer hover:border-blue-400 hover:text-blue-500 transition-colors ${
                    loading ? "pointer-events-none opacity-60" : ""
                  }`}
                >
                  <Image size={22} />
                  <span className="text-sm">
                    Tap to upload a screenshot (PNG, JPG, WEBP, max{" "}
                    {MAX_FILE_SIZE_MB}MB)
                  </span>
                  <input
                    id="screenshot-upload"
                    type="file"
                    accept={ACCEPTED_TYPES.join(",")}
                    onChange={handleScreenshotChange}
                    disabled={loading}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="relative inline-block max-w-full">
                  <img
                    src={screenshotPreview}
                    alt="Screenshot preview"
                    className="max-h-48 max-w-full rounded-lg border border-slate-200 object-contain"
                  />
                  <button
                    type="button"
                    onClick={removeScreenshot}
                    disabled={loading}
                    className="absolute -top-2 -right-2 bg-slate-900 text-white rounded-full p-1.5 hover:bg-slate-700"
                    aria-label="Remove screenshot"
                  >
                    <X size={14} />
                  </button>
                  <p className="text-sm text-slate-400 mt-1.5 truncate max-w-xs">
                    {screenshot?.name}
                  </p>
                </div>
              )}
            </div>

            {/* Reference link / video */}
            <div>
              <label className={labelClass}>Link or Video (optional)</label>
              <p className="text-sm text-slate-400 mb-3">
                Share a reference link or a short video showing the issue.
              </p>

              <div className="flex gap-1 mb-3 bg-slate-100 rounded-lg p-1 w-full sm:w-fit">
                {[
                  { key: "link", label: "Link", icon: LinkIcon },
                  { key: "video", label: "Video", icon: Video },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setReferenceTab(tab.key)}
                      disabled={loading}
                      className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-md text-sm font-semibold transition ${
                        referenceTab === tab.key
                          ? "bg-white text-slate-800 shadow-sm"
                          : "text-slate-500"
                      }`}
                    >
                      <Icon size={14} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {referenceTab === "link" ? (
                <input
                  type="text"
                  value={referenceLink}
                  onChange={(e) => setReferenceLink(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  disabled={loading}
                  className={fieldClass}
                />
              ) : (
                <div>
                  <input
                    type="file"
                    accept={ACCEPTED_VIDEO_TYPES.join(",")}
                    onChange={handleReferenceVideoChange}
                    disabled={loading}
                    className="w-full text-sm text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100"
                  />
                  <p className="text-xs text-slate-400 mt-1.5">
                    MP4, WEBM or MOV, max {MAX_VIDEO_MB}MB
                  </p>
                  {referenceVideo && (
                    <p className="text-sm text-slate-600 mt-1.5 break-all">
                      Selected: {referenceVideo.name}
                    </p>
                  )}
                </div>
              )}
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm sm:text-base">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                {error}
              </div>
            )}
          </div>

          <div className="px-4 sm:px-6 py-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate("/bugs")}
              disabled={loading}
              className="px-5 py-3 rounded-lg border border-slate-200 text-sm sm:text-base font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-brand hover:opacity-95 disabled:opacity-60 text-white text-sm sm:text-base font-semibold"
            >
              {loading ? (
                <>
                  <LoaderCircle size={18} className="animate-spin" />
                  Reporting...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Report Bug
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportBug;