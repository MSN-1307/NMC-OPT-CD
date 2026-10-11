import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  ArrowRight, 
  RefreshCw,
  Copy,
  Check,
  FileCode2,
  Cpu,
  Layers,
  Zap,
  HardDrive
} from 'lucide-react';
import type { ChatMessage, BenchmarkMetadata, AnalysisResponse } from '../types';
import type { TabType } from '../components/Sidebar';
import { sendChatMessage } from '../services/api';

interface ChatViewProps {
  activeBenchmark: BenchmarkMetadata;
  analysisResult: AnalysisResponse | null;
  onNavigateTab: (tab: TabType) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  activeBenchmark,
  analysisResult,
  onNavigateTab,
}) => {
  const isCustom = activeBenchmark.id === 'custom';
  const initialGreeting = `Hello! I'm your NMC-Opt Compiler Copilot. I'm actively inspecting your uploaded file: "${activeBenchmark.name}" (${isCustom ? 'Custom Ingested C Loop' : 'Canonical C Benchmark'}).\n\nAsk me anything about its memory-bound bottlenecks, arithmetic intensity, crossover scaling points, or why the compiler selected "${analysisResult?.recommendation.strategy || 'NMC + Bank Interleaved Striping'}"!`;

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'assistant',
      text: initialGreeting,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedActions: [
        `Explain code structure of ${activeBenchmark.name}`,
        `Why did compiler pick ${analysisResult?.recommendation?.strategy || 'NMC'}?`,
        `What is the crossover point for this file?`,
        `Show optimized DPU C code for ${activeBenchmark.name}`,
      ],
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleCopyText = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSend = async (textToSend = input) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Send full dynamic context of the currently uploaded file and analysis facts
      const resp = await sendChatMessage({
        message: textToSend,
        kernel_id: activeBenchmark.id,
        kernel_name: activeBenchmark.name,
        input_size: analysisResult?.analysis.iterations || activeBenchmark.default_size,
        source_code: activeBenchmark.source_code,
        recommendation: analysisResult?.recommendation.strategy,
        speedup_vs_cpu: analysisResult?.recommendation.speedup_vs_cpu,
        estimated_cost_ms: analysisResult?.recommendation.estimated_cost_ms,
        arithmetic_intensity: analysisResult?.analysis.arithmetic_intensity,
        is_bandwidth_bound: analysisResult?.analysis.is_bandwidth_bound,
        loop_bounds: analysisResult?.analysis.loop_bounds,
        memory_access_pattern: analysisResult?.analysis.memory_access_pattern,
        total_bytes_moved: analysisResult?.analysis.total_bytes_moved,
        estimated_operations: analysisResult?.analysis.estimated_operations,
        crossover_elements: analysisResult?.crossover_elements,
        dominant_factor: analysisResult?.candidates?.find(c => c.strategy === analysisResult.recommendation.strategy)?.dominant_factor,
        transformations: analysisResult?.transformations,
        candidates: analysisResult?.candidates,
      });

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: resp.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: resp.suggested_actions,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: 'Sorry, I encountered an issue processing that query. Please verify that the backend service is running on port 8008.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = (action: string) => {
    if (action.includes('Workbench')) onNavigateTab('workbench');
    else if (action.includes('Pipeline') || action.includes('Stage')) onNavigateTab('pipeline');
    else if (action.includes('Breakdown') || action.includes('Chart') || action.includes('Graph')) onNavigateTab('analytics');
    else if (action.includes('Memory') || action.includes('Simulator')) onNavigateTab('simulator');
    else if (action.includes('Execution') || action.includes('Guide')) onNavigateTab('execution');
    else if (action.includes('Methodology')) onNavigateTab('methodology');
    else handleSend(action);
  };

  // Helper to render markdown-like formatted text with code blocks and bold highlights
  const renderFormattedMessage = (content: string, msgIdx: number) => {
    // Check if message contains code block ```c ... ```
    const codeBlockRegex = /```(?:c|cpp)?\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    let blockCount = 0;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: content.substring(lastIndex, match.index),
        });
      }
      parts.push({
        type: 'code',
        content: match[1],
        id: `code-${msgIdx}-${blockCount++}`,
      });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      parts.push({
        type: 'text',
        content: content.substring(lastIndex),
      });
    }

    return (
      <div className="space-y-3 leading-relaxed text-xs">
        {parts.map((p, pIdx) => {
          if (p.type === 'code') {
            const isCopied = copiedIndex === pIdx;
            return (
              <div key={pIdx} className="my-2.5 rounded-2xl border-2 border-slate-200 bg-white shadow-xs overflow-hidden">
                <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-[11px] font-mono text-slate-700">
                  <span className="flex items-center gap-1 font-bold text-teal-800">
                    <FileCode2 className="w-3.5 h-3.5 text-teal-600" />
                    <span>UPMEM / NMC C Kernel</span>
                  </span>
                  <button
                    onClick={() => handleCopyText(p.content, pIdx)}
                    className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md hover:bg-slate-200 text-slate-600 transition-colors font-medium"
                    title="Copy code"
                  >
                    {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{isCopied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-white font-mono text-[11px] overflow-x-auto leading-normal text-slate-900">
                  <code>{p.content}</code>
                </pre>
              </div>
            );
          }

          // Plain text formatting with headers and lists
          return (
            <div key={pIdx} className="whitespace-pre-wrap space-y-1">
              {p.content.split('\n').map((line, lIdx) => {
                if (line.startsWith('### ')) {
                  return (
                    <h3 key={lIdx} className="font-bold text-sm text-slate-900 pt-1 border-b border-slate-100 pb-1 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                      <span>{line.replace('### ', '')}</span>
                    </h3>
                  );
                }
                if (line.startsWith('**') && line.endsWith('**')) {
                  return (
                    <div key={lIdx} className="font-bold text-slate-900 pt-1">
                      {line.replace(/\*\*/g, '')}
                    </div>
                  );
                }
                // Format lines with inline bolding
                return (
                  <p key={lIdx} className="text-slate-800">
                    {line}
                  </p>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col bg-white rounded-3xl border-2 border-slate-200 shadow-sm overflow-hidden transition-colors">
      {/* Header */}
      <div className="px-6 py-4 border-b-2 border-slate-200 bg-white flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-teal-50 text-teal-700 rounded-2xl border-2 border-teal-400 shadow-xs">
            <Bot className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span>Compiler AI Copilot</span>
              <span className="text-[10px] font-mono bg-teal-50 text-teal-800 font-bold px-2 py-0.5 rounded-full border border-teal-300">
                File-Aware & Dynamic
              </span>
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Active File: <strong className="text-slate-900">{activeBenchmark.name}</strong> • Placement: <span className="text-teal-700 font-bold">{analysisResult?.recommendation.strategy || 'NMC + Bank Interleaved Striping'}</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => setMessages([messages[0]])}
          className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white border-2 border-slate-200 transition-colors shadow-xs font-bold"
          title="Reset conversation"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          <span>Clear Chat</span>
        </button>
      </div>

      {/* Quick Action Suggestion Chips Bar */}
      <div className="px-6 py-2 bg-slate-50 border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-[11px]">
        <span className="text-slate-500 font-bold uppercase text-[10px] shrink-0">Ask Copilot:</span>
        <button
          onClick={() => handleSend(`Why did the compiler choose ${analysisResult?.recommendation?.strategy || 'NMC'} for this file?`)}
          className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 hover:border-teal-500 text-slate-700 hover:text-teal-800 font-medium shrink-0 transition-colors shadow-2xs"
        >
          Why {analysisResult?.recommendation?.strategy ? 'this strategy' : 'NMC'}?
        </button>
        <button
          onClick={() => handleSend(`Explain the code structure and memory traffic of ${activeBenchmark.name}`)}
          className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 hover:border-teal-500 text-slate-700 hover:text-teal-800 font-medium shrink-0 transition-colors shadow-2xs"
        >
          Inspect Code Structure
        </button>
        <button
          onClick={() => handleSend(`What is the physical crossover point for ${activeBenchmark.name}?`)}
          className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 hover:border-teal-500 text-slate-700 hover:text-teal-800 font-medium shrink-0 transition-colors shadow-2xs"
        >
          Crossover Point
        </button>
        <button
          onClick={() => handleSend(`Show me the optimized UPMEM DPU C code for ${activeBenchmark.name}`)}
          className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 hover:border-teal-500 text-slate-700 hover:text-teal-800 font-medium shrink-0 transition-colors shadow-2xs"
        >
          Generate DPU C Code
        </button>
        <button
          onClick={() => handleSend(`How much energy is saved by near-memory execution in ${activeBenchmark.name}?`)}
          className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 hover:border-teal-500 text-slate-700 hover:text-teal-800 font-medium shrink-0 transition-colors shadow-2xs"
        >
          Energy Savings (mJ)
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-white">
        {messages.map((m, mIdx) => {
          const isBot = m.sender === 'assistant';
          return (
            <div
              key={m.id}
              className={`flex items-start space-x-3 ${isBot ? '' : 'flex-row-reverse space-x-reverse'}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold shadow-xs ${
                  isBot
                    ? 'bg-teal-600 text-white'
                    : 'bg-indigo-600 text-white'
                }`}
              >
                {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              <div className={`max-w-[85%] space-y-2`}>
                <div
                  className={`p-4 rounded-2xl text-xs leading-relaxed ${
                    isBot
                      ? 'bg-white border-2 border-slate-200 text-slate-900 shadow-xs'
                      : 'bg-indigo-600 text-white font-medium shadow-sm'
                  }`}
                >
                  {isBot ? (
                    renderFormattedMessage(m.text, mIdx)
                  ) : (
                    <p className="whitespace-pre-wrap">{m.text}</p>
                  )}
                </div>

                <div className="flex items-center space-x-2 text-[10px] text-slate-400 px-1 font-mono">
                  <span>{m.timestamp}</span>
                </div>

                {/* Suggested actions chips */}
                {isBot && m.suggestedActions && m.suggestedActions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {m.suggestedActions.map((action, i) => (
                      <button
                        key={i}
                        onClick={() => handleActionClick(action)}
                        className="text-[11px] px-3 py-1 rounded-xl border-2 border-slate-200 bg-white text-slate-800 hover:border-teal-500 hover:text-teal-800 transition-all shadow-xs flex items-center gap-1 font-semibold"
                      >
                        <span>{action}</span>
                        <ArrowRight className="w-2.5 h-2.5 text-slate-400" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs shadow-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-2xl bg-white border-2 border-slate-200 text-xs text-slate-600 flex items-center space-x-2 shadow-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping"></span>
              <span>Reasoning across uploaded code AST & cost model equations...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-4 border-t-2 border-slate-200 bg-white transition-colors">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            placeholder={`Ask about ${activeBenchmark.name}, memory wall, crossover point, or DPU code generation...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-xl border-2 border-slate-200 bg-white text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-xs"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2.5 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 disabled:opacity-50 text-white rounded-xl transition-all shadow-sm shadow-teal-600/30"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
