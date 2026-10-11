from typing import List, Tuple
from app.schemas import IRInstruction, KernelAnalysisFacts

class IRGenerator:
    """
    Generates a simplified, human-readable SSA-style Intermediate Representation (IR)
    for the analyzed kernels, illustrating compiler representations.
    """

    @staticmethod
    def generate(kernel_id: str, facts: KernelAnalysisFacts) -> Tuple[List[IRInstruction], str]:
        instructions: List[IRInstruction] = []
        line = 1

        if kernel_id == "vector_add":
            instructions = [
                IRInstruction(line=1, label="entry", opcode="fn_entry", operands="vector_add(ptr %A, ptr %B, ptr %C, i32 %N)", comment="Kernel entry point"),
                IRInstruction(line=2, label=None, opcode="br", operands="label %loop.cond", comment="Enter loop header"),
                IRInstruction(line=3, label="loop.cond", opcode="phi", operands="i32 [%i, %loop.inc], [0, %entry]", comment="Induction variable i = 0"),
                IRInstruction(line=4, label=None, opcode="icmp_slt", operands="%cmp = icmp slt i32 %i, %N", comment="Check i < N"),
                IRInstruction(line=5, label=None, opcode="br_cond", operands="i1 %cmp, label %loop.body, label %exit", comment="Branch to body or exit"),
                IRInstruction(line=6, label="loop.body", opcode="gep", operands="%ptr.a = getelementptr inbounds float, ptr %A, i32 %i", comment="Compute &A[i] address"),
                IRInstruction(line=7, label=None, opcode="load", operands="float %val.a = load float, ptr %ptr.a, align 4", comment="DRAM read A[i]"),
                IRInstruction(line=8, label=None, opcode="gep", operands="%ptr.b = getelementptr inbounds float, ptr %B, i32 %i", comment="Compute &B[i] address"),
                IRInstruction(line=9, label=None, opcode="load", operands="float %val.b = load float, ptr %ptr.b, align 4", comment="DRAM read B[i]"),
                IRInstruction(line=10, label=None, opcode="fadd", operands="float %res = fadd float %val.a, %val.b", comment="Floating point add (NMC ALU / CPU ALU)"),
                IRInstruction(line=11, label=None, opcode="gep", operands="%ptr.c = getelementptr inbounds float, ptr %C, i32 %i", comment="Compute &C[i] address"),
                IRInstruction(line=12, label=None, opcode="store", operands="store float %res, ptr %ptr.c, align 4", comment="DRAM write C[i]"),
                IRInstruction(line=13, label=None, opcode="br", operands="label %loop.inc", comment="Branch to increment"),
                IRInstruction(line=14, label="loop.inc", opcode="add", operands="i32 %i.next = add nuw nsw i32 %i, 1", comment="i = i + 1"),
                IRInstruction(line=15, label=None, opcode="br", operands="label %loop.cond", comment="Loop back"),
                IRInstruction(line=16, label="exit", opcode="ret", operands="void", comment="Function return"),
            ]
        elif kernel_id == "reduction":
            instructions = [
                IRInstruction(line=1, label="entry", opcode="fn_entry", operands="vector_reduction(ptr %A, i32 %N) -> float", comment="Kernel entry point"),
                IRInstruction(line=2, label=None, opcode="br", operands="label %loop.cond", comment="Enter loop header"),
                IRInstruction(line=3, label="loop.cond", opcode="phi", operands="i32 [%i, %loop.inc], [0, %entry]", comment="Induction variable i = 0"),
                IRInstruction(line=4, label=None, opcode="phi", operands="float [%acc, %loop.inc], [0.0, %entry]", comment="Accumulator register = 0.0"),
                IRInstruction(line=5, label=None, opcode="icmp_slt", operands="%cmp = icmp slt i32 %i, %N", comment="Check i < N"),
                IRInstruction(line=6, label=None, opcode="br_cond", operands="i1 %cmp, label %loop.body, label %exit", comment="Branch"),
                IRInstruction(line=7, label="loop.body", opcode="gep", operands="%ptr.a = getelementptr inbounds float, ptr %A, i32 %i", comment="Compute &A[i] address"),
                IRInstruction(line=8, label=None, opcode="load", operands="float %val = load float, ptr %ptr.a, align 4", comment="DRAM read A[i]"),
                IRInstruction(line=9, label=None, opcode="fadd", operands="float %acc.next = fadd float %acc, %val", comment="Near-bank accumulation"),
                IRInstruction(line=10, label=None, opcode="br", operands="label %loop.inc", comment="Increment block"),
                IRInstruction(line=11, label="loop.inc", opcode="add", operands="i32 %i.next = add nuw nsw i32 %i, 1", comment="i = i + 1"),
                IRInstruction(line=12, label=None, opcode="br", operands="label %loop.cond", comment="Loop back"),
                IRInstruction(line=13, label="exit", opcode="ret", operands="float %acc", comment="Return final reduced scalar"),
            ]
        elif kernel_id == "relu":
            instructions = [
                IRInstruction(line=1, label="entry", opcode="fn_entry", operands="relu(ptr %X, ptr %Y, i32 %N)", comment="Kernel entry point"),
                IRInstruction(line=2, label=None, opcode="br", operands="label %loop.cond", comment="Enter loop"),
                IRInstruction(line=3, label="loop.cond", opcode="phi", operands="i32 [%i, %loop.inc], [0, %entry]", comment="Induction variable i = 0"),
                IRInstruction(line=4, label=None, opcode="icmp_slt", operands="%cmp = icmp slt i32 %i, %N", comment="Check i < N"),
                IRInstruction(line=5, label=None, opcode="br_cond", operands="i1 %cmp, label %loop.body, label %exit", comment="Branch"),
                IRInstruction(line=6, label="loop.body", opcode="gep", operands="%ptr.x = getelementptr inbounds float, ptr %X, i32 %i", comment="Address &X[i]"),
                IRInstruction(line=7, label=None, opcode="load", operands="float %val.x = load float, ptr %ptr.x, align 4", comment="Read X[i]"),
                IRInstruction(line=8, label=None, opcode="fcmp_ogt", operands="i1 %is_pos = fcmp ogt float %val.x, 0.0", comment="Compare X[i] > 0.0"),
                IRInstruction(line=9, label=None, opcode="select", operands="float %out = select i1 %is_pos, float %val.x, float 0.0", comment="CMOV / select 0 or val"),
                IRInstruction(line=10, label=None, opcode="gep", operands="%ptr.y = getelementptr inbounds float, ptr %Y, i32 %i", comment="Address &Y[i]"),
                IRInstruction(line=11, label=None, opcode="store", operands="store float %out, ptr %ptr.y, align 4", comment="Write Y[i]"),
                IRInstruction(line=12, label=None, opcode="br", operands="label %loop.inc", comment="Increment block"),
                IRInstruction(line=13, label="loop.inc", opcode="add", operands="i32 %i.next = add nuw nsw i32 %i, 1", comment="i = i + 1"),
                IRInstruction(line=14, label=None, opcode="br", operands="label %loop.cond", comment="Loop back"),
                IRInstruction(line=15, label="exit", opcode="ret", operands="void", comment="Function return"),
            ]
        elif kernel_id == "gemv":
            instructions = [
                IRInstruction(line=1, label="entry", opcode="fn_entry", operands="gemv(ptr %A, ptr %X, ptr %Y, i32 %N, i32 %M)", comment="Matrix-Vector kernel"),
                IRInstruction(line=2, label=None, opcode="br", operands="label %outer.cond", comment="Enter outer loop"),
                IRInstruction(line=3, label="outer.cond", opcode="phi", operands="i32 [%i, %outer.inc], [0, %entry]", comment="Outer row index i = 0"),
                IRInstruction(line=4, label=None, opcode="icmp_slt", operands="%cmp.i = icmp slt i32 %i, %N", comment="Check i < N"),
                IRInstruction(line=5, label=None, opcode="br_cond", operands="i1 %cmp.i, label %inner.init, label %exit", comment="Branch to row"),
                IRInstruction(line=6, label="inner.init", opcode="phi", operands="float [%sum, %inner.inc], [0.0, %outer.cond]", comment="Row accumulator = 0.0"),
                IRInstruction(line=7, label=None, opcode="phi", operands="i32 [%j, %inner.inc], [0, %outer.cond]", comment="Col index j = 0"),
                IRInstruction(line=8, label=None, opcode="icmp_slt", operands="%cmp.j = icmp slt i32 %j, %M", comment="Check j < M"),
                IRInstruction(line=9, label=None, opcode="br_cond", operands="i1 %cmp.j, label %inner.body, label %row.store", comment="Branch to MAC"),
                IRInstruction(line=10, label="inner.body", opcode="mul_add", operands="%idx = mul i32 %i, %M; %off = add i32 %idx, %j", comment="Row-major index i*M + j"),
                IRInstruction(line=11, label=None, opcode="gep", operands="%ptr.a = getelementptr inbounds float, ptr %A, i32 %off", comment="Address &A[i][j]"),
                IRInstruction(line=12, label=None, opcode="load", operands="float %val.a = load float, ptr %ptr.a, align 4", comment="DRAM read A[i][j]"),
                IRInstruction(line=13, label=None, opcode="gep", operands="%ptr.x = getelementptr inbounds float, ptr %X, i32 %j", comment="Address &X[j]"),
                IRInstruction(line=14, label=None, opcode="load", operands="float %val.x = load float, ptr %ptr.x, align 4", comment="Vector read X[j]"),
                IRInstruction(line=15, label=None, opcode="fmul", operands="float %prod = fmul float %val.a, %val.x", comment="Multiply A[i][j] * X[j]"),
                IRInstruction(line=16, label=None, opcode="fadd", operands="float %sum.next = fadd float %sum, %prod", comment="Accumulate row dot-product"),
                IRInstruction(line=17, label=None, opcode="br", operands="label %inner.inc", comment="Increment inner"),
                IRInstruction(line=18, label="inner.inc", opcode="add", operands="i32 %j.next = add nuw nsw i32 %j, 1", comment="j = j + 1"),
                IRInstruction(line=19, label=None, opcode="br", operands="label %inner.init", comment="Inner loop back"),
                IRInstruction(line=20, label="row.store", opcode="gep", operands="%ptr.y = getelementptr inbounds float, ptr %Y, i32 %i", comment="Address &Y[i]"),
                IRInstruction(line=21, label=None, opcode="store", operands="store float %sum, ptr %ptr.y, align 4", comment="Store result Y[i]"),
                IRInstruction(line=22, label=None, opcode="br", operands="label %outer.inc", comment="Branch to outer inc"),
                IRInstruction(line=23, label="outer.inc", opcode="add", operands="i32 %i.next = add nuw nsw i32 %i, 1", comment="i = i + 1"),
                IRInstruction(line=24, label=None, opcode="br", operands="label %outer.cond", comment="Outer loop back"),
                IRInstruction(line=25, label="exit", opcode="ret", operands="void", comment="Function return"),
            ]
        else: # fused_scale_add or generic
            instructions = [
                IRInstruction(line=1, label="entry", opcode="fn_entry", operands="axpy(float %alpha, ptr %X, ptr %Y, i32 %N)", comment="AXPY kernel"),
                IRInstruction(line=2, label=None, opcode="br", operands="label %loop.cond", comment="Enter loop"),
                IRInstruction(line=3, label="loop.cond", opcode="phi", operands="i32 [%i, %loop.inc], [0, %entry]", comment="Induction i = 0"),
                IRInstruction(line=4, label=None, opcode="icmp_slt", operands="%cmp = icmp slt i32 %i, %N", comment="Check i < N"),
                IRInstruction(line=5, label=None, opcode="br_cond", operands="i1 %cmp, label %loop.body, label %exit", comment="Branch"),
                IRInstruction(line=6, label="loop.body", opcode="gep", operands="%ptr.x = getelementptr inbounds float, ptr %X, i32 %i", comment="Address &X[i]"),
                IRInstruction(line=7, label=None, opcode="load", operands="float %val.x = load float, ptr %ptr.x, align 4", comment="Load X[i]"),
                IRInstruction(line=8, label=None, opcode="gep", operands="%ptr.y = getelementptr inbounds float, ptr %Y, i32 %i", comment="Address &Y[i]"),
                IRInstruction(line=9, label=None, opcode="load", operands="float %val.y = load float, ptr %ptr.y, align 4", comment="Load Y[i]"),
                IRInstruction(line=10, label=None, opcode="fmul", operands="float %scaled = fmul float %alpha, %val.x", comment="Scale alpha * X[i]"),
                IRInstruction(line=11, label=None, opcode="fadd", operands="float %res = fadd float %scaled, %val.y", comment="Add to Y[i]"),
                IRInstruction(line=12, label=None, opcode="store", operands="store float %res, ptr %ptr.y, align 4", comment="Writeback Y[i]"),
                IRInstruction(line=13, label="loop.inc", opcode="add", operands="i32 %i.next = add nuw nsw i32 %i, 1", comment="i = i + 1"),
                IRInstruction(line=14, label=None, opcode="br", operands="label %loop.cond", comment="Loop back"),
                IRInstruction(line=15, label="exit", opcode="ret", operands="void", comment="Function return"),
            ]

        # Format into readable string representation
        lines = []
        for instr in instructions:
            lbl = f"{instr.label}:" if instr.label else "  "
            lines.append(f"{lbl:<12} {instr.opcode:<10} {instr.operands:<48} ; {instr.comment}")
        ir_text = "\n".join(lines)

        return instructions, ir_text
