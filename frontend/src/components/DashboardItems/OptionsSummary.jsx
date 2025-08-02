import { Calculator, DollarSign, Percent } from "lucide-react";

export default function OptionsSummary({ optionsData }) {
  if (!optionsData || optionsData.length === 0) {
    return null;
  }

  const totalContracts = optionsData.length;
  const averagePremium = optionsData.reduce((sum, opt) => sum + opt.premium, 0) / optionsData.length;
  const totalValue = optionsData.reduce((sum, opt) => sum + opt.value, 0);
  const uniqueExpiries = [...new Set(optionsData.map(o => o.expiry))];

  return (
    <div className="mt-8 bg-bg-card rounded-2xl shadow-lg p-6 border border-border">
      <h2 className="text-xl font-bold text-text-primary mb-4">AAPL Options Summary</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-blue-800">Total Contracts</h3>
            <Calculator className="text-blue-600 w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-blue-800 mt-2">
            {totalContracts}
          </p>
        </div>
        
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-purple-800">Average Premium</h3>
            <DollarSign className="text-purple-600 w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-purple-800 mt-2">
            ${averagePremium.toFixed(2)}
          </p>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-green-800">Total Value</h3>
            <Percent className="text-green-600 w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-green-800 mt-2">
            ${totalValue.toFixed(2)}
          </p>
        </div>
      </div>
      
      <div className="mt-6">
        <h3 className="font-medium text-text-primary mb-3">Expiry Distribution</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {uniqueExpiries.slice(0, 4).map(expiry => (
            <div key={expiry} className="bg-bg-primary p-3 rounded-lg">
              <p className="text-sm text-text-secondary">
                {new Date(expiry).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </p>
              <p className="font-medium">
                {optionsData.filter(o => o.expiry === expiry).length} contracts
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}