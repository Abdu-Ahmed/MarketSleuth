import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { Switch } from "@headlessui/react";
import { toast } from "react-hot-toast";
import { Database, ArrowLeft } from "lucide-react";

export default function DataSources() {
  const { accessToken } = useContext(AuthContext);
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${import.meta.env.VITE_API_URL}/data-sources`, {
      headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" }
    })
      .then(r => r.json())
      .then(data => {
        setSources(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [accessToken]);

  const toggle = async (id, enabled) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/data-sources/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ enabled })
      });
      if (!res.ok) throw await res.json();
      setSources(srcs => srcs.map(s => s.id === id ? { ...s, enabled } : s));
      toast.success("Data source updated");
    } catch (e) {
      toast.error(e.error || "Failed to update data source");
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
          <h1 className="text-2xl font-bold text-text-primary">Data Sources</h1>
        </div>

        <div className="bg-bg-card rounded-xl border border-border p-6 shadow-md">
          <div className="flex items-center gap-3 mb-6">
            <Database className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-semibold text-text-primary">Manage Data Sources</h2>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : sources.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-text-secondary">No data sources configured</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {sources.map(src => (
                <li 
                  key={src.id} 
                  className="flex justify-between items-center bg-bg-primary p-4 rounded-xl border border-border"
                >
                  <div>
                    <p className="font-medium text-text-primary">{src.name}</p>
                    {src.config.api_key && (
                      <p className="text-sm text-text-secondary mt-1">
                        API Key: {src.config.api_key.replace(/.(?=.{4})/g, "*")}
                      </p>
                    )}
                  </div>
                  <Switch
                    checked={src.enabled}
                    onChange={on => toggle(src.id, on)}
                    className={`${
                      src.enabled ? 'bg-primary' : 'bg-border'
                    } relative inline-flex items-center h-6 rounded-full w-11 transition-colors`}
                  >
                    <span
                      className={`${
                        src.enabled ? 'translate-x-6' : 'translate-x-1'
                      } inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
                    />
                  </Switch>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
  );
}