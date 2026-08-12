# 15 - Dynamic Programming (Python)

> DP is recursion that refuses to compute the same thing twice. That is the
> entire idea; everything else is bookkeeping.

## 1. When DP applies

Two properties must both hold:

1. **Overlapping subproblems** - the naive recursion solves the same
   subproblem many times. (Fibonacci calls `fib(3)` repeatedly; merge sort
   never repeats a subproblem, which is why sorting is divide-and-conquer, not
   DP.)
2. **Optimal substructure** - an optimal solution is built from optimal
   solutions of subproblems.

If both hold, cache the subproblems and the exponential collapses to
polynomial.

---

## 2. The two styles

| | Memoisation (top-down) | Tabulation (bottom-up) |
|---|------------------------|------------------------|
| Shape | recursion + cache | loops filling a table |
| Order | driven by the recursion | you choose it |
| Computes | only the states you need | every state |
| Risk | stack depth | none |
| Best when | the state space is sparse or awkward | the order is obvious |

```python
from functools import cache

@cache                                  # memoisation: one line
def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)

def fib_table(n):                       # tabulation
    dp = [0, 1] + [0] * (n - 1)
    for i in range(2, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]
    return dp[n]

def fib_rolling(n):                     # only the last two states matter
    prev, curr = 0, 1
    for _ in range(n - 1):
        prev, curr = curr, prev + curr
    return curr
```

Write the recursion first, add `@cache`, and only convert to a table if you
need the space optimisation or hit the recursion limit.

---

## 3. The recipe

1. **Define the state.** What arguments fully describe a subproblem?
   `dp[i]` = the answer considering the first `i` items. `dp[i][w]` = items up
   to `i` with capacity `w`. Getting this wrong is what makes DP feel hard.
2. **Write the recurrence.** How does the state relate to smaller states?
   Usually a choice: take it or skip it, match or not.
3. **Base cases.** The smallest states, answered directly.
4. **Order.** Every state must be computed before it is read.
5. **Answer.** Which cell holds it? (Not always the last one.)

---

## 4. The classic families

| Family | State | Recurrence sketch |
|--------|-------|-------------------|
| **Fibonacci / stairs** | `dp[i]` | `dp[i-1] + dp[i-2]` |
| **House robber** | `dp[i]` | `max(dp[i-1], dp[i-2] + value[i])` |
| **0/1 knapsack** | `dp[i][w]` | `max(skip, value[i] + dp[i-1][w-weight[i]])` |
| **Unbounded knapsack / coin change** | `dp[amount]` | `min(dp[amount - coin] + 1)` |
| **LCS / edit distance** | `dp[i][j]` | match: `dp[i-1][j-1] + 1`; else best of the three neighbours |
| **LIS** | `dp[i]` = best ending at i | `max(dp[j]) + 1` for `j < i` with `a[j] < a[i]` |
| **Grid paths** | `dp[r][c]` | `dp[r-1][c] + dp[r][c-1]` |
| **Partition / subset sum** | `dp[sum]` boolean | reachable with or without this item |

Recognising which family a problem belongs to is 80% of DP interviewing.

---

## 5. Space optimisation

If `dp[i]` only reads `dp[i-1]`, you never need the whole table:

- 1-D over 2-D: keep one row (knapsack, LCS).
- Two variables over a 1-D array (Fibonacci, house robber).

**Iteration direction matters.** In 0/1 knapsack, the 1-D version must loop
capacity **downwards** - looping upwards would let the same item be used twice
and silently turn it into unbounded knapsack.

---

## 6. Complexity

| Problem | Time | Space | Space after optimisation |
|---------|------|-------|--------------------------|
| Fibonacci | `O(n)` | `O(n)` | `O(1)` |
| Climbing stairs / house robber | `O(n)` | `O(n)` | `O(1)` |
| Coin change | `O(n * amount)` | `O(amount)` | - |
| 0/1 knapsack | `O(n * W)` | `O(n * W)` | `O(W)` |
| LCS / edit distance | `O(n * m)` | `O(n * m)` | `O(min(n, m))` |
| LIS | `O(n^2)` | `O(n)` | `O(n log n)` with binary search |
| Grid paths | `O(r * c)` | `O(r * c)` | `O(c)` |
| Subset sum | `O(n * sum)` | `O(sum)` | - |

> Knapsack's `O(n * W)` is **pseudo-polynomial**: `W` is a value, not an input
> length, so the runtime is exponential in the number of bits of `W`. That is
> why knapsack is NP-hard despite the tidy table.

---

## 7. Traps

- Wrong state definition - if the recurrence needs information the state does
  not carry, add a dimension.
- Off-by-one between "first i items" and "index i".
- Forgetting the base cases (`dp[0]`, the empty string row/column).
- In 1-D 0/1 knapsack, iterating capacity upwards.
- Mutable default arguments as a cache: use `@cache` or an explicit dict.

## Run the code

```bash
python dp.py
```
