# Practice Problems - 19 Advanced Topics (JavaScript)

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
| 6 | Number of Islands II | Dynamic connectivity as land appears. | [LeetCode 305](https://leetcode.com/problems/number-of-islands-ii/) |

## Fenwick / segment tree
| # | Problem | Hint | Link |
|---|---------|------|------|
| 7 | Range Sum Query - Mutable | Fenwick, or a segment tree. | [LeetCode 307](https://leetcode.com/problems/range-sum-query-mutable/) |
| 8 | Count of Smaller Numbers After Self | Fenwick over value ranks, right to left. | [LeetCode 315](https://leetcode.com/problems/count-of-smaller-numbers-after-self/) |
| 9 | Reverse Pairs | Fenwick or merge-sort counting. | [LeetCode 493](https://leetcode.com/problems/reverse-pairs/) |
| 10 | Range Sum Query 2D - Mutable | 2-D Fenwick. | [LeetCode 308](https://leetcode.com/problems/range-sum-query-2d-mutable/) |
| 11 | The Skyline Problem | Segment tree, or a heap sweep. | [LeetCode 218](https://leetcode.com/problems/the-skyline-problem/) |
| 12 | Falling Squares | Segment tree with lazy propagation. | [LeetCode 699](https://leetcode.com/problems/falling-squares/) |

## Sparse table
| Problem | Hint | Link |
|---------|------|------|
| Range Minimum Query | The canonical use - build once, answer in O(1). | [GfG](https://www.geeksforgeeks.org/problems/range-minimum-query/1) |
| Sliding Window Maximum | A monotonic deque is better here; try both and compare. | [LeetCode 239](https://leetcode.com/problems/sliding-window-maximum/) |
| Longest Nice Subarray | Bitwise AND over a window - idempotent, so a sparse table fits. | [LeetCode 2401](https://leetcode.com/problems/longest-nice-subarray/) |
| Maximum of Minimum for Every Window Size | Static array, many range minimums. | [GfG](https://www.geeksforgeeks.org/problems/maximum-of-minimum-for-every-window-size3453/1) |
| Number of Subarrays With GCD Equal to K | gcd is idempotent, so ranges are O(1). | [LeetCode 2447](https://leetcode.com/problems/number-of-subarrays-with-gcd-equal-to-k/) |

## Self-check before moving on

- [ ] I can implement Union-Find with path compression and union by size.
- [ ] I know why Union-Find is effectively `O(1)` and cannot split sets.
- [ ] I can write a Fenwick tree from memory and explain `i & -i`.
- [ ] I know when a segment tree is required instead of a Fenwick tree.
- [ ] I understand what lazy propagation defers and when it is pushed down.
- [ ] I know a sparse table answers in O(1) but supports no updates at all.
- [ ] I can say why the two query blocks are allowed to overlap.
- [ ] I know it is WRONG for sum/xor - and wrong even for a one-element range.
