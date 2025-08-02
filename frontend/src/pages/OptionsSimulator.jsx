import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";
import { Calculator, ArrowLeft } from "lucide-react";

export default function OptionsSimulator() {
  const { accessToken } = useContext(AuthContext);
  const nav = useNavigate();

  const [form, setForm] = useState({
    ticker: "",
    expiry: "",
    strike: ""
  });
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value.toUpperCase() }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/options/simulate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept:        "application/json",
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      setResult(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => nav(-1)}
            className="bg-bg-card text-text-primary p-3 rounded-xl hover:bg-bg-primary transition-colors flex items-center gap-2 shadow-md"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Calculator className="w-6 h-6 text-primary" /> Options Simulator
          </h1>
        </div>

        <div className="bg-bg-card rounded-xl border border-border p-6 shadow-md">
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Ticker
                </label>
                <input
                  name="ticker"
                  value={form.ticker}
                  onChange={onChange}
                  placeholder="e.g. AAPL"
                  className="w-full px-4 py-3 border border-border rounded-xl bg-bg-primary text-text-primary focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Expiry
                </label>
                <input
                  name="expiry"
                  type="date"
                  value={form.expiry}
                  onChange={onChange}
                  className="w-full px-4 py-3 border border-border rounded-xl bg-bg-primary text-text-primary focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Strike Price ($)
                </label>
                <input
                  name="strike"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.strike}
                  onChange={onChange}
                  placeholder="e.g. 150.00"
                  className="w-full px-4 py-3 border border-border rounded-xl bg-bg-primary text-text-primary focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Calculator className="w-5 h-5" />
                    Run Simulation
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {result && (
          <div className="bg-bg-card rounded-xl border border-border p-6 shadow-md mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-lg text-text-primary">
                P/L at Expiry (Current Price: ${result.price_now})
              </h2>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <span className="text-sm text-text-secondary">Profit/Loss</span>
              </div>
            </div>
            
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={result.pnl_grid}>
                  <XAxis 
                    dataKey="underlying" 
                    unit="$"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    formatter={(value) => [`$${value}`, "Profit/Loss"]}
                    labelFormatter={(value) => `Underlying: $${value}`}
                    contentStyle={{
                      backgroundColor: 'var(--bg-card)',
                      borderColor: 'var(--border-color)',
                      borderRadius: '0.75rem'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="pl"
                    stroke="#4F46E5"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6, stroke: '#4F46E5', strokeWidth: 2, fill: '#fff' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="text-sm text-blue-800 mb-1">Max Profit</div>
                <div className="font-bold text-xl text-blue-800">
                  ${result.max_profit.toFixed(2)}
                </div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <div className="text-sm text-purple-800 mb-1">Max Loss</div>
                <div className="font-bold text-xl text-purple-800">
                  ${result.max_loss.toFixed(2)}
                </div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="text-sm text-green-800 mb-1">Break Even</div>
                <div className="font-bold text-xl text-green-800">
                  ${result.break_even.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}