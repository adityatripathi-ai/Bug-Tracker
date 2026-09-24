export const capitalize = (value = "") => {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
};

export const formatRole = (role = "") => {
  const map = {
    admin: "Admin",
    qa: "QA",
    frontend: "Frontend",
    backend: "Backend",
    server: "Server",
  };
  return map[role] || capitalize(role);
};

export const formatStatus = (status = "") => {
  const map = {
    open: "Open",
    "in-progress": "In Progress",
    fixed: "Fixed",
    reopened: "Reopened",
    closed: "Closed",
  };
  return map[status] || capitalize(status);
};

export const formatPriority = (priority = "") =>
  capitalize(priority);

export const formatType = (type = "") => {
  const map = {
    frontend: "Frontend",
    backend: "Backend",
    server: "Server",
  };
  return map[type] || capitalize(type);
};

export const getInitials = (name = "") => {
  if (!name) return "U";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
};

export const relativeTime = (date) => {
  if (!date) return "—";

  const now = Date.now();
  const then = new Date(date).getTime();
  const diff = Math.max(0, now - then);

  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const countByStatus = (bugs = [], status) =>
  bugs.filter((bug) => bug.status === status).length;