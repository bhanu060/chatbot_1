import { useState } from 'react';
import ScreenCapture from './components/ScreenCapture';
import ChatAssistant from './components/ChatAssistant';
import { motion, AnimatePresence } from 'motion/react';
import { Monitor, MessageSquare, Sparkles } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'screen' | 'chat'>('chat');

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 selection:bg-zinc-900 selection:text-white">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-zinc-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center shadow-lg shadow-zinc-900/20">
              <Sparkles className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight leading-none">Architect Companion</h1>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">AI-Powered Dev Tools</span>
            </div>
          </div>
          
          <div className="flex bg-zinc-100 p-1 rounded-xl border border-zinc-200">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'chat' 
                  ? 'bg-white text-zinc-900 shadow-sm' 
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              <MessageSquare size={16} />
              Assistant
            </button>
            <button
              onClick={() => setActiveTab('screen')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'screen' 
                  ? 'bg-white text-zinc-900 shadow-sm' 
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              <Monitor size={16} />
              Screen Analyst
            </button>
          </div>

          <nav className="hidden lg:flex items-center gap-6">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-100">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Gemini 3.1 Ready
            </div>
          </nav>
        </div>
      </header>

      <main className="py-12 px-6 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'chat' ? (
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="max-w-4xl mx-auto"
            >
              <div className="mb-8 text-center space-y-2">
                <h2 className="text-4xl font-black tracking-tight text-zinc-900">How can we innovate today?</h2>
                <p className="text-zinc-500 max-w-xl mx-auto">
                  Your senior architect companion. Upload designs, ask deep technical questions, or find inspiration in the world around you.
                </p>
              </div>
              <ChatAssistant />
            </motion.div>
          ) : (
            <motion.div
              key="screen"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ScreenCapture />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="border-t border-zinc-200 py-12 px-6 mt-24">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-zinc-900 rounded-md flex items-center justify-center">
                <Sparkles size={12} className="text-white" />
              </div>
              <span className="font-bold">Architect Companion</span>
            </div>
            <p className="text-sm text-zinc-500 max-w-xs">
              The ultimate developer toolkit powered by Google's most advanced AI models.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Product</h4>
              <ul className="space-y-2 text-sm text-zinc-500">
                <li><a href="#" className="hover:text-zinc-900">Features</a></li>
                <li><a href="#" className="hover:text-zinc-900">Security</a></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Resources</h4>
              <ul className="space-y-2 text-sm text-zinc-500">
                <li><a href="#" className="hover:text-zinc-900">Documentation</a></li>
                <li><a href="#" className="hover:text-zinc-900">Support</a></li>
              </ul>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Status</h4>
            <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              All systems operational
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-zinc-100 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-zinc-400">
          <p>© 2026 Architect Companion. Built with Gemini.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-zinc-900">Terms</a>
            <a href="#" className="hover:text-zinc-900">Privacy</a>
            <a href="#" className="hover:text-zinc-900">Cookies</a>
          </div>
        </div>
      </footer>
    </div>
  );
}


