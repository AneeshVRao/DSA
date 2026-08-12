"""
19 - Advanced Topics: Union-Find, Fenwick tree, segment tree and lazy
propagation - each cross-checked against brute force on random operations.

Run:  python advanced.py
"""

from __future__ import annotations

import random
from typing import Callable


# ============================================================================
# 1. Union-Find (Disjoint Set Union)
# ============================================================================
class DisjointSet:
    """Partition of 0..n-1 into disjoint sets.

    Two optimisations make operations effectively constant:
      - PATH COMPRESSION: find() re-points every node on the path at the root.
      - UNION BY SIZE:    the smaller tree is attached under the larger.

    Together: O(alpha(n)) amortised, where alpha is the inverse Ackermann
    function - below 5 for any n that fits in memory.
    """

    def __init__(self, n: int) -> None:
        self.parent = list(range(n))     # every element starts in its own set
        self.size = [1] * n
        self.count = n                   # number of disjoint sets

    def find(self, x: int) -> int:
        """Representative of x's set, with path compression. O(alpha(n))."""
        root = x
        while self.parent[root] != root:
            root = self.parent[root]

        while self.parent[x] != root:    # second pass: flatten the path
            self.parent[x], x = root, self.parent[x]
        return root

    def union(self, a: int, b: int) -> bool:
        """Merge two sets. Returns False if they were already joined.

        That False is exactly the cycle test Kruskal's algorithm needs.
        """
        root_a, root_b = self.find(a), self.find(b)
        if root_a == root_b:
            return False

        if self.size[root_a] < self.size[root_b]:     # union by size
            root_a, root_b = root_b, root_a
        self.parent[root_b] = root_a
        self.size[root_a] += self.size[root_b]
        self.count -= 1
        return True

    def connected(self, a: int, b: int) -> bool:
        return self.find(a) == self.find(b)

    def set_size(self, x: int) -> int:
        return self.size[self.find(x)]


def kruskal_mst(n: int, edges: list[tuple[int, int, int]]) -> tuple[int, list]:
    """Minimum spanning tree via Kruskal. O(E log E).

    Sort edges by weight and take each one unless it would close a cycle -
    which is precisely "union returned False". Returns (total weight, edges);
    the edge list is shorter than n-1 when the graph is disconnected.
    """
    dsu = DisjointSet(n)
    total = 0
    chosen: list[tuple[int, int, int]] = []
    for weight, u, v in sorted((w, u, v) for u, v, w in edges):
        if dsu.union(u, v):              # no cycle: keep this edge
            total += weight
            chosen.append((u, v, weight))
    return total, chosen


# ============================================================================
# 2. Fenwick tree (Binary Indexed Tree)
# ============================================================================
class FenwickTree:
    """Prefix sums with point updates, both in O(log n).

    Index i covers a block of size (i & -i) - the lowest set bit from chapter
    17. That is why the traversals are `i += i & -i` (up) and `i -= i & -i`
    (down): each step flips one bit, so at most log n steps happen.

    Internally 1-indexed, because index 0 has no lowest set bit to follow.
    """

    def __init__(self, size_or_values: int | list[int]) -> None:
        if isinstance(size_or_values, int):
            self.n = size_or_values
            self.tree = [0] * (self.n + 1)
        else:
            self.n = len(size_or_values)
            self.tree = [0] * (self.n + 1)
            for i, value in enumerate(size_or_values):
                self.update(i, value)

    def update(self, index: int, delta: int) -> None:
        """Add delta at index (0-based). O(log n)."""
        i = index + 1
        while i <= self.n:
            self.tree[i] += delta
            i += i & -i                  # move to the next block that covers i

    def prefix_sum(self, count: int) -> int:
        """Sum of the first `count` elements. O(log n)."""
        i = count
        total = 0
        while i > 0:
            total += self.tree[i]
            i -= i & -i                  # strip the lowest set bit
        return total

    def range_sum(self, left: int, right: int) -> int:
        """Sum of values[left:right] - right exclusive. O(log n)."""
        return self.prefix_sum(right) - self.prefix_sum(left)


