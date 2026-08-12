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

## Self-check before moving on

- [ ] I can state the two conditions that make a problem a DP problem.
- [ ] I declare `var f func(...)` before assigning a recursive closure.
- [ ] I know why 1-D 0/1 knapsack iterates capacity downwards.
- [ ] I use `math.MaxInt / 2` as a sentinel so `dp[x] + 1` cannot overflow.
- [ ] I lean on zero values instead of re-initialising tables.
