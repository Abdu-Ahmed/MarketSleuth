import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { toast } from "react-hot-toast";
import { User, Key, ArrowLeft, Save } from "lucide-react";

export default function Settings() {
  const { accessToken } = useContext(AuthContext);

  // Profile
  const [profile, setProfile] = useState({ name: "", email: "" });
  const [savingProfile, setSavingProfile] = useState(false);

  // Password
  const [pwForm, setPwForm] = useState({ current_password: "", password: "", password_confirmation: "" });
  const [changingPw, setChangingPw] = useState(false);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/settings/profile`, {
      headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" }
    })
      .then(r => r.json())
      .then(setProfile);
  }, [accessToken]);

  const saveProfile = async e => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/settings/profile`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify(profile)
      });
      if (!res.ok) throw await res.json();
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.error || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async e => {
    e.preventDefault();
    setChangingPw(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/settings/password`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify(pwForm)
      });
      if (!res.ok) throw await res.json();
      toast.success("Password changed");
      setPwForm({ current_password: "", password: "", password_confirmation: "" });
    } catch (err) {
      toast.error(err.error || "Password change failed");
    } finally {
      setChangingPw(false);
    }
  };

  return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => window.history.back()}
            className="bg-bg-card text-text-primary p-3 rounded-xl hover:bg-bg-primary transition-colors flex items-center gap-2 shadow-md"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
        </div>

        <div className="bg-bg-card rounded-xl border border-border p-6 shadow-md mb-6">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-semibold text-text-primary">Profile Settings</h2>
          </div>
          
          <form onSubmit={saveProfile} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={e => setProfile({ ...profile, name: e.target.value })}
                  className="w-full px-4 py-3 border border-border rounded-xl bg-bg-primary text-text-primary focus:ring-2 focus:ring-primary"
                  placeholder="John Doe"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={e => setProfile({ ...profile, email: e.target.value })}
                  className="w-full px-4 py-3 border border-border rounded-xl bg-bg-primary text-text-primary focus:ring-2 focus:ring-primary"
                  placeholder="your@email.com"
                />
              </div>
            </div>
            
            <div className="pt-4">
              <button
                type="submit"
                disabled={savingProfile}
                className="w-full py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingProfile ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Profile
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-bg-card rounded-xl border border-border p-6 shadow-md">
          <div className="flex items-center gap-3 mb-6">
            <Key className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-semibold text-text-primary">Password Settings</h2>
          </div>
          
          <form onSubmit={changePassword} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Current Password
              </label>
              <input
                type="password"
                value={pwForm.current_password}
                onChange={e => setPwForm(f => ({ ...f, current_password: e.target.value }))}
                className="w-full px-4 py-3 border border-border rounded-xl bg-bg-primary text-text-primary focus:ring-2 focus:ring-primary"
                placeholder="••••••••"
              />
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={pwForm.password}
                  onChange={e => setPwForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full px-4 py-3 border border-border rounded-xl bg-bg-primary text-text-primary focus:ring-2 focus:ring-primary"
                  placeholder="••••••••"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={pwForm.password_confirmation}
                  onChange={e => setPwForm(f => ({ ...f, password_confirmation: e.target.value }))}
                  className="w-full px-4 py-3 border border-border rounded-xl bg-bg-primary text-text-primary focus:ring-2 focus:ring-primary"
                  placeholder="••••••••"
                />
              </div>
            </div>
            
            <div className="pt-4">
              <button
                type="submit"
                disabled={changingPw}
                className="w-full py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {changingPw ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Key className="w-5 h-5" />
                    Change Password
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
  );
}