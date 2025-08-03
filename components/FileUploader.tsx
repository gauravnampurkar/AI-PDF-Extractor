
import React, { useCallback, useState } from 'react';
import { UploadIcon } from './icons';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  disabled: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelect, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      if (files[0].type === "application/pdf") {
        onFileSelect(files[0]);
      } else {
        alert("Please upload a PDF file.");
      }
    }
  }, [onFileSelect, disabled]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <label
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`flex justify-center w-full h-48 px-4 transition bg-white border-2 ${isDragging ? 'border-indigo-600' : 'border-slate-300'} border-dashed rounded-md appearance-none cursor-pointer hover:border-slate-400 focus:outline-none`}
      >
        <span className="flex flex-col items-center justify-center space-x-2 text-center">
          <UploadIcon className="w-12 h-12 text-slate-500" />
          <span className="font-medium text-slate-600">
            <span className="text-indigo-600">Drag & drop</span> or <span className="text-indigo-600">browse</span> to upload a PDF
          </span>
          <span className="text-sm text-slate-500">Maximum file size 10MB</span>
        </span>
        <input type="file" name="file_upload" className="hidden" accept="application/pdf" onChange={handleFileChange} disabled={disabled} />
      </label>
    </div>
  );
};

export default FileUploader;
