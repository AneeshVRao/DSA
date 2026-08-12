# Practice Problems - 19 Advanced Topics (Go)

The tells: "merge these groups" -> Union-Find. "Range query WITH updates" ->
Fenwick or segment tree. "Range min/max" -> segment tree (a BIT cannot do it).

## Union-Find
| # | Problem | Hint | Link |
|---|---------|------|------|
| 1 | Number of Provinces | Union every connected pair; count roots. | [LeetCode 547](https://leetcode.com/problems/number-of-provinces/) |
| 2 | Number of Connected Components | Same idea on an edge list. | [LeetCode 323](https://leetcode.com/problems/number-of-connected-components-in-an-undirected-graph/) |
| 3 | Redundant Connection | The first edge whose union fails closes a cycle. | [LeetCode 684](https://leetcode.com/problems/redundant-connection/) |
| 4 | Accounts Merge | Union by shared email, then group by root. | [LeetCode 721](https://leetcode.com/problems/accounts-merge/) |
| 5 | Satisfiability of Equality Equations | Union the `==`, then check the `!=`. | [LeetCode 990](https://leetcode.com/problems/satisfiability-of-equality-equations/) |
| 6 | Minimum Spanning Tree | Kruskal with DSU. | [GfG](https://www.geeksforgeeks.org/problems/minimum-spanning-tree/1) |

## Fenwick / segment tree
| # | Problem | Hint | Link |
|---|---------|------|------|
| 7 | Range Sum Query - Mutable | Fenwick, or a segment tree. | [LeetCode 307](https://leetcode.com/problems/range-sum-query-mutable/) |
| 8 | Count of Smaller Numbers After Self | Fenwick over value ranks, right to left. | [LeetCode 315](https://leetcode.com/problems/count-of-smaller-numbers-after-self/) |
| 9 | Reverse Pairs | Fenwick or merge-sort counting. | [LeetCode 493](https://leetcode.com/problems/reverse-pairs/) |
| 10 | Range Sum Query 2D - Mutable | 2-D Fenwick. | [LeetCode 308](https://leetcode.com/problems/range-sum-query-2d-mutable/) |
| 11 | The Skyline Problem | Segment tree, or a heap sweep. | [LeetCode 218](https://leetcode.com/problems/the-skyline-problem/) |
| 12 | Falling Squares | Segment tree with lazy propagation. | [LeetCode 699](https://leetcode.com/problems/falling-squares/) |

## Self-check before moving on

- [ ] I can implement DSU with path compression and union by size.
- [ ] I know why Union-Find is effectively `O(1)` and cannot split sets.
- [ ] I can write a Fenwick tree from memory and explain `i & -i`.
- [ ] I know `min`/`max` are builtins that must be wrapped to pass as values.
- [ ] I understand what lazy propagation defers and when it is pushed down.
