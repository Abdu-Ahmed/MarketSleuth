import { useState } from "react";
import {
  LineChart, BellRing, Calculator, Filter, Book, BookOpen, Percent,
  Bookmark, Search, Plus, Bell, User
} from "lucide-react";

import ErrorBoundary from "../components/ErrorBoundary";
import TickerTape    from "../components/DashboardItems/TickerTape";
import Sidebar       from "../components/DashboardItems/Sidebar";
import DashboardHeader from "../components/DashboardItems/DashboardHeader";
import DashboardCard   from "../components/DashboardItems/DashboardCard";
import OptionsSummary  from "../components/DashboardItems/OptionsSummary";
import IncomeSummary   from "../components/DashboardItems/IncomeSummary";

import { useDashboardData } from "../hooks/useDashboardData";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [symbol, setSymbol]       = useState("AAPL");
  const { data, loading, error, refreshData } = useDashboardData(symbol);

  const handleSearch = term => {
    const t = term.trim().toUpperCase();
    if (t) setSymbol(t);
  };

  const navItems = [
    { id: "dashboard",        icon: <LineChart size={18}/>,  label: "Dashboard",       link: "/dashboard",     implemented: true },
    { id: "earnings",         icon: <Book size={18}/>,       label: "Earnings",        link: "/earnings",      implemented: true },
    { id: "analyst",          icon: <Bell size={18}/>,       label: "Analyst Actions", link: "/analyst",       implemented: true },
    { id: "events",           icon: <BellRing size={18}/>,   label: "Events Feed",     link: "/events",        implemented: true },
    { id: "options",          icon: <Calculator size={18}/>, label: "Options Sim",     link: "/options",       implemented: true },
    { id: "scanners",         icon: <Filter size={18}/>,     label: "Scanners",        link: "/scanners",      implemented: true },
    { id: "high-dividend",    icon: <Percent size={18}/>,    label: "High Div.",       link: "/scanners/high-dividend", implemented: true },
    { id: "insider-activity", icon: <User size={18}/>,       label: "Insider Act.",    link: "/scanners/insider-activity", implemented: true },
    { id: "journal",          icon: <BookOpen size={18}/>,   label: "Journal",         link: "/journal",       implemented: true },
    { id: "alerts",           icon: <Bell size={18}/>,       label: "Alerts",          link: "/alerts",        implemented: true },
    { id: "data-sources",             icon: <Book size={18}/>,       label: "Data Sources",    link: "/data-sources",          implemented: true },
    { id: "settings", icon: <Book size={18}/>, label: "Settings", link: "/settings", implemented: true },
  ];

  const cards = [
    {
      title:       "Custom Scanners",
      description: loading.scanners ? "Loading…" : `${data.scanners.length} saved`,
      link:        "/scanners",
      icon:        <Search className="w-5 h-5 text-white"/>,
      color:       "bg-cyan-500",
      implemented: true,
      loading:     loading.scanners,
      error:       error.scanners,
      data:        data.scanners
    },
    {
      title:       "Insider Buys",
      description: loading.insider ? "Loading…" : `${data.insider.count} filings`,
      link:        `/tickers/${symbol}/insiders`,
      icon:        <User className="w-5 h-5 text-white"/>,
      color:       "bg-purple-500",
      implemented: true,
      loading:     loading.insider,
      error:       error.insider,
      data:        data.insider.latest
    },
    {
      title:       "Options Scanner",
      description: loading.options ? "Loading…" : `${data.optInc.yield}% yield`,
      link:        `/income/options/${symbol}`,
      icon:        <Calculator className="w-5 h-5 text-white"/>,
      color:       "bg-blue-500",
      implemented: true,
      loading:     loading.options,
      error:       error.options,
      data:        data.optionsData
    },
    {
      title:       "Dividend Tracker",
      description: loading.dividend ? "Loading…" : `$${data.dividend.monthly}/mo`,
      link:        `/income/dividends/${symbol}`,
      icon:        <Percent className="w-5 h-5 text-white"/>,
      color:       "bg-green-500",
      implemented: true,
      loading:     loading.dividend,
      error:       error.dividend,
      data:        data.dividend.records
    },
    {
      title:       "Trade Journal",
      description: loading.journal ? "Loading…" : `${data.journal?.length || 0} entries`,
      link:        "/journal",
      icon:        <BookOpen className="w-5 h-5 text-white"/>,
      color:       "bg-orange-500",
      implemented: true,
      loading:     loading.journal,
      error:       error.journal,
      data:        data.journal || []
    },
    {
      title:       "Watchlists",
      description: "Coming Soon",
      link:        "#",
      icon:        <Bookmark className="w-5 h-5 text-white"/>,
      color:       "bg-indigo-500",
      implemented: false,
      loading:     false,
      error:       null,
      data:        []
    }
  ];

  return (
    <ErrorBoundary>
        <div className="flex min-h-screen bg-bg-secondary">
          <Sidebar
            navItems={navItems}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />

          <div className="flex-1 flex flex-col min-w-0">
            <DashboardHeader
              onRefresh={refreshData}
              onSearch={handleSearch}
            />

            <TickerTape symbol={symbol} />

            <div className="flex-1 overflow-auto">
              <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full">
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-2xl font-bold text-text-primary">
                    Dashboard &mdash; {symbol}
                  </h1>
                  <button
                    onClick={() => setSymbol("AAPL")}
                    className="text-sm text-text-secondary hover:underline"
                  >
                    Reset to AAPL
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
                  {cards.map(card => (
                    <DashboardCard
                      key={card.title}
                      card={card}
                      loading={card.loading}
                      error={card.error}
                      data={card.data}
                    />
                  ))}
                </div>

                <IncomeSummary
                  dividend={data.dividend}
                  optInc={data.optInc}
                  loading={loading}
                  error={error}
                />
                <OptionsSummary optionsData={data.optionsData} />
              </div>
            </div>
          </div>
        </div>
    </ErrorBoundary>
  );
}
