import { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import { ArrowLeft, Calendar, RefreshCw, Home } from "lucide-react";

export default function ScannerResults() {
  const { id } = useParams();
  const { accessToken } = useContext(AuthContext);
  const [results, setResults] = useState([]);
  const [scanner, setScanner] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchResults = () => {
    setLoading(true);
    fetch(`${import.meta.env.VITE_API_URL}/scanners/${id}/results`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json"
      }
    })
      .then(res => res.json())
      .then(data => {
        setResults(data.results || []);
        setScanner(data.scanner);
      })
      .catch(err => console.error("Error fetching results:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchResults();
  }, [id, accessToken]);

  if (loading) {
    return (
        <div className="p-6 flex justify-center items-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-text-secondary">Loading scanner results...</p>
          </div>
        </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-text-primary">
            {scanner?.name || `Scan #${id}`} Results
          </h1>
          <div></div> {/* Spacer for alignment */}
        </div>

        <div className="bg-bg-card rounded-xl border border-border p-6 shadow-md">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={fetchResults}
                className="flex items-center gap-2 bg-bg-primary px-4 py-2 rounded-xl hover:bg-bg-card transition-colors"
              >
                <RefreshCw className="w-4 h-4 text-text-primary" />
                <span className="text-text-primary">Refresh</span>
              </button>
              <div className="flex items-center gap-1 text-text-secondary text-sm">
                <Calendar className="w-4 h-4" />
                <span>Last run: {scanner ? new Date(scanner.updated_at).toLocaleString() : '-'}</span>
              </div>
            </div>
            <div className="text-sm text-text-secondary">
              {results.length} results
            </div>
          </div>

          {results.length === 0 ? (
            <div className="text-center py-8">
              <Search className="w-16 h-16 text-text-secondary mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-text-primary mb-2">No Matching Stocks Found</h3>
              <p className="text-text-secondary">Try adjusting your scanner criteria</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-text-secondary font-medium">Ticker</th>
                    <th className="text-left py-3 px-4 text-text-secondary font-medium">Matched At</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr key={i} className="border-b border-border hover:bg-bg-primary last:border-0">
                      <td className="py-3 px-4 font-medium text-text-primary">
                        {r.ticker}
                      </td>
                      <td className="py-3 px-4 text-text-secondary">
                        {new Date(r.matched_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          <div className="mt-8 pt-4 border-t border-border">
            <Link 
              to="/scanners" 
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Scanners
            </Link>
          </div>
        </div>
      </div>
  );
}