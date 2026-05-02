import { useState } from "react";
import { useNavigate } from "react-router";
import { Shield, User, Briefcase, Lock, Mail, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";

type Role = "admin" | "organizer" | "customer" | null;

export function Login() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<Role>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const roles = [
    { id: "admin" as Role, label: "Admin", icon: Shield, color: "indigo", desc: "Full system control" },
    { id: "organizer" as Role, label: "Organizer", icon: Briefcase, color: "purple", desc: "Manage services" },
    { id: "customer" as Role, label: "Customer", icon: User, color: "blue", desc: "Book appointments" },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) {
      setError("Please select a role to continue.");
      return;
    }
    if (selectedRole !== "admin") {
      setError("Only Admin login is available in this panel. Please select Admin.");
      return;
    }
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login failed. Please check your credentials.");
        setLoading(false);
        return;
      }

      // Check role from backend response
      if (data.user.role !== "ADMIN") {
        setError("Access denied. This panel is restricted to Admins only.");
        setLoading(false);
        return;
      }

      // Store token and user info
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setSuccess("Login successful! Redirecting to dashboard...");
      setTimeout(() => navigate("/"), 800);
    } catch {
      setError("Cannot connect to server. Please make sure the backend is running on port 5000.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
      {/* Decorative background circles */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500 rounded-full filter blur-3xl opacity-10 -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl opacity-10 translate-x-1/2 translate-y-1/2" />

      <div className="relative w-full max-w-md">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/30 mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">BookingAdmin</h1>
          <p className="text-slate-400 text-sm">Select your role to continue</p>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">

          {/* Role Selector */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {roles.map((role) => {
              const Icon = role.icon;
              const isSelected = selectedRole === role.id;
              return (
                <button
                  key={role.id}
                  onClick={() => { setSelectedRole(role.id); setError(""); }}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 ${
                    isSelected
                      ? "border-indigo-400 bg-indigo-500/20 text-white"
                      : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-slate-300"
                  }`}
                >
                  <Icon className={`w-6 h-6 ${isSelected ? "text-indigo-400" : ""}`} />
                  <span className="text-xs font-semibold">{role.label}</span>
                  <span className="text-xs opacity-60 hidden sm:block">{role.desc}</span>
                </button>
              );
            })}
          </div>

          {/* Admin Notice */}
          {selectedRole && selectedRole !== "admin" && (
            <div className="mb-4 flex items-start gap-3 p-3 bg-yellow-500/10 border border-yellow-400/30 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="text-yellow-300 text-xs">This admin panel is only accessible to <strong>Admin</strong> accounts. Please select the Admin role.</p>
            </div>
          )}

          {/* Login Form */}
          {selectedRole === "admin" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="text-center mb-4">
                <span className="text-slate-300 text-sm">Sign in as <span className="text-indigo-400 font-semibold">Administrator</span></span>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="admin@booking.com"
                    className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-colors text-sm"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-lg pl-10 pr-10 py-2.5 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-colors text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-300 text-xs">{error}</p>
                </div>
              )}

              {/* Success */}
              {success && (
                <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <p className="text-green-300 text-xs">{success}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-all duration-200 shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Verifying...
                  </>
                ) : "Sign In to Dashboard"}
              </button>
            </form>
          )}

          {/* Demo hint */}
          {selectedRole === "admin" && (
            <p className="text-center text-xs text-slate-500 mt-4">
              Demo: <span className="text-slate-400">admin@booking.com</span> / <span className="text-slate-400">admin@123</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
