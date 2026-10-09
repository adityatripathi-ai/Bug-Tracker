import { PriorityBadge, StatusBadge, TypeBadge } from "./StatusBadges";
import { relativeTime } from "../utils/helpers";


const BugCard = ({ bug, onOpen, showCreated = false, children }) => (
  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
    <div className="flex flex-wrap items-center gap-2">
      <PriorityBadge priority={bug.priority} />
      <StatusBadge status={bug.status} />
      <TypeBadge type={bug.type} />
    </div>

    <div className="min-w-0">
      <button
        type="button"
        onClick={onOpen}
        className="text-left text-base font-semibold text-slate-900 hover:text-blue-600 break-words"
      >
        {bug.title}
      </button>
      <p className="text-sm text-slate-500 mt-0.5 truncate">
        {bug.project?.name || "No project"}
      </p>
    </div>

    <div className="flex items-center justify-between gap-3 text-sm text-slate-500">
      <span className="truncate">
        Assigned to{" "}
        <span className="font-medium text-slate-700">
          {bug.assignedTo?.name || "Unassigned"}
        </span>
      </span>
      {showCreated && (
        <span className="shrink-0">{relativeTime(bug.createdAt)}</span>
      )}
    </div>

    {children}
  </div>
);

export default BugCard;