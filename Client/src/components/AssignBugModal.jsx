import { useEffect, useState } from "react";
import {
  LoaderCircle,
  AlertCircle,
  X,
  UserRound,
  Check,
} from "lucide-react";
import api from "../api/client";
import { formatRole, getInitials } from "../utils/helpers";

const AssignBugModal = ({ bug, onClose, onAssigned }) => {
  const [users, setUsers] = useState([]);
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/users");

        const filtered = (response.data.users || []).filter(
          (user) => user.role === bug.type
        );

        setUsers(filtered);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load developers"
        );
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [bug.type]);

  const handleAssign = async (e) => {
    e.preventDefault();

    if (!userId) {
      setError("Please select a developer");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const response = await api.patch(`/bugs/assign/${bug._id}`, {
        userId,
      });

      onAssigned?.(response.data.bug);
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to assign bug"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const developerType = bug.type
  ? bug.type.charAt(0).toUpperCase() + bug.type.slice(1)
  : "";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#183535]/55 backdrop-blur-[2px] px-4 py-6 sm:px-6"
      onClick={onClose}
    >
      <div
        className="
          w-full
          max-w-lg
          max-h-[92vh]
          overflow-hidden
          rounded-2xl
          sm:rounded-3xl
          bg-white
          shadow-2xl
          border
          border-[#dce7e4]
          font-[Poppins,sans-serif]
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-5 py-4 sm:px-6 sm:py-5 border-b border-[#e7efed] bg-[#f9fbfa]">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#e5f3eb] text-[#368052]">
                <UserRound size={18} />
              </div>

              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#183535]">
                  Assign Bug
                </h2>

                <p className="mt-0.5 text-[11px] sm:text-xs text-[#71817d]">
                  Assign this issue to a developer
                </p>
              </div>
            </div>

            <p className="mt-3 max-w-[250px] sm:max-w-[350px] truncate text-sm font-semibold text-[#40514d]">
              {bug.title}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-xl
              text-[#72817d]
              transition
              hover:bg-[#eaf2ef]
              hover:text-[#285e4c]
              active:scale-95
            "
            aria-label="Close"
          >
            <X size={19} />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleAssign}
          className="flex max-h-[calc(92vh-90px)] flex-col"
        >
          <div className="overflow-y-auto px-5 py-5 sm:px-6 sm:py-6 space-y-5">
            {/* Bug Type */}
            <div className="rounded-xl border border-[#e1ebe8] bg-[#f8faf9] p-4">
              <p className="text-[11px] font-medium uppercase tracking-wide text-[#81908c]">
                Bug Type
              </p>

              <div className="mt-2 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#3d8451]" />

                <p className="text-sm font-semibold capitalize text-[#263c37]">
                  {bug.type}
                </p>
              </div>
            </div>

            {/* Developer selection */}
            <div>
              <div className="mb-3">
                <label className="block text-sm font-bold text-[#203a35]">
                  Select {developerType} Developer
                </label>

                <p className="mt-1 text-xs text-[#7a8985]">
                  Choose the developer responsible for fixing this bug.
                </p>
              </div>

              {/* Loading */}
              {loading ? (
                <div className="flex items-center justify-center gap-2 rounded-xl border border-[#e1ebe8] bg-[#f9fbfa] py-8 text-sm text-[#657773]">
                  <LoaderCircle
                    size={18}
                    className="animate-spin text-[#398154]"
                  />
                  Loading developers...
                </div>
              ) : users.length === 0 ? (
                <div className="rounded-xl border border-[#e1ebe8] bg-[#f9fbfa] px-4 py-7 text-center">
                  <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#e8efed] text-[#70807b]">
                    <UserRound size={18} />
                  </div>

                  <p className="text-sm font-medium text-[#40514d]">
                    No {bug.type} developers available.
                  </p>

                  <p className="mt-1 text-xs text-[#84928e]">
                    Please add a developer before assigning this bug.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                  {users.map((user) => {
                    const selected = userId === user._id;

                    return (
                      <label
                        key={user._id}
                        className={`
                          relative
                          flex
                          cursor-pointer
                          items-center
                          gap-3
                          rounded-xl
                          border
                          p-3
                          sm:p-3.5
                          transition-all
                          duration-200
                          ${
                            selected
                              ? "border-[#3d8451] bg-[#eef8f1] shadow-sm"
                              : "border-[#e0e9e6] bg-white hover:border-[#9fc4ad] hover:bg-[#f8fbf9]"
                          }
                        `}
                      >
                        {/* Radio */}
                        <input
                          type="radio"
                          name="developer"
                          value={user._id}
                          checked={selected}
                          onChange={() => setUserId(user._id)}
                          className="sr-only"
                        />

                        {/* Avatar */}
                        <div
                          className={`
                            flex
                            h-10
                            w-10
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            text-xs
                            font-bold
                            ${
                              selected
                                ? "bg-[#3d8451] text-white"
                                : "bg-[#e4f1e9] text-[#35744a]"
                            }
                          `}
                        >
                          {getInitials(user.name)}
                        </div>

                        {/* User info */}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-[#233b35]">
                            {user.name}
                          </p>

                          <p className="mt-0.5 truncate text-xs text-[#788782]">
                            {formatRole(user.role)}
                          </p>
                        </div>

                        {/* Selected indicator */}
                        <div
                          className={`
                            flex
                            h-6
                            w-6
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            border
                            transition
                            ${
                              selected
                                ? "border-[#3d8451] bg-[#3d8451] text-white"
                                : "border-[#cbd8d4] bg-white"
                            }
                          `}
                        >
                          {selected && <Check size={14} strokeWidth={3} />}
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 px-3.5 py-3 text-sm text-red-600">
                <AlertCircle
                  size={17}
                  className="mt-0.5 shrink-0"
                />

                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex flex-col-reverse gap-2.5 border-t border-[#e7efed] bg-[#fbfcfc] px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
            <button
              type="button"
              onClick={onClose}
              className="
                w-full
                rounded-xl
                border
                border-[#d5e1dd]
                bg-white
                px-5
                py-2.5
                text-sm
                font-semibold
                text-[#53645f]
                transition
                hover:bg-[#f1f6f4]
                hover:text-[#29483e]
                sm:w-auto
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                submitting ||
                loading ||
                users.length === 0
              }
              className="
                flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-[#3d8451]
                px-5
                py-2.5
                text-sm
                font-semibold
                text-white
                shadow-sm
                transition
                hover:bg-[#347447]
                active:scale-[0.98]
                disabled:cursor-not-allowed
                disabled:bg-[#9dbdaa]
                sm:w-auto
              "
            >
              {submitting && (
                <LoaderCircle
                  size={16}
                  className="animate-spin"
                />
              )}

              {submitting ? "Assigning..." : "Assign Bug"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignBugModal;