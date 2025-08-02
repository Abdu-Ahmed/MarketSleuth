import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { RefreshCw, Home, ArrowLeft } from "lucide-react";

export default function EventsFeed() {
  const [events, setEvents]     = useState([]);
  const [page, setPage]         = useState(1);
  const [hasMore, setHasMore]   = useState(true);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [filter, setFilter]     = useState("");

  const fetchPage = async (p = 1) => {
    setLoading(true);
    setError(null);
    try {
      const url = new URL(`${import.meta.env.VITE_API_URL}/events/all`);
      url.searchParams.set("page", p);
      if (filter) url.searchParams.set("type", filter);

      const res = await fetch(url.toString(), { headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const payload = await res.json();
      setEvents((ev) => (p === 1 ? payload.data : [...ev, ...payload.data]));
      setHasMore(!!payload.next_page_url);
      setPage(p);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPage(1);
  }, [filter]);

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
          <h1 className="text-2xl font-bold text-text-primary">Events Feed</h1>
          <button
            onClick={() => fetchPage(1)}
            className="p-2 bg-bg-card rounded-xl hover:bg-border transition flex items-center gap-2 shadow-md"
          >
            <RefreshCw className="w-5 h-5" />
            Refresh
          </button>
        </div>

        <div className="bg-bg-card rounded-xl border border-border p-6 shadow-md mb-6">
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-text-secondary">Filter by:</span>
            {["", "conference", "13f"].map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                  filter === t
                    ? "bg-primary text-white"
                    : "bg-bg-primary text-text-secondary hover:bg-border"
                }`}
              >
                {t === "" ? "All Events" : t.toUpperCase()}
              </button>
            ))}
          </div>

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

          {!loading && !error && events.length === 0 && (
            <div className="text-center py-8">
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-text-primary mb-2">No Events Found</h3>
              <p className="text-text-secondary">Try changing your filters or refresh the page</p>
            </div>
          )}

          {!loading && events.length > 0 && (
            <ul className="space-y-4">
              {events.map((ev) => (
                <li 
                  key={ev.id} 
                  className="bg-bg-primary p-4 rounded-xl border border-border hover:shadow-md transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                          {ev.type.toUpperCase()}
                        </span>
                        <span className="font-semibold text-text-primary">{ev.title}</span>
                      </div>
                      <p className="text-text-secondary text-sm">
                        {new Date(ev.event_date).toLocaleDateString('en-US', {
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    {ev.link && (
                      <a
                        href={ev.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline text-sm flex items-center gap-1 whitespace-nowrap"
                      >
                        Details <ArrowRight className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}

          {hasMore && !loading && (
            <div className="text-center mt-6">
              <button
                onClick={() => fetchPage(page + 1)}
                className="bg-bg-primary text-text-primary px-4 py-2 rounded-xl hover:bg-border transition-colors"
              >
                Load More
              </button>
            </div>
          )}
        </div>
      </div>
  );
}