import { useState, useContext, useEffect } from "react";
import { register, checkPasswordStrength } from "../../api/auth";
import { AuthContext } from "../../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { DollarSign, Lock, User, ShieldCheck, AlertCircle, Check, X, Eye, EyeOff } from "lucide-react";

export default function Signup() {
  const [form, setForm] = useState({ 
    name: "", 
    email: "", 
    password: "", 
    password_confirmation: "" 
  });
  const [error, setError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { setTokens, setNeedsVerification } = useContext(AuthContext);
  const nav = useNavigate();

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    if (e.target.name === "password") {
      setPasswordErrors([]);
    }
  };
  
  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    
    // Client-side validation
    if (form.password !== form.password_confirmation) {
      setError("Passwords do not match");
      return;
    }
    
    if (passwordStrength?.score < 2) {
      setError("Password is too weak. Please choose a stronger password.");
      return;
    }
    
    try {
      const data = await register(form);
      
      if (data.access_token) {
        setTokens(data.access_token, data.refresh_token);
        setNeedsVerification(true);
        nav("/verify-email");
      } else {
        setError(data.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    }
  };

  // Check password strength in real-time
  useEffect(() => {
    if (form.password.length >= 4) {
      setIsChecking(true);
      const timer = setTimeout(async () => {
        try {
          const data = await checkPasswordStrength(form.password);
          setPasswordStrength(data);
          
          // Extract password errors
          if (data.errors && data.errors.length > 0) {
            setPasswordErrors(data.errors);
          } else {
            setPasswordErrors([]);
          }
        } catch (err) {
          console.error("Password check failed:", err);
        } finally {
          setIsChecking(false);
        }
      }, 500);
      
      return () => clearTimeout(timer);
    } else {
      setPasswordStrength(null);
      setPasswordErrors([]);
    }
  }, [form.password]);

  // Password strength indicators
  const strengthLabels = {
    0: "Very Weak",
    1: "Weak",
    2: "Medium",
    3: "Strong",
    4: "Very Strong"
  };
  
  const strengthColors = {
    0: "bg-red-500",
    1: "bg-orange-500",
    2: "bg-yellow-500",
    3: "bg-green-400",
    4: "bg-green-600"
  };

  // Password requirements
  const passwordRequirements = [
    { id: 'length', text: 'At least 12 characters', regex: /.{12,}/ },
    { id: 'uppercase', text: 'At least one uppercase letter', regex: /[A-Z]/ },
    { id: 'lowercase', text: 'At least one lowercase letter', regex: /[a-z]/ },
    { id: 'number', text: 'At least one number', regex: /[0-9]/ },
    { id: 'special', text: 'At least one special character', regex: /[!@#$%^&*(),.?":{}|<>]/ },
    { id: 'no-repeat', text: 'No three repeating characters', regex: /^(?!.*(.)\1\1).*$/ }
  ];

  return (
      <div className="w-full max-w-md mx-auto bg-bg-card rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-primary py-6 px-8">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-lg">
              <DollarSign className="text-primary w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-white">MarketSleuth</h1>
          </div>
          <p className="text-blue-100 mt-2">Create your investor account</p>
        </div>
        
        <div className="p-8">
          <h2 className="text-xl font-bold text-text-primary mb-6">Sign Up</h2>
          {error && (
            <div className="bg-red-50 text-danger p-3 rounded-lg mb-4 flex items-start gap-2">
              <AlertCircle className="flex-shrink-0 mt-0.5" size={18} />
              <span>{error}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Full Name</label>
              <div className="relative">
                <input 
                  name="name" 
                  placeholder="John Doe" 
                  value={form.name} 
                  onChange={handleChange}
                  className="w-full border border-border bg-bg-primary text-text-primary rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent pl-10"
                  required 
                />
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" size={18} />
              </div>
            </div>
            
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
              <label className="block text-sm font-medium text-text-secondary mb-1 flex items-center gap-2">
                Password
                {passwordStrength?.score >= 3 && (
                  <span className="flex items-center gap-1 text-xs text-green-600">
                    <ShieldCheck size={14} />
                    Secure
                  </span>
                )}
              </label>
              <div className="relative">
                <input 
                  name="password" 
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••" 
                  value={form.password} 
                  onChange={handleChange}
                  className="w-full border border-border bg-bg-primary text-text-primary rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent pl-10 pr-10"
                  required 
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" size={18} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {form.password && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-text-secondary">
                      {isChecking ? "Checking..." : strengthLabels[passwordStrength?.score || 0]}
                    </span>
                    {passwordStrength && (
                      <span className="text-xs font-medium text-text-secondary">
                        {passwordStrength.score}/4
                      </span>
                    )}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    {passwordStrength && (
                      <div 
                        className={`h-2 rounded-full ${strengthColors[passwordStrength.score]}`}
                        style={{ width: `${(passwordStrength.score + 1) * 20}%` }}
                      ></div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Password Requirements */}
              <div className="mt-3 space-y-2">
                <p className="text-xs text-text-secondary font-medium">Password must contain:</p>
                <ul className="space-y-1">
                  {passwordRequirements.map(req => {
                    const meetsRequirement = req.regex.test(form.password);
                    const isError = passwordErrors.some(e => e.toLowerCase().includes(req.id));
                    
                    return (
                      <li key={req.id} className="flex items-center text-xs">
                        {meetsRequirement ? (
                          <Check className="text-green-500 mr-2" size={14} />
                        ) : isError ? (
                          <X className="text-red-500 mr-2" size={14} />
                        ) : (
                          <span className="w-[14px] h-[14px] rounded-full border border-border mr-2"></span>
                        )}
                        <span className={isError ? "text-danger" : meetsRequirement ? "text-green-600" : "text-text-secondary"}>
                          {req.text}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Confirm Password</label>
              <div className="relative">
                <input 
                  name="password_confirmation" 
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password_confirmation} 
                  onChange={handleChange}
                  className="w-full border border-border bg-bg-primary text-text-primary rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent pl-10 pr-10"
                  required 
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" size={18} />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              
              {form.password_confirmation && form.password !== form.password_confirmation && (
                <p className="text-xs text-danger mt-1 flex items-center">
                  <X className="mr-1" size={14} /> 
                  Passwords do not match
                </p>
              )}
            </div>
            
            <button 
              type="submit" 
              className="w-full py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-medium transition-colors flex items-center justify-center"
            >
              Create Account
            </button>
            
            <div className="text-center pt-4">
              <p className="text-text-secondary text-sm">
                By creating an account, you agree to our{' '}
                <a href="#" className="text-primary hover:underline">Terms of Service</a> and{' '}
                <a href="#" className="text-primary hover:underline">Privacy Policy</a>
              </p>
            </div>
            
            <div className="text-center pt-2">
              <p className="text-text-secondary">
                Already have an account?{' '}
                <Link to="/login" className="text-primary font-medium hover:underline">
                  Log in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
  );
}