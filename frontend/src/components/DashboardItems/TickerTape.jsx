import { useState, useEffect } from "react";
import { ArrowUp, ArrowDown, AlertCircle, Wifi, WifiOff } from "lucide-react";
import { marketDataService } from "../../services/MarketDataService";

export default function TickerTape() {
  const [tickers, setTickers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiveData, setIsLiveData] = useState(true);

  const fetchTickerData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await marketDataService.getTickerData();
      setTickers(data);
      setIsLiveData(true);
    } catch (err) {
      console.error("Failed to fetch live ticker data:", err);
      setError(err.message);
      setIsLiveData(false);
      setTickers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickerData();
    const interval = setInterval(fetchTickerData, 5_000);
    return () => clearInterval(interval);
  }, []);

  if (loading && tickers.length === 0) {
    return (
      <div className="w-full bg-bg-primary border-y border-border overflow-hidden">
        <div className="flex justify-center items-center py-4">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
          <span className="ml-2 text-text-secondary">Loading market data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-bg-primary border-y border-border overflow-hidden relative">
      {/* Status indicators */}
      <div className="absolute top-0 right-0 z-10 flex items-center gap-2">
        {!isLiveData && (
          <div className="bg-yellow-100 border border-yellow-300 rounded-bl-lg px-2 py-1">
            <div className="flex items-center text-yellow-800 text-xs">
              <WifiOff className="w-3 h-3 mr-1" />
              <span>Cached data</span>
            </div>
          </div>
        )}
        {isLiveData && !error && (
          <div className="bg-green-100 border border-green-300 rounded-bl-lg px-2 py-1">
            <div className="flex items-center text-green-800 text-xs">
              <Wifi className="w-3 h-3 mr-1" />
              <span>Live data</span>
            </div>
          </div>
        )}
        {error && (
          <div className="bg-red-100 border border-red-300 rounded-bl-lg px-2 py-1">
            <div className="flex items-center text-red-800 text-xs">
              <AlertCircle className="w-3 h-3 mr-1" />
              <span>Error: {error}</span>
            </div>
          </div>
        )}
      </div>

      <div className="animate-marquee py-2 whitespace-nowrap">
        {tickers.map((t, idx) => (
          <TickerItem key={`${t.symbol}-${idx}`} ticker={t} />
        ))}
        {tickers.map((t, idx) => (
          <TickerItem key={`${t.symbol}-dup-${idx}`} ticker={t} />
        ))}
      </div>
    </div>
  );
}

function TickerItem({ ticker }) {
  const isPositive = ticker.change >= 0;
  const changePct = Math.abs(ticker.change).toFixed(2);

  return (
    <span className="inline-flex items-center mx-4 hover:bg-bg-card rounded px-2 py-1 transition-colors">
      <span className="font-medium mr-2 text-text-primary">{ticker.symbol}</span>
      <span className="mr-2 text-text-secondary">
        ${typeof ticker.price === "number" ? ticker.price.toFixed(2) : ticker.price}
      </span>
      <span className={`flex items-center text-sm ${isPositive ? "text-green-600" : "text-red-600"}`}>
        {isPositive ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
        <span>{changePct}%</span>
      </span>
    </span>
  );
}