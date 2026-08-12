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

---

## 5. JavaScript specifics

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

## 6. Space optimisation

If `dp[i]` only reads `dp[i-1]`, keep one row or two variables. In 1-D 0/1
knapsack the capacity loop must run **downwards**; upwards would let the same
item be used twice, silently producing the unbounded answer.

---

## 7. Complexity

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
