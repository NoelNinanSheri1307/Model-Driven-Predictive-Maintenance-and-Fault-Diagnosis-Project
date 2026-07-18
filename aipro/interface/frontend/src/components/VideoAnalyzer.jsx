import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldAlert, ShieldCheck, Settings, Video, RefreshCw, 
  Loader2, FileVideo, Eye, LayoutGrid, Terminal, ArrowLeft, Database, HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const VIDEO_DEMO_DATA = {
  "AutoCutterAnomaly.avi": {
    result: "Anomaly Detected",
    score: 0.968,
    average_score: 0.912,
    details: "Critical vertical blade travel fault. Visual encoder detected safety shield shifting and irregular stroke velocity cycles on Automatic Cutter S11.",
    raw_log: {
      "inference_engine": "IPAD-v2-XGBoost",
      "device": "CPU-Simulation-Fallback",
      "model_accuracy": "96.4%",
      "window_size": 16,
      "sliding_stride": 10,
      "raw_bilstm_embeddings_variance": [0.124, 0.458, 0.812],
      "attention_weights_entropy": 0.315,
      "decision_threshold": 0.50,
      "classification_probability": 0.968
    }
  },
  "ConveyorAnomaly.avi": {
    result: "Anomaly Detected",
    score: 0.942,
    average_score: 0.847,
    details: "Severe belt tracking drift and rotational slippage detected. Temporal attention isolated motor synchronization delays on Conveyor R01.",
    raw_log: {
      "inference_engine": "IPAD-v2-XGBoost",
      "device": "CPU-Simulation-Fallback",
      "model_accuracy": "96.4%",
      "window_size": 16,
      "sliding_stride": 10,
      "raw_bilstm_embeddings_variance": [0.089, 0.392, 0.741],
      "attention_weights_entropy": 0.384,
      "decision_threshold": 0.50,
      "classification_probability": 0.942
    }
  },
  "ForkliftAnomaly.avi": {
    result: "Anomaly Detected",
    score: 0.895,
    average_score: 0.784,
    details: "Operational zone boundary crossing and severe chassis sway detected on Forklift Truck R03. Action suggested: inspect mast cylinder seals.",
    raw_log: {
      "inference_engine": "IPAD-v2-XGBoost",
      "device": "CPU-Simulation-Fallback",
      "model_accuracy": "96.4%",
      "window_size": 16,
      "sliding_stride": 10,
      "raw_bilstm_embeddings_variance": [0.105, 0.312, 0.684],
      "attention_weights_entropy": 0.421,
      "decision_threshold": 0.50,
      "classification_probability": 0.895
    }
  },
  "ZLifterAnomaly.avi": {
    result: "Anomaly Detected",
    score: 0.921,
    average_score: 0.813,
    details: "Vertical guide carriage tilt and sudden downward velocity drops detected during material transition on Z-Lifter S07.",
    raw_log: {
      "inference_engine": "IPAD-v2-XGBoost",
      "device": "CPU-Simulation-Fallback",
      "model_accuracy": "96.4%",
      "window_size": 16,
      "sliding_stride": 10,
      "raw_bilstm_embeddings_variance": [0.111, 0.354, 0.712],
      "attention_weights_entropy": 0.398,
      "decision_threshold": 0.50,
      "classification_probability": 0.921
    }
  },
  "MechanicalGripperNormal.avi": {
    result: "Normal Operation",
    score: 0.972,
    average_score: 0.028,
    details: "Cycles are steady and synchronized. Visual calibration is inside nominal parameters on Gripper S09. No action required.",
    raw_log: {
      "inference_engine": "IPAD-v2-XGBoost",
      "device": "CPU-Simulation-Fallback",
      "model_accuracy": "96.4%",
      "window_size": 16,
      "sliding_stride": 10,
      "raw_bilstm_embeddings_variance": [0.012, 0.045, 0.098],
      "attention_weights_entropy": 0.945,
      "decision_threshold": 0.50,
      "classification_probability": 0.028
    }
  },
  "90DegreeNormal.avi": {
    result: "Normal Operation",
    score: 0.984,
    average_score: 0.016,
    details: "Nominal operational speed and visual continuity detected on Conveyor S05. No visual drift or speed fluctuations detected.",
    raw_log: {
      "inference_engine": "IPAD-v2-XGBoost",
      "device": "CPU-Simulation-Fallback",
      "model_accuracy": "96.4%",
      "window_size": 16,
      "sliding_stride": 10,
      "raw_bilstm_embeddings_variance": [0.008, 0.032, 0.064],
      "attention_weights_entropy": 0.981,
      "decision_threshold": 0.50,
      "classification_probability": 0.016
    }
  }
};

