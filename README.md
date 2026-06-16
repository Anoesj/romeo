# Romeo

Personal experiment with a Julia code checker, only checking cyclomatic complexity and outputting results in SARIF format.

Requires [Bun](https://bun.sh) and [Julia](https://julialang.org) locally.

## Install

```bash
bun i
```

## Usage

```bash
bun run index.ts --file <path-to-julia-file> [--threshold <number>]
```

Outputs SARIF to stdout. Default complexity threshold is 10.

```bash
# Run against the included example
bun run check:example

# Pipe to a file
bun run index.ts --file mycode.jl > results.sarif
```

## Scripts

| Script | Description |
|---|---|
| `bun run test` | Run the test suite |
| `bun run coverage` | Run tests with coverage report |
| `bun run check:example` | Run against `examples/loops_map.jl` |
