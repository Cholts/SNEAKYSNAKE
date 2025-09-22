import React, { useState, useCallback } from 'react';
import FileUpload from './components/FileUpload';
import ChatWindow from './components/ChatWindow';

const App: React.FC = () => {
  const [bookContent, setBookContent] = useState<string | null>(null);
  const [bookTitle, setBookTitle] = useState<string>('');

  const handleBookUpload = useCallback((content: string, title: string) => {
    setBookContent(content);
    setBookTitle(title);
  }, []);

  const handleReset = useCallback(() => {
    setBookContent(null);
    setBookTitle('');
  }, []);

  return (
    <div className="min-h-screen bg-[#f9fafb] dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col items-center justify-center p-2 sm:p-4 font-sans">
      <div className="w-full max-w-4xl h-[95vh] sm:h-[90vh] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700">
        <header className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800 flex-shrink-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
            <span className="text-indigo-500">LermaBiblio</span>Chat
          </h1>
          {bookContent && (
            <button
              onClick={handleReset}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-gray-50 dark:focus-visible:ring-offset-gray-800 transition-colors"
            >
              New Book
            </button>
          )}
        </header>
        <main className="flex-1 overflow-y-auto">
          {!bookContent ? (
            <FileUpload onUpload={handleBookUpload} />
          ) : (
            <ChatWindow bookContent={bookContent} bookTitle={bookTitle} />
          )}
        </main>
      </div>
       <footer className="text-center p-4 text-xs text-gray-500 dark:text-gray-400">
        <p>Powered by the Gemini API. Engage in a conversation with your favorite books.</p>
      </footer>
    </div>
  );
};

export default App;
