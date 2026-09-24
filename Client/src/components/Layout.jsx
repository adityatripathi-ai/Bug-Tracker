import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Bug,
  LayoutDashboard,
  FolderKanban,
  ListChecks,
  Users,
  Settings,
  Menu,
  X,
  Bell,
  Search,
  LogOut,
  ClipboardCheck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { formatRole, getInitials } from "../utils/helpers";

const getMenuItems = (role) => {
  if (role === "admin") {
    return [
      { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
      { name: "Projects", path: "/projects", icon: FolderKanban },
      { name: "Bugs", path: "/bugs", icon: Bug },
      { name: "Users", path: "/users", icon: Users },
    ];
  }

  if (role === "qa") {
    return [
      { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
      { name: "Projects", path: "/projects", icon: FolderKanban },
      { name: "Bugs", path: "/bugs", icon: Bug },
      { name: "Report Bug", path: "/report-bug", icon: ListChecks },
      { name: "Retest", path: "/retest", icon: ClipboardCheck },
    ];
  }

  return [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "My Bugs", path: "/my-bugs", icon: Bug },
  ];
};

const getPageTitle = (pathname) => {
  if (pathname.startsWith("/projects/")) return "Project Details";
  if (pathname.startsWith("/bugs/") && pathname !== "/bugs") return "Bug Details";
  const map = {
    "/dashboard": "Dashboard",
    "/projects": "Projects",
    "/bugs": "Bugs",
    "/report-bug": "Report Bug",
    "/retest": "QA Retest",
    "/users": "Users",
    "/my-bugs": "My Bugs",
    "/settings": "Settings",
  };
  return map[pathname] || "BugTracker";
};

const navClass = ({ isActive }) =>
  `flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-medium transition ${
    isActive
      ? "bg-white text-[#2f6664] shadow-sm"
      : "text-white/85 hover:bg-white/10 hover:text-white"
  }`;

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");

  const menuItems = getMenuItems(user?.role);
  const pageTitle = getPageTitle(location.pathname);

  // Page badalne par mobile drawer band
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Drawer khula ho to peeche ka page scroll na ho
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#f3f7f5]">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR: mobile par drawer, laptop par fixed */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[280px] max-w-[85vw] lg:w-[260px] flex flex-col bg-gradient-to-b from-[#3d8b57] to-[#2f6664] text-white transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-16 lg:h-20 px-5 flex items-center justify-between border-b border-white/15 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <Bug size={20} />
            </div>
            <div>
              <p className="font-bold text-lg leading-none">BugTracker</p>
              <p className="text-xs text-white/70 mt-1">Track. Fix. Verify.</p>
            </div>
          </div>
          <button
            className="lg:hidden p-2 rounded-lg text-white/80 hover:bg-white/10"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          <p className="px-4 mb-2 text-xs font-semibold text-white/60">Menu</p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.path} to={item.path} className={navClass}>
                <Icon size={19} />
                {item.name}
              </NavLink>
            );
          })}
          <NavLink to="/settings" className={navClass}>
            <Settings size={19} />
            Settings
          </NavLink>
        </nav>

        <div className="p-4 border-t border-white/15 shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
              {getInitials(user?.name)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{user?.name}</p>
              <p className="text-xs text-white/70">{formatRole(user?.role)}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-white/30 hover:bg-white/10"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      <div className="lg:ml-[260px] min-h-screen flex flex-col min-w-0">
        <header className="sticky top-0 z-30 h-16 lg:h-20 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 flex items-center gap-3">
          <button
            className="lg:hidden p-2 -ml-2 rounded-xl text-slate-600 hover:bg-slate-50"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>

          <div className="min-w-0">
            <p className="hidden md:block text-xs text-slate-400">Workspace</p>
            <h2 className="text-base md:text-lg font-bold text-slate-900 leading-tight truncate">
              {pageTitle}
            </h2>
          </div>

          <div className="hidden md:block flex-1 max-w-xl relative ml-4 lg:ml-6">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search anything..."
              className="w-full h-11 pl-11 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <button
              className="relative p-2.5 rounded-xl text-slate-500 hover:bg-slate-50"
              aria-label="Notifications"
            >
              <Bell size={20} />
              <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
            </button>

            <div className="flex items-center gap-3 pl-2 sm:pl-3 sm:border-l border-slate-200">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold">
                {getInitials(user?.name)}
              </div>
              <div className="hidden lg:block leading-tight">
                <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
                <p className="text-xs text-slate-500">{formatRole(user?.role)}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;