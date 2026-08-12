# 15 - Dynamic Programming (C++)

> DP is recursion that refuses to compute the same thing twice. In C++ you
> also get to feel the memory cost of the table, which is a useful teacher.

## 1. When DP applies

Both must hold:

1. **Overlapping subproblems** - the naive recursion revisits the same
   subproblem (Fibonacci does; merge sort does not, which is why sorting is
   divide-and-conquer rather than DP).
2. **Optimal substructure** - an optimal answer is built from optimal answers
   to subproblems.

---

## 2. The two styles

| | Memoisation (top-down) | Tabulation (bottom-up) |
|---|------------------------|------------------------|
| Shape | recursion + cache | loops filling a table |
| Computes | only reachable states | every state |
| Risk | stack depth (segfault, not an exception) | none |
| Best when | sparse or awkward state space | the order is obvious |

```cpp
// memoisation
long long fib(int n, vector<long long>& memo) {
    if (n < 2) return n;
    if (memo[n] != -1) return memo[n];
    return memo[n] = fib(n - 1, memo) + fib(n - 2, memo);
}

// tabulation
vector<long long> dp(n + 1);
dp[1] = 1;
for (int i = 2; i <= n; i++) dp[i] = dp[i-1] + dp[i-2];
```

Use `-1` (or `LLONG_MIN`) as the "not computed" marker, and make sure it
cannot be a legitimate answer.

---

## 3. The recipe

1. **State** - what arguments fully describe a subproblem?
2. **Recurrence** - how does it relate to smaller states? Usually a choice.
3. **Base cases** - the smallest states.
4. **Order** - every state computed before it is read.
5. **Answer** - which cell holds it?

---

## 4. The classic families

| Family | State | Recurrence sketch |
|--------|-------|-------------------|
| Fibonacci / stairs | `dp[i]` | `dp[i-1] + dp[i-2]` |
| House robber | `dp[i]` | `max(dp[i-1], dp[i-2] + v[i])` |
| 0/1 knapsack | `dp[i][w]` | `max(skip, v[i] + dp[i-1][w-wt[i]])` |
| Unbounded / coin change | `dp[amount]` | `min(dp[amount - coin] + 1)` |
| LCS / edit distance | `dp[i][j]` | match, else best of three neighbours |
| LIS | `dp[i]` ending at i | `max(dp[j]) + 1` for `j < i`, `a[j] < a[i]` |
| Grid paths | `dp[r][c]` | `dp[r-1][c] + dp[r][c-1]` |
| Subset sum | `dp[sum]` bool | with or without this item |

---

## 5. Space optimisation

`vector<vector<int>>` allocates one heap block per row - for a 10^4 x 10^4
table that is both slow and 400 MB. Two fixes:

- **Roll the table:** if `dp[i]` only reads `dp[i-1]`, keep one row.
- **Flatten:** one `vector<int> dp(rows * cols)` indexed `dp[r * cols + c]` is
  contiguous and measurably faster.

**Direction matters.** In 1-D 0/1 knapsack the capacity loop must run
**downwards**; upwards would reuse the same item and silently produce the
unbounded answer.

---

## 6. Complexity

| Problem | Time | Space | Optimised space |
|---------|------|-------|-----------------|
| Fibonacci | `O(n)` | `O(n)` | `O(1)` |
| Climbing stairs / house robber | `O(n)` | `O(n)` | `O(1)` |
| Coin change | `O(n * amount)` | `O(amount)` | - |
| 0/1 knapsack | `O(n * W)` | `O(n * W)` | `O(W)` |
| LCS / edit distance | `O(n * m)` | `O(n * m)` | `O(min(n, m))` |
| LIS | `O(n^2)` | `O(n)` | `O(n log n)` via `lower_bound` |
| Grid paths | `O(r * c)` | `O(r * c)` | `O(c)` |

> Knapsack's `O(n * W)` is **pseudo-polynomial**: `W` is a value, not an input
> size, so it is exponential in the bit-length of `W`. Hence NP-hardness
> despite the tidy loop.

---

## 7. Traps

- Overflow: `dp[i] = dp[i-1] + dp[i-2]` on `int` breaks past Fibonacci 46.
- A sentinel that a real answer could equal.
- `vector<vector<int>>` when a flat vector or one row would do.
- Off-by-one between "first i items" and "index i".
- 1-D 0/1 knapsack iterating capacity upwards.

## Compile and run

```bash
g++ -std=c++17 -O2 -Wall dp.cpp -o dp && ./dp
```
