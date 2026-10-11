import React, { useState, useEffect } from 'react';
import { Sidebar, TabType } from './components/Sidebar';
import { Header } from './components/Header';
import { ParameterModal } from './components/ParameterModal';
import { IRModal } from './components/IRModal';
import { LoginModal } from './components/LoginModal';
import { FileUploadModal } from './components/FileUploadModal';
import { AnalysisExplanationModal } from './components/AnalysisExplanationModal';
import { HomeView } from './views/HomeView';
import { WorkbenchView } from './views/WorkbenchView';
import { AnalyticsView } from './views/AnalyticsView';
import { PipelineView } from './views/PipelineView';
import { MemoryLayoutView } from './views/MemoryLayoutView';
import { BenchmarkSuiteView } from './views/BenchmarkSuiteView';
import { MethodologyView } from './views/MethodologyView';
import { ExecutionGuideView } from './views/ExecutionGuideView';
import { SimulatorView } from './views/SimulatorView';
import { ResearchGraphsView } from './views/ResearchGraphsView';
import { ChatView } from './views/ChatView';
import type { 
  BenchmarkMetadata, 
  CostModelParameters, 
  AnalysisResponse,
  UserProfile
} from './types';
import { DEFAULT_PARAMETERS, FALLBACK_BENCHMARKS } from './data/defaults';
import { checkBackendHealth, fetchBenchmarks, analyzeKernel } from './services/api';
import { AlertCircle, X } from 'lucide-react';

const DEFAULT_USER: UserProfile = {
  name: 'Alex Chen',
  email: 'alex.chen@compiler.edu',
  role: 'Student',
  avatarInitials: 'AC',
  isLoggedIn: true,
};

