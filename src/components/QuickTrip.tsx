import React, { useState } from 'react';
import { Sparkles, Send, ArrowLeft, MessageSquare, Compass, Map as MapIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface QuickTripProps {
  onGenerate: (description: string, currency: string) => void;
  onSwitchToWizard: () => void;
  isLoading: boolean;
}

const EXAMPLE_PROMPTS = [
  "I want a 5-day budget camping trip to Sossusvlei and Swakopmund with 2 friends. We're renting a 4x4 and love adventure sports and photography. Budget is around N$15,000 total.",
  "Romantic 7-day luxury honeymoon. Fly-in safari at Etosha, hot air balloon at Sossusvlei, ending in Swakopmund. Money is no object.",
  "Solo 10-day backpacking trip through the Skeleton Coast and Damaraland. I have my own truck. I want to camp under the stars, track rhinos, and avoid tourist crowds.",
  "Family trip with 2 kids (ages 8 and 12), 14 days. We want wildlife, safe lodges, and educational experiences. Starting from Windhoek, budget around €6,000.",
];

export const QuickTrip: React.FC<QuickTripProps> = ({ onGenerate, onSwitchToWizard, isLoading }) => {
  const [description, setDescription] = useState('');
  const [currency, setCurrency] = useState('NAD');

  const handleSubmit = () => {
    if (!description.trim()) return;
    onGenerate(description.trim(), currency);
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', bounce: 0.5, delay: 0.1 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-600 rounded-[1.5rem] shadow-2xl shadow-amber-500/30 mb-6"
          >
            <Sparkles className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black text-stone-900 tracking-tight mb-4">
            Describe Your Dream Trip
          </h1>
          <p className="text-lg text-stone-500 font-medium max-w-xl mx-auto leading-relaxed">
            Just tell us what you want in plain English. Our AI will interpret your vision and architect a complete Namibian itinerary — no forms needed.
          </p>
        </div>

        {/* Main Input Card */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-stone-100 overflow-hidden">
          <div className="p-8 md:p-10">
            {/* Currency selector */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-primary" />
                <span className="text-sm font-black text-stone-400 uppercase tracking-widest">Your Vision</span>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Currency</label>
                <select
                  className="p-2 border border-stone-200 rounded-xl font-bold bg-stone-50 text-stone-700 outline-none focus:ring-2 focus:ring-primary text-sm"
                  value={currency}
                  onChange={e => setCurrency(e.target.value)}
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="NAD">NAD (N$)</option>
                </select>
              </div>
            </div>

            <textarea
              rows={6}
              className="w-full text-lg font-medium text-stone-800 bg-stone-50 rounded-2xl p-6 border-2 border-stone-100 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition resize-none placeholder:text-stone-300 leading-relaxed"
              placeholder="E.g. I want a 7-day adventure trip through the Namib desert with my partner. We love photography, star gazing, and are on a mid-range budget. Starting from Windhoek in September..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />

            <div className="flex items-center justify-between mt-6 gap-4">
              <button
                onClick={onSwitchToWizard}
                className="flex items-center gap-2 text-stone-400 hover:text-stone-700 font-bold transition text-sm"
              >
                <MapIcon className="w-4 h-4" /> Use Step-by-Step Wizard Instead
              </button>
              <button
                disabled={!description.trim() || isLoading}
                onClick={handleSubmit}
                className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-2xl font-black text-lg flex items-center gap-3 hover:from-amber-600 hover:to-orange-700 transition shadow-xl shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
              >
                {isLoading ? (
                  <>
                    <Compass className="w-6 h-6 animate-spin" /> Architecting...
                  </>
                ) : (
                  <>
                    Generate Trip <Send className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Examples Section */}
          <div className="bg-stone-50 border-t border-stone-100 p-8 md:p-10">
            <p className="text-xs font-black text-stone-400 uppercase tracking-widest mb-5 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" /> Try an example
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {EXAMPLE_PROMPTS.map((example, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.08 }}
                  onClick={() => setDescription(example)}
                  className="text-left p-4 bg-white hover:bg-amber-50 border border-stone-200 hover:border-amber-300 rounded-2xl transition text-sm font-medium text-stone-600 hover:text-stone-800 leading-relaxed shadow-sm hover:shadow-md group"
                >
                  <span className="text-amber-500 font-black mr-2 group-hover:text-amber-600">→</span>
                  {example.length > 120 ? example.substring(0, 120) + '...' : example}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
