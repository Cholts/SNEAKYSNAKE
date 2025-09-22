import React, { useState, useCallback } from 'react';

// Declare pdfjsLib from the global scope (loaded via script tag in index.html)
declare const pdfjsLib: any;


interface FileUploadProps {
  onUpload: (content: string, fileName: string) => void;
}

const UploadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-400 dark:text-gray-500">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
    </svg>
);

const FileUpload: React.FC<FileUploadProps> = ({ onUpload }) => {
  const [error, setError] = useState<string | null>(null);
  const [isReading, setIsReading] = useState(false);
  const [readingStatus, setReadingStatus] = useState<string>('Reading your book...');

  const processFile = useCallback((file: File) => {
    setError(null);

    if (file.type === 'text/plain') {
      readTxtFile(file);
    } else if (file.type === 'application/pdf') {
      readPdfFile(file);
    } else {
      setError('Please upload a valid .txt or .pdf file.');
    }
  }, [onUpload]);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

  const readTxtFile = (file: File) => {
    setIsReading(true);
    setReadingStatus('Reading your book...');
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      onUpload(text, file.name);
      setIsReading(false);
    };
    reader.onerror = () => {
      setError('Failed to read the file.');
      setIsReading(false);
    };
    reader.readAsText(file);
  };

  const readPdfFile = (file: File) => {
    if (typeof pdfjsLib === 'undefined') {
        setError('PDF library not loaded. Please refresh the page.');
        return;
    }

    setIsReading(true);
    setReadingStatus('Parsing PDF...');
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const numPages = pdf.numPages;
        let fullText = '';

        for (let i = 1; i <= numPages; i++) {
            setReadingStatus(`Reading page ${i} of ${numPages}...`);
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str).join(' ');
            fullText += pageText + '\n\n';
        }
        
        onUpload(fullText, file.name);

      } catch (pdfError) {
        console.error('Failed to parse PDF:', pdfError);
        setError('Could not read the PDF file. It might be corrupted or protected.');
      } finally {
        setIsReading(false);
      }
    };

    reader.onerror = () => {
      setError('Failed to read the file.');
      setIsReading(false);
    };

    reader.readAsArrayBuffer(file);
  };


  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
  }

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
        processFile(file);
    }
  }


  return (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center">
      <label 
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        htmlFor="file-upload" 
        className="w-full max-w-lg p-10 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-400 bg-gray-50 dark:bg-gray-700/50 transition-colors"
      >
        <div className="flex flex-col items-center">
        {isReading ? (
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        ) : (
            <UploadIcon />
        )}
          <p className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-300">
            {isReading ? readingStatus : 'Drag & drop a book file here'}
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">or click to select a file</p>
          <p className="mt-4 text-xs text-gray-400 dark:text-gray-500">Supports .txt and .pdf files</p>
          <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".txt,.pdf" disabled={isReading} />
        </div>
      </label>
      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default FileUpload;
