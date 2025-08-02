import { Search, Bell, RefreshCw } from "lucide-react";

export default function DashboardHeader({ onRefresh, onSearch }) {
  return (
    <div className="bg-bg-card border-b border-border p-4 flex justify-between items-center">
      <div className="relative w-96 hidden md:block">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary" />
        <input
          type="text"
          placeholder="Search ticker or company..."
          className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-bg-primary text-text-primary focus:ring-2 focus:ring-primary focus:border-transparent"
          onKeyDown={e => {
            if (e.key === "Enter") onSearch(e.target.value);
          }}
        />
      </div>
      
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-text-secondary hover:text-text-primary">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            3
          </span>
        </button>
        <button 
          className="flex items-center gap-2 bg-bg-primary hover:bg-border text-text-primary px-4 py-2 rounded-xl transition-colors"
          onClick={onRefresh}
        >
          <RefreshCw className="w-5 h-5" />
          <span className="hidden md:inline">Refresh Data</span>
        </button>
      </div>
    </div>
  );
}
