import { useState, useMemo } from 'react';
import { Pencil, Trash2, Check, X } from 'lucide-react';
import { useData } from '../context/DataContext';
import { formatCurrency, formatDate, formatDateInput } from '../utils/calculations';

export function History() {
    const { accounts, entries, updateEntry, deleteEntry } = useData();
    const [filterAccountId, setFilterAccountId] = useState('all');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');
    const [editNotes, setEditNotes] = useState('');
    const [editDate, setEditDate] = useState('');
    const [error, setError] = useState('');

    const accountMap = useMemo(() => {
        const map = new Map<string, string>();
        accounts.forEach((a) => map.set(a.id, a.name));
        return map;
    }, [accounts]);

    const filteredEntries = useMemo(() => {
        if (filterAccountId === 'all') return entries;
        return entries.filter((e) => e.accountId === filterAccountId);
    }, [entries, filterAccountId]);

    const handleEdit = (entry: { id: string; value: number; notes: string | null; entryDate: Date }) => {
        setEditingId(entry.id);
        setEditValue(entry.value.toString());
        setEditNotes(entry.notes || '');
        setEditDate(formatDateInput(entry.entryDate));
        setError('');
    };

    const handleSave = async (id: string) => {
        const value = parseFloat(editValue.replace(/[$,]/g, ''));
        if (isNaN(value)) {
            setError('Invalid value');
            return;
        }

        const parsedDate = new Date(editDate + 'T00:00:00');
        if (!editDate || isNaN(parsedDate.getTime())) {
            setError('Invalid date');
            return;
        }

        try {
            await updateEntry(id, {
                value,
                notes: editNotes.trim() || null,
                entryDate: parsedDate,
            });
            setEditingId(null);
            setError('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update entry');
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this entry?')) {
            try {
                await deleteEntry(id);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to delete entry');
            }
        }
    };

    return (
        <div className="animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h1 className="text-2xl font-bold text-[var(--text-primary)]">History</h1>
                <div>
                    <select
                        value={filterAccountId}
                        onChange={(e) => setFilterAccountId(e.target.value)}
                        className="max-w-xs"
                    >
                        <option value="all">All Accounts</option>
                        {accounts.map((account) => (
                            <option key={account.id} value={account.id}>
                                {account.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-300 text-red-700 rounded-lg p-3 text-sm mb-4">
                    {error}
                </div>
            )}

            <div className="card overflow-hidden">
                {filteredEntries.length === 0 ? (
                    <div className="text-center py-12 text-[var(--text-secondary)]">
                        <p>No entries found.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table>
                            <thead>
                                <tr className="bg-[var(--bg-primary)]">
                                    <th>Date</th>
                                    <th>Account</th>
                                    <th>Value</th>
                                    <th>Notes</th>
                                    <th className="w-24">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEntries.map((entry) => (
                                    <tr key={entry.id}>
                                        {editingId === entry.id ? (
                                            <>
                                                <td>
                                                    <input
                                                        type="date"
                                                        value={editDate}
                                                        onChange={(e) => setEditDate(e.target.value)}
                                                        className="text-sm"
                                                    />
                                                </td>
                                                <td>{accountMap.get(entry.accountId) || 'Unknown'}</td>
                                                <td>
                                                    <input
                                                        type="text"
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        className="text-sm"
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="text"
                                                        value={editNotes}
                                                        onChange={(e) => setEditNotes(e.target.value)}
                                                        placeholder="Notes..."
                                                        className="text-sm"
                                                    />
                                                </td>
                                                <td>
                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={() => handleSave(entry.id)}
                                                            className="p-1.5 hover:bg-green-100 text-green-600 rounded"
                                                        >
                                                            <Check className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingId(null)}
                                                            className="p-1.5 hover:bg-[var(--bg-primary)] rounded"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td>{formatDate(entry.entryDate)}</td>
                                                <td>{accountMap.get(entry.accountId) || 'Unknown'}</td>
                                                <td className="font-semibold">{formatCurrency(entry.value)}</td>
                                                <td className="text-[var(--text-secondary)]">
                                                    {entry.notes || '-'}
                                                </td>
                                                <td>
                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={() => handleEdit(entry)}
                                                            className="p-1.5 hover:bg-[var(--bg-primary)] rounded"
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(entry.id)}
                                                            className="p-1.5 hover:bg-red-100 text-red-500 rounded"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
