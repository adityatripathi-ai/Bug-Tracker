import { useEffect, useMemo, useState } from "react";
import { LoaderCircle, AlertCircle } from "lucide-react";
import api from "../api/client";
import { RoleBadge } from "../components/StatusBadges";
import { getInitials } from "../utils/helpers";

const ActiveBadge = () => (
  <span className="inline-flex px-2.5 py-1 rounded-md text-xs font-semibold bg-green-50 text-green-600 border border-green-100">
    Active
  </span>
);

const Users = () => {
  const [users, setUsers] = useState([]);
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [usersRes, bugsRes] = await Promise.all([
          api.get("/users"),
          api.get("/bugs").catch(() => ({ data: { bugs: [] } })),
        ]);
        setUsers(usersRes.data.users || []);
        setBugs(bugsRes.data.bugs || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load users");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const assignedCounts = useMemo(() => {
    const map = {};
    bugs.forEach((bug) => {
      const id = bug.assignedTo?._id || bug.assignedTo;
      if (!id) return;
      map[id] = (map[id] || 0) + 1;
    });
    return map;
  }, [bugs]);

  return (
    <div>
      <div className="mb-5 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Users</h1>
        <p className="text-sm sm:text-base text-slate-500 mt-1">Manage all system users.</p>
      </div>

      {error && (
        <div className="mb-5 flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3 text-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-2xl py-16 flex items-center justify-center gap-2 text-slate-500">
          <LoaderCircle className="animate-spin text-blue-600" size={22} />
          Loading users...
        </div>
      ) : (
        <>
          {/* Mobile: cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:hidden">
            {users.map((user) => (
              <div
                key={user._id}
                className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 shrink-0 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold">
                    {getInitials(user.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-base font-semibold text-slate-800 truncate">{user.name}</p>
                    <p className="text-sm text-slate-500 truncate">{user.email}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-100">
                  <RoleBadge role={user.role} />
                  <span className="text-sm text-slate-500">
                    <span className="font-semibold text-slate-700">
                      {assignedCounts[user._id] || 0}
                    </span>{" "}
                    assigned
                  </span>
                  <ActiveBadge />
                </div>
              </div>
            ))}
          </div>

          {/* Tablet / laptop: table */}
          <div className="hidden md:block bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3.5 font-semibold">Name</th>
                    <th className="px-4 py-3.5 font-semibold">Email</th>
                    <th className="px-4 py-3.5 font-semibold">Role</th>
                    <th className="px-4 py-3.5 font-semibold">Assigned Bugs</th>
                    <th className="px-5 py-3.5 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                            {getInitials(user.name)}
                          </div>
                          <span className="text-sm font-semibold text-slate-800">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600 break-all">{user.email}</td>
                      <td className="px-4 py-4"><RoleBadge role={user.role} /></td>
                      <td className="px-4 py-4 text-sm font-semibold text-slate-700">
                        {assignedCounts[user._id] || 0}
                      </td>
                      <td className="px-5 py-4"><ActiveBadge /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Users;