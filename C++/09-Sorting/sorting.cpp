// 09 - Sorting: every classic algorithm from scratch, each verified against
// std::sort on randomised input.
//
// Build & run:
//   g++ -std=c++17 -O2 -Wall sorting.cpp -o sorting && ./sorting

#include <algorithm>
#include <cassert>
#include <functional>
#include <iostream>
#include <random>
#include <stdexcept>
#include <string>
#include <vector>

using namespace std;

// One shared generator so results are reproducible with a fixed seed.
static mt19937 rng(42);

// ============================================================================
// 1. Quadratic sorts
// ============================================================================

// Repeatedly swap adjacent out-of-order pairs. O(n^2), O(1) space, stable.
// The `swapped` flag makes it adaptive: sorted input costs one O(n) pass.
void bubbleSort(vector<int>& a) {
    for (size_t i = 0; i + 1 < a.size(); i++) {
        bool swapped = false;
        for (size_t j = 0; j + 1 < a.size() - i; j++) {   // tail already final
            if (a[j] > a[j + 1]) {
                swap(a[j], a[j + 1]);
                swapped = true;
            }
        }
        if (!swapped) break;                              // nothing moved
    }
}

// O(n^2) comparisons always, but only n-1 swaps - the fewest of any sort.
// NOT stable: the long-distance swap can jump equal elements over each other.
void selectionSort(vector<int>& a) {
    for (size_t i = 0; i + 1 < a.size(); i++) {
        size_t smallest = i;
        for (size_t j = i + 1; j < a.size(); j++)
            if (a[j] < a[smallest]) smallest = j;
        swap(a[i], a[smallest]);
    }
}

// Insert each element into the sorted prefix. O(n^2), O(n) best, stable.
// This is what std::sort falls back to for small ranges - tiny constant factor.
void insertionSort(vector<int>& a) {
    for (size_t i = 1; i < a.size(); i++) {
        int key = a[i];
        size_t j = i;
        while (j > 0 && a[j - 1] > key) {   // strict >: equal elements stay put
            a[j] = a[j - 1];                // shift right
            j--;
        }
        a[j] = key;
    }
}

// ============================================================================
// 2. Merge sort
// ============================================================================

// Merge two sorted halves of a[lo..hi] using a scratch buffer. <= keeps it
// stable, which is the whole reason to prefer merge sort.
void mergeHalves(vector<int>& a, int lo, int mid, int hi, vector<int>& buffer) {
    int i = lo, j = mid + 1, k = lo;
    while (i <= mid && j <= hi)
        buffer[k++] = (a[i] <= a[j]) ? a[i++] : a[j++];
    while (i <= mid) buffer[k++] = a[i++];
    while (j <= hi) buffer[k++] = a[j++];
    for (int t = lo; t <= hi; t++) a[t] = buffer[t];
}

// T(n) = 2T(n/2) + O(n) -> O(n log n) always. O(n) extra space.
// The buffer is allocated ONCE; allocating per call would dominate the runtime.
void mergeSortRange(vector<int>& a, int lo, int hi, vector<int>& buffer) {
    if (lo >= hi) return;
    int mid = lo + (hi - lo) / 2;
    mergeSortRange(a, lo, mid, buffer);
    mergeSortRange(a, mid + 1, hi, buffer);
    mergeHalves(a, lo, mid, hi, buffer);
}

void mergeSort(vector<int>& a) {
    if (a.size() < 2) return;
    vector<int> buffer(a.size());
    mergeSortRange(a, 0, int(a.size()) - 1, buffer);
}

// ============================================================================
// 3. Quicksort
// ============================================================================

// Lomuto partition with a RANDOM pivot. Returns the pivot's final index.
// The randomisation is what avoids the O(n^2) case on already-sorted input.
int partitionRange(vector<int>& a, int lo, int hi) {
    uniform_int_distribution<int> pick(lo, hi);
    swap(a[pick(rng)], a[hi]);              // move the pivot out of the way
    int pivot = a[hi];

    int smaller = lo;                       // boundary of the "< pivot" region
    for (int i = lo; i < hi; i++)
        if (a[i] < pivot) swap(a[smaller++], a[i]);
    swap(a[smaller], a[hi]);                // pivot lands on the boundary
    return smaller;
}

