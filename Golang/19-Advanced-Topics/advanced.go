// 19 - Advanced Topics: Union-Find, Fenwick tree, segment tree and lazy
// propagation - each cross-checked against brute force on random operations.
//
// Run:  go run advanced.go
package main

import (
	"fmt"
	"math"
	"math/rand"
	"sort"
)

// ============================================================================
// 1. Union-Find (Disjoint Set Union)
// ============================================================================

// DisjointSet partitions 0..n-1 into disjoint sets.
//
// Two optimisations make operations effectively constant:
//
//	PATH COMPRESSION: Find re-points every node on the path at the root.
//	UNION BY SIZE:    the smaller tree is attached under the larger.
//
// Together: O(alpha(n)) amortised - inverse Ackermann, below 5 for any real n.
type DisjointSet struct {
	parent []int
	size   []int
	count  int
}

func NewDisjointSet(n int) *DisjointSet {
	d := &DisjointSet{
		parent: make([]int, n),
		size:   make([]int, n),
		count:  n,
	}
	for i := range d.parent {
		d.parent[i] = i // everyone starts as their own root
		d.size[i] = 1
	}
	return d
}

// Find returns the representative of x's set, compressing the path on the way.
func (d *DisjointSet) Find(x int) int {
	root := x
	for d.parent[root] != root {
		root = d.parent[root]
	}
	for d.parent[x] != root { // second pass: flatten the path
		d.parent[x], x = root, d.parent[x]
	}
	return root
}

// Union merges two sets. It returns false if they were already joined - which
// is exactly the cycle test Kruskal's algorithm needs.
func (d *DisjointSet) Union(a, b int) bool {
	rootA, rootB := d.Find(a), d.Find(b)
	if rootA == rootB {
		return false
	}
	if d.size[rootA] < d.size[rootB] { // union by size
		rootA, rootB = rootB, rootA
	}
	d.parent[rootB] = rootA
	d.size[rootA] += d.size[rootB]
	d.count--
	return true
}

func (d *DisjointSet) Connected(a, b int) bool { return d.Find(a) == d.Find(b) }
func (d *DisjointSet) SetSize(x int) int       { return d.size[d.Find(x)] }
func (d *DisjointSet) Count() int              { return d.count }

// Edge is a weighted undirected edge.
type Edge struct{ U, V, Weight int }

// KruskalMST builds a minimum spanning tree. O(E log E).
// Sort edges by weight and take each unless it closes a cycle - which is
// precisely "Union returned false". The result is a forest when the graph is
// disconnected.
func KruskalMST(n int, edges []Edge) (int, []Edge) {
	ordered := append([]Edge(nil), edges...)
	sort.Slice(ordered, func(i, j int) bool { return ordered[i].Weight < ordered[j].Weight })

	dsu := NewDisjointSet(n)
	total := 0
	var chosen []Edge
	for _, e := range ordered {
		if dsu.Union(e.U, e.V) {
			total += e.Weight
			chosen = append(chosen, e)
		}
	}
	return total, chosen
}

// ============================================================================
// 2. Fenwick tree (Binary Indexed Tree)
// ============================================================================

// FenwickTree supports prefix sums with point updates, both O(log n).
//
// Index i covers a block of size (i & -i) - the lowest set bit from chapter
// 17. That is why traversal is i += i & -i (up) and i -= i & -i (down): each
// step flips one bit, so at most log n steps happen.
//
// Internally 1-indexed, because index 0 has no lowest set bit to follow.
type FenwickTree struct {
	n    int
	tree []int
}

func NewFenwickTree(n int) *FenwickTree {
	return &FenwickTree{n: n, tree: make([]int, n+1)}
}

func NewFenwickTreeFrom(values []int) *FenwickTree {
	f := NewFenwickTree(len(values))
	for i, v := range values {
		f.Update(i, v)
	}
	return f
}

// Update adds delta at index (0-based). O(log n).
func (f *FenwickTree) Update(index, delta int) {
	for i := index + 1; i <= f.n; i += i & -i {
		f.tree[i] += delta
	}
}

// PrefixSum returns the sum of the first count elements. O(log n).
func (f *FenwickTree) PrefixSum(count int) int {
	total := 0
	for i := count; i > 0; i -= i & -i {
		total += f.tree[i]
	}
	return total
}

