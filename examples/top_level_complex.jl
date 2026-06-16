# File with complex top-level script code (no functions).
# Used to test that top-level cyclomatic complexity is detected.
# Branch count: for×3 + if + for + if + for + while + if = 9 → complexity 10

for i in 1:10
    for j in 1:10
        for k in 1:10
            if i + j + k > 15
                for l in 1:5
                    if l % 2 == 0
                        for m in 1:3
                            n = m
                            while n > 0
                                n -= 1
                                if n == 0
                                    println(i, j, k, l, m)
                                end
                            end
                        end
                    end
                end
            end
        end
    end
end
