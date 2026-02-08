import type { Account, Entry } from '../types';
import { downloadFile } from './csvParser';

interface BackupData {
    version: string;
    exportedAt: string;
    accounts: Account[];
    entries: Entry[];
}

/**
 * Create a backup of all data as JSON
 */
export function createBackup(accounts: Account[], entries: Entry[]): string {
    const backup: BackupData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        accounts: accounts.map((a) => ({
            ...a,
            createdAt: a.createdAt,
        })),
        entries: entries.map((e) => ({
            ...e,
            entryDate: e.entryDate,
            createdAt: e.createdAt,
        })),
    };

    return JSON.stringify(backup, null, 2);
}

/**
 * Download backup as a JSON file
 */
export function downloadBackup(accounts: Account[], entries: Entry[]): void {
    const content = createBackup(accounts, entries);
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `mountain-finance-backup-${timestamp}.json`;
    downloadFile(content, filename, 'application/json');
}

/**
 * Parse a backup file
 */
export function parseBackup(content: string): BackupData | null {
    try {
        const data = JSON.parse(content) as BackupData;

        // Validate structure
        if (!data.version || !Array.isArray(data.accounts) || !Array.isArray(data.entries)) {
            return null;
        }

        // Convert date strings back to Date objects
        const accounts: Account[] = data.accounts.map((a) => ({
            ...a,
            createdAt: new Date(a.createdAt),
        }));

        const entries: Entry[] = data.entries.map((e) => ({
            ...e,
            entryDate: new Date(e.entryDate),
            createdAt: new Date(e.createdAt),
        }));

        return {
            ...data,
            accounts,
            entries,
        };
    } catch {
        return null;
    }
}

/**
 * Validate backup data before restore
 */
export function validateBackup(data: BackupData): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check accounts
    for (const account of data.accounts) {
        if (!account.id || !account.name) {
            errors.push(`Invalid account: missing id or name`);
        }
    }

    // Check entries
    const accountIds = new Set(data.accounts.map((a) => a.id));
    for (const entry of data.entries) {
        if (!entry.id || !entry.accountId) {
            errors.push(`Invalid entry: missing id or accountId`);
        }
        if (!accountIds.has(entry.accountId)) {
            errors.push(`Entry references unknown account: ${entry.accountId}`);
        }
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}
