# 19 - Advanced Topics (JavaScript)

> Union-Find, Fenwick trees and segment trees. Three structures that turn
> "recompute it every time" into "update it in `O(log n)`".

## 1. Union-Find (Disjoint Set Union)

Maintains a partition of `n` elements:

- `find(x)` - which set is x in?
- `union(x, y)` - merge two sets.

**Path compression** re-points every node on the path at the root during
`find`. **Union by size** attaches the smaller tree under the larger. Together:
**`O(alpha(n))`** amortised - inverse Ackermann, below 5 for any real `n`.

Back it with a **typed array** (`Int32Array`) rather than a plain array: fixed
element type, no boxing, and it never falls into dictionary mode.

| Use | Why |
|-----|-----|
| Kruskal's MST | "would this edge close a cycle?" |
| Dynamic connectivity | edges arrive over time |
| Cycle detection (undirected) | union fails => cycle |
| Account merging, percolation | equivalence classes |

Union-Find merges only. Splitting needs a different structure.

---

## 2. Fenwick tree (Binary Indexed Tree)

| Structure | Prefix sum | Point update |
|-----------|-----------|--------------|
| plain array | `O(n)` | `O(1)` |
| prefix-sum array | `O(1)` | **`O(n)`** |
| **Fenwick tree** | **`O(log n)`** | **`O(log n)`** |

Index `i` covers a block of size `i & -i` - the lowest set bit (chapter 17).
Hence `i += i & -i` going up and `i -= i & -i` going down.

> Those bit operations are 32-bit in JS, so a Fenwick tree indexed beyond 2^31
> is impossible - not a practical limit, but worth knowing why.

Ten lines and a tiny constant. It handles invertible operations (sum, XOR) but
**not** min/max - you cannot subtract a minimum.

---

## 3. Segment tree

A binary tree over ranges; each node stores its range's aggregate.

| Operation | Cost |
|-----------|------|
| build | `O(n)` |
| range query | `O(log n)` |
| point update | `O(log n)` |
| range update (lazy) | `O(log n)` |

Works for **any associative operation** - sum, min, max, gcd. That generality
is what it buys over a Fenwick tree, at 2-4x the memory.

Allocate `4 * n` slots: enough for any `n` without computing the exact bound.

**Lazy propagation** defers range updates - mark a node "this range owes +5"
and push it down only when a query descends into it.

---

## 4. Choosing

| Need | Structure |
|------|-----------|
| static prefix sums | prefix-sum array |
| prefix sums + point updates | **Fenwick** |
| range min/max/gcd + updates | **segment tree** |
| range updates + range queries | segment tree + lazy |
| dynamic connectivity (merges) | **Union-Find** |

---

## 5. Complexity of what is implemented here

| Function | Time | Space |
|----------|------|-------|
| `DisjointSet.find` / `union` | `O(alpha(n))` amortised | `O(n)` |
| `kruskalMst` | `O(E log E)` | `O(V)` |
| `FenwickTree.update` / `prefixSum` | `O(log n)` | `O(n)` |
| `SegmentTree` build | `O(n)` | `O(4n)` |
| `SegmentTree.query` / `update` | `O(log n)` | `O(log n)` stack |
| `LazySegmentTree.rangeAdd` / `rangeSum` | `O(log n)` | `O(4n)` |

## Run the code

```bash
node advanced.js
```

Every structure is cross-checked against brute force on hundreds of random
operations - the only honest way to trust index arithmetic this fiddly.
