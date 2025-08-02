import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import { DollarSign, LogOut, X, Menu } from "lucide-react";
import { useState } from "react";

export default function Sidebar({ navItems, activeTab, setActiveTab }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleNavItemClick = (item, e) => {
    if (!item.implemented) {
      e.preventDefault(); // Prevent navigation for unimplemented items
      return;
    }
    
    setActiveTab(item.id);
    setSidebarOpen(false);
  };

  const roleColors = {
    admin: 'bg-red-100 text-red-800',
    moderator: 'bg-blue-100 text-blue-800',
    user: 'bg-gray-100 text-green-800',
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden p-2 fixed top-4 left-4 z-30 bg-bg-card rounded-lg shadow-md"
      >
        <Menu className="w-5 h-5 text-text-primary" />
      </button>
      
      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-bg-card text-text-primary flex flex-col border-r border-border
        transform transition-transform duration-300 ease-in-out lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-5 border-b border-border flex justify-between items-center">
          <div className="flex items-center gap-3">
            <DollarSign className="text-primary w-6 h-6" />
            <h1 className="text-xl font-bold">MarketSleuth</h1>
          </div>
          <button 
            className="lg:hidden p-2 text-text-secondary hover:text-text-primary"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 py-4 overflow-y-auto">
          {navItems.map((item) => {
            // For implemented items, use Link. For unimplemented items, use a div
            const Component = item.implemented ? Link : 'div';
            const props = item.implemented ? { to: item.link } : {};
            
            return (
              <Component
                key={item.id}
                {...props}
                className={`flex items-center gap-3 px-5 py-3 transition-colors ${
                  activeTab === item.id && item.implemented
                    ? "bg-primary text-white" 
                    : item.implemented
                    ? "text-text-secondary hover:bg-bg-primary cursor-pointer"
                    : "text-text-secondary opacity-50 cursor-not-allowed"
                }`}
                onClick={(e) => handleNavItemClick(item, e)}
              >
                {item.icon}
                <span>{item.label}</span>
                {!item.implemented && (
                  <span className="ml-auto text-xs bg-gray-500 text-white px-2 py-1 rounded-full">
                    Soon
                  </span>
                )}
              </Component>
            );
          })}
        </div>
        
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <span className="font-bold text-white">
                {user ? user.name.substring(0, 1).toUpperCase() : "N/A"}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium">{user ? user.name : "N/A"}</p>
                {/* Role badge */}
                {user && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${roleColors[user.role]}`}>
                    {user.role}
                  </span>
                )}
              </div>
              <p className="text-sm text-text-secondary">
                {user ? user.email : "N/A"}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-bg-primary hover:bg-border text-text-primary transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
}