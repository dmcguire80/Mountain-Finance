import type { Entry, DashboardSummary, AccountSummary, ChartDataPoint, TimeFilter } from '../types';

/**
 * Format a number as USD currency
 */
export function formatCurrency(value: number, decimals: number = 0): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: decimals,
        minimumFractionDigits: decimals,
    }).format(value);
}

/**
 * Format a date for display
 */
export function formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

/**
 * Format a date as YYYY-MM-DD for input fields
 */
export function formatDateInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Time filters for chart display
 */
export const timeFilters: TimeFilter[] = [
    { id: '1m', label: 'Month', days: 30 },
    { id: '3m', label: '3 Month', days: 90 },
    { id: '6m', label: '6 Month', days: 180 },
    { id: 'ytd', label: 'YTD', days: null }, // Calculate dynamically
    { id: '1y', label: '1 Year', days: 365 },
    { id: '3y', label: '3 Year', days: 1095 },
    { id: '5y', label: '5 Year', days: 1825 },
    { id: 'max', label: 'Max', days: 10000 },
];

/**
 * Get the number of days for a filter, with YTD calculated dynamically
 */
export function getFilterDays(filterId: string): number {
    if (filterId === 'ytd') {
        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const diffTime = Math.abs(now.getTime() - startOfYear.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }
    const filter = timeFilters.find((f) => f.id === filterId);
    return filter?.days ?? 90;
}

/**
 * Filter entries by time range
 */
export function filterEntriesByDays(entries: Entry[], days: number): Entry[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return entries.filter((entry) => entry.entryDate >= cutoffDate);
}

/**
 * Get the most recent entry for each account
 */
export function getLatestEntries(
    entries: Entry[],
    accountIds: string[]
): Map<string, Entry | null> {
    const latestMap = new Map<string, Entry | null>();

    for (const accountId of accountIds) {
        const accountEntries = entries.filter((e) => e.accountId === accountId);
        if (accountEntries.length > 0) {
            // Sort by date descending and take first
            const sorted = [...accountEntries].sort(
                (a, b) => b.entryDate.getTime() - a.entryDate.getTime()
            );
            latestMap.set(accountId, sorted[0]);
        } else {
            latestMap.set(accountId, null);
        }
    }

    return latestMap;
}

/**
 * Calculate dashboard summary from accounts and entries
 */
export function calculateDashboardSummary(
    accounts: { id: string; name: string }[],
    entries: Entry[],
    days: number
): DashboardSummary {
    const activeAccounts = accounts;
    const filteredEntries = filterEntriesByDays(entries, days);
    const latestEntries = getLatestEntries(entries, accounts.map((a) => a.id));

    // Get oldest entry in filtered range for comparison
    const oldestEntries = getOldestEntriesInRange(filteredEntries, accounts.map((a) => a.id));

    let totalValue = 0;
    let totalOldValue = 0;
    let lastUpdated = new Date(0);

    const accountSummaries: AccountSummary[] = activeAccounts.map((account) => {
        const latestEntry = latestEntries.get(account.id);
        const oldestEntry = oldestEntries.get(account.id);

        const currentValue = latestEntry?.value ?? 0;
        const oldValue = oldestEntry?.value ?? currentValue;
        const changeAmount = currentValue - oldValue;
        const changePercent = oldValue !== 0 ? (changeAmount / oldValue) * 100 : 0;

        totalValue += currentValue;
        totalOldValue += oldValue;

        if (latestEntry && latestEntry.entryDate > lastUpdated) {
            lastUpdated = latestEntry.entryDate;
        }

        return {
            id: account.id,
            name: account.name,
            currentValue,
            changeAmount,
            changePercent,
            lastUpdated: latestEntry?.entryDate ?? new Date(),
        };
    });

    const totalChangeAmount = totalValue - totalOldValue;
    const totalChangePercent = totalOldValue !== 0 ? (totalChangeAmount / totalOldValue) * 100 : 0;

    return {
        totalValue,
        totalChangeAmount,
        totalChangePercent,
        lastUpdated: lastUpdated.getTime() === 0 ? new Date() : lastUpdated,
        accounts: accountSummaries,
    };
}

/**
 * Get oldest entry in range for each account
 */
function getOldestEntriesInRange(
    entries: Entry[],
    accountIds: string[]
): Map<string, Entry | null> {
    const oldestMap = new Map<string, Entry | null>();

    for (const accountId of accountIds) {
        const accountEntries = entries.filter((e) => e.accountId === accountId);
        if (accountEntries.length > 0) {
            const sorted = [...accountEntries].sort(
                (a, b) => a.entryDate.getTime() - b.entryDate.getTime()
            );
            oldestMap.set(accountId, sorted[0]);
        } else {
            oldestMap.set(accountId, null);
        }
    }

    return oldestMap;
}

/**
 * Generate chart data from entries
 */
export function generateChartData(
    entries: Entry[],
    accounts: { id: string; name: string }[],
    days: number
): ChartDataPoint[] {
    const filteredEntries = filterEntriesByDays(entries, days);

    // Group entries by date
    const dateMap = new Map<string, Map<string, number>>();

    for (const entry of filteredEntries) {
        const dateKey = formatDateInput(entry.entryDate);
        if (!dateMap.has(dateKey)) {
            dateMap.set(dateKey, new Map());
        }
        dateMap.get(dateKey)!.set(entry.accountId, entry.value);
    }

    // Convert to chart data points
    const chartData: ChartDataPoint[] = [];
    const sortedDates = Array.from(dateMap.keys()).sort();

    // Track last known values for accounts
    const lastValues = new Map<string, number>();

    for (const date of sortedDates) {
        const dayData = dateMap.get(date)!;
        const accountsData: Record<string, number> = {};
        let totalValue = 0;

        for (const account of accounts) {
            const value = dayData.get(account.id) ?? lastValues.get(account.id) ?? 0;
            lastValues.set(account.id, value);
            accountsData[account.name] = value;
            totalValue += value;
        }

        chartData.push({
            date,
            totalValue,
            accounts: accountsData,
        });
    }

    return chartData;
}
