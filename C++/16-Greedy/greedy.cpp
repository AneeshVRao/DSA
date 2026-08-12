// 16 - Greedy: the classic greedy algorithms, the sort key that makes each one
// work, and a runnable demonstration of where greedy breaks.
//
// Build & run:
//   g++ -std=c++17 -O2 -Wall greedy.cpp -o greedy && ./greedy

#include <algorithm>
#include <cassert>
#include <climits>
#include <iostream>
#include <map>
#include <memory>
#include <numeric>
#include <queue>
#include <string>
#include <vector>

using namespace std;

using Interval = pair<int, int>;

// ============================================================================
// 1. Sort by END time - activity selection
// ============================================================================
// Maximum number of non-overlapping activities. O(n log n).
//
// Sort by END time: finishing as early as possible leaves the most room for
// what follows. The exchange argument proves it - swapping any later-ending
// choice for the earliest-ending one never loses an activity.
// Sorting by start time or by duration both fail.
vector<Interval> activitySelection(vector<Interval> intervals) {
    sort(intervals.begin(), intervals.end(),
         [](const Interval& a, const Interval& b) { return a.second < b.second; });

    vector<Interval> chosen;
    int lastEnd = INT_MIN;
    for (const auto& [start, end] : intervals) {
        if (start >= lastEnd) {
            chosen.push_back({start, end});
            lastEnd = end;
        }
    }
    return chosen;
}

// The complement: keep as many as possible, remove the rest.
int eraseOverlapIntervals(const vector<Interval>& intervals) {
    return int(intervals.size()) - int(activitySelection(intervals).size());
}

// ============================================================================
// 2. Sort by START time - merging
// ============================================================================
// Sorting by START is what makes overlapping intervals adjacent, so one sweep
// suffices. O(n log n).
vector<Interval> mergeIntervals(vector<Interval> intervals) {
    if (intervals.empty()) return {};
    sort(intervals.begin(), intervals.end());

    vector<Interval> merged{intervals[0]};
    for (size_t i = 1; i < intervals.size(); i++) {
        if (intervals[i].first <= merged.back().second)      // overlap: extend
            merged.back().second = max(merged.back().second, intervals[i].second);
        else
            merged.push_back(intervals[i]);
    }
    return merged;
}

// Minimum platforms so no train waits. Sort arrivals and departures
// INDEPENDENTLY: which train is which does not matter, only how many are
// present at once. O(n log n).
int minPlatforms(vector<int> arrivals, vector<int> departures) {
    if (arrivals.empty()) return 0;
    sort(arrivals.begin(), arrivals.end());
    sort(departures.begin(), departures.end());

    int platforms = 0, best = 0;
    size_t i = 0, j = 0;
    while (i < arrivals.size()) {
        if (arrivals[i] <= departures[j]) {                  // an arrival first
            best = max(best, ++platforms);
            i++;
        } else {                                             // a departure first
            platforms--;
            j++;
        }
    }
    return best;
}

// ============================================================================
// 3. Sort by RATIO - fractional knapsack
// ============================================================================
// Greedy works HERE but not for 0/1 knapsack. Fractions let you fill the
// capacity exactly, so best-value-per-weight-first can never be beaten.
// Without fractions a high-ratio item can waste space and greedy breaks -
// which is exactly why chapter 15 needs a DP table.
double fractionalKnapsack(const vector<int>& weights, const vector<int>& values,
                          double capacity) {
    vector<pair<int, int>> items;                  // {weight, value}
    for (size_t i = 0; i < weights.size(); i++) items.push_back({weights[i], values[i]});

    sort(items.begin(), items.end(), [](const auto& a, const auto& b) {
        return double(a.second) / a.first > double(b.second) / b.first;
    });

    double total = 0;
    for (const auto& [weight, value] : items) {
        if (capacity <= 0) break;
        double take = min(double(weight), capacity);          // whole, or a slice
        total += value * (take / weight);
        capacity -= take;
    }
    return total;
}

// ============================================================================
// 4. Running frontier - one pass, no sorting
// ============================================================================
// Can you reach the last index? Track only the furthest reachable index; if
// the loop ever stands beyond it, the gap is unbridgeable. O(n) / O(1).
bool canJump(const vector<int>& nums) {
    int furthest = 0;
    for (int i = 0; i < int(nums.size()); i++) {
        if (i > furthest) return false;                       // stranded
        furthest = max(furthest, i + nums[i]);
    }
    return true;
}

// Fewest jumps to the last index. A BFS over the array without a queue:
// currentEnd marks the end of the current "level". O(n) / O(1).
int minJumps(const vector<int>& nums) {
    if (nums.size() <= 1) return 0;
    int jumps = 0, currentEnd = 0, furthest = 0;
    for (int i = 0; i + 1 < int(nums.size()); i++) {
        furthest = max(furthest, i + nums[i]);
        if (i == currentEnd) {                                // level exhausted
            jumps++;
            currentEnd = furthest;
            if (currentEnd >= int(nums.size()) - 1) break;
        }
    }
    return jumps;
}

