
import React from 'react';
import type { Message } from '../types';

interface ChatMessageProps {
  message: Message;
  isLoading?: boolean;
}

const UserIcon: React.FC = () => (
  <div className="w-8 h-8 rounded-full bg-indigo-500 flex-shrink-0 flex items-center justify-center">
    <span className="text-white font-bold text-sm">U</span>
  </div>
);

const ModelIcon: React.FC = () => (
    <div className="w-8 h-8 rounded-full bg-gray-600 flex-shrink-0 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
    </div>
);


const ChatMessage: React.FC<ChatMessageProps> = ({ message, isLoading = false }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && <ModelIcon />}
      <div className={`max-w-xl px-4 py-3 rounded-2xl ${
        isUser
          ? 'bg-indigo-600 text-white rounded-br-none'
          : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
      }`}>
        {isLoading ? (
            <div className="flex items-center space-x-1">
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></span>
            </div>
        ) : (
            <p className="text-sm whitespace-pre-wrap">{message.text}</p>
        )}
      </div>
      {isUser && <UserIcon />}
    </div>
  );
};

export default ChatMessage;
