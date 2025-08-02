import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import { ArrowLeft, Save, Play } from "lucide-react";

export default function ScannerForm() {
  const { accessToken } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [name, setName] = useState("");
  const [divYieldOp, setDivYieldOp] = useState(">");
  const [divYieldVal, setDivYieldVal] = useState(0.04);
  const [insiderDays, setInsiderDays] = useState(90);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const payload = {
      name,
      criteria: {
        dividendYield: { operator: divYieldOp, value: parseFloat(divYieldVal) },
        insiderBuysLastDays: parseInt(insiderDays),
      },
    };

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/scanners`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) throw new Error("Failed to create scanner");
      const data = await res.json();
      navigate(`/scanners/${data.id}/results`);
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-bg-card text-text-primary p-3 rounded-xl hover:bg-bg-primary transition-colors flex items-center gap-2 shadow-md"
          >
            <ArrowLeft className="w-5 h-5" />
            Dashboard
          </button>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Create New Scanner</h1>
            <p className="text-text-secondary">Set up custom criteria to find stocks that match your requirements</p>
          </div>
        </div>

        <div className="bg-bg-card rounded-xl border border-border p-6 shadow-md">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Scanner Name
              </label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                required
                placeholder="e.g., High Dividend with Insider Activity"
                className="w-full px-4 py-3 border border-border rounded-xl bg-bg-primary text-text-primary focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-bg-primary p-4 rounded-xl">
                <h3 className="font-medium text-text-primary mb-4">Dividend Criteria</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Dividend Yield
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={divYieldOp}
                        onChange={e => setDivYieldOp(e.target.value)}
                        className="px-4 py-3 border border-border rounded-xl bg-bg-primary text-text-primary focus:ring-2 focus:ring-primary"
                      >
                        <option value=">">&gt;</option>
                        <option value="<">&lt;</option>
                        <option value=">=">&ge;</option>
                        <option value="<=">&le;</option>
                      </select>
                      <div className="flex-1 relative">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="1"
                          value={divYieldVal}
                          onChange={e => setDivYieldVal(e.target.value)}
                          className="w-full px-4 py-3 border border-border rounded-xl bg-bg-primary text-text-primary focus:ring-2 focus:ring-primary"
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary text-sm">
                          ({(divYieldVal * 100).toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-bg-primary p-4 rounded-xl">
                <h3 className="font-medium text-text-primary mb-4">Insider Activity</h3>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Insider Buys in Last Days
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={insiderDays}
                    onChange={e => setInsiderDays(e.target.value)}
                    className="w-full px-4 py-3 border border-border rounded-xl bg-bg-primary text-text-primary focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate("/scanners")}
                className="flex-1 px-6 py-3 border border-border text-text-secondary rounded-xl hover:bg-bg-primary transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
              >
                {submitting ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    Create & Run Scanner
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
  );
}