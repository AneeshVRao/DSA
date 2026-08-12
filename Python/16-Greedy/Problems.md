# Practice Problems - 16 Greedy (Python)

For each one, ask: *why* is the greedy choice safe? If you cannot sketch the
exchange argument, the answer is probably DP.

| # | Problem | Greedy choice | Link |
|---|---------|---------------|------|
| 1 | Assign Cookies | Sort both, match the smallest cookie that satisfies. | [LeetCode 455](https://leetcode.com/problems/assign-cookies/) |
| 2 | Non-overlapping Intervals | Sort by end; keep the earliest finisher. | [LeetCode 435](https://leetcode.com/problems/non-overlapping-intervals/) |
| 3 | Merge Intervals | Sort by start; extend or append. | [LeetCode 56](https://leetcode.com/problems/merge-intervals/) |
| 4 | Minimum Number of Arrows to Burst Balloons | Sort by end; shoot at the earliest end. | [LeetCode 452](https://leetcode.com/problems/minimum-number-of-arrows-to-burst-balloons/) |
| 5 | Jump Game | Track the furthest reachable index. | [LeetCode 55](https://leetcode.com/problems/jump-game/) |
| 6 | Jump Game II | Level-by-level frontier. | [LeetCode 45](https://leetcode.com/problems/jump-game-ii/) |
| 7 | Gas Station | Restart wherever the tank goes negative. | [LeetCode 134](https://leetcode.com/problems/gas-station/) |
| 8 | Best Time to Buy and Sell Stock II | Take every upward step. | [LeetCode 122](https://leetcode.com/problems/best-time-to-buy-and-sell-stock-ii/) |
| 9 | Task Scheduler | Fill around the most frequent task. | [LeetCode 621](https://leetcode.com/problems/task-scheduler/) |
| 10 | Partition Labels | Extend to the last occurrence of every character seen. | [LeetCode 763](https://leetcode.com/problems/partition-labels/) |
| 11 | Minimum Cost to Connect Sticks | Always merge the two smallest (heap). | [LeetCode 1167](https://leetcode.com/problems/minimum-cost-to-connect-sticks/) |
| 12 | Fractional Knapsack | Sort by value/weight ratio. | [GfG](https://www.geeksforgeeks.org/problems/fractional-knapsack-1587115620/1) |
| 13 | Minimum Platforms | Sort arrivals and departures separately. | [GfG](https://www.geeksforgeeks.org/problems/minimum-platforms-1587115620/1) |
| 14 | Huffman Encoding | Repeatedly merge the two least frequent. | [GfG](https://www.geeksforgeeks.org/problems/huffman-encoding3345/1) |

## Self-check before moving on

- [ ] I can state the greedy choice property and optimal substructure.
- [ ] I can sketch an exchange argument for activity selection.
- [ ] I know the sort key IS the algorithm, and which key each problem needs.
- [ ] I can give a coin system where greedy fails, and say why.
- [ ] I know fractional knapsack is greedy but 0/1 knapsack is DP, and why.
