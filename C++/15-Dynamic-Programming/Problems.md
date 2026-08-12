# Practice Problems - 15 Dynamic Programming (C++)

Work by family, not by difficulty. Once you place the family, the recurrence
writes itself - and then think about the space optimisation.

## Linear
| # | Problem | Hint | Link |
|---|---------|------|------|
| 1 | Climbing Stairs | Fibonacci in disguise. | [LeetCode 70](https://leetcode.com/problems/climbing-stairs/) |
| 2 | House Robber | `max(skip, take)` per index. | [LeetCode 198](https://leetcode.com/problems/house-robber/) |
| 3 | House Robber II | Circular: run it twice, excluding one end each time. | [LeetCode 213](https://leetcode.com/problems/house-robber-ii/) |
| 4 | Maximum Subarray | Kadane. Watch for overflow: use `long long`. | [LeetCode 53](https://leetcode.com/problems/maximum-subarray/) |

## Knapsack
| # | Problem | Hint | Link |
|---|---------|------|------|
| 5 | Coin Change | Unbounded: capacity loop upwards. | [LeetCode 322](https://leetcode.com/problems/coin-change/) |
| 6 | Coin Change II | Coins outside, amounts inside. | [LeetCode 518](https://leetcode.com/problems/coin-change-ii/) |
| 7 | Partition Equal Subset Sum | Boolean subset sum on `total / 2`. | [LeetCode 416](https://leetcode.com/problems/partition-equal-subset-sum/) |
| 8 | 0/1 Knapsack | The template itself; then do it in `O(W)` space. | [GfG](https://www.geeksforgeeks.org/problems/0-1-knapsack-problem0945/1) |

## Strings
| # | Problem | Hint | Link |
|---|---------|------|------|
| 9 | Longest Common Subsequence | The 2-D template. | [LeetCode 1143](https://leetcode.com/problems/longest-common-subsequence/) |
| 10 | Edit Distance | Insert, delete, replace. | [LeetCode 72](https://leetcode.com/problems/edit-distance/) |
| 11 | Word Break | `dp[i]` = first i characters splittable. | [LeetCode 139](https://leetcode.com/problems/word-break/) |
| 12 | Longest Palindromic Subsequence | Interval DP by increasing length. | [LeetCode 516](https://leetcode.com/problems/longest-palindromic-subsequence/) |

## Sequences and grids
| # | Problem | Hint | Link |
|---|---------|------|------|
| 13 | Longest Increasing Subsequence | `O(n^2)`, then `lower_bound` for `O(n log n)`. | [LeetCode 300](https://leetcode.com/problems/longest-increasing-subsequence/) |
| 14 | Unique Paths | `dp[r][c] = above + left`. | [LeetCode 62](https://leetcode.com/problems/unique-paths/) |
| 15 | Minimum Path Sum | Same shape with `min`. | [LeetCode 64](https://leetcode.com/problems/minimum-path-sum/) |
| 16 | Best Time to Buy and Sell Stock III | Four state variables. | [LeetCode 123](https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iii/) |

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

## Digit DP
| Problem | Hint | Link |
|---------|------|------|
| Numbers With Repeated Digits | Count the complement, and mind the `started` flag. | [LeetCode 1012](https://leetcode.com/problems/numbers-with-repeated-digits/) |
| Count Numbers with Unique Digits | A bitmask of used digits plus `tight`. | [LeetCode 357](https://leetcode.com/problems/count-numbers-with-unique-digits/) |
| Numbers At Most N Given Digit Set | The `tight` template almost verbatim. | [LeetCode 902](https://leetcode.com/problems/numbers-at-most-n-given-digit-set/) |
| Count of Integers | Digit sum in a range - this section's exact problem. | [LeetCode 2801](https://leetcode.com/problems/count-stepping-numbers-in-range/) |
| Non-negative Integers without Consecutive Ones | Digits in base 2; the same skeleton. | [LeetCode 600](https://leetcode.com/problems/non-negative-integers-without-consecutive-ones/) |

## Game theory DP
| Problem | Hint | Link |
|---------|------|------|
| Stone Game | Track the MARGIN, not two scores. | [LeetCode 877](https://leetcode.com/problems/stone-game/) |
| Predict the Winner | The same recurrence; the answer is `margin >= 0`. | [LeetCode 486](https://leetcode.com/problems/predict-the-winner/) |
| Stone Game II | State gains an M parameter - still negamax. | [LeetCode 1140](https://leetcode.com/problems/stone-game-ii/) |
| Nim Game | Solve it by DP first, then find the one-line answer. | [LeetCode 292](https://leetcode.com/problems/nim-game/) |
| Cat and Mouse | Game DP on a graph, with draws. Hard. | [LeetCode 913](https://leetcode.com/problems/cat-and-mouse/) |

## Self-check before moving on

- [ ] I can state the two conditions that make a problem a DP problem.
- [ ] I define the state precisely before writing code.
- [ ] I know why 1-D 0/1 knapsack iterates capacity downwards.
- [ ] I use `long long` wherever sums can exceed 2 * 10^9.
- [ ] I flatten or roll big tables instead of allocating `vector<vector<>>`.
- [ ] I iterate interval DP by increasing LENGTH, never by raw index.
- [ ] I know the burst-balloons trick: reason about the LAST element, not the first.
- [ ] I can encode a subset as an integer and test/set membership with bit ops.
- [ ] I know Held-Karp is O(2^n n^2) and caps out around n = 20.
- [ ] I can tell when a bitmask is NOT needed (only the sums matter, not which).
- [ ] I can write the `tight` template from memory.
- [ ] I know when digit DP needs a `started` flag and when it does not.
- [ ] I know why one minus sign replaces the whole minimising branch.
- [ ] I know alpha-beta changes the cost, never the answer.