// RangeSum returns the sum of values[left:right] - right exclusive. O(log n).
func (f *FenwickTree) RangeSum(left, right int) int {
	return f.PrefixSum(right) - f.PrefixSum(left)
}

// ============================================================================
// 3. Segment tree
// ============================================================================

// SegmentTree answers range queries with point updates for ANY associative
// operation. That generality is what it buys over a Fenwick tree: min and max
// have no inverse, so a BIT cannot do them at all.
//
// Stored as an implicit binary tree in a slice of size 4n - enough for any n
// without computing the exact bound.
type SegmentTree struct {
	n        int
	op       func(a, b int) int
	identity int
	tree     []int
}

func NewSegmentTree(values []int, op func(a, b int) int, identity int) *SegmentTree {
	if op == nil {
		op = func(a, b int) int { return a + b }
	}
	size := len(values)
	if size == 0 {
		size = 1
	}
	s := &SegmentTree{
		n:        len(values),
		op:       op,
		identity: identity,
		tree:     make([]int, 4*size),
	}
	for i := range s.tree {
		s.tree[i] = identity
	}
	if s.n > 0 {
		s.build(values, 1, 0, s.n-1)
	}
	return s
}

// build is O(n): each node is visited exactly once.
func (s *SegmentTree) build(values []int, node, lo, hi int) {
	if lo == hi {
		s.tree[node] = values[lo]
		return
	}
	mid := lo + (hi-lo)/2
	s.build(values, 2*node, lo, mid)
	s.build(values, 2*node+1, mid+1, hi)
	s.tree[node] = s.op(s.tree[2*node], s.tree[2*node+1])
}

// Update sets values[index] = value. O(log n) - one root-to-leaf path.
func (s *SegmentTree) Update(index, value int) error {
	if index < 0 || index >= s.n {
		return fmt.Errorf("index %d out of range [0,%d)", index, s.n)
	}
	s.update(1, 0, s.n-1, index, value)
	return nil
}

func (s *SegmentTree) update(node, lo, hi, index, value int) {
	if lo == hi {
		s.tree[node] = value
		return
	}
	mid := lo + (hi-lo)/2
	if index <= mid {
		s.update(2*node, lo, mid, index, value)
	} else {
		s.update(2*node+1, mid+1, hi, index, value)
	}
	s.tree[node] = s.op(s.tree[2*node], s.tree[2*node+1])
}

// Query aggregates over values[left:right] - right exclusive. O(log n).
func (s *SegmentTree) Query(left, right int) int {
	if left >= right || s.n == 0 {
		return s.identity
	}
	return s.query(1, 0, s.n-1, left, right-1)
}

func (s *SegmentTree) query(node, lo, hi, left, right int) int {
	if right < lo || hi < left {
		return s.identity // disjoint: contributes nothing
	}
	if left <= lo && hi <= right {
		return s.tree[node] // fully inside: use the stored value
	}
	mid := lo + (hi-lo)/2
	return s.op(s.query(2*node, lo, mid, left, right),
		s.query(2*node+1, mid+1, hi, left, right))
}

// ============================================================================
// 4. Lazy propagation - range updates in O(log n)
// ============================================================================

// LazySegmentTree supports range ADD and range SUM, both O(log n).
//
// Without laziness a range update would touch O(n) leaves. Instead a node
// records "my whole range still owes +x" and pushes that down only when a
// query actually descends into it.
type LazySegmentTree struct {
	n    int
	tree []int
	lazy []int
}

func NewLazySegmentTree(values []int) *LazySegmentTree {
	size := len(values)
	if size == 0 {
		size = 1
	}
	l := &LazySegmentTree{
		n:    len(values),
		tree: make([]int, 4*size),
		lazy: make([]int, 4*size),
	}
	if l.n > 0 {
		l.build(values, 1, 0, l.n-1)
	}
	return l
}

func (l *LazySegmentTree) build(values []int, node, lo, hi int) {
	if lo == hi {
		l.tree[node] = values[lo]
		return
	}
	mid := lo + (hi-lo)/2
	l.build(values, 2*node, lo, mid)
	l.build(values, 2*node+1, mid+1, hi)
	l.tree[node] = l.tree[2*node] + l.tree[2*node+1]
}

