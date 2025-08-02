import { Link } from "react-router-dom";
import { BarChart, Bell, Book, Search, User, LogIn, DollarSign, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="py-16 md:py-24 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-text-primary mb-6">
            Professional Trading Tools for <span className="text-primary">Serious Investors</span>
          </h1>
          <p className="text-xl text-text-secondary max-w-3xl mx-auto mb-10">
            Track earnings, analyze insider activity, screen stocks, and journal your trades - all in one powerful platform.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              to="/signup" 
              className="bg-primary text-white px-8 py-4 rounded-xl hover:bg-primary-dark text-lg font-medium flex items-center justify-center gap-2 transition-colors"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              to="/login" 
              className="bg-bg-card text-text-primary px-8 py-4 rounded-xl hover:bg-bg-primary text-lg font-medium flex items-center justify-center gap-2 transition-colors"
            >
              Sign In
              <LogIn className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="py-16">
          <h2 className="text-3xl font-bold text-center text-text-primary mb-16">Powerful Investment Tools</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-bg-card p-8 rounded-2xl border border-border shadow-lg hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-blue-100 text-blue-800 rounded-xl flex items-center justify-center mb-6">
                <Bell className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-3">Smart Alerts</h3>
              <p className="text-text-secondary mb-4">
                Get notified about earnings reports, insider trades, and analyst actions before they happen.
              </p>
              <Link to="/login" className="text-primary font-medium flex items-center gap-2">
                Set up alerts <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-bg-card p-8 rounded-2xl border border-border shadow-lg hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-green-100 text-green-800 rounded-xl flex items-center justify-center mb-6">
                <BarChart className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-3">Custom Scanners</h3>
              <p className="text-text-secondary mb-4">
                Create personalized stock scanners based on dividend yield, insider activity, and technical patterns.
              </p>
              <Link to="/login" className="text-primary font-medium flex items-center gap-2">
                Explore scanners <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-bg-card p-8 rounded-2xl border border-border shadow-lg hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-purple-100 text-purple-800 rounded-xl flex items-center justify-center mb-6">
                <Book className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-3">Trade Journal</h3>
              <p className="text-text-secondary mb-4">
                Track your trades, analyze performance, and improve your strategy with our detailed journal.
              </p>
              <Link to="/login" className="text-primary font-medium flex items-center gap-2">
                Start journaling <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            {/* Feature 4 */}
            <div className="bg-bg-card p-8 rounded-2xl border border-border shadow-lg hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-amber-100 text-amber-800 rounded-xl flex items-center justify-center mb-6">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-3">Market Intelligence</h3>
              <p className="text-text-secondary mb-4">
                Access earnings calendars, analyst actions, and SEC filings in one centralized dashboard.
              </p>
              <Link to="/login" className="text-primary font-medium flex items-center gap-2">
                Explore data <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            {/* Feature 5 */}
            <div className="bg-bg-card p-8 rounded-2xl border border-border shadow-lg hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-cyan-100 text-cyan-800 rounded-xl flex items-center justify-center mb-6">
                <User className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-3">Insider Tracking</h3>
              <p className="text-text-secondary mb-4">
                Monitor insider transactions and get alerts when company executives make significant trades.
              </p>
              <Link to="/login" className="text-primary font-medium flex items-center gap-2">
                Track insiders <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            {/* Feature 6 */}
            <div className="bg-bg-card p-8 rounded-2xl border border-border shadow-lg hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-indigo-100 text-indigo-800 rounded-xl flex items-center justify-center mb-6">
                <DollarSign className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-3">Dividend Analysis</h3>
              <p className="text-text-secondary mb-4">
                Screen for high-yield dividend stocks and track upcoming ex-dividend dates.
              </p>
              <Link to="/login" className="text-primary font-medium flex items-center gap-2">
                Find dividends <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-16 text-center bg-gradient-to-r from-primary to-blue-600 rounded-3xl mb-16">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Elevate Your Investing?
            </h2>
            <p className="text-blue-100 text-xl mb-8">
              Join thousands of investors using MarketSleuth to make smarter decisions.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                to="/signup" 
                className="bg-white text-primary px-8 py-4 rounded-xl hover:bg-blue-50 text-lg font-medium flex items-center justify-center gap-2 transition-colors"
              >
                Create Free Account
              </Link>
              <Link 
                to="/login" 
                className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl hover:bg-white/10 text-lg font-medium flex items-center justify-center gap-2 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
  );
}