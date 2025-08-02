import { Link } from "react-router-dom";
import { useDashboardData } from "../../hooks/useDashboardData";
import { Home } from "lucide-react";


export default function InsiderActivityScanner() {
  const { data, loading, error } = useDashboardData();
  const list = data.insiderActivity;

  if (loading.insiderActivity) return <p className="p-6">Loading insider activity…</p>;
  if (error.insiderActivity) return <p className="p-6 text-red-600">Error: {error.insiderActivity}</p>;

  return (
    <>
        <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="bg-bg-card text-text-primary px-3 py-2 rounded-lg hover:bg-bg-primary transition-colors flex items-center gap-2"
            >
              <Home className="w-5 h-5" />
              Dashboard
            </Link>
        </div>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Insider Buys (Last 90 Days)</h1>
        <table className="w-full table-auto">
          <thead>
            <tr>
              <th className="text-left">Symbol</th>
              <th className="text-left">Insider Buys</th>
              <th className="text-left">Avg. Yield (%)</th>
            </tr>
          </thead>
          <tbody>
            {list.map(t => (
              <tr key={t.symbol} className="border-b">
                <td>{t.symbol}</td>
                <td>{t.insider_buys_90d}</td>
                <td>{t.avg_dividend_yield}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </>
  );
}