// push applies this node's pending update and hands it to the children.
func (l *LazySegmentTree) push(node, lo, hi int) {
	if l.lazy[node] == 0 {
		return
	}
	l.tree[node] += l.lazy[node] * (hi - lo + 1) // sum over the whole range
	if lo != hi {                                // not a leaf
		l.lazy[2*node] += l.lazy[node]
		l.lazy[2*node+1] += l.lazy[node]
	}
	l.lazy[node] = 0
}

// RangeAdd adds delta to values[left:right] - right exclusive. O(log n).
func (l *LazySegmentTree) RangeAdd(left, right, delta int) {
	if left >= right || l.n == 0 {
		return
	}
	l.rangeAdd(1, 0, l.n-1, left, right-1, delta)
}

func (l *LazySegmentTree) rangeAdd(node, lo, hi, left, right, delta int) {
	l.push(node, lo, hi)
	if right < lo || hi < left {
		return
	}
	if left <= lo && hi <= right {
		l.lazy[node] += delta // mark it and stop descending
		l.push(node, lo, hi)
		return
	}
	mid := lo + (hi-lo)/2
	l.rangeAdd(2*node, lo, mid, left, right, delta)
	l.rangeAdd(2*node+1, mid+1, hi, left, right, delta)
	l.tree[node] = l.tree[2*node] + l.tree[2*node+1]
}

// RangeSum returns the sum of values[left:right] - right exclusive. O(log n).
func (l *LazySegmentTree) RangeSum(left, right int) int {
	if left >= right || l.n == 0 {
		return 0
	}
	return l.rangeSum(1, 0, l.n-1, left, right-1)
}

func (l *LazySegmentTree) rangeSum(node, lo, hi, left, right int) int {
	l.push(node, lo, hi) // settle debts before reading
	if right < lo || hi < left {
		return 0
	}
	if left <= lo && hi <= right {
		return l.tree[node]
	}
	mid := lo + (hi-lo)/2
	return l.rangeSum(2*node, lo, mid, left, right) +
		l.rangeSum(2*node+1, mid+1, hi, left, right)
}

// ============================================================================
// demo
// ============================================================================

// ============================================================================
// 5. Sparse table - O(1) range queries on data that never changes
// ============================================================================

// SparseTable answers idempotent range queries in O(1) after an O(n log n)
// build. It supports no updates at all.
//
// O(n log n) build, then range min/max/gcd in O(1). No updates.
//
// A segment tree answers a range query in O(log n) by stitching together
// O(log n) DISJOINT blocks. A sparse table answers it in O(1) by covering the
// range with just TWO blocks - which are allowed to OVERLAP.
//
// THE PRECOMPUTE. table[k][i] holds the answer for the block of length 2^k
// starting at i. Each level is built from the one below by joining two
// half-length blocks:
//
//	table[k][i] = op(table[k-1][i], table[k-1][i + 2^(k-1)])
//
// log n levels of n entries each: O(n log n) time and space.
//
// THE QUERY. For [left, right), let k = floor(log2(right - left)). Two blocks
// of length 2^k - one anchored at each end - always cover the range, because
// 2 * 2^k >= right - left by the choice of k:
//
//	[left ............................ right)
//	[--- 2^k ---]
//	             [--- 2^k ---]        <- these two OVERLAP in the middle
//
// THE CATCH, AND IT IS THE WHOLE POINT. Those blocks overlap, so elements in
// the middle are counted TWICE. That is harmless only if the operation is
// IDEMPOTENT - op(x, x) == x:
//
//	min, max, gcd, lcm, bitwise and, bitwise or   -> idempotent, works
//	sum, product, xor, count                      -> NOT, gives nonsense
//
// For a sum use a prefix-sum array (static) or a Fenwick tree (dynamic). This
// is the single most common misuse of the structure - and note it is broken
// even for a ONE-element range, where both blocks are the same element.
//
//	           Sparse table   Segment tree   Fenwick tree
//	Query      O(1)           O(log n)       O(log n)
//	Update     impossible     O(log n)       O(log n)
//	Build      O(n log n)     O(n)           O(n log n)
//	Space      O(n log n)     O(n)           O(n)
//	Ops        idempotent     any assoc.     invertible
//
// So: static data plus a huge number of min/max queries -> sparse table.
// Anything that changes -> segment tree.
type SparseTable struct {
	op        func(a, b int) int
	log2Floor []int
	table     [][]int
}

