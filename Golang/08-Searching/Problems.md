# Practice Problems - 08 Searching (Go)

Solve each one twice: once with a hand-written loop, once with `sort.Search`.
The second version is usually three lines.

| # | Problem | Pattern / hint | Link |
|---|---------|----------------|------|
| 1 | Binary Search | The canonical loop. | [LeetCode 704](https://leetcode.com/problems/binary-search/) |
| 2 | Search Insert Position | Exactly `sort.SearchInts`. | [LeetCode 35](https://leetcode.com/problems/search-insert-position/) |
| 3 | First Bad Version | `sort.Search` over a predicate. | [LeetCode 278](https://leetcode.com/problems/first-bad-version/) |
| 4 | Find First and Last Position | Lower bound and upper bound - 1. | [LeetCode 34](https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/) |
| 5 | Sqrt(x) | Use `mid <= n/mid` to avoid overflow. | [LeetCode 69](https://leetcode.com/problems/sqrtx/) |
| 6 | Search in Rotated Sorted Array | One half is always sorted. | [LeetCode 33](https://leetcode.com/problems/search-in-rotated-sorted-array/) |
| 7 | Find Minimum in Rotated Sorted Array | Compare with `nums[hi]`. | [LeetCode 153](https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/) |
| 8 | Find Peak Element | Walk uphill. | [LeetCode 162](https://leetcode.com/problems/find-peak-element/) |
| 9 | Koko Eating Bananas | `sort.Search` over the speed. | [LeetCode 875](https://leetcode.com/problems/koko-eating-bananas/) |
| 10 | Capacity To Ship Packages Within D Days | `sort.Search` over the capacity. | [LeetCode 1011](https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/) |
| 11 | Split Array Largest Sum | Binary search the largest allowed sum. | [LeetCode 410](https://leetcode.com/problems/split-array-largest-sum/) |
| 12 | Median of Two Sorted Arrays | Binary search the partition. | [LeetCode 4](https://leetcode.com/problems/median-of-two-sorted-arrays/) |
| 13 | Search a 2D Matrix | Flatten the index. | [LeetCode 74](https://leetcode.com/problems/search-a-2d-matrix/) |
| 14 | Search a 2D Matrix II | Staircase from the top-right. | [LeetCode 240](https://leetcode.com/problems/search-a-2d-matrix-ii/) |

## Self-check before moving on

- [ ] I can express any of these with `sort.Search` and a predicate.
- [ ] I know `sort.SearchInts` returns an insertion point, not a "found" flag.
- [ ] I can write lower and upper bound by hand.
- [ ] I confirm the predicate is monotonic before trusting `sort.Search`.
- [ ] I recognise "minimum X such that ..." as binary search on the answer.
