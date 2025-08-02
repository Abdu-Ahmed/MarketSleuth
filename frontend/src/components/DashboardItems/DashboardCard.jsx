import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function DashboardCard({ card, loading, error, data }) {
  return (
    <motion.div
      whileHover={card.implemented ? { y: -5 } : {}}
      className={`bg-bg-card rounded-xl p-4 border border-border shadow-sm hover:shadow-md transition-all ${
        !card.implemented ? 'opacity-75' : ''
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`w-10 h-10 ${card.color} rounded-lg flex items-center justify-center`}>
          {card.icon}
        </div>
        {!card.implemented && (
          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
            Soon
          </span>
        )}
      </div>
      
      <h3 className="font-semibold text-text-primary mb-1">{card.title}</h3>
      <p className="text-text-secondary text-sm mb-4">
        {loading ? "Loading..." : error ? `Error: ${error}` : card.description}
      </p>
      
      {card.implemented ? (
        <Link 
          to={card.link} 
          className="inline-flex items-center text-primary hover:text-primary-dark font-medium text-sm"
        >
          <span>Explore</span>
          <ArrowRight className="ml-2 w-4 h-4" />
        </Link>
      ) : (
        <div className="inline-flex items-center text-text-secondary font-medium text-sm">
          <span>In Development</span>
        </div>
      )}
    </motion.div>
  );
}