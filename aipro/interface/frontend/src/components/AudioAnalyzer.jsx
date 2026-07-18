import React, { useState, useRef } from 'react';
import {
  ShieldAlert, ShieldCheck, Settings, RefreshCw,
  Loader2, Activity, Terminal, ArrowLeft, Database,
  UploadCloud, FileAudio, Waves
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const API_BASE_URL = "http://localhost:8001";

const AUDIO_MACHINES = [
  { name: "Industrial Fan", id: "ID: 00", desc: "Acoustic signature for Fan Unit 00" },
  { name: "Industrial Fan", id: "ID: 02", desc: "Acoustic signature for Fan Unit 02" },
  { name: "Industrial Fan", id: "ID: 04", desc: "Acoustic signature for Fan Unit 04" },
  { name: "Industrial Fan", id: "ID: 06", desc: "Acoustic signature for Fan Unit 06" }
];

function AudioAnalyzer({ onBack }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [showRaw, setShowRaw] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = (selectedFile) => {
    if (selectedFile?.type?.includes('audio') || selectedFile?.name.endsWith('.wav') || selectedFile?.name.endsWith('.mp3')) {
      setFile(selectedFile);
      setResult(null);
      setError(null);
    } else {
      setError("Upload error: Please use .wav or .mp3 formats");
    }
  };

  const analyzeAudio = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API_BASE_URL}/analyze-audio`, formData);
      setResult(response.data);
    } catch (err) {
      setError("System offline: Audio Analyzer disconnected (Port 8001)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-white selection:bg-purple-500/30 pb-32 relative bg-black">
      <div className="max-w-6xl mx-auto px-6 pt-12">
        {/* Header */}
        <header className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 mb-16 border-b border-white/10 pb-10">
          <div className="flex items-center gap-5">
            <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-lg transition-colors group">
              <ArrowLeft className="w-6 h-6 text-purple-400 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div className="bg-black border border-purple-500/50 p-3 rounded-lg">
              <Settings className="w-8 h-8 text-purple-400" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight m-0">
              <span className="text-purple-500">Audio</span> Anomaly Detection
            </h1>
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
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`glass rounded-2xl p-16 flex flex-col items-center border-[1px] transition-all duration-300 cursor-pointer ${dragActive ? "border-purple-400 bg-purple-900/10 shadow-[0_0_20px_rgba(168,85,247,0.1)]" : "border-white/20 hover:border-purple-500/50"
                    }`}
                  onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={(e) => { e.preventDefault(); setDragActive(false); handleFile(e.dataTransfer.files[0]); }}
                  onClick={() => fileInputRef.current.click()}
                >
                  <div className="p-6 bg-black border border-white/10 rounded-full mb-8">
                    <Waves className="w-12 h-12 text-white/80" />
                  </div>
                  <h2 className="text-2xl font-bold mb-6 text-center leading-relaxed">
                    Upload Machine Acoustics <br />
                    <span className="text-white/60">to scan for friction anomalies</span>
                  </h2>
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-purple-400 border border-purple-500/40 px-8 py-4 rounded-xl hover:bg-purple-500 hover:text-white transition-all">
                    Browse Audio Files
                  </div>
                  <input ref={fileInputRef} type="file" className="hidden" accept=".wav,.mp3" onChange={(e) => handleFile(e.target.files[0])} />
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
                        <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-white italic animate-pulse">Analyzing Spectrograms...</p>

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
                                <p className="text-[9px] uppercase font-bold text-white/40 mb-1">Raw Model Score</p>
                                <p className="text-2xl font-bold tracking-tight text-white">{result.score?.toFixed(4)}</p>
                              </div>
                              <div>
                                <p className="text-[9px] uppercase font-bold text-white/40 mb-1">Process State</p>
                                <p className="text-2xl font-bold tracking-tight text-white uppercase">{result.result}</p>
                              </div>
                            </div>

                            <p className="text-lg text-white/80 leading-relaxed font-bold">{result.details}</p>

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
        <span className="opacity-40">MIMII Dataset Anomaly Detection © 2026</span>
        <span>Noel Ninan | Srinidhi Reddy | Koya Harikrishna</span>
      </footer>
    </div>
  );
}

export default AudioAnalyzer;
