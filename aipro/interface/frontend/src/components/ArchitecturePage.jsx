import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, ChevronRight, Cpu, Eye, Waves, 
  Settings, Activity, ShieldCheck, HelpCircle, HardDrive
} from 'lucide-react';

const PIPELINES = {
  video: {
    title: 'Visual Anomaly Pipeline',
    subtitle: 'Real-time structural fault classification from video sequences',
    steps: [
      {
        id: 'cam',
        label: 'Industrial Camera',
        desc: 'Captures process operations in high-definition sequences.',
        details: 'Generates raw image frame streams (256x256x3) at a constant frame rate, capturing mechanical transitions.'
      },
      {
        id: 'cnn',
        label: 'CNN Encoder',
        desc: 'Extracts spatial visual representations from individual frames.',
        details: 'A lightweight Convolutional Neural Network (PyTorch ResNet-based backbone) processes frame structures to extract a compressed 512-dimensional visual embedding vector per frame, removing background redundancy.'
      },
      {
        id: 'lstm',
        label: 'BiLSTM Layer',
        desc: 'Learns temporal machine behavior across consecutive frames.',
        details: 'A Bidirectional Long Short-Term Memory network captures temporal dependencies forwards and backwards in time across a sliding window of 16 frames, tracking cyclic machine stroke dynamics.'
      },
      {
        id: 'attn',
        label: 'Temporal Attention',
        desc: 'Identifies the most informative portions of each sequence.',
        details: 'Assigns importance weights to each frame in the window, amplifying warning signs (e.g., visual friction or structural wobble) while suppressing idle cycles.'
      },
      {
        id: 'xgb',
        label: 'XGBoost Classifier',
        desc: 'Produces the final anomaly classification.',
        details: 'Receives the attention-weighted embedding vectors and performs final binary classification (Normal vs Anomaly) using gradient-boosted decision trees. Offers higher noise tolerance than standard fully-connected neural layers.'
      },
      {
        id: 'pred',
        label: 'Decision Output',
        desc: 'Triggers safety and notification routines.',
        details: 'Outputs the anomaly detection status (Confidence percentage and Alert flag) to the operators and triggers pneumatic safety shut-offs if necessary.'
      }
    ]
  },
  audio: {
    title: 'Acoustic Diagnostics Pipeline',
    subtitle: 'Spectral wear diagnosis from sound frequency distributions',
    steps: [
      {
        id: 'mic',
        label: 'Acoustic Sensor',
        desc: 'Records high-frequency sonic feedback from active machinery.',
        details: 'Captures machine operations (e.g., fan blades, bearing gears) using high-sensitivity microphones, converting physical vibrations to analog/digital signals.'
      },
      {
        id: 'mfcc',
        label: 'MFCC Extraction',
        desc: 'Transforms raw audio into frequency-domain descriptors.',
        details: 'Performs Fast Fourier Transforms (FFT) to convert raw waveforms into 40 Mel-Frequency Cepstral Coefficients (MFCCs). Captures logarithmic human hearing perception bands, isolating structural rubs and grinding sounds.'
      },
      {
        id: 'iforest',
        label: 'Isolation Forest',
        desc: 'Detects acoustic outliers using MFCC feature distributions.',
        details: 'An unsupervised ensemble model constructed of random isolation trees. Rather than profiling normal behaviors, it actively isolates outlier feature configurations. Abnormal friction signatures require fewer tree splits to isolate, resulting in shorter path lengths.'
      },
      {
        id: 'score',
        label: 'Anomaly Score',
        desc: 'Determines outlier intensity.',
        details: 'Translates isolation depth into a standardized metric (0% - 100%). Scores exceeding 50% are categorized as abnormal anomalies.'
      },
      {
        id: 'apred',
        label: 'Maintenance Alarm',
        desc: 'Recommends mechanical inspection schedules.',
        details: 'Categorizes failures based on severity (Safe, Warning, Critical) to recommend lubrication refills or structural replacements.'
      }
    ]
  },
  rul: {
    title: 'Sensor Prognostics Pipeline',
    subtitle: 'Remaining Useful Life estimation from sensory data logs',
    steps: [
      {
        id: 'logs',
        label: 'NASA Sensor Logs',
        desc: 'Receives time-series telemetry logs.',
        details: 'Gathers multi-channel telemetry representing turbine cycles, operational conditions, and 21 thermal/pressure sensor measurements.'
      },
      {
        id: 'pre',
        label: 'Preprocessing',
        desc: 'Performs noise cleaning and drops dead sensors.',
        details: 'Parses standard whitespace-delimited logs and discards constant, non-informative sensor signals (e.g., static sensors s1, s5, s10) to improve signal-to-noise ratio.'
      },
      {
        id: 'feat',
        label: 'Feature Engineering',
        desc: 'Builds historical sequence profiles.',
        details: 'Generates rolling window stats, sensor differences, and degradation cycles using a sliding history parameter of 30 cycles.'
      },
      {
        id: 'scale',
        label: 'Sensor Scaling',
        desc: 'Standardizes sensor scales for tree models.',
        details: 'Applies preset scaling parameters calibrated to standard operational logs, normalizing high-variance sensors (e.g., pressure and turbine speed metrics).'
      },
      {
        id: 'rxgb',
        label: 'XGBoost Regressor',
        desc: 'Predicts Remaining Useful Life cycles.',
        details: 'Evaluates the engineered sensor patterns using a highly-optimized gradient boosting regressor, outputting the predicted remaining operational life (RUL) in cycles.'
      },
      {
        id: 'rpred',
        label: 'Prognostic Alert',
        desc: 'Maps RUL prediction to plant schedules.',
        details: 'Categorizes the machinery into health zones (Safe: >60 cycles, Warning: 30-60 cycles, Critical: <30 cycles) to automate parts orders.'
      }
    ]
  }
};

