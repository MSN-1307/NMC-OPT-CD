#!/usr/bin/env python3
"""
NMC-Opt Studio: Workload & Dataset Generator Utility
---------------------------------------------------
Generates synthetic data arrays and matrices for testing Near-Memory Computing
compiler kernels, simulating real-world memory footprint sizes from 100K to 10M elements.
"""

import os
import sys
import argparse
import numpy as np

def generate_vector(size: int, output_dir: str, name: str = "vector") -> str:
    """Generate a single-precision floating point 1D array."""
    os.makedirs(output_dir, exist_ok=True)
    filepath = os.path.join(output_dir, f"{name}_{size}.bin")
    data = np.random.uniform(-1.0, 1.0, size).astype(np.float32)
    data.tofile(filepath)
    size_mb = (size * 4) / (1024 * 1024)
    print(f"[Generated] {filepath} ({size:,} float32 elements = {size_mb:.2f} MB)")
    return filepath

def generate_matrix(rows: int, cols: int, output_dir: str, name: str = "matrix") -> str:
    """Generate a single-precision floating point 2D matrix."""
    os.makedirs(output_dir, exist_ok=True)
    filepath = os.path.join(output_dir, f"{name}_{rows}x{cols}.bin")
    data = np.random.uniform(-1.0, 1.0, (rows, cols)).astype(np.float32)
    data.tofile(filepath)
    size_mb = (rows * cols * 4) / (1024 * 1024)
    print(f"[Generated] {filepath} ({rows}x{cols} elements = {size_mb:.2f} MB)")
    return filepath

def main():
    parser = argparse.ArgumentParser(description="Generate synthetic workload datasets for NMC-OPT")
    parser.add_argument("--scale", type=int, default=1_000_000, help="Workload element count (default: 1,000,000)")
    parser.add_argument("--rows", type=int, default=2048, help="Matrix rows (default: 2048)")
    parser.add_argument("--cols", type=int, default=2048, help="Matrix columns (default: 2048)")
    parser.add_argument("--output-dir", type=str, default="datasets/generated", help="Target output directory")
    args = parser.parse_args()

    print("=" * 60)
    print("NMC-OPT STUDIO DATASET GENERATOR")
    print("=" * 60)
    generate_vector(args.scale, args.output_dir, "input_vector_A")
    generate_vector(args.scale, args.output_dir, "input_vector_B")
    generate_matrix(args.rows, args.cols, args.output_dir, "input_matrix_GEMV")
    print("=" * 60)
    print("Dataset generation complete. Files ready for pipeline testing.")

if __name__ == "__main__":
    main()
