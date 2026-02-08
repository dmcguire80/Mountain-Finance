import { useState, useEffect } from 'react';
import { Sun, Moon, Download, Upload, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { downloadBackup, parseBackup, validateBackup } from '../utils/backup';

export function Settings() {
  const { user, logout } = useAuth();
  const { accounts, entries } = useData();
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : true;
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleExport = () => {
    downloadBackup(accounts, entries);
    setMessage('Backup downloaded successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const backup = parseBackup(content);

      if (!backup) {
        setMessage('Invalid backup file format');
        return;
      }

      const validation = validateBackup(backup);
      if (!validation.valid) {
        setMessage(`Backup validation failed: ${validation.errors.join(', ')}`);
        return;
      }

      // For now, just show a message - actual restore would need careful implementation
      setMessage(
        `Backup contains ${backup.accounts.length} accounts and ${backup.entries.length} entries. ` +
          'Full restore functionality coming soon!'
      );
    };
    reader.onerror = () => {
      setMessage('Failed to read backup file');
    };
    reader.readAsText(file);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="animate-fadeIn max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Settings</h1>

      {message && (
        <div className="bg-blue-100 border border-blue-300 text-blue-700 rounded-lg p-3 text-sm mb-4">
          {message}
        </div>
      )}

      {/* Appearance */}
      <div className="card p-6 mb-4">
        <h2 className="font-semibold text-lg mb-4">Appearance</h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            <div>
              <p className="font-medium">Dark Mode</p>
              <p className="text-sm text-[var(--text-secondary)]">
                Toggle between light and dark themes
              </p>
            </div>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${
              darkMode ? 'bg-[var(--color-primary)]' : 'bg-[var(--border-color)]'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform mt-0.5 ${
                darkMode ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Data Management */}
      <div className="card p-6 mb-4">
        <h2 className="font-semibold text-lg mb-4">Data Management</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b border-[var(--border-color)]">
            <div>
              <p className="font-medium">Export Backup</p>
              <p className="text-sm text-[var(--text-secondary)]">
                Download a JSON backup of all your data
              </p>
            </div>
            <button onClick={handleExport} className="btn btn-secondary">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium">Import Backup</p>
              <p className="text-sm text-[var(--text-secondary)]">
                Restore from a previous backup file
              </p>
            </div>
            <label className="btn btn-secondary cursor-pointer">
              <Upload className="w-4 h-4" />
              Import
              <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
            </label>
          </div>
        </div>
      </div>

      {/* Account Info */}
      <div className="card p-6 mb-4">
        <h2 className="font-semibold text-lg mb-4">Account</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b border-[var(--border-color)]">
            <div>
              <p className="font-medium">Email</p>
              <p className="text-sm text-[var(--text-secondary)]">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium">Sign Out</p>
              <p className="text-sm text-[var(--text-secondary)]">Log out of your account</p>
            </div>
            <button onClick={handleLogout} className="btn btn-secondary text-red-500">
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="card p-6">
        <h2 className="font-semibold text-lg mb-4">Statistics</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-[var(--bg-primary)] rounded-lg">
            <p className="text-3xl font-bold text-[var(--color-primary)]">{accounts.length}</p>
            <p className="text-sm text-[var(--text-secondary)]">Accounts</p>
          </div>
          <div className="text-center p-4 bg-[var(--bg-primary)] rounded-lg">
            <p className="text-3xl font-bold text-[var(--color-primary)]">{entries.length}</p>
            <p className="text-sm text-[var(--text-secondary)]">Entries</p>
          </div>
        </div>
      </div>
    </div>
  );
}
