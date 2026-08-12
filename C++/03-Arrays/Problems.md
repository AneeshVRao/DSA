# Practice Problems - 03 Arrays (C++)

Solve each one twice where marked: once by hand, once with the STL algorithm
that does the same job. Knowing both is the point.

| # | Problem | Pattern / hint | Link |
|---|---------|----------------|------|
| 1 | Two Sum | Unsorted: `unordered_map` value -> index. | [LeetCode 1](https://leetcode.com/problems/two-sum/) |
| 2 | Two Sum II - Input Array Is Sorted | Two pointers from both ends. | [LeetCode 167](https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/) |
| 3 | Move Zeroes | Fast/slow pointers; compare with `stable_partition`. | [LeetCode 283](https://leetcode.com/problems/move-zeroes/) |
| 4 | Remove Duplicates from Sorted Array | Hand-rolled, then `unique` + `erase`. | [LeetCode 26](https://leetcode.com/problems/remove-duplicates-from-sorted-array/) |
| 5 | Maximum Subarray | Kadane; use `long long` for the running sum. | [LeetCode 53](https://leetcode.com/problems/maximum-subarray/) |
| 6 | Product of Array Except Self | Prefix pass, then suffix pass. No division. | [LeetCode 238](https://leetcode.com/problems/product-of-array-except-self/) |
| 7 | Sort Colors | Dutch national flag, one pass. | [LeetCode 75](https://leetcode.com/problems/sort-colors/) |
| 8 | Rotate Array | Three reversals; then try `std::rotate`. | [LeetCode 189](https://leetcode.com/problems/rotate-array/) |
| 9 | Merge Sorted Array | Merge from the back so you never overwrite. | [LeetCode 88](https://leetcode.com/problems/merge-sorted-array/) |
| 10 | Subarray Sum Equals K | Prefix sums + `unordered_map` of counts. | [LeetCode 560](https://leetcode.com/problems/subarray-sum-equals-k/) |
| 11 | Container With Most Water | Two pointers; always move the shorter wall. | [LeetCode 11](https://leetcode.com/problems/container-with-most-water/) |
| 12 | Rearrange Array Alternately | In-place index encoding trick. | [GfG](https://www.geeksforgeeks.org/problems/-rearrange-array-alternately-1587115620/1) |

## 2-D prefix sums
| Problem | Hint | Link |
|---------|------|------|
| Range Sum Query 2D - Immutable | 2-D prefix sums; mind the `+ corner` term. | [LeetCode 304](https://leetcode.com/problems/range-sum-query-2d-immutable/) |
| Matrix Block Sum | Every cell is one rectangle query, clamped to the edges. | [LeetCode 1314](https://leetcode.com/problems/matrix-block-sum/) |
| Count Submatrices With All Ones | 2-D prefix sums, or a histogram sweep. | [LeetCode 1504](https://leetcode.com/problems/count-submatrices-with-all-ones/) |

## Self-check before moving on

- [ ] I can implement a growable array with correct copy semantics.
- [ ] I know why `push_back` is amortised `O(1)` and what `reserve` saves.
- [ ] I use `long long` for any sum that can exceed 2 * 10^9.
- [ ] I never compare a signed `int` against `v.size()` without a cast.
- [ ] I know the erase-remove idiom and why `remove` alone is not enough.
- [ ] I can build a 2-D prefix sum and explain the `+ corner` term.
