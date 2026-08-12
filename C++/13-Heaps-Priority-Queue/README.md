# 13 - Heaps and Priority Queue (C++)

> `priority_queue` is a heap with a lid on it. Know what is underneath, and
> know that it is a **max**-heap by default.

## 1. The heap property

A **min-heap** is a *complete* binary tree where every parent is <= its
children (max-heap flips it).

```
            1
          /   \
         3     2
        / \   /
       7   4 5
```

Siblings are unordered and the tree is not sorted - only root-to-node paths
are. That weaker promise is why a heap needs no rebalancing while a BST does.

---

## 2. It lives in an array

Completeness means no gaps, so parent/child links are arithmetic:

```
index:   0  1  2  3  4  5
value: [ 1, 3, 2, 7, 4, 5 ]

parent(i) = (i - 1) / 2
left(i)   = 2i + 1
right(i)  = 2i + 2
```

A `vector<int>` plus two rules. No nodes, no pointers, ideal cache behaviour.

---

## 3. Costs

| Operation | Cost |
|-----------|------|
| top | `O(1)` |
| push | `O(log n)` |
| pop | `O(log n)` |
| build from n items | **`O(n)`** |
| search for an arbitrary value | `O(n)` |
| heapsort | `O(n log n)` |

Building by sift-down from the last parent backwards telescopes to `O(n)`,
because a node at height `h` costs `O(h)` and only `n/2^(h+1)` nodes sit that
high. Pushing one at a time is `O(n log n)` - always build in bulk.

---

## 4. The STL

```cpp
#include <queue>
priority_queue<int> maxHeap;                                  // MAX by default
priority_queue<int, vector<int>, greater<int>> minHeap;       // min-heap
priority_queue<int> pq(nums.begin(), nums.end());             // O(n) build

pq.push(x); pq.top(); pq.pop();   // pop() returns void - read top() first
```

Custom comparators are **inverted** relative to `sort`: the comparator says
"a has LOWER priority than b", so `greater<int>` yields a min-heap.

```cpp
auto cmp = [](const Task& a, const Task& b) { return a.priority > b.priority; };
priority_queue<Task, vector<Task>, decltype(cmp)> pq(cmp);    // smallest first
```

The raw algorithms are also available when you want the heap in your own
vector:

```cpp
make_heap(v.begin(), v.end());     // O(n)
push_heap(v.begin(), v.end());     // after push_back
pop_heap(v.begin(), v.end());      // moves the max to the BACK; then pop_back
sort_heap(v.begin(), v.end());     // O(n log n), consumes the heap
is_heap(v.begin(), v.end());
```

`priority_queue` has **no iteration** and no way to update a key. When you
need decrease-key (Dijkstra), either push duplicates and skip stale entries,
or use `set` as an indexed priority queue.

---

## 5. The patterns

### a. Top k with a size-k heap
For the k **largest**, keep a **min**-heap of size k: the root is the weakest
survivor. `O(n log k)` time, `O(k)` space.

### b. Merge k sorted sequences
Heap of one element per sequence: `O(N log k)`.

### c. Two heaps for a running median
Max-heap for the lower half, min-heap for the upper half, kept balanced.

### d. Scheduling / simulation
Always process the earliest or cheapest item next.

### e. Dijkstra and Prim (chapter 14)
The priority queue is the difference between `O(V^2)` and `O(E log V)`.

---

## 6. Complexity of what is implemented here

| Function | Time | Space |
|----------|------|-------|
| `MinHeap::push` / `pop` | `O(log n)` | `O(1)` |
| `MinHeap::top` | `O(1)` | `O(1)` |
| `MinHeap` bulk constructor | `O(n)` | `O(1)` |
| `heapSort` | `O(n log n)` | `O(n)` |
| `kthLargest` | `O(n log k)` | `O(k)` |
| `topKFrequent` | `O(n log k)` | `O(n)` |
| `mergeKSorted` | `O(N log k)` | `O(k)` |
| `MedianFinder::add` / `median` | `O(log n)` / `O(1)` | `O(n)` |

## Compile and run

```bash
g++ -std=c++17 -O2 -Wall heaps.cpp -o heaps && ./heaps
```
