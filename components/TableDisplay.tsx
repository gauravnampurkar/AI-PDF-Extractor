import React from 'react';
import type { ExtractedTable } from '../types';
import { CsvIcon } from './icons';

interface TableDisplayProps {
  table: ExtractedTable;
  isMergeMode?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
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

const TableDisplay: React.FC<TableDisplayProps> = ({ table, isMergeMode, isSelected, onSelect }) => {
  
  const downloadCsv = () => {
    const csvContent = table.data.map(row => 
      row.map(escapeCsvCell).join(',')
    ).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    const safeTitle = table.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.setAttribute('download', `${safeTitle || 'extracted_table'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  if (!table.data || table.data.length === 0) {
    return null;
  }
  
  const wrapperClasses = `
    bg-white rounded-lg shadow-md p-4 mb-6 ring-1
    ${isMergeMode ? 'cursor-pointer hover:ring-indigo-500 transition-all' : 'ring-slate-200'}
    ${isSelected ? 'ring-2 ring-indigo-600 shadow-xl' : ''}
  `;

  return (
    <div className={wrapperClasses} onClick={isMergeMode ? onSelect : undefined}>
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-3">
            {isMergeMode && (
              <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={onSelect}
                  className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  aria-label={`Select table ${table.title}`}
              />
            )}
            <h3 className="text-lg font-semibold text-slate-700">{table.title || "Extracted Table"}</h3>
        </div>
        {!isMergeMode && (
          <div className="flex items-center gap-2">
            <button
              onClick={downloadCsv}
              className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 text-white text-sm font-semibold rounded-md hover:bg-emerald-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              aria-label={`Download ${table.title || 'extracted table'} as CSV`}
            >
              <CsvIcon className="w-4 h-4" />
              <span>Download CSV</span>
            </button>
          </div>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left text-slate-600">
          <thead className="bg-slate-100 text-xs text-slate-700 uppercase">
            <tr>
              {table.data[0].map((header, index) => (
                <th key={index} scope="col" className="px-4 py-3 font-medium">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.data.slice(1).map((row, rowIndex) => (
              <tr key={rowIndex} className="bg-white border-b border-slate-200 hover:bg-slate-50">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-4 py-3">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableDisplay;