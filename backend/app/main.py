from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from app.schemas import (
    AnalysisRequest,
    AnalysisResponse,
    BenchmarkMetadata
)
from app.benchmarks import get_all_benchmarks, get_benchmark
from app.optimizer import NMCOptimizerEngine

app = FastAPI(
    title="NMC-Opt Studio Backend API",
    description="Adaptive Data-Movement-Aware Compiler Optimization Workbench for Near-Memory Computing",
    version="1.0.0"
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "app": "NMC-Opt Studio Backend",
        "version": "1.0.0",
        "model": "Analytical First-Principles Cost Model"
    }

@app.get("/api/benchmarks", response_model=List[BenchmarkMetadata])
def list_benchmarks():
    return get_all_benchmarks()

@app.get("/api/benchmarks/{benchmark_id}", response_model=BenchmarkMetadata)
def retrieve_benchmark(benchmark_id: str):
    bm = get_benchmark(benchmark_id)
    if not bm:
        raise HTTPException(status_code=404, detail=f"Benchmark '{benchmark_id}' not found.")
    return bm

from app.schemas import (
    AnalysisRequest,
    AnalysisResponse,
    BenchmarkMetadata,
    ChatRequest,
    ChatResponse,
    ResearchGraphsRequest,
    ResearchGraphsResponse
)
from app.research_suite import ResearchSuiteEngine

@app.get("/api/research-graphs", response_model=ResearchGraphsResponse)
def get_research_graphs_suite():
    return ResearchSuiteEngine.generate_research_graphs(ResearchGraphsRequest())

@app.post("/api/research-graphs", response_model=ResearchGraphsResponse)
def compute_research_graphs_suite(request: ResearchGraphsRequest):
    try:
        return ResearchSuiteEngine.generate_research_graphs(request)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Research graph generation failed: {str(e)}")

@app.post("/api/analyze", response_model=AnalysisResponse)
def analyze_kernel(request: AnalysisRequest):
    try:
        response = NMCOptimizerEngine.run_pipeline(request)
        return response
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Analysis failed: {str(e)}")

from app.copilot import CompilerCopilotEngine

@app.post("/api/chat", response_model=ChatResponse)
def compiler_chat_assistant(req: ChatRequest):
    try:
        return CompilerCopilotEngine.answer(req)
    except Exception as e:
        return ChatResponse(
            reply=f"Error evaluating query for {req.kernel_id}: {str(e)}",
            suggested_actions=["Check loop syntax in Workbench", "Re-run analysis"]
        )


