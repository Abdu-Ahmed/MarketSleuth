import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import { Plus, Search, Calendar, ArrowRight, Home } from "lucide-react";

export default function ScannerList() {
  const { accessToken } = useContext(AuthContext);
  const [scanners, setScanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/scanners`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json"
      }
    })
      .then(r => r.json())
      .then(setScanners)
      .finally(() => setLoading(false));
  }, [accessToken]);

  if (loading) {
    return (
        <div className="p-6 flex justify-center items-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-text-secondary">Loading your scanners...</p>
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
          <h1 className="text-2xl font-bold text-text-primary">Your Scanners</h1>
          <Link
            to="/scanners/new"
            className="bg-primary text-white px-4 py-3 rounded-xl hover:bg-primary-dark flex items-center gap-2 shadow-md transition-colors"
          >
            <Plus /> New Scanner
          </Link>
        </div>

        {scanners.length === 0 ? (
          <div className="bg-bg-card rounded-xl border border-border p-8 text-center shadow-md">
            <Search className="w-16 h-16 text-text-secondary mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-medium text-text-primary mb-2">No Scanners Yet</h3>
            <p className="text-text-secondary mb-6">Create your first custom scanner to find stocks that match your criteria</p>
            <Link
              to="/scanners/new"
              className="bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary-dark inline-flex items-center gap-2 transition-colors"
            >
              <Plus /> Create Your First Scanner
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {scanners.map(scanner => (
              <div 
                key={scanner.id} 
                className="bg-bg-card rounded-xl border border-border p-6 shadow-md hover:shadow-lg transition-all"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <h2 className="font-bold text-lg text-text-primary">{scanner.name}</h2>
                      <div className="flex items-center gap-1 text-text-secondary text-sm">
                        <Calendar className="w-4 h-4" />
                        <span>Created {new Date(scanner.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {scanner.criteria && (
                        <>
                          {scanner.criteria.dividendYield && (
                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                              Dividend {scanner.criteria.dividendYield.operator} {(scanner.criteria.dividendYield.value * 100).toFixed(1)}%
                            </span>
                          )}
                          {scanner.criteria.insiderBuysLastDays && (
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                              Insider buys ({scanner.criteria.insiderBuysLastDays}d)
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  
                  <Link
                    to={`/scanners/${scanner.id}/results`}
                    className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark flex items-center gap-2 transition-colors"
                  >
                    View Results
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
  );
}