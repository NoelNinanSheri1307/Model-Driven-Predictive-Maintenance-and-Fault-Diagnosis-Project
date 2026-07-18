import React, { useState, useRef } from 'react';
import { 
  ShieldAlert, ShieldCheck, Settings, RefreshCw, 
  Loader2, Activity, ArrowLeft, Database,
  FileText, Clock, Zap, Target, Gauge, Terminal, Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const API_BASE_URL = "http://localhost:8002";

const ENGINE_PROFILES = [
  { id: 'FD001', label: 'Single Condition (FD001)', desc: '1 Op Condition, 1 Fault Mode' },
  { id: 'FD002', label: 'Complex Ops (FD002)', desc: '6 Op Conditions, 1 Fault Mode' },
  { id: 'FD003', label: 'Twin Fault (FD003)', desc: '1 Op Condition, 2 Fault Modes' },
  { id: 'FD004', label: 'Universal (FD004)', desc: '6 Op Conditions, 2 Fault Modes' },
];

const TemporalScan = () => (
  <div className="relative w-full h-48 bg-black/60 rounded-3xl border border-purple-500/30 overflow-hidden flex items-center justify-center glass shadow-2xl">
    {/* Grid Background */}
    <div className="absolute inset-0 opacity-10" 
         style={{ backgroundImage: 'linear-gradient(to right, #a855f7 1px, transparent 1px), linear-gradient(to bottom, #a855f7 1px, transparent 1px)', backgroundSize: '30px 30px' }} 
    />
    
    {/* Moving Data Streams */}
    <div className="absolute inset-0 flex flex-col justify-around py-8 px-4 opacity-40">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="relative w-full h-[1px] bg-purple-500/20">
          <motion.div 
            className="absolute h-1 w-12 bg-purple-500 blur-sm rounded-full"
            animate={{ left: ['-10%', '110%'] }}
            transition={{ duration: 1.5 + i * 0.5, repeat: Infinity, ease: "linear" }}
          />
          <motion.div 
            className="absolute h-2 w-2 bg-purple-400 rounded-full"
            animate={{ left: ['-20%', '120%'], opacity: [0, 1, 0] }}
            transition={{ duration: 2 + i * 0.3, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
          />
        </div>
      ))}
    </div>

    {/* Vertical Analysis Beam */}
    <motion.div 
      className="absolute top-0 bottom-0 w-[2px] bg-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.8)] z-30"
      animate={{ left: ['10%', '90%'] }}
      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
    />

    {/* Central Icon */}
    <div className="relative z-40 bg-black/80 p-6 rounded-full border border-purple-500/50 shadow-inner group">
      <Cpu className="w-12 h-12 text-purple-400 animate-pulse" />
    </div>

    {/* Scanning Glow */}
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/5 to-transparent pointer-events-none" />
  </div>
);

