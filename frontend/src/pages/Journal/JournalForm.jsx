import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import { ArrowLeft, Save } from "lucide-react";

export default function JournalForm() {
  const { accessToken } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    ticker: '', type: 'buy', quantity: '', price: '', pl: '', tags: '', notes: '', attachment_url: ''
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        ...form,
        quantity: form.quantity || null,
        price: form.price || null,
        pl: form.pl || null,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()) : []
      };

      const res = await fetch(`${import.meta.env.VITE_API_URL}/journal`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to save entry');
      navigate('/journal');
    } catch (e) {
      setError(e.message);
    }
  };

  return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-bg-card text-text-primary p-3 rounded-xl hover:bg-bg-primary transition-colors flex items-center gap-2 shadow-md"
          >
            <ArrowLeft className="w-5 h-5" />
            Dashboard
          </button>
          <h1 className="text-2xl font-bold text-text-primary">New Journal Entry</h1>
        </div>

        <div className="bg-bg-card rounded-xl border border-border p-6 shadow-md">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Ticker *
                </label>
                <input
                  name="ticker"
                  value={form.ticker}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-border rounded-xl bg-bg-primary text-text-primary focus:ring-2 focus:ring-primary"
                  placeholder="AAPL"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Trade Type *
                </label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-border rounded-xl bg-bg-primary text-text-primary focus:ring-2 focus:ring-primary"
                >
                  <option value="buy">Buy</option>
                  <option value="sell">Sell</option>
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Quantity
                </label>
                <input
                  name="quantity"
                  type="number"
                  value={form.quantity}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-border rounded-xl bg-bg-primary text-text-primary focus:ring-2 focus:ring-primary"
                  placeholder="100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Price ($)
                </label>
                <input
                  name="price"
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-border rounded-xl bg-bg-primary text-text-primary focus:ring-2 focus:ring-primary"
                  placeholder="150.25"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Profit/Loss ($)
                </label>
                <input
                  name="pl"
                  type="number"
                  step="0.01"
                  value={form.pl}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-border rounded-xl bg-bg-primary text-text-primary focus:ring-2 focus:ring-primary"
                  placeholder="+125.50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Tags (comma separated)
              </label>
              <input
                name="tags"
                value={form.tags}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-border rounded-xl bg-bg-primary text-text-primary focus:ring-2 focus:ring-primary"
                placeholder="tech, long-term"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Notes
              </label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-3 border border-border rounded-xl bg-bg-primary text-text-primary focus:ring-2 focus:ring-primary"
                placeholder="Trade rationale, observations..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate('/journal')}
                className="px-6 py-3 border border-border text-text-secondary rounded-xl hover:bg-bg-primary transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary-dark flex items-center justify-center gap-2 transition-colors"
              >
                <Save className="w-5 h-5" />
                Save Entry
              </button>
            </div>
          </form>
        </div>
      </div>
  );
}