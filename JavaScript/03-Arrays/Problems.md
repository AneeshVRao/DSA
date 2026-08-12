# Practice Problems - 03 Arrays (JavaScript)

Work through them by pattern, not by difficulty. Prefer index loops over
`shift()`/`splice()` in anything performance sensitive.

| # | Problem | Pattern / hint | Link |
|---|---------|----------------|------|
| 1 | Two Sum | `Map` of value -> index, single pass. | [LeetCode 1](https://leetcode.com/problems/two-sum/) |
| 2 | Two Sum II - Input Array Is Sorted | Two pointers from both ends. | [LeetCode 167](https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/) |
| 3 | Move Zeroes | Fast/slow pointers, swap forward. | [LeetCode 283](https://leetcode.com/problems/move-zeroes/) |
| 4 | Remove Duplicates from Sorted Array | Slow pointer is the write index. | [LeetCode 26](https://leetcode.com/problems/remove-duplicates-from-sorted-array/) |
| 5 | Maximum Subarray | Kadane. | [LeetCode 53](https://leetcode.com/problems/maximum-subarray/) |
| 6 | Best Time to Buy and Sell Stock | Track the running minimum. | [LeetCode 121](https://leetcode.com/problems/best-time-to-buy-and-sell-stock/) |
| 7 | Product of Array Except Self | Prefix pass then suffix pass, `O(1)` extra space. | [LeetCode 238](https://leetcode.com/problems/product-of-array-except-self/) |
| 8 | Sort Colors | Dutch national flag. | [LeetCode 75](https://leetcode.com/problems/sort-colors/) |
| 9 | Rotate Array | Three reversals, in place. | [LeetCode 189](https://leetcode.com/problems/rotate-array/) |
| 10 | Merge Sorted Array | Fill from the back. | [LeetCode 88](https://leetcode.com/problems/merge-sorted-array/) |
| 11 | Container With Most Water | Two pointers, always move the shorter wall. | [LeetCode 11](https://leetcode.com/problems/container-with-most-water/) |
| 12 | Subarray Sum Equals K | Prefix sums + `Map` of counts. | [LeetCode 560](https://leetcode.com/problems/subarray-sum-equals-k/) |

## 2-D prefix sums
| Problem | Hint | Link |
|---------|------|------|
| Range Sum Query 2D - Immutable | 2-D prefix sums; mind the `+ corner` term. | [LeetCode 304](https://leetcode.com/problems/range-sum-query-2d-immutable/) |
| Matrix Block Sum | Every cell is one rectangle query, clamped to the edges. | [LeetCode 1314](https://leetcode.com/problems/matrix-block-sum/) |
| Count Submatrices With All Ones | 2-D prefix sums, or a histogram sweep. | [LeetCode 1504](https://leetcode.com/problems/count-submatrices-with-all-ones/) |

## Memory layout
| Problem | Hint | Link |
|---------|------|------|
| Transpose Matrix | Then time it both ways round - the traversal order decides. | [LeetCode 867](https://leetcode.com/problems/transpose-matrix/) |
| Spiral Matrix | Cache-hostile by construction; note where the misses land. | [LeetCode 54](https://leetcode.com/problems/spiral-matrix/) |
| Rotate Image | In place, and think about which loop order touches fewer lines. | [LeetCode 48](https://leetcode.com/problems/rotate-image/) |
| Set Matrix Zeroes | Watch out for the aliasing trap when you build the marker grid. | [LeetCode 73](https://leetcode.com/problems/set-matrix-zeroes/) |

## Self-check before moving on

- [ ] I keep arrays packed (no `delete`, no accidental holes).
- [ ] I use `Array.from({length: n}, factory)` for 2-D grids.
- [ ] I never use `shift()` to drain a queue.
- [ ] I can write two-pointer and sliding-window loops from scratch.
- [ ] I know `[...grid]` is a shallow copy and when that bites.
- [ ] I can build a 2-D prefix sum and explain the `+ corner` term.
- [ ] I know which way round row-major storage runs, and why it matters.
- [ ] I never build a 2-D grid by multiplying or filling with one row.
