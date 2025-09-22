import React, { useState, useCallback } from 'react';
import FileUpload from './components/FileUpload';
import ChatWindow from './components/ChatWindow';

type View = 'landing' | 'chat';

const LandingPage: React.FC<{ onStart: () => void }> = ({ onStart }) => (
  <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 animate-fade-in">
    <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 dark:text-white">
      <span className="text-indigo-500">LermaBiblio</span>Chat
    </h1>
    <p className="mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
      Converse with your documents. Upload a book or paper in `.txt` or `.pdf` format and get answers, summaries, and insights instantly.
    </p>
    <button
      onClick={onStart}
      className="mt-8 px-8 py-3 text-lg font-semibold text-white bg-indigo-600 rounded-lg shadow-lg hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-gray-50 dark:focus-visible:ring-offset-gray-800 transition-transform transform hover:scale-105"
    >
      Start a New Chat &rarr;
    </button>
  </div>
);

const App: React.FC = () => {
  const [view, setView] = useState<View>('landing');
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
  
  const goToHome = useCallback(() => {
    handleReset();
    setView('landing');
  }, [handleReset]);

  return (
    <div className="min-h-screen bg-[#f9fafb] dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col items-center justify-center p-2 sm:p-4 font-sans">
      <div className="w-full max-w-4xl h-[95vh] sm:h-[90vh] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700">
        {view === 'chat' && (
           <header className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800 flex-shrink-0">
            <button onClick={goToHome} className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white hover:opacity-80 transition-opacity">
              <span className="text-indigo-500">LermaBiblio</span>Chat
            </button>
            {bookContent && (
              <button
                onClick={handleReset}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-gray-50 dark:focus-visible:ring-offset-gray-800 transition-colors"
              >
                Upload New Book
              </button>
            )}
          </header>
        )}
        <main className="flex-1 overflow-y-auto">
          {view === 'landing' && <LandingPage onStart={() => setView('chat')} />}
          {view === 'chat' && !bookContent && <FileUpload onUpload={handleBookUpload} />}
          {view === 'chat' && bookContent && <ChatWindow key={bookTitle} bookContent={bookContent} bookTitle={bookTitle} />}
        </main>
      </div>
       <footer className="text-center p-4 text-xs text-gray-500 dark:text-gray-400">
        <p>Powered by the Gemini API. Engage in a conversation with your favorite books.</p>
      </footer>
    </div>
  );
};

export default App;