# ============================================================================
# 3. Segment tree
# ============================================================================
class SegmentTree:
    """Range queries with point updates for ANY associative operation.

    That generality is what it buys over a Fenwick tree: min and max have no
    inverse, so a BIT cannot do them at all.

    Stored as an implicit binary tree in an array of size 4n - enough for any
    n without computing the exact bound.
    """

    def __init__(self, values: list[float],
                 operation: Callable[[float, float], float] = lambda a, b: a + b,
                 identity: float = 0) -> None:
        self.n = len(values)
        self.op = operation
        self.identity = identity
        self.tree = [identity] * (4 * max(self.n, 1))
        if self.n:
            self._build(values, 1, 0, self.n - 1)

    def _build(self, values: list[float], node: int, lo: int, hi: int) -> None:
        """O(n): each node is visited exactly once."""
        if lo == hi:
            self.tree[node] = values[lo]
            return
        mid = (lo + hi) // 2
        self._build(values, 2 * node, lo, mid)
        self._build(values, 2 * node + 1, mid + 1, hi)
        self.tree[node] = self.op(self.tree[2 * node], self.tree[2 * node + 1])

    def update(self, index: int, value: float) -> None:
        """Set values[index] = value. O(log n) - one root-to-leaf path."""
        if not 0 <= index < self.n:
            raise IndexError("index out of range")
        self._update(1, 0, self.n - 1, index, value)

    def _update(self, node: int, lo: int, hi: int, index: int, value: float) -> None:
        if lo == hi:
            self.tree[node] = value
            return
        mid = (lo + hi) // 2
        if index <= mid:
            self._update(2 * node, lo, mid, index, value)
        else:
            self._update(2 * node + 1, mid + 1, hi, index, value)
        self.tree[node] = self.op(self.tree[2 * node], self.tree[2 * node + 1])

    def query(self, left: int, right: int) -> float:
        """Aggregate over values[left:right] - right exclusive. O(log n)."""
        if left >= right or self.n == 0:
            return self.identity
        return self._query(1, 0, self.n - 1, left, right - 1)

    def _query(self, node: int, lo: int, hi: int, left: int, right: int) -> float:
        if right < lo or hi < left:
            return self.identity         # disjoint: contributes nothing
        if left <= lo and hi <= right:
            return self.tree[node]       # fully inside: use the stored value
        mid = (lo + hi) // 2
        return self.op(self._query(2 * node, lo, mid, left, right),
                       self._query(2 * node + 1, mid + 1, hi, left, right))


# ============================================================================
# 4. Lazy propagation - range updates in O(log n)
# ============================================================================
class LazySegmentTree:
    """Range ADD and range SUM, both O(log n).

    Without laziness a range update would touch O(n) leaves. Instead, a node
    records "my whole range still owes +x" and pushes that down only when a
    query actually descends into it.
    """

    def __init__(self, values: list[int]) -> None:
        self.n = len(values)
        self.tree = [0] * (4 * max(self.n, 1))
        self.lazy = [0] * (4 * max(self.n, 1))
        if self.n:
            self._build(values, 1, 0, self.n - 1)

    def _build(self, values: list[int], node: int, lo: int, hi: int) -> None:
        if lo == hi:
            self.tree[node] = values[lo]
            return
        mid = (lo + hi) // 2
        self._build(values, 2 * node, lo, mid)
        self._build(values, 2 * node + 1, mid + 1, hi)
        self.tree[node] = self.tree[2 * node] + self.tree[2 * node + 1]

    def _push(self, node: int, lo: int, hi: int) -> None:
        """Apply this node's pending update and hand it to the children."""
        if self.lazy[node] == 0:
            return
        self.tree[node] += self.lazy[node] * (hi - lo + 1)   # sum over the range
        if lo != hi:                                          # not a leaf
            self.lazy[2 * node] += self.lazy[node]
            self.lazy[2 * node + 1] += self.lazy[node]
        self.lazy[node] = 0

    def range_add(self, left: int, right: int, delta: int) -> None:
        """Add delta to values[left:right] - right exclusive. O(log n)."""
        if left >= right or self.n == 0:
            return
        self._range_add(1, 0, self.n - 1, left, right - 1, delta)

    def _range_add(self, node: int, lo: int, hi: int,
                   left: int, right: int, delta: int) -> None:
        self._push(node, lo, hi)
        if right < lo or hi < left:
            return
        if left <= lo and hi <= right:
            self.lazy[node] += delta     # mark it and stop descending
            self._push(node, lo, hi)
            return
        mid = (lo + hi) // 2
        self._range_add(2 * node, lo, mid, left, right, delta)
        self._range_add(2 * node + 1, mid + 1, hi, left, right, delta)
        self.tree[node] = self.tree[2 * node] + self.tree[2 * node + 1]

    def range_sum(self, left: int, right: int) -> int:
        """Sum of values[left:right] - right exclusive. O(log n)."""
        if left >= right or self.n == 0:
            return 0
        return self._range_sum(1, 0, self.n - 1, left, right - 1)

    def _range_sum(self, node: int, lo: int, hi: int, left: int, right: int) -> int:
        self._push(node, lo, hi)         # settle debts before reading
        if right < lo or hi < left:
            return 0
        if left <= lo and hi <= right:
            return self.tree[node]
        mid = (lo + hi) // 2
        return (self._range_sum(2 * node, lo, mid, left, right)
                + self._range_sum(2 * node + 1, mid + 1, hi, left, right))


