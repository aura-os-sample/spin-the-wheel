import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const handleConfigUpdate = () => {
      setConfig(getConfig());
      setRefreshKey(p => p + 1);
    };
    window.addEventListener('configUpdated', handleConfigUpdate);
    window.addEventListener('storage', handleConfigUpdate);

    return () => {
      window.removeEventListener('configUpdated', handleConfigUpdate);
      window.removeEventListener('storage', handleConfigUpdate);
    };
  }, []);

  const handleSpin = useCallback(() => {
    if (isSpinning) return;

    setShowPopup(false);
    setError(null);

    const result = determineOutcome();

    if (!result) {
      setError("Limits reached! Please reset in Admin.");
      return;
    }

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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space' && !isSpinning && !showPopup) {
        event.preventDefault();
        handleSpin();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSpin, isSpinning, showPopup]);

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-50 flex items-center justify-center relative">
      {/* Decorative Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-blue-100 -z-10" />
      <div className="absolute inset-0 opacity-30 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '32px 32px' }}
      />

      <div className="w-full max-w-7xl px-8 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-12 items-center h-full max-h-[900px]">

        {/* Left Column: The Wheel */}
        <div className="relative flex justify-center items-center h-full py-8 md:py-0 order-2 md:order-1">
          <div className="relative z-10 scale-90 md:scale-100">
            <Wheel
              key={refreshKey}
              isSpinning={isSpinning}
              targetOutcome={outcome}
              onSpinComplete={onSpinComplete}
            />
          </div>
          {/* Floor Shadow */}
          <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 w-64 h-8 bg-black/10 rounded-[100%] blur-md -z-0 md:bottom-auto md:top-[85%]" />
        </div>

        {/* Right Column: Controls & Branding */}
        <div className="flex flex-col items-center md:items-start justify-center space-y-8 md:pl-12 order-1 md:order-2">

          {/* Brand */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-xl rotate-3">
              <Hexagon size={32} fill="currentColor" className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-800 tracking-tight leading-none">Spin the Wheel</h1>
              <p className="text-sm font-bold text-indigo-500 tracking-widest uppercase mt-1">Try your luck!</p>
            </div>
          </div>

          <div className="w-full h-px bg-slate-200/80 max-w-xs" />

          {/* Action Area */}
          <div className="flex flex-col gap-6 w-full max-w-xs items-center md:items-start">
            {error && (
              <div className="w-full bg-red-50 text-red-600 px-4 py-3 rounded-lg flex items-start gap-3 text-sm border border-red-100 shadow-sm animate-pulse">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            <button
              onClick={handleSpin}
              disabled={isSpinning}
              className={`
                group relative w-full py-5 rounded-2xl font-black text-xl uppercase tracking-wider shadow-xl transition-all transform
                ${isSpinning
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed scale-[0.98]'
                  : 'bg-indigo-600 text-white hover:bg-indigo-500 hover:shadow-indigo-500/40 hover:-translate-y-1 active:translate-y-0.5 border-b-4 border-indigo-800 hover:border-indigo-700'
                }
              `}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isSpinning ? 'Spinning...' : 'Spin Now'}
              </span>
            </button>

            <p className="text-sm text-slate-400 font-medium flex items-center gap-2">
              <span className="bg-white px-2 py-1 rounded border border-slate-200 text-slate-500 font-mono text-xs shadow-sm">SPACE</span>
              to spin
            </p>
          </div>

          {/* Footer Info (Desktop) */}
          <div className="hidden md:block absolute bottom-8 right-8 text-right">
            <p className="text-xs text-slate-400 font-medium">&copy; {new Date().getFullYear()} Harsh Verma</p>
          </div>

        </div>
      </div>

      <ResultPopup
        isVisible={showPopup}
        outcomeConfig={outcome ? config[outcome] : null}
        onClose={() => setShowPopup(false)}
        autoHideDuration={4000}
      />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;