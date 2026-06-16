import { test, expect, beforeAll } from "bun:test";
import { parseJuliaFile, type ASTResult, type ASTNode } from "./src/ast";
import { computeCyclomaticComplexity as computeComplexity, checkForCyclomaticComplexityIssues } from "./src/complexity";
import { buildSarifLog } from "./src/sarif";

let demoAst: ASTResult;
let structsAst: ASTResult;
let topLevelAst: ASTResult;

beforeAll(async () => {
  [demoAst, structsAst, topLevelAst] = await Promise.all([
    parseJuliaFile("examples/complexity_demo.jl"),
    parseJuliaFile("examples/structs.jl"),
    parseJuliaFile("examples/top_level_complex.jl"),
  ]);
});

function extractFunction(ast: ASTResult, name: string): ASTNode | null {
  const topLevel = ast.ast.args ?? [];
  for (const node of topLevel) {
    if (node.type === "Expr" && node.head === "function") {
      const sig = node.args?.[0];
      if (sig?.type === "Expr" && sig.head === "call") {
        const fnName = sig.args?.[0] as ASTNode & { value?: string };
        if (fnName?.type === "Symbol" && fnName.value === name) {
          return node;
        }
      }
    }
  }
  return null;
}

test("extractFunction finds a known function by name", () => {
  const fn = extractFunction(demoAst, "square");
  expect(fn).not.toBeNull();
  expect(fn!.type).toBe("Expr");
  expect(fn!.head).toBe("function");
  const sig = fn!.args?.[0] as ASTNode & { value?: string };
  expect(sig?.type).toBe("Expr");
  expect(sig?.head).toBe("call");
  const name = sig?.args?.[0] as ASTNode & { value?: string };
  expect(name?.type).toBe("Symbol");
  expect(name?.value).toBe("square");
});

test("extractFunction returns null for unknown function", () => {
  expect(extractFunction(demoAst, "doesnotexist")).toBeNull();
});

test("extractFunction finds all five functions", () => {
  expect(extractFunction(demoAst, "square")).not.toBeNull();
  expect(extractFunction(demoAst, "sign_of")).not.toBeNull();
  expect(extractFunction(demoAst, "count_divisors")).not.toBeNull();
  expect(extractFunction(demoAst, "multi_pass")).not.toBeNull();
  expect(extractFunction(demoAst, "check_bounds")).not.toBeNull();
});

test("square has complexity 1 (no branches)", () => {
  const fn = extractFunction(demoAst, "square");
  expect(fn).not.toBeNull();
  expect(computeComplexity(fn!)).toBe(1);
});

test("sign_of has complexity 2 (one if branch)", () => {
  const fn = extractFunction(demoAst, "sign_of");
  expect(fn).not.toBeNull();
  expect(computeComplexity(fn!)).toBe(2);
});

test("count_divisors has complexity 4 (for + two ifs)", () => {
  const fn = extractFunction(demoAst, "count_divisors");
  expect(fn).not.toBeNull();
  expect(computeComplexity(fn!)).toBe(4);
});

test("multi_pass has complexity 10 (five for + while + for + two ifs)", () => {
  const fn = extractFunction(demoAst, "multi_pass");
  expect(fn).not.toBeNull();
  expect(computeComplexity(fn!)).toBe(10);
});

test("check_bounds has complexity 5 (for + if + && + ||)", () => {
  const fn = extractFunction(demoAst, "check_bounds");
  expect(fn).not.toBeNull();
  expect(computeComplexity(fn!)).toBe(5);
});

test("struct method describe has complexity 1 (no branches)", () => {
  const fn = extractFunction(structsAst, "describe");
  expect(fn).not.toBeNull();
  expect(computeComplexity(fn!)).toBe(1);
});

test("struct method classify has complexity 4 (if + elseif + elseif)", () => {
  const fn = extractFunction(structsAst, "classify");
  expect(fn).not.toBeNull();
  expect(computeComplexity(fn!)).toBe(4);
});

test("struct definition itself is not extracted as a function", () => {
  expect(extractFunction(structsAst, "Shape")).toBeNull();
});

test("file total complexity is sum of all function complexities", () => {
  const names = ["square", "sign_of", "count_divisors", "multi_pass", "check_bounds"];
  const total = names.reduce((sum, name) => {
    const fn = extractFunction(demoAst, name);
    expect(fn).not.toBeNull();
    return sum + computeComplexity(fn!);
  }, 0);
  expect(total).toBe(22); // 1 + 2 + 4 + 10 + 5
});

test("top-level script complexity is detected", () => {
  const issues = checkForCyclomaticComplexityIssues(topLevelAst.ast);
  expect(issues).toHaveLength(1);
  const [issue] = issues;
  expect(issue?.functionName).toBe("<top-level>");
  expect(issue?.complexity).toBe(10);
});

test("parseJuliaFile throws a clean error for a non-existent file", () => {
  return expect(parseJuliaFile("examples/nonexistent.jl")).rejects.toThrow(
    "No such file or directory"
  );
});

test("SARIF output passes sarif-multitool validation", async () => {
  const issues = checkForCyclomaticComplexityIssues(demoAst.ast);
  const log = buildSarifLog("examples/complexity_demo.jl", issues);

  await Bun.$`mkdir -p .tmp`.quiet();
  const tmpPath = ".tmp/output.sarif";
  await Bun.write(tmpPath, JSON.stringify(log, null, 2));

  const multitool = "node_modules/@microsoft/sarif-multitool-linux/Sarif.Multitool";
  const result = await Bun.$`${multitool} validate ${tmpPath}`.quiet().nothrow();

  expect(result.exitCode).toBe(0);
});
