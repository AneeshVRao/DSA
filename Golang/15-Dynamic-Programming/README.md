# 15 - Dynamic Programming (Go)

> DP is recursion that refuses to compute the same thing twice. Go's cheap
> slices and dynamic stacks make both styles comfortable.

## 1. When DP applies

Both must hold:

1. **Overlapping subproblems** - the naive recursion revisits the same
   subproblem (Fibonacci does; merge sort does not).
2. **Optimal substructure** - an optimal answer is built from optimal answers
   to subproblems.

---

## 2. The two styles

| | Memoisation (top-down) | Tabulation (bottom-up) |
|---|------------------------|------------------------|
| Shape | recursive closure + slice/map cache | loops filling a slice |
| Computes | only reachable states | every state |
| Best when | sparse or awkward state space | the order is obvious |

```go
// memoisation with a recursive closure
func Fib(n int) int {
    memo := make([]int, n+1)
    for i := range memo { memo[i] = -1 }

    var fib func(int) int          // declare BEFORE assigning
    fib = func(k int) int {
        if k < 2 { return k }
        if memo[k] != -1 { return memo[k] }
        memo[k] = fib(k-1) + fib(k-2)
        return memo[k]
    }
    return fib(n)
}
```

`var f func(int) int` must be declared before the literal that references it -
a closure cannot mention itself inside its own definition.

---

## 3. The recipe

1. **State** - what arguments fully describe a subproblem?
2. **Recurrence** - how does it relate to smaller states?
3. **Base cases.**
4. **Order** - every state computed before it is read.
5. **Answer** - which cell holds it?

---

## 4. The classic families

| Family | State | Recurrence sketch |
|--------|-------|-------------------|
| Fibonacci / stairs | `dp[i]` | `dp[i-1] + dp[i-2]` |
| House robber | `dp[i]` | `max(dp[i-1], dp[i-2] + v[i])` |
| 0/1 knapsack | `dp[i][w]` | `max(skip, v[i] + dp[i-1][w-wt[i]])` |
| Unbounded / coin change | `dp[amount]` | `min(dp[amount-coin] + 1)` |
| LCS / edit distance | `dp[i][j]` | match, else best of three neighbours |
| LIS | `dp[i]` ending at i | `max(dp[j]) + 1` for `j < i`, `a[j] < a[i]` |
| Grid paths | `dp[r][c]` | `dp[r-1][c] + dp[r][c-1]` |
| Subset sum | `dp[sum]` bool | with or without this item |

---

## 5. Go specifics

**2-D tables** need a loop per row - there is no 2-D slice literal:

```go
dp := make([][]int, rows)
for i := range dp { dp[i] = make([]int, cols) }
```

For hot code, one flat `make([]int, rows*cols)` indexed `dp[r*cols+c]` is
contiguous and faster.

**`min` and `max` are builtins** since Go 1.21 - no more hand-written helpers.

**Zero values help:** `make([]int, n)` is already all zeros and
`make([]bool, n)` all false, which is often exactly the base case you want.

**Sentinels:** use `math.MaxInt/2` so `dp[x] + 1` cannot overflow.

---

## 6. Space optimisation

If `dp[i]` only reads `dp[i-1]`, keep one row or two variables. In 1-D 0/1
knapsack the capacity loop must run **downwards**; upwards would let the same
item be used twice and silently produce the unbounded answer.

---

## 7. Complexity

| Problem | Time | Space | Optimised |
|---------|------|-------|-----------|
| Fibonacci | `O(n)` | `O(n)` | `O(1)` |
| Climbing stairs / house robber | `O(n)` | `O(n)` | `O(1)` |
| Coin change | `O(n * amount)` | `O(amount)` | - |
| 0/1 knapsack | `O(n * W)` | `O(n * W)` | `O(W)` |
| LCS / edit distance | `O(n * m)` | `O(n * m)` | `O(min(n, m))` |
| LIS | `O(n^2)` | `O(n)` | `O(n log n)` via `sort.SearchInts` |
| Grid paths | `O(r * c)` | `O(r * c)` | `O(c)` |

## Run the code

```bash
go run dp.go
```