// Starting station for a full circuit, or -1. Two facts make one pass enough:
//   1. total gas < total cost means no answer exists;
//   2. if the tank goes negative at i, no station from the current start to i
//      can work either - so restart at i + 1.
int gasStation(const vector<int>& gas, const vector<int>& cost) {
    long long totalGas = accumulate(gas.begin(), gas.end(), 0LL);
    long long totalCost = accumulate(cost.begin(), cost.end(), 0LL);
    if (totalGas < totalCost) return -1;

    int start = 0;
    long long tank = 0;
    for (int i = 0; i < int(gas.size()); i++) {
        tank += gas[i] - cost[i];
        if (tank < 0) {
            start = i + 1;                                    // everything before fails
            tank = 0;
        }
    }
    return start;
}

// ============================================================================
// 5. Always take the extreme - Huffman coding
// ============================================================================
struct HuffmanNode {
    int weight;
    char symbol;                                   // meaningful only in leaves
    shared_ptr<HuffmanNode> left, right;
    bool isLeaf() const { return !left && !right; }
};

using NodePtr = shared_ptr<HuffmanNode>;

struct CompareNodes {
    bool operator()(const NodePtr& a, const NodePtr& b) const {
        if (a->weight != b->weight) return a->weight > b->weight;   // min-heap
        return a->symbol > b->symbol;                                // stable ties
    }
};

void collectCodes(const NodePtr& node, const string& prefix,
                  map<char, string>& codes) {
    if (!node) return;
    if (node->isLeaf()) {
        codes[node->symbol] = prefix;
        return;
    }
    collectCodes(node->left, prefix + "0", codes);
    collectCodes(node->right, prefix + "1", codes);
}

// Optimal prefix-free codes. O(n log n).
// Repeatedly merge the two LEAST frequent nodes: rare symbols end up deepest
// and get the longest codes. Provably optimal (Huffman, 1952).
map<char, string> huffmanCodes(const map<char, int>& frequencies) {
    map<char, string> codes;
    if (frequencies.empty()) return codes;
    if (frequencies.size() == 1) {                 // one symbol still needs a bit
        codes[frequencies.begin()->first] = "0";
        return codes;
    }

    priority_queue<NodePtr, vector<NodePtr>, CompareNodes> heap;
    for (const auto& [symbol, weight] : frequencies)
        heap.push(make_shared<HuffmanNode>(HuffmanNode{weight, symbol, nullptr, nullptr}));

    while (heap.size() > 1) {
        NodePtr left = heap.top();
        heap.pop();
        NodePtr right = heap.top();
        heap.pop();
        heap.push(make_shared<HuffmanNode>(
            HuffmanNode{left->weight + right->weight,
                        min(left->symbol, right->symbol), left, right}));
    }

    collectCodes(heap.top(), "", codes);
    return codes;
}

// Minimum total cost to merge all sticks. Always merge the two cheapest: every
// merge cost is paid again by every later merge containing it.
long long connectSticks(const vector<int>& lengths) {
    if (lengths.size() <= 1) return 0;
    priority_queue<long long, vector<long long>, greater<long long>> heap(
        lengths.begin(), lengths.end());

    long long total = 0;
    while (heap.size() > 1) {
        long long a = heap.top();
        heap.pop();
        long long b = heap.top();
        heap.pop();
        total += a + b;
        heap.push(a + b);
    }
    return total;
}

// ============================================================================
// 6. Where greedy BREAKS
// ============================================================================
// Take the largest coin that fits. Correct for canonical systems such as
// {1,5,10,25}; WRONG in general - the demo proves it with {1,3,4} and 6.
// Returns -1 when the amount cannot be made this way.
int coinChangeGreedy(vector<int> coins, int amount) {
    sort(coins.rbegin(), coins.rend());
    int used = 0;
    for (int coin : coins) {
        used += amount / coin;
        amount %= coin;
    }
    return amount == 0 ? used : -1;
}

// The correct answer for any coin system. O(coins * amount).
int coinChangeDp(const vector<int>& coins, int amount) {
    const int INF = INT_MAX / 2;
    vector<int> dp(amount + 1, INF);
    dp[0] = 0;
    for (int coin : coins)
        for (int value = coin; value <= amount; value++)
            dp[value] = min(dp[value], dp[value - coin] + 1);
    return dp[amount] >= INF ? -1 : dp[amount];
}

