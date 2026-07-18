import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldAlert, ShieldCheck, Settings, RefreshCw,
  Loader2, Activity, Terminal, ArrowLeft, Database,
  FileAudio, Waves
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AUDIO_DEMO_DATA = {
  "NormalAudio1.wav": {
    result: "Normal State",
    score: 0.082,
    anomaly_percentage: 18.5,
    details: "MFCC features extracted successfully. Unsupervised Isolation Forest registers acoustic signatures well within healthy parameters. No signs of structural wear, scraping, or friction spikes.",
    raw_log: "Extracted 40 MFCCs.\nRaw Isolation Forest score (decision_function): 0.0820\nAnomaly percentage: 18.5%\nFinal result: Normal\nHealth status: SAFE\nMachine Model ID: Industrial Fan Unit 00"
  },
  "AbnormalAudio1.wav": {
    result: "Anomaly Detected",
    score: -0.421,
    anomaly_percentage: 92.1,
    details: "High-frequency peak matching outer-race bearing fault discovered. Unsupervised Isolation Forest indicates severe acoustic deviations. Immediate bearing lubrication or replacement suggested.",
    raw_log: "Extracted 40 MFCCs.\nRaw Isolation Forest score (decision_function): -0.4210\nAnomaly percentage: 92.1%\nFinal result: Anomaly Detected\nHealth status: CRITICAL\nMachine Model ID: Industrial Fan Unit 02"
  },
  "AbnormalAudio3.wav": {
    result: "Anomaly Detected",
    score: -0.285,
    anomaly_percentage: 78.5,
    details: "Acoustic signal registers signature of rotor misalignment or bearing friction anomalies. Plan a diagnostic check on fan shaft torque mounting plates.",
    raw_log: "Extracted 40 MFCCs.\nRaw Isolation Forest score (decision_function): -0.2850\nAnomaly percentage: 78.5%\nFinal result: Anomaly Detected\nHealth status: WARNING\nMachine Model ID: Industrial Fan Unit 04"
  },
  "AbnormalAudio5.wav": {
    result: "Anomaly Detected",
    score: -0.344,
    anomaly_percentage: 84.4,
    details: "Subtle cyclic rubbing acoustic spikes detected. Suggests mesh gear contact anomalies. Inspect mechanical teeth wear or clearances.",
    raw_log: "Extracted 40 MFCCs.\nRaw Isolation Forest score (decision_function): -0.3440\nAnomaly percentage: 84.4%\nFinal result: Anomaly Detected\nHealth status: WARNING\nMachine Model ID: Industrial Fan Unit 06"
  }
};

const AUDIO_MACHINES = [
  { name: "Industrial Fan", id: "ID: 00", desc: "Acoustic signature for Fan Unit 00" },
  { name: "Industrial Fan", id: "ID: 02", desc: "Acoustic signature for Fan Unit 02" },
  { name: "Industrial Fan", id: "ID: 04", desc: "Acoustic signature for Fan Unit 04" },
  { name: "Industrial Fan", id: "ID: 06", desc: "Acoustic signature for Fan Unit 06" }
];

const SAMPLE_AUDIOS = [
  { filename: "NormalAudio1.wav", label: "Normal Audio Sample 1", size: "2.4 MB" },
  { filename: "AbnormalAudio1.wav", label: "Abnormal Audio Sample 1", size: "2.4 MB" },
  { filename: "AbnormalAudio3.wav", label: "Abnormal Audio Sample 2", size: "2.4 MB" },
  { filename: "AbnormalAudio5.wav", label: "Abnormal Audio Sample 3", size: "2.4 MB" }
];

