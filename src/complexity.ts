import type { ASTNode } from "./ast";

const BRANCH_HEADS = new Set(["for", "while", "if", "elseif", "&&", "||"]);

function countBranches(node: ASTNode): number {
  let count = node.type === "Expr" && BRANCH_HEADS.has(node.head ?? "") ? 1 : 0;
  for (const arg of node.args ?? []) {
    count += countBranches(arg);
  }
  return count;
}

export function computeCyclomaticComplexity(functionNode: ASTNode): number {
  return 1 + countBranches(functionNode);
}

export interface ComplexityIssue {
  functionName: string;
  complexity: number;
  line: number;
}

export const DEFAULT_COMPLEXITY_THRESHOLD = 10;

export function checkForCyclomaticComplexityIssues(ast: ASTNode, threshold = DEFAULT_COMPLEXITY_THRESHOLD): ComplexityIssue[] {
  const issues: ComplexityIssue[] = [];
  const nodes = ast.args ?? [];
  let topLevelBranches = 0;
  let topLevelFirstLine = 1;
  let topLevelLineFound = false;

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (node.type === "LineNumberNode") continue;

    if (node.type === "Expr" && node.head === "function") {
      const sig = node.args?.[0];
      if (sig?.type === "Expr" && sig.head === "call") {
        const nameNode = sig.args?.[0] as ASTNode & { value?: string };
        if (nameNode?.type === "Symbol") {
          const complexity = computeCyclomaticComplexity(node);
          if (complexity >= threshold) {
            const prev = nodes[i - 1];
            const line = prev?.type === "LineNumberNode" ? (prev.line ?? 1) : 1;
            issues.push({ functionName: String(nameNode.value), complexity, line });
          }
        }
      }
    } else {
      const branches = countBranches(node);
      topLevelBranches += branches;
      if (branches > 0 && !topLevelLineFound) {
        const prev = nodes[i - 1];
        topLevelFirstLine = prev?.type === "LineNumberNode" ? (prev.line ?? 1) : 1;
        topLevelLineFound = true;
      }
    }
  }

  const topLevelComplexity = 1 + topLevelBranches;
  if (topLevelComplexity >= threshold) {
    issues.push({ functionName: "<top-level>", complexity: topLevelComplexity, line: topLevelFirstLine });
  }

  return issues;
}
