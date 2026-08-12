// 13 - Heaps and Priority Queue: a binary heap from scratch, plus the four
// patterns that priority queues exist for.
//
// Build & run:
//   g++ -std=c++17 -O2 -Wall heaps.cpp -o heaps && ./heaps

#include <algorithm>
#include <cassert>
#include <functional>
#include <iostream>
#include <queue>
#include <random>
#include <stdexcept>
#include <string>
#include <unordered_map>
#include <vector>

using namespace std;

// ============================================================================
// 1. A binary min-heap from scratch
// ============================================================================
// A complete binary tree packed into a vector: no gaps means parent and child
// links are pure arithmetic, with no nodes and no pointers.
class MinHeap {
   public:
    MinHeap() = default;

    // Bulk build in O(n): sift down from the last parent backwards. A node at
    // height h costs O(h) and only n/2^(h+1) nodes sit that high, so the sum
    // telescopes to O(n). Pushing one at a time would be O(n log n).
    explicit MinHeap(vector<int> items) : data_(move(items)) {
        for (int i = int(data_.size()) / 2 - 1; i >= 0; i--) siftDown(i);
    }

    void push(int value) {
        data_.push_back(value);
        siftUp(int(data_.size()) - 1);
    }

    // Move the LAST element to the root (keeping the tree complete), then let
    // it sink. O(log n).
    int pop() {
        if (data_.empty()) throw out_of_range("pop from empty heap");
        int smallest = data_[0];
        data_[0] = data_.back();
        data_.pop_back();
        if (!data_.empty()) siftDown(0);
        return smallest;
    }

    int top() const {
        if (data_.empty()) throw out_of_range("top of empty heap");
        return data_[0];                      // O(1) - the point of a heap
    }

    bool empty() const { return data_.empty(); }
    size_t size() const { return data_.size(); }

    // Used by the tests: verify the invariant at every node.
    bool isValid() const {
        for (size_t i = 1; i < data_.size(); i++)
            if (data_[(i - 1) / 2] > data_[i]) return false;
        return true;
    }

   private:
    void siftUp(int i) {                      // swap up while the parent is bigger
        while (i > 0) {
            int parent = (i - 1) / 2;
            if (data_[parent] <= data_[i]) return;
            swap(data_[parent], data_[i]);
            i = parent;
        }
    }

    void siftDown(int i) {                    // swap with the SMALLER child
        int n = int(data_.size());
        while (true) {
            int smallest = i, left = 2 * i + 1, right = 2 * i + 2;
            if (left < n && data_[left] < data_[smallest]) smallest = left;
            if (right < n && data_[right] < data_[smallest]) smallest = right;
            if (smallest == i) return;
            swap(data_[i], data_[smallest]);
            i = smallest;
        }
    }

    vector<int> data_;
};

// ============================================================================
// 2. Heapsort
// ============================================================================
// O(n) to build plus n pops of O(log n).
vector<int> heapSort(const vector<int>& nums) {
    MinHeap heap(nums);
    vector<int> out;
    out.reserve(nums.size());
    while (!heap.empty()) out.push_back(heap.pop());
    return out;
}

// ============================================================================
// 3. Top k with a size-k heap
// ============================================================================
// Counter-intuitive but essential: for the k LARGEST elements keep a MIN-heap
// of size k. Its top is the weakest survivor, so anything smaller is rejected
// in O(1) and the heap never grows past k. O(n log k) time, O(k) space.
int kthLargest(const vector<int>& nums, int k) {
    if (k < 1 || k > int(nums.size())) throw invalid_argument("k out of range");
    priority_queue<int, vector<int>, greater<int>> heap;   // min-heap
    for (int x : nums) {
        heap.push(x);
        if (int(heap.size()) > k) heap.pop();              // evict the smallest
    }
    return heap.top();
}

// The k most frequent values - the same size-k trick, keyed on the count.
vector<int> topKFrequent(const vector<int>& nums, int k) {
    unordered_map<int, int> counts;
    for (int x : nums) counts[x]++;

    // pair compares first-then-second, so this orders by count.
    priority_queue<pair<int, int>, vector<pair<int, int>>,
                   greater<pair<int, int>>> heap;
    for (const auto& [value, count] : counts) {
        heap.push({count, value});
        if (int(heap.size()) > k) heap.pop();
    }

    vector<pair<int, int>> best;
    while (!heap.empty()) {
        best.push_back(heap.top());
        heap.pop();
    }
    sort(best.rbegin(), best.rend());          // most frequent first
    vector<int> out;
    for (const auto& [count, value] : best) out.push_back(value);
    return out;
}

// ============================================================================
// 4. Merging k sorted sequences
// ============================================================================
// The heap holds at most one element per list, so it stays size k:
// O(N log k) for N total elements. Merging pairwise would be O(N k).
struct HeapEntry {
    int value;
    int listIndex;
    int elementIndex;
    // Inverted comparison: priority_queue asks "does a have LOWER priority?"
    bool operator>(const HeapEntry& other) const { return value > other.value; }
};

