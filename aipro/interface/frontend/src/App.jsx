import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import VideoAnalyzer from './components/VideoAnalyzer';
import AudioAnalyzer from './components/AudioAnalyzer';
import RULAnalyzer from './components/RULAnalyzer';
import MethodologyPage from './components/ResearchPage';
import ArchitecturePage from './components/ArchitecturePage';
import { AnimatePresence, motion } from 'framer-motion';
import { Info, X, ShieldAlert, Cpu, Database, BookOpen, Settings } from 'lucide-react';

function App() {
  const [currentMode, setCurrentMode] = useState('landing');
  const [showDemoModal, setShowDemoModal] = useState(false);

  return (
    <div className="bg-black min-h-screen text-white font-sans relative overflow-x-hidden">
      
      {/* Dynamic Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-black/60 backdrop-blur-md border-b border-white/10 z-50 flex items-center justify-between px-6 md:px-12">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentMode('landing')}>
          <div className="p-1.5 bg-purple-500/10 border border-purple-500/30 rounded-lg">
            <Cpu className="w-5 h-5 text-purple-400" />
          </div>
          <span className="font-extrabold text-sm md:text-base tracking-tight hover:text-purple-400 transition-colors uppercase italic">
            Predictive Suite
          </span>
        </div>

        {/* Center Navigation Links */}
        <div className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-widest text-white/50">
          <button 
            onClick={() => setCurrentMode('landing')}
            className={`hover:text-white transition-colors ${currentMode === 'landing' || currentMode === 'video' || currentMode === 'audio' || currentMode === 'rul' ? 'text-white border-b-2 border-purple-500 pb-1 pt-1' : ''}`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setCurrentMode('methodology')}
            className={`hover:text-white transition-colors ${currentMode === 'methodology' ? 'text-white border-b-2 border-purple-500 pb-1 pt-1' : ''}`}
          >
            Methodology
          </button>
          <button 
            onClick={() => setCurrentMode('architecture')}
            className={`hover:text-white transition-colors ${currentMode === 'architecture' ? 'text-white border-b-2 border-purple-500 pb-1 pt-1' : ''}`}
          >
            Architecture
          </button>
        </div>

        {/* Right Demo Badge */}
        <div>
          <button
            onClick={() => setShowDemoModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 border border-purple-500/40 rounded-full hover:bg-purple-500 hover:text-black transition-all cursor-pointer group shadow-lg"
          >
            <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-ping group-hover:bg-black" />
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Demo Version</span>
          </button>
        </div>
      </nav>

      {/* Main Pages Switcher */}
      <AnimatePresence mode="wait">
        {currentMode === 'landing' ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <LandingPage onSelectMode={setCurrentMode} />
          </motion.div>
        ) : currentMode === 'video' ? (
          <motion.div
            key="video"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <VideoAnalyzer onBack={() => setCurrentMode('landing')} />
          </motion.div>
        ) : currentMode === 'audio' ? (
          <motion.div
            key="audio"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <AudioAnalyzer onBack={() => setCurrentMode('landing')} />
          </motion.div>
        ) : currentMode === 'rul' ? (
          <motion.div
            key="rul"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <RULAnalyzer onBack={() => setCurrentMode('landing')} />
          </motion.div>
        ) : currentMode === 'methodology' ? (
          <motion.div
            key="methodology"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
          >
            <MethodologyPage onBack={() => setCurrentMode('landing')} />
          </motion.div>
        ) : currentMode === 'architecture' ? (
          <motion.div
            key="architecture"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
          >
            <ArchitecturePage onBack={() => setCurrentMode('landing')} />
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Mobile navigation bottom-bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-md border-t border-white/10 z-50 flex items-center justify-around h-16 text-[9px] font-bold uppercase tracking-widest text-white/50">
        <button 
          onClick={() => setCurrentMode('landing')}
          className={`flex flex-col items-center gap-1 ${currentMode === 'landing' || currentMode === 'video' || currentMode === 'audio' || currentMode === 'rul' ? 'text-white' : ''}`}
        >
          <Settings className="w-4 h-4" />
          Dashboard
        </button>
        <button 
          onClick={() => setCurrentMode('methodology')}
          className={`flex flex-col items-center gap-1 ${currentMode === 'methodology' ? 'text-white' : ''}`}
        >
          <BookOpen className="w-4 h-4" />
          Methodology
        </button>
        <button 
          onClick={() => setCurrentMode('architecture')}
          className={`flex flex-col items-center gap-1 ${currentMode === 'architecture' ? 'text-white' : ''}`}
        >
          <Cpu className="w-4 h-4" />
          Architecture
        </button>
      </div>

      {/* Modern Demo Version Explanation Dialog */}
      <AnimatePresence>
        {showDemoModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
          >
            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-2xl bg-[#080808] border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden text-left"
            >
              {/* Corner Design Glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-xl pointer-events-none" />

              {/* Close Button */}
              <button 
                onClick={() => setShowDemoModal(false)}
                className="absolute top-6 right-6 p-2 bg-white/5 border border-white/10 rounded-full hover:bg-purple-500 hover:text-black transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-2xl">
                  <Info className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-purple-500 uppercase tracking-widest font-black">Interactive Client Simulation</span>
                  <h3 className="text-xl font-bold tracking-tight mt-0.5">Predictive Maintenance Suite &bull; Demo Version</h3>
                </div>
              </div>

              <div className="space-y-4 text-xs text-white/70 leading-relaxed font-sans">
                <p>
                  This deployment is an <strong>interactive frontend demonstration</strong> of the complete AI Predictive Maintenance Suite.
                </p>
                <p>
                  The original research implementation includes multiple FastAPI microservices, deep learning models, XGBoost inference pipelines, and industrial datasets for Video Anomaly Detection, Audio Anomaly Detection, and Remaining Useful Life prediction.
                </p>
                <p>
                  Deploying these components publicly is impractical on typical free hosting platforms because they require:
                </p>
                
                <ul className="space-y-2 border-l-2 border-purple-500/30 pl-4 py-1 text-white/60">
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 bg-purple-400 rounded-full" />
                    <span><strong>Large trained deep learning models</strong> (ResNet CNNs, BiLSTM attention mechanisms)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 bg-purple-400 rounded-full" />
                    <span><strong>Significant compute resources</strong> for sub-second real-time neural network inference</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 bg-purple-400 rounded-full" />
                    <span><strong>Large industrial datasets</strong> including:</span>
                  </li>
                  <li className="flex flex-col pl-4 text-[11px] italic text-purple-300">
                    <span>&bull; IPAD Industrial Process Anomaly Detection Dataset</span>
                    <span>&bull; NASA CMAPSS Turbofan Engine Dataset</span>
                    <span>&bull; Industrial machine audio datasets</span>
                  </li>
                </ul>

                <p>
                  These assets collectively occupy substantial storage and require backend processing that exceeds the capabilities of lightweight frontend hosting platforms such as Vercel's free tier.
                </p>
                <p>
                  This demonstration faithfully reproduces the complete workflow, user interface, and prediction experience using representative sample inputs and authentic pre-generated outputs from the original research implementation.
                </p>
                <p>
                  The complete research project, source code, architectures, and implementation remain available in the GitHub repository.
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-white/5 flex justify-end">
                <button 
                  onClick={() => setShowDemoModal(false)}
                  className="px-6 py-3 bg-purple-600 border border-purple-400/50 font-bold text-xs uppercase tracking-widest text-white rounded-xl hover:bg-purple-700 transition-all cursor-pointer"
                >
                  Proceed to Demonstration
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
