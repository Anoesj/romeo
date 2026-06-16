struct Shape
    kind::String
    sides::Int
end

# Expected complexity: 1 (no branches)
function describe(s::Shape)
    println(s.kind, " has ", s.sides, " sides")
end

# Expected complexity: 4 (if + elseif + elseif)
function classify(s::Shape)
    if s.sides == 3
        println("triangle")
    elseif s.sides == 4
        println("quadrilateral")
    elseif s.sides > 4
        println("polygon")
    else
        println("unknown")
    end
end