const ArchitecturePage = ({ onBack }) => {
  const [activePipeline, setActivePipeline] = useState('video');
  const [activeStep, setActiveStep] = useState(0);

  const pipeline = PIPELINES[activePipeline];
  const steps = pipeline.steps;
  const currentStepInfo = steps[activeStep] || steps[0];

  return (
    <div className="min-h-screen text-white bg-black selection:bg-purple-500/30 pb-32 pt-24 relative">
      {/* Background radial glows */}
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6">
        {/* Navigation Header */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-12 border-b border-white/10 pb-8"
        >
          <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-lg transition-colors group">
            <ArrowLeft className="w-5 h-5 text-purple-400 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div className="bg-black border border-purple-500/50 p-2.5 rounded-lg">
            <Settings className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">System Architecture</h1>
            <p className="text-white/40 text-xs tracking-widest uppercase font-mono mt-0.5">Interactive Data Pipeline & Neural Topologies</p>
          </div>
        </motion.div>

        {/* Pipeline Tabs */}
        <div className="flex gap-4 mb-10 border-b border-white/5 pb-6">
          {Object.keys(PIPELINES).map((key) => {
            const isActive = activePipeline === key;
            return (
              <button
                key={key}
                onClick={() => {
                  setActivePipeline(key);
                  setActiveStep(0);
                }}
                className={`px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
                  isActive 
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20 border border-purple-400/50' 
                    : 'bg-white/[0.02] border border-white/10 text-white/50 hover:text-white hover:border-white/20'
                }`}
              >
                {key === 'video' ? 'Video Model' : key === 'audio' ? 'Audio Model' : 'Prognostics (RUL)'}
              </button>
            );
          })}
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Interactive Diagram Flow */}
          <div className="lg:col-span-7 space-y-6">
            <div className="glass rounded-3xl p-8 border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent">
              <h3 className="text-lg font-bold tracking-tight mb-2">{pipeline.title}</h3>
              <p className="text-xs text-white/50 mb-8">{pipeline.subtitle}</p>

              {/* Dynamic Diagram Flow */}
              <div className="flex flex-col gap-4 relative">
                {steps.map((step, idx) => {
                  const isCurrent = activeStep === idx;
                  return (
                    <div key={step.id} className="flex flex-col items-center w-full">
                      {/* Connection Line */}
                      {idx > 0 && (
                        <div className="w-[1.5px] h-6 bg-gradient-to-b from-purple-500/30 to-purple-500/50 my-1" />
                      )}
                      
                      {/* Node Box */}
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        onClick={() => setActiveStep(idx)}
                        className={`w-full p-4 rounded-2xl border cursor-pointer transition-all duration-300 flex items-center justify-between shadow-sm relative ${
                          isCurrent 
                            ? 'bg-purple-950/20 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.1)]' 
                            : 'bg-black/40 border-white/5 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-2.5 rounded-xl border ${
                            isCurrent ? 'bg-purple-500 border-purple-400 text-white' : 'bg-black border-white/10 text-white/60'
                          }`}>
                            {activePipeline === 'video' ? (
                              <Eye className="w-4 h-4" />
                            ) : activePipeline === 'audio' ? (
                              <Waves className="w-4 h-4" />
                            ) : (
                              <HardDrive className="w-4 h-4" />
                            )}
                          </div>
                          <div className="text-left">
                            <p className="text-xs text-white/40 font-mono">Stage 0{idx + 1}</p>
                            <h4 className={`text-sm font-bold tracking-tight ${isCurrent ? 'text-purple-400' : 'text-white'}`}>{step.label}</h4>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <p className="text-[10px] text-white/40 font-mono hidden md:block max-w-[150px] truncate">{step.desc}</p>
                          <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${isCurrent ? 'rotate-90 text-purple-400' : 'text-white/20'}`} />
                        </div>

                        {/* Pulsing indicator for active step */}
                        {isCurrent && (
                          <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-8 bg-purple-500 rounded-r-full shadow-[0_0_10px_purple]" />
                        )}
                      </motion.div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Model Stage Explanations */}
          <div className="lg:col-span-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStepInfo.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.25 }}
                className="glass rounded-3xl p-8 border-white/10 h-fit bg-gradient-to-b from-white/[0.04] to-transparent sticky top-28"
              >
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                  <div className="p-2.5 bg-purple-500/10 rounded-xl border border-purple-500/30">
                    <Cpu className="w-5 h-5 text-purple-400 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-purple-400 font-bold uppercase tracking-wider">Pipeline Node Details</span>
                    <h4 className="text-lg font-bold tracking-tight mt-0.5">{currentStepInfo.label}</h4>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h5 className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-1.5">Process Overview</h5>
                    <p className="text-sm font-bold leading-snug">{currentStepInfo.desc}</p>
                  </div>

                  <div>
                    <h5 className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-1.5">Technical Mechanism</h5>
                    <p className="text-xs text-white/60 leading-relaxed text-justify">{currentStepInfo.details}</p>
                  </div>

                  {/* Math/Tensor Flow Visualizer block */}
                  <div className="p-5 bg-black/60 rounded-2xl border border-white/5 font-mono text-[10px] text-purple-400 space-y-1.5">
                    <div className="flex justify-between border-b border-white/5 pb-1.5 text-white/40">
                      <span>Parameter</span>
                      <span>Value / Shape</span>
                    </div>
                    {activePipeline === 'video' && (
                      <>
                        <div className="flex justify-between"><span>Inputs</span><span className="text-white">Frames (16x256x256x3)</span></div>
                        <div className="flex justify-between"><span>DL Embeddings</span><span className="text-white">Tensors (16, 512)</span></div>
                        <div className="flex justify-between"><span>Classification</span><span className="text-white">Probability (0.0 to 1.0)</span></div>
                      </>
                    )}
                    {activePipeline === 'audio' && (
                      <>
                        <div className="flex justify-between"><span>Inputs</span><span className="text-white">Acoustic Audio (.wav)</span></div>
                        <div className="flex justify-between"><span>Spectrogram</span><span className="text-white">40 MFCC Tensors</span></div>
                        <div className="flex justify-between"><span>Algorithm</span><span className="text-white">Isolation Forest Outliers</span></div>
                      </>
                    )}
                    {activePipeline === 'rul' && (
                      <>
                        <div className="flex justify-between"><span>Inputs</span><span className="text-white">NASA CMAPSS Logs (.txt)</span></div>
                        <div className="flex justify-between"><span>Sensor Matrix</span><span className="text-white">30 x 14 Scaled Matrix</span></div>
                        <div className="flex justify-between"><span>Regression</span><span className="text-white">Predicted Cycles (RUL)</span></div>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArchitecturePage;
