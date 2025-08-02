import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Clock, RefreshCw, Home } from "lucide-react";

export default function EarningsCalendar() {
  const [earnings, setEarnings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const fetchEarnings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/events/earnings/upcoming?days=7`,
        { headers: { Accept: "application/json" } }
      );
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const payload = await res.json();
      setEarnings(payload.earnings || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, []);

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
          <h1 className="text-2xl font-bold text-text-primary">Upcoming Earnings</h1>
          <button
            onClick={fetchEarnings}
            className="p-2 bg-bg-card rounded-xl hover:bg-border transition flex items-center gap-2 shadow-md"
          >
            <RefreshCw className="w-5 h-5" />
            Refresh
          </button>
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
          
          {!loading && !error && earnings.length === 0 && (
            <div className="text-center py-8">
              <Clock className="w-16 h-16 text-text-secondary mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-text-primary mb-2">No Upcoming Earnings</h3>
              <p className="text-text-secondary">Check back later for upcoming earnings announcements</p>
            </div>
          )}
          
          {!loading && !error && earnings.length > 0 && (
            <ul className="space-y-4">
              {earnings.map((e) => (
                <li
                  key={`${e.symbol}-${e.report_date}`}
                  className="flex justify-between items-center bg-bg-primary p-4 rounded-xl border border-border hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-100 text-blue-800 w-10 h-10 rounded-full flex items-center justify-center font-bold">
                      {e.symbol}
                    </div>
                    <div>
                      <p className="font-medium text-text-primary">{e.name || e.symbol}</p>
                      <p className="text-text-secondary text-sm">
                        {new Date(e.report_date).toLocaleDateString('en-US', {
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-sm">
                    <Clock className="w-4 h-4 text-text-secondary" />
                    <span className="font-medium text-text-primary">
                      {e.time_of_day?.toUpperCase() || "TBD"}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
  );
}