# Practice Problems - 16 Greedy (Go)

For each: *why* is the greedy choice safe? If you cannot sketch the exchange
argument, suspect DP.

| # | Problem | Greedy choice | Link |
|---|---------|---------------|------|
| 1 | Assign Cookies | Sort both, match the smallest sufficient cookie. | [LeetCode 455](https://leetcode.com/problems/assign-cookies/) |
| 2 | Non-overlapping Intervals | Sort by end; keep the earliest finisher. | [LeetCode 435](https://leetcode.com/problems/non-overlapping-intervals/) |
| 3 | Merge Intervals | Sort by start; extend or append. | [LeetCode 56](https://leetcode.com/problems/merge-intervals/) |
| 4 | Minimum Number of Arrows to Burst Balloons | Sort by end; shoot at the earliest end. | [LeetCode 452](https://leetcode.com/problems/minimum-number-of-arrows-to-burst-balloons/) |
| 5 | Jump Game | Furthest-reachable frontier. | [LeetCode 55](https://leetcode.com/problems/jump-game/) |
| 6 | Jump Game II | Level-by-level frontier. | [LeetCode 45](https://leetcode.com/problems/jump-game-ii/) |
| 7 | Gas Station | Restart wherever the tank goes negative. | [LeetCode 134](https://leetcode.com/problems/gas-station/) |
| 8 | Best Time to Buy and Sell Stock II | Take every upward step. | [LeetCode 122](https://leetcode.com/problems/best-time-to-buy-and-sell-stock-ii/) |
| 9 | Task Scheduler | Fill around the most frequent task. | [LeetCode 621](https://leetcode.com/problems/task-scheduler/) |
| 10 | Partition Labels | Extend to the last occurrence of every character seen. | [LeetCode 763](https://leetcode.com/problems/partition-labels/) |
| 11 | Boats to Save People | Sort, then two pointers from both ends. | [LeetCode 881](https://leetcode.com/problems/boats-to-save-people/) |
| 12 | Fractional Knapsack | Sort by value/weight ratio. | [GfG](https://www.geeksforgeeks.org/problems/fractional-knapsack-1587115620/1) |
| 13 | Minimum Platforms | Sort arrivals and departures separately. | [GfG](https://www.geeksforgeeks.org/problems/minimum-platforms-1587115620/1) |
| 14 | Huffman Encoding | Repeatedly merge the two least frequent. | [GfG](https://www.geeksforgeeks.org/problems/huffman-encoding3345/1) |

## Self-check before moving on

- [ ] I can state the greedy choice property and optimal substructure.
- [ ] I can sketch an exchange argument for activity selection.
- [ ] I know the sort key IS the algorithm.
- [ ] My `less` functions are strict (never true for equal elements).
- [ ] I can give a coin system where greedy fails, and explain why.