function AudioAnalyzer({ onBack }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [showRaw, setShowRaw] = useState(false);
  const fileInputRef = useRef(null);

  const steps = [
    "Uploading audio logs...",
    "Extracting 40 MFCC feature dimensions...",
    "Running Isolation Forest outlier logic...",
    "Computing structural anomaly score...",
    "Acoustic classification complete."
  ];

  useEffect(() => {
    let interval;
    if (loading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => {
          if (prev < steps.length - 1) {
            return prev + 1;
          } else {
            clearInterval(interval);
            const response = getSimulatedResponse(file.name);
            setResult(response);
            setLoading(false);
            return prev;
          }
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const getSimulatedResponse = (filename) => {
    const match = Object.keys(AUDIO_DEMO_DATA).find(
      key => filename.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(filename.toLowerCase())
    );
    if (match) {
      return AUDIO_DEMO_DATA[match];
    }
    if (filename.toLowerCase().includes('anomaly') || filename.toLowerCase().includes('abnormal') || filename.toLowerCase().includes('fault')) {
      return AUDIO_DEMO_DATA["AbnormalAudio1.wav"];
    }
    return AUDIO_DEMO_DATA["NormalAudio1.wav"];
  };

  const handleFile = (selectedFile) => {
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
      setError(null);
    }
  };

  const selectDemoSample = (sample) => {
    const dummyFile = {
      name: sample.filename,
      size: parseFloat(sample.size) * 1024 * 1024
    };
    setFile(dummyFile);
    setResult(null);
    setError(null);
  };

  const analyzeAudio = () => {
    if (!file) return;
    setLoading(true);
  };

  return (
    <div className="min-h-screen text-white selection:bg-purple-500/30 pb-32 relative bg-black pt-20">
      <div className="max-w-6xl mx-auto px-6 pt-12">
        {/* Header */}
        <header className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 mb-16 border-b border-white/10 pb-10">
          <div className="flex items-center gap-5">
            <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-lg transition-colors group">
              <ArrowLeft className="w-6 h-6 text-purple-400 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div className="bg-black border border-purple-500/50 p-3 rounded-lg">
              <Waves className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight m-0">
                <span className="text-purple-500">Audio</span> Anomaly Detection
              </h1>
              <p className="text-xs text-white/40 tracking-wider font-mono uppercase mt-0.5">Simulation Node: MFCC-Isolation-Forest</p>
            </div>
          </div>

          <div className="text-center md:text-right max-w-sm">
            <p className="text-sm font-bold text-white tracking-widest leading-relaxed">
              AI Driven Predictive Maintenance & Fault Detection Using Audio Input
            </p>
          </div>
        </header>

        <main className="grid grid-cols-1 gap-12">
          <div className="w-full">
            {!file ? (
              <div className="space-y-12">
                {/* Demo Audio Selector */}
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass rounded-2xl p-10 border-white/5"
                >
                  <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                    <Database className="w-5 h-5 text-purple-400" />
                    <h3 className="font-bold text-lg uppercase tracking-widest">Select Demo Audio Samples</h3>
                  </div>
                  <p className="text-xs text-white/50 mb-6 leading-relaxed">
                    Test the unsupervised Isolation Forest diagnostics by choosing one of the pre-recorded machine acoustic logs below:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {SAMPLE_AUDIOS.map((sample, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => selectDemoSample(sample)}
                        className="bg-black/40 hover:bg-purple-950/10 p-5 rounded-xl border border-white/5 hover:border-purple-500/40 transition-all cursor-pointer group flex flex-col justify-between h-32"
                      >
                        <div>
                          <p className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors leading-snug">{sample.label}</p>
                          <p className="text-[10px] font-mono text-white/40 mt-1 uppercase">{sample.filename}</p>
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-bold text-white/40 tracking-wider">
                          <span>{sample.size}</span>
                          <span className="text-purple-400/80 group-hover:text-purple-400">Load &rarr;</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>



                {/* Machine Profiles */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="glass rounded-2xl p-10 border-white/5"
                >
                  <div className="flex items-center gap-3 mb-8 border-b border-white/10 pb-4">
                    <Activity className="w-5 h-5 text-purple-400" />
                    <h3 className="font-bold text-lg uppercase tracking-widest">Acoustic Profiles Supported</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {AUDIO_MACHINES.map((m, idx) => (
                      <div key={idx} className="bg-black/40 p-5 rounded-xl border border-white/5 hover:border-purple-500/30 transition-all group duration-300">
                        <p className="text-base font-bold text-white group-hover:text-purple-400 transition-colors mb-2 leading-snug">{m.name}</p>
                        <p className="text-[10px] font-black tracking-widest text-purple-500 uppercase mb-2">{m.id}</p>
                        <p className="text-[10px] text-white/40 leading-relaxed italic">{m.desc}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* File Details */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="lg:col-span-2 glass rounded-2xl p-8 border-white/10 h-fit"
                >
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-4">
                      <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/30">
                        <FileAudio className="w-8 h-8 text-purple-400" />
                      </div>
                      <div className="overflow-hidden">
                        <h3 className="font-bold text-xl tracking-tight text-white truncate">{file.name}</h3>
                        <p className="text-white/60 text-xs font-bold mt-1 uppercase">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                    </div>

                    {!result && !loading && (
                      <div className="flex flex-col gap-4 pt-4 border-t border-white/10">
                        <button
                          onClick={analyzeAudio}
                          className="w-full py-5 bg-white text-black text-lg font-black uppercase tracking-tight rounded-xl hover:bg-purple-600 hover:text-white transition-all shadow-md"
                        >
                          Scan Acoustics
                        </button>
                        <button onClick={() => setFile(null)} className="text-white/40 text-[10px] font-bold uppercase tracking-widest hover:text-white transition-all">
                          Discard
                        </button>
                      </div>
                    )}

                    {loading && (
                      <div className="flex flex-col items-center py-8 gap-6">
                        <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
                        <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-white italic animate-pulse">{steps[loadingStep]}</p>

                        {/* Waveform Animation */}
                        <div className="flex items-end gap-1 h-16 w-full justify-center">
                          {[...Array(15)].map((_, i) => (
                            <motion.div
                              key={i}
                              className="w-1 bg-purple-500/50 rounded-t"
                              animate={{ height: ['20%', '100%', '20%'] }}
                              transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {error && (
                      <div className="p-6 bg-red-950/40 border border-red-500/40 rounded-xl text-center">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-red-100">{error}</span>
                      </div>
                    )}

                    {result && (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <button
                          onClick={() => setShowRaw(!showRaw)}
                          className="w-full py-2 bg-black border border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:border-purple-500/50 transition-all"
                        >
                          <Terminal className="w-3 h-3" /> {showRaw ? "Hide Spectrum Data" : "Show Spectrum Data"}
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Results Panel */}
                <div className="lg:col-span-3 h-full">
                  <AnimatePresence mode="wait">
                    {result ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col gap-6"
                      >
                        <div className={`glass rounded-2xl p-8 border-l-6 ${result.result.includes("Anomaly") ? "border-red-600 shadow-[0_0_30px_rgba(220,38,38,0.1)]" : "border-emerald-600 shadow-[0_0_30px_rgba(16,185,129,0.1)]"
                          }`}>
                          <div className="flex justify-between items-start mb-10">
                            <div>
                              <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-1">Acoustic Analysis Result</p>
                              <h2 className={`text-3xl font-bold uppercase tracking-tighter ${result.result.includes("Anomaly") ? "text-red-500" : "text-emerald-500"
                                }`}>
                                {result.result}
                              </h2>
                            </div>
                            {result.result.includes("Anomaly") ? <ShieldAlert className="w-10 h-10 text-red-500" /> : <ShieldCheck className="w-10 h-10 text-emerald-500" />}
                          </div>

                          <div className="flex flex-col gap-8">
                            <div className="space-y-3">
                              <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest text-white/60">
                                <span>Anomaly Intensity</span>
                                <span className="text-white text-xs font-bold">{result.anomaly_percentage?.toFixed(1)}%</span>
                              </div>
                              <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/10">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${result.anomaly_percentage}%` }}
                                  transition={{ duration: 1 }}
                                  className={`h-full ${result.result.includes('Anomaly') ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]'}`}
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6 border-y border-white/10 py-8">
                              <div>
                                <p className="text-[9px] uppercase font-bold text-white/40 mb-1">Raw Outlier Distance</p>
                                <p className="text-2xl font-bold tracking-tight text-white">{result.score?.toFixed(4)}</p>
                              </div>
                              <div>
                                <p className="text-[9px] uppercase font-bold text-white/40 mb-1">Process Severity</p>
                                <p className={`text-2xl font-bold tracking-tight uppercase ${result.result.includes("Anomaly") ? "text-red-400" : "text-emerald-400"}`}>{result.anomaly_percentage > 80 ? "Critical" : result.anomaly_percentage > 50 ? "Warning" : "Safe"}</p>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <p className="text-[10px] text-white/40 font-mono uppercase tracking-widest">Acoustic Signal Diagnostic</p>
                              <p className="text-sm text-white/80 leading-relaxed font-bold">{result.details}</p>
                            </div>

                            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl space-y-1">
                              <span className="text-[9px] uppercase tracking-widest font-mono text-purple-400 font-bold">Maintenance Recommendation</span>
                              <p className="text-xs text-white/60">
                                {result.result.includes("Anomaly")
                                  ? "Inspect secondary fan housing and adjust mounting alignments. Reposition gears to remove rub wear issues."
                                  : "Standard operation metrics. Routine lubrication and wear checks on motor rotor in 80 operation hours."}
                              </p>
                            </div>

                            <button
                              onClick={() => { setFile(null); setResult(null); setShowRaw(false); }}
                              className="bg-black border border-white/10 py-4 rounded-xl text-[10px] uppercase font-bold tracking-widest flex items-center justify-center gap-2 hover:border-purple-500 transition-all shadow-sm"
                            >
                              <RefreshCw className="w-3 h-3" /> New Acoustic Scan
                            </button>
                          </div>
                        </div>

                        {/* Raw Feed */}
                        <AnimatePresence>
                          {showRaw && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="glass rounded-2xl p-6 border border-white/10 bg-black/60 font-mono overflow-hidden"
                            >
                              <div className="flex items-center gap-2 mb-4 text-purple-400">
                                <Database className="w-4 h-4" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">ML Engine Diagnostic Raw Log</span>
                              </div>
                              <pre className="text-[10px] text-purple-300 leading-relaxed whitespace-pre-wrap">
                                {result.raw_log}
                              </pre>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ) : !loading && (
                      <motion.div className="glass rounded-2xl h-full p-8 flex flex-col items-center justify-center border-white/5 opacity-30 shadow-inner">
                        <Waves className="w-12 h-12 mb-4 text-white/30" />
                        <p className="text-lg font-bold uppercase tracking-widest text-center">Listening for signals...</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <footer className="mt-24 w-full p-12 flex flex-col items-center gap-2 border-t border-white/10 text-white font-bold uppercase tracking-[0.2em] text-[10px]">
        <span className="opacity-40">MIMII Dataset Anomaly Detection &bull; Demo Mode</span>
        <span>Noel Ninan | Srinidhi Reddy | Koya Harikrishna</span>
      </footer>
    </div>
  );
}

export default AudioAnalyzer;
