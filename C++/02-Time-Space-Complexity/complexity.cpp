// 02 - Time and Space Complexity: measured, not memorised.
//
// Each function returns its answer plus an operation count, so the growth
// curves are exact and reproducible on any machine.
//
// Build & run:
//   g++ -std=c++17 -O2 -Wall complexity.cpp -o complexity && ./complexity

#include <algorithm>
#include <cassert>
#include <chrono>
#include <cmath>
#include <cstdio>
#include <iostream>
#include <numeric>
#include <random>
#include <string>
#include <unordered_set>
#include <utility>
#include <vector>

using namespace std;

// ------------------------------------------------------------------ O(1) ----
pair<int, long long> constantFirst(const vector<int>& nums) {
    return {nums[0], 1};  // indexing ignores the size of the container
}

// -------------------------------------------------------------- O(log n) ----
pair<int, long long> binarySearch(const vector<int>& sorted, int target) {
    long long ops = 0;
    int lo = 0, hi = int(sorted.size()) - 1;
    while (lo <= hi) {
        ops++;
        int mid = lo + (hi - lo) / 2;   // avoids (lo + hi) overflow
        if (sorted[mid] == target) return {mid, ops};
        if (sorted[mid] < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return {-1, ops};
}

// ------------------------------------------------------------------ O(n) ----
pair<long long, long long> linearSum(const vector<int>& nums) {
    long long total = 0, ops = 0;
    for (int x : nums) { total += x; ops++; }
    return {total, ops};
}

// ---------------------------------------------------------------- O(n^2) ----
pair<bool, long long> hasDuplicateQuadratic(const vector<int>& nums) {
    long long ops = 0;
    size_t n = nums.size();
    for (size_t i = 0; i < n; i++)
        for (size_t j = i + 1; j < n; j++) {
            ops++;
            if (nums[i] == nums[j]) return {true, ops};
        }
    return {false, ops};
}

// Same answer in O(n) time and O(n) space: the classic memory-for-time trade.
pair<bool, long long> hasDuplicateLinear(const vector<int>& nums) {
    unordered_set<int> seen;
    seen.reserve(nums.size() * 2);      // reserve = fewer rehashes
    long long ops = 0;
    for (int x : nums) {
        ops++;
        if (!seen.insert(x).second) return {true, ops};  // insert reports dupes
    }
    return {false, ops};
}

// ------------------------------------------------------- O(2^n) vs O(n) -----
// Naive Fibonacci: two branches per call, depth n. Total calls = 2*F(n+1) - 1.
long long fibExponential(int n, long long& calls) {
    calls++;
    if (n < 2) return n;
    return fibExponential(n - 1, calls) + fibExponential(n - 2, calls);
}

// Bottom-up: each state computed once. O(n) time, O(1) space.
pair<long long, long long> fibLinear(int n) {
    if (n < 2) return {n, 1};
    long long prev = 0, curr = 1, ops = 0;
    for (int i = 1; i < n; i++) {
        long long next = prev + curr;
        prev = curr;
        curr = next;
        ops++;
    }
    return {curr, ops};
}

// -------------------------------------------------------- copy vs reference -
// The same scan written two ways. Both are O(n) in the number of elements,
// but `byValue` also performs O(n) allocations and copies.
long long sumByValue(vector<vector<int>> grid) {          // copies the grid
    long long t = 0;
    for (auto row : grid)                                  // copies each row
        t += accumulate(row.begin(), row.end(), 0LL);
    return t;
}

long long sumByReference(const vector<vector<int>>& grid) {  // no copies
    long long t = 0;
    for (const auto& row : grid)
        t += accumulate(row.begin(), row.end(), 0LL);
    return t;
}

// ----------------------------------------------------------- amortised O(1) -
// n push_backs cost O(n) total. reserve() removes the reallocation copies.
size_t amortisedPushBack(int n, bool withReserve) {
    vector<int> v;
    if (withReserve) v.reserve(n);
    size_t reallocations = 0, cap = v.capacity();
    for (int i = 0; i < n; i++) {
        v.push_back(i);
        if (v.capacity() != cap) { reallocations++; cap = v.capacity(); }
    }
    return reallocations;
}

// ------------------------------------------------------------- space --------
// O(n) time and O(n) STACK space: every pending frame is memory.
long long sumRecursive(const vector<int>& nums, size_t i = 0) {
    if (i == nums.size()) return 0;
    return nums[i] + sumRecursive(nums, i + 1);
}

// O(n) time, O(1) space.
long long sumIterative(const vector<int>& nums) {
    long long t = 0;
    for (int x : nums) t += x;
    return t;
}

// ------------------------------------------------------------ measurement ---
void growthTable() {
    printf("%7s | %10s | %12s | %13s\n", "n", "O(n) ops", "O(n^2) ops", "O(log n) ops");
    printf("--------------------------------------------------\n");
    for (int n : {100, 200, 400, 800}) {
        vector<int> nums(n);
        iota(nums.begin(), nums.end(), 0);            // all distinct: worst case
        auto [s, lin] = linearSum(nums);
        auto [dup, quad] = hasDuplicateQuadratic(nums);
        auto [idx, lg] = binarySearch(nums, n - 1);
        (void)s; (void)dup; (void)idx;
        printf("%7d | %10lld | %12lld | %13lld\n", n, lin, quad, lg);
    }
}

void wallClockDemo() {
    const int N = 2000;
    vector<vector<int>> grid(N, vector<int>(50, 1));

    auto t0 = chrono::steady_clock::now();
    long long a = sumByValue(grid);
    auto t1 = chrono::steady_clock::now();
    long long b = sumByReference(grid);
    auto t2 = chrono::steady_clock::now();

    assert(a == b);
    auto ms = [](auto d) { return chrono::duration<double, milli>(d).count(); };
    printf("\nby value    : %6.2f ms\n", ms(t1 - t0));
    printf("by reference: %6.2f ms  <- same O(n), no copies\n", ms(t2 - t1));
}

// -------------------------------------------------------------------- demo --
// ============================================================================
// Empirical analysis - does the theory actually hold?
// ============================================================================

// Merge sort that reports its comparison count. O(n log n).
//
// The count is what makes this checkable. Wall-clock time depends on the
// machine, the compiler flags and whatever else is running; a COMPARISON COUNT
// is deterministic, so the theory can be asserted rather than eyeballed.
// Sorts nums[lo, hi) using one shared scratch buffer, returning the comparison
// count. Working on INDEX RANGES rather than building sub-vectors matters twice
// over: it allocates once instead of O(n log n) times, and it keeps the hot
// loop reading straight down contiguous memory.
long long mergeSortRange(vector<int>& nums, vector<int>& scratch,
                         size_t lo, size_t hi) {
    if (hi - lo <= 1) return 0;

    size_t mid = lo + (hi - lo) / 2;
    long long comparisons = mergeSortRange(nums, scratch, lo, mid) +
                            mergeSortRange(nums, scratch, mid, hi);

    size_t i = lo, j = mid, k = lo;
    while (i < mid && j < hi) {
        comparisons++;
        scratch[k++] = (nums[i] <= nums[j]) ? nums[i++] : nums[j++];
    }
    while (i < mid) scratch[k++] = nums[i++];
    while (j < hi) scratch[k++] = nums[j++];
    for (size_t t = lo; t < hi; t++) nums[t] = scratch[t];

    return comparisons;
}

pair<vector<int>, long long> mergeSortCounted(vector<int> nums) {
    vector<int> scratch(nums.size());
    long long comparisons = mergeSortRange(nums, scratch, 0, nums.size());
    return {nums, comparisons};
}

// Insertion sort that reports its comparison count.
//
// O(n^2) on reversed input, but O(n) on already-sorted input - the adaptive
// best case that makes it the base case inside every real hybrid sort.
pair<vector<int>, long long> insertionSortCounted(vector<int> nums) {
    long long comparisons = 0;
    for (size_t i = 1; i < nums.size(); i++) {
        int value = nums[i];
        long j = long(i) - 1;
        while (j >= 0) {
            comparisons++;
            if (nums[size_t(j)] <= value) break;
            nums[size_t(j) + 1] = nums[size_t(j)];
            j--;
        }
        nums[size_t(j + 1)] = value;
    }
    return {nums, comparisons};
}

// Best-of-N wall-clock milliseconds.
//
// MINIMUM, not mean. Timing noise is one-sided - a scheduler interrupt or a
// cache eviction can only make a run slower, never faster - so the minimum is
// the closest estimate of the true cost. Averaging just folds the noise in.
//
// steady_clock, not system_clock: the latter can jump if the wall clock is
// adjusted mid-measurement, which is exactly the kind of silent nonsense you
// do not want in a benchmark.
template <typename Fn>
double measureMs(Fn fn, int repeats = 3) {
    double best = 1e18;
    for (int r = 0; r < repeats; r++) {
        auto start = chrono::steady_clock::now();
        fn();
        auto elapsed = chrono::duration<double, milli>(
                           chrono::steady_clock::now() - start).count();
        best = min(best, elapsed);
    }
    return best;
}

// Ratio between consecutive measurements. The shape of the curve.
//
// Doubling n and watching the ratio is how a complexity class is identified
// from data alone:
//
//     O(1)        ratio -> 1
//     O(log n)    ratio -> 1   (grows by a constant, not a factor)
//     O(n)        ratio -> 2
//     O(n log n)  ratio -> slightly above 2, creeping up
//     O(n^2)      ratio -> 4
//
// The empirical counterpart to reading the exponent off a formula.
vector<double> growthRatios(const vector<long long>& counts) {
    vector<double> ratios;
    for (size_t i = 0; i + 1 < counts.size(); i++) {
        ratios.push_back(double(counts[i + 1]) / double(counts[i]));
    }
    return ratios;
}

// Measure the two classes side by side, and print the growth.
void benchmarkTable() {
    vector<int> sizes{250, 500, 1000, 2000};
    vector<long long> mergeCounts, insertionCounts;

    printf("\n%6s | %10s | %11s | %9s | %10s\n",
           "n", "merge ops", "insert ops", "merge ms", "insert ms");
    printf("%s\n", string(60, '-').c_str());

    for (int n : sizes) {
        vector<int> reversedInput(static_cast<size_t>(n));  // static_cast, not size_t(n): the latter is a function declaration (most vexing parse)
        for (int i = 0; i < n; i++) reversedInput[static_cast<size_t>(i)] = n - i;

        long long mergeOps = mergeSortCounted(reversedInput).second;
        long long insertionOps = insertionSortCounted(reversedInput).second;
        double mergeMs = measureMs([&] { mergeSortCounted(reversedInput); });
        double insertionMs = measureMs([&] { insertionSortCounted(reversedInput); });

        mergeCounts.push_back(mergeOps);
        insertionCounts.push_back(insertionOps);
        printf("%6d | %10lld | %11lld | %9.2f | %10.2f\n",
               n, mergeOps, insertionOps, mergeMs, insertionMs);
    }

    printf("\n  merge ops     grow x");
    for (double r : growthRatios(mergeCounts)) printf("%.2f ", r);
    printf(" -> just over 2: O(n log n)\n  insertion ops grow x");
    for (double r : growthRatios(insertionCounts)) printf("%.2f ", r);
    printf(" -> 4: O(n^2)\n");
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    assert(constantFirst({9, 8, 7}).second == 1);

    vector<int> sorted1024(1024);
    iota(sorted1024.begin(), sorted1024.end(), 0);
    auto [idx, logOps] = binarySearch(sorted1024, 999);
    assert(idx == 999 && logOps <= 11);      // log2(1024) = 10

    assert(linearSum({1, 2, 3}).first == 6);

    vector<int> distinct200(200);
    iota(distinct200.begin(), distinct200.end(), 0);
    auto [dq, opsQ] = hasDuplicateQuadratic(distinct200);
    auto [dl, opsL] = hasDuplicateLinear(distinct200);
    assert(!dq && !dl);
    assert(opsQ == 200LL * 199 / 2);         // every pair
    assert(opsL == 200);                     // one pass
    assert(opsQ > 90 * opsL);                // the gap is the whole lesson

    // Doubling n roughly quadruples the work of an O(n^2) algorithm.
    vector<int> d100(100), d200(200);
    iota(d100.begin(), d100.end(), 0);
    iota(d200.begin(), d200.end(), 0);
    double ratio = double(hasDuplicateQuadratic(d200).second) /
                   double(hasDuplicateQuadratic(d100).second);
    assert(ratio > 3.8 && ratio < 4.2);

    long long calls = 0;
    assert(fibExponential(20, calls) == 6765);
    assert(calls == 21891);                  // = 2*F(21) - 1
    auto [fl, steps] = fibLinear(20);
    assert(fl == 6765 && steps == 19);       // linear, and not close

    assert(amortisedPushBack(1000, true) == 0);    // reserve: zero reallocations
    assert(amortisedPushBack(1000, false) > 0);    // without it: a handful, O(log n)

    vector<int> small{1, 2, 3};
    assert(sumRecursive(small) == sumIterative(small));
    // --- Empirical analysis ---------------------------------------------------
    // Sorting is correct in both cases - the point is what it COSTS.
    {
        mt19937 benchRng(2);
        for (int trial = 0; trial < 30; trial++) {
            vector<int> data(benchRng() % 41);
            for (int& x : data) x = int(benchRng() % 101) - 50;
            vector<int> expected = data;
            sort(expected.begin(), expected.end());
            assert(mergeSortCounted(data).first == expected);
            assert(insertionSortCounted(data).first == expected);
        }

        // The counts are deterministic, so the theory is ASSERTABLE - unlike
        // the wall-clock numbers, which depend on the machine.
        vector<int> sizes{250, 500, 1000, 2000};
        vector<long long> mergeCounts, insertionCounts;
        for (int n : sizes) {
            vector<int> reversedInput(static_cast<size_t>(n));  // static_cast, not size_t(n): the latter is a function declaration (most vexing parse)
            for (int i = 0; i < n; i++) reversedInput[static_cast<size_t>(i)] = n - i;
            mergeCounts.push_back(mergeSortCounted(reversedInput).second);
            insertionCounts.push_back(insertionSortCounted(reversedInput).second);
        }

        // Insertion sort on reversed input is exactly the worst case: every one
        // of the i previous elements is compared, so the total is n(n-1)/2.
        for (size_t k = 0; k < sizes.size(); k++) {
            long long n = sizes[k];
            assert(insertionCounts[k] == n * (n - 1) / 2);
        }

        // Merge sort's comparison count sits in the tight n log n window.
        for (size_t k = 0; k < sizes.size(); k++) {
            double n = sizes[k];
            assert(double(mergeCounts[k]) <= n * ceil(log2(n)));
            assert(double(mergeCounts[k]) >= n * log2(n) / 2);
        }

        // The growth ratios ARE the complexity class, read off the data.
        for (double ratio : growthRatios(insertionCounts)) assert(ratio > 3.9 && ratio < 4.1);
        for (double ratio : growthRatios(mergeCounts)) assert(ratio > 2.0 && ratio < 2.5);

        // Quadratic must eventually lose, by a widening margin. This compares
        // OPERATION COUNTS, so it is a fact about the algorithms, not the CPU.
        assert(double(insertionCounts.front()) / double(mergeCounts.front())
               < double(insertionCounts.back()) / double(mergeCounts.back()));
        assert(insertionCounts.back() > 100 * mergeCounts.back());

        // The ADAPTIVE best case: already-sorted input is O(n).
        vector<int> ascending(2000);
        iota(ascending.begin(), ascending.end(), 0);
        assert(insertionSortCounted(ascending).second == 1999);
    }


    cout << "02-Time-Space-Complexity (C++): all checks passed\n\n";

    growthTable();
    wallClockDemo();
    benchmarkTable();
    return 0;
}
