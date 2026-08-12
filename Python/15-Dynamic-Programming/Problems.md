# Practice Problems - 15 Dynamic Programming (Python)

Work these in family order, not difficulty order. Once you recognise the
family, the recurrence writes itself.

## Linear
| # | Problem | Hint | Link |
|---|---------|------|------|
| 1 | Climbing Stairs | Fibonacci in disguise. | [LeetCode 70](https://leetcode.com/problems/climbing-stairs/) |
| 2 | House Robber | `max(skip, take)` per index. | [LeetCode 198](https://leetcode.com/problems/house-robber/) |
| 3 | House Robber II | Houses in a circle: run it twice, excluding one end each time. | [LeetCode 213](https://leetcode.com/problems/house-robber-ii/) |
| 4 | Maximum Subarray | Kadane: `dp[i]` = best ending at i. | [LeetCode 53](https://leetcode.com/problems/maximum-subarray/) |

## Knapsack
| # | Problem | Hint | Link |
|---|---------|------|------|
| 5 | Coin Change | Unbounded: capacity loop upwards. | [LeetCode 322](https://leetcode.com/problems/coin-change/) |
| 6 | Coin Change II | Coins outside, amounts inside - counts combinations. | [LeetCode 518](https://leetcode.com/problems/coin-change-ii/) |
| 7 | Partition Equal Subset Sum | Boolean subset sum on `total // 2`. | [LeetCode 416](https://leetcode.com/problems/partition-equal-subset-sum/) |
| 8 | Target Sum | Rearranges into a subset-sum count. | [LeetCode 494](https://leetcode.com/problems/target-sum/) |

## Strings
| # | Problem | Hint | Link |
|---|---------|------|------|
| 9 | Longest Common Subsequence | The 2-D template. | [LeetCode 1143](https://leetcode.com/problems/longest-common-subsequence/) |
| 10 | Edit Distance | Three moves: insert, delete, replace. | [LeetCode 72](https://leetcode.com/problems/edit-distance/) |
| 11 | Word Break | `dp[i]` = first i characters splittable. | [LeetCode 139](https://leetcode.com/problems/word-break/) |
| 12 | Longest Palindromic Substring | Expand around centres, or interval DP. | [LeetCode 5](https://leetcode.com/problems/longest-palindromic-substring/) |

## Sequences and grids
| # | Problem | Hint | Link |
|---|---------|------|------|
| 13 | Longest Increasing Subsequence | `O(n^2)` first, then `O(n log n)`. | [LeetCode 300](https://leetcode.com/problems/longest-increasing-subsequence/) |
| 14 | Unique Paths | `dp[r][c] = above + left`. | [LeetCode 62](https://leetcode.com/problems/unique-paths/) |
| 15 | Minimum Path Sum | Same shape, `min` instead of `+`. | [LeetCode 64](https://leetcode.com/problems/minimum-path-sum/) |
| 16 | Best Time to Buy and Sell Stock with Cooldown | State machine DP: hold / sold / rest. | [LeetCode 309](https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-cooldown/) |

## Self-check before moving on

- [ ] I can state the two conditions that make a problem a DP problem.
- [ ] I write the recursion first, then add `@cache`, then tabulate.
- [ ] I can define the state precisely before writing any code.
- [ ] I know why 1-D 0/1 knapsack iterates capacity downwards.
- [ ] I know why coin-change loop order decides combinations vs permutations.
