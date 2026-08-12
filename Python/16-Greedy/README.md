# 16 - Greedy (Python)

> Greedy takes the best-looking option right now and never reconsiders. When
> that works it is unbeatable. The hard part is knowing when it works.

**At a glance**

| | |
|---|---|
| **What it is** | Take the locally best choice and never reconsider it. |
| **Must know** | It requires a **proof** - usually an exchange argument. It is not a default strategy. |
| **The one trap** | Assuming greedy works because it passed the sample cases. It often does not. |
| **Reach for it when** | Intervals, scheduling, Huffman - and only after sorting by the *right* key. |

---

## 1. The two conditions

Greedy is correct only when both hold:

1. **Greedy choice property** - a locally optimal choice is part of *some*
   globally optimal solution.
2. **Optimal substructure** - after making that choice, the rest of the problem
   is a smaller instance of the same problem.

Condition 1 is the one that fails. When it does, you need DP (chapter 15).

---

## 2. Greedy vs DP

| | Greedy | DP |
|---|--------|-----|
| Choices | one, never revisited | all, compared |
| Time | usually `O(n log n)` (sorting) | usually `O(n * something)` |
| Space | `O(1)` | `O(n)` or worse |
| Correct when | greedy choice property holds | always, if the recurrence is right |

**The canonical counterexample:** coins `[1, 3, 4]`, target 6.
Greedy takes 4, then 1, then 1 = **3 coins**. DP finds 3 + 3 = **2 coins**.
With `[1, 5, 10, 25]` greedy *is* optimal - the coin system decides, and that
is why "coin change" is a DP problem in general.

`greedy.py` contains this exact comparison as a runnable check.

---

## 3. Proving a greedy algorithm

**Exchange argument** - the standard technique:

1. Assume an optimal solution `O` differs from the greedy solution `G`.
2. Find the first place they differ.
3. Show you can swap `O`'s choice for `G`'s without making `O` worse.
4. Repeat: `O` becomes `G` without ever getting worse, so `G` is optimal.

For activity selection: if `O` picks an activity ending later than greedy's
choice, replacing it with greedy's earlier-ending one leaves at least as much
room. Nothing is lost, so greedy is optimal.

---

## 4. The recurring patterns

### a. Sort, then sweep
Most greedy problems begin with a sort. **Which key you sort by is the entire
algorithm:**

| Problem | Sort by | Why |
|---------|---------|-----|
| Activity selection | **end** time | finishing early leaves the most room |
| Non-overlapping intervals | end time | same argument |
| Merge intervals | **start** time | so overlaps are adjacent |
| Fractional knapsack | value/weight **ratio** | best value per unit of capacity |
| Minimum platforms | start and end separately | count concurrent events |

Sorting by the wrong key gives a plausible-looking algorithm that is simply
wrong. Try activity selection sorted by *start* time to see it fail.

### b. Track a running frontier
Jump game, gas station: keep one number ("furthest reachable", "tank") and
update it in a single pass. `O(n)`, no sorting.

### c. Always take the extreme
Huffman coding, connecting sticks: repeatedly merge the two smallest - a heap
(chapter 13) makes each step `O(log n)`.

---

## 5. When greedy fails

| Problem | Greedy result | Why it fails |
|---------|---------------|--------------|
| Coin change, arbitrary coins | suboptimal | a big coin can block a better mix |
| 0/1 knapsack | suboptimal | you cannot take a fraction of an item |
| Longest path in a graph | wrong | local edges say nothing about the whole path |
| Travelling salesman | suboptimal | nearest-neighbour paints you into a corner |

Note that fractional knapsack **is** greedy-solvable while 0/1 knapsack is
not. The difference is that fractions let you always fill the capacity exactly,
which restores the greedy choice property.

---

## 6. Complexity of what is implemented here

| Function | Time | Space |
|----------|------|-------|
| `activity_selection` | `O(n log n)` | `O(1)` |
| `fractional_knapsack` | `O(n log n)` | `O(1)` |
| `can_jump` / `min_jumps` | `O(n)` | `O(1)` |
| `gas_station` | `O(n)` | `O(1)` |
| `merge_intervals` | `O(n log n)` | `O(n)` |
| `erase_overlap_intervals` | `O(n log n)` | `O(1)` |
| `min_platforms` | `O(n log n)` | `O(n)` |
| `huffman_codes` | `O(n log n)` | `O(n)` |
| `coin_change_greedy` vs `_dp` | `O(n log n)` vs `O(n * amount)` | `O(1)` / `O(amount)` |

## Run the code

```bash
python greedy.py
```

---

[<- 15 Dynamic Programming](../15-Dynamic-Programming/) · [All topics](../../README.md) · [17 Bit Manipulation ->](../17-Bit-Manipulation/)
