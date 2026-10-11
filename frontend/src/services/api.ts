import type { 
  AnalysisRequest, 
  AnalysisResponse, 
  BenchmarkMetadata, 
  CostModelParameters, 
  ResearchGraphsRequest, 
  ResearchGraphsResponse 
} from '../types';
import { FALLBACK_BENCHMARKS } from '../data/defaults';

const API_BASE_URL = '/api';

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, { signal: AbortSignal.timeout(2500) });
    return res.ok;
  } catch {
    // Attempt direct port 8008 fallback
    try {
      const res = await fetch(`http://127.0.0.1:8008/api/health`, { signal: AbortSignal.timeout(2000) });
      return res.ok;
    } catch {
      return false;
    }
  }
}

export async function fetchBenchmarks(): Promise<BenchmarkMetadata[]> {
  try {
    let res: Response;
    try {
      res = await fetch(`${API_BASE_URL}/benchmarks`, { signal: AbortSignal.timeout(3000) });
    } catch {
      res = await fetch(`http://127.0.0.1:8008/api/benchmarks`, { signal: AbortSignal.timeout(3000) });
    }
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Backend unavailable, using fallback benchmarks', err);
    return FALLBACK_BENCHMARKS;
  }
}

export async function analyzeKernel(request: AnalysisRequest): Promise<AnalysisResponse> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    res = await fetch(`http://127.0.0.1:8008/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(8000),
    });
  }

  if (!res.ok) {
    const errData = await res.json().catch(() => ({ detail: 'Unknown error occurred' }));
    throw new Error(errData.detail || `Analysis failed with status ${res.status}`);
  }

  return await res.json();
}

export interface ChatPayload {
  message: string;
  kernel_id?: string;
  kernel_name?: string;
  input_size?: number;
  source_code?: string;
  recommendation?: string;
  speedup_vs_cpu?: number;
  estimated_cost_ms?: number;
  arithmetic_intensity?: number;
  is_bandwidth_bound?: boolean;
  loop_bounds?: string;
  memory_access_pattern?: string;
  total_bytes_moved?: number;
  estimated_operations?: number;
  crossover_elements?: number | null;
  dominant_factor?: string;
  transformations?: any[];
  candidates?: any[];
  parameters?: CostModelParameters;
}

export async function sendChatMessage(
  payloadOrMessage: string | ChatPayload,
  kernelId?: string,
  inputSize?: number,
  recommendation?: string
): Promise<{ reply: string; suggested_actions: string[] }> {
  try {
    let payload: ChatPayload;
    if (typeof payloadOrMessage === 'string') {
      payload = {
        message: payloadOrMessage,
        kernel_id: kernelId,
        input_size: inputSize,
        recommendation: recommendation,
      };
    } else {
      payload = payloadOrMessage;
    }

    const body = JSON.stringify(payload);
    
    let res: Response;
    try {
      res = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        signal: AbortSignal.timeout(8000),
      });
    } catch {
      res = await fetch(`http://127.0.0.1:8008/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        signal: AbortSignal.timeout(8000),
      });
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    // Intelligent offline fallback
    const msg = typeof payloadOrMessage === 'string' ? payloadOrMessage : payloadOrMessage.message;
    return {
      reply: `[Offline Assistant] Evaluating "${msg}". In Near-Memory Computing, data movement between host CPU and memory banks across the PCIe/CXL bus is the primary cost factor. When input size is large, high internal DRAM bank bandwidth (160+ GB/s) offsets launch overheads.`,
      suggested_actions: ['Increase problem size', 'View Latency Breakdown chart', 'Inspect 7-Stage Pipeline'],
    };
  }
}

export async function fetchResearchGraphs(req?: ResearchGraphsRequest): Promise<ResearchGraphsResponse> {
  let res: Response;
  const isPost = Boolean(req && (req.parameters || req.breakdown_n || req.speedup_n));
  const options: RequestInit = isPost 
    ? {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req),
        signal: AbortSignal.timeout(10000),
      }
    : {
        method: 'GET',
        signal: AbortSignal.timeout(10000),
      };

  try {
    res = await fetch(`${API_BASE_URL}/research-graphs`, options);
  } catch {
    res = await fetch(`http://127.0.0.1:8008/api/research-graphs`, options);
  }

  if (!res.ok) {
    const errData = await res.json().catch(() => ({ detail: 'Failed to fetch research graphs' }));
    throw new Error(errData.detail || `HTTP error ${res.status}`);
  }

  return await res.json();
}

