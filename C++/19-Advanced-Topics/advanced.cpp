// 19 - Advanced Topics: Union-Find, Fenwick tree, segment tree and lazy
// propagation - each cross-checked against brute force on random operations.
//
// Build & run:
//   g++ -std=c++17 -O2 -Wall advanced.cpp -o advanced && ./advanced

#include <algorithm>
#include <cassert>
#include <climits>
#include <cstdlib>
#include <functional>
#include <iostream>
#include <numeric>
#include <random>
#include <stdexcept>
#include <vector>

using namespace std;

// ============================================================================
// 1. Union-Find (Disjoint Set Union)
// ============================================================================
// Two optimisations make operations effectively constant:
//   PATH COMPRESSION: find() re-points every node on the path at the root.
//   UNION BY SIZE:    the smaller tree is attached under the larger.
// Together: O(alpha(n)) amortised - inverse Ackermann, below 5 for any real n.
class DisjointSet {
   public:
    explicit DisjointSet(int n) : parent_(n), size_(n, 1), count_(n) {
        iota(parent_.begin(), parent_.end(), 0);   // everyone is their own root
    }

    // Iterative on purpose: the recursive one-liner can recurse deeply before
    // compression kicks in.
    int find(int x) {
        int root = x;
        while (parent_[root] != root) root = parent_[root];
        while (parent_[x] != root) {               // second pass: flatten
            int next = parent_[x];
            parent_[x] = root;
            x = next;
        }
        return root;
    }

    // Returns false if the two were already joined - which is exactly the
    // cycle test Kruskal's algorithm needs.
    bool unite(int a, int b) {
        int rootA = find(a), rootB = find(b);
        if (rootA == rootB) return false;
        if (size_[rootA] < size_[rootB]) swap(rootA, rootB);   // union by size
        parent_[rootB] = rootA;
        size_[rootA] += size_[rootB];
        count_--;
        return true;
    }

    bool connected(int a, int b) { return find(a) == find(b); }
    int setSize(int x) { return size_[find(x)]; }
    int count() const { return count_; }

   private:
    vector<int> parent_, size_;
    int count_;
};

struct Edge {
    int u, v, weight;
};

// Kruskal's MST: sort edges by weight, take each unless it closes a cycle -
// which is precisely "unite returned false". O(E log E).
pair<long long, vector<Edge>> kruskalMst(int n, vector<Edge> edges) {
    sort(edges.begin(), edges.end(),
         [](const Edge& a, const Edge& b) { return a.weight < b.weight; });

    DisjointSet dsu(n);
    long long total = 0;
    vector<Edge> chosen;
    for (const Edge& e : edges) {
        if (dsu.unite(e.u, e.v)) {
            total += e.weight;
            chosen.push_back(e);
        }
    }
    return {total, chosen};
}

// ============================================================================
// 2. Fenwick tree (Binary Indexed Tree)
// ============================================================================
// Index i covers a block of size (i & -i) - the lowest set bit from chapter 17.
// That is why traversal is i += i & -i (up) and i -= i & -i (down): each step
// flips one bit, so at most log n steps happen.
// Internally 1-indexed, because index 0 has no lowest set bit to follow.
class FenwickTree {
   public:
    explicit FenwickTree(int n) : n_(n), tree_(n + 1, 0) {}

    explicit FenwickTree(const vector<int>& values)
        : n_(int(values.size())), tree_(values.size() + 1, 0) {
        for (int i = 0; i < n_; i++) update(i, values[i]);
    }

    void update(int index, long long delta) {          // O(log n)
        for (int i = index + 1; i <= n_; i += i & -i) tree_[i] += delta;
    }

    long long prefixSum(int count) const {             // O(log n)
        long long total = 0;
        for (int i = count; i > 0; i -= i & -i) total += tree_[i];
        return total;
    }

    // Sum of values[left, right) - right exclusive.
    long long rangeSum(int left, int right) const {
        return prefixSum(right) - prefixSum(left);
    }

   private:
    int n_;
    vector<long long> tree_;
};

// ============================================================================
// 3. Segment tree
// ============================================================================
// Range queries with point updates for ANY associative operation. That
// generality is what it buys over a Fenwick tree: min and max have no inverse,
// so a BIT cannot do them at all.
//
// Stored as an implicit binary tree in an array of size 4n - enough for any n
// without computing the exact bound.
class SegmentTree {
   public:
    SegmentTree(const vector<long long>& values,
                function<long long(long long, long long)> op =
                    [](long long a, long long b) { return a + b; },
                long long identity = 0)
        : n_(int(values.size())), op_(move(op)), identity_(identity),
          tree_(4 * max(int(values.size()), 1), identity) {
        if (n_ > 0) build(values, 1, 0, n_ - 1);
    }

