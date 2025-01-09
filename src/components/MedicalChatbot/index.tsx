'use client';

import { SearchModule } from '@/lib/search_module';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import SearchControls from '@/components/ui/SearchControls';
import StudyCard from '@/components/ui/StudyCard';
import type { Source } from '@/types';
import FormattedMessage from '@/components/ui/FormattedMessage';
import CustomTooltip from "@/components/ui/CustomTooltip";
import ChatSidebar from '@/components/ui/ChatSidebar';

interface Message {
  type: 'user' | 'assistant';
  content: string;
  timestamp?: number; // opcjonalne, do sortowania
}

interface ChatResponse {
  response: string;
  sources: Array<Source>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://vccgdem7g6.execute-api.eu-north-1.amazonaws.com/dev';



const BANNER_HEIGHT = 40;
const SCROLL_THRESHOLD = 50;
const SCROLL_DEBOUNCE = 500;
const searchModule = new SearchModule();

const MedicalChatbot = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sources, setSources] = useState<Source[]>([]);
  const [selectedStudy, setSelectedStudy] = useState<Source | null>(null);
  const [isTableExpanded, setIsTableExpanded] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastScrollPosition = useRef(0);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const isScrollingUp = useRef(false);
  const [searchType, setSearchType] = useState<'semantic' | 'statistical' | 'hybrid'>('hybrid');
  const [topK, setTopK] = useState(12);
  const [queryMode, setQueryMode] = useState<'last' | 'all'>('all');
  const [alpha, setAlpha] = useState<number>(0.65);

const handleNewChat = () => {
    setMessages([]);
    setSources([]);
    setInputValue('');
    setHasInteracted(false);
  };

const columns = [
  {
    key: 'index', // zmiana z 'similarity'
    label: 'Lp.',
    width: '60px', // możemy zmniejszyć szerokość, bo liczby porządkowe będą krótsze
    format: (_: unknown, index: number) => (index + 1), // formatowanie zwraca numer porządkowy
  },
  {
    key: 'PMID',
    label: 'PMID',
    width: '100px',
    format: (value: string) => value || 'N/A',
  },
  {
    key: 'domain_primary',
    label: 'Dziedzina',
    width: '120px',
    format: (value: string) => value || 'N/A',
  },
  {
    key: 'title',
    label: 'Tytuł',
    width: '400px',
    format: (value: string) => value || 'N/A',
  },
];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const scrollArea = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (!scrollArea) return;

    const handleScroll = () => {
      const currentScroll = scrollArea.scrollTop;
      const isScrollingUp = currentScroll < lastScrollPosition.current;

      if (currentScroll < SCROLL_THRESHOLD || (isScrollingUp && currentScroll < SCROLL_THRESHOLD * 2)) {
        setShowBanner(true);
      } else if (currentScroll > SCROLL_THRESHOLD && !isScrollingUp) {
        setShowBanner(false);
      }

      lastScrollPosition.current = currentScroll;
    };

    const debouncedHandleScroll = debounce(handleScroll, 10);
    scrollArea.addEventListener('scroll', debouncedHandleScroll);

    return () => {
      scrollArea.removeEventListener('scroll', debouncedHandleScroll);
    };
}, [debounce, setShowBanner]);


  type DebouncedFunction = (...args: unknown[]) => void;

  const debounce = useCallback((func: DebouncedFunction, wait: number): DebouncedFunction => {
      let timeout: NodeJS.Timeout;
      return (...args: unknown[]) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
      };
    }, []);

  const prepareConversationHistory = () => {
  return messages.map(msg => ({
    role: msg.type,
    content: msg.content
  }));
};

