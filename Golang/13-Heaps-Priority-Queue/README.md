# 13 - Heaps and Priority Queue (Go)

> Go ships `container/heap`, but it is a *mixin*, not a container: you supply
> the storage and the ordering, and it supplies the algorithms.

**At a glance**

| | |
|---|---|
| **What it is** | `O(1)` access to the extreme element, `O(log n)` to change it. |
| **Must know** | For the k **largest**, keep a **min**-heap of size k. That is the whole trick. |
| **The one trap** | A heap is not sorted. Only the root is guaranteed - the rest is partial order. |
| **Reach for it when** | "Top k", "merge k sorted", "running median", schedulers. |

---

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

## Indexed priority queue - a heap whose keys can change

A plain binary heap can only see its root. To lower the priority of some
arbitrary item you would first have to **find** it - `O(n)` - which defeats the
purpose. That is why the usual Dijkstra sidesteps the problem entirely:

```text
push a duplicate entry, and skip stale ones on pop:
    if distance > best[node]: continue
```

Correct, and usually fine - but the heap grows to `O(E)` entries instead of
`O(V)`.

**The fix** is a second structure: a map from item to its current **position**
in the heap array.

```text
heap[i]         the item at heap position i
position[item]  the heap position of that item   (the inverse map)
```

Now any item is located in `O(1)` and re-sifted in `O(log n)`, which makes
`change_priority` and `remove(item)` real operations.

> **Every swap must update BOTH structures.** That is the entire implementation
> difficulty. One forgotten position write and the map silently goes stale - it
> surfaces much later as a wrong answer, not a crash. The demo therefore
> re-verifies the heap order *and* the position map after every one of 7200
> random operations, rather than only at the end.

| Operation | Plain heap | Indexed heap |
|-----------|-----------|--------------|
| push / pop | `O(log n)` | `O(log n)` |
| peek | `O(1)` | `O(1)` |
| **change priority of an item** | `O(n)` | **`O(log n)`** |
| **remove an arbitrary item** | `O(n)` | **`O(log n)`** |
| contains | `O(n)` | **`O(1)`** |

**Where it pays off:** Dijkstra and Prim with a true decrease-key (the heap
stays `O(V)`), A* with reopened nodes, schedulers where a queued job's priority
is revised, and LRU/LFU caches with an evictable score per key.

---

## Run the code

```bash
go run heaps.go
```

---

[<- 12 Binary Search Tree](../12-Binary-Search-Tree/) · [All topics](../../README.md) · [14 Graphs ->](../14-Graphs/)
