# Practice Problems - 03 Arrays (Go)

Work through them by pattern, not by difficulty. Watch the two Go-specific
hazards: sub-slice aliasing, and forgetting to reassign `append`.

| # | Problem | Pattern / hint | Link |
|---|---------|----------------|------|
| 1 | Two Sum | Unsorted: `map[int]int` from value to index. | [LeetCode 1](https://leetcode.com/problems/two-sum/) |
| 2 | Two Sum II - Input Array Is Sorted | Two pointers from both ends. | [LeetCode 167](https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/) |
| 3 | Move Zeroes | Fast/slow pointers, swap non-zeros forward. | [LeetCode 283](https://leetcode.com/problems/move-zeroes/) |
| 4 | Remove Duplicates from Sorted Array | Slow pointer is the write index. | [LeetCode 26](https://leetcode.com/problems/remove-duplicates-from-sorted-array/) |
| 5 | Maximum Subarray | Kadane: extend or restart at each index. | [LeetCode 53](https://leetcode.com/problems/maximum-subarray/) |
| 6 | Best Time to Buy and Sell Stock | Track the running minimum. | [LeetCode 121](https://leetcode.com/problems/best-time-to-buy-and-sell-stock/) |
| 7 | Product of Array Except Self | Prefix pass, then suffix pass. No division. | [LeetCode 238](https://leetcode.com/problems/product-of-array-except-self/) |
| 8 | Sort Colors | Dutch national flag, one pass. | [LeetCode 75](https://leetcode.com/problems/sort-colors/) |
| 9 | Rotate Array | Three reversals, in place. | [LeetCode 189](https://leetcode.com/problems/rotate-array/) |
| 10 | Merge Sorted Array | Fill from the back so nothing is overwritten. | [LeetCode 88](https://leetcode.com/problems/merge-sorted-array/) |
| 11 | Subarray Sum Equals K | Prefix sums + `map[int]int` of counts. | [LeetCode 560](https://leetcode.com/problems/subarray-sum-equals-k/) |
| 12 | Container With Most Water | Two pointers; always move the shorter wall. | [LeetCode 11](https://leetcode.com/problems/container-with-most-water/) |

## 2-D prefix sums
| Problem | Hint | Link |
|---------|------|------|
| Range Sum Query 2D - Immutable | 2-D prefix sums; mind the `+ corner` term. | [LeetCode 304](https://leetcode.com/problems/range-sum-query-2d-immutable/) |
| Matrix Block Sum | Every cell is one rectangle query, clamped to the edges. | [LeetCode 1314](https://leetcode.com/problems/matrix-block-sum/) |
| Count Submatrices With All Ones | 2-D prefix sums, or a histogram sweep. | [LeetCode 1504](https://leetcode.com/problems/count-submatrices-with-all-ones/) |

## Self-check before moving on

- [ ] I always write `s = append(s, x)`, never bare `append(s, x)`.
- [ ] I know a sub-slice shares memory with its parent, and how to copy.
- [ ] I pre-size slices with `make([]T, 0, n)` when the length is known.
- [ ] I can write two-pointer and sliding-window loops from scratch.
- [ ] I can build a prefix-sum slice and answer range queries in `O(1)`.
- [ ] I can build a 2-D prefix sum and explain the `+ corner` term.
