import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import VideoAnalyzer from './components/VideoAnalyzer';
import AudioAnalyzer from './components/AudioAnalyzer';
import RULAnalyzer from './components/RULAnalyzer';
import { AnimatePresence, motion } from 'framer-motion';

function App() {
  const [currentMode, setCurrentMode] = useState('landing');

  return (
    <div className="bg-black min-h-screen">
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
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export default App;