    // Set values[index] = value. O(log n) - one root-to-leaf path.
    void update(int index, long long value) {
        if (index < 0 || index >= n_) throw out_of_range("index out of range");
        update(1, 0, n_ - 1, index, value);
    }

    // Aggregate over values[left, right) - right exclusive. O(log n).
    long long query(int left, int right) const {
        if (left >= right || n_ == 0) return identity_;
        return query(1, 0, n_ - 1, left, right - 1);
    }

   private:
    void build(const vector<long long>& values, int node, int lo, int hi) {
        if (lo == hi) {
            tree_[node] = values[lo];
            return;
        }
        int mid = lo + (hi - lo) / 2;
        build(values, 2 * node, lo, mid);
        build(values, 2 * node + 1, mid + 1, hi);
        tree_[node] = op_(tree_[2 * node], tree_[2 * node + 1]);
    }

    void update(int node, int lo, int hi, int index, long long value) {
        if (lo == hi) {
            tree_[node] = value;
            return;
        }
        int mid = lo + (hi - lo) / 2;
        if (index <= mid) update(2 * node, lo, mid, index, value);
        else update(2 * node + 1, mid + 1, hi, index, value);
        tree_[node] = op_(tree_[2 * node], tree_[2 * node + 1]);
    }

    long long query(int node, int lo, int hi, int left, int right) const {
        if (right < lo || hi < left) return identity_;   // disjoint
        if (left <= lo && hi <= right) return tree_[node];  // fully inside
        int mid = lo + (hi - lo) / 2;
        return op_(query(2 * node, lo, mid, left, right),
                   query(2 * node + 1, mid + 1, hi, left, right));
    }

    int n_;
    function<long long(long long, long long)> op_;
    long long identity_;
    vector<long long> tree_;
};

// ============================================================================
// 4. Lazy propagation - range updates in O(log n)
// ============================================================================
// Without laziness a range update would touch O(n) leaves. Instead a node
// records "my whole range still owes +x" and pushes that down only when a
// query actually descends into it.
class LazySegmentTree {
   public:
    explicit LazySegmentTree(const vector<long long>& values)
        : n_(int(values.size())), tree_(4 * max(int(values.size()), 1), 0),
          lazy_(4 * max(int(values.size()), 1), 0) {
        if (n_ > 0) build(values, 1, 0, n_ - 1);
    }

    void rangeAdd(int left, int right, long long delta) {   // right exclusive
        if (left >= right || n_ == 0) return;
        rangeAdd(1, 0, n_ - 1, left, right - 1, delta);
    }

    long long rangeSum(int left, int right) {               // right exclusive
        if (left >= right || n_ == 0) return 0;
        return rangeSum(1, 0, n_ - 1, left, right - 1);
    }

   private:
    void build(const vector<long long>& values, int node, int lo, int hi) {
        if (lo == hi) {
            tree_[node] = values[lo];
            return;
        }
        int mid = lo + (hi - lo) / 2;
        build(values, 2 * node, lo, mid);
        build(values, 2 * node + 1, mid + 1, hi);
        tree_[node] = tree_[2 * node] + tree_[2 * node + 1];
    }

    // Apply this node's pending update and hand it to the children.
    void push(int node, int lo, int hi) {
        if (lazy_[node] == 0) return;
        tree_[node] += lazy_[node] * (hi - lo + 1);      // sum over the range
        if (lo != hi) {                                  // not a leaf
            lazy_[2 * node] += lazy_[node];
            lazy_[2 * node + 1] += lazy_[node];
        }
        lazy_[node] = 0;
    }

    void rangeAdd(int node, int lo, int hi, int left, int right, long long delta) {
        push(node, lo, hi);
        if (right < lo || hi < left) return;
        if (left <= lo && hi <= right) {
            lazy_[node] += delta;                        // mark and stop
            push(node, lo, hi);
            return;
        }
        int mid = lo + (hi - lo) / 2;
        rangeAdd(2 * node, lo, mid, left, right, delta);
        rangeAdd(2 * node + 1, mid + 1, hi, left, right, delta);
        tree_[node] = tree_[2 * node] + tree_[2 * node + 1];
    }

