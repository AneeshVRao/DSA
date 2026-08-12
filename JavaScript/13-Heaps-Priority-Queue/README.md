# 13 - Heaps and Priority Queue (JavaScript)

> JavaScript has **no heap and no priority queue**. This is the one data
> structure you will genuinely have to write in an interview.

## 1. The heap property

A **min-heap** is a *complete* binary tree where every parent is <= its
children (a max-heap flips the comparison).

```
            1
          /   \
         3     2
        / \   /
       7   4 5
```

Siblings are unordered; the tree is not sorted. Only root-to-node paths are
ordered - and that weaker promise is exactly why a heap needs no rebalancing.

---

## 2. It lives in an array

Completeness means no gaps, so the links are arithmetic:

```
index:   0  1  2  3  4  5
value: [ 1, 3, 2, 7, 4, 5 ]

parent(i) = (i - 1) >> 1
left(i)   = 2i + 1
right(i)  = 2i + 2
```

An array plus two rules. That is the entire structure.

---

## 3. Costs

| Operation | Cost |
|-----------|------|
| peek | `O(1)` |
| push | `O(log n)` |
| pop | `O(log n)` |
| build from n items | **`O(n)`** |
| search for an arbitrary value | `O(n)` |
| heapsort | `O(n log n)` |

Building by sifting down from the last parent backwards is `O(n)`: a node at
height `h` costs `O(h)` and only `n/2^(h+1)` nodes sit that high. Pushing one
at a time is `O(n log n)` - build in bulk when you can.

---

## 4. Writing one that takes a comparator

Since you are writing it anyway, take a comparator so the same class serves as
a min-heap, a max-heap, or a priority queue over objects:

```js
const minHeap = new Heap((a, b) => a - b);
const maxHeap = new Heap((a, b) => b - a);
const byPriority = new Heap((a, b) => a.priority - b.priority);
```

Convention: `compare(a, b) < 0` means "a comes out first" - the same contract
as `Array.prototype.sort`.

---

## 5. The patterns

### a. Top k with a size-k heap
For the k **largest**, keep a **min**-heap of size k: the root is the weakest
survivor, so anything smaller is rejected in `O(1)`. `O(n log k)` time, `O(k)`
space - versus `O(n log n)` for sorting everything.

### b. Merge k sorted arrays
Heap of one element per array: `O(N log k)`.

### c. Two heaps for a running median
Max-heap for the lower half, min-heap for the upper half, kept balanced.
Median `O(1)`, insert `O(log n)`.

### d. Scheduling / simulation
Always process the earliest deadline or cheapest task next.

### e. Dijkstra and Prim (chapter 14)
The priority queue is what turns `O(V^2)` into `O(E log V)`.

---

## 6. Traps

- Sorting to get the top k: `O(n log n)` when `O(n log k)` was available.
- Using an array with `indexOf` + `splice` as a priority queue - that is
  `O(n)` per operation and turns Dijkstra into `O(V^2)`.
- Forgetting the comparator contract and returning a boolean.
- Assuming a heap is sorted - only `peek()` is meaningful.

---

## 7. Complexity of what is implemented here

| Function | Time | Space |
|----------|------|-------|
| `Heap.push` / `pop` | `O(log n)` | `O(1)` |
| `Heap.peek` | `O(1)` | `O(1)` |
| `Heap` bulk constructor | `O(n)` | `O(1)` |
| `heapSort` | `O(n log n)` | `O(n)` |
| `kthLargest` | `O(n log k)` | `O(k)` |
| `topKFrequent` | `O(n log k)` | `O(n)` |
| `mergeKSorted` | `O(N log k)` | `O(k)` |
| `MedianFinder.add` / `median` | `O(log n)` / `O(1)` | `O(n)` |

## Run the code

```bash
node heaps.js
```
