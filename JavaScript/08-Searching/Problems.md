# Practice Problems - 08 Searching (JavaScript)

JS has no built-in binary search, so #1-#5 are pure muscle memory. #9-#12 are
where interviews actually go.

| # | Problem | Pattern / hint | Link |
|---|---------|----------------|------|
| 1 | Binary Search | The canonical loop. | [LeetCode 704](https://leetcode.com/problems/binary-search/) |
| 2 | Search Insert Position | Exactly `lowerBound`. | [LeetCode 35](https://leetcode.com/problems/search-insert-position/) |
| 3 | First Bad Version | Binary search a predicate. | [LeetCode 278](https://leetcode.com/problems/first-bad-version/) |
| 4 | Find First and Last Position | `lowerBound` and `upperBound - 1`. | [LeetCode 34](https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/) |
| 5 | Sqrt(x) | Largest x with `x*x <= n`. | [LeetCode 69](https://leetcode.com/problems/sqrtx/) |
| 6 | Search in Rotated Sorted Array | One half is always sorted. | [LeetCode 33](https://leetcode.com/problems/search-in-rotated-sorted-array/) |
| 7 | Find Minimum in Rotated Sorted Array | Compare with `nums[hi]`. | [LeetCode 153](https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/) |
| 8 | Find Peak Element | Walk uphill. | [LeetCode 162](https://leetcode.com/problems/find-peak-element/) |
| 9 | Koko Eating Bananas | Binary search the speed. | [LeetCode 875](https://leetcode.com/problems/koko-eating-bananas/) |
| 10 | Capacity To Ship Packages Within D Days | Binary search the capacity. | [LeetCode 1011](https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/) |
| 11 | Split Array Largest Sum | Binary search the largest allowed sum. | [LeetCode 410](https://leetcode.com/problems/split-array-largest-sum/) |
| 12 | Median of Two Sorted Arrays | Binary search the partition. | [LeetCode 4](https://leetcode.com/problems/median-of-two-sorted-arrays/) |
| 13 | Search a 2D Matrix | Flatten the index with `Math.floor`. | [LeetCode 74](https://leetcode.com/problems/search-a-2d-matrix/) |
| 14 | Search a 2D Matrix II | Staircase from the top-right. | [LeetCode 240](https://leetcode.com/problems/search-a-2d-matrix-ii/) |

## Ternary search
| Problem | Hint | Link |
|---------|------|------|
| Peak Index in a Mountain Array | The definition of unimodal - binary search on the slope also works. | [LeetCode 852](https://leetcode.com/problems/peak-index-in-a-mountain-array/) |
| Find in Mountain Array | Ternary search for the peak, then binary search each side. | [LeetCode 1095](https://leetcode.com/problems/find-in-mountain-array/) |
| Minimize Max Distance to Gas Station | The cost falls then rises in the answer. | [LeetCode 774](https://leetcode.com/problems/minimize-max-distance-to-gas-station/) |
| Maximum Value at a Given Index | Unimodal in the chosen peak height. | [LeetCode 1802](https://leetcode.com/problems/maximum-value-at-a-given-index-in-a-bounded-array/) |

## Self-check before moving on

- [ ] I can write binary search correctly on the first try.
- [ ] I know when `>> 1` is unsafe and use `Math.floor` instead.
- [ ] I can write `lowerBound` and `upperBound` from memory.
- [ ] I recognise "minimum X such that ..." as binary search on the answer.
- [ ] I always sort with a comparator before binary searching numbers.
- [ ] I know ternary search needs UNIMODALITY, not monotonicity.
- [ ] I know why it breaks on a plateau.
- [ ] I know the float version caps out near sqrt(machine epsilon).
