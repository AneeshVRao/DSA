# 13 - Heaps and Priority Queue (Python)

> A heap is the answer to "I need the smallest thing repeatedly, and the set
> keeps changing."

## 1. The heap property

A **min-heap** is a *complete* binary tree where every parent is <= its
children. (A max-heap flips the comparison.)

```
            1
          /   \
         3     2
        / \   /
       7   4 5
```

Note what is **not** guaranteed: siblings are unordered, and the tree is not
sorted. Only the path from any node to the root is ordered. That weaker
promise is exactly why a heap is `O(log n)` to maintain while a BST needs
rebalancing.

The root is the minimum, always available in `O(1)`.

---

## 2. It lives in an array

Because the tree is *complete*, it packs into an array with no gaps and no
pointers:

```
index:   0  1  2  3  4  5
value: [ 1, 3, 2, 7, 4, 5 ]

parent(i) = (i - 1) // 2
left(i)   = 2i + 1
right(i)  = 2i + 2
```

That is the whole data structure: an array plus two arithmetic rules. No node
objects, perfect cache locality.

---

## 3. The two primitive operations

**Sift up** (after appending at the end): swap with the parent while it is
larger. `O(log n)`.

**Sift down** (after moving the last element to the root): swap with the
smaller child while a child is smaller. `O(log n)`.

Everything else is built from these two.

| Operation | Cost |
|-----------|------|
| peek (min) | `O(1)` |
| push | `O(log n)` |
| pop | `O(log n)` |
| build from n items | **`O(n)`** |
| search for an arbitrary value | `O(n)` |
| heapsort | `O(n log n)` |

---

## 4. Why building is O(n), not O(n log n)

Sift-down from the last parent backwards. A node at height `h` costs `O(h)`,
and a heap has only `n / 2^(h+1)` nodes at height `h`:

```
sum over h of (n / 2^(h+1)) * h  =  n * sum(h / 2^(h+1))  =  n * 1  =  O(n)
```

Most nodes are leaves and cost nothing. Pushing one at a time would be
`O(n log n)` - so **always `heapify` a batch** instead of pushing in a loop.

---

## 5. Python's heapq

`heapq` operates on a plain list, in place, as a **min-heap**:

```python
import heapq

heapq.heapify(nums)          # O(n), in place
heapq.heappush(heap, x)      # O(log n)
heapq.heappop(heap)          # O(log n), smallest
heap[0]                      # peek, O(1)
heapq.heappushpop(heap, x)   # push then pop, one sift
heapq.heapreplace(heap, x)   # pop then push, one sift
heapq.nlargest(k, nums)      # O(n log k)
heapq.nsmallest(k, nums)
```

**There is no max-heap.** Two workarounds:

```python
heapq.heappush(heap, -x)          # negate on the way in and out
heapq.heappush(heap, (-priority, item))   # tuples compare left to right
```

> Tuples in a heap compare element by element, so a tie on the first element
> compares the second - which throws `TypeError` if the payload is not
> comparable. Insert a monotonic counter as a tie-breaker:
> `(priority, next(counter), item)`.

---

## 6. The patterns

### a. Top k - a heap of size k, not n
For the k **largest**, keep a **min**-heap of size k: the root is the weakest
survivor, so push and pop when the size exceeds k. `O(n log k)`, and `O(k)`
memory instead of `O(n)`.

### b. Merge k sorted lists
Heap holding one element per list. Pop the smallest, push its successor.
`O(N log k)` for N total elements.

### c. Two heaps for a running median
A max-heap for the lower half, a min-heap for the upper half, kept balanced.
Median is `O(1)`; insert is `O(log n)`.

### d. Scheduling / simulation
Always process the earliest deadline or cheapest task next - the heap keeps
the "next" answer current as new work arrives.

### e. Dijkstra and Prim (chapter 14)
A priority queue is the whole difference between `O(V^2)` and `O(E log V)`.

---

## 7. Heap vs sorted structures

| Need | Structure |
|------|-----------|
| repeated min/max with insertions | **heap** |
| fully sorted output | sort (`O(n log n)`) |
| kth smallest, once | quickselect (`O(n)`) |
| ordered iteration, ranges | BST |
| membership tests | hash set |

---

## 8. Complexity of what is implemented here

| Function | Time | Space |
|----------|------|-------|
| `MinHeap.push` / `pop` | `O(log n)` | `O(1)` |
| `MinHeap.peek` | `O(1)` | `O(1)` |
| `MinHeap.heapify` (batch build) | `O(n)` | `O(1)` |
| `heap_sort` | `O(n log n)` | `O(n)` |
| `kth_largest` | `O(n log k)` | `O(k)` |
| `top_k_frequent` | `O(n log k)` | `O(n)` |
| `merge_k_sorted` | `O(N log k)` | `O(k)` |
| `MedianFinder.add` / `median` | `O(log n)` / `O(1)` | `O(n)` |

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
python heaps.py
```
