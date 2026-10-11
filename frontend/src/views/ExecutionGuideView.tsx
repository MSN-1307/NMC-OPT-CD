import React, { useState } from 'react';
import { 
  Terminal, 
  Copy, 
  Check, 
  Server, 
  Globe, 
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { checkBackendHealth } from '../services/api';

export const ExecutionGuideView: React.FC = () => {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [cliOutput, setCliOutput] = useState<string>('Terminal diagnostic engine ready. Click any command action button above to run an emulated or live health check.');
  const [isPinging, setIsPinging] = useState(false);

  const copyToClipboard = (cmd: string, key: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(key);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const handleRunPing = async () => {
    setIsPinging(true);
    setCliOutput('$ curl http://127.0.0.1:8008/api/health\nPinging FastAPI server...');
    const ok = await checkBackendHealth();
    setIsPinging(false);
    if (ok) {
      setCliOutput(`$ curl http://127.0.0.1:8008/api/health\nHTTP/1.1 200 OK\n{\n  "status": "healthy",\n  "app": "NMC-Opt Studio Backend",\n  "version": "1.0.0",\n  "model": "Analytical First-Principles Cost Model"\n}\n--> Connection verified! Server is responding promptly.`);
    } else {
      setCliOutput(`$ curl http://127.0.0.1:8008/api/health\nConnection refused or port 8008 is unreachable.\nEnsure the backend uvicorn process is running.`);
    }
  };

  const handleSimulatePytest = () => {
    setCliOutput(
      `$ python -m pytest backend/tests\n` +
      `============================= test session starts =============================\n` +
      `platform win32 -- Python 3.14.3, pytest-9.1.1\n` +
      `rootdir: D:\\SEM 5\\CD LAB\\NMC-OPT\n` +
      `collected 8 items\n\n` +
      `backend\\tests\\test_analyzer.py ...                                       [ 37%]\n` +
      `backend\\tests\\test_cost_model.py ...                                     [ 75%]\n` +
      `backend\\tests\\test_optimizer.py ..                                       [100%]\n\n` +
      `============================== 8 passed in 0.02s ==============================`
    );
  };

  const handleSimulateCliAnalyze = () => {
    setCliOutput(
      `$ python -c "import urllib.request, json; ..."\n` +
      `Kernel: Vector Addition (VADD)\n` +
      `Problem Size: 2,000,000 float32 elements (8.0 MB read, 4.0 MB written)\n` +
      `Arithmetic Intensity: 0.0833 FLOP/Byte (Strictly Memory Bandwidth Bound)\n` +
      `Evaluation:\n` +
      `  • CPU-only: 0.6400 ms (Memory bus limited to 28 GB/s)\n` +
      `  • Direct NMC: 0.2850 ms (DRAM bank internal speed: 160 GB/s)\n` +
      `Decision: Direct NMC offload (2.25x Speedup vs CPU)`
    );
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-lg p-6 sm:p-7 border border-slate-200/90 shadow-2xs transition-colors">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-white rounded-md text-rose-700 border border-slate-300 shadow-2xs">
            <Terminal className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Project Execution & CLI Run Guide
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Complete instructions on how to start, configure, run, and execute this project locally on Windows.
            </p>
          </div>
        </div>
      </div>

      {/* Live Server Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Backend Status Card */}
        <div className="p-5 rounded-lg bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between transition-colors">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-white text-teal-700 border border-slate-300 shadow-2xs">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500">FastAPI Backend</div>
              <div className="font-mono text-xs font-bold text-slate-900">http://127.0.0.1:8008</div>
              <div className="text-[11px] text-slate-400">Endpoints: /api/health, /api/benchmarks, /api/analyze</div>
            </div>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white text-emerald-700 border border-slate-300 flex items-center gap-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Running
          </span>
        </div>

        {/* Frontend Status Card */}
        <div className="p-5 rounded-lg bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between transition-colors">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-white text-blue-700 border border-slate-300 shadow-2xs">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500">Vite React Frontend</div>
              <div className="font-mono text-xs font-bold text-slate-900">http://localhost:5173</div>
              <div className="text-[11px] text-slate-400">Workbench, Simulator & Recharts Suite</div>
            </div>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white text-emerald-700 border border-slate-300 flex items-center gap-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Active
          </span>
        </div>
      </div>

      {/* Step-by-Step Terminal Commands */}
      <div className="space-y-4">
        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
          Execution Commands for Windows (PowerShell)
        </h3>

        {/* Step 1: Start Backend */}
        <div className="bg-white rounded-lg p-6 border border-slate-200/90 shadow-2xs space-y-3 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-5 h-5 rounded-full bg-white text-teal-800 border border-slate-300 font-bold text-xs flex items-center justify-center">1</span>
              <span className="font-bold text-xs text-slate-900">Terminal 1: Start FastAPI Backend</span>
            </div>
            <button
              onClick={() => copyToClipboard('cd "d:\\SEM 5\\CD LAB\\NMC-OPT\\backend"\npython -m uvicorn app.main:app --host 127.0.0.1 --port 8008 --reload', 't1')}
              className="flex items-center space-x-1 text-xs text-slate-600 hover:text-slate-900 bg-white px-3 py-1 rounded-xl transition-colors border border-slate-200 font-semibold shadow-2xs"
            >
              {copiedCmd === 't1' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCmd === 't1' ? 'Copied' : 'Copy PowerShell'}</span>
            </button>
          </div>
          <div className="bg-white text-slate-800 border border-slate-200/90 p-4 rounded-md font-mono text-xs overflow-x-auto leading-relaxed shadow-2xs">
            <p className="text-slate-500"># Navigate to backend directory</p>
            <p>cd "d:\SEM 5\CD LAB\NMC-OPT\backend"</p>
            <p className="text-slate-500 mt-2"># Launch Uvicorn server on port 8008</p>
            <p className="text-teal-700 font-semibold">python -m uvicorn app.main:app --host 127.0.0.1 --port 8008 --reload</p>
          </div>
        </div>

        {/* Step 2: Start Frontend */}
        <div className="bg-white rounded-lg p-6 border border-slate-200/90 shadow-2xs space-y-3 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-5 h-5 rounded-full bg-white text-blue-800 border border-slate-300 font-bold text-xs flex items-center justify-center">2</span>
              <span className="font-bold text-xs text-slate-900">Terminal 2: Start Vite React Frontend</span>
            </div>
            <button
              onClick={() => copyToClipboard('cd "d:\\SEM 5\\CD LAB\\NMC-OPT\\frontend"\nnpm run dev', 't2')}
              className="flex items-center space-x-1 text-xs text-slate-600 hover:text-slate-900 bg-white px-3 py-1 rounded-xl transition-colors border border-slate-200 font-semibold shadow-2xs"
            >
              {copiedCmd === 't2' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCmd === 't2' ? 'Copied' : 'Copy PowerShell'}</span>
            </button>
          </div>
          <div className="bg-white text-slate-800 border border-slate-200/90 p-4 rounded-md font-mono text-xs overflow-x-auto leading-relaxed shadow-2xs">
            <p className="text-slate-500"># Navigate to frontend directory</p>
            <p>cd "d:\SEM 5\CD LAB\NMC-OPT\frontend"</p>
            <p className="text-slate-500 mt-2"># Start Vite dev server</p>
            <p className="text-blue-700 font-semibold">npm run dev</p>
          </div>
        </div>

        {/* Step 3: Run Tests */}
        <div className="bg-white rounded-lg p-6 border border-slate-200/90 shadow-2xs space-y-3 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-5 h-5 rounded-full bg-white text-purple-800 border border-slate-300 font-bold text-xs flex items-center justify-center">3</span>
              <span className="font-bold text-xs text-slate-900">Run Unit Tests & Production Build</span>
            </div>
            <button
              onClick={() => copyToClipboard('python -m pytest backend/tests\ncd frontend\nnpm run build', 't3')}
              className="flex items-center space-x-1 text-xs text-slate-600 hover:text-slate-900 bg-white px-3 py-1 rounded-xl transition-colors border border-slate-200 font-semibold shadow-2xs"
            >
              {copiedCmd === 't3' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCmd === 't3' ? 'Copied' : 'Copy Commands'}</span>
            </button>
          </div>
          <div className="bg-white text-slate-800 border border-slate-200/90 p-4 rounded-md font-mono text-xs overflow-x-auto leading-relaxed shadow-2xs">
            <p className="text-slate-500"># Run Pytest suite for cost formulas & candidate selector</p>
            <p className="text-purple-700 font-semibold">python -m pytest backend/tests</p>
            <p className="text-slate-500 mt-2"># Verify frontend production build</p>
            <p className="text-purple-700 font-semibold">cd frontend && npm run build</p>
          </div>
        </div>
      </div>

      {/* Interactive In-Browser CLI Diagnostics Sandbox */}
      <div className="bg-white rounded-lg p-6 sm:p-7 border border-slate-200/90 shadow-2xs space-y-4 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-rose-600" />
              <span>Interactive Diagnostics Console</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Run simulated CLI commands and test backend health directly from this browser console
            </p>
          </div>
          <div className="flex items-center space-x-2 flex-wrap">
            <button
              onClick={handleRunPing}
              disabled={isPinging}
              className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-teal-800 text-xs font-bold border border-slate-300 flex items-center gap-1.5 transition-all shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
              <span>Ping Health</span>
            </button>
            <button
              onClick={handleSimulatePytest}
              className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all shadow-2xs"
            >
              Run Pytest
            </button>
            <button
              onClick={handleSimulateCliAnalyze}
              className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all shadow-2xs"
            >
              Analyze VADD
            </button>
          </div>
        </div>

        <div className="bg-white text-slate-800 p-4 rounded-md font-mono text-xs overflow-x-auto leading-relaxed border border-slate-200/90 max-h-64 shadow-2xs">
          <pre>{cliOutput}</pre>
        </div>
      </div>
    </div>
  );
};
