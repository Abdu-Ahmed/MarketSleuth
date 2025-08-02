import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import { Plus, Trash2, Home } from "lucide-react";

export default function JournalList() {
  const { accessToken } = useContext(AuthContext);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/journal`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json"
      }
    })
      .then(res => res.json())
      .then(data => setEntries(data))
      .finally(() => setLoading(false));
  }, [accessToken]);

  const handleDelete = async id => {
    if (!confirm("Delete this entry?")) return;
    await fetch(`${import.meta.env.VITE_API_URL}/journal/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json"
      }
    });
    setEntries(e => e.filter(entry => entry.id !== id));
  };

  if (loading) return (
      <div className="p-6 flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading journal entries...</p>
        </div>
      </div>
  );

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
          <h1 className="text-2xl font-bold text-text-primary">Trade Journal</h1>
          <Link
            to="/journal/new"
            className="bg-primary text-white px-4 py-3 rounded-xl hover:bg-primary-dark flex items-center gap-2 shadow-md transition-colors"
          >
            <Plus /> New Entry
          </Link>
        </div>

        {entries.length === 0 ? (
          <div className="bg-bg-card rounded-xl border border-border p-8 text-center shadow-md">
            <Book className="w-16 h-16 text-text-secondary mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-medium text-text-primary mb-2">No Journal Entries Yet</h3>
            <p className="text-text-secondary mb-6">Start tracking your trades to analyze your performance</p>
            <Link
              to="/journal/new"
              className="bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary-dark inline-flex items-center gap-2 transition-colors"
            >
              <Plus /> Create First Entry
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map(entry => (
              <div 
                key={entry.id} 
                className="bg-bg-card rounded-xl p-6 border border-border shadow-md hover:shadow-lg transition-all"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-bold text-lg text-text-primary">
                          {entry.ticker} &ndash; <span className={`${entry.type === 'buy' ? 'text-green-500' : 'text-red-500'}`}>
                            {entry.type.toUpperCase()}
                          </span>
                        </p>
                        <p className="text-sm text-text-secondary mb-2">
                          {new Date(entry.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                        ${entry.price}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <div>
                        <span className="text-xs text-text-secondary">Quantity:</span>
                        <p className="font-medium">{entry.quantity}</p>
                      </div>
                      {entry.pl && (
                        <div>
                          <span className="text-xs text-text-secondary">P/L:</span>
                          <p className={`font-medium ${parseFloat(entry.pl) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            ${entry.pl}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {entry.notes && (
                      <div className="mt-4">
                        <span className="text-xs text-text-secondary">Notes:</span>
                        <p className="mt-1 text-text-primary bg-bg-primary rounded-lg p-3">
                          {entry.notes}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="ml-4 p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
  );
}