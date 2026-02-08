import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUp, ArrowDown, TrendingUp } from 'lucide-react';
import { useData } from '../context/DataContext';
import { TimeFilterBar } from '../components/TimeFilterBar';
import { PortfolioChart } from '../components/PortfolioChart';
import {
  formatCurrency,
  formatDate,
  calculateDashboardSummary,
  generateChartData,
  getFilterDays,
} from '../utils/calculations';

export function Dashboard() {
  const navigate = useNavigate();
  const { accounts, entries, loading } = useData();
  const [selectedFilter, setSelectedFilter] = useState('latest');
  const [showIndividualAccounts, setShowIndividualAccounts] = useState(false);

  const activeAccounts = useMemo(() => accounts.filter((a) => a.isActive), [accounts]);

  const days = useMemo(() => getFilterDays(selectedFilter), [selectedFilter]);

  const summary = useMemo(
    () => calculateDashboardSummary(activeAccounts, entries, days),
    [activeAccounts, entries, days]
  );

  const chartData = useMemo(
    () => generateChartData(entries, activeAccounts, days),
    [entries, activeAccounts, days]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-4">
          <div className="spinner"></div>
          <p className="text-[var(--text-secondary)]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      {/* Total Portfolio Value Card */}
      <div className="gradient-primary text-white p-8 rounded-xl shadow-lg mb-8 text-center">
        <p className="text-lg opacity-90 mb-2">Total Portfolio Value</p>
        <h1 className="text-4xl sm:text-5xl font-bold mb-3">
          {formatCurrency(summary.totalValue)}
        </h1>
        {summary.totalChangeAmount !== 0 && (
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold ${
              summary.totalChangeAmount >= 0 ? 'bg-white/15' : 'bg-white/15'
            }`}
          >
            {summary.totalChangeAmount >= 0 ? (
              <ArrowUp className="w-4 h-4 text-[#00ff6c]" />
            ) : (
              <ArrowDown className="w-4 h-4 text-[#ff6b6b]" />
            )}
            <span className={summary.totalChangeAmount >= 0 ? 'text-[#00ff6c]' : 'text-[#ff6b6b]'}>
              {formatCurrency(Math.abs(summary.totalChangeAmount))} (
              {summary.totalChangePercent.toFixed(2)}%)
            </span>
          </div>
        )}
        <p className="text-sm opacity-80 mt-3">Last updated: {formatDate(summary.lastUpdated)}</p>
      </div>

      {/* Time Filter */}
      <TimeFilterBar selectedFilter={selectedFilter} onFilterChange={setSelectedFilter} />

      {/* Chart */}
      <div className="card p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            <TrendingUp className="inline-block w-5 h-5 mr-2" />
            Portfolio Value Over Time
          </h2>
          <label className="inline-flex items-center gap-2 cursor-pointer text-sm text-[var(--text-secondary)] whitespace-nowrap">
            <input
              type="checkbox"
              checked={showIndividualAccounts}
              onChange={(e) => setShowIndividualAccounts(e.target.checked)}
              className="w-4 h-4 shrink-0"
            />
            Show individual accounts
          </label>
        </div>
        <PortfolioChart
          data={chartData}
          accounts={activeAccounts.map((a) => a.name)}
          showIndividualAccounts={showIndividualAccounts}
        />
      </div>

      {/* Accounts Grid */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">Accounts</h2>
        {summary.accounts.length === 0 ? (
          <div className="text-center py-12 text-[var(--text-secondary)]">
            <p>No accounts yet. Add some accounts to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {summary.accounts.map((account) => (
              <div
                key={account.id}
                onClick={() => navigate(`/account/${account.id}`)}
                className="card p-5 cursor-pointer hover:scale-[1.02] transition-transform"
              >
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                  {account.name}
                </h3>
                <p className="text-2xl font-bold text-[var(--color-primary)] mb-2">
                  {formatCurrency(account.currentValue)}
                </p>
                <div
                  className={`flex items-center gap-1 text-sm font-semibold ${
                    account.changeAmount >= 0 ? 'text-positive' : 'text-negative'
                  }`}
                >
                  {account.changeAmount >= 0 ? (
                    <ArrowUp className="w-4 h-4" />
                  ) : (
                    <ArrowDown className="w-4 h-4" />
                  )}
                  {formatCurrency(Math.abs(account.changeAmount))} (
                  {Math.abs(account.changePercent).toFixed(2)}%)
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-2">
                  Updated: {formatDate(account.lastUpdated)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
