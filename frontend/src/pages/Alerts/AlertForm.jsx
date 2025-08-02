import { useState, useContext, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import { ArrowLeft, Save, Home } from "lucide-react";

export default function AlertForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { accessToken } = useContext(AuthContext);
  const nav = useNavigate();

  const [form, setForm] = useState({
    type: "earnings",
    symbol: "",
    config: {},
    active: true,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      fetch(`${import.meta.env.VITE_API_URL}/alerts/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      })
        .then(r => r.json())
        .then(data => setForm(data))
        .catch(() => setError("Failed to load alert"))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleChange = (field) => (e) => {
    if (field === "active") {
      setForm(f => ({ ...f, active: e.target.checked }));
    } else if (field.startsWith("config.")) {
      const key = field.split(".")[1];
      setForm(f => ({
        ...f,
        config: { ...f.config, [key]: e.target.value },
      }));
    } else {
      setForm(f => ({ ...f, [field]: e.target.value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // basic validation
    if (!form.type) return setError("Type is required");
    if (form.type !== "earnings" && !form.symbol)
      return setError("Symbol is required for this alert");

    const url = isEdit
      ? `${import.meta.env.VITE_API_URL}/alerts/${id}`
      : `${import.meta.env.VITE_API_URL}/alerts`;
    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const payload = await res.json();
        throw new Error(payload.error || "Failed to save");
      }
      nav("/alerts");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Link
            to="/dashboard"
            className="bg-bg-card text-text-primary px-4 py-3 rounded-xl hover:bg-bg-primary transition-colors flex items-center gap-2 shadow-md"
          >
            <Home className="w-5 h-5" />
            Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-text-primary">
            {isEdit ? "Edit Alert" : "New Alert"}
          </h1>
          <div></div> {/* Spacer for alignment */}
        </div>

        <div className="bg-bg-card rounded-xl border border-border p-6 shadow-md">
          {loading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}

          {!loading && error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {!loading && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Alert Type
                  </label>
                  <select
                    value={form.type}
                    onChange={handleChange("type")}
                    className="w-full border border-border rounded-xl px-4 py-3 bg-bg-primary text-text-primary focus:ring-2 focus:ring-primary"
                  >
                    <option value="earnings">Earnings Announcement</option>
                    <option value="insider">Insider Trades</option>
                    <option value="dividend">Ex‑Dividend Date</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Status
                  </label>
                  <div className="flex items-center gap-3 mt-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.active}
                        onChange={handleChange("active")}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                    <span className={`font-medium ${
                      form.active ? "text-green-600" : "text-text-secondary"
                    }`}>
                      {form.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>

              {form.type === "earnings" && (
                <div className="bg-bg-primary p-4 rounded-xl">
                  <h3 className="font-medium text-text-primary mb-4">Earnings Criteria</h3>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Days Ahead
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={form.config.daysAhead || ""}
                      onChange={handleChange("config.daysAhead")}
                      className="w-full border border-border rounded-xl px-4 py-3 bg-bg-primary text-text-primary focus:ring-2 focus:ring-primary"
                      placeholder="e.g. 2 (days before earnings)"
                    />
                  </div>
                </div>
              )}

              {(form.type === "insider" || form.type === "dividend") && (
                <div className="bg-bg-primary p-4 rounded-xl">
                  <h3 className="font-medium text-text-primary mb-4">Stock Criteria</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Symbol
                      </label>
                      <input
                        type="text"
                        value={form.symbol}
                        onChange={handleChange("symbol")}
                        className="w-full border border-border rounded-xl px-4 py-3 bg-bg-primary text-text-primary focus:ring-2 focus:ring-primary"
                        placeholder="e.g. AAPL"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Lookback Days
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={form.config.lastDays || ""}
                        onChange={handleChange("config.lastDays")}
                        className="w-full border border-border rounded-xl px-4 py-3 bg-bg-primary text-text-primary focus:ring-2 focus:ring-primary"
                        placeholder="e.g. 7"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => nav("/alerts")}
                  className="flex-1 px-6 py-3 border border-border text-text-secondary rounded-xl hover:bg-bg-primary transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
                >
                  <Save className="w-5 h-5" />
                  {isEdit ? "Save Changes" : "Create Alert"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
  );
}