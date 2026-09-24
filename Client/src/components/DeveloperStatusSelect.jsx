import { ChevronDown, LoaderCircle } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "in-progress", label: "In Progress" },
  { value: "fixed", label: "Fixed" },
];

const DeveloperStatusSelect = ({
  status,
  onChange,
  loading = false,
  className = "",
}) => {
  if (status === "fixed" || status === "closed") {
    return (
      <span className="text-sm text-slate-500 font-medium">
        {status === "closed" ? "Closed by QA" : "Waiting for QA retest"}
      </span>
    );
  }

  const selectValue =
    status === "in-progress" || status === "fixed" ? status : "";

  return (
    <div
      className={`relative block sm:inline-block sm:min-w-[200px] ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      <select
        value={selectValue}
        disabled={loading}
        onChange={(e) => {
          const next = e.target.value;
          if (next && next !== status) onChange(next);
        }}
        className="w-full h-11 appearance-none pl-3 pr-10 rounded-xl border border-slate-200 bg-white text-base sm:text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:opacity-70"
      >
        <option value="" disabled>
          {status === "open" || status === "reopened"
            ? "Change status..."
            : "Select status"}
        </option>
        {STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
        {loading ? (
          <LoaderCircle size={16} className="animate-spin" />
        ) : (
          <ChevronDown size={16} />
        )}
      </div>
    </div>
  );
};

export default DeveloperStatusSelect;