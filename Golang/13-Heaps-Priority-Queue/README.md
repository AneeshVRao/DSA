# 13 - Heaps and Priority Queue (Go)

> Go ships `container/heap`, but it is a *mixin*, not a container: you supply
> the storage and the ordering, and it supplies the algorithms.

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
are. That weaker promise is why a heap never needs rebalancing.

---

## 2. It lives in a slice

Completeness means no gaps, so links are arithmetic:

```
index:   0  1  2  3  4  5
value: [ 1, 3, 2, 7, 4, 5 ]

parent(i) = (i - 1) / 2
left(i)   = 2i + 1
right(i)  = 2i + 2
```

---

## 3. Costs

| Operation | Cost |
|-----------|------|
| peek | `O(1)` |
| push | `O(log n)` |
| pop | `O(log n)` |
| build from n items | **`O(n)`** (`heap.Init`) |
| search for an arbitrary value | `O(n)` |
| heapsort | `O(n log n)` |

`heap.Init` is `O(n)`; pushing n items one at a time is `O(n log n)`.

---

## 4. container/heap

You implement five methods; the package provides `Init`, `Push`, `Pop`, `Fix`
and `Remove`.

```go
type IntHeap []int

func (h IntHeap) Len() int            { return len(h) }
func (h IntHeap) Less(i, j int) bool  { return h[i] < h[j] }   // < = min-heap
func (h IntHeap) Swap(i, j int)       { h[i], h[j] = h[j], h[i] }
func (h *IntHeap) Push(x any)         { *h = append(*h, x.(int)) }
func (h *IntHeap) Pop() any {                     // removes from the END
    old := *h
    n := len(old)
    item := old[n-1]
    *h = old[:n-1]
    return item
}

h := &IntHeap{5, 2, 8}
heap.Init(h)                 // O(n)
heap.Push(h, 1)              // package function, NOT h.Push
x := heap.Pop(h).(int)       // the minimum
(*h)[0]                      // peek, O(1)
```

Three traps worth memorising:

1. **Call `heap.Push(h, x)`, never `h.Push(x)`.** Your method only appends;
   the package function is what restores the invariant afterwards.
2. **`Pop` removes from the END of the slice.** The package has already moved
   the root there before calling you. Writing `old[0]` breaks everything.
3. **`Push`/`Pop` need pointer receivers** (they change the length);
   `Len`/`Less`/`Swap` do not.

`heap.Fix(h, i)` is the decrease-key operation Dijkstra wants - `O(log n)`
instead of re-heapifying.

---

## 5. The patterns

### a. Top k with a size-k heap
For the k **largest**, keep a **min**-heap of size k: `O(n log k)` time and
`O(k)` space instead of sorting everything.

### b. Merge k sorted slices
Heap of one element per slice: `O(N log k)`.

### c. Two heaps for a running median
Max-heap for the lower half, min-heap for the upper half, kept balanced.

### d. Scheduling / simulation
Always take the earliest deadline or cheapest task next.

### e. Dijkstra and Prim (chapter 14)
The priority queue is what turns `O(V^2)` into `O(E log V)`.

---

## 6. Complexity of what is implemented here

| Function | Time | Space |
|----------|------|-------|
| `MinHeap.Push` / `Pop` | `O(log n)` | `O(1)` |
| `MinHeap.Peek` | `O(1)` | `O(1)` |
| `NewMinHeap` (bulk build) | `O(n)` | `O(1)` |
| `HeapSort` | `O(n log n)` | `O(n)` |
| `KthLargest` | `O(n log k)` | `O(k)` |
| `TopKFrequent` | `O(n log k)` | `O(n)` |
| `MergeKSorted` | `O(N log k)` | `O(k)` |
| `MedianFinder.Add` / `Median` | `O(log n)` / `O(1)` | `O(n)` |

## Run the code

```bash
go run heaps.go
```
