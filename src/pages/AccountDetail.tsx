import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ArrowUp, ArrowDown } from 'lucide-react';
import { useData } from '../context/DataContext';
import { TimeFilterBar } from '../components/TimeFilterBar';
import { PortfolioChart } from '../components/PortfolioChart';
import {
  formatCurrency,
  formatDate,
  getFilterDays,
  filterEntriesByDays,
} from '../utils/calculations';

export function AccountDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { accounts, entries } = useData();
  const [selectedFilter, setSelectedFilter] = useState('latest');

  const account = useMemo(() => accounts.find((a) => a.id === id), [accounts, id]);

  const accountEntries = useMemo(
    () =>
      entries
        .filter((e) => e.accountId === id)
        .sort((a, b) => b.entryDate.getTime() - a.entryDate.getTime()),
    [entries, id]
  );

  const days = useMemo(() => getFilterDays(selectedFilter), [selectedFilter]);

  const filteredEntries = useMemo(
    () => filterEntriesByDays(accountEntries, days),
    [accountEntries, days]
  );

  const chartData = useMemo(() => {
    return filteredEntries
      .sort((a, b) => a.entryDate.getTime() - b.entryDate.getTime())
      .map((entry) => ({
        date: entry.entryDate.toISOString().split('T')[0],
        totalValue: entry.value,
        accounts: {},
      }));
  }, [filteredEntries]);

  const currentValue = accountEntries[0]?.value ?? 0;
  const previousValue =
    filteredEntries.length > 0
      ? (filteredEntries[filteredEntries.length - 1]?.value ?? currentValue)
      : currentValue;
  const changeAmount = currentValue - previousValue;
  const changePercent = previousValue !== 0 ? (changeAmount / previousValue) * 100 : 0;

  if (!account) {
    return (
      <div className="animate-fadeIn">
        <Link to="/" className="flex items-center gap-2 text-[var(--color-primary)] mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <div className="text-center py-12">
          <p className="text-[var(--text-secondary)]">Account not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-[var(--color-primary)] mb-6 hover:underline"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      {/* Account Header */}
      <div className="gradient-primary text-white p-6 rounded-xl shadow-lg mb-6">
        <h1 className="text-2xl font-bold mb-2">{account.name}</h1>
        {account.accountType && <p className="text-white/80 mb-3">{account.accountType}</p>}
        <p className="text-4xl font-bold mb-2">{formatCurrency(currentValue)}</p>
        <div
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-semibold ${
            changeAmount >= 0 ? 'bg-white/15' : 'bg-white/15'
          }`}
        >
          {changeAmount >= 0 ? (
            <ArrowUp className="w-4 h-4 text-[#00ff6c]" />
          ) : (
            <ArrowDown className="w-4 h-4 text-[#ff6b6b]" />
          )}
          <span className={changeAmount >= 0 ? 'text-[#00ff6c]' : 'text-[#ff6b6b]'}>
            {formatCurrency(Math.abs(changeAmount))} ({changePercent.toFixed(2)}%)
          </span>
        </div>
      </div>

      {/* Time Filter */}
      <TimeFilterBar selectedFilter={selectedFilter} onFilterChange={setSelectedFilter} />

      {/* Chart */}
      <div className="card p-6 mb-6">
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Value Over Time</h2>
        <PortfolioChart data={chartData} accounts={[]} showIndividualAccounts={false} />
      </div>

      {/* Recent Entries */}
      <div className="card p-6">
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Recent Entries</h2>
        {accountEntries.length === 0 ? (
          <p className="text-[var(--text-secondary)]">No entries yet for this account.</p>
        ) : (
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Value</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {accountEntries.slice(0, 10).map((entry) => (
                  <tr key={entry.id}>
                    <td>{formatDate(entry.entryDate)}</td>
                    <td className="font-semibold">{formatCurrency(entry.value)}</td>
                    <td className="text-[var(--text-secondary)]">{entry.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {accountEntries.length > 10 && (
              <p className="text-center text-sm text-[var(--text-secondary)] mt-4">
                Showing 10 of {accountEntries.length} entries.{' '}
                <Link to="/history" className="text-[var(--color-primary)] hover:underline">
                  View all
                </Link>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
