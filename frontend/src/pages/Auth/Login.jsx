import { useState, useContext } from "react";
import { login } from "../../api/auth";
import { AuthContext } from "../../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { DollarSign, Lock, AlertCircle } from "lucide-react";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const { setTokens, setUser } = useContext(AuthContext);
  const nav = useNavigate();

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  
  const handleSubmit = async e => {
  e.preventDefault();
  setError("");

  try {
    // Destructure the result of login() directly
    const { user, accessToken, refreshToken, expiresIn } = await login(form);

    // Store tokens and user
    setTokens(accessToken, refreshToken);
    setUser(user);

    // Redirect to dashboard
    nav("/dashboard");

  } catch (err) {
    setError(err.message || "An unexpected error occurred. Please try again.");
  }
};


  return (
      <div className="w-full max-w-md mx-auto bg-bg-card rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-primary py-6 px-8">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-lg">
              <DollarSign className="text-primary w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-white">MarketSleuth</h1>
          </div>
          <p className="text-blue-100 mt-2">Access your investor dashboard</p>
        </div>
        
        <div className="p-8">
          <h2 className="text-xl font-bold text-text-primary mb-6">Log In</h2>
          
          {error && (
            <div className="bg-red-50 text-danger p-3 rounded-lg mb-4 flex items-start gap-2">
              <AlertCircle className="flex-shrink-0 mt-0.5" size={18} />
              <span>{error}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Email Address</label>
              <div className="relative">
                <input
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full border border-border bg-bg-primary text-text-primary rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent pl-10"
                  required
                />
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full border border-border bg-bg-primary text-text-primary rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent pl-10"
                  required
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" size={18} />
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-primary rounded focus:ring-primary"
                />
                <label htmlFor="remember" className="ml-2 text-sm text-text-secondary">
                  Remember me
                </label>
              </div>
              <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-medium transition-colors flex items-center justify-center"
            >
              Sign In
            </button>
            
            <div className="text-center pt-4">
              <p className="text-text-secondary">
                Don't have an account?{' '}
                <Link to="/signup" className="text-primary font-medium hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
  );
}