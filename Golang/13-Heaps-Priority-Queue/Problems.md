# Practice Problems - 13 Heaps and Priority Queue (Go)

Write `heap.Interface` until the five methods are automatic. Remember:
`heap.Push(h, x)`, never `h.Push(x)`, and `Pop` removes from the END.

| # | Problem | Pattern / hint | Link |
|---|---------|----------------|------|
| 1 | Kth Largest Element in an Array | Min-heap of size k. | [LeetCode 215](https://leetcode.com/problems/kth-largest-element-in-an-array/) |
| 2 | Kth Largest Element in a Stream | Keep the size-k heap between calls. | [LeetCode 703](https://leetcode.com/problems/kth-largest-element-in-a-stream/) |
| 3 | Top K Frequent Elements | Count map + size-k heap. | [LeetCode 347](https://leetcode.com/problems/top-k-frequent-elements/) |
| 4 | K Closest Points to Origin | Max-heap of size k on squared distance. | [LeetCode 973](https://leetcode.com/problems/k-closest-points-to-origin/) |
| 5 | Merge k Sorted Lists | Heap of one node per list. | [LeetCode 23](https://leetcode.com/problems/merge-k-sorted-lists/) |
| 6 | Find Median from Data Stream | Two heaps, kept balanced. | [LeetCode 295](https://leetcode.com/problems/find-median-from-data-stream/) |
| 7 | Last Stone Weight | Max-heap simulation. | [LeetCode 1046](https://leetcode.com/problems/last-stone-weight/) |
| 8 | Task Scheduler | Greedy with counts. | [LeetCode 621](https://leetcode.com/problems/task-scheduler/) |
| 9 | Meeting Rooms II | Min-heap of end times. | [LeetCode 253](https://leetcode.com/problems/meeting-rooms-ii/) |
| 10 | Reorganize String | Max-heap on character counts. | [LeetCode 767](https://leetcode.com/problems/reorganize-string/) |
| 11 | Network Delay Time | Dijkstra with `container/heap`. | [LeetCode 743](https://leetcode.com/problems/network-delay-time/) |
| 12 | Minimum Cost to Connect Sticks | Always merge the two cheapest. | [LeetCode 1167](https://leetcode.com/problems/minimum-cost-to-connect-sticks/) |

## Indexed priority queue
| Problem | Hint | Link |
|---------|------|------|
| Network Delay Time | Dijkstra - try it with decrease-key instead of stale entries. | [LeetCode 743](https://leetcode.com/problems/network-delay-time/) |
| Design a Stack With Increment Operation | Re-keying entries in place. | [LeetCode 1381](https://leetcode.com/problems/design-a-stack-with-increment-operation/) |
| LFU Cache | Priorities change on every access - exactly the case a plain heap cannot serve. | [LeetCode 460](https://leetcode.com/problems/lfu-cache/) |
| Single-Threaded CPU | A priority queue whose contents are revised as time advances. | [LeetCode 1834](https://leetcode.com/problems/single-threaded-cpu/) |

## Self-check before moving on

- [ ] I can write the five `heap.Interface` methods from memory.
- [ ] I know `Pop` must remove from the END of the slice.
- [ ] I call `heap.Push`/`heap.Pop`, never the methods directly.
- [ ] I use pointer receivers for `Push`/`Pop` only.
- [ ] I know `heap.Fix` is the decrease-key operation Dijkstra needs.
- [ ] I know why a plain heap cannot decrease-key in less than O(n).
- [ ] I can name the second structure that fixes it and what it maps.
- [ ] I know every swap must update BOTH the heap and the position map.
