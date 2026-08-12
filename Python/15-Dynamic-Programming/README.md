# 15 - Dynamic Programming (Python)

> DP is recursion that refuses to compute the same thing twice. That is the
> entire idea; everything else is bookkeeping.

**At a glance**

| | |
|---|---|
| **What it is** | Recursion plus memory, for when subproblems overlap. |
| **Must know** | Define the **state** precisely, then the transition, then the fill order. In that order. |
| **The one trap** | Iterating capacity upwards turns 0/1 knapsack into the unbounded version, silently. |
| **Reach for it when** | "Count the ways", "min/max cost", "is it possible" - over choices with structure. |

---

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
| **Interval / partition** | `dp[i][j]` over a RANGE | `min over k in (i,j) of dp[i][k] + dp[k][j] + join cost` |
| **Bitmask (subsets)** | `dp[mask][last]` | `min over unused c of dp[mask][last] + cost(last, c)` |

Recognising which family a problem belongs to is 80% of DP interviewing.

---

## 5. Two families worth their own section

### Interval DP - "choose where to split a range"

The subproblem is a **contiguous range**, and the recurrence tries every way to
cut it in two:

```text
cost[i][j] = min over every split k in (i, j) of
             cost[i][k] + cost[k][j] + (price of joining the two halves)
```

`O(n^2)` intervals x `O(n)` split points = **`O(n^3)`**.

> **Iterate by increasing LENGTH, never by index.** `cost[i][j]` depends on
> strictly shorter intervals, so they must all exist before it is computed. A
> plain `for i / for j` double loop silently reads uninitialised cells - the
> single most common bug in this family.

**Matrix chain multiplication** is the archetype: matrix product is associative
but not commutative, so the parenthesisation is free to choose, and the cost
gap is enormous. For `10x30, 30x5, 5x60` it is 4500 versus 27000.

**Burst balloons** looks like it does not fit - bursting a balloon changes its
neighbours, so the remaining problem is not an interval. The fix is the most
transferable trick here: **ask which balloon is burst LAST, not first.** If `k`
is last in `(i, j)`, everything strictly inside went before it, so when `k` pops
its neighbours are exactly `i` and `j` - fixed by the interval. The two sides
become independent and the recursion closes.

Also: minimum cost to cut a stick, optimal BST construction, polygon
triangulation, "strange printer", stone games.

### Bitmask DP - "which subset, not how many"

When the state must remember **which** elements were used - not merely how many
- encode the set as the bits of an integer.

```text
mask | (1 << c)        add element c
mask & (1 << c)        is c in the set?
mask == (1 << n) - 1   are all n in the set?
```

**Travelling salesman (Held-Karp)** is the canonical case:
`best[mask][last]` = cheapest route covering exactly `mask` and standing at
`last`. That is `2^n * n` states, each extended `n` ways: **`O(2^n * n^2)`**
against brute force's `O(n!)`. For `n = 20`, 4e8 versus 2.4e18 - still
exponential, but the difference between "a second" and "never".

A dimension can often be dropped: when people are processed in a fixed order,
`popcount(mask)` already says how many have been served, so the person index
never needs storing.

> The practical ceiling is **n around 20-22**. Past that, `2^n` stops fitting in
> memory regardless of how fast each transition is.

And the counter-example worth knowing: minimum-difference partition does *not*
need a bitmask, because only the reachable **sums** matter, not which elements
produced them. Reach for a bitmask only when the *identity* of the chosen
elements changes the answer.

---

## 6. Space optimisation

If `dp[i]` only reads `dp[i-1]`, you never need the whole table:

- 1-D over 2-D: keep one row (knapsack, LCS).
- Two variables over a 1-D array (Fibonacci, house robber).

**Iteration direction matters.** In 0/1 knapsack, the 1-D version must loop
capacity **downwards** - looping upwards would let the same item be used twice
and silently turn it into unbounded knapsack.

---

## 7. Complexity

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
| Matrix chain / burst balloons | `O(n^3)` | `O(n^2)` | - |
| Travelling salesman (Held-Karp) | `O(2^n * n^2)` | `O(2^n * n)` | - |

> Knapsack's `O(n * W)` is **pseudo-polynomial**: `W` is a value, not an input
> length, so the runtime is exponential in the number of bits of `W`. That is
> why knapsack is NP-hard despite the tidy table.

---

## 8. Traps

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

---

[<- 14 Graphs](../14-Graphs/) · [All topics](../../README.md) · [16 Greedy ->](../16-Greedy/)
