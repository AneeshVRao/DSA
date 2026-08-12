# 16 - Greedy (C++)

> Greedy takes the best-looking option now and never reconsiders. When it is
> valid it is unbeatable; the skill is knowing when it is valid.

## 1. The two conditions

1. **Greedy choice property** - a locally optimal choice belongs to *some*
   globally optimal solution.
2. **Optimal substructure** - after that choice, what remains is a smaller
   instance of the same problem.

Condition 1 is the one that fails. When it does, you need DP (chapter 15).

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
*is* optimal - the coin system decides. `greedy.cpp` asserts both.

---

## 3. Proving it: the exchange argument

1. Assume an optimal solution `O` differs from greedy `G`.
2. Take the first difference.
3. Swap `O`'s choice for `G`'s and show `O` is no worse.
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

```cpp
sort(v.begin(), v.end(),
     [](const auto& a, const auto& b) { return a.second < b.second; });  // by end
```

### b. Track a running frontier
Jump game, gas station: one variable, one pass, `O(n)`, no sorting.

### c. Always take the extreme
Huffman, connecting sticks: `priority_queue` gives each step `O(log n)`.

---

## 5. When greedy fails

| Problem | Why |
|---------|-----|
| Coin change, arbitrary coins | a big coin can block a better mix |
| 0/1 knapsack | you cannot take a fraction, so capacity gets wasted |
| Longest path | local edges say nothing about the global path |
| Travelling salesman | nearest-neighbour paints you into a corner |

Fractional knapsack **is** greedy-solvable while 0/1 is not: fractions let you
fill the capacity exactly, which restores the greedy choice property.

---

## 6. C++ notes

- Sorting with a lambda comparator is the whole implementation of most of
  these. The comparator must be a **strict** weak ordering - `<`, never `<=`.
- Use `long long` for accumulated costs (Huffman totals overflow `int` fast).
- `priority_queue<int, vector<int>, greater<int>>` is the min-heap you want for
  Huffman and stick-connecting.

---

## 7. Complexity of what is implemented here

| Function | Time | Space |
|----------|------|-------|
| `activitySelection` | `O(n log n)` | `O(1)` |
| `fractionalKnapsack` | `O(n log n)` | `O(1)` |
| `canJump` / `minJumps` | `O(n)` | `O(1)` |
| `gasStation` | `O(n)` | `O(1)` |
| `mergeIntervals` | `O(n log n)` | `O(n)` |
| `eraseOverlapIntervals` | `O(n log n)` | `O(1)` |
| `minPlatforms` | `O(n log n)` | `O(n)` |
| `huffmanCodes` | `O(n log n)` | `O(n)` |
| `coinChangeGreedy` vs `Dp` | `O(n log n)` vs `O(n * amount)` | `O(1)` / `O(amount)` |

## Compile and run

```bash
g++ -std=c++17 -O2 -Wall greedy.cpp -o greedy && ./greedy
```
