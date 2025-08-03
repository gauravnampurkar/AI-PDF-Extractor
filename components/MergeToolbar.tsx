import React from 'react';
import type { ExtractedTable } from '../types';
import { CsvIcon } from './icons';

interface MergeToolbarProps {
  selectedTables: ExtractedTable[];
  onClearSelection: () => void;
}

// Escapes a cell for CSV content, preventing formula injection and handling quotes.
const escapeCsvCell = (cell: string | null | undefined): string => {
    const cellStr = (cell || "").toString();
    if (!cellStr) return '""';

    // Escape double quotes by doubling them
    let escaped = cellStr.replace(/"/g, '""');

    // Prevent formula injection in spreadsheet software
    if (['=', '+', '-', '@'].includes(cellStr.charAt(0))) {
        escaped = `'${escaped}`;
    }

    return `"${escaped}"`;
};

const MergeToolbar: React.FC<MergeToolbarProps> = ({ selectedTables, onClearSelection }) => {
  const downloadMergedCsv = () => {
    if (selectedTables.length === 0) return;

    // Use the header from the first table.
    const headers = selectedTables[0].data[0];
    
    // Combine data rows from all selected tables.
    // For the first table, include its data rows. For subsequent tables, do the same.
    const allDataRows = selectedTables.flatMap(table => table.data.length > 1 ? table.data.slice(1) : []);

    const mergedData = [headers, ...allDataRows];

    const csvContent = mergedData.map(row => 
      row.map(escapeCsvCell).join(',')
    ).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'merged_tables.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-indigo-600 text-white rounded-lg shadow-lg p-4 mb-8 sticky top-[82px] z-20">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex-grow">
          <h3 className="font-bold text-lg">Merge Mode Active</h3>
          <p className="text-sm text-indigo-200">
            {selectedTables.length} table{selectedTables.length !== 1 ? 's' : ''} selected. Select tables below to combine them.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onClearSelection}
            className="px-4 py-2 bg-indigo-500 text-white text-sm font-semibold rounded-md hover:bg-indigo-400 transition-colors"
          >
            Clear Selection
          </button>
          <button
            onClick={downloadMergedCsv}
            disabled={selectedTables.length < 1} // At least one table must be selected
            className="flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 text-sm font-semibold rounded-md hover:bg-indigo-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-600 focus:ring-white disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed"
          >
            <CsvIcon className="w-5 h-5" />
            <span>Merge & Download CSV</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MergeToolbar;