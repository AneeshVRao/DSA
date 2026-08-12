# 19 - Advanced Topics (Python)

> Union-Find, Fenwick trees and segment trees. Three structures that turn
> "recompute it every time" into "update it in `O(log n)`".

## 1. Union-Find (Disjoint Set Union)

Maintains a partition of `n` elements into disjoint sets, with two operations:

- `find(x)` - which set is x in?
- `union(x, y)` - merge two sets.

Each set is a tree; the root is the set's identity. Two optimisations make it
almost free:

**Path compression** - after `find(x)`, point every node on the path directly
at the root, so the next lookup is `O(1)`.

**Union by rank/size** - always attach the smaller tree under the larger, so
trees stay shallow.

Together they give **`O(alpha(n))`** amortised per operation, where `alpha` is
the inverse Ackermann function. `alpha(n) < 5` for any `n` you can store in
this universe - effectively constant.

| Use | Why |
|-----|-----|
| Kruskal's MST | "would this edge create a cycle?" |
| Connected components (dynamic) | edges arrive over time; BFS would restart every query |
| Cycle detection in undirected graphs | union fails => cycle |
| Percolation, image segmentation, account merging | equivalence classes |

Union-Find only handles **merging**, never splitting. If sets must split, you
need a different structure entirely.

---

## 2. Fenwick tree (Binary Indexed Tree)

Prefix sums that support updates:

| Structure | Prefix sum | Point update |
|-----------|-----------|--------------|
| plain array | `O(n)` | `O(1)` |
| prefix-sum array | `O(1)` | **`O(n)`** (rebuild) |
| **Fenwick tree** | **`O(log n)`** | **`O(log n)`** |

Index `i` stores the sum of a block of size `i & -i` - the lowest set bit
(chapter 17). That is why traversal is `i += i & -i` going up and
`i -= i & -i` going down: each step clears or adds one bit, so at most
`log n` steps.

Ten lines of code, tiny constant factor. The trade: it handles invertible
operations (sum, XOR) but not `min`/`max`, because you cannot "subtract" a
minimum.

---

## 3. Segment tree

A binary tree over array ranges: each node stores the aggregate of its range.

```
                [0..7] sum=36
              /              \
        [0..3] 10          [4..7] 26
        /     \             /     \
    [0..1]3 [2..3]7    [4..5]11 [6..7]15
```

| Operation | Cost |
|-----------|------|
| build | `O(n)` |
| range query | `O(log n)` |
| point update | `O(log n)` |
| range update (with lazy propagation) | `O(log n)` |

Works for **any associative operation**: sum, min, max, gcd, matrix product.
That generality is what it buys over a Fenwick tree, at 2-4x the memory and a
larger constant.

**Lazy propagation** defers range updates: mark a node "the whole range needs
+5" and push it down only when a query actually enters. Without it, a range
update would be `O(n)`.

---

## 4. Choosing between them

| Need | Structure |
|------|-----------|
| static prefix sums | prefix-sum array - `O(1)` queries |
| prefix sums + point updates | **Fenwick** - smallest and fastest |
| range min/max/gcd + updates | **segment tree** |
| range updates + range queries | segment tree with lazy propagation |
| static range min, no updates | sparse table - `O(1)` query, `O(n log n)` build |
| dynamic connectivity (merges only) | **Union-Find** |

---

## 5. Complexity of what is implemented here

| Function | Time | Space |
|----------|------|-------|
| `DisjointSet.find` / `union` | `O(alpha(n))` amortised | `O(n)` |
| `kruskal_mst` | `O(E log E)` | `O(V)` |
| `FenwickTree.update` / `prefix_sum` | `O(log n)` | `O(n)` |
| `FenwickTree` build | `O(n log n)` | `O(n)` |
| `SegmentTree` build | `O(n)` | `O(4n)` |
| `SegmentTree.query` / `update` | `O(log n)` | `O(log n)` stack |
| `LazySegmentTree.range_add` / `range_sum` | `O(log n)` | `O(4n)` |

## Run the code

```bash
python advanced.py
```

Every structure is cross-checked against a brute-force implementation on
hundreds of random operations - the only honest way to trust index arithmetic
this fiddly.
