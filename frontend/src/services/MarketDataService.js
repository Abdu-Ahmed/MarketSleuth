export class MarketDataService {
  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL;
  }

  /**
   * Fetch live market tickers from the backend.
   * Throws on any non-200 response.
   */
  async getTickerData() {
    const res = await fetch(`${this.baseUrl}/market/tickers`, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      throw new Error(`Market tickers fetch failed: ${res.status} ${res.statusText}`);
    }

    return await res.json();
  }

  /**
   * (Optional) Fetch a single ticker’s details.
   * Throws if the fetch fails.
   */
  async getStockData(symbol) {
    const res = await fetch(`${this.baseUrl}/market/ticker/${symbol}`, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      throw new Error(`Ticker ${symbol} fetch failed: ${res.status} ${res.statusText}`);
    }

    return await res.json();
  }
}

// Export a singleton instance
export const marketDataService = new MarketDataService();
export default MarketDataService;
