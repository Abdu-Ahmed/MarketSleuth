import { useDarkMode } from "../hooks/useDarkMode";
import { Link } from "react-router-dom";
import { 
  DollarSign, Sun, Moon,
  Twitter, Linkedin, Github
} from "lucide-react";

export default function Layout({ children }) {
  const [isDark, toggleDarkMode] = useDarkMode();

  return (
    <div className="flex flex-col min-h-screen bg-bg-secondary">
      {/* Header */}
      <header className="bg-bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-lg">
              <DollarSign className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-text-primary">MarketSleuth</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-bg-primary text-text-primary hover:bg-border transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-bg-card py-6 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center gap-2">
                <DollarSign className="text-primary w-5 h-5" />
                <span className="font-bold text-text-primary">MarketSleuth</span>
              </div>
              <p className="text-sm text-text-secondary mt-2">
                Investor tools for smarter decisions
              </p>
            </div>
            
            <div className="flex flex-col items-center md:items-end">
              <div className="flex gap-4 mb-3">
                <a href="#" className="text-text-secondary hover:text-primary transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="text-text-secondary hover:text-primary transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="#" className="text-text-secondary hover:text-primary transition-colors">
                  <Github className="w-5 h-5" />
                </a>
              </div>
              <p className="text-sm text-text-secondary">
                &copy; {new Date().getFullYear()} MarketSleuth. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}