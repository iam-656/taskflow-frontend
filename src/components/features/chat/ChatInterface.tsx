'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Bot, User } from 'lucide-react';
import { useChatMutation, useChatHistory, ChatMessage } from '@/hooks/useChat';
import { cn } from '@/lib/utils';

interface ChatInterfaceProps {
  chatId?: string;
}

export function ChatInterface({ chatId = 'default' }: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Fetch history from DB
  const { data: historyMessages, isLoading } = useChatHistory(chatId);
  const chatMutation = useChatMutation(chatId);

  // Optimistic UI state for pending message
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [historyMessages, pendingMessage]);

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || chatMutation.isPending) return;

    const messageContent = input;
    setInput('');
    setPendingMessage(messageContent);

    // Prepare history for API (limit context window if needed, here sending last 10)
    // We send the existing history + new message context
    const contextHistory = historyMessages?.slice(-10).map(m => ({
        role: m.role,
        content: m.content
    })) || [];

    chatMutation.mutate(
      { message: messageContent, history: contextHistory, context_id: chatId },
      {
        onSuccess: () => {
          setPendingMessage(null);
        },
        onError: (error) => {
          console.error("Chat Error Details:", error);
          setPendingMessage(null);
          // Ideally show a toast or error message in UI
        }
      }
    );
  };

  // Combine DB history with any optimistic/pending state if needed
  // For now, just using DB history + pending user message
  const displayMessages = historyMessages || [];

  return (
    <div className="flex flex-col h-full bg-white border-l border-r border-gray-200">
      {/* Header */}
      <header className="h-14 border-b border-gray-200 flex items-center px-4 bg-gray-50/80 backdrop-blur-sm sticky top-0 z-10">
        <Sparkles className="text-purple-600 mr-2" size={18} />
        <h2 className="font-semibold text-gray-700">TaskFlow AI</h2>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
            <div className="flex justify-center p-4 text-gray-400 text-sm">Loading history...</div>
        ) : displayMessages.length === 0 && !pendingMessage ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2">
            <Bot size={48} className="opacity-20" />
            <p className="text-sm">How can I help you manage your tasks today?</p>
          </div>
        ) : (
          <>
            {displayMessages.map((msg, idx) => (
                <MessageBubble key={msg.id || idx} role={msg.role} content={msg.content} timestamp={msg.created_at} />
            ))}
            {pendingMessage && (
                <MessageBubble role="user" content={pendingMessage} isPending />
            )}
          </>
        )}
        
        {chatMutation.isPending && (
          <div className="flex gap-3">
             <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0">
                <Bot size={16} />
              </div>
              <div className="bg-white border border-gray-200 p-3 rounded-lg rounded-tl-none shadow-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150" />
                </div>
              </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <form onSubmit={handleSendMessage} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm text-gray-900 font-medium"
            disabled={chatMutation.isPending}
          />
          <button
            type="submit"
            disabled={!input.trim() || chatMutation.isPending}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}

function MessageBubble({ role, content, timestamp, isPending }: { role: string, content: string, timestamp?: string, isPending?: boolean }) {
    const isUser = role === 'user';
    const timeDisplay = timestamp ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now';

    // Hide tool calls from the UI (e.g. >>> {"tool": ...})
    const cleanContent = content.replace(/>>>\s*{[\s\S]*?}/g, '').trim();

    if (!cleanContent && !isUser) return null; // Don't render empty assistant bubbles if only tool call

    return (
        <div
            className={cn(
            "flex gap-3 max-w-[85%]",
            isUser ? "ml-auto flex-row-reverse" : ""
            )}
        >
            {/* Avatar */}
            <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
            isUser ? "bg-blue-100 text-blue-600" : "bg-purple-100 text-purple-600"
            )}>
            {isUser ? <User size={16} /> : <Bot size={16} />}
            </div>

            {/* Bubble */}
            <div className={cn(
            "p-3 rounded-lg text-sm shadow-sm",
            isUser 
                ? "bg-blue-600 text-white rounded-tr-none" 
                : "bg-white border border-gray-200 text-gray-900 rounded-tl-none font-medium",
            isPending && "opacity-70"
            )}>
            <p className="whitespace-pre-wrap">{cleanContent || content}</p>
            <span className={cn(
                "text-[10px] mt-1 block opacity-70",
                isUser ? "text-blue-100" : "text-gray-500"
            )}>
                {timeDisplay}
            </span>
            </div>
        </div>
    );
}