vector<int> mergeKSorted(const vector<vector<int>>& lists) {
    priority_queue<HeapEntry, vector<HeapEntry>, greater<HeapEntry>> heap;
    for (int i = 0; i < int(lists.size()); i++)
        if (!lists[i].empty()) heap.push({lists[i][0], i, 0});

    vector<int> out;
    while (!heap.empty()) {
        HeapEntry entry = heap.top();
        heap.pop();
        out.push_back(entry.value);
        int next = entry.elementIndex + 1;
        if (next < int(lists[entry.listIndex].size()))
            heap.push({lists[entry.listIndex][next], entry.listIndex, next});
    }
    return out;
}

// ============================================================================
// 5. Two heaps for a running median
// ============================================================================
// low_ is a max-heap holding the smaller half, high_ a min-heap holding the
// larger half. Every value enters low_ first and its maximum is handed to
// high_ - that push-then-pop is what keeps the halves correctly ORDERED, not
// merely balanced.
class MedianFinder {
   public:
    void add(int value) {
        low_.push(value);
        high_.push(low_.top());          // hand the largest of the low half up
        low_.pop();
        if (high_.size() > low_.size()) {    // rebalance so low_ >= high_
            low_.push(high_.top());
            high_.pop();
        }
    }

    double median() const {
        if (low_.empty()) throw out_of_range("median of an empty stream");
        if (low_.size() > high_.size()) return low_.top();
        return (low_.top() + high_.top()) / 2.0;
    }

   private:
    priority_queue<int> low_;                                    // max-heap
    priority_queue<int, vector<int>, greater<int>> high_;        // min-heap
};

// ============================================================================
// 6. Priority queue with tie-breaking
// ============================================================================
// The counter is not decoration: on a priority tie, comparison falls through
// to the next field, and comparing task names would be arbitrary. A monotonic
// counter makes ties resolve by insertion order - a stable priority queue.
struct Task {
    int priority;
    int sequence;
    string name;
    bool operator>(const Task& other) const {
        if (priority != other.priority) return priority > other.priority;
        return sequence > other.sequence;
    }
};

class TaskQueue {
   public:
    void add(int priority, const string& name) {
        heap_.push({priority, counter_++, name});
    }

    string nextTask() {
        if (heap_.empty()) throw out_of_range("no tasks");
        string name = heap_.top().name;
        heap_.pop();
        return name;
    }

    size_t size() const { return heap_.size(); }

   private:
    priority_queue<Task, vector<Task>, greater<Task>> heap_;     // lowest first
    int counter_ = 0;
};

// ============================================================================
// demo
// ============================================================================
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    MinHeap heap;
    for (int x : {5, 3, 8, 1, 9, 2}) heap.push(x);
    assert(heap.top() == 1 && heap.size() == 6 && heap.isValid());
    assert(heap.pop() == 1 && heap.pop() == 2);
    assert(heap.top() == 3 && heap.isValid());

    bool threw = false;
    try {
        MinHeap().pop();
    } catch (const out_of_range&) {
        threw = true;
    }
    assert(threw);

    // The O(n) bulk build must produce a valid heap.
    MinHeap built(vector<int>{9, 4, 7, 1, 8, 2, 6});
    assert(built.isValid() && built.top() == 1);

    // Randomised: heapsort must agree with std::sort every time.
    mt19937 rng(13);
    uniform_int_distribution<int> sizeDist(0, 40), valueDist(-100, 100);
    for (int trial = 0; trial < 200; trial++) {
        vector<int> data(sizeDist(rng));
        for (int& x : data) x = valueDist(rng);
        vector<int> expected = data;
        sort(expected.begin(), expected.end());
        assert(heapSort(data) == expected);
    }

    assert(kthLargest({3, 2, 1, 5, 6, 4}, 2) == 5);
    assert(kthLargest({3, 2, 3, 1, 2, 4, 5, 5, 6}, 4) == 4);
    assert(kthLargest({1}, 1) == 1);
    {
        vector<int> data{3, 2, 1, 5, 6, 4};
        vector<int> descending = data;
        sort(descending.rbegin(), descending.rend());
        for (int k = 1; k <= int(data.size()); k++)
            assert(kthLargest(data, k) == descending[k - 1]);
    }

    assert((topKFrequent({1, 1, 1, 2, 2, 3}, 2) == vector<int>{1, 2}));
    assert((topKFrequent({1}, 1) == vector<int>{1}));

    assert((mergeKSorted({{1, 4, 5}, {1, 3, 4}, {2, 6}}) ==
            vector<int>{1, 1, 2, 3, 4, 4, 5, 6}));
    assert((mergeKSorted({{}, {1}}) == vector<int>{1}));
    assert(mergeKSorted({}).empty());

    MedianFinder median;
    median.add(1);
    assert(median.median() == 1.0);
    median.add(2);
    assert(median.median() == 1.5);          // even count: average of two
    median.add(3);
    assert(median.median() == 2.0);
    for (int x : {10, -5, 7, 0}) median.add(x);
    assert(median.median() == 2.0);          // sorted: -5 0 1 2 3 7 10

    TaskQueue tasks;
    tasks.add(2, "write tests");
    tasks.add(1, "fix the bug");
    tasks.add(1, "review the PR");           // same priority as the previous
    assert(tasks.nextTask() == "fix the bug");
    assert(tasks.nextTask() == "review the PR");   // tie broken by arrival
    assert(tasks.nextTask() == "write tests");
    assert(tasks.size() == 0);

    cout << "13-Heaps-Priority-Queue (C++): all checks passed\n";
    return 0;
}
