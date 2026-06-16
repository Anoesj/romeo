#!/usr/bin/env julia
# Julia script to parse Julia code and output AST as JSON

using JSON

function ast_to_dict(node::Any)::Any
    if node isa Expr
        return Dict(
            "type" => "Expr",
            "head" => string(node.head),
            "args" => [ast_to_dict(arg) for arg in node.args]
        )
    elseif node isa Symbol
        return Dict(
            "type" => "Symbol",
            "value" => string(node)
        )
    elseif node isa LineNumberNode
        return Dict(
            "type" => "LineNumberNode",
            "line" => node.line,
            "file" => string(node.file)
        )
    elseif node isa Number || node isa String || node isa Bool
        return Dict(
            "type" => typeof(node).name.name,
            "value" => node
        )
    elseif node === nothing
        return Dict(
            "type" => "Nothing",
            "value" => nothing
        )
    else
        return Dict(
            "type" => typeof(node).name.name,
            "value" => string(node)
        )
    end
end

function parse_file(filepath::String)::Dict
    code = read(filepath, String)

    # Meta.parseall preserves accurate line numbers; Meta.parse("begin\n...\nend") shifts them by +1
    ast = Meta.parseall(code)

    return Dict(
        "file" => filepath,
        "ast" => ast_to_dict(ast),
        "raw_code" => code
    )
end

# Main entry point
if length(ARGS) < 1
    println(stderr, "Usage: julia parse_ast.jl <julia_file>")
    exit(1)
end

filepath = ARGS[1]
result = parse_file(filepath)
println(JSON.json(result))