// NewSparseTable builds the table. O(n log n) time and space.
func NewSparseTable(values []int, op func(a, b int) int) *SparseTable {
	n := len(values)

	// log2Floor[i] = floor(log2(i)), computed once so queries stay O(1).
	// math.Log2 per query would work but drags floating point into an integer
	// algorithm, and it is famously off by one near powers of two.
	log2Floor := make([]int, n+1)
	for i := 2; i <= n; i++ {
		log2Floor[i] = log2Floor[i/2] + 1
	}

	levels := 1
	if n > 0 {
		levels = log2Floor[n] + 1
	}

	table := make([][]int, levels)
	table[0] = append([]int(nil), values...) // copy, do not alias the caller

	for k := 1; k < levels; k++ {
		span := 1 << k
		half := span >> 1
		table[k] = make([]int, n-span+1)
		for i := 0; i+span <= n; i++ {
			table[k][i] = op(table[k-1][i], table[k-1][i+half])
		}
	}

	return &SparseTable{op: op, log2Floor: log2Floor, table: table}
}

// Query returns op over values[left:right] - right exclusive. O(1).
//
// Returns an error on an empty range: there is no identity to return, since op
// is caller-supplied.
func (s *SparseTable) Query(left, right int) (int, error) {
	if left >= right {
		return 0, fmt.Errorf("sparse table query needs a non-empty range, got [%d, %d)",
			left, right)
	}
	k := s.log2Floor[right-left]
	// Two overlapping blocks of length 2^k. The overlap is why op must be
	// idempotent - see above.
	return s.op(s.table[k][left], s.table[k][right-(1<<k)]), nil
}

func assert(cond bool, msg string) {
	if !cond {
		panic("assertion failed: " + msg)
	}
}