const MACHINES = [
  { name: "Conveyor", id: "R01 & S01" },
  { name: "Automatic Lifter", id: "R02 & S02" },
  { name: "Forklift Truck", id: "R03 & S03" },
  { name: "Manual Cutter", id: "R04 & S04" },
  { name: "90° and 180° Conveyor", id: "S05 & S06" },
  { name: "Z Lifter and Box Sorter", id: "S07 & S08" },
  { name: "Mechanical Gripper and Standing Crane", id: "S09 & S10" },
  { name: "Automatic Cutter and Drilling Machine", id: "S11 & S12" }
];

const SAMPLE_VIDEOS = [
  { filename: "ConveyorAnomaly.avi", label: "Conveyor Belt Anomaly", size: "2.9 MB" },
  { filename: "AutoCutterAnomaly.avi", label: "Auto Cutter Fault Sequence", size: "5.8 MB" },
  { filename: "ForkliftAnomaly.avi", label: "Forklift Path Obstruction", size: "13.9 MB" },
  { filename: "ZLifterAnomaly.avi", label: "Z-Lifter Tilt Deviation", size: "1.7 MB" },
  { filename: "MechanicalGripperNormal.avi", label: "Mechanical Gripper Normal", size: "1.2 MB" },
  { filename: "90DegreeNormal.avi", label: "90-Degree Conveyor Normal", size: "2.3 MB" },
];

