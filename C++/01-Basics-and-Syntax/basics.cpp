// 01 - Basics and Syntax: the C++ you need before any algorithm.
//
// Build & run:
//   g++ -std=c++17 -O2 -Wall basics.cpp -o basics && ./basics

#include <algorithm>
#include <cassert>
#include <deque>
#include <iostream>
#include <map>
#include <numeric>
#include <queue>
#include <string>
#include <unordered_map>
#include <vector>

using namespace std;

// ---------------------------------------------------------------- overflow --
// The classic wrong answer: a * b is evaluated as int, THEN widened.
long long safeProduct(int a, int b) {
    return 1LL * a * b;  // promote to 64-bit before multiplying
}

// ---------------------------------------------------------------- vectors ---
vector<int> vectorBasics() {
    vector<int> v{3, 1, 2};
    v.push_back(4);                    // O(1) amortised
    sort(v.begin(), v.end());          // O(n log n), introsort
    return v;
}

// 2-D vectors: rows x cols, zero filled. Each row is its own object,
// so unlike Python's [[0]*c]*r there is no aliasing hazard here.
vector<vector<int>> makeGrid(int rows, int cols, int fill = 0) {
    return vector<vector<int>>(rows, vector<int>(cols, fill));
}

// -------------------------------------------------------------- references --
// Taking `const auto&` avoids copying each row. With `auto` this function
// would copy the whole grid, turning an O(n) scan into an O(n) scan plus
// O(n) allocations.
long long sumGrid(const vector<vector<int>>& grid) {
    long long total = 0;
    for (const auto& row : grid)
        total += accumulate(row.begin(), row.end(), 0LL);  // 0LL, not 0
    return total;
}

// ------------------------------------------------------------- associative --
struct MapStats {
    int firstOrderedKey;     // map keeps keys sorted
    int lookupHits;          // unordered_map is O(1) average
};

MapStats mapBasics(const vector<int>& nums) {
    map<int, int> ordered;               // red-black tree, sorted iteration
    unordered_map<int, int> freq;        // hash table, O(1) average

    for (int x : nums) {
        ordered[x]++;
        freq[x]++;
    }

    int hits = 0;
    for (int q : {1, 2, 99})
        if (freq.count(q)) hits++;       // count() == 0 or 1 for a map

    return {ordered.begin()->first, hits};
}

// -------------------------------------------------------------- algorithms --
struct AlgoResults {
    int maxVal;
    int lowerBoundIndex;
    bool contains;
    vector<int> deduped;
};

AlgoResults algorithmTour(vector<int> v) {  // by value: we intend to mutate
    sort(v.begin(), v.end());

    AlgoResults r;
    r.maxVal = *max_element(v.begin(), v.end());
    r.lowerBoundIndex = int(lower_bound(v.begin(), v.end(), 3) - v.begin());
    r.contains = binary_search(v.begin(), v.end(), 4);

    r.deduped = v;
    // unique() shifts duplicates to the tail and returns the new logical end;
    // erase() actually removes them. The vector must already be sorted.
    r.deduped.erase(unique(r.deduped.begin(), r.deduped.end()), r.deduped.end());
    return r;
}

// ------------------------------------------------------------------ heaps ---
pair<int, int> heapBasics(const vector<int>& nums) {
    priority_queue<int> maxHeap(nums.begin(), nums.end());              // default
    priority_queue<int, vector<int>, greater<int>> minHeap(nums.begin(),
                                                          nums.end());
    return {maxHeap.top(), minHeap.top()};
}

// ----------------------------------------------------------------- deque ----
deque<int> dequeBasics() {
    deque<int> dq{2, 3};
    dq.push_front(1);   // O(1) at both ends; vector::insert(begin) is O(n)
    dq.pop_back();
    return dq;           // {1, 2}
}

// ---------------------------------------------------------------- structs ---
struct Node {
    int val;
    Node* next = nullptr;
    explicit Node(int v) : val(v) {}   // member init list
};

// ---------------------------------------------------------------- strings ---
string buildString(const vector<string>& parts) {
    string out;
    out.reserve(16);                   // avoid repeated reallocation
    for (const auto& p : parts) out += p;
    return out;
}

// ------------------------------------------------------------------- demo ---
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    assert(safeProduct(100000, 100000) == 10000000000LL);

    assert((vectorBasics() == vector<int>{1, 2, 3, 4}));

    auto grid = makeGrid(2, 3);
    grid[0][0] = 9;
    assert(grid[1][0] == 0);            // rows are independent
    assert(sumGrid(grid) == 9);

    auto ms = mapBasics({5, 1, 2, 1});
    assert(ms.firstOrderedKey == 1);    // smallest key comes first
    assert(ms.lookupHits == 2);         // 1 and 2 present, 99 not

    auto ar = algorithmTour({4, 2, 3, 2, 1});
    assert(ar.maxVal == 4);
    assert(ar.lowerBoundIndex == 3);    // sorted: 1 2 2 3 4 -> first >= 3 at idx 3
    assert(ar.contains);
    assert((ar.deduped == vector<int>{1, 2, 3, 4}));

    auto [hi, lo] = heapBasics({5, 1, 4});
    assert(hi == 5 && lo == 1);

    assert((dequeBasics() == deque<int>{1, 2}));

    Node a(1), b(2);
    a.next = &b;
    assert(a.next->val == 2);

    assert(buildString({"a", "b", "c"}) == "abc");

    // Integer division truncates toward zero in C++ (Python floors instead).
    assert(-7 / 2 == -3 && -7 % 2 == -1);

    cout << "01-Basics-and-Syntax (C++): all checks passed\n";
    return 0;
}
