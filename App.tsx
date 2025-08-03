

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import * as pdfjs from 'pdfjs-dist';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import FileUploader from './components/FileUploader';
import PdfPageDisplay from './components/PdfPageDisplay';
import MergeToolbar from './components/MergeToolbar';
import { FilePdfIcon, CombineIcon, LockClosedIcon } from './components/icons';
import type { PageData, ExtractedTable } from './types';
import Spinner from './components/Spinner';

// Setup PDF.js worker. It's hosted on a CDN.
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@4.4.168/build/pdf.worker.mjs`;

function App() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [pdfData, setPdfData] = useState<ArrayBuffer | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pagesData, setPagesData] = useState<Map<number, PageData>>(new Map());
  const [resolvedPages, setResolvedPages] = useState<React.ReactNode[]>([]);
  
  const [isMergeMode, setIsMergeMode] = useState(false);
  const [selectedTableIds, setSelectedTableIds] = useState<Set<string>>(new Set());

  const [needsPassword, setNeedsPassword] = useState<boolean>(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  
  const handleReset = useCallback(() => {
    setPdfFile(null);
    setPdfDoc(null);
    setPdfData(null);
    setError(null);
    setIsProcessing(false);
    setPagesData(new Map());
    setResolvedPages([]);
    setIsMergeMode(false);
    setSelectedTableIds(new Set());
    setNeedsPassword(false);
    setPasswordError(null);
  }, []);

  const tryLoadPdf = useCallback(async (data: ArrayBuffer, password?: string) => {
    setIsProcessing(true);
    setError(null);
    setPasswordError(null);
    
    try {
      // CLONE the ArrayBuffer before passing it to pdf.js to prevent it from being detached on a failed attempt.
      const loadingTask = pdfjs.getDocument({ data: data.slice(0), password });
      const pdf = await loadingTask.promise;
      setPdfDoc(pdf);
      setNeedsPassword(false); // Success!
    } catch (err: any) {
      console.error("Error loading PDF:", err);
      // More specific check for password errors from pdf.js using the error's name and code.
      if (err && err.name === 'PasswordException') {
        setNeedsPassword(true);
        // err.code === 1 means a password is required.
        // err.code === 2 means the provided password was incorrect.
        if (err.code === 2) { 
          setPasswordError("Incorrect password. Please try again.");
        } else {
          setPasswordError("This PDF is password-protected. Please enter the password.");
        }
        setPdfDoc(null);
      } else {
        // Fallback for other types of errors.
        setError(err.message || "Could not read the PDF file. It may be corrupted or not a valid PDF.");
        setPdfFile(null);
        setPdfData(null);
      }
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleFileSelect = useCallback(async (file: File) => {
    if (isProcessing) return;
    
    handleReset(); // Reset everything for a new file

    setPdfFile(file);
    setIsProcessing(true);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      setPdfData(arrayBuffer);
      await tryLoadPdf(arrayBuffer); // Initial attempt without password
    } catch (readError) {
        console.error("Error reading file:", readError);
        setError("Could not read the file.");
        setIsProcessing(false);
    }
  }, [isProcessing, handleReset, tryLoadPdf]);
  
  const handlePasswordSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const password = new FormData(e.currentTarget).get('password') as string;
      if (pdfData && password) {
          tryLoadPdf(pdfData, password);
      }
  };

  const handleExtractionComplete = useCallback((pageNumber: number, data: PageData) => {
    setPagesData(prev => new Map(prev).set(pageNumber, data));
  }, []);

  const handleToggleTableSelection = (tableId: string) => {
    setSelectedTableIds(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(tableId)) {
        newSelection.delete(tableId);
      } else {
        newSelection.add(tableId);
      }
      return newSelection;
    });
  };

  const allExtractedTables = useMemo(() => {
    const tables: ({ id: string; table: ExtractedTable })[] = [];
    pagesData.forEach((pageData, pageNumber) => {
      if (pageData.status === 'success') {
        pageData.tables.forEach((table, index) => {
          tables.push({
            id: `page-${pageNumber}-table-${index}`,
            table
          });
        });
      }
    });
    return tables;
  }, [pagesData]);

  const selectedTables = useMemo(() => {
    return allExtractedTables
      .filter(item => selectedTableIds.has(item.id))
      .map(item => item.table);
  }, [selectedTableIds, allExtractedTables]);
  
  const hasExtractedTables = allExtractedTables.length > 0;

  // Effect to render PDF pages when a document is loaded
  useEffect(() => {
    if (!pdfDoc) {
      setResolvedPages([]);
      return;
    }

    let isMounted = true;
    const pagePromises = Array.from({ length: pdfDoc.numPages }, (_, i) => {
      return pdfDoc.getPage(i + 1).then(page => {
        if (isMounted) {
          return (
            <PdfPageDisplay
              key={i + 1}
              pageNumber={i + 1}
              pdfPage={page}
              onExtractionComplete={handleExtractionComplete}
              isMergeMode={isMergeMode}
              selectedTableIds={selectedTableIds}
              onTableSelect={handleToggleTableSelection}
            />
          );
        }
        return null;
      });
    });

    Promise.all(pagePromises).then(pages => {
      if (isMounted) {
        setResolvedPages(pages.filter(p => p !== null) as React.ReactNode[]);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [pdfDoc, handleExtractionComplete, isMergeMode, selectedTableIds]);


  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-indigo-600">PDF Table Extractor AI</span>
          </div>
          <div className='flex items-center gap-4'>
             {pdfFile && (
                <button
                onClick={handleReset}
                className="px-4 py-2 bg-slate-200 text-slate-700 text-sm font-semibold rounded-md hover:bg-slate-300 transition-colors"
                >
                Start Over
                </button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        {!pdfDoc && (
          <div className="text-center">
             <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl mb-4">
              Unlock Data from Your PDFs
            </h1>
            <p className="mt-4 text-lg leading-8 text-slate-600 max-w-2xl mx-auto mb-8">
              Our AI reads protected PDF files, identifies tables, and extracts them into a format you can download as a CSV.
            </p>
            <FileUploader onFileSelect={handleFileSelect} disabled={isProcessing} />
            {isProcessing && !needsPassword && <p className="mt-4 text-slate-600">Processing PDF...</p>}
            {error && <p className="mt-4 text-red-500">{error}</p>}

            {needsPassword && (
              <div className="mt-6 max-w-sm mx-auto">
                  <form onSubmit={handlePasswordSubmit}>
                      {passwordError && (
                        <p className="text-center font-semibold text-yellow-800 bg-yellow-100 p-3 rounded-md mb-4 flex items-center justify-center gap-2">
                          <LockClosedIcon className="w-5 h-5 flex-shrink-0" />
                          <span>{passwordError}</span>
                        </p>
                      )}
                      <label htmlFor="password-input" className="sr-only">Password</label>
                      <input
                          type="password"
                          name="password"
                          id="password-input"
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full text-lg p-3 border-slate-300 rounded-md text-center bg-white [&:not(:placeholder-shown)]:bg-yellow-100 transition-colors"
                          placeholder="Enter PDF Password"
                          aria-describedby="password-error"
                          autoFocus
                      />
                      <button
                          type="submit"
                          disabled={isProcessing}
                          className="mt-3 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed"
                      >
                           {isProcessing ? <Spinner className="w-5 h-5 mr-2" /> : <LockClosedIcon className="w-5 h-5 -ml-1 mr-2" />}
                           {isProcessing ? 'Unlocking...' : 'Unlock PDF'}
                      </button>
                  </form>
              </div>
            )}
          </div>
        )}
        
        {pdfDoc && (
          <div>
            <div className="bg-white p-4 rounded-lg shadow mb-8 flex items-center justify-between gap-4 border border-slate-200 flex-wrap">
                <div className="flex items-center gap-4">
                    <FilePdfIcon className="w-8 h-8 text-red-500 flex-shrink-0" />
                    <div>
                        <h2 className="text-lg font-semibold text-slate-800">{pdfFile?.name}</h2>
                        <p className="text-sm text-slate-500">{pdfDoc.numPages} pages</p>
                    </div>
                </div>
                {hasExtractedTables && (
                    <button
                        onClick={() => setIsMergeMode(prev => !prev)}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                            isMergeMode
                            ? 'bg-slate-600 text-white hover:bg-slate-700'
                            : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                        }`}
                    >
                        <CombineIcon className="w-5 h-5" />
                        <span>{isMergeMode ? 'Cancel Merge Mode' : 'Combine Tables'}</span>
                    </button>
                )}
            </div>
            
            {isMergeMode && (
              <MergeToolbar
                selectedTables={selectedTables}
                onClearSelection={() => setSelectedTableIds(new Set())}
              />
            )}
            
            <div className="space-y-8">
                {resolvedPages}
            </div>
          </div>
        )}
      </main>
      <footer className="text-center py-4 border-t border-slate-200 bg-white">
        <p className="text-sm text-slate-500">
          Created by Gaurav Nampurkar using Google AI Studio
        </p>
      </footer>
    </div>
  );
}

export default App;