# Complexity 1: no branches
function square(x)
    return x^2
end

# Complexity 2: one if branch
function sign_of(x)
    if x < 0
        return -1
    end
    return 1
end

# Complexity 4: for + two ifs
function count_divisors(n)
    count = 0
    for i in 1:n
        if n % i == 0
            count += 1
        end
        if count > 100
            break
        end
    end
    return count
end

# Complexity 10: five for + while + for + two ifs
function multi_pass(data)
    s1 = 0
    for x in data
        s1 += x
    end
    s2 = 0
    for x in data
        s2 += x^2
    end
    s3 = 0
    for x in data
        s3 += x^3
    end
    s4 = 0
    for x in data
        s4 += x^4
    end
    s5 = 0
    for x in data
        s5 += x^5
    end
    i = length(data)
    while i > 0
        i -= 1
    end
    pos = 0
    neg = 0
    for x in data
        if x > 0
            pos += 1
        end
        if x < 0
            neg += 1
        end
    end
    return s1, s2, s3, s4, s5, pos, neg
end

# Complexity 5: for + if + && + ||
function check_bounds(arr, lo, hi)
    result = Int[]
    for x in arr
        if x >= lo && x <= hi || x == 0
            push!(result, x)
        end
    end
    return result
end
