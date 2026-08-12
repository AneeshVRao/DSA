# Practice Problems - 09 Sorting (JavaScript)

Every single one of these needs a comparator. Never call bare `.sort()`.

| # | Problem | Pattern / hint | Link |
|---|---------|----------------|------|
| 1 | Sort Colors | Dutch flag, one pass, no real sort. | [LeetCode 75](https://leetcode.com/problems/sort-colors/) |
| 2 | Merge Sorted Array | Merge from the back. | [LeetCode 88](https://leetcode.com/problems/merge-sorted-array/) |
| 3 | Sort an Array | Implement merge or heap sort. | [LeetCode 912](https://leetcode.com/problems/sort-an-array/) |
| 4 | Kth Largest Element in an Array | Quickselect, or a size-k heap. | [LeetCode 215](https://leetcode.com/problems/kth-largest-element-in-an-array/) |
| 5 | Top K Frequent Elements | `Map` counts + bucket sort = `O(n)`. | [LeetCode 347](https://leetcode.com/problems/top-k-frequent-elements/) |
| 6 | Merge Intervals | Sort by start, then merge. | [LeetCode 56](https://leetcode.com/problems/merge-intervals/) |
| 7 | Sort the People | Zip, sort by height desc, unzip. | [LeetCode 2418](https://leetcode.com/problems/sort-the-people/) |
| 8 | Largest Number | Comparator on `a+b` vs `b+a` as strings. | [LeetCode 179](https://leetcode.com/problems/largest-number/) |
| 9 | Sort Characters By Frequency | Count, then sort entries by count. | [LeetCode 451](https://leetcode.com/problems/sort-characters-by-frequency/) |
| 10 | Custom Sort String | Rank map + comparator. | [LeetCode 791](https://leetcode.com/problems/custom-sort-string/) |
| 11 | Maximum Gap | Bucket or radix sort for `O(n)`. | [LeetCode 164](https://leetcode.com/problems/maximum-gap/) |
| 12 | Sort List | Merge sort on a linked list. | [LeetCode 148](https://leetcode.com/problems/sort-list/) |

## Self-check before moving on

- [ ] I never call `.sort()` on numbers without `(a, b) => a - b`.
- [ ] My comparators return a number, not a boolean.
- [ ] I can write merge sort and quicksort from memory.
- [ ] I know `sort` is stable (ES2019+) and V8 uses TimSort.
- [ ] I reach for quickselect when only the kth element is needed.
