# 19 - Advanced Topics (C++)

> Union-Find, Fenwick trees and segment trees. Three structures that turn
> "recompute it every time" into "update it in `O(log n)`" - and the ones
> competitive C++ leans on hardest.

## 1. Union-Find (Disjoint Set Union)

Maintains a partition of `n` elements:

- `find(x)` - which set is x in?
- `unite(x, y)` - merge two sets.

**Path compression** re-points every node on the path at the root during
`find`. **Union by size/rank** attaches the smaller tree under the larger.
Together: **`O(alpha(n))`** amortised - inverse Ackermann, below 5 for any `n`
you can store.

```cpp
int find(int x) { return parent[x] == x ? x : parent[x] = find(parent[x]); }
```

That one-liner is the recursive form with path compression built in. The
iterative version avoids a deep recursion on adversarial input.

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

Ten lines, tiny constant, `O(n)` memory. It handles invertible operations
(sum, XOR) but **not** min/max - you cannot subtract a minimum.

---

## 3. Segment tree

A binary tree over ranges; each node stores its range's aggregate.

| Operation | Cost |
|-----------|------|
| build | `O(n)` |
| range query | `O(log n)` |
| point update | `O(log n)` |
| range update (lazy) | `O(log n)` |

Works for **any associative operation** - sum, min, max, gcd, matrix product.
That generality is what it buys over a Fenwick tree, at 2-4x the memory.

Size the array `4 * n`: enough for any `n` without computing the exact bound
(`2 * 2^ceil(log2 n)`).

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
| static range min | sparse table - `O(1)` query |
| dynamic connectivity (merges) | **Union-Find** |

---

## 5. Complexity of what is implemented here

| Function | Time | Space |
|----------|------|-------|
| `DisjointSet::find` / `unite` | `O(alpha(n))` amortised | `O(n)` |
| `kruskalMst` | `O(E log E)` | `O(V)` |
| `FenwickTree::update` / `prefixSum` | `O(log n)` | `O(n)` |
| `SegmentTree` build | `O(n)` | `O(4n)` |
| `SegmentTree::query` / `update` | `O(log n)` | `O(log n)` stack |
| `LazySegmentTree::rangeAdd` / `rangeSum` | `O(log n)` | `O(4n)` |

## Compile and run

```bash
g++ -std=c++17 -O2 -Wall advanced.cpp -o advanced && ./advanced
```

Every structure is cross-checked against brute force on hundreds of random
operations - the only honest way to trust index arithmetic this fiddly.
