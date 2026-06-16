import type { Log, ReportingDescriptor, Result } from "sarif";
import type { ComplexityIssue } from "./complexity";
import { DEFAULT_COMPLEXITY_THRESHOLD } from "./complexity";

const RULE_ID = "cyclomatic-complexity";

export function buildSarifLog(filePath: string, issues: ComplexityIssue[], threshold = DEFAULT_COMPLEXITY_THRESHOLD): Log {
  const rule: ReportingDescriptor = {
    id: RULE_ID,
    shortDescription: { text: `Cyclomatic complexity exceeds ${threshold}` },
    defaultConfiguration: { level: "warning" },
  };

  const results: Result[] = issues.map((issue) => ({
    ruleId: RULE_ID,
    level: "warning",
    message: {
      text: `Function '${issue.functionName}' has cyclomatic complexity of ${issue.complexity} (threshold: ${threshold}).`,
    },
    locations: [
      {
        physicalLocation: {
          artifactLocation: { uri: filePath, uriBaseId: "%SRCROOT%" },
          region: { startLine: issue.line },
        },
      },
    ],
  }));

  return {
    version: "2.1.0",
    $schema: "https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json",
    runs: [
      {
        tool: {
          driver: {
            name: "romeo",
            // Replace with the real project URL once published
            informationUri: "https://github.com/anoesj/romeo",
            rules: [rule],
          },
        },
        results,
      },
    ],
  };
}
