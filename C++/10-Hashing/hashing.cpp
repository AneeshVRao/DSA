// 10 - Hashing: a hash map built from scratch (separate chaining + rehashing),
// plus the patterns hashing exists to serve, and an LRU cache.
//
// Build & run:
//   g++ -std=c++17 -O2 -Wall hashing.cpp -o hashing && ./hashing

#include <algorithm>
#include <cassert>
#include <functional>
#include <iostream>
#include <list>
#include <stdexcept>
#include <string>
#include <unordered_map>
#include <unordered_set>
#include <vector>

using namespace std;

// ============================================================================
// 1. A hash map from scratch (separate chaining)
// ============================================================================
// The standard mandates chaining for unordered_map, so this mirrors the real
// structure: an array of buckets, each holding a chain of entries.
template <typename K, typename V>
class HashMap {
   public:
    HashMap() : buckets_(kInitialCapacity) {}

    size_t size() const { return size_; }
    size_t capacity() const { return buckets_.size(); }
    double loadFactor() const { return double(size_) / buckets_.size(); }

    // O(1) average, amortised across the occasional resize.
    void put(const K& key, const V& value) {
        auto& chain = buckets_[indexFor(key)];
        for (auto& entry : chain) {
            if (entry.first == key) {       // equal keys overwrite
                entry.second = value;
                return;
            }
        }
        chain.push_back({key, value});
        size_++;
        if (loadFactor() > kMaxLoadFactor) resize();
    }

    // Returns nullptr when absent - no exceptions, no default construction.
    const V* get(const K& key) const {
        for (const auto& entry : buckets_[indexFor(key)])
            if (entry.first == key) return &entry.second;
        return nullptr;
    }

    bool contains(const K& key) const { return get(key) != nullptr; }

    bool remove(const K& key) {
        auto& chain = buckets_[indexFor(key)];
        for (auto it = chain.begin(); it != chain.end(); ++it) {
            if (it->first == key) {
                chain.erase(it);
                size_--;
                return true;
            }
        }
        return false;
    }

    vector<K> keys() const {
        vector<K> out;
        out.reserve(size_);
        for (const auto& chain : buckets_)
            for (const auto& entry : chain) out.push_back(entry.first);
        return out;
    }

    // Diagnostic: how badly is this table colliding?
    size_t longestChain() const {
        size_t worst = 0;
        for (const auto& chain : buckets_) worst = max(worst, chain.size());
        return worst;
    }

   private:
    static constexpr size_t kInitialCapacity = 8;
    static constexpr double kMaxLoadFactor = 0.75;

    size_t indexFor(const K& key) const {
        return hash<K>{}(key) % buckets_.size();
    }

    // Double the capacity and REHASH: the bucket index depends on the
    // capacity, so every key belongs somewhere new. O(n).
    void resize() {
        vector<vector<pair<K, V>>> old = move(buckets_);
        buckets_.assign(old.size() * 2, {});
        size_ = 0;
        for (const auto& chain : old)
            for (const auto& entry : chain) put(entry.first, entry.second);
    }

    vector<vector<pair<K, V>>> buckets_;
    size_t size_ = 0;
};

// ============================================================================
// 2. Frequency map
// ============================================================================
unordered_map<char, int> charFrequency(const string& s) {   // O(n)
    unordered_map<char, int> freq;
    freq.reserve(s.size());          // reserve = no rehashing mid-loop
    for (char c : s) freq[c]++;      // operator[] default-constructs to 0
    return freq;
}

int firstUniqueChar(const string& s) {
    unordered_map<char, int> freq;
    for (char c : s) freq[c]++;
    for (size_t i = 0; i < s.size(); i++)
        if (freq[s[i]] == 1) return int(i);
    return -1;
}

// ============================================================================
// 3. Complement lookup
// ============================================================================
// Brute force asks "does x pair with any later element?" - O(n^2).
// Hashing flips it: "have I already seen the complement?" - O(1) per check.
pair<int, int> twoSum(const vector<int>& nums, int target) {
    unordered_map<int, int> seen;    // value -> index
    seen.reserve(nums.size());
    for (int i = 0; i < int(nums.size()); i++) {
        auto it = seen.find(target - nums[i]);
        if (it != seen.end()) return {it->second, i};
        seen[nums[i]] = i;           // insert AFTER checking: no self-reuse
    }
    return {-1, -1};
}

bool containsDuplicate(const vector<int>& nums) {
    unordered_set<int> seen;
    seen.reserve(nums.size());
    for (int x : nums)
        if (!seen.insert(x).second) return true;   // insert reports duplicates
    return false;
}

// ============================================================================
// 4. Grouping by a computed key
// ============================================================================
// Any function mapping equivalent items to the same value works as a key.
vector<vector<string>> groupAnagrams(const vector<string>& words) {
    unordered_map<string, vector<string>> groups;
    for (const auto& word : words) {
        string key = word;
        sort(key.begin(), key.end());
        groups[key].push_back(word);
    }
    vector<vector<string>> out;
    out.reserve(groups.size());
    for (auto& [key, group] : groups) out.push_back(move(group));
    return out;
}

// ============================================================================
// 5. Prefix sum + map
// ============================================================================
// prefix[j] - prefix[i] == k means the subarray (i, j] sums to k. So at each
// j, count how many earlier prefixes equal prefix[j] - k.
// Seeding counts[0] = 1 represents the empty prefix, which is what lets
// subarrays starting at index 0 be counted.
int subarraySumEqualsK(const vector<int>& nums, int k) {
    unordered_map<long long, int> counts{{0, 1}};
    long long prefix = 0;
    int total = 0;
    for (int x : nums) {
        prefix += x;
        auto it = counts.find(prefix - k);
        if (it != counts.end()) total += it->second;
        counts[prefix]++;
    }
    return total;
}

