# Practice Problems - 09 Sorting (C++)

Half are "call `sort` with the right comparator". The other half are "use the
idea of a sort without sorting".

| # | Problem | Pattern / hint | Link |
|---|---------|----------------|------|
| 1 | Sort Colors | Dutch flag, one pass. | [LeetCode 75](https://leetcode.com/problems/sort-colors/) |
| 2 | Merge Sorted Array | Merge from the back. | [LeetCode 88](https://leetcode.com/problems/merge-sorted-array/) |
| 3 | Sort an Array | Write merge or heap sort; built-in banned. | [LeetCode 912](https://leetcode.com/problems/sort-an-array/) |
| 4 | Kth Largest Element in an Array | `nth_element`, or quickselect by hand. | [LeetCode 215](https://leetcode.com/problems/kth-largest-element-in-an-array/) |
| 5 | Top K Frequent Elements | Count, then `partial_sort` or bucket sort. | [LeetCode 347](https://leetcode.com/problems/top-k-frequent-elements/) |
| 6 | Merge Intervals | Sort by start, merge overlaps. | [LeetCode 56](https://leetcode.com/problems/merge-intervals/) |
| 7 | Meeting Rooms II | Sort starts and ends, then sweep. | [LeetCode 253](https://leetcode.com/problems/meeting-rooms-ii/) |
| 8 | Largest Number | Comparator on `a+b` vs `b+a` as strings. | [LeetCode 179](https://leetcode.com/problems/largest-number/) |
| 9 | Relative Sort Array | Counting sort, or a custom comparator with a rank map. | [LeetCode 1122](https://leetcode.com/problems/relative-sort-array/) |
| 10 | Maximum Gap | Radix or bucket sort for `O(n)`. | [LeetCode 164](https://leetcode.com/problems/maximum-gap/) |
| 11 | Sort List | Merge sort on a linked list. | [LeetCode 148](https://leetcode.com/problems/sort-list/) |
| 12 | Wiggle Sort II | Quickselect + three-way partition. | [LeetCode 324](https://leetcode.com/problems/wiggle-sort-ii/) |

## Self-check before moving on

- [ ] I can write merge sort and quicksort from memory.
- [ ] I know `std::sort` is introsort and why the fallback exists.
- [ ] My comparators are strict weak orderings (never `<=`).
- [ ] I use `nth_element` when only the kth element is needed.
- [ ] I know which sorts are stable and when that matters.