    long long rangeSum(int node, int lo, int hi, int left, int right) {
        push(node, lo, hi);                              // settle before reading
        if (right < lo || hi < left) return 0;
        if (left <= lo && hi <= right) return tree_[node];
        int mid = lo + (hi - lo) / 2;
        return rangeSum(2 * node, lo, mid, left, right) +
               rangeSum(2 * node + 1, mid + 1, hi, left, right);
    }

    int n_;
    vector<long long> tree_, lazy_;
};

// ============================================================================
// demo
// ============================================================================
// ============================================================================
// 5. Sparse table - O(1) range queries on data that never changes
// ============================================================================

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
//     table[k][i] = op(table[k-1][i], table[k-1][i + 2^(k-1)])
//
// log n levels of n entries each: O(n log n) time and space.
//
// THE QUERY. For [left, right), let k = floor(log2(right - left)). Two blocks
// of length 2^k - one anchored at each end - always cover the range, because
// 2 * 2^k >= right - left by the choice of k:
//
//     [left ............................ right)
//     [--- 2^k ---]
//                  [--- 2^k ---]        <- these two OVERLAP in the middle
//
// THE CATCH, AND IT IS THE WHOLE POINT. Those blocks overlap, so elements in
// the middle are counted TWICE. That is harmless only if the operation is
// IDEMPOTENT - op(x, x) == x:
//
//     min, max, gcd, lcm, bitwise and, bitwise or   -> idempotent, works
//     sum, product, xor, count                      -> NOT, gives nonsense
//
// For a sum use a prefix-sum array (static) or a Fenwick tree (dynamic). This
// is the single most common misuse of the structure - and note it is broken
// even for a ONE-element range, where both blocks are the same element.
//
//                Sparse table   Segment tree   Fenwick tree
//     Query      O(1)           O(log n)       O(log n)
//     Update     impossible     O(log n)       O(log n)
//     Build      O(n log n)     O(n)           O(n log n)
//     Space      O(n log n)     O(n)           O(n)
//     Ops        idempotent     any assoc.     invertible
//
// So: static data plus a huge number of min/max queries -> sparse table.
// Anything that changes -> segment tree.
class SparseTable {
   public:
    explicit SparseTable(const vector<long long>& values,
                         function<long long(long long, long long)> op =
                             [](long long a, long long b) { return min(a, b); })
        : op_(std::move(op)) {
        size_t n = values.size();

        // log2Floor_[i] = floor(log2(i)), computed once so queries stay O(1).
        // Calling std::log2 per query would work but drags floating point into
        // an integer algorithm, and it is famously off by one near powers of two.
        log2Floor_.assign(n + 1, 0);
        for (size_t i = 2; i <= n; i++) log2Floor_[i] = log2Floor_[i / 2] + 1;

        size_t levels = n ? log2Floor_[n] + 1 : 1;
        table_.assign(levels, {});
        table_[0] = values;

        for (size_t k = 1; k < levels; k++) {
            size_t span = size_t(1) << k;
            size_t half = span >> 1;
            table_[k].resize(n - span + 1);
            for (size_t i = 0; i + span <= n; i++) {
                table_[k][i] = op_(table_[k - 1][i], table_[k - 1][i + half]);
            }
        }
    }

    // op over values[left, right) - right exclusive. O(1).
    //
    // Throws on an empty range: there is no identity to return, since op is
    // caller-supplied.
    long long query(size_t left, size_t right) const {
        if (left >= right) {
            throw invalid_argument("sparse table query needs a non-empty range");
        }
        size_t k = log2Floor_[right - left];
        // Two overlapping blocks of length 2^k. The overlap is why op must be
        // idempotent - see above.
        return op_(table_[k][left], table_[k][right - (size_t(1) << k)]);
    }

   private:
    function<long long(long long, long long)> op_;
    vector<size_t> log2Floor_;
    vector<vector<long long>> table_;
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    DisjointSet dsu(10);
    assert(dsu.count() == 10 && !dsu.connected(1, 2));
    assert(dsu.unite(1, 2) && dsu.unite(2, 3));
    assert(dsu.connected(1, 3));                 // transitive through 2
    assert(!dsu.unite(1, 3));                    // already joined = a cycle
    assert(dsu.count() == 8 && dsu.setSize(1) == 3);
    dsu.unite(4, 5);
    assert(dsu.count() == 7 && !dsu.connected(3, 4));

