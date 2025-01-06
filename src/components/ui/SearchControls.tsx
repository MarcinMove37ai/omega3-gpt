import React from 'react';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Layers, History, Settings } from 'lucide-react';
import type { SearchParams } from '@/types';

interface SearchControlsProps {
  searchType: 'semantic' | 'statistical' | 'hybrid';
  setSearchType: (type: 'semantic' | 'statistical' | 'hybrid') => void;
  topK: number;
  setTopK: (value: number) => void;
  queryMode: 'last' | 'all';
  setQueryMode: (mode: 'last' | 'all') => void;
  alpha?: number;
  setAlpha?: (value: number) => void;
}

const SearchControls: React.FC<SearchControlsProps> = ({
  searchType,
  setSearchType,
  topK,
  setTopK,
  queryMode,
  setQueryMode,
  alpha = 0.5,
  setAlpha
}) => {
  const searchTypes = [
    { id: 'semantic' as const, label: 'Semantyczne', icon: Layers },
    { id: 'statistical' as const, label: 'Statystyczne', icon: History },
    { id: 'hybrid' as const, label: 'Hybrydowe', icon: Settings }
  ];

  const queryModes = [
    { id: 'last' as const, label: 'Ostatnie pytanie', description: 'Wyszukaj tylko na podstawie ostatniego pytania' },
    { id: 'all' as const, label: 'Cała konwersacja', description: 'Uwzględnij kontekst całej rozmowy' }
  ];

  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2 translate-x-[99%] hover:translate-x-0 transition-all duration-300 z-10">
      <Card className="w-64 h-[80vh] bg-white/50 backdrop-blur-sm shadow-lg relative rounded-l-lg">
        <div className="p-4 space-y-6">
          {/* Tryb zapytań */}
          <div className="space-y-2">
            <h3 className="text-sm text-gray-500 font-medium mb-2">Tryb zapytań</h3>
            <div className="flex flex-col gap-2">
              {queryModes.map(({id, label, description}) => (
                <button
                  key={id}
                  onClick={() => setQueryMode(id)}
                  className={`p-3 rounded-lg text-left transition-colors ${
                    queryMode === id
                      ? 'bg-blue-900 text-white'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="text-sm font-medium">{label}</div>
                  <div className={`text-xs mt-1 ${queryMode === id ? 'text-blue-100' : 'text-gray-500'}`}>
                    {description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Metoda wyszukiwania */}
          <div className="space-y-2">
            <h3 className="text-sm text-gray-500 font-medium mb-2">Metoda wyszukiwania</h3>
            <div className="flex flex-col gap-2">
              {searchTypes.map(({id, label, icon: Icon}) => (
                <button
                  key={id}
                  onClick={() => setSearchType(id)}
                  className={`p-3 rounded-lg transition-colors flex items-center gap-3 ${
                    searchType === id
                      ? 'bg-blue-900 text-white'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={18} />
                  <span className="text-sm">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Liczba wyników */}
          <div className="space-y-2">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm text-gray-500 font-medium">Liczba wyników</h3>
              <span className="text-sm font-medium text-blue-900">{topK}</span>
            </div>
            <Slider
              value={[topK]}
              onValueChange={(values) => setTopK(values[0])}
              min={1}
              max={20}
              step={1}
              className="w-full"
            />
          </div>

          {/* Parametr alpha dla trybu hybrydowego */}
          {searchType === 'hybrid' && setAlpha && (
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm text-gray-500 font-medium">Waga semantyczna</h3>
                <span className="text-sm font-medium text-blue-900">{alpha.toFixed(2)}</span>
              </div>
              <Slider
                value={[alpha * 100]}
                onValueChange={(values) => setAlpha(values[0] / 100)}
                min={0}
                max={100}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Statystyczne</span>
                <span>Semantyczne</span>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default SearchControls;
