# Practice Problems - 13 Heaps and Priority Queue (C++)

The tell: "kth largest", "top k", "median of a stream", "merge k", "always
take the next cheapest". Keep the heap size k, not n.

| # | Problem | Pattern / hint | Link |
|---|---------|----------------|------|
| 1 | Kth Largest Element in an Array | Min-heap of size k, or `nth_element`. | [LeetCode 215](https://leetcode.com/problems/kth-largest-element-in-an-array/) |
| 2 | Kth Largest Element in a Stream | Keep the size-k heap between calls. | [LeetCode 703](https://leetcode.com/problems/kth-largest-element-in-a-stream/) |
| 3 | Top K Frequent Elements | `unordered_map` + size-k heap. | [LeetCode 347](https://leetcode.com/problems/top-k-frequent-elements/) |
| 4 | K Closest Points to Origin | Max-heap of size k on squared distance. | [LeetCode 973](https://leetcode.com/problems/k-closest-points-to-origin/) |
| 5 | Merge k Sorted Lists | Heap of one node per list. | [LeetCode 23](https://leetcode.com/problems/merge-k-sorted-lists/) |
| 6 | Find Median from Data Stream | Two heaps, kept balanced. | [LeetCode 295](https://leetcode.com/problems/find-median-from-data-stream/) |
| 7 | Last Stone Weight | `priority_queue<int>` simulation. | [LeetCode 1046](https://leetcode.com/problems/last-stone-weight/) |
| 8 | Task Scheduler | Greedy with counts; heap or math. | [LeetCode 621](https://leetcode.com/problems/task-scheduler/) |
| 9 | Meeting Rooms II | Min-heap of end times. | [LeetCode 253](https://leetcode.com/problems/meeting-rooms-ii/) |
| 10 | Reorganize String | Max-heap on character counts. | [LeetCode 767](https://leetcode.com/problems/reorganize-string/) |
| 11 | IPO | Two heaps: affordable by profit, rest by capital. | [LeetCode 502](https://leetcode.com/problems/ipo/) |
| 12 | Network Delay Time | Dijkstra with a priority queue. | [LeetCode 743](https://leetcode.com/problems/network-delay-time/) |

## Self-check before moving on

- [ ] I can implement sift up and sift down from memory.
- [ ] I know `priority_queue` is a MAX-heap by default.
- [ ] I know the comparator is inverted relative to `sort`.
- [ ] I use a min-heap of size k for the k largest elements.
- [ ] I know why building a heap is `O(n)` but n pushes are `O(n log n)`.
