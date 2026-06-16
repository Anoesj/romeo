import { parseArgs } from "util";
import { parseJuliaFile } from "./src/ast";
import { checkForCyclomaticComplexityIssues, DEFAULT_COMPLEXITY_THRESHOLD } from "./src/complexity";
import { buildSarifLog } from "./src/sarif";

async function main() {
  const args = process.argv.slice(2);
  const { values } = parseArgs({
    args,
    options: {
      file: { type: "string" },
      threshold: { type: "string" },
    },
  });

  if (!values.file) {
    console.error("Usage: bun run index.ts --file <path-to-julia-file> [--threshold <number>]");
    process.exit(1);
  }

  const threshold = values.threshold ? parseInt(values.threshold, 10) : DEFAULT_COMPLEXITY_THRESHOLD;
  const ast = await parseJuliaFile(values.file);
  const issues = checkForCyclomaticComplexityIssues(ast.ast, threshold);
  const log = buildSarifLog(values.file, issues, threshold);

  console.log(JSON.stringify(log, null, 2));
}

main().catch(console.error);
