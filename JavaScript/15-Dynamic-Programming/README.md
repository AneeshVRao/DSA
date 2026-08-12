# 15 - Dynamic Programming (JavaScript)

> DP is recursion that refuses to compute the same thing twice. In JS you also
> have to watch the 10k-frame stack and the 2^53 integer ceiling.

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
| Shape | recursion + `Map` | loops filling an array |
| Computes | only reachable states | every state |
| Risk | `RangeError` past ~10k frames | none |
| Best when | sparse state space | the order is obvious |

```js
const memo = new Map();
function fib(n) {
  if (n < 2) return n;
  if (memo.has(n)) return memo.get(n);
  const result = fib(n - 1) + fib(n - 2);
  memo.set(n, result);
  return result;
}

function fibTable(n) {                 // tabulation
  const dp = new Array(n + 1).fill(0);
  dp[1] = 1;
  for (let i = 2; i <= n; i++) dp[i] = dp[i - 1] + dp[i - 2];
  return dp[n];
}
```

Use a `Map` rather than an object for the cache: numeric keys stay numeric,
and it does not inherit prototype properties.

---

## 3. The recipe

1. **State** - what arguments fully describe a subproblem?
2. **Recurrence** - how does it relate to smaller states? Usually a choice.
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
| Unbounded / coin change | `dp[amount]` | `min(dp[amount - coin] + 1)` |
| LCS / edit distance | `dp[i][j]` | match, else best of three neighbours |
| LIS | `dp[i]` ending at i | `max(dp[j]) + 1` for `j < i`, `a[j] < a[i]` |
| Grid paths | `dp[r][c]` | `dp[r-1][c] + dp[r][c-1]` |
| Subset sum | `dp[sum]` bool | with or without this item |
| Matrix chain / burst balloons | `O(n^3)` | `O(n^2)` | - |
| Travelling salesman (Held-Karp) | `O(2^n * n^2)` | `O(2^n * n)` | - |
| **Interval / partition** | `dp[i][j]` over a RANGE | `min over k in (i,j) of dp[i][k] + dp[k][j] + join cost` |
| **Bitmask (subsets)** | `dp[mask][last]` | `min over unused c of dp[mask][last] + cost(last, c)` |

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

## 6. JavaScript specifics

**Building tables:**
```js
const dp = new Array(n + 1).fill(0);
const grid = Array.from({ length: rows }, () => new Array(cols).fill(0));
// new Array(rows).fill(new Array(cols)) shares ONE row - a real bug
```

**Integer limits:** results above `Number.MAX_SAFE_INTEGER` (2^53 - 1) lose
precision silently. Fibonacci passes it at n = 79, and counting problems
("number of ways") hit it constantly. Switch to `BigInt` when the answer can
grow that large.

**Stack:** deep memoised recursion (say over a 10^5-length string) will throw
`RangeError`. Tabulate instead.

---

## 7. Space optimisation

If `dp[i]` only reads `dp[i-1]`, keep one row or two variables. In 1-D 0/1
knapsack the capacity loop must run **downwards**; upwards would let the same
item be used twice, silently producing the unbounded answer.

---

## 8. Complexity

| Problem | Time | Space | Optimised |
|---------|------|-------|-----------|
| Fibonacci | `O(n)` | `O(n)` | `O(1)` |
| Climbing stairs / house robber | `O(n)` | `O(n)` | `O(1)` |
| Coin change | `O(n * amount)` | `O(amount)` | - |
| 0/1 knapsack | `O(n * W)` | `O(n * W)` | `O(W)` |
| LCS / edit distance | `O(n * m)` | `O(n * m)` | `O(min(n, m))` |
| LIS | `O(n^2)` | `O(n)` | `O(n log n)` |
| Grid paths | `O(r * c)` | `O(r * c)` | `O(c)` |

## Run the code

```bash
node dp.js
```
