import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Wheel from './components/Wheel';
import AdminPanel from './components/AdminPanel';
import ResultPopup from './components/ResultPopup';
import { determineOutcome } from './services/logicService';
import { saveSpin } from './services/storageService';
import { playWin } from './services/audioService';
import { getConfig } from './services/configService';
import { OutcomeId, OutcomeConfig } from './types';
import { AlertCircle, Hexagon } from 'lucide-react';

const HomePage: React.FC = () => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [outcome, setOutcome] = useState<OutcomeId | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<Record<string, OutcomeConfig>>(getConfig());
  const [refreshKey, setRefreshKey] = useState(0); // Used to force re-render wheel if config changes

  // Listener for config changes from Admin Panel (if in same window context/localStorage event)
  useEffect(() => {
    const handleConfigUpdate = () => {
      setConfig(getConfig());
      setRefreshKey(p => p + 1);
    };
    window.addEventListener('configUpdated', handleConfigUpdate);
    // Also listen to storage events if admin is in another tab
    window.addEventListener('storage', handleConfigUpdate);
    
    return () => {
      window.removeEventListener('configUpdated', handleConfigUpdate);
      window.removeEventListener('storage', handleConfigUpdate);
    };
  }, []);

  const handleSpin = useCallback(() => {
    if (isSpinning) return;
    
    // Reset previous state
    setShowPopup(false);
    setError(null);

    // 1. Determine Logic
    const result = determineOutcome();

    if (!result) {
      setError("Maximum limits reached for all outcomes! Please contact admin to reset.");
      return;
    }

    // 2. Start Visuals
    setOutcome(result);
    setIsSpinning(true);
  }, [isSpinning]);

  const onSpinComplete = () => {
    setIsSpinning(false);
    if (outcome) {
      saveSpin(outcome);
      playWin();
      setShowPopup(true);
    }
  };

  // Keyboard support (Spacebar)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space' && !isSpinning && !showPopup) {
        event.preventDefault(); // Prevent scrolling
        handleSpin();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSpin, isSpinning, showPopup]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-blue-100 -z-10" />
      <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none" 
        style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '24px 24px' }} 
      />

      {/* Header with Logo */}
      <header className="absolute top-6 left-0 w-full flex justify-center">
        <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-sm border border-slate-100">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md">
              <Hexagon size={24} fill="currentColor" className="text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-800 leading-tight">StatusWheel</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Spin & Win</span>
            </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center gap-10 w-full max-w-md mt-12">
        
        {/* Error Display */}
        <div className="h-8 flex items-center justify-center w-full">
           {error && (
            <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg flex items-center gap-2 text-sm border border-red-200 animate-pulse">
              <AlertCircle size={18} />
              {error}
            </div>
          )}
        </div>

        {/* The Wheel */}
        <div className="relative">
          <Wheel 
            key={refreshKey} // Force re-render on config change
            isSpinning={isSpinning} 
            targetOutcome={outcome} 
            onSpinComplete={onSpinComplete} 
          />
          
          {/* Floor Shadow */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-48 h-4 bg-black/10 rounded-[100%] blur-sm" />
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-4 w-full">
          <button
            onClick={handleSpin}
            disabled={isSpinning}
            className={`
              w-full max-w-xs py-4 px-8 rounded-xl font-bold text-lg uppercase tracking-wider shadow-lg transition-all transform active:scale-95
              ${isSpinning 
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-500/30 border-b-4 border-indigo-800'
              }
            `}
          >
            {isSpinning ? 'Spinning...' : 'Spin Now'}
          </button>
          
          <p className="text-xs text-slate-400 font-medium">
            Press <span className="bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-500 font-mono">Space</span> to spin
          </p>
        </div>

      </main>

      {/* Result Popup */}
      <ResultPopup 
        isVisible={showPopup}
        outcomeConfig={outcome ? config[outcome] : null}
        onClose={() => setShowPopup(false)}
        autoHideDuration={4000}
      />

      {/* Footer */}
      <footer className="absolute bottom-4 text-slate-400 text-xs text-center">
        <p>&copy; {new Date().getFullYear()} Status Code Wheel. All rights reserved.</p>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </HashRouter>
  );
};

export default App;