// ============================================================================
// demo
// ============================================================================
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    vector<Interval> activities{{1, 4}, {3, 5}, {0, 6}, {5, 7},
                                {3, 9}, {5, 9}, {6, 10}, {8, 11}};
    auto chosen = activitySelection(activities);
    assert((chosen == vector<Interval>{{1, 4}, {5, 7}, {8, 11}}));
    for (size_t i = 0; i + 1 < chosen.size(); i++)          // really disjoint
        assert(chosen[i].second <= chosen[i + 1].first);
    assert(activitySelection({}).empty());

    // Sorting by START instead of END gives a worse answer - the sort key IS
    // the algorithm. Earliest-start takes (0,6) and blocks (1,4) and (5,7).
    {
        vector<Interval> byStart = activities;
        sort(byStart.begin(), byStart.end());
        vector<Interval> naive;
        int lastEnd = INT_MIN;
        for (const auto& [start, end] : byStart)
            if (start >= lastEnd) {
                naive.push_back({start, end});
                lastEnd = end;
            }
        assert(naive.size() < chosen.size());
    }

    assert(eraseOverlapIntervals({{1, 2}, {2, 3}, {3, 4}, {1, 3}}) == 1);
    assert(eraseOverlapIntervals({{1, 2}, {1, 2}, {1, 2}}) == 2);
    assert(eraseOverlapIntervals({}) == 0);

    assert((mergeIntervals({{1, 3}, {2, 6}, {8, 10}, {15, 18}}) ==
            vector<Interval>{{1, 6}, {8, 10}, {15, 18}}));
    assert((mergeIntervals({{1, 4}, {4, 5}}) == vector<Interval>{{1, 5}}));
    assert(mergeIntervals({}).empty());

    assert(minPlatforms({900, 940, 950, 1100, 1500, 1800},
                        {910, 1200, 1120, 1130, 1900, 2000}) == 3);
    assert(minPlatforms({100}, {200}) == 1);
    assert(minPlatforms({}, {}) == 0);

    double total = fractionalKnapsack({10, 20, 30}, {60, 100, 120}, 50);
    assert(total > 239.999 && total < 240.001);   // 10 + 20 + two thirds of 30
    assert(fractionalKnapsack({10}, {60}, 5) == 30.0);      // half an item

    assert(canJump({2, 3, 1, 1, 4}));
    assert(!canJump({3, 2, 1, 0, 4}));            // the 0 at index 3 strands you
    assert(canJump({0}));                         // already at the end

    assert(minJumps({2, 3, 1, 1, 4}) == 2);       // 0 -> 1 -> 4
    assert(minJumps({2, 3, 0, 1, 4}) == 2);
    assert(minJumps({0}) == 0);

    assert(gasStation({1, 2, 3, 4, 5}, {3, 4, 5, 1, 2}) == 3);
    assert(gasStation({2, 3, 4}, {3, 4, 3}) == -1);         // not enough gas
    assert(gasStation({5}, {4}) == 0);

    auto codes = huffmanCodes({{'a', 45}, {'b', 13}, {'c', 12},
                               {'d', 16}, {'e', 9}, {'f', 5}});
    assert(codes.size() == 6);
    // Prefix-free: no code is a prefix of another. That is what makes the
    // encoding decodable without separators.
    for (const auto& [s1, c1] : codes)
        for (const auto& [s2, c2] : codes)
            assert(s1 == s2 || c2.compare(0, c1.size(), c1) != 0);
    // The most frequent symbol gets one of the shortest codes.
    for (const auto& [symbol, code] : codes)
        assert(codes['a'].size() <= code.size());
    assert(codes['a'].size() < codes['f'].size());
    assert(huffmanCodes({{'z', 1}}).at('z') == "0");
    assert(huffmanCodes({}).empty());

    assert(connectSticks({2, 4, 3}) == 14);       // (2+3)=5, then (5+4)=9
    assert(connectSticks({1, 8, 3, 5}) == 30);
    assert(connectSticks({5}) == 0);

    // Greedy is optimal on a canonical coin system ...
    assert(coinChangeGreedy({1, 5, 10, 25}, 63) == 6);      // 25,25,10,1,1,1
    assert(coinChangeDp({1, 5, 10, 25}, 63) == 6);
    // ... and WRONG on this one. This is the whole reason DP exists.
    assert(coinChangeGreedy({1, 3, 4}, 6) == 3);            // 4 + 1 + 1
    assert(coinChangeDp({1, 3, 4}, 6) == 2);                // 3 + 3
    assert(coinChangeGreedy({1, 3, 4}, 6) > coinChangeDp({1, 3, 4}, 6));
    assert(coinChangeGreedy({5}, 3) == -1);
    assert(coinChangeDp({5}, 3) == -1);

    cout << "16-Greedy (C++): all checks passed\n";
    return 0;
}