# ============================================================================
# demo
# ============================================================================
def demo() -> None:
    dsu = DisjointSet(10)
    assert dsu.count == 10 and not dsu.connected(1, 2)
    assert dsu.union(1, 2) and dsu.union(2, 3)
    assert dsu.connected(1, 3)                    # transitive through 2
    assert not dsu.union(1, 3)                    # already joined = a cycle
    assert dsu.count == 8 and dsu.set_size(1) == 3
    dsu.union(4, 5)
    assert dsu.count == 7 and not dsu.connected(3, 4)
    # Path compression must not change the answers.
    for x in range(10):
        assert dsu.find(x) == dsu.find(dsu.find(x))

    # Union-Find against a brute-force reachability check, randomised.
    random.seed(19)
    for _ in range(50):
        n = 20
        dsu = DisjointSet(n)
        groups = [{i} for i in range(n)]          # the naive model
        for _ in range(30):
            a, b = random.randrange(n), random.randrange(n)
            dsu.union(a, b)
            ga = next(g for g in groups if a in g)
            gb = next(g for g in groups if b in g)
            if ga is not gb:
                ga |= gb
                groups.remove(gb)
        assert dsu.count == len(groups)
        for a in range(n):
            for b in range(n):
                expected = any(a in g and b in g for g in groups)
                assert dsu.connected(a, b) == expected

    #   0 --1-- 1
    #   |  \    |
    #   4    3  2
    #   |      \|
    #   3 --5-- 2
    edges = [(0, 1, 1), (0, 2, 3), (1, 2, 2), (0, 3, 4), (2, 3, 5)]
    weight, chosen = kruskal_mst(4, edges)
    assert weight == 7                            # 1 + 2 + 4
    assert len(chosen) == 3                       # a spanning tree has n-1 edges
    # A disconnected graph yields a forest, not a spanning tree.
    forest_weight, forest_edges = kruskal_mst(4, [(0, 1, 1)])
    assert forest_weight == 1 and len(forest_edges) == 1

    values = [1, 3, 5, 7, 9, 11]
    fenwick = FenwickTree(values)
    assert fenwick.prefix_sum(6) == 36
    assert fenwick.range_sum(1, 4) == 3 + 5 + 7
    assert fenwick.range_sum(0, 0) == 0           # empty range
    fenwick.update(2, 5)                          # values[2] becomes 10
    assert fenwick.range_sum(1, 4) == 3 + 10 + 7

    # Fenwick against brute force, randomised.
    for _ in range(50):
        n = random.randint(1, 30)
        data = [random.randint(-50, 50) for _ in range(n)]
        tree = FenwickTree(data)
        for _ in range(30):
            if random.random() < 0.5:
                i = random.randrange(n)
                delta = random.randint(-20, 20)
                data[i] += delta
                tree.update(i, delta)
            else:
                left = random.randrange(n)
                right = random.randint(left, n)
                assert tree.range_sum(left, right) == sum(data[left:right])

    seg_sum = SegmentTree([1, 3, 5, 7, 9, 11])
    assert seg_sum.query(0, 6) == 36
    assert seg_sum.query(1, 4) == 15
    assert seg_sum.query(2, 2) == 0               # empty range
    seg_sum.update(1, 10)
    assert seg_sum.query(0, 3) == 1 + 10 + 5

    # The same structure with min - something a Fenwick tree cannot do.
    seg_min = SegmentTree([5, 2, 8, 1, 9], operation=min, identity=float("inf"))
    assert seg_min.query(0, 5) == 1
    assert seg_min.query(0, 3) == 2
    seg_min.update(3, 100)
    assert seg_min.query(0, 5) == 2

    seg_max = SegmentTree([5, 2, 8, 1, 9], operation=max, identity=float("-inf"))
    assert seg_max.query(0, 5) == 9 and seg_max.query(0, 2) == 5

    # Segment tree against brute force, randomised.
    for _ in range(50):
        n = random.randint(1, 30)
        data = [random.randint(-50, 50) for _ in range(n)]
        tree = SegmentTree(data)
        for _ in range(30):
            if random.random() < 0.5:
                i = random.randrange(n)
                value = random.randint(-50, 50)
                data[i] = value
                tree.update(i, value)
            else:
                left = random.randrange(n)
                right = random.randint(left, n)
                assert tree.query(left, right) == sum(data[left:right])

    lazy = LazySegmentTree([1, 2, 3, 4, 5])
    assert lazy.range_sum(0, 5) == 15
    lazy.range_add(1, 4, 10)                      # +10 to indices 1, 2, 3
    assert lazy.range_sum(0, 5) == 45
    assert lazy.range_sum(1, 4) == 2 + 3 + 4 + 30
    assert lazy.range_sum(0, 1) == 1              # untouched

    # Lazy propagation against brute force, randomised.
    for _ in range(50):
        n = random.randint(1, 30)
        data = [random.randint(-50, 50) for _ in range(n)]
        tree = LazySegmentTree(data)
        for _ in range(30):
            left = random.randrange(n)
            right = random.randint(left, n)
            if random.random() < 0.5:
                delta = random.randint(-20, 20)
                for i in range(left, right):
                    data[i] += delta
                tree.range_add(left, right, delta)
            else:
                assert tree.range_sum(left, right) == sum(data[left:right])

    print("19-Advanced-Topics (Python): all checks passed")
    print("  Union-Find, Fenwick, segment tree and lazy propagation all "
          "cross-checked against brute force on 50 random runs each")


if __name__ == "__main__":
    demo()
