# Practice Problems - 09 Sorting (Python)

Half of these are "use the built-in with the right key". The other half are
"use the *idea* of a sort without sorting".

| # | Problem | Pattern / hint | Link |
|---|---------|----------------|------|
| 1 | Sort Colors | Dutch flag, one pass, no real sort. | [LeetCode 75](https://leetcode.com/problems/sort-colors/) |
| 2 | Merge Sorted Array | The merge step, filled from the back. | [LeetCode 88](https://leetcode.com/problems/merge-sorted-array/) |
| 3 | Sort an Array | Implement merge or heap sort; built-in is banned. | [LeetCode 912](https://leetcode.com/problems/sort-an-array/) |
| 4 | Kth Largest Element in an Array | Quickselect `O(n)` average, or a heap. | [LeetCode 215](https://leetcode.com/problems/kth-largest-element-in-an-array/) |
| 5 | Top K Frequent Elements | Counter + bucket sort = `O(n)`. | [LeetCode 347](https://leetcode.com/problems/top-k-frequent-elements/) |
| 6 | Meeting Rooms II | Sort starts and ends separately, then sweep. | [LeetCode 253](https://leetcode.com/problems/meeting-rooms-ii/) |
| 7 | Merge Intervals | Sort by start, then merge overlaps. | [LeetCode 56](https://leetcode.com/problems/merge-intervals/) |
| 8 | Largest Number | Custom comparator: `a+b` vs `b+a` as strings. | [LeetCode 179](https://leetcode.com/problems/largest-number/) |
| 9 | H-Index | Sort descending, then scan. | [LeetCode 274](https://leetcode.com/problems/h-index/) |
| 10 | Sort Characters By Frequency | `Counter.most_common`. | [LeetCode 451](https://leetcode.com/problems/sort-characters-by-frequency/) |
| 11 | Maximum Gap | Radix or bucket sort gives `O(n)`. | [LeetCode 164](https://leetcode.com/problems/maximum-gap/) |
| 12 | Sort List | Merge sort on a linked list, `O(1)` extra space. | [LeetCode 148](https://leetcode.com/problems/sort-list/) |

## Self-check before moving on

- [ ] I can write merge sort and quicksort from memory.
- [ ] I can explain why the comparison lower bound is `O(n log n)`.
- [ ] I know which sorts are stable and why stability matters.
- [ ] I know why quicksort needs a random pivot.
- [ ] I reach for quickselect when the problem asks for the kth element.
- [ ] I can use `sorted(key=...)` with a tuple key for multi-level sorting.
