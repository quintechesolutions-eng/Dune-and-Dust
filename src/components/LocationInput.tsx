import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { autocompleteLocations, LocationSuggestion } from '../services/locationIQ';

interface LocationInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (suggestion: LocationSuggestion) => void;
  placeholder?: string;
  className?: string;
  icon?: React.ElementType;
}

export const LocationInput: React.FC<LocationInputProps> = ({
  value,
  onChange,
  onSelect,
  placeholder = "Search location...",
  className = "",
  icon: Icon = MapPin
}) => {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    onChange(query);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (query.length < 3) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    setIsOpen(true);

    debounceTimer.current = setTimeout(async () => {
      const results = await autocompleteLocations(query);
      setSuggestions(results);
      setIsLoading(false);
    }, 500);
  };

  const handleSelect = (suggestion: LocationSuggestion) => {
    onSelect(suggestion);
    setIsOpen(false);
    setSuggestions([]);
  };

  const clearInput = () => {
    onChange('');
    setSuggestions([]);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div className="relative group">
        <Icon className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${isOpen ? 'text-amber-500' : 'text-stone-400'}`} />
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => value.length >= 3 && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full p-4 pl-12 pr-12 border border-stone-200 bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition rounded-2xl font-bold text-stone-700 shadow-sm hover:border-stone-300"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {isLoading ? (
            <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
          ) : value ? (
            <button onClick={clearInput} className="p-1 hover:bg-stone-100 rounded-full transition-colors">
              <X className="w-4 h-4 text-stone-400" />
            </button>
          ) : (
            <Search className="w-4 h-4 text-stone-300" />
          )}
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (suggestions.length > 0 || isLoading) && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 5, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute z-[1000] w-full mt-2 bg-white rounded-2xl shadow-2xl border border-stone-100 overflow-hidden"
          >
            {isLoading && suggestions.length === 0 ? (
              <div className="p-8 text-center">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-2" />
                <p className="text-stone-400 text-sm font-bold uppercase tracking-widest">Searching horizons...</p>
              </div>
            ) : (
              <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={suggestion.place_id || idx}
                    onClick={() => handleSelect(suggestion)}
                    className="w-full text-left p-4 hover:bg-amber-50 transition-colors flex items-start gap-4 border-b border-stone-50 last:border-0 group"
                  >
                    <div className="mt-1 bg-stone-100 p-2 rounded-lg group-hover:bg-white transition-colors">
                      <MapPin className="w-4 h-4 text-stone-500 group-hover:text-amber-500" />
                    </div>
                    <div>
                      <div className="font-bold text-stone-800 group-hover:text-amber-700 transition-colors">
                        {suggestion.address.name || suggestion.display_name.split(',')[0]}
                      </div>
                      <div className="text-xs font-medium text-stone-400 line-clamp-1 group-hover:text-stone-500 transition-colors">
                        {suggestion.display_name}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
            <div className="bg-stone-50 p-2 px-4 border-t border-stone-100 flex justify-between items-center">
              <span className="text-[9px] font-black text-stone-300 uppercase tracking-widest">Powered by LocationIQ</span>
              <span className="text-[9px] font-black text-amber-500/50 uppercase tracking-widest">Select a destination</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
