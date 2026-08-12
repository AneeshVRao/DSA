# Practice Problems - 08 Searching (Python)

Do #1-#5 until the loop invariants are automatic. Then move to the
"binary search on the answer" group (#9-#12), which is where interviews live.

| # | Problem | Pattern / hint | Link |
|---|---------|----------------|------|
| 1 | Binary Search | The canonical loop. Get the bounds right. | [LeetCode 704](https://leetcode.com/problems/binary-search/) |
| 2 | Search Insert Position | This is exactly `lower_bound`. | [LeetCode 35](https://leetcode.com/problems/search-insert-position/) |
| 3 | First Bad Version | Binary search over a predicate, not values. | [LeetCode 278](https://leetcode.com/problems/first-bad-version/) |
| 4 | Find First and Last Position | `lower_bound` and `upper_bound - 1`. | [LeetCode 34](https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/) |
| 5 | Sqrt(x) | Largest `x` with `x*x <= n`. | [LeetCode 69](https://leetcode.com/problems/sqrtx/) |
| 6 | Search in Rotated Sorted Array | One half is always sorted. | [LeetCode 33](https://leetcode.com/problems/search-in-rotated-sorted-array/) |
| 7 | Find Minimum in Rotated Sorted Array | Compare against `nums[hi]`. | [LeetCode 153](https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/) |
| 8 | Find Peak Element | Walk uphill; ends count as -infinity. | [LeetCode 162](https://leetcode.com/problems/find-peak-element/) |
| 9 | Koko Eating Bananas | Binary search the eating speed. | [LeetCode 875](https://leetcode.com/problems/koko-eating-bananas/) |
| 10 | Capacity To Ship Packages Within D Days | Binary search the capacity. | [LeetCode 1011](https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/) |
| 11 | Split Array Largest Sum | Binary search the largest allowed sum. | [LeetCode 410](https://leetcode.com/problems/split-array-largest-sum/) |
| 12 | Median of Two Sorted Arrays | Binary search the partition. Hard, worth it. | [LeetCode 4](https://leetcode.com/problems/median-of-two-sorted-arrays/) |
| 13 | Search a 2D Matrix | Flatten the index. | [LeetCode 74](https://leetcode.com/problems/search-a-2d-matrix/) |
| 14 | Allocate Minimum Pages | The classic Indian-interview version of #11. | [GfG](https://www.geeksforgeeks.org/problems/allocate-minimum-number-of-pages0937/1) |

## Self-check before moving on

- [ ] I can write binary search correctly on the first try, both conventions.
- [ ] I can write `lower_bound` and `upper_bound` from memory.
- [ ] I know when the answer needs "record and keep shrinking".
- [ ] I can spot a "binary search on the answer" problem from the phrasing
      ("minimum X such that ...").
- [ ] I verify my predicate is monotonic before trusting the search.
