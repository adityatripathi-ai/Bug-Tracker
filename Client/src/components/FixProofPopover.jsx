import { useEffect, useRef, useState } from "react";
import { LoaderCircle, Link as LinkIcon, Video, Upload, Pencil } from "lucide-react";

const MAX_VIDEO_MB = 50;
const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

const FixProofPopover = ({ onSave, loading, compact = false }) => {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("link");
  const [link, setLink] = useState("");
  const [file, setFile] = useState(null);
  const [localError, setLocalError] = useState("");
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const resetForm = () => {
    setLink("");
    setFile(null);
    setLocalError("");
    setTab("link");
  };

  const closePopover = () => {
    resetForm();
    setOpen(false);
  };

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!ACCEPTED_VIDEO_TYPES.includes(selected.type)) {
      setLocalError("Only MP4, WEBM or MOV videos are allowed");
      e.target.value = "";
      return;
    }
    if (selected.size > MAX_VIDEO_MB * 1024 * 1024) {
      setLocalError(`Video must be under ${MAX_VIDEO_MB}MB`);
      e.target.value = "";
      return;
    }
    setLocalError("");
    setFile(selected);
  };

  const handleSave = async () => {
    setLocalError("");

    if (tab === "link") {
      if (!link.trim()) {
        setLocalError("Please enter a link");
        return;
      }
      try {
        new URL(link.trim());
      } catch {
        setLocalError("Please enter a valid URL");
        return;
      }
      await onSave({ type: "link", link: link.trim() });
    } else {
      if (!file) {
        setLocalError("Please choose a video file");
        return;
      }
      await onSave({ type: "video", file });
    }

    resetForm();
    setOpen(false);
  };

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        disabled={loading}
        className={
          compact
            ? "inline-flex items-center justify-center w-9 h-9 sm:w-7 sm:h-7 rounded-full text-slate-400 hover:text-blue-600 hover:bg-blue-50"
            : "inline-flex items-center gap-1.5 py-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
        }
        title={compact ? "Edit fix proof" : undefined}
        aria-label={compact ? "Edit fix proof" : "Add link or video"}
      >
        {compact ? (
          <Pencil size={14} />
        ) : (
          <>
            <Upload size={14} />
            Add link or video
          </>
        )}
      </button>

      {open && (
        <>
          {/* Mobile: dim background jab bottom sheet khule */}
          <div
            className="fixed inset-0 z-40 bg-[#183535]/40 sm:hidden"
            onClick={closePopover}
          />

          {/* Mobile: bottom sheet | Laptop: purane jaisa dropdown */}
          <div className="fixed left-3 right-3 bottom-3 z-50 bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 sm:absolute sm:left-0 sm:right-auto sm:bottom-auto sm:top-full sm:mt-2 sm:w-72 sm:z-20 sm:rounded-xl sm:shadow-lg sm:p-3">
            <p className="text-sm font-bold text-slate-800 mb-3 sm:hidden">
              Add fix proof
            </p>

            <div className="flex gap-1 mb-3 bg-slate-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setTab("link")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 sm:py-1.5 rounded-md text-sm font-semibold transition ${
                  tab === "link"
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500"
                }`}
              >
                <LinkIcon size={14} />
                Link
              </button>
              <button
                type="button"
                onClick={() => setTab("video")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 sm:py-1.5 rounded-md text-sm font-semibold transition ${
                  tab === "video"
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500"
                }`}
              >
                <Video size={14} />
                Video
              </button>
            </div>

            {tab === "link" ? (
              <input
                type="text"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://drive.google.com/..."
                disabled={loading}
                className="w-full h-11 sm:h-10 px-3 rounded-lg border border-slate-200 text-base sm:text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            ) : (
              <div>
                <input
                  type="file"
                  accept={ACCEPTED_VIDEO_TYPES.join(",")}
                  onChange={handleFileChange}
                  disabled={loading}
                  className="w-full text-sm text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100"
                />
                <p className="text-xs text-slate-400 mt-1">
                  MP4, WEBM or MOV, max {MAX_VIDEO_MB}MB
                </p>
              </div>
            )}

            {localError && (
              <p className="text-xs text-red-600 mt-2">{localError}</p>
            )}

            <div className="flex justify-end gap-2 mt-4 sm:mt-3">
              <button
                type="button"
                onClick={closePopover}
                disabled={loading}
                className="px-4 sm:px-3 py-2 sm:py-1.5 rounded-lg text-sm font-semibold text-slate-500 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-4 sm:px-3 py-2 sm:py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold"
              >
                {loading && <LoaderCircle size={14} className="animate-spin" />}
                Save
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FixProofPopover;