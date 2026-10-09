import { useState } from "react";
import { Eye, EyeOff, Bug, User, Mail, Lock, ChevronDown } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const labelClass = "block text-sm font-semibold text-slate-700 mb-2";
const inputClass =
  "w-full h-12 pl-11 pr-4 border border-slate-200 rounded-xl outline-none text-base sm:text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
const iconClass =
  "absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none";

const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("qa");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      await signup({ name, email, password, role });
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f7f5] flex flex-col items-center justify-center px-4 py-8">
      <div className="flex items-center gap-2.5 mb-6 sm:mb-8">
        <div className="w-10 h-10 rounded-xl bg-brand text-white flex items-center justify-center">
          <Bug size={20} />
        </div>
        <span className="text-xl font-bold text-slate-800">BugTracker</span>
      </div>

      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-sm p-5 sm:p-8">
        <div className="mb-6 sm:mb-7 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Create your account
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Join your team and start tracking bugs
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className={labelClass}>Full name</label>
            <div className="relative">
              <User size={18} className={iconClass} />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Email address</label>
            <div className="relative">
              <Mail size={18} className={iconClass} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Role</label>
            <div className="relative">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full h-12 appearance-none px-4 pr-10 border border-slate-200 rounded-xl outline-none text-base sm:text-sm bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="qa">QA Tester</option>
                <option value="frontend">Frontend Developer</option>
                <option value="backend">Backend Developer</option>
                <option value="server">Server Developer</option>
              </select>
              <ChevronDown
                size={18}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>
          </div>

          {/* Password + Confirm: on laptop side by side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Password</label>
              <div className="relative">
                <Lock size={18} className={iconClass} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  className={`${inputClass} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className={labelClass}>Confirm password</label>
              <div className="relative">
                <Lock size={18} className={iconClass} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-brand hover:opacity-95 disabled:opacity-60 text-white rounded-xl font-semibold text-sm"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?
          <Link to="/" className="text-blue-600 font-semibold ml-2 hover:text-blue-700">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;