function RULAnalyzer({ onBack }) {
  const [file, setFile] = useState(null);
  const [dataset, setDataset] = useState('FD001');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFile = (selectedFile) => {
    if (selectedFile?.name.endsWith('.txt') || selectedFile?.name.endsWith('.csv')) {
      setFile(selectedFile);
      setResult(null);
      setError(null);
    } else {
      setError("Upload error: Please use .txt or .csv sensor logs");
    }
  };

  const analyzeRUL = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('dataset', dataset);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/analyze-rul`, formData);
      setResult(response.data);
    } catch (err) {
      setError("System offline: RUL Universal Engine disconnected (Port 8002)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-white selection:bg-purple-500/30 pb-32 relative bg-black font-sans">
      <div className="max-w-5xl mx-auto px-6 pt-12">
        {/* Header */}
        <header className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 mb-12 border-b border-white/10 pb-8 uppercase font-black italic tracking-widest leading-relaxed">
          <div className="flex items-center gap-5">
            <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-lg transition-colors group">
              <ArrowLeft className="w-5 h-5 text-purple-400 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div className="bg-black border border-purple-500/50 p-2.5 rounded-lg shadow-[0_0_15px_rgba(168,85,247,0.2)]">
               <Settings className="w-6 h-6 text-purple-400" />
            </div>
            <h1 className="text-2xl font-black tracking-tighter m-0 uppercase italic underline decoration-purple-500/40 underline-offset-8">
               <span className="text-purple-500">Text Log</span> Analysis
            </h1>
          </div>
          
          <div className="text-center md:text-right max-w-sm text-white">
             <p className="text-[10px] opacity-40 tracking-widest leading-none">RUL Prediction from Text Input</p>
          </div>
        </header>

        <main className="grid grid-cols-1 gap-10">
          {/* Machine Profile Selection */}
          {!result && (
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <Target className="w-4 h-4 text-purple-500" />
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white/50">Select Turbofan Type</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {ENGINE_PROFILES.map((profile) => (
                  <button
                    key={profile.id}
                    onClick={() => setDataset(profile.id)}
                    className={`glass p-6 rounded-2xl border transition-all text-left group min-h-[100px] flex flex-col justify-center ${
                      dataset === profile.id 
                      ? "border-purple-500 bg-purple-500/10 shadow-[0_0_20px_rgba(168,85,247,0.1)]" 
                      : "border-white/5 hover:border-white/20"
                    }`}
                  >
                    <p className={`text-sm font-bold mb-1 ${dataset === profile.id ? "text-purple-400" : "text-white/80"}`}>
                      {profile.id}
                    </p>
                    <p className="text-[10px] text-white/40 leading-tight uppercase font-black group-hover:text-white/60 transition-colors">
                      {profile.label}
                    </p>
                  </button>
                ))}
              </div>
            </section>
          )}

          <div className="w-full">
            {!file ? (
              <div className="space-y-10">
                <div className="space-y-4">
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="glass rounded-3xl p-16 flex flex-col items-center border-[1px] border-white/5 hover:border-purple-500/40 transition-all duration-500 cursor-pointer shadow-2xl relative overflow-hidden group"
                    onClick={() => fileInputRef.current.click()}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="p-6 bg-black border border-white/10 rounded-full mb-6 shadow-inner group-hover:scale-110 transition-transform duration-500">
                      <FileText className="w-10 h-10 text-purple-400" />
                    </div>
                    <h2 className="text-xl font-black mb-4 text-center leading-relaxed tracking-tight uppercase italic underline decoration-purple-500/30 underline-offset-8">
                      Drop {dataset} Log Stream <br/>
                      <span className="text-white/40 font-bold normal-case text-sm no-underline tracking-normal">to initiate neural RUL calculation</span>
                    </h2>
                    <div className="text-[9px] font-black uppercase tracking-[0.3em] text-white bg-purple-600 px-8 py-4 rounded-full hover:bg-purple-500 transition-all shadow-lg hover:shadow-purple-500/20">
                      Search Local Files
                    </div>
                    <input ref={fileInputRef} type="file" className="hidden" accept=".txt,.csv" onChange={(e) => handleFile(e.target.files[0])} />
                  </motion.div>

                  <div className="p-4 border border-white/10 bg-white/5 backdrop-blur-md rounded-xl">
                     <p className="text-[11px] text-white/80 font-bold leading-relaxed italic text-center uppercase tracking-[0.2em]">
                       System calibrated via <span className="text-purple-500 font-black">C-MAPSS</span> | 
                       Telemetry sourced from <span className="text-purple-400 font-black">NASA PCoE</span>.
                     </p>
                  </div>
                </div>
                
                {/* Protocol Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   {[
                     { icon: Database, label: "Stream Parsing", desc: "Advanced telemetry ingestion, cleaning, and multidimensional signal synchronization." },
                     { icon: Settings, label: "Profile Logic", desc: `Executing optimized inference logic for ${dataset} Turbofan architecture.` },
                     { icon: Activity, label: "Safety Margin", desc: "Integrated XGBoost guardrails with predictive maintenance safety buffers." }
                   ].map((item, i) => (
                     <div key={i} className="glass rounded-xl p-8 border-white/5 hover:opacity-100 transition-opacity group">
                        <item.icon className="w-6 h-6 text-purple-400 mb-5 group-hover:scale-110 transition-transform" />
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] mb-3 text-white/70">{item.label}</p>
                        <p className="text-[12px] text-white/50 leading-relaxed font-bold italic">{item.desc}</p>
                     </div>
                   ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* File Details */}
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="lg:col-span-2 glass rounded-2xl p-8 border-white/10 h-fit"
                >
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-4">
                      <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/40 shadow-inner">
                        <FileText className="w-8 h-8 text-purple-400" />
                      </div>
                      <div className="overflow-hidden">
                        <h3 className="font-black text-xl tracking-tighter text-white truncate">{file.name}</h3>
                        <div className="flex gap-2 mt-1.5">
                           <span className="text-purple-400 text-[9px] font-black uppercase tracking-widest border border-purple-500/30 px-2 py-0.5 rounded italic">{dataset} Profile</span>
                           <span className="text-white/40 text-[9px] font-bold uppercase tracking-widest">{(file.size / 1024).toFixed(1)} KB</span>
                        </div>
                      </div>
                    </div>

                    {!result && !loading && (
                      <div className="flex flex-col gap-4 pt-6 border-t border-white/5">
                        <button 
                          onClick={analyzeRUL}
                          className="w-full py-5 bg-purple-600 text-white text-lg font-black uppercase tracking-tight rounded-xl hover:bg-purple-500 transition-all shadow-[0_10px_40px_rgba(147,51,234,0.3)] hover:-translate-y-1 active:translate-y-0"
                        >
                          Initiate Scan
                        </button>
                        <button onClick={() => setFile(null)} className="text-white/30 text-[9px] font-black uppercase tracking-[0.4em] hover:text-white transition-all text-center">
                          Discard Buffer
                        </button>
                      </div>
                    )}

                    {loading && (
                      <div className="flex flex-col items-center py-6 gap-6 w-full animate-pulse">
                         <TemporalScan />
                         <div className="space-y-2 text-center">
                            <p className="text-[11px] uppercase tracking-[0.5em] font-black text-white italic animate-pulse">
                               Analyzing Temporal Decay
                            </p>
                            <p className="text-[9px] text-purple-400 font-black uppercase tracking-[0.2em] opacity-60">Engine Profile: {dataset}</p>
                         </div>
                      </div>
                    )}

                    {error && (
                      <div className="p-6 bg-black border border-red-500/40 rounded-xl text-center shadow-2xl">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500 leading-loose">{error}</span>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Results Panel Compact */}
                <div className="lg:col-span-3 h-full">
                  <AnimatePresence mode="wait">
                    {result ? (
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6 h-full">
                        <div className={`glass rounded-2xl p-7 border-l-[8px] h-full shadow-2xl ${
                          result.health_zone === "CRITICAL" ? "border-red-600 bg-red-600/5 shadow-[0_0_40px_rgba(220,38,38,0.1)]" : 
                          result.health_zone === "WARNING" ? "border-orange-500 bg-orange-500/5 shadow-[0_0_40px_rgba(249,115,22,0.1)]" :
                          "border-emerald-600 bg-emerald-600/5 shadow-[0_0_40px_rgba(16,185,129,0.1)]"
                        }`}>
                          <div className="flex justify-between items-start mb-8">
                            <div>
                              <p className="text-[9px] text-white/40 uppercase font-black tracking-[0.4em] mb-2 leading-none">Diagnostic Zone</p>
                              <h2 className={`text-4xl font-black italic uppercase tracking-tighter leading-none ${
                                result.health_zone === "CRITICAL" ? "text-red-500" : 
                                result.health_zone === "WARNING" ? "text-orange-400" :
                                "text-emerald-500"
                              }`}>
                                {result.health_zone}
                              </h2>
                            </div>
                            <div className={`p-4 rounded-xl border bg-black shadow-xl ${
                               result.health_zone === "CRITICAL" ? "border-red-500/30 text-red-500" : 
                               result.health_zone === "WARNING" ? "border-orange-500/30 text-orange-400" :
                               "border-emerald-500/30 text-emerald-500"
                            }`}>
                              {result.health_zone === "CRITICAL" ? <ShieldAlert className="w-8 h-8" /> : <ShieldCheck className="w-8 h-8" />}
                            </div>
                          </div>

                          <div className="flex flex-col gap-8">
                             <div className="flex flex-col md:flex-row md:items-center gap-10 md:gap-14 border-y border-white/5 py-8">
                                <div>
                                   <p className="text-[9px] uppercase font-black text-white/30 mb-3 tracking-widest">Estimated RUL</p>
                                   <div className="flex items-baseline gap-2">
                                      <p className="text-6xl font-black tracking-tight text-white italic">{result.rul_cycles}</p>
                                      <p className="text-xs font-black text-white italic uppercase tracking-widest underline decoration-purple-500 decoration-2">Cycles</p>
                                   </div>
                                </div>
                                <div className="hidden md:block h-16 w-[1px] bg-white/10 opacity-50"></div>
                                <div className="space-y-4">
                                   <div>
                                      <p className="text-[8px] uppercase font-black text-white/30 mb-1.5 tracking-widest">Engine Profile</p>
                                      <p className="text-lg font-black text-purple-400 italic uppercase underline decoration-purple-500/40 underline-offset-4">{result.dataset_profile || dataset}</p>
                                   </div>
                                </div>
                             </div>

                             <div className="space-y-4">
                               <div className="p-6 bg-black/60 rounded-2xl border border-white/5 shadow-inner">
                                  <p className="text-lg text-white/80 leading-relaxed font-black italic">
                                     "{result.details}"
                                  </p>
                               </div>
                               <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-[9px] text-white/40 flex items-center justify-between gap-3 group">
                                  <div className="flex items-center gap-2.5">
                                    <Zap className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                                    <span className="font-bold uppercase tracking-widest opacity-80">Telemetry processed via {dataset} Optimizer</span>
                                  </div>
                               </div>
                             </div>

                            <button 
                              onClick={() => { setFile(null); setResult(null); }}
                              className="bg-black border border-white/10 py-4 rounded-xl text-[10px] uppercase font-black tracking-[0.3em] flex items-center justify-center gap-3 hover:border-purple-500 hover:text-purple-400 transition-all shadow-md group mt-2 w-full"
                            >
                              <RefreshCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-700" /> Reset Analytical Workspace
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ) : !loading && (
                      <motion.div className="glass rounded-2xl h-full p-16 flex flex-col items-center justify-center border-white/5 opacity-40 shadow-inner min-h-[400px] border-dashed border-2">
                         <div className="p-6 bg-white/5 rounded-full mb-6 text-white/20">
                            <Activity className="w-12 h-12 animate-pulse" />
                         </div>
                         <p className="text-lg font-black uppercase tracking-[0.3em] text-center text-white/40 italic leading-loose">Environment Idle <br/> <span className="text-[10px] normal-case tracking-widest not-italic font-bold opacity-50">Awaiting {dataset} telemetry stream ingestion</span></p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <footer className="mt-24 w-full p-12 flex flex-col items-center gap-3 border-t border-white/5 bg-gradient-to-t from-purple-500/5 to-transparent text-white font-black uppercase italic tracking-[0.3em] text-[10px]">
        <div className="flex items-center gap-3 py-1.5 px-5 border border-white/10 rounded-full glass">
           <Gauge className="w-3.5 h-3.5 text-purple-400" />
           <span className="opacity-60">NASA CMAPSS Continuous Maintenance Suite © 2026</span>
        </div>
        <div className="flex gap-6 opacity-40 font-black tracking-widest scale-90">
           <span>Noel Ninan</span>
           <span>Srinidhi Reddy</span>
           <span>Koya Harikrishna</span>
        </div>
      </footer>
    </div>
  );
}

export default RULAnalyzer;
