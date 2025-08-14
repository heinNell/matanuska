import Papa from 'papaparse';

/**
 * Generic function to export data to CSV
 * @param data Array of objects to export
 * @param filename Name for the downloaded file
 */
export function exportToCSV<T>(data: T[], filename: string): void {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generic function to parse CSV file and return records
 * @param file CSV file to parse
 * @returns Promise that resolves to parsed records
 */
export function parseCSV<T>(file: File): Promise<T[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        resolve(results.data as T[]);
      },
      error: (error) => {
        reject(error);
      }
    });
  });
}

/**
 * Download a template CSV file with sample data
 * @param sampleData Sample data object to use as template
 * @param filename Name for the downloaded file
 */
export function downloadCSVTemplate<T>(sampleData: T, filename: string): void {
  const csv = Papa.unparse([sampleData]);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Import results interface
 */
export interface ImportResults {
  success: number;
  failed: number;
  errors: string[];
}
