import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import {
  ProtectedRoute,
  PublicOnlyRoute,
} from "./components/ProtectedRoute";
import Layout from "./components/Layout";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ProjectDetails from "./pages/ProjectDetails";
import Bugs from "./pages/Bugs";
import ReportBug from "./pages/ReportBug";
import BugDetails from "./pages/BugDetails";
import Users from "./pages/Users";
import MyBugs from "./pages/MyBugs";
import Retest from "./pages/Retest";
import Settings from "./pages/Settings";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<PublicOnlyRoute />}>
            <Route path="/" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/bugs/:id" element={<BugDetails />} />

              <Route element={<ProtectedRoute roles={["admin", "qa"]} />}>
                <Route path="/projects" element={<Projects />} />
                <Route path="/projects/:id" element={<ProjectDetails />} />
                <Route path="/bugs" element={<Bugs />} />
              </Route>

              <Route element={<ProtectedRoute roles={["qa"]} />}>
                <Route path="/report-bug" element={<ReportBug />} />
                <Route path="/retest" element={<Retest />} />
              </Route>

              <Route element={<ProtectedRoute roles={["admin"]} />}>
                <Route path="/users" element={<Users />} />
              </Route>

              <Route
                element={<ProtectedRoute roles={["frontend", "backend","server"]} />}
              >
                <Route path="/my-bugs" element={<MyBugs />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
