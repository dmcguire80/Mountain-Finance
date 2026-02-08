import { useState, useCallback, useMemo } from 'react';
import { Upload, Download, FileText, Check, AlertTriangle, X } from 'lucide-react';
import { useData } from '../context/DataContext';
import { parseCSV, generateCSVTemplate, downloadFile } from '../utils/csvParser';
import type { CSVImportResult } from '../types';

export function Import() {
  const { accounts, addAccount, addEntry } = useData();
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<CSVImportResult | null>(null);
  const [importing, setImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [error, setError] = useState('');

  const accountNameMap = useMemo(() => {
    const map = new Map<string, string>();
    accounts.forEach((a) => map.set(a.name.toLowerCase(), a.id));
    return map;
  }, [accounts]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
      setError('');
      setImportSuccess(false);

      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        const parsed = parseCSV(content);
        setResult(parsed);
      };
      reader.onerror = () => {
        setError('Failed to read file');
      };
      reader.readAsText(selectedFile);
    }
  }, []);

  const handleImport = async () => {
    if (!result || result.valid.length === 0) return;

    setImporting(true);
    setError('');

    try {
      // Build a local map so newly created accounts are available immediately
      const localAccountMap = new Map(accountNameMap);

      // First pass: create any missing accounts and record their IDs
      const newAccountNames = new Set<string>();
      for (const row of result.valid) {
        const key = row.accountName.toLowerCase();
        if (!localAccountMap.has(key) && !newAccountNames.has(key)) {
          newAccountNames.add(key);
          const newId = await addAccount(row.accountName);
          localAccountMap.set(key, newId);
        }
      }

      // Second pass: add all entries using the complete account map
      for (const row of result.valid) {
        const accountId = localAccountMap.get(row.accountName.toLowerCase());
        if (!accountId) continue; // Should never happen after first pass

        await addEntry(accountId, row.value, new Date(row.date + 'T00:00:00'), row.notes);
      }

      setImportSuccess(true);
      setFile(null);
      setResult(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  const handleDownloadTemplate = () => {
    const template = generateCSVTemplate();
    downloadFile(template, 'import-template.csv', 'text/csv');
  };

  const handleClear = () => {
    setFile(null);
    setResult(null);
    setError('');
    setImportSuccess(false);
  };

  return (
    <div className="animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Import Data</h1>
        <button onClick={handleDownloadTemplate} className="btn btn-secondary">
          <Download className="w-4 h-4" />
          Download Template
        </button>
      </div>

      {/* Instructions */}
      <div className="card p-4 mb-6">
        <h2 className="font-semibold mb-2">CSV Format</h2>
        <p className="text-sm text-[var(--text-secondary)] mb-2">
          Your CSV file should have the following columns:
        </p>
        <code className="block bg-[var(--bg-primary)] p-2 rounded text-sm mb-2">
          Account Name,Value,Date,Notes (optional)
        </code>
        <ul className="text-sm text-[var(--text-secondary)] list-disc list-inside space-y-1">
          <li>Values can include $ and commas (e.g., $50,000.00)</li>
          <li>Dates should be in YYYY-MM-DD or MM/DD/YYYY format</li>
          <li>New accounts will be created automatically</li>
        </ul>
      </div>

      {/* File Upload */}
      <div className="card p-6 mb-6">
        {!file ? (
          <label className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-[var(--border-color)] rounded-lg cursor-pointer hover:border-[var(--color-primary)] transition-colors">
            <Upload className="w-12 h-12 text-[var(--text-secondary)] mb-4" />
            <span className="text-lg font-medium text-[var(--text-primary)]">Choose CSV file</span>
            <span className="text-sm text-[var(--text-secondary)] mt-1">or drag and drop</span>
            <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
          </label>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-[var(--color-primary)]" />
              <div>
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-[var(--text-secondary)]">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <button onClick={handleClear} className="btn btn-secondary">
              <X className="w-4 h-4" />
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-100 border border-red-300 text-red-700 rounded-lg p-3 text-sm mb-4">
          {error}
        </div>
      )}

      {importSuccess && (
        <div className="bg-green-100 border border-green-300 text-green-700 rounded-lg p-4 mb-4 flex items-center gap-2">
          <Check className="w-5 h-5" />
          Import completed successfully!
        </div>
      )}

      {/* Preview */}
      {result && (
        <>
          {/* Valid entries */}
          {result.valid.length > 0 && (
            <div className="card p-4 mb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-green-600 flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  {result.valid.length} Valid Entries
                </h3>
                <button onClick={handleImport} disabled={importing} className="btn btn-primary">
                  {importing ? (
                    <div className="spinner w-4 h-4 border-white/30 border-t-white"></div>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Import {result.valid.length} Entries
                    </>
                  )}
                </button>
              </div>
              <div className="overflow-x-auto max-h-64">
                <table className="text-sm">
                  <thead>
                    <tr>
                      <th>Account</th>
                      <th>Value</th>
                      <th>Date</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.valid.slice(0, 10).map((row, i) => (
                      <tr key={i}>
                        <td>{row.accountName}</td>
                        <td>${row.value.toLocaleString()}</td>
                        <td>{row.date}</td>
                        <td className="text-[var(--text-secondary)]">{row.notes || '-'}</td>
                      </tr>
                    ))}
                    {result.valid.length > 10 && (
                      <tr>
                        <td colSpan={4} className="text-center text-[var(--text-secondary)]">
                          ... and {result.valid.length - 10} more
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Invalid entries */}
          {result.invalid.length > 0 && (
            <div className="card p-4 border-amber-300">
              <h3 className="font-semibold text-amber-600 flex items-center gap-2 mb-4">
                <AlertTriangle className="w-4 h-4" />
                {result.invalid.length} Invalid Entries (will be skipped)
              </h3>
              <div className="overflow-x-auto max-h-48">
                <table className="text-sm">
                  <thead>
                    <tr>
                      <th>Row</th>
                      <th>Reason</th>
                      <th>Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.invalid.map((item, i) => (
                      <tr key={i}>
                        <td>{item.row}</td>
                        <td className="text-red-500">{item.reason}</td>
                        <td className="text-[var(--text-secondary)] font-mono text-xs">
                          {item.data.join(', ')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
