# 07 - Recursion and Backtracking (Go)

> Recursion solves a smaller copy of the same problem. Backtracking is
> recursion that undoes its choices before trying the next one.

**At a glance**

| | |
|---|---|
| **What it is** | Solve by shrinking. Backtracking adds choose -> explore -> **un-choose**. |
| **Must know** | Every recursion needs a base case that is actually reachable from the input. |
| **The one trap** | Forgetting to un-choose, so state leaks from one branch into the next. |
| **Reach for it when** | "All permutations / subsets / combinations", grid search, parsing. |

---

## 1. Anatomy

```go
func Factorial(n int) int {
    if n <= 1 {                    // BASE CASE
        return 1
    }
    return n * Factorial(n-1)      // RECURSIVE CASE, strictly smaller
}
```

Three mandatory ingredients: a base case, guaranteed progress toward it, and
correct use of the sub-result.

---

## 2. Go's stack is generous

Unlike C++ (fixed 1-8 MB) or Node (~10k frames), **Go grows goroutine stacks
dynamically**: they start at 8 KB and can grow to 1 GB on 64-bit by default.
Deep recursion is far safer here - depth 10^6 is normally fine.

Runaway recursion still ends in `runtime: goroutine stack exceeds limit`
followed by a fatal error. Go performs no tail-call optimisation.

---

## 3. Recursion trees

| Recursion | Complexity |
|-----------|------------|
| one call on `n-1` | `O(n)` |
| one call on `n/2` | `O(log n)` |
| two calls on `n-1` | `O(2^n)` |
| two calls on `n/2` + `O(n)` work | `O(n log n)` |
| n branches, depth n | `O(n!)` |

Naive Fibonacci is `O(2^n)`; a `[]int` memo makes it `O(n)`.

---

## 4. The backtracking template

Go has no closures-with-state syntax sugar, so the two idiomatic shapes are:

**A. Closure over shared state** (compact, used in this chapter):

```go
func Subsets(nums []int) [][]int {
    var results [][]int
    var path []int
    var backtrack func(start int)
    backtrack = func(start int) {          // declared first: it recurses
        results = append(results, append([]int(nil), path...))   // COPY
        for i := start; i < len(nums); i++ {
            path = append(path, nums[i])   // 1. choose
            backtrack(i + 1)               // 2. explore
            path = path[:len(path)-1]      // 3. un-choose
        }
    }
    backtrack(0)
    return results
}
```

Note `var backtrack func(int)` **before** the assignment - a closure cannot
reference itself inside its own literal otherwise.

**B. A struct holding the state**, with a method that recurses. Better when
there are several pieces of state (N-Queens).

---

## 5. The copy rule, Go edition

`append(results, path)` stores a slice **header** that still points at `path`'s
backing array. The next `append` to `path` will silently rewrite results you
already recorded. Always copy:

```go
results = append(results, append([]int(nil), path...))
// or: cp := make([]int, len(path)); copy(cp, path)
// or, Go 1.21+: slices.Clone(path)
```

This is the single most common Go backtracking bug.

---

## 6. Complexity of the classics

| Problem | Time | Space (excl. output) |
|---------|------|----------------------|
| Subsets | `O(n * 2^n)` | `O(n)` |
| Permutations | `O(n * n!)` | `O(n)` |
| Combination sum | exponential in `target/min` | `O(target/min)` |
| N-Queens | `O(n!)` with pruning | `O(n)` |
| Tower of Hanoi | `O(2^n)` | `O(n)` |
| Generate parentheses | Catalan(n) | `O(n)` |

---

## 7. Traps

- Appending `path` without cloning it (see above).
- Forgetting `path = path[:len(path)-1]` after the recursive call.
- Shadowing: `path := append(path, x)` inside the loop creates a new variable
  and breaks the undo.
- Recursing on `nums[1:]` when an index would do (cheap in Go, but it hides
  the aliasing).

---

## 8. Run the code

```bash
go run recursion.go
```

---

[<- 06 Stack & Queue](../06-Stack-Queue/) · [All topics](../../README.md) · [08 Searching ->](../08-Searching/)
