/**
 * 19 - Advanced Topics: Union-Find, Fenwick tree, segment tree and lazy
 * propagation - each cross-checked against brute force on random operations.
 *
 * Run:  node advanced.js
 */

import assert from "node:assert/strict";

// A tiny seeded PRNG so the randomised cross-checks are reproducible.
function makeRandom(seed = 19) {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}
const random = makeRandom();
const randInt = (lo, hi) => lo + Math.floor(random() * (hi - lo + 1));

// ============================================================================
// 1. Union-Find (Disjoint Set Union)
// ============================================================================
/**
 * Partition of 0..n-1 into disjoint sets.
 *
 * Two optimisations make operations effectively constant:
 *   PATH COMPRESSION: find() re-points every node on the path at the root.
 *   UNION BY SIZE:    the smaller tree is attached under the larger.
 * Together: O(alpha(n)) amortised - inverse Ackermann, below 5 for any real n.
 *
 * Int32Array keeps the element type fixed and avoids any chance of the arrays
 * degrading into dictionary mode.
 */
export class DisjointSet {
  #parent;
  #size;
  #count;

  constructor(n) {
    this.#parent = new Int32Array(n);
    this.#size = new Int32Array(n).fill(1);
    this.#count = n;
    for (let i = 0; i < n; i++) this.#parent[i] = i; // everyone is their own root
  }

  get count() {
    return this.#count;
  }

