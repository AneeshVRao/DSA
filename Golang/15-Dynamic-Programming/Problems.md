# Practice Problems - 15 Dynamic Programming (Go)

Work by family, not by difficulty. Use the `min`/`max` builtins (Go 1.21+) and
remember `var f func(...)` before a recursive closure.

## Linear
| # | Problem | Hint | Link |
|---|---------|------|------|
| 1 | Climbing Stairs | Fibonacci in disguise. | [LeetCode 70](https://leetcode.com/problems/climbing-stairs/) |
| 2 | House Robber | `max(skip, take)` per index. | [LeetCode 198](https://leetcode.com/problems/house-robber/) |
| 3 | House Robber II | Circular: run it twice, excluding one end each time. | [LeetCode 213](https://leetcode.com/problems/house-robber-ii/) |
| 4 | Maximum Subarray | Kadane. | [LeetCode 53](https://leetcode.com/problems/maximum-subarray/) |

## Knapsack
| # | Problem | Hint | Link |
|---|---------|------|------|
| 5 | Coin Change | Unbounded: capacity loop upwards. | [LeetCode 322](https://leetcode.com/problems/coin-change/) |
| 6 | Coin Change II | Coins outside, amounts inside. | [LeetCode 518](https://leetcode.com/problems/coin-change-ii/) |
| 7 | Partition Equal Subset Sum | Boolean subset sum on `total / 2`. | [LeetCode 416](https://leetcode.com/problems/partition-equal-subset-sum/) |
| 8 | Target Sum | Rearranges into a subset-sum count. | [LeetCode 494](https://leetcode.com/problems/target-sum/) |

## Strings
| # | Problem | Hint | Link |
|---|---------|------|------|
| 9 | Longest Common Subsequence | The 2-D template. | [LeetCode 1143](https://leetcode.com/problems/longest-common-subsequence/) |
| 10 | Edit Distance | Insert, delete, replace. | [LeetCode 72](https://leetcode.com/problems/edit-distance/) |
| 11 | Word Break | `dp[i]` = first i bytes splittable. | [LeetCode 139](https://leetcode.com/problems/word-break/) |
| 12 | Longest Palindromic Subsequence | Interval DP by increasing length. | [LeetCode 516](https://leetcode.com/problems/longest-palindromic-subsequence/) |

## Sequences and grids
| # | Problem | Hint | Link |
|---|---------|------|------|
| 13 | Longest Increasing Subsequence | `O(n^2)`, then `sort.SearchInts`. | [LeetCode 300](https://leetcode.com/problems/longest-increasing-subsequence/) |
| 14 | Unique Paths | `dp[r][c] = above + left`. | [LeetCode 62](https://leetcode.com/problems/unique-paths/) |
| 15 | Minimum Path Sum | Same shape with `min`. | [LeetCode 64](https://leetcode.com/problems/minimum-path-sum/) |
| 16 | Decode Ways | Two-step recurrence with validity checks. | [LeetCode 91](https://leetcode.com/problems/decode-ways/) |

## Interval DP
| # | Problem | Hint | Link |
|---|---------|------|------|
| 17 | Burst Balloons | Ask which balloon is burst LAST in each range. | [LeetCode 312](https://leetcode.com/problems/burst-balloons/) |
| 18 | Minimum Cost to Cut a Stick | Pad the ends in as fake cuts, then sort. | [LeetCode 1547](https://leetcode.com/problems/minimum-cost-to-cut-a-stick/) |
| 19 | Longest Palindromic Subsequence | Interval DP on (i, j); shrink from both ends. | [LeetCode 516](https://leetcode.com/problems/longest-palindromic-subsequence/) |
| 20 | Strange Printer | Merge equal endpoints, then split the range. | [LeetCode 664](https://leetcode.com/problems/strange-printer/) |
| 21 | Stone Game VII | Interval DP where both players play optimally. | [LeetCode 1690](https://leetcode.com/problems/stone-game-vii/) |
| 22 | Matrix Chain Multiplication | The archetype - write it once from scratch. | [GfG](https://www.geeksforgeeks.org/problems/matrix-chain-multiplication0303/1) |

## Bitmask DP
| # | Problem | Hint | Link |
|---|---------|------|------|
| 23 | Partition to K Equal Sum Subsets | State is the mask of used elements. | [LeetCode 698](https://leetcode.com/problems/partition-to-k-equal-sum-subsets/) |
| 24 | Shortest Path Visiting All Nodes | BFS over (node, mask) - TSP without the return leg. | [LeetCode 847](https://leetcode.com/problems/shortest-path-visiting-all-nodes/) |
| 25 | Minimum Number of Work Sessions | Precompute which subsets fit in one session. | [LeetCode 1986](https://leetcode.com/problems/minimum-number-of-work-sessions-to-finish-the-tasks/) |
| 26 | Number of Ways to Wear Different Hats | Iterate over hats, mask over people. | [LeetCode 1434](https://leetcode.com/problems/number-of-ways-to-wear-different-hats-to-each-other/) |
| 27 | Find the Shortest Superstring | TSP where the cost is the overlap saved. | [LeetCode 943](https://leetcode.com/problems/find-the-shortest-superstring/) |
| 28 | Travelling Salesman Problem | Held-Karp; note where 2^n stops fitting. | [GfG](https://www.geeksforgeeks.org/problems/travelling-salesman-problem2732/1) |

## Self-check before moving on

- [ ] I can state the two conditions that make a problem a DP problem.
- [ ] I declare `var f func(...)` before assigning a recursive closure.
- [ ] I know why 1-D 0/1 knapsack iterates capacity downwards.
- [ ] I use `math.MaxInt / 2` as a sentinel so `dp[x] + 1` cannot overflow.
- [ ] I lean on zero values instead of re-initialising tables.
- [ ] I iterate interval DP by increasing LENGTH, never by raw index.
- [ ] I know the burst-balloons trick: reason about the LAST element, not the first.
- [ ] I can encode a subset as an integer and test/set membership with bit ops.
- [ ] I know Held-Karp is O(2^n n^2) and caps out around n = 20.
- [ ] I can tell when a bitmask is NOT needed (only the sums matter, not which).
