
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import type { Message } from '../types.ts';
import ChatMessage from './ChatMessage.tsx';
import Spinner from './Spinner.tsx';

interface ChatWindowProps {
  bookContent: string;
  bookTitle: string;
}

const SendIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
    </svg>
);


const ChatWindow: React.FC<ChatWindowProps> = ({ bookContent, bookTitle }) => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasSentFirstMessage, setHasSentFirstMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!process.env.API_KEY) {
        setMessages([{ role: 'model', text: 'Configuration Error: The application is missing the required API key. Please ensure it is correctly configured by the administrator.' }]);
        return;
    }

    const initChat = () => {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        const systemInstruction = `You are a helpful assistant and an expert on the book provided below. Your task is to answer the user's questions based *only* on the content of this book. Do not use any external knowledge or make assumptions beyond what is written. If the answer is not in the book, say so. Here is the book's content: \n\n---START OF BOOK---\n\n${bookContent}\n\n---END OF BOOK---`;
        
        const newChat = ai.chats.create({
          model: 'gemini-2.5-flash',
          config: {
            systemInstruction: systemInstruction,
          }
        });

        setChat(newChat);
        setMessages([
          { role: 'model', text: `I've finished reading "${bookTitle}". What would you like to know?` }
        ]);
        setHasSentFirstMessage(false);
      } catch (error) {
        console.error("Failed to initialize Gemini chat:", error);
        setMessages([{ role: 'model', text: 'Sorry, I am having trouble connecting to my brain right now. Please check the API key and refresh.' }]);
      }
    };
    initChat();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookContent, bookTitle]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(async (messageText: string) => {
    if (!messageText.trim() || isLoading || !chat) return;

    setIsLoading(true);
    setHasSentFirstMessage(true);
    const userMessage: Message = { role: 'user', text: messageText };
    setMessages(prev => [...prev, userMessage, { role: 'model', text: '' }]);

    try {
      const responseStream = await chat.sendMessageStream({ message: userMessage.text });
      
      let text = '';
      for await (const chunk of responseStream) {
        text += chunk.text;
        setMessages(prev => {
          const updatedMessages = [...prev];
          const lastMessage = updatedMessages[updatedMessages.length - 1];
          if (lastMessage && lastMessage.role === 'model') {
            lastMessage.text = text;
          }
          return updatedMessages;
        });
      }
    } catch (error) {
      console.error("Gemini API error:", error);
      const errorMessage: Message = { role: 'model', text: "Oops! Something went wrong while trying to answer. Please try again." };
      setMessages(prev => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage && lastMessage.role === 'model' && lastMessage.text === '') {
          return [...prev.slice(0, -1), errorMessage];
        }
        return [...prev, errorMessage];
      });
    } finally {
      setIsLoading(false);
    }
  }, [chat, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(currentMessage);
    setCurrentMessage('');
  };

  const suggestedPrompts = [
    "Provide a brief summary of this book.",
    "Who are the main characters?",
    "What are the key themes explored?",
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, index) => (
          <ChatMessage key={index} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>
        {!hasSentFirstMessage && messages.length === 1 && (
            <div className="p-6 pt-0">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Or try one of these prompts:</p>
                <div className="flex flex-wrap gap-2">
                    {suggestedPrompts.map(prompt => (
                        <button 
                            key={prompt} 
                            onClick={() => sendMessage(prompt)}
                            className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full text-gray-700 dark:text-gray-300 transition-colors"
                        >
                            {prompt}
                        </button>
                    ))}
                </div>
            </div>
        )}
      <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <input
            type="text"
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            placeholder={`Ask a question about "${bookTitle}"...`}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            disabled={isLoading || !chat}
            aria-label={`Ask a question about ${bookTitle}`}
          />
          <button
            type="submit"
            disabled={isLoading || !currentMessage.trim() || !chat}
            className="p-2 rounded-full text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 disabled:cursor-not-allowed transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500"
            aria-label="Send message"
          >
            {isLoading ? <Spinner /> : <SendIcon/>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;