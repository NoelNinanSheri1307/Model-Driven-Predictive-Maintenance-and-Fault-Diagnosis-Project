import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileAudio, Activity, ShieldAlert, ShieldCheck, TerminalSquare, Settings } from 'lucide-react';

export default function App() {
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [showRawFeed, setShowRawFeed] = useState(false);
  const [rawLogs, setRawLogs] = useState([]);
  
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
      setRawLogs([]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type.includes('audio')) {
        setFile(droppedFile);
        setResult(null);
        setRawLogs([]);
      } else {
        alert('Please drop an audio file (.wav, .mp3)');
      }
    }
  };

  const addLog = (msg) => {
    setRawLogs(prev => [...prev, `[${new Date().toISOString().split('T')[1].substring(0,8)}] ${msg}`]);
  };

  const processAudio = async () => {
    if (!file) return;

    setIsProcessing(true);
    setResult(null);
    setRawLogs([]);
    addLog(`Initiating scan for file: ${file.name} (${(file.size/1024).toFixed(1)} KB)`);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('relative_path', file.webkitRelativePath || file.name);

    try {
      addLog(`Sending stream to POST /analyze-audio (FastAPI Backend)...`);
      
      // Simulate slight processing delay for visualize waveform
      await new Promise(resolve => setTimeout(resolve, 800));

      const response = await fetch('http://localhost:8001/analyze-audio', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      addLog(`Response received: ${response.status} OK`);
      addLog(`Raw Data: ${data.raw_log}`);
      
      setTimeout(() => {
        setResult(data);
        setIsProcessing(false);
      }, 1000); // allow waveform animation to linger briefly
      
    } catch (error) {
      addLog(`ERR: Backend request failed - ${error.message}`);
      addLog(`Make sure the FastAPI server is running on port 8000.`);
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-obsidian-glow text-slate-300 font-sans p-8 flex flex-col items-center selection:bg-purple-500/30">
      
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-4xl flex justify-between items-center mb-12 border-b border-purple-900/50 pb-4"
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl border border-purple-500/30 bg-[#0a0014]">
            <Settings className="text-purple-400" size={24} />
          </div>
          <h1 className="text-[26px] tracking-widest font-semibold">
            <span className="text-white">MIMII</span>
          </h1>
        </div>
        <div className="text-right flex flex-col justify-center items-end gap-1">
          <p className="text-white text-sm font-bold tracking-wide">AI Driven Predictive Maintenance & Fault Detection</p>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowRawFeed(!showRawFeed)}
              className={`flex items-center gap-2 text-[10px] font-mono px-2 py-1 rounded border transition-colors ${showRawFeed ? 'border-purple-500 text-purple-400 bg-purple-500/10' : 'border-slate-800 text-slate-500 hover:text-purple-400 hover:border-purple-800'}`}
            >
              <TerminalSquare size={12} />
              {showRawFeed ? 'HIDE RAW' : 'SHOW RAW'}
            </button>
            <p className="text-white text-sm font-bold tracking-wide">Using Audio Input</p>
          </div>
        </div>
      </motion.div>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Main Panel */}
        <div className="md:col-span-2 space-y-8">
          
          {/* Upload Area */}
          <div 
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center transition-all glass-panel ${
              file ? 'border-purple-500/50' : 'border-slate-800 hover:border-purple-500/30 hover:bg-white/5'
            }`}
          >
            <input 
              type="file" 
              accept=".wav,.mp3"
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            
            {!file ? (
              <motion.div className="flex flex-col items-center text-center cursor-pointer" onClick={() => fileInputRef.current.click()} whileHover={{ scale: 1.02 }}>
                <div className="h-16 w-16 rounded-full bg-slate-900 flex items-center justify-center mb-4 text-purple-500">
                  <UploadCloud size={32} />
                </div>
                <h3 className="text-xl font-medium text-slate-200">Upload Machine Audio</h3>
                <p className="text-slate-500 mt-2 text-sm">Drop .wav or .mp3 here, or click to browse</p>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center text-center w-full">
                <div className="h-16 w-16 rounded-full bg-purple-900/20 pulse-border flex items-center justify-center mb-4 text-purple-400">
                  <FileAudio size={32} />
                </div>
                <h3 className="text-xl font-medium text-purple-200 truncate w-full max-w-xs">{file.name}</h3>
                <p className="text-slate-500 mt-2 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>

                <div className="flex gap-4 mt-8">
                  <button onClick={() => setFile(null)} className="px-4 py-2 rounded text-slate-400 hover:text-white transition-colors text-sm">
                    Cancel
                  </button>
                  <button 
                    onClick={processAudio} 
                    disabled={isProcessing}
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded font-medium shadow-lg shadow-purple-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Run Inference
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Visualization / Results */}
          <AnimatePresence mode="wait">
            {isProcessing && (
              <motion.div 
                key="processing"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="glass-panel rounded-2xl p-8 flex flex-col items-center justify-center"
              >
                <div className="flex items-center gap-2 mb-6 text-purple-400">
                  <Activity size={20} className="animate-pulse" />
                  <span className="font-mono text-sm tracking-widest uppercase">Extracting MFCC Features</span>
                </div>
                <div className="flex items-end gap-1 h-32 w-full max-w-md justify-center">
                  {[...Array(30)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-2 bg-gradient-to-t from-purple-900 to-purple-400 rounded-t"
                      animate={{ height: ['20%', '100%', '20%'] }}
                      transition={{ 
                        duration: 1.5, 
                        repeat: Infinity, 
                        ease: "easeInOut",
                        delay: i * 0.05 
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {result && !isProcessing && (
              <motion.div 
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-2xl border p-8 flex items-start gap-6 glass-panel ${result.result.includes('Anomaly') ? 'border-red-900/50' : 'border-emerald-900/50'}`}
              >
                <div className={`mt-1 p-3 rounded-xl ${result.result.includes('Anomaly') ? 'bg-red-500/20 text-red-400 shadow-[0_0_15px_rgba(248,113,113,0.3)]' : 'bg-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.3)]'}`}>
                  {result.result.includes('Anomaly') ? <ShieldAlert size={32} /> : <ShieldCheck size={32} />}
                </div>
                <div>
                  <h3 className={`text-2xl font-bold mb-2 ${result.result.includes('Anomaly') ? 'text-red-400' : 'text-emerald-400'}`}>
                    {result.result}
                  </h3>
                  <p className="text-slate-400 mb-6">{result.details}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-slate-500 font-mono">
                      <span>ANOMALY SCORE</span>
                      <span className="text-slate-300 font-bold">{result.anomaly_percentage?.toFixed(1) || 0}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${result.anomaly_percentage || 0}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className={`h-full rounded-full ${result.result.includes('Anomaly') ? 'bg-gradient-to-r from-orange-500 to-red-500' : 'bg-gradient-to-r from-emerald-600 to-emerald-400'}`}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          
          {/* Diagnostic Sidebar */}
          <AnimatePresence>
            {showRawFeed && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="glass-panel border-slate-800 rounded-xl overflow-hidden font-mono text-xs flex flex-col h-[400px]"
              >
                <div className="glass-panel text-slate-400 p-2 border-b border-slate-800 flex justify-between">
                  <span>TERMINAL OUTPUT</span>
                  <span className="animate-pulse w-2 h-2 bg-purple-500 rounded-full mt-1"></span>
                </div>
                <div className="p-4 overflow-y-auto flex-1 space-y-2 text-purple-300/80">
                  {rawLogs.length === 0 ? (
                    <span className="text-slate-600">Awaiting runtime execution...</span>
                  ) : (
                    rawLogs.map((log, i) => (
                      <div key={i} className="break-words border-b border-slate-900 pb-1">
                        {log.split('\n').map((line, j) => <div key={j}>{line}</div>)}
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Machine Support List */}
          <div className="glass-panel rounded-xl p-5">
            <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">Supported Profiles</h4>
            <ul className="space-y-3">
              {[
                { id: '00', type: 'Fan' },
                { id: '02', type: 'Pump' },
                { id: '04', type: 'Slider' },
                { id: '06', type: 'Valve' },
              ].map(machine => (
                <li key={machine.id} className="flex justify-between items-center text-sm">
                  <span className="flex items-center gap-2">
                    <span className="text-purple-500 font-mono">ID {machine.id}</span>
                    <span className="text-slate-400">{machine.type}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}