    // Union-Find against brute-force reachability, randomised.
    mt19937 rng(19);
    for (int trial = 0; trial < 50; trial++) {
        const int n = 20;
        DisjointSet test(n);
        vector<vector<bool>> reach(n, vector<bool>(n, false));
        for (int i = 0; i < n; i++) reach[i][i] = true;

        uniform_int_distribution<int> pick(0, n - 1);
        for (int op = 0; op < 30; op++) {
            int a = pick(rng), b = pick(rng);
            test.unite(a, b);
            for (int i = 0; i < n; i++)          // naive transitive closure
                for (int j = 0; j < n; j++)
                    if (reach[i][a] && reach[j][b]) reach[i][j] = reach[j][i] = true;
        }
        for (int a = 0; a < n; a++)
            for (int b = 0; b < n; b++)
                assert(test.connected(a, b) == reach[a][b]);
    }

    auto [mstWeight, mstEdges] = kruskalMst(
        4, {{0, 1, 1}, {0, 2, 3}, {1, 2, 2}, {0, 3, 4}, {2, 3, 5}});
    assert(mstWeight == 7);                      // 1 + 2 + 4
    assert(mstEdges.size() == 3);                // a spanning tree has n-1 edges
    auto [forestWeight, forestEdges] = kruskalMst(4, {{0, 1, 1}});
    assert(forestWeight == 1 && forestEdges.size() == 1);   // disconnected

    FenwickTree fenwick(vector<int>{1, 3, 5, 7, 9, 11});
    assert(fenwick.prefixSum(6) == 36);
    assert(fenwick.rangeSum(1, 4) == 15);
    assert(fenwick.rangeSum(0, 0) == 0);         // empty range
    fenwick.update(2, 5);                        // values[2] becomes 10
    assert(fenwick.rangeSum(1, 4) == 20);

    // Fenwick against brute force, randomised.
    for (int trial = 0; trial < 50; trial++) {
        int n = uniform_int_distribution<int>(1, 30)(rng);
        vector<int> data(n);
        uniform_int_distribution<int> value(-50, 50);
        for (int& x : data) x = value(rng);

        FenwickTree tree(data);
        for (int op = 0; op < 30; op++) {
            if (uniform_int_distribution<int>(0, 1)(rng)) {
                int i = uniform_int_distribution<int>(0, n - 1)(rng);
                int delta = uniform_int_distribution<int>(-20, 20)(rng);
                data[i] += delta;
                tree.update(i, delta);
            } else {
                int left = uniform_int_distribution<int>(0, n - 1)(rng);
                int right = uniform_int_distribution<int>(left, n)(rng);
                long long expected = 0;
                for (int i = left; i < right; i++) expected += data[i];
                assert(tree.rangeSum(left, right) == expected);
            }
        }
    }

    SegmentTree segSum({1, 3, 5, 7, 9, 11});
    assert(segSum.query(0, 6) == 36);
    assert(segSum.query(1, 4) == 15);
    assert(segSum.query(2, 2) == 0);             // empty range
    segSum.update(1, 10);
    assert(segSum.query(0, 3) == 16);

    // The same structure with min - something a Fenwick tree cannot do.
    SegmentTree segMin({5, 2, 8, 1, 9},
                       [](long long a, long long b) { return min(a, b); }, LLONG_MAX);
    assert(segMin.query(0, 5) == 1);
    assert(segMin.query(0, 3) == 2);
    segMin.update(3, 100);
    assert(segMin.query(0, 5) == 2);

    SegmentTree segMax({5, 2, 8, 1, 9},
                       [](long long a, long long b) { return max(a, b); }, LLONG_MIN);
    assert(segMax.query(0, 5) == 9 && segMax.query(0, 2) == 5);

    // Segment tree against brute force, randomised.
    for (int trial = 0; trial < 50; trial++) {
        int n = uniform_int_distribution<int>(1, 30)(rng);
        vector<long long> data(n);
        uniform_int_distribution<int> value(-50, 50);
        for (long long& x : data) x = value(rng);

        SegmentTree tree(data);
        for (int op = 0; op < 30; op++) {
            if (uniform_int_distribution<int>(0, 1)(rng)) {
                int i = uniform_int_distribution<int>(0, n - 1)(rng);
                long long v = value(rng);
                data[i] = v;
                tree.update(i, v);
            } else {
                int left = uniform_int_distribution<int>(0, n - 1)(rng);
                int right = uniform_int_distribution<int>(left, n)(rng);
                long long expected = 0;
                for (int i = left; i < right; i++) expected += data[i];
                assert(tree.query(left, right) == expected);
            }
        }
    }

    LazySegmentTree lazy({1, 2, 3, 4, 5});
    assert(lazy.rangeSum(0, 5) == 15);
    lazy.rangeAdd(1, 4, 10);                     // +10 to indices 1, 2, 3
    assert(lazy.rangeSum(0, 5) == 45);
    assert(lazy.rangeSum(1, 4) == 39);
    assert(lazy.rangeSum(0, 1) == 1);            // untouched

