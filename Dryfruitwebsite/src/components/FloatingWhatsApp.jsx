import { useState } from 'react';
import { X, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useWebsiteSettings } from '../context/SettingsContext';

export default function FloatingWhatsApp() {
  const { settings } = useWebsiteSettings();
  const [isOpen, setIsOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const whatsappNumber = "923265153000";

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Tooltip */}
      {!isOpen && (
        <div className="absolute bottom-full right-0 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none hidden md:block">
          <div className="bg-white text-text-dark px-4 py-2 rounded-2xl shadow-xl border border-border whitespace-nowrap flex items-center gap-2">
            <span className="w-2 h-2 bg-whatsapp rounded-full animate-pulse"></span>
            <span className="font-bold text-sm">{settings.companyName} se Rabta Karein</span>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        animate={prefersReducedMotion ? {} : {
          y: isOpen ? 0 : [0, -6, 0]
        }}
        transition={prefersReducedMotion ? {} : {
          duration: 1.5,
          repeat: isOpen ? 0 : Infinity,
          ease: "easeInOut"
        }}
        whileHover={prefersReducedMotion ? {} : { 
          scale: 1.1,
          boxShadow: '0 0 20px rgba(37, 211, 102, 0.6)'
        }}
        whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
        className={`w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 group ${
          isOpen ? 'bg-slate-900 rotate-90' : 'bg-whatsapp'
        }`}
        style={{ willChange: 'transform' }}
      >
        {isOpen ? (
          <X className="w-8 h-8 text-white" />
        ) : (
          <MessageCircle className="w-8 h-8 text-white fill-white" />
        )}
        
        {/* Notification Badge */}
        {!isOpen && (
          <motion.span 
            animate={prefersReducedMotion ? {} : {
              y: [0, -4, 0]
            }}
            transition={prefersReducedMotion ? {} : {
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute -top-1 -left-1 w-5 h-5 bg-red-500 border-2 border-white rounded-full"
          />
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.8, y: 20 }}
            animate={prefersReducedMotion ? {} : { opacity: 1, scale: 1, y: 0 }}
            exit={prefersReducedMotion ? {} : { opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-20 right-0 w-[320px] bg-white rounded-[2rem] shadow-2xl border border-border overflow-hidden"
          >
          {/* Header */}
          <div className="bg-whatsapp p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl">
                🥜
              </div>
              <div>
                <p className="font-black text-lg">{settings.companyName}</p>
                <p className="text-xs text-white/80 font-bold">Online hai - Abhi reply karenge</p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 bg-slate-50">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-4">
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                Assalam-o-Alaikum! 👋
                <br /><br />
                Hum {settings.companyName} se bol rahe hain. Hum aapki kya madad kar sakte hain?
              </p>
              <span className="text-[10px] text-slate-400 font-bold mt-2 block uppercase tracking-widest">Just now</span>
            </div>
          </div>

          {/* Action */}
          <div className="p-4 bg-white border-t border-slate-100">
            <motion.a
              whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
              href={`https://wa.me/${whatsappNumber}?text=Assalam%20o%20Alaikum!%20Mujhe%20dry%20fruits%20ke%20baare%20mein%20puchna%20hai`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full py-4 bg-whatsapp text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-green-600 transition-all shadow-lg shadow-green-100"
            >
              <MessageCircle className="w-5 h-5 fill-white" />
              Chat Shuru Karein
            </motion.a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>

      {/* Label */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div 
            initial={prefersReducedMotion ? {} : { opacity: 0, x: 10 }}
            animate={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
            exit={prefersReducedMotion ? {} : { opacity: 0, x: 10 }}
            className="absolute bottom-16 right-0 bg-white px-3 py-1.5 rounded-lg shadow-lg text-sm font-medium text-text-dark whitespace-nowrap"
          >
            Order karein! 👋
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