export function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [benchmarks, setBenchmarks] = useState<BenchmarkMetadata[]>(FALLBACK_BENCHMARKS);
  const [selectedBenchmark, setSelectedBenchmark] = useState<BenchmarkMetadata>(FALLBACK_BENCHMARKS[0]);
  const [inputSize, setInputSize] = useState<number>(FALLBACK_BENCHMARKS[0].default_size);
  const [matrixRows, setMatrixRows] = useState<number>(2048);
  const [matrixCols, setMatrixCols] = useState<number>(2048);
  const [parameters, setParameters] = useState<CostModelParameters>(DEFAULT_PARAMETERS);
  
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [backendOnline, setBackendOnline] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals
  const [isParameterModalOpen, setIsParameterModalOpen] = useState<boolean>(false);
  const [isIRModalOpen, setIsIRModalOpen] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [isExplanationModalOpen, setIsExplanationModalOpen] = useState<boolean>(false);

  // User Profile
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('nmc_user_profile');
    return saved ? JSON.parse(saved) : DEFAULT_USER;
  });

  // Sidebar state: open/close toggle
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  // Ensure dark mode is permanently removed from the application
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.body.classList.remove('dark');
    localStorage.removeItem('nmc_theme');
    localStorage.removeItem('nmc_theme_mode');
  }, []);

  // Keyboard shortcut Ctrl+B or Cmd+B to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsSidebarOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleToggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const handleLogin = (profile: UserProfile) => {
    setCurrentUser(profile);
    localStorage.setItem('nmc_user_profile', JSON.stringify(profile));
  };

  const handleLogout = () => {
    const guestUser: UserProfile = {
      name: 'Guest User',
      email: 'guest@cdlab.local',
      role: 'Student',
      avatarInitials: 'GU',
      isLoggedIn: false,
    };
    setCurrentUser(guestUser);
    localStorage.setItem('nmc_user_profile', JSON.stringify(guestUser));
  };

  // Initialize and check backend
  useEffect(() => {
    async function init() {
      const isOnline = await checkBackendHealth();
      setBackendOnline(isOnline);
      const bms = await fetchBenchmarks();
      setBenchmarks(bms);
      if (bms.length > 0) {
        setSelectedBenchmark(bms[0]);
        setInputSize(bms[0].default_size);
      }
    }
    init();
  }, []);

  // Perform analysis function
  const runAnalysis = async (
    bmToUse = selectedBenchmark, 
    sizeToUse = inputSize, 
    openDeepDive = false,
    paramsToUse = parameters
  ) => {
    setIsAnalyzing(true);
    setErrorMessage(null);
    try {
      const result = await analyzeKernel({
        benchmark_id: bmToUse.id,
        input_size: sizeToUse,
        matrix_rows: bmToUse.id === 'gemv' ? matrixRows : undefined,
        matrix_cols: bmToUse.id === 'gemv' ? matrixCols : undefined,
        custom_source: bmToUse.id === 'custom' ? bmToUse.source_code : undefined,
        parameters: paramsToUse,
      });
      setAnalysisResult(result);
      if (openDeepDive) {
        setIsExplanationModalOpen(true);
      }
    } catch (err: any) {
      console.error('Analysis error:', err);
      setErrorMessage(err.message || 'Failed to complete analysis.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Run initial analysis once
  useEffect(() => {
    runAnalysis();
  }, []);

  const handleSelectBenchmark = (bm: BenchmarkMetadata) => {
    setSelectedBenchmark(bm);
    setInputSize(bm.default_size);
    runAnalysis(bm, bm.default_size);
  };

  const handleSelectAndRunFromSuite = (bm: BenchmarkMetadata) => {
    setSelectedBenchmark(bm);
    setInputSize(bm.default_size);
    setCurrentTab('workbench');
    runAnalysis(bm, bm.default_size);
  };

  const handleUploadCustomKernel = (customCode: string, customName: string) => {
    const customBm: BenchmarkMetadata = {
      id: 'custom',
      name: customName || 'Custom Ingested Kernel',
      category: 'User Custom Loop',
      description: 'User-provided C loop kernel analyzed via dynamic AST inspection.',
      default_size: 2000000,
      data_type: 'float32',
      element_bytes: 4,
      source_code: customCode,
      matrix_supported: false,
      supported_transforms: ['Custom Interleaving', 'Vectorization'],
    };

    setBenchmarks((prev) => {
      const filtered = prev.filter((b) => b.id !== 'custom');
      return [customBm, ...filtered];
    });

    setSelectedBenchmark(customBm);
    setInputSize(2000000);
    setCurrentTab('workbench');
    runAnalysis(customBm, 2000000);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white text-slate-800">
      {/* Side Navigation Panel with Open/Close Toggle Support */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        backendOnline={backendOnline}
        selectedKernelName={selectedBenchmark.name}
        recommendedStrategy={analysisResult?.recommendation.strategy}
        speedup={analysisResult?.recommendation.speedup_vs_cpu}
        currentUser={currentUser}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
        isOpen={isSidebarOpen}
        onToggleSidebar={handleToggleSidebar}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-white text-slate-800 relative">
        {/* Header with Sidebar Toggle button */}
        <Header
          currentTab={currentTab}
          selectedBenchmark={selectedBenchmark}
          analysisResult={analysisResult}
          onOpenParameterModal={() => setIsParameterModalOpen(true)}
          onOpenUploadModal={() => setIsUploadModalOpen(true)}
          onOpenLoginModal={() => setIsLoginModalOpen(true)}
          onAnalyze={() => runAnalysis(selectedBenchmark, inputSize, true)}
          isAnalyzing={isAnalyzing}
          currentUser={currentUser}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={handleToggleSidebar}
        />

        {/* Global Error Notification */}
        {errorMessage && (
          <div className="mx-8 mt-4 p-3.5 bg-white border-2 border-rose-300 rounded-xl flex items-center justify-between text-xs text-rose-800 animate-in fade-in shadow-2xs">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="p-1 text-rose-400 hover:text-rose-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Dynamic View Panel */}
        <main className="flex-1 overflow-y-auto px-8 py-6 bg-white text-slate-800">
          {currentTab === 'home' && (
            <HomeView
              onNavigate={(tab) => setCurrentTab(tab)}
              onOpenUpload={() => setIsUploadModalOpen(true)}
              activeBenchmark={selectedBenchmark}
              backendOnline={backendOnline}
            />
          )}

          {currentTab === 'simulator' && (
            <SimulatorView
              benchmarks={benchmarks}
              selectedBenchmark={selectedBenchmark}
              onSelectBenchmark={handleSelectBenchmark}
              onNavigateToWorkbench={() => setCurrentTab('workbench')}
            />
          )}

          {currentTab === 'results' && (
            <ResearchGraphsView
              onNavigateWorkbench={() => setCurrentTab('workbench')}
            />
          )}

          {currentTab === 'workbench' && (
            <WorkbenchView
              benchmarks={benchmarks}
              selectedBenchmark={selectedBenchmark}
              onSelectBenchmark={handleSelectBenchmark}
              inputSize={inputSize}
              onChangeInputSize={(sz) => setInputSize(sz)}
              matrixRows={matrixRows}
              matrixCols={matrixCols}
              onChangeMatrixDims={(r, c) => {
                setMatrixRows(r);
                setMatrixCols(c);
              }}
              parameters={parameters}
              onChangeParameters={(newParams) => {
                setParameters(newParams);
                runAnalysis(selectedBenchmark, inputSize, false, newParams);
              }}
              onOpenParameterModal={() => setIsParameterModalOpen(true)}
              onOpenUploadModal={() => setIsUploadModalOpen(true)}
              onAnalyze={() => runAnalysis(selectedBenchmark, inputSize, false)}
              isAnalyzing={isAnalyzing}
              analysisResult={analysisResult}
              onNavigateTab={setCurrentTab}
              onOpenIRModal={() => setIsIRModalOpen(true)}
              onOpenExplanationModal={() => setIsExplanationModalOpen(true)}
            />
          )}

          {currentTab === 'analytics' && (
            <AnalyticsView
              analysisResult={analysisResult}
              parameters={parameters}
              benchmarks={benchmarks}
              onOpenParameterModal={() => setIsParameterModalOpen(true)}
              onNavigateWorkbench={() => setCurrentTab('workbench')}
            />
          )}

          {currentTab === 'pipeline' && (
            <PipelineView
              analysisResult={analysisResult}
              onNavigateWorkbench={() => setCurrentTab('workbench')}
            />
          )}

          {currentTab === 'memory' && (
            <MemoryLayoutView analysisResult={analysisResult} />
          )}

          {currentTab === 'chat' && (
            <ChatView
              activeBenchmark={selectedBenchmark}
              analysisResult={analysisResult}
              onNavigateTab={(tab) => setCurrentTab(tab)}
            />
          )}

          {currentTab === 'execution' && <ExecutionGuideView />}

          {currentTab === 'benchmarks' && (
            <BenchmarkSuiteView
              benchmarks={benchmarks}
              onSelectAndRun={handleSelectAndRunFromSuite}
            />
          )}

          {currentTab === 'methodology' && <MethodologyView />}
        </main>
      </div>

      {/* Parameter Configuration Modal */}
      <ParameterModal
        isOpen={isParameterModalOpen}
        onClose={() => {
          setIsParameterModalOpen(false);
          runAnalysis();
        }}
        parameters={parameters}
        onChangeParameters={(newParams) => setParameters(newParams)}
        onReset={() => setParameters({ ...DEFAULT_PARAMETERS })}
      />

      {/* IR Inspection Modal */}
      {analysisResult && (
        <IRModal
          isOpen={isIRModalOpen}
          onClose={() => setIsIRModalOpen(false)}
          kernelName={analysisResult.kernel_name}
          irText={analysisResult.ir_text}
          irInstructions={analysisResult.simplified_ir}
        />
      )}

      {/* Login & User Profile Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        currentUser={currentUser}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />

      {/* File Upload Modal */}
      <FileUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadCustomKernel={handleUploadCustomKernel}
      />

      {/* Analysis Deep Dive Explanation Modal */}
      <AnalysisExplanationModal
        isOpen={isExplanationModalOpen}
        onClose={() => setIsExplanationModalOpen(false)}
        analysisResult={analysisResult}
        parameters={parameters}
      />
    </div>
  );
}

export default App;