    // Lazy propagation against brute force, randomised.
    for (int trial = 0; trial < 50; trial++) {
        int n = uniform_int_distribution<int>(1, 30)(rng);
        vector<long long> data(n);
        uniform_int_distribution<int> value(-50, 50);
        for (long long& x : data) x = value(rng);

        LazySegmentTree tree(data);
        for (int op = 0; op < 30; op++) {
            int left = uniform_int_distribution<int>(0, n - 1)(rng);
            int right = uniform_int_distribution<int>(left, n)(rng);
            if (uniform_int_distribution<int>(0, 1)(rng)) {
                long long delta = uniform_int_distribution<int>(-20, 20)(rng);
                for (int i = left; i < right; i++) data[i] += delta;
                tree.rangeAdd(left, right, delta);
            } else {
                long long expected = 0;
                for (int i = left; i < right; i++) expected += data[i];
                assert(tree.rangeSum(left, right) == expected);
            }
        }
    }

    cout << "19-Advanced-Topics (C++): all checks passed\n";
    // --- Sparse table ---------------------------------------------------------
    auto minOp = [](long long a, long long b) { return min(a, b); };
    auto maxOp = [](long long a, long long b) { return max(a, b); };
    auto gcdOp = [](long long a, long long b) { return std::gcd(a, b); };

    vector<long long> sparseValues{7, 2, 3, 0, 5, 10, 3, 12, 18};
    SparseTable mins(sparseValues, minOp);
    assert(mins.query(0, sparseValues.size()) == 0);
    assert(mins.query(0, 1) == 7);                  // a single element
    assert(mins.query(4, 7) == 3);                  // 5, 10, 3
    assert(mins.query(7, 9) == 12);

    SparseTable maxes(sparseValues, maxOp);
    assert(maxes.query(0, sparseValues.size()) == 18);
    assert(maxes.query(1, 4) == 3);                 // 2, 3, 0

    SparseTable gcds(vector<long long>{12, 18, 24, 36}, gcdOp);
    assert(gcds.query(0, 4) == 6);
    assert(gcds.query(2, 4) == 12);

    bool threwEmpty = false;
    try {
        mins.query(3, 3);                           // empty range
    } catch (const invalid_argument&) {
        threwEmpty = true;
    }
    assert(threwEmpty);

    // Every possible range, against brute force, for all three operations.
    mt19937 sparseRng(19);
    for (int trial = 0; trial < 40; trial++) {
        size_t n = sparseRng() % 40 + 1;
        vector<long long> data(n), positive(n);
        for (size_t i = 0; i < n; i++) {
            data[i] = static_cast<long long>(sparseRng() % 201) - 100;
            positive[i] = llabs(data[i]) + 1;
        }

        SparseTable minTable(data, minOp);
        SparseTable maxTable(data, maxOp);
        SparseTable gcdTable(positive, gcdOp);

        for (size_t left = 0; left < n; left++) {
            long long runMin = data[left], runMax = data[left], runGcd = positive[left];
            for (size_t right = left + 1; right <= n; right++) {
                if (right - 1 > left) {
                    runMin = min(runMin, data[right - 1]);
                    runMax = max(runMax, data[right - 1]);
                    runGcd = std::gcd(runGcd, positive[right - 1]);
                }
                assert(minTable.query(left, right) == runMin);
                assert(maxTable.query(left, right) == runMax);
                assert(gcdTable.query(left, right) == runGcd);
            }
        }
    }

    // And the misuse the comment warns about: SUM is not idempotent, so the
    // overlapping blocks double-count. Demonstrated rather than merely claimed.
    SparseTable sums(vector<long long>{1, 2, 3, 4, 5},
                     [](long long a, long long b) { return a + b; });
    assert(sums.query(0, 3) == 8);   // (1+2) + (2+3): the 2 is counted twice, not 6
    assert(sums.query(0, 4) == 20);  // both blocks ARE [0,4): 10 + 10, not 10
    assert(sums.query(2, 3) == 6);   // even ONE element doubles: op(x, x) != x

    cout << "  Union-Find, Fenwick, segment tree and lazy propagation all "
            "cross-checked against brute force on 50 random runs each\n";
    cout << "  Sparse table checked on EVERY range of 40 random arrays for min,\n";
    cout << "  max and gcd - and shown to double-count for a non-idempotent op\n";
    return 0;
}
