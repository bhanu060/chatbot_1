import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Send, Image as ImageIcon, MapPin, Search, Loader2, User, Bot, X, Paperclip } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

interface Message {
  role: 'user' | 'model';
  text: string;
  image?: string;
  sources?: any[];
}

export default function ChatAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.warn("Location access denied", err)
      );
    }
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() && !selectedImage) return;

    const userMessage: Message = {
      role: 'user',
      text: input,
      image: selectedImage || undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setSelectedImage(null);
    setIsTyping(true);

    try {
      const contents: any[] = [];
      
      // Add history
      messages.forEach(msg => {
        contents.push({
          role: msg.role,
          parts: [{ text: msg.text }]
        });
      });

      // Add current message
      const currentParts: any[] = [{ text: input || "Analyze this image and answer my query." }];
      if (selectedImage) {
        currentParts.push({
          inlineData: {
            mimeType: "image/png",
            data: selectedImage.split(',')[1]
          }
        });
      }
      contents.push({ role: 'user', parts: currentParts });

      const config: any = {
        systemInstruction: "You are a world-class senior engineer and product architect. You provide deep, technical, yet simplified explanations. You integrate ideas creatively and think outside the box. When asked about locations, use your tools to find what's special there.",
        tools: [{ googleSearch: {} }]
      };

      // Use Gemini 2.5 for Maps grounding if location is relevant or requested
      const useMaps = input.toLowerCase().includes('place') || input.toLowerCase().includes('location') || input.toLowerCase().includes('near') || input.toLowerCase().includes('special');
      
      if (useMaps) {
        config.tools.push({ googleMaps: {} });
        if (location) {
          config.toolConfig = {
            retrievalConfig: {
              latLng: {
                latitude: location.lat,
                longitude: location.lng
              }
            }
          };
        }
      }

      const response = await ai.models.generateContent({
        model: useMaps ? "gemini-2.5-flash" : "gemini-3-flash-preview",
        contents,
        config
      });

      const modelResponse: Message = {
        role: 'model',
        text: response.text || "I'm sorry, I couldn't process that.",
        sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks
      };

      setMessages(prev => [...prev, modelResponse]);
    } catch (err) {
      console.error("Chat Error:", err);
      setMessages(prev => [...prev, { role: 'model', text: "Error: I encountered a problem processing your request. Please check your connection or try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-3xl border border-zinc-200 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center text-white">
            <Bot size={24} />
          </div>
          <div>
            <h3 className="font-bold text-zinc-900">Architect Assistant</h3>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">Online & Ready</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {location && (
            <div className="flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-600 rounded-md text-[10px] font-bold">
              <MapPin size={10} />
              LIVE
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
            <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center">
              <Search size={32} className="text-zinc-400" />
            </div>
            <div className="max-w-xs">
              <p className="font-medium text-zinc-900">How can I help you build today?</p>
              <p className="text-xs text-zinc-500">Ask about code, upload a design, or find special places nearby.</p>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              msg.role === 'user' ? 'bg-zinc-100 text-zinc-600' : 'bg-zinc-900 text-white'
            }`}>
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className={`flex flex-col space-y-2 max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              {msg.image && (
                <img src={msg.image} alt="User upload" className="rounded-2xl border border-zinc-200 max-h-48 object-cover shadow-sm" />
              )}
              <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-zinc-900 text-white rounded-tr-none' 
                  : 'bg-zinc-100 text-zinc-800 rounded-tl-none'
              }`}>
                <div className="prose prose-sm max-w-none prose-zinc dark:prose-invert">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
                
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-zinc-200/50 space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Sources & Places</p>
                    <div className="flex flex-wrap gap-2">
                      {msg.sources.map((chunk, idx) => (
                        chunk.web ? (
                          <a key={idx} href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="text-[10px] bg-white/50 px-2 py-1 rounded border border-zinc-200 hover:bg-white transition-colors">
                            {chunk.web.title}
                          </a>
                        ) : chunk.maps ? (
                          <a key={idx} href={chunk.maps.uri} target="_blank" rel="noopener noreferrer" className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-1 rounded border border-emerald-100 hover:bg-emerald-100 transition-colors flex items-center gap-1">
                            <MapPin size={8} />
                            {chunk.maps.title}
                          </a>
                        ) : null
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}

        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
            <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center text-white shrink-0">
              <Bot size={16} />
            </div>
            <div className="bg-zinc-100 px-4 py-3 rounded-2xl rounded-tl-none flex gap-1">
              <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-6 bg-zinc-50 border-t border-zinc-100 space-y-4">
        <AnimatePresence>
          {selectedImage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-zinc-900 shadow-lg"
            >
              <img src={selectedImage} className="w-full h-full object-cover" />
              <button 
                onClick={() => setSelectedImage(null)}
                className="absolute top-1 right-1 bg-zinc-900 text-white rounded-full p-0.5 hover:bg-red-500 transition-colors"
              >
                <X size={12} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Ask anything... (Shift+Enter for new line)"
              className="w-full bg-white border border-zinc-200 rounded-2xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all resize-none min-h-[48px] max-h-32"
              rows={1}
            />
            <div className="absolute right-2 bottom-2 flex items-center gap-1">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors"
              >
                <Paperclip size={18} />
              </button>
            </div>
          </div>
          <button
            onClick={sendMessage}
            disabled={(!input.trim() && !selectedImage) || isTyping}
            className="p-3 bg-zinc-900 text-white rounded-xl hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg active:scale-95"
          >
            <Send size={20} />
          </button>
        </div>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleImageUpload} 
          accept="image/*" 
          className="hidden" 
        />
        <p className="text-[10px] text-center text-zinc-400 font-medium uppercase tracking-widest">
          Powered by Gemini 2.5 & 3.0 • Real-time Grounding Enabled
        </p>
      </div>
    </div>
  );
}
