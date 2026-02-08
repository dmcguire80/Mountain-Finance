import type { CSVRow, CSVImportResult } from '../types';

/**
 * Parse a CSV file for import
 * Expected format: Account Name,Value,Date[,Notes]
 */
export function parseCSV(content: string): CSVImportResult {
  const lines = content.trim().split('\n');
  const valid: CSVRow[] = [];
  const invalid: { row: number; reason: string; data: string[] }[] = [];

  // Skip header if present
  const startRow = lines[0]?.toLowerCase().includes('account') ? 1 : 0;

  for (let i = startRow; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = parseCSVLine(line);
    const rowNum = i + 1;

    if (parts.length < 3) {
      invalid.push({
        row: rowNum,
        reason: 'Not enough columns (expected: Account Name, Value, Date)',
        data: parts,
      });
      continue;
    }

    const [accountName, valueStr, dateStr, notes] = parts;

    // Validate account name
    if (!accountName?.trim()) {
      invalid.push({
        row: rowNum,
        reason: 'Missing account name',
        data: parts,
      });
      continue;
    }

    // Parse and validate value
    const value = parseValue(valueStr);
    if (isNaN(value)) {
      invalid.push({
        row: rowNum,
        reason: `Invalid value: "${valueStr}"`,
        data: parts,
      });
      continue;
    }

    // Parse and validate date
    const dateParsed = parseDate(dateStr);
    if (!dateParsed) {
      invalid.push({
        row: rowNum,
        reason: `Invalid date: "${dateStr}" (expected YYYY-MM-DD)`,
        data: parts,
      });
      continue;
    }

    valid.push({
      accountName: accountName.trim(),
      value,
      date: dateParsed,
      notes: notes?.trim() || undefined,
    });
  }

  return { valid, invalid };
}

/**
 * Parse a single CSV line, handling quoted values
 */
function parseCSVLine(line: string): string[] {
  const parts: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      parts.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  parts.push(current.trim());
  return parts;
}

/**
 * Parse a value string, removing currency symbols and commas
 */
function parseValue(valueStr: string): number {
  if (!valueStr) return NaN;
  // Remove $, commas, and whitespace
  const cleaned = valueStr.replace(/[$,\s]/g, '');
  return parseFloat(cleaned);
}

/**
 * Parse a date string in YYYY-MM-DD format
 */
function parseDate(dateStr: string): string | null {
  if (!dateStr) return null;

  const trimmed = dateStr.trim();

  // Try YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const date = new Date(trimmed + 'T00:00:00');
    if (!isNaN(date.getTime())) {
      return trimmed;
    }
  }

  // Try MM/DD/YYYY format
  const mdyMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (mdyMatch) {
    const [, month, day, year] = mdyMatch;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (!isNaN(date.getTime())) {
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
  }

  return null;
}

/**
 * Generate a CSV template for download
 */
export function generateCSVTemplate(): string {
  const header = 'Account Name,Value,Date,Notes';
  const example1 = '401k,50000.00,2024-01-15,Q1 balance';
  const example2 = 'Roth IRA,"$25,000.00",2024-01-15,';
  return `${header}\n${example1}\n${example2}`;
}

/**
 * Trigger a file download
 */
export function downloadFile(content: string, filename: string, type: string = 'text/csv') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