// ============================================================================
// 6. Seen set
// ============================================================================
// Only start counting at a value whose predecessor is absent, so each run is
// walked exactly once - that is what keeps this O(n) despite the inner loop.
int longestConsecutive(const vector<int>& nums) {
    unordered_set<int> unique(nums.begin(), nums.end());
    int best = 0;
    for (int x : unique) {
        if (unique.count(x - 1)) continue;      // not the start of a run
        int length = 1;
        while (unique.count(x + length)) length++;
        best = max(best, length);
    }
    return best;
}

vector<int> intersection(const vector<int>& a, const vector<int>& b) {
    unordered_set<int> lookup(b.begin(), b.end());
    unordered_set<int> found;
    for (int x : a)
        if (lookup.count(x)) found.insert(x);
    vector<int> out(found.begin(), found.end());
    sort(out.begin(), out.end());
    return out;
}

// ============================================================================
// 7. Hashing + ordering: an LRU cache
// ============================================================================
// O(1) get and put needs BOTH a hash map (lookup) and a doubly linked list
// (recency order). std::list gives O(1) splice; the map stores iterators into
// it, and list iterators stay valid across every operation except erasing the
// element itself.
class LRUCache {
   public:
    explicit LRUCache(size_t capacity) : capacity_(capacity) {
        if (capacity == 0) throw invalid_argument("capacity must be positive");
    }

    int get(int key) {
        auto it = index_.find(key);
        if (it == index_.end()) return -1;
        order_.splice(order_.begin(), order_, it->second);   // move to front
        return it->second->second;
    }

    void put(int key, int value) {
        auto it = index_.find(key);
        if (it != index_.end()) {
            it->second->second = value;
            order_.splice(order_.begin(), order_, it->second);
            return;
        }
        if (index_.size() == capacity_) {
            index_.erase(order_.back().first);               // evict the LRU
            order_.pop_back();
        }
        order_.push_front({key, value});
        index_[key] = order_.begin();
    }

    vector<int> keysMostRecentFirst() const {
        vector<int> out;
        for (const auto& [key, value] : order_) out.push_back(key);
        return out;
    }

   private:
    size_t capacity_;
    list<pair<int, int>> order_;                             // front = newest
    unordered_map<int, list<pair<int, int>>::iterator> index_;
};

// ============================================================================
// demo
// ============================================================================
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    HashMap<string, int> m;
    m.put("cat", 1);
    m.put("dog", 2);
    m.put("cat", 9);                       // overwrite, not duplicate
    assert(m.size() == 2);
    assert(m.get("cat") && *m.get("cat") == 9);
    assert(m.get("missing") == nullptr);
    assert(m.contains("dog") && !m.contains("bird"));
    assert(m.remove("dog") && !m.remove("dog"));
    assert(m.size() == 1);

    // Resizing: force at least one growth and confirm nothing is lost.
    HashMap<string, int> big;
    for (int i = 0; i < 100; i++) big.put("key" + to_string(i), i);
    assert(big.size() == 100);
    assert(big.capacity() > 8);            // it grew
    assert(big.loadFactor() <= 0.75);      // and stayed healthy
    for (int i = 0; i < 100; i++) {
        const int* v = big.get("key" + to_string(i));
        assert(v && *v == i);              // every key survived the rehash
    }
    assert(big.longestChain() <= 5);       // collisions stay tame
    assert(big.keys().size() == 100);

    assert(charFrequency("aab")['a'] == 2);
    assert(firstUniqueChar("leetcode") == 0);
    assert(firstUniqueChar("aabb") == -1);

    assert((twoSum({2, 7, 11, 15}, 9) == pair<int, int>{0, 1}));
    assert((twoSum({3, 3}, 6) == pair<int, int>{0, 1}));   // duplicate values
    assert((twoSum({1, 2}, 99) == pair<int, int>{-1, -1}));
    assert(containsDuplicate({1, 2, 3, 1}));
    assert(!containsDuplicate({1, 2, 3}));

    auto groups = groupAnagrams({"eat", "tea", "tan", "ate", "nat", "bat"});
    vector<size_t> sizes;
    for (const auto& g : groups) sizes.push_back(g.size());
    sort(sizes.begin(), sizes.end());
    assert((sizes == vector<size_t>{1, 2, 3}));

    assert(subarraySumEqualsK({1, 1, 1}, 2) == 2);
    assert(subarraySumEqualsK({1, 2, 3}, 3) == 2);      // [1,2] and [3]
    assert(subarraySumEqualsK({1, -1, 0}, 0) == 3);     // negatives work

    assert(longestConsecutive({100, 4, 200, 1, 3, 2}) == 4);   // 1,2,3,4
    assert(longestConsecutive({}) == 0);
    assert((intersection({1, 2, 2, 1}, {2, 2}) == vector<int>{2}));

    LRUCache lru(2);
    lru.put(1, 100);
    lru.put(2, 200);
    assert(lru.get(1) == 100);             // 1 becomes the most recent
    lru.put(3, 300);                       // evicts 2, the least recent
    assert(lru.get(2) == -1);
    assert((lru.keysMostRecentFirst() == vector<int>{3, 1}));

    cout << "10-Hashing (C++): all checks passed\n";
    return 0;
}
