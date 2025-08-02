import { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import { Bell, Plus, RefreshCw, Trash2, Edit2, Home } from "lucide-react";

export default function AlertsList() {
  const { accessToken } = useContext(AuthContext);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  const fetchAlerts = () => {
    setLoading(true);
    fetch(`${import.meta.env.VITE_API_URL}/alerts`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    })
      .then(r => r.json())
      .then(setAlerts)
      .finally(() => setLoading(false));
  };

  const deleteAlert = (id) => {
    if (!confirm("Delete this alert?")) return;
    fetch(`${import.meta.env.VITE_API_URL}/alerts/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    }).then(() => fetchAlerts());
  };

  useEffect(fetchAlerts, [accessToken]);

  return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Link
            to="/dashboard"
            className="bg-bg-card text-text-primary px-4 py-3 rounded-xl hover:bg-bg-primary transition-colors flex items-center gap-2 shadow-md"
          >
            <Home className="w-5 h-5" />
            Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-text-primary">Your Alerts</h1>
          </div>
          <button
            onClick={() => nav("/alerts/new")}
            className="bg-primary text-white px-4 py-3 rounded-xl hover:bg-primary-dark flex items-center gap-2 shadow-md transition-colors"
          >
            <Plus className="w-5 h-5" /> New Alert
          </button>
        </div>

        {loading ? (
          <div className="bg-bg-card rounded-xl border border-border p-12 flex items-center justify-center">
            <div className="text-center">
              <RefreshCw className="animate-spin w-12 h-12 text-primary mx-auto mb-4" />
              <p className="text-text-secondary">Loading your alerts...</p>
            </div>
          </div>
        ) : alerts.length === 0 ? (
          <div className="bg-bg-card rounded-xl border border-border p-8 text-center shadow-md">
            <Bell className="w-16 h-16 text-text-secondary mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-medium text-text-primary mb-2">No Alerts Yet</h3>
            <p className="text-text-secondary mb-6">Create alerts to get notified about important market events</p>
            <button
              onClick={() => nav("/alerts/new")}
              className="bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary-dark inline-flex items-center gap-2 transition-colors"
            >
              <Plus className="w-5 h-5" /> Create Your First Alert
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map(a => (
              <div
                key={a.id}
                className="bg-bg-card p-6 rounded-xl border border-border shadow-md hover:shadow-lg transition-all"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-bold text-lg text-text-primary flex items-center gap-2">
                          <span className="capitalize">{a.type}</span>
                          {a.symbol && (
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                              {a.symbol}
                            </span>
                          )}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {Object.entries(a.config).map(([key, value]) => (
                            <div key={key} className="bg-bg-primary px-3 py-1.5 rounded-lg text-sm">
                              <span className="text-text-secondary">{key}:</span>
                              <span className="font-medium text-text-primary ml-1">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        a.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                      }`}>
                        {a.active ? "Active" : "Inactive"}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => nav(`/alerts/${a.id}/edit`)}
                      className="p-2 hover:bg-bg-primary rounded-lg text-text-secondary hover:text-text-primary transition-colors"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => deleteAlert(a.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5 text-red-500 hover:text-red-700" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
  );
}