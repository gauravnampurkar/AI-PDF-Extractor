import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { PDFPageProxy } from 'pdfjs-dist';
import { extractTablesFromImage } from '../services/geminiService';
import type { PageData } from '../types';
import TableDisplay from './TableDisplay';
import Spinner from './Spinner';
import { MagicWandIcon } from './icons';

interface PdfPageDisplayProps {
  pageNumber: number;
  pdfPage: PDFPageProxy;
  onExtractionComplete: (pageNumber: number, data: PageData) => void;
  isMergeMode: boolean;
  selectedTableIds: Set<string>;
  onTableSelect: (tableId: string) => void;
}

const PdfPageDisplay: React.FC<PdfPageDisplayProps> = ({ pageNumber, pdfPage, onExtractionComplete, isMergeMode, selectedTableIds, onTableSelect }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pageData, setPageData] = useState<PageData>({
    pageNumber,
    status: 'pending',
    tables: [],
  });
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    const renderPage = async () => {
      if (!isRendered && canvasRef.current) {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (!context) return;

        const viewport = pdfPage.getViewport({ scale: 1.5 });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvas,
          canvasContext: context,
          viewport: viewport,
        };
        await pdfPage.render(renderContext).promise;
        setIsRendered(true);
      }
    };
    renderPage();
  }, [pdfPage, isRendered]);

  const handleExtract = useCallback(async () => {
    if (!canvasRef.current || pageData.status === 'loading') return;
    
    setPageData(prev => ({ ...prev, status: 'loading', errorMessage: undefined }));

    try {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      const base64Image = dataUrl.split(',')[1];
      const result = await extractTablesFromImage(base64Image);
      
      const newPageData = {
        pageNumber,
        status: 'success' as const,
        tables: result.tables,
      };
      setPageData(newPageData);
      onExtractionComplete(pageNumber, newPageData);

    } catch (error) {
      console.error(`Error extracting from page ${pageNumber}:`, error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      const newPageData = {
        pageNumber,
        status: 'error' as const,
        tables: [],
        errorMessage,
      };
      setPageData(newPageData);
      onExtractionComplete(pageNumber, newPageData);
    }
  }, [pageNumber, pageData.status, onExtractionComplete]);

  const isLoading = pageData.status === 'loading';
  const isSuccess = pageData.status === 'success';
  const isError = pageData.status === 'error';

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8 transition-all duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left side: Canvas and button */}
        <div className="flex flex-col items-center">
          <div className="w-full border rounded-lg overflow-hidden shadow-sm bg-slate-200">
            <canvas ref={canvasRef} className="w-full h-auto" />
          </div>
          <button
            onClick={handleExtract}
            disabled={isLoading || !isRendered}
            className="mt-4 flex items-center justify-center gap-2 w-full max-w-xs px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Spinner className="w-5 h-5" />
                <span>Extracting...</span>
              </>
            ) : (
               <>
                <MagicWandIcon className="w-5 h-5" />
                <span>Extract Tables from Page {pageNumber}</span>
              </>
            )}
          </button>
        </div>
        
        {/* Right side: Results */}
        <div className="flex flex-col">
          {isError && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
              <p className="font-bold">Extraction Failed</p>
              <p>{pageData.errorMessage}</p>
            </div>
          )}
          {isSuccess && pageData.tables.length === 0 && (
            <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded-md h-full flex items-center justify-center">
              <p>No tables were found on this page.</p>
            </div>
          )}
          {isSuccess && pageData.tables.length > 0 && (
            <div className="h-full overflow-y-auto pr-2">
              {pageData.tables.map((table, index) => {
                const tableId = `page-${pageNumber}-table-${index}`;
                return (
                  <TableDisplay
                    key={tableId}
                    table={table}
                    isMergeMode={isMergeMode}
                    isSelected={selectedTableIds.has(tableId)}
                    onSelect={() => onTableSelect(tableId)}
                  />
                );
              })}
            </div>
          )}
           {!isSuccess && !isError && (
             <div className="bg-slate-50 rounded-lg h-full flex flex-col items-center justify-center text-center p-6 border border-dashed">
                <MagicWandIcon className="w-12 h-12 text-slate-400 mb-4"/>
                <h3 className="text-lg font-medium text-slate-600">Ready for Extraction</h3>
                <p className="text-sm text-slate-500">Click the "Extract Tables" button to let the AI analyze this page.</p>
            </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default PdfPageDisplay;