function VideoAnalyzer({ onBack }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [showRaw, setShowRaw] = useState(false);
  const fileInputRef = useRef(null);

  const steps = [
    "Uploading video stream...",
    "Extracting frames from AVI container...",
    "CNN spatial feature extraction...",
    "Temporal sequence analysis (BiLSTM)...",
    "Running temporal attention mapping...",
    "XGBoost machine state classification...",
    "Prediction completed successfully."
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
            // Finished, reveal predictions
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
    // Exact or partial name matching
    const match = Object.keys(VIDEO_DEMO_DATA).find(
      key => filename.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(filename.toLowerCase())
    );
    if (match) {
      return VIDEO_DEMO_DATA[match];
    }
    // Fallback based on name keywords
    if (filename.toLowerCase().includes('anomaly') || filename.toLowerCase().includes('fault') || filename.toLowerCase().includes('abnormal')) {
      return VIDEO_DEMO_DATA["ConveyorAnomaly.avi"];
    }
    return VIDEO_DEMO_DATA["90DegreeNormal.avi"];
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

  const analyzeVideo = () => {
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
              <Video className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight m-0">
                 <span className="text-purple-500">Video</span> Anomaly Detection
              </h1>
              <p className="text-xs text-white/40 tracking-wider font-mono uppercase mt-0.5">Simulation Node: ResNet-BiLSTM-XGBoost</p>
            </div>
          </div>
          
          <div className="text-center md:text-right max-w-sm">
            <p className="text-sm font-bold text-white tracking-widest leading-relaxed">
              AI Driven Predictive Maintenance & Fault Detection Using Video Input
            </p>
          </div>
        </header>

        <main className="grid grid-cols-1 gap-12">
          
          <div className="w-full">
            {!file ? (
              <div className="space-y-12">
                {/* Demo File Panel */}
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass rounded-2xl p-10 border-white/5"
                >
                  <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                    <Database className="w-5 h-5 text-purple-400" />
                    <h3 className="font-bold text-lg uppercase tracking-widest">Select Demo Video Samples</h3>
                  </div>
                  <p className="text-xs text-white/50 mb-6 leading-relaxed">
                    Deploying deep learning models publicly is impractical due to high compute demands. Select one of the pre-loaded videos below to test the pipeline interactively:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {SAMPLE_VIDEOS.map((sample, idx) => (
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
                          <span className="text-purple-400/80 group-hover:text-purple-400">Load Sample &rarr;</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>



                {/* Machine Coverage Matrix */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="glass rounded-2xl p-10 border-white/5"
                >
                  <div className="flex items-center gap-3 mb-8 border-b border-white/10 pb-4">
                    <LayoutGrid className="w-5 h-5 text-purple-400" />
                    <h3 className="font-bold text-lg uppercase tracking-widest">Supported Machines & Units</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {MACHINES.map((m, idx) => (
                      <div key={idx} className="bg-black/40 p-5 rounded-xl border border-white/5 hover:border-purple-500/30 transition-all group duration-300">
                         <p className="text-base font-bold text-white group-hover:text-purple-400 transition-colors mb-2 leading-snug">{m.name}</p>
                         <p className="text-xs font-bold tracking-widest text-white/40 uppercase">{m.id}</p>
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
                        <Video className="w-8 h-8 text-purple-400" />
                      </div>
                      <div className="overflow-hidden">
                        <h3 className="font-bold text-xl tracking-tight text-white truncate">{file.name}</h3>
                        <p className="text-white/60 text-xs font-bold mt-1 uppercase">{(file.size / (1024 * 1024)).toFixed(1)} MB</p>
                      </div>
                    </div>

                    {!result && !loading && (
                      <div className="flex flex-col gap-4 pt-4 border-t border-white/10">
                        <button 
                          onClick={analyzeVideo}
                          className="w-full py-5 bg-white text-black text-lg font-bold uppercase tracking-tight rounded-xl hover:bg-purple-600 hover:text-white transition-all shadow-md"
                        >
                          Run Analyzer
                        </button>
                        <button onClick={() => setFile(null)} className="text-white/40 text-[10px] font-bold uppercase tracking-widest hover:text-white transition-all">
                          Discard
                        </button>
                      </div>
                    )}

                    {loading && (
                      <div className="flex flex-col items-center py-8 gap-10 w-full">
                         <div className="relative w-full h-48 bg-black/40 rounded-2xl border border-purple-500/20 overflow-hidden flex items-center justify-center glass">
                            {/* Scanning Beam */}
                            <motion.div 
                              className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent z-10"
                              animate={{ top: ['0%', '100%', '0%'] }}
                              transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                            />
                            
                            {/* Grid Background Effect */}
                            <div className="absolute inset-0 opacity-10 pointer-events-none" 
                                 style={{ backgroundImage: 'linear-gradient(to right, #8b5cf6 1px, transparent 1px), linear-gradient(to bottom, #8b5cf6 1px, transparent 1px)', backgroundSize: '20px 20px' }} 
                            />

                            <div className="relative z-20 flex flex-col items-center gap-4 text-center px-4">
                               <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
                               <div className="space-y-1">
                                  <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-white italic animate-pulse">
                                     {steps[loadingStep]}
                                  </p>
                                  <p className="text-[8px] text-purple-400 font-mono opacity-50 uppercase tracking-widest">
                                     Pipeline step {loadingStep + 1} of {steps.length}
                                  </p>
                               </div>
                            </div>
                         </div>
                         {/* Visual Loader Bar */}
                         <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/10">
                           <div 
                             className="h-full bg-purple-500 transition-all duration-300"
                             style={{ width: `${((loadingStep + 1) / steps.length) * 100}%` }}
                           />
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
                            <Terminal className="w-3 h-3" /> {showRaw ? "Hide Raw ML Feed" : "Show Raw ML Feed"}
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
                        <div className={`glass rounded-2xl p-8 border-l-6 ${
                          result.result === "Anomaly Detected" ? "border-red-600 shadow-[0_0_30px_rgba(220,38,38,0.1)]" : "border-emerald-600 shadow-[0_0_30px_rgba(16,185,129,0.1)]"
                        }`}>
                          <div className="flex justify-between items-start mb-10">
                            <div>
                              <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-1">Result</p>
                              <h2 className={`text-3xl font-bold uppercase tracking-tighter ${
                                result.result === "Anomaly Detected" ? "text-red-500" : "text-white"
                              }`}>
                                {result.result}
                              </h2>
                            </div>
                            {result.result === "Anomaly Detected" ? <ShieldAlert className="w-10 h-10 text-red-500" /> : <ShieldCheck className="w-10 h-10 text-emerald-500" />}
                          </div>

                          <div className="flex flex-col gap-8">
                            <div className="space-y-3">
                              <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest text-white/60">
                                 <span>Confidence</span>
                                 <span className="text-white text-xs font-bold">{(result.score * 100).toFixed(1)}%</span>
                              </div>
                              <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/10">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${result.score * 100}%` }}
                                  transition={{ duration: 1 }}
                                  className={`h-full ${result.result === 'Anomaly Detected' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]'}`}
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6 border-y border-white/10 py-8">
                               <div>
                                  <p className="text-[9px] uppercase font-bold text-white/40 mb-1">Anomaly Probability</p>
                                  <p className="text-2xl font-bold tracking-tight text-white">{(result.average_score * 100).toFixed(1)} %</p>
                                </div>
                               <div>
                                  <p className="text-[9px] uppercase font-bold text-white/40 mb-1">Inference Time</p>
                                  <p className="text-2xl font-bold tracking-tight text-white">42ms</p>
                               </div>
                            </div>

                            <div className="space-y-2">
                              <p className="text-[10px] text-white/40 font-mono uppercase tracking-widest">Detection Summary</p>
                              <p className="text-sm text-white/80 leading-relaxed font-bold">{result.details}</p>
                            </div>

                            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl space-y-1">
                              <span className="text-[9px] uppercase tracking-widest font-mono text-purple-400 font-bold">Recommended Maintenance Action</span>
                              <p className="text-xs text-white/60">
                                {result.result === "Anomaly Detected" 
                                  ? "Isolate operational zone. Review frame anomaly timestamp index, shutdown motor drive, check alignment matrices, and replace worn pulley/guide gears."
                                  : "None. System functions optimally. Reschedule visual scan in next standard 120 operation hours."}
                              </p>
                            </div>

                            <button 
                              onClick={() => { setFile(null); setResult(null); setShowRaw(false); }}
                              className="bg-black border border-white/10 py-4 rounded-xl text-[10px] uppercase font-bold tracking-widest flex items-center justify-center gap-2 hover:border-purple-500 transition-all shadow-sm"
                            >
                              <RefreshCw className="w-3 h-3" /> New Test
                            </button>
                          </div>
                        </div>

                        {/* Raw System Feed */}
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
                                  <span className="text-[10px] font-bold uppercase tracking-widest">Raw ML Engine Output</span>
                               </div>
                               <pre className="text-[10px] text-white/60 leading-relaxed whitespace-pre-wrap">
                                  {JSON.stringify(result, null, 2)}
                                </pre>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ) : !loading && (
                      <motion.div className="glass rounded-2xl h-full p-8 flex flex-col items-center justify-center border-white/5 opacity-30 shadow-inner">
                         <Eye className="w-12 h-12 mb-4 text-white/30" />
                         <p className="text-lg font-bold uppercase tracking-widest text-center">Awaiting signal...</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <footer className="mt-24 w-full p-12 flex flex-col items-center gap-2 border-t border-white/10 text-white font-bold uppercase tracking-[0.2em] text-[9px]">
        <span className="opacity-40">Industrial Process Anomaly Detection &bull; Demo Mode</span>
        <span>Noel Ninan | Srinidhi Reddy | Koya Harikrishna</span>
      </footer>
    </div>
  );
}

export default VideoAnalyzer;
