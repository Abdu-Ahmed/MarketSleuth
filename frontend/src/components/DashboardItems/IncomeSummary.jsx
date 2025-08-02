import { Percent, Calculator, DollarSign } from "lucide-react";

export default function IncomeSummary({ dividend, optInc, loading, error }) {
  const calculateTotalIncome = () => {
    if (!dividend.monthly || !optInc.yield) return 0;
    return dividend.monthly + (optInc.yield / 100 * 1000);
  };

  return (
    <div className="col-span-full bg-bg-card rounded-2xl shadow-lg p-6 border border-border">
      <h2 className="text-xl font-bold text-text-primary mb-4">Income Summary (AAPL)</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Dividend Income */}
        <div className="bg-green-100 border border-green-300 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-green-800">Dividend Income</h3>
            <Percent className="text-green-600 w-5 h-5" />
          </div>
          <div className="mt-3">
            {loading.dividend ? (
              <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
            ) : error.dividend ? (
              <p className="text-red-500 text-sm">Error: {error.dividend}</p>
            ) : (
              <>
                <p className="text-2xl font-bold text-green-800">
                  ${dividend.monthly}/month
                </p>
                <p className="text-green-600 mt-1">
                  Total: ${dividend.total}
                </p>
              </>
            )}
          </div>
        </div>
        
        {/* Options Income */}
        <div className="bg-blue-100 border border-blue-300 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-blue-800">Options Income</h3>
            <Calculator className="text-blue-600 w-5 h-5" />
          </div>
          <div className="mt-3">
            {loading.options ? (
              <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
            ) : error.options ? (
              <p className="text-red-500 text-sm">Error: {error.options}</p>
            ) : (
              <>
                <p className="text-2xl font-bold text-blue-800">
                  {optInc.yield}% yield
                </p>
                <p className="text-blue-600 mt-1">
                  Based on current premiums
                </p>
              </>
            )}
          </div>
        </div>
        
        {/* Total Income */}
        <div className="bg-purple-100 border border-purple-300 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-purple-800">Total Income</h3>
            <DollarSign className="text-purple-600 w-5 h-5" />
          </div>
          <div className="mt-3">
            {loading.dividend || loading.options ? (
              <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
            ) : error.dividend || error.options ? (
              <p className="text-red-500 text-sm">Error calculating total</p>
            ) : (
              <>
                <p className="text-2xl font-bold text-purple-800">
                  ${calculateTotalIncome().toFixed(2)}/month
                </p>
                <p className="text-purple-600 mt-1">
                  Projected from dividends + options
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}