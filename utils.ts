/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import * as faceapi from '@vladmandic/face-api';
import { CameraFeed } from './components/CameraFeed';
import { ImageScanner } from './components/ImageScanner';
import { SuspectPanel } from './components/SuspectPanel';
import { EventLog } from './components/EventLog';
import { AddSuspectModal } from './components/AddSuspectModal';
import { Suspect, DetectionLog, getAllSuspects, getRecentLogs, addLog, clearLogs } from './lib/db';
import { profileUnknownSuspect } from './services/geminiService';
import { ShieldAlert, Video, Image as ImageIcon } from 'lucide-react';

const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';

export default function App() {
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [suspects, setSuspects] = useState<Suspect[]>([]);
  const [logs, setLogs] = useState<DetectionLog[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeMode, setActiveMode] = useState<'LIVE' | 'STATIC'>('LIVE');

  // Load Face API Models
  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        setIsModelLoaded(true);
        logSystemEvent('NEURAL_NETWORKS_INITIALIZED');
      } catch (error) {
        console.error("Failed to load models:", error);
        logSystemEvent('MODEL_LOAD_FAILURE: Check connection.');
      }
    };
    loadModels();
  }, []);

  // Load Data
  const loadData = async () => {
    const s = await getAllSuspects();
    setSuspects(s);
    const l = await getRecentLogs();
    setLogs(l);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Logging Helpers
  const logSystemEvent = async (message: string) => {
    const newLog: DetectionLog = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      type: 'SYSTEM',
      message,
    };
    await addLog(newLog);
    loadData();
  };

  const handleClearLogs = async () => {
    if (window.confirm('Clear all system logs?')) {
      await clearLogs();
      loadData();
    }
  };

  // Handle Unknown Detection & Profiling
  const handleUnknownDetected = async (imageSrc: string) => {
    // Initial Log
    const logId = crypto.randomUUID();
    const initialLog: DetectionLog = {
      id: logId,
      timestamp: Date.now(),
      type: 'UNKNOWN',
      message: 'UNKNOWN_SUBJECT_DETECTED. Initiating AI profiling...',
      snapshot: imageSrc,
    };
    await addLog(initialLog);
    loadData();

    // Call Gemini for profiling
    const profile = await profileUnknownSuspect(imageSrc);
    
    // Update Log with profile
    const profileLog: DetectionLog = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      type: 'SYSTEM',
      message: `PROFILE_GENERATED: ${profile}`,
    };
    await addLog(profileLog);
    loadData();
  };

  const handleMatchDetected = async (suspect: Suspect, imageSrc: string) => {
    const log: DetectionLog = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      type: 'MATCH',
      message: `MATCH_FOUND: ${suspect.name} [THREAT_LEVEL: ${suspect.threatLevel}]`,
      snapshot: imageSrc,
      suspectId: suspect.id,
    };
    await addLog(log);
    loadData();
  };

  return (
    <div className="flex flex-col h-screen bg-black text-emerald-500 font-mono overflow-hidden selection:bg-emerald-500/30">
      
      {/* Top Navigation Bar */}
      <header className="flex items-center justify-between px-6 py-3 bg-zinc-950 border-b border-zinc-800 shadow-md z-10">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-6 h-6 text-emerald-500" />
          <h1 className="text-xl font-bold tracking-widest uppercase">Face Detection System</h1>
        </div>
        
        {/* Mode Toggle */}
        <div className="flex bg-zinc-900 rounded-lg p-1 border border-zinc-800">
          <button
            onClick={() => setActiveMode('LIVE')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded text-xs font-bold transition-colors ${
              activeMode === 'LIVE' ? 'bg-emerald-600 text-white' : 'text-zinc-400 hover:text-emerald-500'
            }`}
          >
            <Video className="w-4 h-4" />
            LIVE FEED
          </button>
          <button
            onClick={() => setActiveMode('STATIC')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded text-xs font-bold transition-colors ${
              activeMode === 'STATIC' ? 'bg-emerald-600 text-white' : 'text-zinc-400 hover:text-emerald-500'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            IMAGE/SKETCH
          </button>
        </div>

        <div className="flex items-center gap-4 text-xs font-bold tracking-widest">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>SECURE_CONNECTION</span>
          </div>
          <div className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded">
            OP_ID: {Math.random().toString(36).substring(2, 8).toUpperCase()}
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-[300px_1fr_350px] overflow-hidden">
        
        {/* Left Panel: Suspect Database */}
        <section className="hidden lg:block h-full overflow-hidden">
          <SuspectPanel 
            suspects={suspects} 
            onAddClick={() => setShowAddModal(true)} 
            onRefresh={loadData} 
          />
        </section>

        {/* Center Panel: Camera Feed / Image Scanner */}
        <section className="h-full p-4 flex flex-col items-center justify-center relative overflow-hidden bg-zinc-900/50">
          <div className="w-full max-w-5xl aspect-video relative">
            {activeMode === 'LIVE' ? (
              <CameraFeed 
                suspects={suspects} 
                onUnknownDetected={handleUnknownDetected}
                onMatchDetected={handleMatchDetected}
                isModelLoaded={isModelLoaded}
              />
            ) : (
              <ImageScanner 
                suspects={suspects} 
                onUnknownDetected={handleUnknownDetected}
                onMatchDetected={handleMatchDetected}
                isModelLoaded={isModelLoaded}
              />
            )}
          </div>
          
          {/* Mobile Add Button (visible only on small screens) */}
          <button 
            onClick={() => setShowAddModal(true)}
            className="lg:hidden mt-4 px-4 py-2 bg-emerald-600 text-white rounded font-bold uppercase w-full max-w-sm"
          >
            Manage Database
          </button>
        </section>

        {/* Right Panel: Event Logs */}
        <section className="hidden lg:block h-full overflow-hidden">
          <EventLog 
            logs={logs} 
            onClear={handleClearLogs} 
          />
        </section>

      </main>

      {/* Modals */}
      {showAddModal && (
        <AddSuspectModal 
          onClose={() => setShowAddModal(false)} 
          onAdded={loadData} 
        />
      )}
    </div>
  );
}
