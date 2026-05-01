import React from 'react';
import { Twitter, Facebook, Instagram, Link2, Share2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SocialShareProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url: string;
}

export const SocialShare: React.FC<SocialShareProps> = ({ isOpen, onClose, title, url }) => {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(`Check out my Namibian Safari Architect journey: ${title}`);

  const shares = [
    { name: 'Twitter', icon: Twitter, color: 'bg-[#1DA1F2]', link: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}` },
    { name: 'Facebook', icon: Facebook, color: 'bg-[#4267B2]', link: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
    { name: 'Instagram', icon: Instagram, color: 'bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]', link: '#' }, // Instagram usually requires manual post
  ];

  const copyLink = () => {
    navigator.clipboard.writeText(url);
    alert("Blueprint link copied to clipboard!");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
          >
            <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
               <h3 className="font-black text-stone-900 flex items-center gap-2">
                 <Share2 className="w-4 h-4 text-primary" /> Broadcast Journey
               </h3>
               <button onClick={onClose} className="p-2 hover:bg-stone-200 rounded-full transition">
                 <X className="w-4 h-4" />
               </button>
            </div>

            <div className="p-6 space-y-6">
               <div className="grid grid-cols-3 gap-4">
                  {shares.map(s => (
                    <a 
                      key={s.name}
                      href={s.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center gap-2 group"
                    >
                      <div className={`w-12 h-12 ${s.color} text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:-translate-y-1 transition`}>
                        <s.icon className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-bold text-stone-400 tracking-widest uppercase">{s.name}</span>
                    </a>
                  ))}
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest px-2">Mission Link</label>
                  <div className="flex bg-stone-50 border border-stone-200 rounded-xl overflow-hidden p-1 shadow-inner">
                     <input 
                      readOnly 
                      value={url} 
                      className="flex-1 bg-transparent px-3 py-2 text-xs font-medium text-stone-500 overflow-hidden text-ellipsis"
                     />
                     <button 
                      onClick={copyLink}
                      className="bg-white hover:bg-stone-50 text-primary p-2 rounded-lg border border-stone-100 shadow-sm transition"
                     >
                        <Link2 className="w-4 h-4" />
                     </button>
                  </div>
               </div>
            </div>

            <div className="p-4 bg-stone-50 text-center">
               <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest leading-loose">
                 Invite your crew to join the <br/> Namibian Expedition
               </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
