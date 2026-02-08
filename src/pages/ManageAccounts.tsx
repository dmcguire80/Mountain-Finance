import { useState } from 'react';
import { Plus, Pencil, Eye, EyeOff, Trash2, X, Check } from 'lucide-react';
import { useData } from '../context/DataContext';
import { formatDate } from '../utils/calculations';

export function ManageAccounts() {
  const { accounts, addAccount, updateAccount, toggleAccountActive, deleteAccount } = useData();
  const [showInactive, setShowInactive] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', accountType: '' });
  const [error, setError] = useState('');

  const filteredAccounts = showInactive ? accounts : accounts.filter((a) => a.isActive);

  const handleAdd = async () => {
    if (!formData.name.trim()) {
      setError('Account name is required');
      return;
    }

    try {
      await addAccount(formData.name.trim(), formData.accountType.trim() || undefined);
      setFormData({ name: '', accountType: '' });
      setShowAddForm(false);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add account');
    }
  };

  const handleUpdate = async (id: string) => {
    if (!formData.name.trim()) {
      setError('Account name is required');
      return;
    }

    try {
      await updateAccount(id, {
        name: formData.name.trim(),
        accountType: formData.accountType.trim() || null,
      });
      setEditingId(null);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update account');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (
      confirm(
        `Are you sure you want to delete "${name}"? This will also delete all entries for this account.`
      )
    ) {
      try {
        await deleteAccount(id);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete account');
      }
    }
  };

  const startEdit = (account: { id: string; name: string; accountType: string | null }) => {
    setEditingId(account.id);
    setFormData({ name: account.name, accountType: account.accountType || '' });
    setShowAddForm(false);
  };

  return (
    <div className="animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Manage Accounts</h1>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="w-4 h-4"
            />
            Show inactive
          </label>
          <button
            onClick={() => {
              setShowAddForm(true);
              setEditingId(null);
              setFormData({ name: '', accountType: '' });
            }}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4" />
            Add Account
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-300 text-red-700 rounded-lg p-3 text-sm mb-4">
          {error}
        </div>
      )}

      {/* Add Form */}
      {showAddForm && (
        <div className="card p-4 mb-4 animate-fadeIn">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[var(--text-primary)]">New Account</h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="p-1 hover:bg-[var(--bg-primary)] rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., 401k, Roth IRA"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type (optional)</label>
              <input
                type="text"
                value={formData.accountType}
                onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
                placeholder="e.g., Retirement, Brokerage"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowAddForm(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button onClick={handleAdd} className="btn btn-primary">
              <Check className="w-4 h-4" />
              Create
            </button>
          </div>
        </div>
      )}

      {/* Accounts List */}
      <div className="space-y-3">
        {filteredAccounts.length === 0 ? (
          <div className="text-center py-12 text-[var(--text-secondary)]">
            <p>No accounts found. Create one to get started!</p>
          </div>
        ) : (
          filteredAccounts.map((account) => (
            <div key={account.id} className={`card p-4 ${!account.isActive ? 'opacity-60' : ''}`}>
              {editingId === account.id ? (
                /* Edit Mode */
                <div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Name *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Type</label>
                      <input
                        type="text"
                        value={formData.accountType}
                        onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setEditingId(null)} className="btn btn-secondary">
                      Cancel
                    </button>
                    <button onClick={() => handleUpdate(account.id)} className="btn btn-primary">
                      <Check className="w-4 h-4" />
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                /* View Mode */
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-[var(--text-primary)]">{account.name}</h3>
                    {account.accountType && (
                      <p className="text-sm text-[var(--text-secondary)]">{account.accountType}</p>
                    )}
                    <p className="text-xs text-[var(--text-secondary)] mt-1">
                      Created: {formatDate(account.createdAt)}
                      {!account.isActive && <span className="ml-2 text-amber-500">(Inactive)</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEdit(account)}
                      className="p-2 hover:bg-[var(--bg-primary)] rounded-lg"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toggleAccountActive(account.id)}
                      className="p-2 hover:bg-[var(--bg-primary)] rounded-lg"
                      title={account.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {account.isActive ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(account.id, account.name)}
                      className="p-2 hover:bg-red-100 text-red-500 rounded-lg"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
