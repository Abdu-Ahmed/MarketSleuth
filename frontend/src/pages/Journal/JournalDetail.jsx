import { useEffect, useState, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import { Trash2, Home, ArrowLeft } from "lucide-react";

export default function JournalDetail() {
  const { id } = useParams();
  const { accessToken } = useContext(AuthContext);
  const navigate = useNavigate();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/journal/${id}`, {
      headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' }
    })
      .then(res => res.json())
      .then(setEntry)
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('Delete this entry?')) return;
    await fetch(`${import.meta.env.VITE_API_URL}/journal/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' }
    });
    navigate('/journal');
  };

  if (loading) return (
      <div className="p-6 flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading journal entry...</p>
        </div>
      </div>
  );

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
          <h1 className="text-2xl font-bold text-text-primary">Entry Details</h1>
          <div></div> {/* Spacer for alignment */}
        </div>

        <div className="bg-bg-card rounded-xl border border-border p-6 shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h2 className="text-lg font-bold text-text-primary mb-4">Trade Details</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Ticker:</span>
                  <span className="font-medium text-text-primary">{entry.ticker}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Type:</span>
                  <span className={`font-medium ${entry.type === 'buy' ? 'text-green-500' : 'text-red-500'}`}>
                    {entry.type.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Quantity:</span>
                  <span className="font-medium text-text-primary">{entry.quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Price:</span>
                  <span className="font-medium text-text-primary">${entry.price}</span>
                </div>
                {entry.pl && (
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Profit/Loss:</span>
                    <span className={`font-medium ${parseFloat(entry.pl) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      ${entry.pl}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-bold text-text-primary mb-4">Metadata</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Created:</span>
                  <span className="font-medium text-text-primary">
                    {new Date(entry.created_at).toLocaleDateString()}
                  </span>
                </div>
                {entry.tags && entry.tags.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Tags:</span>
                    <div className="flex flex-wrap gap-1 justify-end">
                      {entry.tags.map(tag => (
                        <span key={tag} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {entry.notes && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-text-primary mb-3">Notes</h2>
              <div className="bg-bg-primary rounded-xl p-4 text-text-primary">
                {entry.notes}
              </div>
            </div>
          )}
          
          <div className="flex gap-3 pt-4 border-t border-border">
            <Link 
              to="/journal" 
              className="flex-1 text-center border border-border text-text-primary px-6 py-3 rounded-xl hover:bg-bg-primary transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Journal
            </Link>
            <button
              onClick={handleDelete}
              className="flex-1 bg-red-500 text-white px-6 py-3 rounded-xl hover:bg-red-600 flex items-center justify-center gap-2 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
              Delete Entry
            </button>
          </div>
        </div>
      </div>
  );
}