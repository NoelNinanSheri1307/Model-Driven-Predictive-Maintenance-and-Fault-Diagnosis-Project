import React from 'react';
import {
  motion
} from 'framer-motion';
import {
  Cctv,
  Terminal,
  Activity,
  ChevronRight,
  Settings
} from 'lucide-react';

const LandingPage = ({ onSelectMode }) => {
  const modes = [
    {
      id: 'rul',
      title: 'Text/Log Analysis',
      description: 'Remaining Useful Life (RUL) prediction for NASA Turbofans using sensory log streams.',
      icon: Terminal,
      color: 'purple',
      status: 'Active',
      footerLabel: 'RUL Analytics Ready'
    },
    {
      id: 'video',
      title: 'Video Analysis',
      description: 'Real-time fault detection using computer vision on surveillance and machine feeds.',
      icon: Cctv,
      color: 'purple',
      status: 'Active',
      footerLabel: 'Video Analysis Ready'
    },
    {
      id: 'audio',
      title: 'Audio Analysis',
      description: 'Spectrum analysis of machine acoustics to identify mechanical wear and friction.',
      icon: Activity,
      color: 'emerald',
      status: 'Active',
      footerLabel: 'Audio Analysis Ready'
    }
  ];

  return (
    <div className="min-h-screen text-white relative flex flex-col items-center justify-center px-6 py-20 bg-black">

      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-4xl mb-20"
      >
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 leading-tight">
          AI Driven <span className="text-purple-500">Predictive Maintenance</span> & Fault Detection
        </h1>
        <p className="text-white font-medium uppercase tracking-[0.4em] text-xs md:text-sm opacity-60">
          Multi-Modal Analysis: Text, Audio, and Video Inputs
        </p>
      </motion.div>

      {/* Grid Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
        {modes.map((mode, idx) => (
          <motion.div
            key={mode.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * idx }}
            whileHover={{ y: -5 }}
            onClick={() => {
              if (mode.id === 'video') onSelectMode('video');
              if (mode.id === 'audio') onSelectMode('audio');
              if (mode.id === 'rul') onSelectMode('rul');
            }}
            className={`glass group rounded-3xl p-10 border-white/10 hover:border-purple-500/50 transition-all cursor-pointer relative overflow-hidden ${mode.status !== 'Active' ? 'opacity-60 grayscale hover:grayscale-0' : ''}`}
          >
            <div className="absolute top-6 right-6 font-bold text-[10px] uppercase tracking-widest text-purple-400/50">
              {mode.status}
            </div>

            <div className="p-5 rounded-2xl bg-black border border-white/10 mb-8 w-fit transition-transform duration-500 group-hover:scale-110 shadow-lg">
              <mode.icon className="w-10 h-10 text-white" />
            </div>

            <h3 className="text-2xl font-bold tracking-tight mb-4 flex items-center gap-2 group-hover:text-purple-400 transition-colors">
              {mode.title}
              <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-all -ml-2 group-hover:ml-0" />
            </h3>

            <p className="text-white/40 font-medium text-sm leading-relaxed mb-8">
              {mode.description}
            </p>

            <div className="flex items-center gap-3 py-4 border-t border-white/5">
              <div className={`w-2 h-2 rounded-full ${mode.status === 'Active' ? 'bg-purple-500 shadow-[0_0_10px_purple] animate-pulse' : 'bg-white/10'}`}></div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">{mode.footerLabel}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <footer className="mt-24 text-[11px] font-bold uppercase tracking-widest text-white border-t border-white/10 pt-8 flex flex-col items-center gap-2">
        <span className="opacity-40 text-[9px]">Industrial Anomaly Detection Suite © 2026</span>
        <span>Noel Ninan | Srinidhi Reddy | Koya Harikrishna</span>
      </footer>
    </div>
  );
};

export default LandingPage;