const handleSendMessage = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!inputValue.trim()) return;

  setIsLoading(true);
  setHasInteracted(true);

  const newMessage = {
    type: 'user' as const,
    role: 'user' as const,
    content: inputValue.trim(),
    originalMessage: inputValue.trim(),
    timestamp: Date.now()
  };

  setMessages(prev => [...prev, newMessage]);

  try {
    console.log('Sending request to:', `${API_URL}/chat`);

    const requestBody = {
      message: inputValue,
      conversationHistory: messages,
      searchParams: {
        search_type: searchType,
        query_mode: queryMode,
        top_k: topK,
        alpha: searchType === 'hybrid' ? alpha : undefined
      }
    };

    const response = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': window.location.origin
      },
      credentials: 'include',
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json() as ChatResponse;
    console.log('Response data:', data);

    if (data.error) {
      throw new Error(data.error);
    }

    setSources(data.sources || []);
    setMessages(prev => [...prev, {
      type: 'assistant',
      role: 'assistant',
      content: data.response,
      timestamp: Date.now()
    }]);

  } catch (error) {
    console.error('Error:', error);
    setMessages(prev => [...prev, {
      type: 'assistant',
      role: 'assistant',
      content: `Błąd połączenia z API: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: Date.now()
    }]);
  } finally {
    setIsLoading(false);
    setInputValue('');
  }
};

  return (
    <div className="h-screen bg-white flex flex-col">
     <ChatSidebar onNewChat={handleNewChat} />
     <SearchControls
      searchType={searchType}
      setSearchType={setSearchType}
      topK={topK}
      setTopK={setTopK}
      queryMode={queryMode}
      setQueryMode={setQueryMode}
      alpha={alpha}
      setAlpha={setAlpha}
      />
      <div
        className={`fixed top-0 left-0 right-0 z-50 bg-blue-900 transition-transform duration-200
          ${showBanner ? 'translate-y-0' : '-translate-y-full'}`}
        style={{ height: BANNER_HEIGHT }}
      >
        <div className="h-full px-6 flex items-center">
          <span className="text-sm text-white flex-1 text-center">
            Dostęp bezpłatny ograniczony do 3 zapytań na dobę
          </span>
          <button className="text-sm bg-transparent hover:bg-blue-800 px-4 py-1 rounded-lg border border-white text-white transition-colors">
            Zaloguj
          </button>
        </div>
      </div>

      <div
        className="flex-1 flex flex-col max-w-6xl mx-auto w-full overflow-hidden transition-[margin] duration-200"
        style={{ marginTop: showBanner ? BANNER_HEIGHT : 0 }}
      >
        <div className="bg-white px-6 border-b border-gray-100 py-4">
          <div className="relative">
            <h1 className="text-xl text-gray-800 tracking-wide">
              <span className="font-bold">omega3</span>
              <span className="font-light">gpt.pl</span>
            </h1>
            <div className="w-1/3 h-px bg-gray-200 mt-2"></div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden" ref={scrollAreaRef}>
          <ScrollArea className="h-full">
            <div className="px-6">
              <div className="py-4">
                <div className="text-right">
                  <h2 className="text-lg text-gray-800 font-light">
                    Czatuj z badaniami klinicznymi na temat Omega-3
                  </h2>
                  <h2 className="text-lg text-red-600 font-light">
                    Niech fakty naukowe wyniosą Twój biznes na wyższy poziom
                  </h2>
                  <div className="w-2/3 h-px bg-gray-200 mt-2 ml-auto"></div>
                </div>
              </div>

              <div className={`p-4 ${messages.length > 0 ? 'bg-gray-50 rounded-xl' : ''}`}>
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`mb-4 p-3 rounded-xl max-w-[80%] ${
                          message.type === 'user'
                            ? 'ml-auto bg-blue-50'
                            : 'bg-white border border-gray-200 shadow-sm'
                        }`}
                      >
                        <FormattedMessage
                          content={message.content}
                          type={message.type}
                        />
                      </div>
                ))}
                {isLoading && (
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <div className="animate-bounce">●</div>
                    <div className="animate-bounce delay-100">●</div>
                    <div className="animate-bounce delay-200">●</div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
          </ScrollArea>
        </div>

        <footer className="w-full px-6 border-t border-gray-200">
          <div className="flex gap-3 my-6">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(e)}
              placeholder="Wpisz zapytanie..."
              className="flex-1 p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50 shadow-sm text-gray-900"
            />
            <button
              onClick={handleSendMessage}
              className="px-8 bg-blue-900 text-white rounded-xl hover:bg-blue-800 shadow-sm flex items-center justify-center"
            >
              <Send className="w-4 h-4 mr-2" />
              Wyślij
            </button>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => setIsTableExpanded(!isTableExpanded)}
              className="bg-blue-900 hover:bg-blue-800 text-white rounded-lg w-8 h-8 flex items-center justify-center transition-colors border-2 border-blue-900 hover:border-blue-800"
            >
              {isTableExpanded ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M6 9L12 15L18 9"/>
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M18 15L12 9L6 15"/>
                </svg>
              )}
            </button>
            <h2 className="text-sm text-gray-400">
              {hasInteracted ? (sources.length > 0 ? 'Badania kliniczne użyte do udzielenia odpowiedzi' : 'Przykładowe badania kliniczne') : 'Lista badań'}
            </h2>
          </div>

          <div className={`${isTableExpanded ? 'h-[420px]' : 'h-32'} rounded-xl shadow-lg bg-white transition-all duration-300`}>
            <div className="w-full h-full relative">
              <div className="sticky top-0 bg-gray-50 z-10">
                <table className="w-full table-fixed">
                  <thead>
                    <tr>
                      {columns.map((column) => (
                        <th
                          key={column.key}
                          style={{ width: column.width }}
                          className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {column.label}
                        </th>
                      ))}
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                        Link
                      </th>
                    </tr>
                  </thead>
                </table>
              </div>
              <ScrollArea className="h-[calc(100%-36px)]">
                <table className="w-full table-fixed">
                    <tbody className="divide-y divide-gray-200">
                      {sources.map((result, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          {columns.map((column) => (
                            <td
                              key={`${index}-${column.key}`}
                              style={{ width: column.width }}
                              className="px-4 py-2 text-sm text-gray-900 truncate"
                            >
                              {column.key === 'title' ? (
                                  <CustomTooltip
                                    text={result.title || ''}
                                    onClick={() => setSelectedStudy(result)}
                                  >
                                    <span className="block truncate">
                                      {column.format(result[column.key], index)}
                                    </span>
                                  </CustomTooltip>
                                ) : (
                                  column.format(result[column.key], index)
)}
                            </td>
                          ))}
                          <td className="px-4 py-2 text-sm w-20">
                            <button
                              onClick={() => setSelectedStudy(result)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Pokaż
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                </table>
              </ScrollArea>
            </div>
          </div>
        </footer>
      </div>
      {selectedStudy && (
        <StudyCard
          study={selectedStudy}
          onClose={() => setSelectedStudy(null)}
        />
      )}
    </div>
  );
};

export default MedicalChatbot;
