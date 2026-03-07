import React, { useState, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Camera, Send, RefreshCw, X, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export default function ScreenCapture() {
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const captureScreen = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: "always" } as any,
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          
          // Wait a bit for the stream to stabilize
          setTimeout(() => {
            takePhoto(stream);
          }, 500);
        };
      }
    } catch (err) {
      console.error("Error capturing screen:", err);
      setError("Failed to access screen capture. Please ensure you granted permission.");
    }
  };

  const takePhoto = (stream: MediaStream) => {
    if (canvasRef.current && videoRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        setScreenshot(dataUrl);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      }
    }
  };

  const analyzeScreenshot = async () => {
    if (!screenshot) return;

    setIsAnalyzing(true);
    setAnalysis('');
    setError(null);

    try {
      const base64Data = screenshot.split(',')[1];
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            parts: [
              { text: "Analyze this screenshot. What is happening? If there are errors, explain them. If it's code, review it. Provide helpful feedback." },
              {
                inlineData: {
                  mimeType: "image/png",
                  data: base64Data,
                },
              },
            ],
          },
        ],
      });

      setAnalysis(response.text || "No analysis generated.");
    } catch (err) {
      console.error("Error analyzing screenshot:", err);
      setError("Failed to analyze the screenshot. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setScreenshot(null);
    setAnalysis('');
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-zinc-900">Screen Analyst</h2>
        <p className="text-zinc-500">Capture your screen and let AI help you debug or understand what's happening.</p>
      </div>

      <div className="flex justify-center gap-4">
        {!screenshot ? (
          <button
            onClick={captureScreen}
            className="flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white rounded-full hover:bg-zinc-800 transition-all shadow-lg hover:shadow-xl active:scale-95"
          >
            <Monitor size={20} />
            Capture Screen
          </button>
        ) : (
          <button
            onClick={reset}
            className="flex items-center gap-2 px-6 py-3 bg-zinc-100 text-zinc-900 rounded-full hover:bg-zinc-200 transition-all active:scale-95"
          >
            <RefreshCw size={20} />
            New Capture
          </button>
        )}
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm text-center"
        >
          {error}
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Preview Section */}
        <div className="space-y-4">
          <div className="relative aspect-video bg-zinc-100 rounded-3xl overflow-hidden border border-zinc-200 shadow-inner group">
            {screenshot ? (
              <img src={screenshot} alt="Screenshot" className="w-full h-full object-contain" />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400 space-y-2">
                <Camera size={48} strokeWidth={1} />
                <span className="text-sm font-medium">No capture yet</span>
              </div>
            )}
            
            {screenshot && !isAnalyzing && !analysis && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <button
                  onClick={analyzeScreenshot}
                  className="flex items-center gap-2 px-6 py-3 bg-white text-zinc-900 rounded-full font-semibold shadow-xl hover:scale-105 transition-transform"
                >
                  <Send size={18} />
                  Analyze with AI
                </button>
              </motion.div>
            )}
          </div>
          
          {screenshot && (
            <div className="flex justify-between items-center px-2">
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest">Captured Frame</span>
              <button onClick={reset} className="text-zinc-400 hover:text-red-500 transition-colors">
                <X size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Analysis Section */}
        <div className="space-y-4">
          <div className="h-full min-h-[300px] bg-white rounded-3xl border border-zinc-200 shadow-sm p-6 overflow-auto">
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-2 h-2 rounded-full ${isAnalyzing ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">AI Feedback</span>
            </div>

            <AnimatePresence mode="wait">
              {isAnalyzing ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="h-4 bg-zinc-100 rounded w-3/4 animate-pulse" />
                  <div className="h-4 bg-zinc-100 rounded w-full animate-pulse" />
                  <div className="h-4 bg-zinc-100 rounded w-5/6 animate-pulse" />
                  <div className="h-4 bg-zinc-100 rounded w-2/3 animate-pulse" />
                </motion.div>
              ) : analysis ? (
                <motion.div
                  key="content"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="prose prose-zinc prose-sm max-w-none"
                >
                  <ReactMarkdown>{analysis}</ReactMarkdown>
                </motion.div>
              ) : (
                <div className="h-full flex items-center justify-center text-zinc-300 italic text-sm">
                  Analysis will appear here...
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Hidden elements for capture */}
      <video ref={videoRef} className="hidden" />
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