func main() {
	dsu := NewDisjointSet(10)
	assert(dsu.Count() == 10 && !dsu.Connected(1, 2), "fresh DSU")
	assert(dsu.Union(1, 2) && dsu.Union(2, 3), "unions succeed")
	assert(dsu.Connected(1, 3), "transitive through 2")
	assert(!dsu.Union(1, 3), "already joined = a cycle")
	assert(dsu.Count() == 8 && dsu.SetSize(1) == 3, "counts")
	dsu.Union(4, 5)
	assert(dsu.Count() == 7 && !dsu.Connected(3, 4), "separate components")

	// Union-Find against brute-force reachability, randomised.
	rng := rand.New(rand.NewSource(19))
	for trial := 0; trial < 50; trial++ {
		const n = 20
		test := NewDisjointSet(n)
		reach := make([][]bool, n)
		for i := range reach {
			reach[i] = make([]bool, n)
			reach[i][i] = true
		}
		for op := 0; op < 30; op++ {
			a, b := rng.Intn(n), rng.Intn(n)
			test.Union(a, b)
			for i := 0; i < n; i++ { // naive transitive closure
				for j := 0; j < n; j++ {
					if reach[i][a] && reach[j][b] {
						reach[i][j], reach[j][i] = true, true
					}
				}
			}
		}
		for a := 0; a < n; a++ {
			for b := 0; b < n; b++ {
				assert(test.Connected(a, b) == reach[a][b], "DSU matches brute force")
			}
		}
	}

	weight, chosen := KruskalMST(4, []Edge{
		{0, 1, 1}, {0, 2, 3}, {1, 2, 2}, {0, 3, 4}, {2, 3, 5},
	})
	assert(weight == 7, "MST weight 1+2+4")
	assert(len(chosen) == 3, "a spanning tree has n-1 edges")
	forestWeight, forestEdges := KruskalMST(4, []Edge{{0, 1, 1}})
	assert(forestWeight == 1 && len(forestEdges) == 1, "disconnected graph gives a forest")

	fenwick := NewFenwickTreeFrom([]int{1, 3, 5, 7, 9, 11})
	assert(fenwick.PrefixSum(6) == 36, "prefix sum")
	assert(fenwick.RangeSum(1, 4) == 15, "range sum")
	assert(fenwick.RangeSum(0, 0) == 0, "empty range")
	fenwick.Update(2, 5) // values[2] becomes 10
	assert(fenwick.RangeSum(1, 4) == 20, "range sum after update")

	// Fenwick against brute force, randomised.
	for trial := 0; trial < 50; trial++ {
		n := rng.Intn(30) + 1
		data := make([]int, n)
		for i := range data {
			data[i] = rng.Intn(101) - 50
		}
		tree := NewFenwickTreeFrom(data)
		for op := 0; op < 30; op++ {
			if rng.Intn(2) == 0 {
				i, delta := rng.Intn(n), rng.Intn(41)-20
				data[i] += delta
				tree.Update(i, delta)
			} else {
				left := rng.Intn(n)
				right := left + rng.Intn(n-left+1)
				expected := 0
				for i := left; i < right; i++ {
					expected += data[i]
				}
				assert(tree.RangeSum(left, right) == expected, "fenwick matches brute force")
			}
		}
	}

	segSum := NewSegmentTree([]int{1, 3, 5, 7, 9, 11}, nil, 0)
	assert(segSum.Query(0, 6) == 36, "sum of everything")
	assert(segSum.Query(1, 4) == 15, "inner range")
	assert(segSum.Query(2, 2) == 0, "empty range")
	assert(segSum.Update(1, 10) == nil, "update")
	assert(segSum.Query(0, 3) == 16, "sum after update")
	assert(segSum.Update(99, 1) != nil, "out-of-range update is an error")

	// The same structure with min - something a Fenwick tree cannot do.
	// The min/max builtins cannot be used as function VALUES, only called -
	// so wrap them in closures.
	minOf := func(a, b int) int { return min(a, b) }
	maxOf := func(a, b int) int { return max(a, b) }

	segMin := NewSegmentTree([]int{5, 2, 8, 1, 9}, minOf, math.MaxInt)
	assert(segMin.Query(0, 5) == 1, "range minimum")
	assert(segMin.Query(0, 3) == 2, "partial minimum")
	segMin.Update(3, 100)
	assert(segMin.Query(0, 5) == 2, "minimum after update")

	segMax := NewSegmentTree([]int{5, 2, 8, 1, 9}, maxOf, math.MinInt)
	assert(segMax.Query(0, 5) == 9 && segMax.Query(0, 2) == 5, "range maximum")

	// Segment tree against brute force, randomised.
	for trial := 0; trial < 50; trial++ {
		n := rng.Intn(30) + 1
		data := make([]int, n)
		for i := range data {
			data[i] = rng.Intn(101) - 50
		}
		tree := NewSegmentTree(data, nil, 0)
		for op := 0; op < 30; op++ {
			if rng.Intn(2) == 0 {
				i, value := rng.Intn(n), rng.Intn(101)-50
				data[i] = value
				tree.Update(i, value)
			} else {
				left := rng.Intn(n)
				right := left + rng.Intn(n-left+1)
				expected := 0
				for i := left; i < right; i++ {
					expected += data[i]
				}
				assert(tree.Query(left, right) == expected, "segment tree matches brute force")
			}
		}
	}

	lazy := NewLazySegmentTree([]int{1, 2, 3, 4, 5})
	assert(lazy.RangeSum(0, 5) == 15, "initial sum")
	lazy.RangeAdd(1, 4, 10) // +10 to indices 1, 2, 3
	assert(lazy.RangeSum(0, 5) == 45, "sum after a range add")
	assert(lazy.RangeSum(1, 4) == 39, "the updated range")
	assert(lazy.RangeSum(0, 1) == 1, "untouched prefix")

	// Lazy propagation against brute force, randomised.
	for trial := 0; trial < 50; trial++ {
		n := rng.Intn(30) + 1
		data := make([]int, n)
		for i := range data {
			data[i] = rng.Intn(101) - 50
		}
		tree := NewLazySegmentTree(data)
		for op := 0; op < 30; op++ {
			left := rng.Intn(n)
			right := left + rng.Intn(n-left+1)
			if rng.Intn(2) == 0 {
				delta := rng.Intn(41) - 20
				for i := left; i < right; i++ {
					data[i] += delta
				}
				tree.RangeAdd(left, right, delta)
			} else {
				expected := 0
				for i := left; i < right; i++ {
					expected += data[i]
				}
				assert(tree.RangeSum(left, right) == expected, "lazy matches brute force")
			}
		}
	}

	// --- Sparse table ---------------------------------------------------------
	// minOf and maxOf are the closures declared for the segment tree above -
	// the min/max builtins cannot be passed as function VALUES, only called.
	gcdOf := func(a, b int) int {
		for b != 0 {
			a, b = b, a%b
		}
		if a < 0 {
			return -a
		}
		return a
	}

	sparseValues := []int{7, 2, 3, 0, 5, 10, 3, 12, 18}
	mins := NewSparseTable(sparseValues, minOf)
	got, err := mins.Query(0, len(sparseValues))
	assert(err == nil && got == 0, "min over the whole array")
	got, _ = mins.Query(0, 1)
	assert(got == 7, "a single element")
	got, _ = mins.Query(4, 7)
	assert(got == 3, "min of 5, 10, 3")

	maxes := NewSparseTable(sparseValues, maxOf)
	got, _ = maxes.Query(0, len(sparseValues))
	assert(got == 18, "max over the whole array")
	got, _ = maxes.Query(1, 4)
	assert(got == 3, "max of 2, 3, 0")

	gcds := NewSparseTable([]int{12, 18, 24, 36}, gcdOf)
	got, _ = gcds.Query(0, 4)
	assert(got == 6, "gcd of the whole array")
	got, _ = gcds.Query(2, 4)
	assert(got == 12, "gcd of 24, 36")

	_, err = mins.Query(3, 3)
	assert(err != nil, "an empty range is an error, not a silent zero")

	// Every possible range, against brute force, for all three operations.
	sparseRng := rand.New(rand.NewSource(19))
	for trial := 0; trial < 40; trial++ {
		n := sparseRng.Intn(40) + 1
		data := make([]int, n)
		positive := make([]int, n)
		for i := range data {
			data[i] = sparseRng.Intn(201) - 100
			positive[i] = data[i]
			if positive[i] < 0 {
				positive[i] = -positive[i]
			}
			positive[i]++
		}

		minTable := NewSparseTable(data, minOf)
		maxTable := NewSparseTable(data, maxOf)
		gcdTable := NewSparseTable(positive, gcdOf)

		for left := 0; left < n; left++ {
			runMin, runMax, runGcd := data[left], data[left], positive[left]
			for right := left + 1; right <= n; right++ {
				if right-1 > left {
					runMin = min(runMin, data[right-1])
					runMax = max(runMax, data[right-1])
					runGcd = gcdOf(runGcd, positive[right-1])
				}
				v, _ := minTable.Query(left, right)
				assert(v == runMin, "sparse min matches brute force")
				v, _ = maxTable.Query(left, right)
				assert(v == runMax, "sparse max matches brute force")
				v, _ = gcdTable.Query(left, right)
				assert(v == runGcd, "sparse gcd matches brute force")
			}
		}
	}

	// And the misuse the doc comment warns about: SUM is not idempotent, so the
	// overlapping blocks double-count. Demonstrated rather than merely claimed.
	sums := NewSparseTable([]int{1, 2, 3, 4, 5}, func(a, b int) int { return a + b })
	got, _ = sums.Query(0, 3)
	assert(got == 8, "(1+2)+(2+3): the 2 is counted twice, not 6")
	got, _ = sums.Query(0, 4)
	assert(got == 20, "both blocks ARE [0,4): 10+10, not 10")
	got, _ = sums.Query(2, 3)
	assert(got == 6, "even ONE element doubles: op(x, x) != x")

	fmt.Println("19-Advanced-Topics (Go): all checks passed")
	fmt.Println("  Sparse table checked on EVERY range of 40 random arrays for min,")
	fmt.Println("  max and gcd - and shown to double-count for a non-idempotent op")
	fmt.Println("  Union-Find, Fenwick, segment tree and lazy propagation all " +
		"cross-checked against brute force on 50 random runs each")
}
