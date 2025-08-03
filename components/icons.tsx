import React from 'react';

export const UploadIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);

export const FilePdfIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

export const CsvIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

export const MagicWandIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104l-1.12 2.24a1.5 1.5 0 001.06 1.95l2.4.6a1.5 1.5 0 011.06 1.95l-1.12 2.24M14.25 3.104l1.12 2.24a1.5 1.5 0 01-1.06 1.95l-2.4.6a1.5 1.5 0 00-1.06 1.95l1.12 2.24M5.25 6.75l-1.12 2.24a1.5 1.5 0 001.06 1.95l2.4.6a1.5 1.5 0 011.06 1.95l-1.12 2.24M19.75 6.75l-1.12 2.24a1.5 1.5 0 001.06 1.95l2.4.6a1.5 1.5 0 011.06 1.95l-1.12 2.24M12 21.75l-1.12-2.24a1.5 1.5 0 011.06-1.95l2.4-.6a1.5 1.5 0 001.06-1.95l-1.12-2.24" />
    </svg>
);

export const CombineIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-4.586a1 1 0 01.293-.707l5.414-5.414a1 1 0 011.414 0l.293.293a1 1 0 010 1.414L10.414 13H15m-3 4v-4m0 4h.01" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const LockClosedIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v2H5a1 1 0 00-1 1v7a1 1 0 001 1h10a1 1 0 001-1V9a1 1 0 00-1-1h-1V6a4 4 0 00-4-4zm-2 4V6a2 2 0 114 0v2H8z" clipRule="evenodd" />
    </svg>
);