interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  originalMessage?: string; // oryginalne pytanie bez kontekstu
  type: 'user' | 'assistant';
  timestamp?: number;
}

interface Source {
  PMID?: string;
  title?: string;
  abstract?: string;
  publication_date?: string;
  country?: string;
  journal?: string;
  domain_primary?: string;
  domain_secondary?: string;
  trial_population?: string;
  measured_outcomes?: string;
  observed_outcomes?: string;
  similarity?: number; // Zmienione z __nn_distance na similarity
  url?: string;
}

interface SearchParams {
  search_type: 'semantic' | 'statistical' | 'hybrid';
  query_mode: 'last' | 'all';
  top_k: number;
  alpha?: number;  // Wymagane tylko dla hybrid
}

interface SearchResponse {
  results: Source[];
  total_found: number;
}

interface ChatResponse {
  response: string;
  sources: Source[];
}

interface SearchModuleParams {
  queries: string[];
  searchType: 'semantic' | 'statistical' | 'hybrid';
  topK: number;
  alpha?: number;
}

interface SearchModuleResponse {
  results: Source[];
  total_found: number;
}

export type {
  ChatMessage,
  Source,
  SearchParams,
  SearchResponse,
  ChatResponse,
  SearchModuleParams,
  SearchModuleResponse
};
