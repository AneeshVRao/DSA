# Practice Problems - 03 Arrays (Python)

Do these in pattern order: two pointers, then fast/slow, then window, then
prefix sums. Recognising the pattern is the skill being trained.

| # | Problem | Pattern / hint | Link |
|---|---------|----------------|------|
| 1 | Two Sum | Unsorted: dict of value -> index, one pass. | [LeetCode 1](https://leetcode.com/problems/two-sum/) |
| 2 | Two Sum II - Input Array Is Sorted | Two pointers from both ends. | [LeetCode 167](https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/) |
| 3 | Move Zeroes | Fast/slow pointer, swap non-zeros forward. | [LeetCode 283](https://leetcode.com/problems/move-zeroes/) |
| 4 | Remove Duplicates from Sorted Array | Slow pointer marks the write position. | [LeetCode 26](https://leetcode.com/problems/remove-duplicates-from-sorted-array/) |
| 5 | Maximum Subarray | Kadane: extend or restart at each index. | [LeetCode 53](https://leetcode.com/problems/maximum-subarray/) |
| 6 | Best Time to Buy and Sell Stock | Track the minimum so far; profit is a running max. | [LeetCode 121](https://leetcode.com/problems/best-time-to-buy-and-sell-stock/) |
| 7 | Product of Array Except Self | Prefix products left, then suffix in a second pass. No division. | [LeetCode 238](https://leetcode.com/problems/product-of-array-except-self/) |
| 8 | Sort Colors | Dutch national flag, one pass, three pointers. | [LeetCode 75](https://leetcode.com/problems/sort-colors/) |
| 9 | Rotate Array | Reverse all, reverse first k, reverse the rest. | [LeetCode 189](https://leetcode.com/problems/rotate-array/) |
| 10 | Merge Sorted Array | Merge from the BACK to avoid overwriting. | [LeetCode 88](https://leetcode.com/problems/merge-sorted-array/) |
| 11 | Subarray Sum Equals K | Prefix sums + a dict of counts. | [LeetCode 560](https://leetcode.com/problems/subarray-sum-equals-k/) |
| 12 | Maximum Sum Subarray of Size K | Fixed sliding window. | [GfG](https://www.geeksforgeeks.org/problems/max-sum-subarray-of-size-k5313/1) |

## 2-D prefix sums
| Problem | Hint | Link |
|---------|------|------|
| Range Sum Query 2D - Immutable | 2-D prefix sums; mind the `+ corner` term. | [LeetCode 304](https://leetcode.com/problems/range-sum-query-2d-immutable/) |
| Matrix Block Sum | Every cell is one rectangle query, clamped to the edges. | [LeetCode 1314](https://leetcode.com/problems/matrix-block-sum/) |
| Count Submatrices With All Ones | 2-D prefix sums, or a histogram sweep. | [LeetCode 1504](https://leetcode.com/problems/count-submatrices-with-all-ones/) |

## Self-check before moving on

- [ ] I can write two-pointer and sliding-window loops without a reference.
- [ ] I know when sortedness is required for a two-pointer solution.
- [ ] I can build a prefix-sum array and answer range queries in `O(1)`.
- [ ] I can explain why `append` is amortised `O(1)`.
- [ ] I never mutate a list while iterating over it.
- [ ] I can build a 2-D prefix sum and explain the `+ corner` term.
