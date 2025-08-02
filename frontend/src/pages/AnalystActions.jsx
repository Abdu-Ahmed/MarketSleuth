import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, ArrowRight, Home } from "lucide-react";

export default function AnalystActions() {
  const [symbol, setSymbol] = useState("");
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchActions = async (e) => {
    e.preventDefault();
    if (!symbol) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/events/analyst/${symbol.toUpperCase()}`,
        { headers: { Accept: "application/json" } }
      );
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const payload = await res.json();
      setActions(payload.actions || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-8">
          <Link
            to="/dashboard"
            className="bg-bg-card text-text-primary px-4 py-3 rounded-xl hover:bg-bg-primary transition-colors flex items-center gap-2 shadow-md mb-6 inline-block"
          >
            <Home className="w-5 h-5" />
            Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-text-primary mb-2">Analyst Actions</h1>
          <p className="text-text-secondary">Track analyst upgrades, downgrades, and initiations</p>
        </div>

        <div className="bg-bg-card rounded-xl border border-border p-6 shadow-md mb-6">
          <form onSubmit={fetchActions} className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Enter stock symbol (e.g. AAPL)"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-xl bg-bg-primary text-text-primary focus:ring-2 focus:ring-primary"
                required
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary text-sm">
                {symbol || "TICKER"}
              </span>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-primary text-white px-4 py-3 rounded-xl flex items-center gap-2 hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Search className="w-5 h-5" />
              <span>Search</span>
            </button>
          </form>
        </div>

        <div className="bg-bg-card rounded-xl border border-border p-6 shadow-md">
          {loading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}
          
          {!loading && !error && actions.length === 0 && symbol && (
            <div className="text-center py-8">
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-text-primary mb-2">No Analyst Actions Found</h3>
              <p className="text-text-secondary">No recent analyst actions for {symbol.toUpperCase()}</p>
            </div>
          )}
          
          {!loading && !error && actions.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="text-left text-text-secondary border-b border-border">
                    <th className="p-3 font-medium">Date</th>
                    <th className="p-3 font-medium">Symbol</th>
                    <th className="p-3 font-medium">From</th>
                    <th className="p-3 font-medium">To</th>
                    <th className="p-3 font-medium">Firm</th>
                    <th className="p-3 font-medium">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {actions.map((act, i) => (
                    <tr 
                      key={i} 
                      className="border-b border-border hover:bg-bg-primary transition-colors last:border-0"
                    >
                      <td className="p-3">
                        {new Date(act.action_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="p-3 font-medium">{act.symbol}</td>
                      <td className="p-3">
                        <span className="bg-gray-100 text-text-primary px-2 py-1 rounded text-xs">
                          {act.from_rating}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          act.to_rating > act.from_rating 
                            ? 'bg-green-100 text-green-800' 
                            : act.to_rating < act.from_rating 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-blue-100 text-blue-800'
                        }`}>
                          {act.to_rating}
                        </span>
                      </td>
                      <td className="p-3 text-text-secondary text-sm">{act.firm}</td>
                      <td className="p-3">
                        {act.source_url ? (
                          <a
                            href={act.source_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-primary hover:underline"
                          >
                            View <ArrowRight className="w-4 h-4" />
                          </a>
                        ) : (
                          <span className="text-text-secondary">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
  );
}