export interface ASTNode {
  type: string;
  head?: string;
  args?: ASTNode[];
  value?: unknown;
  line?: number;
  file?: string;
}

export interface ASTResult {
  file: string;
  ast: ASTNode;
  raw_code: string;
}

export async function parseJuliaFile(filepath: string): Promise<ASTResult> {
  const result = await Bun.$`julia scripts/parse_ast.jl ${filepath}`.quiet().nothrow();
  if (result.exitCode !== 0) {
    const stderr = result.stderr.toString().trim();
    const match = stderr.match(/^ERROR: LoadError: (.+)/m);
    throw new Error(match ? match[1] : stderr);
  }
  return JSON.parse(result.stdout.toString());
}
