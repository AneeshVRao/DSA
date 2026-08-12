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
#include <cstdio>
#include <iostream>
#include <numeric>
#include <unordered_set>
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

    cout << "02-Time-Space-Complexity (C++): all checks passed\n\n";

    growthTable();
    wallClockDemo();
    return 0;
}
