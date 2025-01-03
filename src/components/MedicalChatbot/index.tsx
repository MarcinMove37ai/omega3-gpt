'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  type: 'user' | 'bot';
  content: string;
}

interface ChatResponse {
  response: string;
  sources: Array<any>;
}

// Example records to show after first interaction
const exampleRecords = [
  {
    PMID: "10799369",
    title: "Oczyszczone kwasy eikozapentaenowy i dokozaheksaenowy mają różne efekty na lipidy i lipoproteiny w surowicy, wielkość cząsteczek LDL, glukozę i insulinę u mężczyzn z łagodną hiperlipidemią.",
    domain_primary: "kardiologia",
    domain_secondary: "lipidy, lipoproteiny, metabolizm glukozy",
    __nn_distance: 0.2,
    url: "https://pubmed.ncbi.nlm.nih.gov/10799369"
  },
  {
    PMID: "10097422",
    title: "Wpływ suplementacji diety rybami na poziomy lipidów",
    domain_primary: "kardiologia",
    domain_secondary: "hiperlipoproteinemia",
    __nn_distance: 0.25,
    url: "https://pubmed.ncbi.nlm.nih.gov/10097422"
  },
  {
    PMID: "10232625",
    title: "Wpływ diety bogatej w kwas alfa-linolenowy na poziom lipidów",
    domain_primary: "kardiologia",
    domain_secondary: "czynniki ryzyka zakrzepicy",
    __nn_distance: 0.3,
    url: "https://pubmed.ncbi.nlm.nih.gov/10232625"
  },
  // Dodaj pozostałe 9 rekordów z podobnymi danymi
  {
    PMID: "10356659",
    title: "Wspólne działanie inhibitorów reduktazy HMG-CoA i kwasów omega-3",
    domain_primary: "kardiologia",
    domain_secondary: "hiperlipidemia",
    __nn_distance: 0.28,
    url: "https://pubmed.ncbi.nlm.nih.gov/10356659"
  },
  {
    PMID: "12518167",
    title: "Wpływ oleju rybnego na utlenianie LDL",
    domain_primary: "kardiologia",
    domain_secondary: "miażdżyca",
    __nn_distance: 0.32,
    url: "https://pubmed.ncbi.nlm.nih.gov/12518167"
  },
  {
    PMID: "12530552",
    title: "Wpływ EPA na średnią objętość płytek krwi",
    domain_primary: "kardiologia",
    domain_secondary: "funkcja płytek krwi",
    __nn_distance: 0.27,
    url: "https://pubmed.ncbi.nlm.nih.gov/12530552"
  },
  {
    PMID: "12558058",
    title: "Wpływ spożycia kwasu alfa-linolenowego na ryzyko chorób serca",
    domain_primary: "kardiologia",
    domain_secondary: "choroba wieńcowa",
    __nn_distance: 0.22,
    url: "https://pubmed.ncbi.nlm.nih.gov/12558058"
  },
  {
    PMID: "12576957",
    title: "Żywienie dojelitowe z kwasem eikozapentaenowym",
    domain_primary: "pulmonologia",
    domain_secondary: "ostry zespół niewydolności oddechowej",
    __nn_distance: 0.35,
    url: "https://pubmed.ncbi.nlm.nih.gov/12576957"
  },
  {
    PMID: "12583947",
    title: "Związek kwasów tłuszczowych omega-3 z trwałością blaszek miażdżycowych",
    domain_primary: "kardiologia",
    domain_secondary: "miażdżyca",
    __nn_distance: 0.24,
    url: "https://pubmed.ncbi.nlm.nih.gov/12583947"
  },
  {
    PMID: "10419086",
    title: "Podawanie kwasu dokozaheksaenowego wpływa na zmiany zachowania",
    domain_primary: "neurologia",
    domain_secondary: "stres psychologiczny",
    __nn_distance: 0.31,
    url: "https://pubmed.ncbi.nlm.nih.gov/10419086"
  },
  {
    PMID: "10232627",
    title: "Spożycie diety z kwasem alfa-linolenowym a ryzyko chorób serca",
    domain_primary: "kardiologia",
    domain_secondary: "choroba niedokrwienna serca",
    __nn_distance: 0.29,
    url: "https://pubmed.ncbi.nlm.nih.gov/10232627"
  },
  {
    PMID: "12583947",
    title: "Wpływ kwasów omega-3 na stabilność blaszek miażdżycowych",
    domain_primary: "kardiologia",
    domain_secondary: "miażdżyca",
    __nn_distance: 0.26,
    url: "https://pubmed.ncbi.nlm.nih.gov/12583947"
  }
];

const BANNER_HEIGHT = 40;
const SCROLL_THRESHOLD = 50;
const SCROLL_DEBOUNCE = 50;

const MedicalChatbot = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sources, setSources] = useState<Array<any>>([]);
  const [isTableExpanded, setIsTableExpanded] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastScrollPosition = useRef(0);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const isScrollingUp = useRef(false);

  const columns = [
    {
      key: '__nn_distance',
      label: 'SIM',
      width: '80px',
      format: (value: number) => (typeof value === 'number' ? (1 - value).toFixed(4) : 'N/A'),
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
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(null, args), wait);
    };
  };

  const prepareConversationHistory = () => {
    return messages.map(msg => ({
      role: msg.type === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const userInput = inputValue.trim();
    if (!userInput) return;

    setHasInteracted(true);
    setMessages(prev => [...prev, { type: 'user', content: userInput }]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userInput,
          conversationHistory: prepareConversationHistory()
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data: ChatResponse = await response.json();
      setMessages(prev => [...prev, { type: 'bot', content: data.response }]);
      setSources(data.sources?.length > 0 ? data.sources : []);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        type: 'bot',
        content: 'Przepraszamy, wystąpił błąd podczas przetwarzania zapytania. Spróbuj ponownie później.'
      }]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="h-screen bg-white flex flex-col">
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
                        ? 'ml-auto bg-blue-50 text-gray-800'
                        : 'bg-white border border-gray-200 text-gray-800 shadow-sm'
                    }`}
                  >
                    {message.content}
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
                    {(hasInteracted ? (sources.length > 0 ? sources : exampleRecords) : []).map((result, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        {columns.map((column) => (
                          <td
                            key={`${index}-${column.key}`}
                            style={{ width: column.width }}
                            className="px-4 py-2 text-sm text-gray-900 truncate"
                          >
                            {column.format(result[column.key])}
                          </td>
                        ))}
                        <td className="px-4 py-2 text-sm w-20">
                          <a
                            href={result.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Otwórz
                          </a>
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
    </div>
  );
};

export default MedicalChatbot;