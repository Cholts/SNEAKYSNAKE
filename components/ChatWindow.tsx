
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import type { Message } from '../types';
import { Role } from '../types';
import ChatMessage from './ChatMessage';
import Spinner from './Spinner';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMessage.trim() || isLoading || !chat) return;

    const userMessage: Message = { role: 'user', text: currentMessage };
    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);

    try {
      const response = await chat.sendMessage({ message: userMessage.text });
      const modelMessage: Message = { role: 'model', text: response.text };
      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error("Gemini API error:", error);
      const errorMessage: Message = { role: 'model', text: "Oops! Something went wrong while trying to answer." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [currentMessage, isLoading, chat]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, index) => (
          <ChatMessage key={index} message={msg} />
        ))}
        {isLoading && <ChatMessage message={{ role: 'model', text: '...' }} isLoading={true} />}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <input
            type="text"
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            placeholder={`Ask a question about "${bookTitle}"...`}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            disabled={isLoading || !chat}
          />
          <button
            type="submit"
            disabled={isLoading || !currentMessage.trim() || !chat}
            className="p-2 rounded-full text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {isLoading ? <Spinner /> : <SendIcon/>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