// Recurse into the SMALLER side and loop on the larger: caps stack depth at
// O(log n) even when the partitions are unbalanced.
void quickSortRange(vector<int>& a, int lo, int hi) {
    while (lo < hi) {
        int p = partitionRange(a, lo, hi);
        if (p - lo < hi - p) {
            quickSortRange(a, lo, p - 1);
            lo = p + 1;
        } else {
            quickSortRange(a, p + 1, hi);
            hi = p - 1;
        }
    }
}

void quickSort(vector<int>& a) {
    if (a.size() > 1) quickSortRange(a, 0, int(a.size()) - 1);
}

// ============================================================================
// 4. Heap sort
// ============================================================================

// Push a[root] down until the max-heap property holds. O(log n).
void siftDown(vector<int>& a, int root, int size) {
    while (true) {
        int largest = root;
        int left = 2 * root + 1, right = 2 * root + 2;
        if (left < size && a[left] > a[largest]) largest = left;
        if (right < size && a[right] > a[largest]) largest = right;
        if (largest == root) return;
        swap(a[root], a[largest]);
        root = largest;
    }
}

// O(n log n) worst case AND O(1) space - the only classic sort with both.
// Not stable, and slower than quicksort in practice (cache locality).
void heapSort(vector<int>& a) {
    int n = int(a.size());
    for (int i = n / 2 - 1; i >= 0; i--) siftDown(a, i, n);   // build: O(n)
    for (int end = n - 1; end > 0; end--) {
        swap(a[0], a[end]);                 // largest to its final position
        siftDown(a, 0, end);                // restore the heap on the prefix
    }
}

// ============================================================================
// 5. Non-comparison sorts
// ============================================================================

// O(n + k) for non-negative integers with a small range k. It never compares
// two elements - values are used directly as indices, which is how it beats
// the O(n log n) comparison bound. The prefix-sum step makes it stable.
void countingSort(vector<int>& a) {
    if (a.empty()) return;
    int lo = *min_element(a.begin(), a.end());
    if (lo < 0) throw invalid_argument("counting sort needs non-negative ints");

    int k = *max_element(a.begin(), a.end());
    vector<int> counts(k + 1, 0);
    for (int x : a) counts[x]++;
    for (int i = 1; i <= k; i++) counts[i] += counts[i - 1];   // prefix sums

    vector<int> out(a.size());
    for (int i = int(a.size()) - 1; i >= 0; i--)               // reverse: stable
        out[--counts[a[i]]] = a[i];
    a = move(out);
}

// LSD radix sort: a stable counting sort per digit, least significant first.
// O(d * (n + 10)). Correct ONLY because each pass is stable.
void radixSort(vector<int>& a) {
    if (a.empty()) return;
    if (*min_element(a.begin(), a.end()) < 0)
        throw invalid_argument("this radix sort handles non-negative ints only");

    int largest = *max_element(a.begin(), a.end());
    vector<int> out(a.size());
    for (long long exp = 1; largest / exp > 0; exp *= 10) {
        vector<int> counts(10, 0);
        for (int x : a) counts[(x / exp) % 10]++;
        for (int i = 1; i < 10; i++) counts[i] += counts[i - 1];
        for (int i = int(a.size()) - 1; i >= 0; i--)
            out[--counts[(a[i] / exp) % 10]] = a[i];
        a = out;
    }
}

// ============================================================================
// 6. Quickselect
// ============================================================================

// kth smallest (1-based). O(n) average: only ONE side is explored, so the work
// is n + n/2 + n/4 + ... = 2n.
int quickselect(vector<int> a, int k) {
    if (k < 1 || k > int(a.size())) throw out_of_range("k out of range");
    int lo = 0, hi = int(a.size()) - 1, target = k - 1;
    while (true) {
        if (lo == hi) return a[lo];
        int p = partitionRange(a, lo, hi);
        if (p == target) return a[p];
        if (p < target) lo = p + 1;
        else hi = p - 1;
    }
}

// ============================================================================
// 7. Stability demonstration
// ============================================================================
struct Person {
    string name;
    int score;
    bool operator==(const Person& o) const {
        return name == o.name && score == o.score;
    }
};

