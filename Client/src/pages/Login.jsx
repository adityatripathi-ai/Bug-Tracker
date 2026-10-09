import { useState } from "react";
import { Eye, EyeOff, Bug, Mail, Lock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f7f5] flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Brand panel: on mobile short header, on md+ full panel */}
        <div className="bg-gradient-to-br from-[#3d8b57] to-[#2f6664] text-white flex flex-col items-center justify-center text-center px-6 py-8 md:p-14">
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white/15 flex items-center justify-center mb-4 md:mb-6">
            <Bug size={28} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">BugTracker</h1>
          <p className="text-white/90 font-semibold text-base md:text-lg mt-2">
            Track. Fix. Verify.
          </p>
          <p className="hidden md:block text-white/75 text-sm max-w-sm mt-4 leading-6">
            A simple and effective way to manage bugs and keep your projects on track.
          </p>
          <div className="hidden md:flex mt-10 w-56 h-36 rounded-2xl bg-white/10 border border-white/20 items-center justify-center relative">
            <div className="w-28 h-20 rounded-lg bg-white/15 border border-white/25" />
            <div className="absolute right-10 bottom-8 w-12 h-12 rounded-full bg-white flex items-center justify-center">
              <Bug size={22} className="text-[#3d8b57]" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center px-5 py-8 sm:px-8 md:p-12">
          <div className="w-full max-w-md">
            <div className="mb-7">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Welcome back</h2>
              <p className="text-slate-500 mt-2 text-sm sm:text-base">
                Login to your account to continue.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email address
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full h-12 pl-11 pr-4 border border-slate-200 rounded-xl outline-none text-base sm:text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full h-12 pl-11 pr-12 border border-slate-200 rounded-xl outline-none text-base sm:text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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

              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="w-4 h-4 accent-blue-600"
                  />
                  Remember me
                </label>
                <button
                  type="button"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-brand hover:opacity-95 disabled:opacity-60 text-white rounded-xl font-semibold text-sm transition"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-7">
              Don&apos;t have an account?
              <Link to="/signup" className="text-blue-600 font-semibold ml-2 hover:text-blue-700">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;