  /** Representative of x's set, with path compression. O(alpha(n)). */
  find(x) {
    let root = x;
    while (this.#parent[root] !== root) root = this.#parent[root];
    while (this.#parent[x] !== root) {
      // second pass: flatten
      const next = this.#parent[x];
      this.#parent[x] = root;
      x = next;
    }
    return root;
  }

  /**
   * Merge two sets. Returns false if they were already joined - which is
   * exactly the cycle test Kruskal's algorithm needs.
   */
  union(a, b) {
    let rootA = this.find(a);
    let rootB = this.find(b);
    if (rootA === rootB) return false;
    if (this.#size[rootA] < this.#size[rootB]) [rootA, rootB] = [rootB, rootA];
    this.#parent[rootB] = rootA;
    this.#size[rootA] += this.#size[rootB];
    this.#count--;
    return true;
  }

  connected(a, b) {
    return this.find(a) === this.find(b);
  }

  setSize(x) {
    return this.#size[this.find(x)];
  }
}

/**
 * Kruskal's MST. O(E log E).
 * Sort edges by weight and take each unless it closes a cycle - which is
 * precisely "union returned false".
 */
export function kruskalMst(n, edges) {
  const dsu = new DisjointSet(n);
  const chosen = [];
  let total = 0;
  for (const [u, v, weight] of [...edges].sort((a, b) => a[2] - b[2])) {
    if (dsu.union(u, v)) {
      total += weight;
      chosen.push([u, v, weight]);
    }
  }
  return { total, edges: chosen };
}

// ============================================================================
// 2. Fenwick tree (Binary Indexed Tree)
// ============================================================================
/**
 * Prefix sums with point updates, both O(log n).
 *
 * Index i covers a block of size (i & -i) - the lowest set bit from chapter
 * 17. That is why traversal is `i += i & -i` (up) and `i -= i & -i` (down):
 * each step flips one bit, so at most log n steps happen.
 *
 * Internally 1-indexed, because index 0 has no lowest set bit to follow.
 */
export class FenwickTree {
  #n;
  #tree;

  constructor(sizeOrValues) {
    if (typeof sizeOrValues === "number") {
      this.#n = sizeOrValues;
      this.#tree = new Array(this.#n + 1).fill(0);
    } else {
      this.#n = sizeOrValues.length;
      this.#tree = new Array(this.#n + 1).fill(0);
      sizeOrValues.forEach((value, i) => this.update(i, value));
    }
  }

  /** Add delta at index (0-based). O(log n). */
  update(index, delta) {
    for (let i = index + 1; i <= this.#n; i += i & -i) this.#tree[i] += delta;
  }

  /** Sum of the first `count` elements. O(log n). */
  prefixSum(count) {
    let total = 0;
    for (let i = count; i > 0; i -= i & -i) total += this.#tree[i];
    return total;
  }

  /** Sum of values[left, right) - right exclusive. O(log n). */
  rangeSum(left, right) {
    return this.prefixSum(right) - this.prefixSum(left);
  }
}

// ============================================================================
// 3. Segment tree
// ============================================================================
/**
 * Range queries with point updates for ANY associative operation.
 *
 * That generality is what it buys over a Fenwick tree: min and max have no
 * inverse, so a BIT cannot do them at all.
 *
 * Stored as an implicit binary tree in an array of size 4n - enough for any n
 * without computing the exact bound.
 */
export class SegmentTree {
  #n;
  #op;
  #identity;
  #tree;

  constructor(values, op = (a, b) => a + b, identity = 0) {
    this.#n = values.length;
    this.#op = op;
    this.#identity = identity;
    this.#tree = new Array(4 * Math.max(this.#n, 1)).fill(identity);
    if (this.#n > 0) this.#build(values, 1, 0, this.#n - 1);
  }

  /** O(n): each node is visited exactly once. */
  #build(values, node, lo, hi) {
    if (lo === hi) {
      this.#tree[node] = values[lo];
      return;
    }
    const mid = (lo + hi) >> 1;
    this.#build(values, 2 * node, lo, mid);
    this.#build(values, 2 * node + 1, mid + 1, hi);
    this.#tree[node] = this.#op(this.#tree[2 * node], this.#tree[2 * node + 1]);
  }

  /** Set values[index] = value. O(log n) - one root-to-leaf path. */
  update(index, value) {
    if (index < 0 || index >= this.#n) throw new RangeError("index out of range");
    this.#update(1, 0, this.#n - 1, index, value);
  }

  #update(node, lo, hi, index, value) {
    if (lo === hi) {
      this.#tree[node] = value;
      return;
    }
    const mid = (lo + hi) >> 1;
    if (index <= mid) this.#update(2 * node, lo, mid, index, value);
    else this.#update(2 * node + 1, mid + 1, hi, index, value);
    this.#tree[node] = this.#op(this.#tree[2 * node], this.#tree[2 * node + 1]);
  }

  /** Aggregate over values[left, right) - right exclusive. O(log n). */
  query(left, right) {
    if (left >= right || this.#n === 0) return this.#identity;
    return this.#query(1, 0, this.#n - 1, left, right - 1);
  }

  #query(node, lo, hi, left, right) {
    if (right < lo || hi < left) return this.#identity; // disjoint
    if (left <= lo && hi <= right) return this.#tree[node]; // fully inside
    const mid = (lo + hi) >> 1;
    return this.#op(
      this.#query(2 * node, lo, mid, left, right),
      this.#query(2 * node + 1, mid + 1, hi, left, right),
    );
  }
}

// ============================================================================
// 4. Lazy propagation - range updates in O(log n)
// ============================================================================
/**
 * Range ADD and range SUM, both O(log n).
 *
 * Without laziness a range update would touch O(n) leaves. Instead, a node
 * records "my whole range still owes +x" and pushes that down only when a
 * query actually descends into it.
 */
export class LazySegmentTree {
  #n;
  #tree;
  #lazy;

  constructor(values) {
    this.#n = values.length;
    this.#tree = new Array(4 * Math.max(this.#n, 1)).fill(0);
    this.#lazy = new Array(4 * Math.max(this.#n, 1)).fill(0);
    if (this.#n > 0) this.#build(values, 1, 0, this.#n - 1);
  }

  #build(values, node, lo, hi) {
    if (lo === hi) {
      this.#tree[node] = values[lo];
      return;
    }
    const mid = (lo + hi) >> 1;
    this.#build(values, 2 * node, lo, mid);
    this.#build(values, 2 * node + 1, mid + 1, hi);
    this.#tree[node] = this.#tree[2 * node] + this.#tree[2 * node + 1];
  }

  /** Apply this node's pending update and hand it to the children. */
  #push(node, lo, hi) {
    if (this.#lazy[node] === 0) return;
    this.#tree[node] += this.#lazy[node] * (hi - lo + 1); // sum over the range
    if (lo !== hi) {
      // not a leaf
      this.#lazy[2 * node] += this.#lazy[node];
      this.#lazy[2 * node + 1] += this.#lazy[node];
    }
    this.#lazy[node] = 0;
  }

  /** Add delta to values[left, right) - right exclusive. O(log n). */
  rangeAdd(left, right, delta) {
    if (left >= right || this.#n === 0) return;
    this.#rangeAdd(1, 0, this.#n - 1, left, right - 1, delta);
  }

  #rangeAdd(node, lo, hi, left, right, delta) {
    this.#push(node, lo, hi);
    if (right < lo || hi < left) return;
    if (left <= lo && hi <= right) {
      this.#lazy[node] += delta; // mark it and stop descending
      this.#push(node, lo, hi);
      return;
    }
    const mid = (lo + hi) >> 1;
    this.#rangeAdd(2 * node, lo, mid, left, right, delta);
    this.#rangeAdd(2 * node + 1, mid + 1, hi, left, right, delta);
    this.#tree[node] = this.#tree[2 * node] + this.#tree[2 * node + 1];
  }

  /** Sum of values[left, right) - right exclusive. O(log n). */
  rangeSum(left, right) {
    if (left >= right || this.#n === 0) return 0;
    return this.#rangeSum(1, 0, this.#n - 1, left, right - 1);
  }

  #rangeSum(node, lo, hi, left, right) {
    this.#push(node, lo, hi); // settle debts before reading
    if (right < lo || hi < left) return 0;
    if (left <= lo && hi <= right) return this.#tree[node];
    const mid = (lo + hi) >> 1;
    return (
      this.#rangeSum(2 * node, lo, mid, left, right) +
      this.#rangeSum(2 * node + 1, mid + 1, hi, left, right)
    );
  }
}

// ============================================================================
// demo
// ============================================================================
// ============================================================================
// 5. Sparse table - O(1) range queries on data that never changes
// ============================================================================
/**
 * O(n log n) build, then range min/max/gcd in O(1). No updates.
 *
 * A segment tree answers a range query in O(log n) by stitching together
 * O(log n) DISJOINT blocks. A sparse table answers it in O(1) by covering the
 * range with just TWO blocks - which are allowed to OVERLAP.
 *
 * THE PRECOMPUTE. table[k][i] holds the answer for the block of length 2^k
 * starting at i. Each level is built from the one below by joining two
 * half-length blocks:
 *
 *     table[k][i] = op(table[k-1][i], table[k-1][i + 2^(k-1)])
 *
 * log n levels of n entries each: O(n log n) time and space.
 *
 * THE QUERY. For [left, right), let k = floor(log2(right - left)). Two blocks
 * of length 2^k - one anchored at each end - always cover the range, because
 * 2 * 2^k >= right - left by the choice of k:
 *
 *     [left ............................ right)
 *     [--- 2^k ---]
 *                  [--- 2^k ---]        <- these two OVERLAP in the middle
 *
 * THE CATCH, AND IT IS THE WHOLE POINT. Those blocks overlap, so elements in
 * the middle are counted TWICE. That is harmless only if the operation is
 * IDEMPOTENT - op(x, x) == x:
 *
 *     min, max, gcd, lcm, bitwise and, bitwise or   -> idempotent, works
 *     sum, product, xor, count                      -> NOT, gives nonsense
 *
 * For a sum use a prefix-sum array (static) or a Fenwick tree (dynamic). This
 * is the single most common misuse of the structure - and note it is broken
 * even for a ONE-element range, where both blocks are the same element.
 *
 *                Sparse table   Segment tree   Fenwick tree
 *     Query      O(1)           O(log n)       O(log n)
 *     Update     impossible     O(log n)       O(log n)
 *     Build      O(n log n)     O(n)           O(n log n)
 *     Space      O(n log n)     O(n)           O(n)
 *     Ops        idempotent     any assoc.     invertible
 *
 * So: static data plus a huge number of min/max queries -> sparse table.
 * Anything that changes -> segment tree.
 */
export class SparseTable {
  #op;
  #log2Floor;
  #table;

  constructor(values, op = Math.min) {
    this.#op = op;
    const n = values.length;

    // log2Floor[i] = floor(log2(i)), computed once so queries stay O(1).
    // Math.log2 per query would work but drags floating point into an integer
    // algorithm, and it is famously off by one near powers of two.
    this.#log2Floor = new Int32Array(n + 1);
    for (let i = 2; i <= n; i++) this.#log2Floor[i] = this.#log2Floor[i >> 1] + 1;

    const levels = n ? this.#log2Floor[n] + 1 : 1;
    this.#table = [[...values]];

    for (let k = 1; k < levels; k++) {
      const span = 1 << k;
      const half = span >> 1;
      const previous = this.#table[k - 1];
      const level = new Array(n - span + 1);
      for (let i = 0; i + span <= n; i++) level[i] = op(previous[i], previous[i + half]);
      this.#table.push(level);
    }
  }

  /**
   * op over `values[left, right)` - right exclusive. O(1).
   *
   * Throws on an empty range: there is no identity to return, since `op` is
   * caller-supplied.
   */
  query(left, right) {
    if (left >= right) {
      throw new RangeError("sparse table query needs a non-empty range");
    }
    const k = this.#log2Floor[right - left];
    // Two overlapping blocks of length 2^k. The overlap is why op must be
    // idempotent - see above.
    return this.#op(this.#table[k][left], this.#table[k][right - (1 << k)]);
  }
}

function demo() {
  const dsu = new DisjointSet(10);
  assert.equal(dsu.count, 10);
  assert.ok(!dsu.connected(1, 2));
  assert.ok(dsu.union(1, 2) && dsu.union(2, 3));
  assert.ok(dsu.connected(1, 3)); // transitive through 2
  assert.ok(!dsu.union(1, 3)); // already joined = a cycle
  assert.equal(dsu.count, 8);
  assert.equal(dsu.setSize(1), 3);
  dsu.union(4, 5);
  assert.equal(dsu.count, 7);
  assert.ok(!dsu.connected(3, 4));

  // Union-Find against brute-force reachability, randomised.
  for (let trial = 0; trial < 50; trial++) {
    const n = 20;
    const test = new DisjointSet(n);
    let groups = Array.from({ length: n }, (_, i) => new Set([i]));
    for (let op = 0; op < 30; op++) {
      const a = randInt(0, n - 1);
      const b = randInt(0, n - 1);
      test.union(a, b);
      const ga = groups.find((g) => g.has(a));
      const gb = groups.find((g) => g.has(b));
      if (ga !== gb) {
        for (const x of gb) ga.add(x);
        groups = groups.filter((g) => g !== gb);
      }
    }
    assert.equal(test.count, groups.length);
    for (let a = 0; a < n; a++) {
      for (let b = 0; b < n; b++) {
        const expected = groups.some((g) => g.has(a) && g.has(b));
        assert.equal(test.connected(a, b), expected);
      }
    }
  }

  const mst = kruskalMst(4, [
    [0, 1, 1],
    [0, 2, 3],
    [1, 2, 2],
    [0, 3, 4],
    [2, 3, 5],
  ]);
  assert.equal(mst.total, 7); // 1 + 2 + 4
  assert.equal(mst.edges.length, 3); // a spanning tree has n-1 edges
  const forest = kruskalMst(4, [[0, 1, 1]]);
  assert.equal(forest.total, 1);
  assert.equal(forest.edges.length, 1); // disconnected: a forest

  const fenwick = new FenwickTree([1, 3, 5, 7, 9, 11]);
  assert.equal(fenwick.prefixSum(6), 36);
  assert.equal(fenwick.rangeSum(1, 4), 15);
  assert.equal(fenwick.rangeSum(0, 0), 0); // empty range
  fenwick.update(2, 5); // values[2] becomes 10
  assert.equal(fenwick.rangeSum(1, 4), 20);

  // Fenwick against brute force, randomised.
  for (let trial = 0; trial < 50; trial++) {
    const n = randInt(1, 30);
    const data = Array.from({ length: n }, () => randInt(-50, 50));
    const tree = new FenwickTree(data);
    for (let op = 0; op < 30; op++) {
      if (random() < 0.5) {
        const i = randInt(0, n - 1);
        const delta = randInt(-20, 20);
        data[i] += delta;
        tree.update(i, delta);
      } else {
        const left = randInt(0, n - 1);
        const right = randInt(left, n);
        const expected = data.slice(left, right).reduce((a, b) => a + b, 0);
        assert.equal(tree.rangeSum(left, right), expected);
      }
    }
  }

  const segSum = new SegmentTree([1, 3, 5, 7, 9, 11]);
  assert.equal(segSum.query(0, 6), 36);
  assert.equal(segSum.query(1, 4), 15);
  assert.equal(segSum.query(2, 2), 0); // empty range
  segSum.update(1, 10);
  assert.equal(segSum.query(0, 3), 16);

  // The same structure with min - something a Fenwick tree cannot do.
  const segMin = new SegmentTree([5, 2, 8, 1, 9], Math.min, Infinity);
  assert.equal(segMin.query(0, 5), 1);
  assert.equal(segMin.query(0, 3), 2);
  segMin.update(3, 100);
  assert.equal(segMin.query(0, 5), 2);

  const segMax = new SegmentTree([5, 2, 8, 1, 9], Math.max, -Infinity);
  assert.equal(segMax.query(0, 5), 9);
  assert.equal(segMax.query(0, 2), 5);

  // Segment tree against brute force, randomised.
  for (let trial = 0; trial < 50; trial++) {
    const n = randInt(1, 30);
    const data = Array.from({ length: n }, () => randInt(-50, 50));
    const tree = new SegmentTree(data);
    for (let op = 0; op < 30; op++) {
      if (random() < 0.5) {
        const i = randInt(0, n - 1);
        const value = randInt(-50, 50);
        data[i] = value;
        tree.update(i, value);
      } else {
        const left = randInt(0, n - 1);
        const right = randInt(left, n);
        const expected = data.slice(left, right).reduce((a, b) => a + b, 0);
        assert.equal(tree.query(left, right), expected);
      }
    }
  }

  const lazy = new LazySegmentTree([1, 2, 3, 4, 5]);
  assert.equal(lazy.rangeSum(0, 5), 15);
  lazy.rangeAdd(1, 4, 10); // +10 to indices 1, 2, 3
  assert.equal(lazy.rangeSum(0, 5), 45);
  assert.equal(lazy.rangeSum(1, 4), 39);
  assert.equal(lazy.rangeSum(0, 1), 1); // untouched

  // Lazy propagation against brute force, randomised.
  for (let trial = 0; trial < 50; trial++) {
    const n = randInt(1, 30);
    const data = Array.from({ length: n }, () => randInt(-50, 50));
    const tree = new LazySegmentTree(data);
    for (let op = 0; op < 30; op++) {
      const left = randInt(0, n - 1);
      const right = randInt(left, n);
      if (random() < 0.5) {
        const delta = randInt(-20, 20);
        for (let i = left; i < right; i++) data[i] += delta;
        tree.rangeAdd(left, right, delta);
      } else {
        const expected = data.slice(left, right).reduce((a, b) => a + b, 0);
        assert.equal(tree.rangeSum(left, right), expected);
      }
    }
  }

  // --- Sparse table ---------------------------------------------------------
  const gcdOf = (a, b) => {
    while (b) [a, b] = [b, a % b];
    return Math.abs(a);
  };

  const sparseValues = [7, 2, 3, 0, 5, 10, 3, 12, 18];
  const mins = new SparseTable(sparseValues, Math.min);
  assert.equal(mins.query(0, sparseValues.length), 0);
  assert.equal(mins.query(0, 1), 7); // a single element
  assert.equal(mins.query(4, 7), 3); // 5, 10, 3
  assert.equal(mins.query(7, 9), 12);

  const maxes = new SparseTable(sparseValues, Math.max);
  assert.equal(maxes.query(0, sparseValues.length), 18);
  assert.equal(maxes.query(1, 4), 3); // 2, 3, 0

  const gcds = new SparseTable([12, 18, 24, 36], gcdOf);
  assert.equal(gcds.query(0, 4), 6);
  assert.equal(gcds.query(2, 4), 12);

  assert.throws(() => mins.query(3, 3), RangeError); // empty range

  // Every possible range, against brute force, for all three operations.
  let sparseSeed = 19;
  const sparseRandom = () => {
    sparseSeed = (sparseSeed * 1103515245 + 12345) & 0x7fffffff;
    return sparseSeed / 0x7fffffff;
  };

  for (let trial = 0; trial < 40; trial++) {
    const n = 1 + Math.floor(sparseRandom() * 40);
    const data = Array.from({ length: n }, () =>
      Math.floor(sparseRandom() * 201) - 100,
    );
    const positive = data.map((x) => Math.abs(x) + 1);

    const minTable = new SparseTable(data, Math.min);
    const maxTable = new SparseTable(data, Math.max);
    const gcdTable = new SparseTable(positive, gcdOf);

    for (let left = 0; left < n; left++) {
      let runMin = data[left];
      let runMax = data[left];
      let runGcd = positive[left];
      for (let right = left + 1; right <= n; right++) {
        if (right - 1 > left) {
          runMin = Math.min(runMin, data[right - 1]);
          runMax = Math.max(runMax, data[right - 1]);
          runGcd = gcdOf(runGcd, positive[right - 1]);
        }
        assert.equal(minTable.query(left, right), runMin);
        assert.equal(maxTable.query(left, right), runMax);
        assert.equal(gcdTable.query(left, right), runGcd);
      }
    }
  }

  // And the misuse the doc comment warns about: SUM is not idempotent, so the
  // overlapping blocks double-count. Demonstrated rather than merely claimed.
  const sums = new SparseTable([1, 2, 3, 4, 5], (a, b) => a + b);
  assert.equal(sums.query(0, 3), 8); // (1+2) + (2+3): the 2 counted twice, not 6
  assert.equal(sums.query(0, 4), 20); // both blocks ARE [0,4): 10 + 10, not 10
  assert.equal(sums.query(2, 3), 6); // even ONE element doubles: op(x, x) != x

  console.log("19-Advanced-Topics (JavaScript): all checks passed");
  console.log(
    "  Sparse table checked on EVERY range of 40 random arrays for min,\n" +
      "  max and gcd - and shown to double-count for a non-idempotent op",
  );
  console.log(
    "  Union-Find, Fenwick, segment tree and lazy propagation all " +
      "cross-checked against brute force on 50 random runs each",
  );
}

demo();
