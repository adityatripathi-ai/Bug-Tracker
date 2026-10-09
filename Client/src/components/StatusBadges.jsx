import {
  formatPriority,
  formatRole,
  formatStatus,
  formatType,
} from "../utils/helpers";

const base =
  "inline-flex items-center whitespace-nowrap px-3 py-1.5 rounded-lg text-sm font-semibold border";


export const StatusBadge = ({ status }) => {
  const styles = {
    open: "bg-red-50 text-red-600 border-red-100",
    "in-progress": "bg-sky-50 text-sky-700 border-sky-100",
    fixed: "bg-indigo-50 text-indigo-600 border-indigo-100",
    reopened: "bg-orange-50 text-orange-600 border-orange-100",
    closed: "bg-green-50 text-green-700 border-green-100",
  };

  return (
    <span className={`${base} ${styles[status] || styles.open}`}>
      {formatStatus(status)}
    </span>
  );
};

export const PriorityBadge = ({ priority }) => {
  const styles = {
    low: "bg-slate-50 text-slate-600 border-slate-200",
    medium: "bg-amber-50 text-amber-600 border-amber-100",
    high: "bg-orange-50 text-orange-600 border-orange-100",
    critical: "bg-red-50 text-red-600 border-red-100",
  };

  return (
    <span className={`${base} ${styles[priority] || styles.medium}`}>
      {formatPriority(priority)}
    </span>
  );
};

export const RoleBadge = ({ role }) => {
  const styles = {
    admin: "bg-red-50 text-red-600 border-red-100",
    qa: "bg-sky-50 text-sky-700 border-sky-100",
    frontend: "bg-violet-50 text-violet-600 border-violet-100",
    backend: "bg-orange-50 text-orange-600 border-orange-100",
    server: "bg-teal-50 text-teal-700 border-teal-100",
  };

  return (
    <span
      className={`${base} ${styles[role] || "bg-slate-50 text-slate-600 border-slate-200"}`}
    >
      {formatRole(role)}
    </span>
  );
};

export const TypeBadge = ({ type }) => (
  <span className={`${base} bg-slate-50 text-slate-600 border-slate-200`}>
    {formatType(type)}
  </span>
);