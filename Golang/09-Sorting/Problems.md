# Practice Problems - 09 Sorting (Go)

Solve each with `sort.Slice` first, then by hand where the problem asks for it.
Remember `sort.Slice` is not stable - reach for `sort.SliceStable` when ties
must hold their order.

| # | Problem | Pattern / hint | Link |
|---|---------|----------------|------|
| 1 | Sort Colors | Dutch flag, one pass. | [LeetCode 75](https://leetcode.com/problems/sort-colors/) |
| 2 | Merge Sorted Array | Merge from the back. | [LeetCode 88](https://leetcode.com/problems/merge-sorted-array/) |
| 3 | Sort an Array | Implement merge or heap sort. | [LeetCode 912](https://leetcode.com/problems/sort-an-array/) |
| 4 | Kth Largest Element in an Array | Quickselect, or `container/heap`. | [LeetCode 215](https://leetcode.com/problems/kth-largest-element-in-an-array/) |
| 5 | Top K Frequent Elements | Count in a map, bucket sort by frequency. | [LeetCode 347](https://leetcode.com/problems/top-k-frequent-elements/) |
| 6 | Merge Intervals | `sort.Slice` by start, then merge. | [LeetCode 56](https://leetcode.com/problems/merge-intervals/) |
| 7 | Meeting Rooms II | Sort starts and ends, then sweep. | [LeetCode 253](https://leetcode.com/problems/meeting-rooms-ii/) |
| 8 | Largest Number | Comparator on `a+b` vs `b+a` as strings. | [LeetCode 179](https://leetcode.com/problems/largest-number/) |
| 9 | Relative Sort Array | Counting sort, or a rank map comparator. | [LeetCode 1122](https://leetcode.com/problems/relative-sort-array/) |
| 10 | H-Index | Sort descending, then scan. | [LeetCode 274](https://leetcode.com/problems/h-index/) |
| 11 | Maximum Gap | Radix or bucket sort for `O(n)`. | [LeetCode 164](https://leetcode.com/problems/maximum-gap/) |
| 12 | Sort List | Merge sort on a linked list. | [LeetCode 148](https://leetcode.com/problems/sort-list/) |

## Self-check before moving on

- [ ] I know `sort.Slice` is unstable and `sort.SliceStable` is not.
- [ ] My `less` functions are strict (never return true for equal elements).
- [ ] I prefer `slices.Sort` on Go 1.21+ for speed.
- [ ] I can write merge sort and quicksort from memory.
- [ ] I use quickselect when only the kth element is needed.
