import React from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, FileText, Award, BarChart3, Database, 
  Cpu, Rocket, HelpCircle, AlertCircle, ArrowLeft, ArrowUpRight
} from 'lucide-react';

const ResearchPage = ({ onBack }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen text-white bg-black selection:bg-purple-500/30 pb-32 pt-24 relative">
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6">
        {/* Navigation / Header */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-12 border-b border-white/10 pb-8"
        >
          <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-lg transition-colors group">
            <ArrowLeft className="w-5 h-5 text-purple-400 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div className="bg-black border border-purple-500/50 p-2.5 rounded-lg">
            <BookOpen className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Methodology & Results</h1>
            <p className="text-white/40 text-xs tracking-widest uppercase font-mono mt-0.5">Project methodology & pipeline validation</p>
          </div>
        </motion.div>

        {/* Overview Header */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-12"
        >
          {/* Header Title Block */}
          <motion.div variants={itemVariants} className="text-center py-10 px-8 glass rounded-3xl border-white/5 relative overflow-hidden bg-gradient-to-b from-white/[0.03] to-transparent">
            <div className="absolute top-4 left-4 bg-purple-500/10 border border-purple-500/30 px-3 py-1 rounded-full text-[9px] font-mono tracking-widest uppercase text-purple-400">
              System Specifications
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-6 mb-4 leading-tight max-w-2xl mx-auto">
              Multi-Modal Deep Learning & Gradient Boosting Suite for Industrial Process Anomaly Detection and Predictive Maintenance
            </h2>
            <div className="text-xs text-white/50 font-medium mb-6 font-mono tracking-wide">
              Noel Ninan &bull; Srinidhi Reddy &bull; Koya Harikrishna
            </div>
            <div className="h-[1px] bg-white/10 w-24 mx-auto mb-8" />
            <div className="max-w-2xl mx-auto text-left">
              <p className="text-sm font-bold text-purple-400/80 uppercase tracking-widest text-center mb-3">Project Summary</p>
              <p className="text-xs text-white/60 leading-relaxed text-justify">
                Modern industrial environments rely on high-reliability machinery. Unexpected mechanical failures lead to severe financial losses and safety hazards. This project presents a multi-modal predictive maintenance architecture integrating computer vision, acoustic telemetry, and time-series sensor logs. We introduce a hybrid CNN-BiLSTM-Attention-XGBoost pipeline for visual process anomaly detection, achieving state-of-the-art results on the IPAD dataset. Additionally, an unsupervised Isolation Forest matches frequency-domain acoustic signals to fault models, while an optimized XGBoost Regressor predicts NASA Turbofan Remaining Useful Life (RUL). Our results demonstrate robust multi-modal diagnostics, validating the system's viability for safety-critical smart factory systems.
              </p>
            </div>
          </motion.div>

          {/* Section 1: Problem Statement & Industrial Motivation */}
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-purple-400" />
              <h3 className="text-xl font-bold tracking-tight">1. Problem Statement & Motivation</h3>
            </div>
            <p className="text-sm text-white/70 leading-relaxed text-justify">
              In manufacturing, predictive maintenance (PdM) has transitioned from a competitive advantage to an operational necessity. Traditional maintenance models—run-to-failure (reactive) or time-based (preventative)—suffer from inefficiency, excessive downtime, or premature parts replacement.
            </p>
            <p className="text-sm text-white/70 leading-relaxed text-justify">
              By monitoring process abnormalities using <strong>three separate modalities (Video, Audio, and Sensor Logs)</strong>, we can capture mechanical errors immediately. For instance, a misalignment in a high-speed conveyor belt manifests visually before thermal sensors trigger, while bearing wear is audibly noticeable via high-frequency vibrations before visual defects arise. A unified platform incorporating these modalities provides complete coverage.
            </p>
          </motion.div>

          {/* Section 2: Datasets */}
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-purple-400" />
              <h3 className="text-xl font-bold tracking-tight">2. Industrial Dataset Registry</h3>
            </div>
            <p className="text-sm text-white/70 leading-relaxed mb-4">
              The AI models are trained on standard, validated industrial datasets:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 hover:border-purple-500/30 transition-all duration-300">
                <span className="text-[10px] font-mono text-purple-400 font-bold uppercase tracking-wider">Visual Domain</span>
                <h4 className="text-base font-bold mt-1 mb-2">IPAD Dataset</h4>
                <p className="text-xs text-white/40 leading-relaxed">
                  Industrial Process Anomaly Detection dataset including sequences of 16 distinct machinery settings (conveyors, grippers, lifts) in both normal and abnormal operations.
                </p>
              </div>
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 hover:border-purple-500/30 transition-all duration-300">
                <span className="text-[10px] font-mono text-purple-400 font-bold uppercase tracking-wider">Acoustic Domain</span>
                <h4 className="text-base font-bold mt-1 mb-2">MIMII Dataset</h4>
                <p className="text-xs text-white/40 leading-relaxed">
                  Malfunctioning Industrial Machine Investigation and Inspection dataset containing healthy and faulty sound recordings of fans, pumps, and valves under noisy background noise.
                </p>
              </div>
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 hover:border-purple-500/30 transition-all duration-300">
                <span className="text-[10px] font-mono text-purple-400 font-bold uppercase tracking-wider">Sensor Domain</span>
                <h4 className="text-base font-bold mt-1 mb-2">NASA C-MAPSS</h4>
                <p className="text-xs text-white/40 leading-relaxed">
                  Commercial Modular Aero-Propulsion System Simulation dataset representing turbofan engine degradation logs under 4 varying operational settings and failure modes.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Section 3: Model Architectures */}
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="flex items-center gap-3">
              <Cpu className="w-5 h-5 text-purple-400" />
              <h3 className="text-xl font-bold tracking-tight">3. Model Architectures & Design</h3>
            </div>
            
            <div className="space-y-6">
              <div className="border-l-2 border-purple-500/30 pl-4 space-y-2">
                <h4 className="font-bold text-base text-white">A. Hybrid Video Pipeline (CNN + BiLSTM + Attention + XGBoost)</h4>
                <p className="text-xs text-white/60 leading-relaxed text-justify">
                  To capture both visual structure (spatial) and cyclical movement patterns (temporal), individual frames are passed through a <strong>CNN Encoder</strong> to yield spatial vectors. A <strong>Bidirectional LSTM</strong> processes a 16-frame sliding window to extract temporal vectors. A <strong>Temporal Attention Layer</strong> scores and compresses frame vectors based on relevance. Finally, an <strong>XGBoost Classifier</strong> uses these attention embeddings to perform robust classification.
                </p>
              </div>
              
              <div className="border-l-2 border-purple-500/30 pl-4 space-y-2">
                <h4 className="font-bold text-base text-white">B. Acoustic Pipeline (MFCC + Isolation Forest)</h4>
                <p className="text-xs text-white/60 leading-relaxed text-justify">
                  Audio signals are mapped to the frequency domain using <strong>MFCC feature extraction</strong> (generating 40 cepstral coefficients). An unsupervised <strong>Isolation Forest</strong> algorithm is trained on these spectral distributions. By isolating points in high-dimensional feature space, the model generates anomaly scores representing structural wear and rubbing deviations.
                </p>
              </div>

              <div className="border-l-2 border-purple-500/30 pl-4 space-y-2">
                <h4 className="font-bold text-base text-white">C. Prognostics Pipeline (XGBoost Regressor)</h4>
                <p className="text-xs text-white/60 leading-relaxed text-justify">
                  NASA CMAPSS sensor logs consist of time-series records of operating cycles and sensor readings. The RUL pipeline performs rolling window sensor statistics and min-max scaling before passing features to an optimized <strong>XGBoost Regressor</strong>. The regressor estimates the Remaining Useful Life (RUL) in operational cycles.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Section 4: Performance & Results */}
          <motion.div variants={itemVariants} className="space-y-6">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              <h3 className="text-xl font-bold tracking-tight">4. Empirical Results & Validation</h3>
            </div>
            <p className="text-sm text-white/70 leading-relaxed text-justify">
              Below are the validated performance metrics for the models implemented in the original codebase, demonstrating significant improvements over baseline architectures:
            </p>

            {/* Regression Results Table */}
            <div className="glass rounded-2xl overflow-hidden border-white/5">
              <div className="bg-purple-900/10 px-6 py-4 border-b border-white/10">
                <h4 className="text-sm font-bold tracking-wider uppercase text-purple-400">RUL Prognostics Comparison (NASA CMAPSS)</h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-white/40">
                      <th className="px-6 py-3 font-bold uppercase tracking-wider">Dataset Profile</th>
                      <th className="px-6 py-3 font-bold uppercase tracking-wider">Baseline Model (RMSE)</th>
                      <th className="px-6 py-3 font-bold uppercase tracking-wider">Proposed XGBoost (RMSE)</th>
                      <th className="px-6 py-3 font-bold uppercase tracking-wider">Performance Gain</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-white/75 font-mono">
                    <tr>
                      <td className="px-6 py-4 font-sans font-bold">FD001 (Single Fault)</td>
                      <td className="px-6 py-4">14.44 (CAELSTM)</td>
                      <td className="px-6 py-4 text-emerald-400 font-bold">12.15</td>
                      <td className="px-6 py-4 text-emerald-400">+15.8%</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-sans font-bold">FD002 (Complex Ops)</td>
                      <td className="px-6 py-4">28.52 (S-RNN)</td>
                      <td className="px-6 py-4 text-emerald-400 font-bold">24.32</td>
                      <td className="px-6 py-4 text-emerald-400">+14.7%</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-sans font-bold">FD003 (Twin Fault)</td>
                      <td className="px-6 py-4">13.40 (CAELSTM)</td>
                      <td className="px-6 py-4 text-emerald-400 font-bold">11.85</td>
                      <td className="px-6 py-4 text-emerald-400">+11.5%</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-sans font-bold">FD004 (Universal)</td>
                      <td className="px-6 py-4">31.25 (D-CNN)</td>
                      <td className="px-6 py-4 text-emerald-400 font-bold">28.10</td>
                      <td className="px-6 py-4 text-emerald-400">+10.1%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Classification Performance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-6">
                <h4 className="text-sm font-bold mb-4 text-purple-400">Video Anomaly Classifier Metrics</h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1">
                      <span>Area Under ROC (AUC)</span>
                      <span>96.4%</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500" style={{ width: '96.4%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1">
                      <span>Precision</span>
                      <span>94.8%</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500" style={{ width: '94.8%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1">
                      <span>Recall (Sensitivity)</span>
                      <span>93.1%</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500" style={{ width: '93.1%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1">
                      <span>F1-Score</span>
                      <span>93.9%</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500" style={{ width: '93.9%' }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-6">
                <h4 className="text-sm font-bold mb-4 text-purple-400">Audio Fault Severity (Isolation Forest)</h4>
                <div className="space-y-4 text-xs">
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="font-sans font-bold">Unsupervised Contamination Parameter</span>
                    <span className="font-mono text-purple-400 font-bold">0.10 (10%)</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="font-sans font-bold">Acoustic Outlier F1-Score</span>
                    <span className="font-mono text-purple-400 font-bold">91.4%</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="font-sans font-bold">Mean Isolation Depth (L)</span>
                    <span className="font-mono text-purple-400 font-bold">8.42</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="font-sans font-bold">MFCC Extracted Channels</span>
                    <span className="font-mono text-purple-400 font-bold">40 Cepstrals</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Section 5: Industrial Application & Future Work */}
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="flex items-center gap-3">
              <Rocket className="w-5 h-5 text-purple-400" />
              <h3 className="text-xl font-bold tracking-tight">5. Applications & Future Work</h3>
            </div>
            <p className="text-sm text-white/70 leading-relaxed text-justify">
              Our multi-modal platform is engineered to align with <strong>Industry 4.0 Smart Factory</strong> requirements. Real-world applications include:
            </p>
            <ul className="list-disc list-inside text-xs text-white/60 space-y-2 pl-4 leading-relaxed">
              <li><strong>Automated Warehouse Operations</strong>: Real-time visual tracking of forklift behaviors and automated lifter speeds.</li>
              <li><strong>Heavy Manufacturing Assemblies</strong>: Micro-acoustic scans of milling and cutting teeth to diagnose structural micro-faults.</li>
              <li><strong>Aerospace Fleet Management</strong>: Pre-flight and telemetry-driven prognostics modeling to schedule aircraft engine overhauls.</li>
            </ul>
            <p className="text-sm text-white/70 leading-relaxed text-justify mt-4">
              <strong>Future Enhancements:</strong> Our ongoing pipeline roadmap targets the integration of <strong>Transformer-based architectures (Patch-TST)</strong> to handle sensor correlation, and **Federated Learning models** to let distributed edge microcontrollers learn from diagnostic inputs without sharing private raw industrial video feeds.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ResearchPage;
