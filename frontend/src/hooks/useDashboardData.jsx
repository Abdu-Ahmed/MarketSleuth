import { useState, useEffect, useCallback, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

export function useDashboardData(symbol) {
  const { accessToken } = useContext(AuthContext);

  const [insider, setInsider]               = useState({ count: null, latest: [] });
  const [dividend, setDividend]             = useState({ monthly: null, total: null, records: [] });
  const [optInc, setOptInc]                 = useState({ yield: null });
  const [optionsData, setOptionsData]       = useState([]);
  const [highDividend, setHighDividend]     = useState([]);
  const [insiderActivity, setInsiderActivity] = useState([]);
  const [scanners, setScanners]             = useState([]);

  const [loading, setLoading] = useState({
    insider: true,
    dividend: true,
    options: true,
    optionsData: true,
    highDividend: true,
    insiderActivity: true,
    scanners: true
  });
  const [error, setError] = useState({
    insider: null,
    dividend: null,
    options: null,
    optionsData: null,
    highDividend: null,
    insiderActivity: null,
    scanners: null
  });

  const fetchWithJson = (url, auth = false) => {
    const headers = { "Content-Type": "application/json", Accept: "application/json" };
    if (auth && accessToken) headers.Authorization = `Bearer ${accessToken}`;
    return fetch(url, { headers });
  };

  const fetchInsider     = useCallback(async () => {
    setLoading(l => ({ ...l, insider: true }));
    setError(e => ({ ...e, insider: null }));
    try {
      const res = await fetchWithJson(`${import.meta.env.VITE_API_URL}/tickers/${symbol}/insiders`);
      if (!res.ok) throw new Error(res.statusText);
      const json = await res.json();
      setInsider({ count: json.count, latest: json.latest });
    } catch (e) {
      setError(e => ({ ...e, insider: e.message }));
    } finally {
      setLoading(l => ({ ...l, insider: false }));
    }
  }, [symbol, accessToken]);

  const fetchDividend    = useCallback(async () => {
    setLoading(l => ({ ...l, dividend: true }));
    setError(e => ({ ...e, dividend: null }));
    try {
      const res = await fetchWithJson(`${import.meta.env.VITE_API_URL}/income/dividends/${symbol}`);
      if (!res.ok) throw new Error(res.statusText);
      const json = await res.json();
      setDividend(json);
    } catch (e) {
      setError(e => ({ ...e, dividend: e.message }));
    } finally {
      setLoading(l => ({ ...l, dividend: false }));
    }
  }, [symbol, accessToken]);

  const fetchOptInc      = useCallback(async () => {
    setLoading(l => ({ ...l, options: true }));
    setError(e => ({ ...e, options: null }));
    try {
      const res = await fetchWithJson(`${import.meta.env.VITE_API_URL}/income/options/${symbol}`);
      if (!res.ok) throw new Error(res.statusText);
      const json = await res.json();
      setOptInc({ yield: json.yield });
    } catch (e) {
      setError(e => ({ ...e, options: e.message }));
    } finally {
      setLoading(l => ({ ...l, options: false }));
    }
  }, [symbol, accessToken]);

  const fetchOptionsData = useCallback(async () => {
    setLoading(l => ({ ...l, optionsData: true }));
    setError(e => ({ ...e, optionsData: null }));
    try {
      const res = await fetchWithJson(`${import.meta.env.VITE_API_URL}/income/options/${symbol}`);
      if (!res.ok) throw new Error(res.statusText);
      const json = await res.json();
      setOptionsData(json.positions || []);
    } catch (e) {
      setError(e => ({ ...e, optionsData: e.message }));
    } finally {
      setLoading(l => ({ ...l, optionsData: false }));
    }
  }, [symbol, accessToken]);

  const fetchHighDiv     = useCallback(async () => {
    setLoading(l => ({ ...l, highDividend: true }));
    setError(e => ({ ...e, highDividend: null }));
    try {
      const res = await fetchWithJson(`${import.meta.env.VITE_API_URL}/scanners/high-dividend`);
      if (!res.ok) throw new Error(res.statusText);
      setHighDividend(await res.json());
    } catch (e) {
      setError(e => ({ ...e, highDividend: e.message }));
    } finally {
      setLoading(l => ({ ...l, highDividend: false }));
    }
  }, [accessToken]);

  const fetchInsiderAct  = useCallback(async () => {
    setLoading(l => ({ ...l, insiderActivity: true }));
    setError(e => ({ ...e, insiderActivity: null }));
    try {
      const res = await fetchWithJson(`${import.meta.env.VITE_API_URL}/scanners/insider-activity`);
      if (!res.ok) throw new Error(res.statusText);
      setInsiderActivity(await res.json());
    } catch (e) {
      setError(e => ({ ...e, insiderActivity: e.message }));
    } finally {
      setLoading(l => ({ ...l, insiderActivity: false }));
    }
  }, [accessToken]);

  const fetchScanners    = useCallback(async () => {
    if (!accessToken) {
      setLoading(l => ({ ...l, scanners: false }));
      return;
    }
    setLoading(l => ({ ...l, scanners: true }));
    setError(e => ({ ...e, scanners: null }));
    try {
      const res = await fetchWithJson(`${import.meta.env.VITE_API_URL}/scanners`, true);
      if (!res.ok) throw new Error(res.statusText);
      setScanners(await res.json());
    } catch (e) {
      setError(e => ({ ...e, scanners: e.message }));
    } finally {
      setLoading(l => ({ ...l, scanners: false }));
    }
  }, [accessToken]);

  const refreshAll = useCallback(() => {
    fetchInsider();
    fetchDividend();
    fetchOptInc();
    fetchOptionsData();
    fetchHighDiv();
    fetchInsiderAct();
    fetchScanners();
  }, [
    fetchInsider,
    fetchDividend,
    fetchOptInc,
    fetchOptionsData,
    fetchHighDiv,
    fetchInsiderAct,
    fetchScanners
  ]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  return {
    data: { insider, dividend, optInc, optionsData, highDividend, insiderActivity, scanners },
    loading,
    error,
    refreshData: refreshAll
  };
}
