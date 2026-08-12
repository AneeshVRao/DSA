# 16 - Greedy (Go)

> Greedy takes the best-looking option now and never reconsiders. The skill is
> knowing when that is safe.

**At a glance**

| | |
|---|---|
| **What it is** | Take the locally best choice and never reconsider it. |
| **Must know** | It requires a **proof** - usually an exchange argument. It is not a default strategy. |
| **The one trap** | Assuming greedy works because it passed the sample cases. It often does not. |
| **Reach for it when** | Intervals, scheduling, Huffman - and only after sorting by the *right* key. |

---

## 1. The two conditions

1. **Greedy choice property** - a locally optimal choice belongs to *some*
   globally optimal solution.
2. **Optimal substructure** - after that choice, what remains is a smaller
   instance of the same problem.

Condition 1 is the one that fails; when it does, you need DP (chapter 15).

---

## 2. Greedy vs DP

| | Greedy | DP |
|---|--------|-----|
| Choices | one, never revisited | all, compared |
| Time | usually `O(n log n)` | usually `O(n * something)` |
| Space | `O(1)` | `O(n)` or worse |
| Correct when | greedy choice property holds | whenever the recurrence is right |

**The canonical counterexample:** coins `{1, 3, 4}`, target 6. Greedy takes
4 + 1 + 1 = **3 coins**; DP finds 3 + 3 = **2**. With `{1, 5, 10, 25}` greedy
*is* optimal - the coin system decides. `greedy.go` asserts both.

---

## 3. Proving it: the exchange argument

1. Assume an optimal solution `O` differs from greedy `G`.
2. Take the first difference.
3. Swap `O`'s choice for `G`'s; show `O` is no worse.
4. Repeat until `O` becomes `G`, which is therefore optimal.

---

## 4. The recurring patterns

### a. Sort, then sweep
**The sort key is the algorithm:**

| Problem | Sort by | Why |
|---------|---------|-----|
| Activity selection | **end** time | finishing early leaves the most room |
| Non-overlapping intervals | end time | same argument |
| Merge intervals | **start** time | so overlaps become adjacent |
| Fractional knapsack | value/weight **ratio** | best value per unit of capacity |
| Minimum platforms | arrivals and departures separately | count concurrent events |

```go
sort.Slice(intervals, func(i, j int) bool {
    return intervals[i][1] < intervals[j][1]      // by end
})
```

The `less` function must be **strict** - return true only when `i` must come
before `j`.

### b. Track a running frontier
Jump game, gas station: one variable, one pass, `O(n)`, no sorting.

### c. Always take the extreme
Huffman, connecting sticks: `container/heap` makes each step `O(log n)`.

---

## 5. When greedy fails

| Problem | Why |
|---------|-----|
| Coin change, arbitrary coins | a big coin can block a better mix |
| 0/1 knapsack | you cannot take a fraction, so capacity gets wasted |
| Longest path | local edges say nothing about the global path |
| Travelling salesman | nearest-neighbour paints you into a corner |

Fractional knapsack **is** greedy-solvable while 0/1 is not: fractions let you
fill the capacity exactly, restoring the greedy choice property.

---

## 6. Complexity of what is implemented here

| Function | Time | Space |
|----------|------|-------|
| `ActivitySelection` | `O(n log n)` | `O(1)` |
| `FractionalKnapsack` | `O(n log n)` | `O(1)` |
| `CanJump` / `MinJumps` | `O(n)` | `O(1)` |
| `GasStation` | `O(n)` | `O(1)` |
| `MergeIntervals` | `O(n log n)` | `O(n)` |
| `EraseOverlapIntervals` | `O(n log n)` | `O(1)` |
| `MinPlatforms` | `O(n log n)` | `O(n)` |
| `HuffmanCodes` | `O(n log n)` | `O(n)` |
| `CoinChangeGreedy` vs `Dp` | `O(n log n)` vs `O(n * amount)` | `O(1)` / `O(amount)` |

## Run the code

```bash
go run greedy.go
```

---

[<- 15 Dynamic Programming](../15-Dynamic-Programming/) · [All topics](../../README.md) · [17 Bit Manipulation ->](../17-Bit-Manipulation/)
