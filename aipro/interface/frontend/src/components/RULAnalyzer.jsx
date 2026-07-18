import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldAlert, ShieldCheck, Settings, RefreshCw, 
  Loader2, Activity, ArrowLeft, Database,
  FileText, Clock, Zap, Target, Gauge, Terminal, Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const RUL_DEMO_DATA = {
  "FD001": {
    health_zone: "SAFE",
    rul_cycles: 118,
    dataset_profile: "FD001",
    details: "Analysis complete for FD001 profile. Engine unit remaining: 118 cycles. Parameters are nominal.",
    raw_log: {
      "inference_engine": "XGBoost-Regressor-Universal",
      "dataset_profile": "FD001",
      "removed_sensors": ["s1", "s5", "s6", "s10", "s16", "s18", "s19"],
      "scaling_profile": "FD001_scaler.joblib",
      "predicted_remaining_life": 118,
      "alert_trigger": false
    }
  },
  "FD002": {
    health_zone: "WARNING",
    rul_cycles: 42,
    dataset_profile: "FD002",
    details: "Analysis complete for FD002 profile. Engine unit remaining: 42 cycles. Warning: High thermal stress cycles detected.",
    raw_log: {
      "inference_engine": "XGBoost-Regressor-Universal",
      "dataset_profile": "FD002",
      "removed_sensors": [],
      "scaling_profile": "FD002_scaler.joblib",
      "predicted_remaining_life": 42,
      "alert_trigger": true
    }
  },
  "FD003": {
    health_zone: "CRITICAL",
    rul_cycles: 21,
    dataset_profile: "FD003",
    details: "Analysis complete for FD003 profile. Engine unit remaining: 21 cycles. Critical: High sensor noise degradation detected.",
    raw_log: {
      "inference_engine": "XGBoost-Regressor-Universal",
      "dataset_profile": "FD003",
      "removed_sensors": ["s1", "s5", "s6", "s10", "s16", "s18", "s19"],
      "scaling_profile": "FD003_scaler.joblib",
      "predicted_remaining_life": 21,
      "alert_trigger": true
    }
  },
  "FD004": {
    health_zone: "WARNING",
    rul_cycles: 58,
    dataset_profile: "FD004",
    details: "Analysis complete for FD004 profile. Engine unit remaining: 58 cycles. Warning: Progressive multi-channel degradation detected.",
    raw_log: {
      "inference_engine": "XGBoost-Regressor-Universal",
      "dataset_profile": "FD004",
      "removed_sensors": [],
      "scaling_profile": "FD004_scaler.joblib",
      "predicted_remaining_life": 58,
      "alert_trigger": true
    }
  }
};

const ENGINE_PROFILES = [
  { id: 'FD001', label: 'Single Condition (FD001)', desc: '1 Op Condition, 1 Fault Mode' },
  { id: 'FD002', label: 'Complex Ops (FD002)', desc: '6 Op Conditions, 1 Fault Mode' },
  { id: 'FD003', label: 'Twin Fault (FD003)', desc: '1 Op Condition, 2 Fault Modes' },
  { id: 'FD004', label: 'Universal (FD004)', desc: '6 Op Conditions, 2 Fault Modes' },
];

