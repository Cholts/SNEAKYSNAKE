
import React, { useState, useCallback } from 'react';
import type { Message } from '../types.ts';

const UserIcon: React.FC = () => (
  <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/60 flex-shrink-0 flex items-center justify-center border border-indigo-200 dark:border-indigo-800">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-indigo-500 dark:text-indigo-400">
      <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
    </svg>
  </div>
);

const ModelIcon: React.FC = () => (
    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-900/60 flex-shrink-0 flex items-center justify-center border border-gray-200 dark:border-gray-700">
       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-indigo-500 dark:text-indigo-400">
          <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.348 2.595.341 1.24 1.518 1.905 2.66 1.905H6.44l4.5 4.5c.944.945 2.56.276 2.56-1.06V4.06Z" />
          <path d="M17.25 7.5a.75.75 0 0 0 0 1.5h.75a.75.75 0 0 0 0-1.5h-.75Zm0 4.5a.75.75 0 0 0 0 1.5h.75a.75.75 0 0 0 0-1.5h-.75Zm0 4.5a.75.75 0 0 0 0 1.5h.75a.75.75 0 0 0 0-1.5h-.75Z" />
        </svg>
    </div>
);

const CopyIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v3.042m-7.416 0v3.042c0 .212.03.418.084.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
    </svg>
);

const CheckIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
);


const ChatMessage: React.FC<{ message: Message }> = ({ message }) => {
  const isUser = message.role === 'user';
  const showTypingIndicator = message.role === 'model' && message.text === '';
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    if (message.text) {
      navigator.clipboard.writeText(message.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [message.text]);

  return (
    <div className={`flex items-start gap-3 group animate-[fade-in_0.3s_ease-out] ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && <ModelIcon />}
      <div className={`max-w-xl px-4 py-3 rounded-2xl relative ${
        isUser
          ? 'bg-indigo-600 text-white rounded-br-none'
          : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
      }`}>
        {showTypingIndicator ? (
            <div className="flex items-center space-x-1">
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></span>
            </div>
        ) : (
            <p className="text-sm whitespace-pre-wrap">{message.text}</p>
        )}
        {!isUser && !showTypingIndicator && message.text && (
            <button
                onClick={handleCopy}
                className="absolute -top-2 -right-2 p-1 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                aria-label="Copy message"
            >
                {copied ? <CheckIcon /> : <CopyIcon />}
            </button>
        )}
      </div>
      {isUser && <UserIcon />}
    </div>
  );
};

export default ChatMessage;