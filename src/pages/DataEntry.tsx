import { useState, useMemo } from 'react';
import { Save, Calendar } from 'lucide-react';
import { useData } from '../context/DataContext';
import { formatDateInput, formatCurrency } from '../utils/calculations';

export function DataEntry() {
    const { accounts, entries, addEntries, getActiveAccounts } = useData();
    const activeAccounts = useMemo(() => getActiveAccounts(), [accounts, getActiveAccounts]);

    const [entryDate, setEntryDate] = useState(formatDateInput(new Date()));
    const [values, setValues] = useState<Record<string, string>>({});
    const [notes, setNotes] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    // Get last known value for each account
    const lastValues = useMemo(() => {
        const latest: Record<string, number> = {};
        for (const account of activeAccounts) {
            const accountEntries = entries.filter((e) => e.accountId === account.id);
            if (accountEntries.length > 0) {
                const sorted = [...accountEntries].sort(
                    (a, b) => b.entryDate.getTime() - a.entryDate.getTime()
                );
                latest[account.id] = sorted[0].value;
            }
        }
        return latest;
    }, [activeAccounts, entries]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        const entriesToAdd = activeAccounts
            .filter((account) => values[account.id]?.trim())
            .map((account) => ({
                accountId: account.id,
                value: parseFloat(values[account.id].replace(/[$,]/g, '')),
                date: new Date(entryDate + 'T00:00:00'),
                notes: notes[account.id]?.trim() || undefined,
            }))
            .filter((entry) => !isNaN(entry.value));

        if (entriesToAdd.length === 0) {
            setError('Please enter at least one value');
            return;
        }

        setSaving(true);
        try {
            await addEntries(entriesToAdd);
            setValues({});
            setNotes({});
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save entries');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="animate-fadeIn">
            <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Add Entry</h1>

            <form onSubmit={handleSubmit}>
                {/* Date Picker */}
                <div className="card p-4 mb-6">
                    <label className="flex items-center gap-2 text-sm font-medium mb-2">
                        <Calendar className="w-4 h-4" />
                        Entry Date
                    </label>
                    <input
                        type="date"
                        value={entryDate}
                        onChange={(e) => setEntryDate(e.target.value)}
                        className="max-w-xs"
                    />
                </div>

                {/* Account Values */}
                <div className="card p-4 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold text-[var(--text-primary)]">Account Values</h2>
                        <button type="submit" disabled={saving} className="btn btn-primary">
                            {saving ? (
                                <div className="spinner w-4 h-4 border-white/30 border-t-white"></div>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Save Entries
                                </>
                            )}
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-100 border border-red-300 text-red-700 rounded-lg p-3 text-sm mb-4">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-100 border border-green-300 text-green-700 rounded-lg p-3 text-sm mb-4">
                            Entries saved successfully!
                        </div>
                    )}

                    {activeAccounts.length === 0 ? (
                        <p className="text-[var(--text-secondary)]">
                            No active accounts. Add some accounts first.
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {activeAccounts.map((account) => (
                                <div key={account.id} className="border-b border-[var(--border-color)] pb-4 last:border-0">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                        <div className="flex-1">
                                            <label className="block text-sm font-medium mb-1">
                                                {account.name}
                                                {lastValues[account.id] !== undefined && (
                                                    <span className="text-[var(--text-secondary)] font-normal ml-2">
                                                        (Previous: {formatCurrency(lastValues[account.id])})
                                                    </span>
                                                )}
                                            </label>
                                            <input
                                                type="text"
                                                value={values[account.id] || ''}
                                                onChange={(e) =>
                                                    setValues({ ...values, [account.id]: e.target.value })
                                                }
                                                placeholder="$0.00"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-sm font-medium mb-1">Notes (optional)</label>
                                            <input
                                                type="text"
                                                value={notes[account.id] || ''}
                                                onChange={(e) =>
                                                    setNotes({ ...notes, [account.id]: e.target.value })
                                                }
                                                placeholder="Add a note..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </form>
        </div>
    );
}
