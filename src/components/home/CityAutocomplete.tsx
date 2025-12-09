import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Loader2, MapPin, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CitySuggestion {
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
}

interface CityAutocompleteProps {
  value: string;
  apiKey: string;
  onSelect: (city: CitySuggestion) => void;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

const GEO_API_BASE = 'https://api.openweathermap.org/geo/1.0';

export function CityAutocomplete({
  value,
  apiKey,
  onSelect,
  onChange,
  disabled,
  placeholder = 'Cari kota...',
  className,
}: CityAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch city suggestions
  const fetchSuggestions = async (query: string) => {
    if (!query || query.length < 2 || !apiKey) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const url = `${GEO_API_BASE}/direct?q=${encodeURIComponent(query)}&limit=5&appid=${apiKey}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        console.warn('[CityAutocomplete] API error:', response.status);
        setSuggestions([]);
        return;
      }

      const data = await response.json();
      setSuggestions(data.map((item: any) => ({
        name: item.name,
        country: item.country,
        state: item.state,
        lat: item.lat,
        lon: item.lon,
      })));
      setShowSuggestions(true);
    } catch (error) {
      console.error('[CityAutocomplete] Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [value, apiKey]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => 
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[highlightedIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleSelect = (city: CitySuggestion) => {
    onSelect(city);
    onChange(`${city.name}, ${city.country}`);
    setShowSuggestions(false);
    setHighlightedIndex(-1);
  };

  const formatCityLabel = (city: CitySuggestion) => {
    let label = city.name;
    if (city.state) label += `, ${city.state}`;
    label += `, ${city.country}`;
    return label;
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          className={cn("h-12 rounded-xl bg-background border-border pl-10 pr-10", className)}
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-xl shadow-lg overflow-hidden">
          {suggestions.map((city, index) => (
            <button
              key={`${city.name}-${city.lat}-${city.lon}`}
              type="button"
              onClick={() => handleSelect(city)}
              className={cn(
                "w-full px-4 py-3 flex items-center gap-3 text-left transition-colors",
                "hover:bg-accent/50",
                highlightedIndex === index && "bg-accent/50"
              )}
            >
              <MapPin className="h-4 w-4 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{city.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {city.state ? `${city.state}, ` : ''}{city.country}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {showSuggestions && !isLoading && value.length >= 2 && suggestions.length === 0 && apiKey && (
        <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-xl shadow-lg p-4">
          <p className="text-sm text-muted-foreground text-center">
            Tidak ada kota ditemukan
          </p>
        </div>
      )}
    </div>
  );
}
