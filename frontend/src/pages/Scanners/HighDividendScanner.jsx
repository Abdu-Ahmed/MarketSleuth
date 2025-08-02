import { useDashboardData } from "../../hooks/useDashboardData";

export default function HighDividendScanner() {
  const { data, loading, error } = useDashboardData();
  const list = data.highDividend;

  if (loading.highDividend) return <Layout><p className="p-6">Loading high dividend stocks…</p></Layout>;
  if (error.highDividend) return <Layout><p className="p-6 text-red-600">Error: {error.highDividend}</p></Layout>;

  return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">High Dividend Stocks (≥4%)</h1>
        <table className="w-full table-auto">
          <thead>
            <tr>
              <th className="text-left">Symbol</th>
              <th className="text-left">Avg. Yield (%)</th>
              <th className="text-left">Insider Buys (90d)</th>
            </tr>
          </thead>
          <tbody>
            {list.map(t => (
              <tr key={t.symbol} className="border-b">
                <td>{t.symbol}</td>
                <td>{t.avg_dividend_yield}</td>
                <td>{t.insider_buys_90d}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
  );
}