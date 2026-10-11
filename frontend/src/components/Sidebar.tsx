import React from 'react';
import { 
  Home,
  Cpu, 
  Layers, 
  BarChart3, 
  GitCommit, 
  HardDrive, 
  BookOpen, 
  MessageSquare, 
  Terminal, 
  Upload, 
  Zap, 
  LogIn, 
  User, 
  PanelLeftClose, 
  Play, 
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import type { UserProfile } from '../types';

export type TabType = 
  | 'home' 
  | 'workbench' 
  | 'simulator' 
  | 'results'
  | 'analytics' 
  | 'pipeline' 
  | 'memory' 
  | 'chat' 
  | 'execution' 
  | 'benchmarks' 
  | 'methodology';

interface SidebarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  backendOnline: boolean;
  selectedKernelName: string;
  recommendedStrategy?: string;
  speedup?: number;
  currentUser: UserProfile;
  onOpenLoginModal: () => void;
  onOpenUploadModal: () => void;
  isOpen: boolean;
  onToggleSidebar: () => void;
}

interface NavSection {
  title: string;
  items: {
    id: TabType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
    badgeColor?: string;
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  backendOnline,
  currentUser,
  onOpenLoginModal,
  onOpenUploadModal,
  isOpen,
  onToggleSidebar,
}) => {
  const sections: NavSection[] = [
    {
      title: 'Core Workspaces',
      items: [
        { id: 'home', label: 'Home Hub', icon: Home, badge: 'Overview' },
        { id: 'workbench', label: 'Workbench', icon: Cpu, badge: 'Core' },
        { id: 'simulator', label: 'Execution Simulator', icon: Play, badge: 'Step Demo' },
      ],
    },
    {
      title: 'Compiler Analysis',
      items: [
        { id: 'results', label: 'Research Results & Graphs', icon: TrendingUp, badge: 'Paper 4 Figs' },
        { id: 'analytics', label: 'Analytics & Graphs', icon: BarChart3, badge: 'Charts' },
        { id: 'pipeline', label: 'Compiler Pipeline', icon: Layers, badge: '7 Stages' },
        { id: 'memory', label: 'Memory & Layout', icon: HardDrive, badge: 'DRAM PIM' },
      ],
    },
    {
      title: 'Copilot & Guides',
      items: [
        { id: 'chat', label: 'Compiler Copilot', icon: MessageSquare, badge: 'AI Chat' },
        { id: 'execution', label: 'Execution Guide', icon: Terminal, badge: 'CLI' },
        { id: 'benchmarks', label: 'Benchmark Suite', icon: GitCommit, badge: '5 Kernels' },
        { id: 'methodology', label: 'Methodology & About', icon: BookOpen, badge: 'Docs' },
      ],
    },
  ];

  return (
    <aside 
      className={`${
        isOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full border-r-0 pointer-events-none'
      } bg-white border-slate-200/90 text-slate-800 border-r flex flex-col h-screen select-none shrink-0 shadow-sm transition-all duration-300 ease-in-out overflow-hidden z-30`}
    >
      {/* Brand Header */}
      <div className="p-4 border-b flex items-center justify-between transition-colors bg-white border-slate-100">
        <div 
          onClick={() => onSelectTab('home')}
          className="flex items-center space-x-2.5 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white flex items-center justify-center shadow-md shadow-teal-600/25 group-hover:scale-105 transition-transform">
            <Zap className="w-5 h-5 text-teal-100 fill-teal-100" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h1 className="font-bold tracking-tight text-sm text-slate-900">
                NMC-Opt
              </h1>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-white text-teal-700 border border-teal-300 font-semibold">
                Studio
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500">Near-Memory Compiler</p>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          {/* Close Sidebar Button */}
          <button
            onClick={onToggleSidebar}
            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all shadow-2xs"
            title="Close sidebar (Ctrl+B)"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Backend Status indicator */}
      <div className="px-4 py-2 border-b flex items-center justify-between text-xs transition-colors bg-white border-slate-200">
        <span className="text-[11px] font-medium text-slate-500">Compiler Engine:</span>
        <div className="flex items-center space-x-1.5">
          {backendOnline ? (
            <span className="flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-white border-2 border-emerald-400 text-emerald-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>FastAPI Live</span>
            </span>
          ) : (
            <span className="flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-white border-2 border-amber-400 text-amber-700">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              <span>Local Fallback</span>
            </span>
          )}
        </div>
      </div>

      {/* Quick Upload Action */}
      <div className="p-3 pb-1">
        <button
          onClick={onOpenUploadModal}
          className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl text-xs font-semibold transition-all shadow-2xs border bg-white hover:bg-slate-50 text-teal-800 border-2 border-teal-300"
        >
          <Upload className="w-3.5 h-3.5 text-teal-600" />
          <span>Ingest Custom Loop (.c)</span>
        </button>
      </div>

      {/* Grouped Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-4 overflow-y-auto">
        {sections.map((section) => (
          <div key={section.title} className="space-y-1">
            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {section.title}
            </div>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-all ${
                      isActive
                        ? 'bg-white text-teal-900 font-bold border-2 border-teal-500 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 truncate">
                      <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? 'text-teal-600' : 'text-slate-500'
                      }`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono shrink-0 transition-colors ${
                        isActive 
                          ? 'bg-white text-teal-800 border border-teal-400 font-bold'
                          : 'bg-white text-slate-500 border border-slate-200'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Session Profile Card */}
      <div className="p-3 border-t transition-colors bg-white border-slate-200">
        <div 
          onClick={onOpenLoginModal}
          className="p-2.5 rounded-xl border border-slate-200 hover:border-teal-300 hover:bg-slate-50 bg-white cursor-pointer transition-all flex items-center justify-between shadow-2xs group text-slate-800"
        >
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs">
              {currentUser.avatarInitials}
            </div>
            <div className="truncate">
              <div className="text-xs font-semibold truncate leading-tight text-slate-900">
                {currentUser.name}
              </div>
              <div className="text-[10px] truncate text-slate-500">
                {currentUser.role}
              </div>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-500 group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </aside>
  );
};