// Stable merge sort by score only: equal scores must keep their input order.
vector<Person> stableSortByScore(const vector<Person>& people) {
    if (people.size() <= 1) return people;
    size_t mid = people.size() / 2;
    vector<Person> left(people.begin(), people.begin() + mid);
    vector<Person> right(people.begin() + mid, people.end());
    left = stableSortByScore(left);
    right = stableSortByScore(right);

    vector<Person> out;
    out.reserve(people.size());
    size_t i = 0, j = 0;
    while (i < left.size() && j < right.size())
        out.push_back(left[i].score <= right[j].score ? left[i++] : right[j++]);
    while (i < left.size()) out.push_back(left[i++]);
    while (j < right.size()) out.push_back(right[j++]);
    return out;
}

// ============================================================================
// demo
// ============================================================================
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    vector<pair<string, function<void(vector<int>&)>>> algorithms{
        {"bubble", bubbleSort},     {"selection", selectionSort},
        {"insertion", insertionSort}, {"merge", mergeSort},
        {"quick", quickSort},       {"heap", heapSort},
        {"counting", countingSort}, {"radix", radixSort},
    };

    // Hand-picked edge cases every sort must survive.
    vector<vector<int>> edgeCases{
        {}, {1}, {2, 1},
        {1, 1, 1, 1},                        // all equal
        {5, 4, 3, 2, 1},                     // reverse sorted
        {1, 2, 3, 4, 5},                     // already sorted
        {3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5},   // duplicates
        {0, 0, 10, 7, 0},                    // zeros
    };
    for (auto& [name, fn] : algorithms) {
        for (const auto& original : edgeCases) {
            vector<int> mine = original, expected = original;
            fn(mine);
            sort(expected.begin(), expected.end());
            assert(mine == expected);
        }
    }

    // 200 randomised vectors against std::sort.
    uniform_int_distribution<int> sizeDist(0, 60), valueDist(0, 500);
    for (int trial = 0; trial < 200; trial++) {
        vector<int> data(sizeDist(rng));
        for (int& x : data) x = valueDist(rng);
        vector<int> expected = data;
        sort(expected.begin(), expected.end());
        for (auto& [name, fn] : algorithms) {
            vector<int> mine = data;
            fn(mine);
            assert(mine == expected);
        }
    }

    // Negatives: comparison sorts handle them, counting/radix must refuse.
    vector<int> negatives{3, -1, 4, -1, 5};
    // const char* rather than const string&: a string reference would bind to
    // a temporary constructed from each literal (-Wrange-loop-construct).
    for (const char* name : {"bubble", "selection", "insertion", "merge",
                             "quick", "heap"}) {
        for (auto& [algoName, fn] : algorithms) {
            if (algoName != name) continue;
            vector<int> mine = negatives, expected = negatives;
            fn(mine);
            sort(expected.begin(), expected.end());
            assert(mine == expected);
        }
    }
    bool threw = false;
    try {
        vector<int> copy = negatives;
        countingSort(copy);
    } catch (const invalid_argument&) {
        threw = true;
    }
    assert(threw);

    // Stability: equal scores keep their input order.
    vector<Person> people{{"amy", 2}, {"bob", 1}, {"cat", 2}, {"dan", 1}};
    vector<Person> expectedStable{{"bob", 1}, {"dan", 1}, {"amy", 2}, {"cat", 2}};
    assert(stableSortByScore(people) == expectedStable);
    // std::stable_sort must agree; std::sort gives no such guarantee.
    vector<Person> viaStl = people;
    stable_sort(viaStl.begin(), viaStl.end(),
                [](const Person& a, const Person& b) { return a.score < b.score; });
    assert(viaStl == expectedStable);

    // Quickselect against the sorted reference.
    vector<int> data{7, 10, 4, 3, 20, 15};
    vector<int> sorted_ = data;
    sort(sorted_.begin(), sorted_.end());
    for (int k = 1; k <= int(data.size()); k++)
        assert(quickselect(data, k) == sorted_[k - 1]);

    cout << "09-Sorting (C++): all checks passed\n";
    cout << "  " << algorithms.size() << " algorithms x " << edgeCases.size()
         << " edge cases + 200 random vectors verified against std::sort\n";
    return 0;
}