const SAMPLE_LOGS = [
  { filename: "FD001_Sample1.txt", label: "FD001 Turbofan Logs (Healthy)", size: "2.2 MB", profile: "FD001" },
  { filename: "FD002_Sample2.txt", label: "FD002 Turbofan Logs (Complex)", size: "9.0 MB", profile: "FD002" },
  { filename: "FD003_Sample1.txt", label: "FD003 Turbofan Logs (Twin-Fault)", size: "2.8 MB", profile: "FD003" },
  { filename: "FD004_Sample1.txt", label: "FD004 Turbofan Logs (Universal)", size: "6.9 MB", profile: "FD004" }
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
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showRaw, setShowRaw] = useState(false);
  const fileInputRef = useRef(null);

  const steps = [
    "Reading engine sensor log files...",
    "Engineering features (rolling stats)...",
    "Normalizing sensor variables...",
    "Running XGBoost regressor tree nodes...",
    "Remaining Useful Life estimated."
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
            const response = getSimulatedResponse(file.name, dataset);
            setResult(response);
            setLoading(false);
            return prev;
          }
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const getSimulatedResponse = (filename, currentDataset) => {
    // Try to match file name first
    let profile = currentDataset;
    if (filename.toLowerCase().includes("fd001")) profile = "FD001";
    else if (filename.toLowerCase().includes("fd002")) profile = "FD002";
    else if (filename.toLowerCase().includes("fd003")) profile = "FD003";
    else if (filename.toLowerCase().includes("fd004")) profile = "FD004";
    
    return RUL_DEMO_DATA[profile] || RUL_DEMO_DATA["FD001"];
  };

  const handleFile = (selectedFile) => {
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
      setError(null);
      
      // Auto set matching dataset profile if matching filename
      if (selectedFile.name.toLowerCase().includes("fd001")) setDataset("FD001");
      else if (selectedFile.name.toLowerCase().includes("fd002")) setDataset("FD002");
      else if (selectedFile.name.toLowerCase().includes("fd003")) setDataset("FD003");
      else if (selectedFile.name.toLowerCase().includes("fd004")) setDataset("FD004");
    }
  };

  const selectDemoSample = (sample) => {
    const dummyFile = {
      name: sample.filename,
      size: parseFloat(sample.size) * 1024 * 1024
    };
    setFile(dummyFile);
    setDataset(sample.profile);
    setResult(null);
    setError(null);
  };

  const analyzeRUL = () => {
    if (!file) return;
    setLoading(true);
  };

  return (
    <div className="min-h-screen text-white selection:bg-purple-500/30 pb-32 relative bg-black font-sans pt-20">
      <div className="max-w-5xl mx-auto px-6 pt-12">
        {/* Header */}
        <header className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 mb-12 border-b border-white/10 pb-8">
          <div className="flex items-center gap-5">
            <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-lg transition-colors group">
              <ArrowLeft className="w-5 h-5 text-purple-400 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div className="bg-black border border-purple-500/50 p-2.5 rounded-lg shadow-[0_0_15px_rgba(168,85,247,0.2)]">
               <Cpu className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight m-0">
                 <span className="text-purple-500">Remaining Useful Life</span> Prediction
              </h1>
              <p className="text-xs text-white/40 tracking-wider font-mono uppercase mt-0.5 font-bold">Simulation Node: CMAPSS-XGBoost-Regressor</p>
            </div>
          </div>
          
          <div className="text-center md:text-right max-w-sm text-white">
             <p className="text-sm font-bold text-white tracking-widest leading-relaxed uppercase">RUL Prognostics Suite</p>
          </div>
        </header>

        <main className="grid grid-cols-1 gap-10">
          
          {!file ? (
            <div className="space-y-10">
              {/* Sample Files Registry */}
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-3xl p-8 border-white/5"
              >
                <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                  <Database className="w-5 h-5 text-purple-400" />
                  <h3 className="font-bold text-lg uppercase tracking-widest">Select Demo Sensory Logs</h3>
                </div>
                <p className="text-xs text-white/50 mb-6 leading-relaxed">
                  Avoid searching local engine files. Select one of the pre-loaded C-MAPSS logs to run the prognostic estimation cycles:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {SAMPLE_LOGS.map((sample, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => selectDemoSample(sample)}
                      className="bg-black/40 hover:bg-purple-950/10 p-5 rounded-xl border border-white/5 hover:border-purple-500/40 transition-all cursor-pointer group flex flex-col justify-between h-28"
                    >
                      <div>
                        <p className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors leading-snug">{sample.label}</p>
                        <p className="text-[10px] font-mono text-white/40 mt-1 uppercase">{sample.filename}</p>
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-bold text-white/40 tracking-wider">
                        <span>{sample.size}</span>
                        <span className="text-purple-400/80 group-hover:text-purple-400">Select Sample &rarr;</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Machine Profile Selection */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-3xl p-8 border-white/5"
              >
                <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                  <Activity className="w-5 h-5 text-purple-400" />
                  <h3 className="font-bold text-lg uppercase tracking-widest">Select Target Engine Profile</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {ENGINE_PROFILES.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setDataset(p.id)}
                      className={`p-6 rounded-2xl border text-left transition-all ${
                        dataset === p.id 
                          ? 'bg-purple-950/10 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.15)]' 
                          : 'bg-black/40 border-white/5 hover:border-white/20'
                      }`}
                    >
                      <h4 className="font-bold text-sm text-white mb-2">{p.label}</h4>
                      <p className="text-[10px] text-white/40 leading-relaxed font-bold uppercase">{p.desc}</p>
                    </button>
                  ))}
                </div>
              </motion.div>


            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* File Info */}
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-4 glass rounded-3xl p-6 border-white/10 space-y-6"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/30">
                    <FileText className="w-6 h-6 text-purple-400" />
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="font-bold text-base truncate">{file.name}</h4>
                    <p className="text-[10px] text-white/40 font-mono mt-0.5">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-4 space-y-2">
                  <span className="text-[9px] uppercase tracking-widest text-white/40 font-bold font-mono">Assigned Profile</span>
                  <div className="bg-black/60 p-3 rounded-xl border border-white/5 text-xs">
                    <p className="font-bold text-purple-400">{ENGINE_PROFILES.find(p => p.id === dataset)?.label}</p>
                  </div>
                </div>

                {!result && !loading && (
                  <div className="space-y-3 pt-4 border-t border-white/5">
                    <button 
                      onClick={analyzeRUL}
                      className="w-full py-4 bg-white text-black text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-purple-600 hover:text-white transition-all shadow-lg"
                    >
                      Estimate Engine RUL
                    </button>
                    <button onClick={() => setFile(null)} className="w-full text-center text-white/30 text-[9px] font-bold uppercase tracking-wider hover:text-white transition-all py-2">
                      Discard Logs
                    </button>
                  </div>
                )}

                {loading && (
                  <div className="space-y-4 pt-4 border-t border-white/5">
                    <TemporalScan />
                    <div className="text-center space-y-1">
                      <p className="text-[10px] font-mono text-purple-400 font-bold uppercase tracking-widest animate-pulse">{steps[loadingStep]}</p>
                      <p className="text-[8px] text-white/30 font-mono">Processing logs stream step {loadingStep + 1} of 5</p>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="p-4 bg-red-950/40 border border-red-500/40 rounded-xl text-center">
                    <p className="text-xs text-red-200">{error}</p>
                  </div>
                )}

                {result && (
                  <div className="pt-4 border-t border-white/5">
                    <button 
                      onClick={() => setShowRaw(!showRaw)}
                      className="w-full py-2.5 bg-black border border-white/10 rounded-xl text-[9px] font-mono uppercase tracking-widest text-white/60 hover:text-white hover:border-purple-500/40 transition-all flex items-center justify-center gap-2"
                    >
                      <Terminal className="w-3.5 h-3.5" /> {showRaw ? "Hide Prognostic Feed" : "Show Prognostic Feed"}
                    </button>
                  </div>
                )}
              </motion.div>

              {/* Prediction Results */}
              <div className="lg:col-span-8">
                <AnimatePresence mode="wait">
                  {result ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-6"
                    >
                      <div className={`glass rounded-3xl p-8 border-l-6 shadow-2xl relative overflow-hidden ${
                        result.health_zone === 'SAFE' 
                          ? 'border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.05)]' 
                          : result.health_zone === 'WARNING'
                            ? 'border-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.05)]'
                            : 'border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.05)]'
                      }`}>
                        
                        <div className="flex justify-between items-start mb-8">
                          <div>
                            <span className="text-[10px] text-white/40 uppercase font-mono tracking-widest">Remaining Useful Life (RUL)</span>
                            <h2 className={`text-4xl font-extrabold tracking-tight mt-1 flex items-baseline gap-2 ${
                              result.health_zone === 'SAFE' ? 'text-white' : result.health_zone === 'WARNING' ? 'text-yellow-400' : 'text-red-500'
                            }`}>
                              {result.rul_cycles} <span className="text-xs font-mono font-medium text-white/40 uppercase tracking-widest">Cycles</span>
                            </h2>
                          </div>
                          <div className={`p-4 bg-white/5 border rounded-2xl ${
                            result.health_zone === 'SAFE' ? 'border-emerald-500/30 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.1)]' : result.health_zone === 'WARNING' ? 'border-yellow-500/30 text-yellow-400' : 'border-red-500/30 text-red-400'
                          }`}>
                            {result.health_zone === 'SAFE' ? <ShieldCheck className="w-8 h-8" /> : <ShieldAlert className="w-8 h-8" />}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-y border-white/5 py-6 mb-8 text-xs font-mono">
                          <div className="space-y-1">
                            <span className="text-[9px] text-white/30 uppercase tracking-wider">Engine Condition</span>
                            <p className={`font-bold uppercase ${
                              result.health_zone === 'SAFE' ? 'text-emerald-400' : result.health_zone === 'WARNING' ? 'text-yellow-400' : 'text-red-400'
                            }`}>{result.health_zone}</p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[9px] text-white/30 uppercase tracking-wider">Regress Model Confidence</span>
                            <p className="font-bold text-white">91.2 %</p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[9px] text-white/30 uppercase tracking-wider">Operational Profile</span>
                            <p className="font-bold text-purple-400 uppercase">{result.dataset_profile}</p>
                          </div>
                        </div>

                        {/* Interactive Degradation Curve representation */}
                        <div className="space-y-3 mb-8">
                          <div className="flex justify-between text-[10px] font-mono text-white/40">
                            <span>Turbofan Wear Percentage (Estimated)</span>
                            <span className="font-bold text-white">
                              {result.health_zone === 'SAFE' ? '28%' : result.health_zone === 'WARNING' ? '68%' : '91%'}
                            </span>
                          </div>
                          <div className="h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/10">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: result.health_zone === 'SAFE' ? '28%' : result.health_zone === 'WARNING' ? '68%' : '91%' }}
                              transition={{ duration: 1.2, ease: "easeOut" }}
                              className={`h-full ${
                                result.health_zone === 'SAFE' ? 'bg-emerald-500' : result.health_zone === 'WARNING' ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <span className="text-[10px] text-white/30 font-mono uppercase tracking-widest">Decision Explanations</span>
                          <p className="text-sm font-bold leading-relaxed">{result.details}</p>
                        </div>

                        {/* Action Panel */}
                        <div className="mt-8 p-5 bg-white/[0.02] border border-white/5 rounded-2xl space-y-2 text-xs">
                          <span className="text-[10px] text-purple-400 tracking-wider font-mono font-bold uppercase">Maintenance recommendation</span>
                          <p className="text-white/60 leading-relaxed">
                            {result.health_zone === 'SAFE' && "System operating stably inside healthy baseline. No scheduled structural modifications required. Re-evaluate engine stats in 50 cycles."}
                            {result.health_zone === 'WARNING' && "Rotor vibration telemetry shows progressive wear pattern. Schedule an engine inspection and lubricate secondary turbine nodes inside next 10-15 cycles."}
                            {result.health_zone === 'CRITICAL' && "Severe turbine blade thermal distress. Exhaust temperatures exceed baseline. Stop engine cycles immediately to undergo primary compressor rotor overhaul."}
                          </p>
                        </div>

                        <div className="mt-8 flex justify-end">
                          <button 
                            onClick={() => { setFile(null); setResult(null); setShowRaw(false); }}
                            className="px-6 py-3 bg-black border border-white/10 hover:border-purple-500/40 rounded-xl text-xs uppercase tracking-widest text-white font-bold transition-all flex items-center gap-2 shadow-md"
                          >
                            <RefreshCw className="w-3.5 h-3.5" /> Start New Test
                          </button>
                        </div>

                      </div>

                      {/* Raw Feed View */}
                      <AnimatePresence>
                        {showRaw && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="glass rounded-3xl p-6 border border-white/10 bg-black/60 font-mono overflow-hidden"
                          >
                             <div className="flex items-center gap-2 mb-4 text-purple-400">
                                <Database className="w-4 h-4" />
                                <span className="text-[10px] font-bold uppercase tracking-widest font-black">XGBoost Regressor Diagnostic Feed</span>
                             </div>
                             <pre className="text-[10px] text-purple-300 leading-relaxed whitespace-pre-wrap">
                                {JSON.stringify(result.raw_log, null, 2)}
                              </pre>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ) : (
                    <motion.div className="glass rounded-3xl h-64 flex flex-col items-center justify-center border-white/5 opacity-30 shadow-inner">
                       <Clock className="w-12 h-12 mb-4 text-white/30" />
                       <p className="text-lg font-bold uppercase tracking-widest text-center">Awaiting log stream...</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}

        </main>
      </div>

      <footer className="mt-24 w-full p-12 flex flex-col items-center gap-2 border-t border-white/10 text-white font-bold uppercase tracking-[0.2em] text-[10px]">
        <span className="opacity-40">NASA C-MAPSS RUL Predictive System &bull; Demo Mode</span>
        <span>Noel Ninan | Srinidhi Reddy | Koya Harikrishna</span>
      </footer>
    </div>
  );
}

export default RULAnalyzer;
