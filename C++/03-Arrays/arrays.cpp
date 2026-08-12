// 03 - Arrays: a dynamic array built from scratch, plus the five patterns
// that solve most array problems.
//
// Build & run:
//   g++ -std=c++17 -O2 -Wall arrays.cpp -o arrays && ./arrays

#include <algorithm>
#include <cassert>
#include <iostream>
#include <numeric>
#include <stdexcept>
#include <string>
#include <unordered_map>
#include <vector>

using namespace std;

// ============================================================================
// 1. A dynamic array from scratch (this is what std::vector is underneath)
// ============================================================================
template <typename T>
class DynamicArray {
   public:
    DynamicArray() : data_(new T[1]), size_(0), capacity_(1) {}

    ~DynamicArray() { delete[] data_; }

    // Rule of three: owning a raw pointer means copying must be defined,
    // otherwise two objects would delete the same buffer.
    DynamicArray(const DynamicArray& other)
        : data_(new T[other.capacity_]),
          size_(other.size_),
          capacity_(other.capacity_) {
        copy(other.data_, other.data_ + other.size_, data_);
    }

    DynamicArray& operator=(const DynamicArray& other) {
        if (this != &other) {
            T* fresh = new T[other.capacity_];
            copy(other.data_, other.data_ + other.size_, fresh);
            delete[] data_;
            data_ = fresh;
            size_ = other.size_;
            capacity_ = other.capacity_;
        }
        return *this;
    }

    size_t size() const { return size_; }          // O(1): stored, not counted
    size_t capacity() const { return capacity_; }

    T& operator[](size_t i) { return data_[i]; }    // O(1), unchecked (like STL)
    const T& operator[](size_t i) const { return data_[i]; }

    T& at(size_t i) {                               // O(1), checked
        if (i >= size_) throw out_of_range("index out of range");
        return data_[i];
    }

    // O(1) amortised: doubling means n push_backs cost at most 2n copies.
    void push_back(const T& value) {
        if (size_ == capacity_) resize(capacity_ * 2);
        data_[size_++] = value;
    }

    // O(n): every element from index i onwards shifts right.
    void insert(size_t i, const T& value) {
        if (i > size_) throw out_of_range("index out of range");
        if (size_ == capacity_) resize(capacity_ * 2);
        for (size_t j = size_; j > i; j--) data_[j] = data_[j - 1];
        data_[i] = value;
        size_++;
    }

    // O(1) at the end, O(n) anywhere else.
    T erase(size_t i) {
        if (i >= size_) throw out_of_range("index out of range");
        T value = data_[i];
        for (size_t j = i; j + 1 < size_; j++) data_[j] = data_[j + 1];
        size_--;
        return value;
    }

    vector<T> toVector() const { return vector<T>(data_, data_ + size_); }

   private:
    void resize(size_t newCapacity) {   // O(n) - and the reason we double
        T* fresh = new T[newCapacity];
        copy(data_, data_ + size_, fresh);
        delete[] data_;
        data_ = fresh;
        capacity_ = newCapacity;
    }

    T* data_;
    size_t size_;
    size_t capacity_;
};

// ============================================================================
// 2. Two pointers from opposite ends
// ============================================================================

// Indices of the pair summing to target in a SORTED array. O(n) time, O(1) space.
// Sortedness makes the move unambiguous: a too-small sum can only grow by
// advancing lo.
pair<int, int> twoSumSorted(const vector<int>& nums, int target) {
    int lo = 0, hi = int(nums.size()) - 1;
    while (lo < hi) {
        int sum = nums[lo] + nums[hi];
        if (sum == target) return {lo, hi};
        if (sum < target) lo++;
        else hi--;
    }
    return {-1, -1};
}

bool isPalindrome(const vector<int>& nums) {   // O(n) / O(1)
    int lo = 0, hi = int(nums.size()) - 1;
    while (lo < hi)
        if (nums[lo++] != nums[hi--]) return false;
    return true;
}

// ============================================================================
// 3. Fast / slow pointers (in-place rewrite)
// ============================================================================

// Move every 0 to the end, preserving the order of the rest. O(n) / O(1).
void moveZeros(vector<int>& nums) {
    size_t slow = 0;                      // where the next non-zero belongs
    for (size_t fast = 0; fast < nums.size(); fast++)
        if (nums[fast] != 0) swap(nums[slow++], nums[fast]);
}

// Dedup a sorted vector in place; returns the new logical length. O(n) / O(1).
// This is exactly what std::unique does.
size_t removeDuplicatesSorted(vector<int>& nums) {
    if (nums.empty()) return 0;
    size_t slow = 0;
    for (size_t fast = 1; fast < nums.size(); fast++)
        if (nums[fast] != nums[slow]) nums[++slow] = nums[fast];
    return slow + 1;
}

// ============================================================================
// 4. Kadane - maximum subarray sum
// ============================================================================
// At each element: extend the running subarray, or start fresh here?
// A negative running sum can only hurt, so drop it. O(n) / O(1).
long long maxSubarray(const vector<int>& nums) {
    if (nums.empty()) throw invalid_argument("empty array");
    long long best = nums[0], current = nums[0];
    for (size_t i = 1; i < nums.size(); i++) {
        current = max<long long>(nums[i], current + nums[i]);
        best = max(best, current);
    }
    return best;
}

// ============================================================================
// 5. Prefix sums
// ============================================================================
class PrefixSum {
   public:
    // O(n) build. pre[0] = 0 removes every special case from the query.
    explicit PrefixSum(const vector<int>& nums) : pre_(nums.size() + 1, 0) {
        for (size_t i = 0; i < nums.size(); i++)
            pre_[i + 1] = pre_[i] + nums[i];      // long long: sums overflow int
    }

    // Sum of nums[left, right) - right exclusive. O(1).
    long long rangeSum(size_t left, size_t right) const {
        return pre_[right] - pre_[left];
    }

   private:
    vector<long long> pre_;
};

// ============================================================================
// 6. Sliding window
// ============================================================================

// Largest sum of k consecutive elements. O(n) / O(1).
// Slide instead of recomputing: add the entrant, drop the leaver.
long long maxSumWindow(const vector<int>& nums, size_t k) {
    if (k == 0 || k > nums.size()) throw invalid_argument("bad window size");
    long long window = accumulate(nums.begin(), nums.begin() + k, 0LL);
    long long best = window;
    for (size_t i = k; i < nums.size(); i++) {
        window += nums[i] - nums[i - k];
        best = max(best, window);
    }
    return best;
}

// Longest substring with no repeated character - a variable-size window. O(n).
int longestUniqueWindow(const string& s) {
    unordered_map<char, int> lastSeen;
    int left = 0, best = 0;
    for (int right = 0; right < int(s.size()); right++) {
        auto it = lastSeen.find(s[right]);
        if (it != lastSeen.end() && it->second >= left)
            left = it->second + 1;               // jump past the earlier copy
        lastSeen[s[right]] = right;
        best = max(best, right - left + 1);
    }
    return best;
}

// ============================================================================
// 7. In-place rotation and partitioning
// ============================================================================

// Rotate right by k with three reversals. O(n) time, O(1) space.
// (std::rotate does the same job; this shows the mechanism.)
void rotateRight(vector<int>& nums, int k) {
    int n = int(nums.size());
    if (n == 0) return;
    k = ((k % n) + n) % n;                        // handles negative k too
    reverse(nums.begin(), nums.end());
    reverse(nums.begin(), nums.begin() + k);
    reverse(nums.begin() + k, nums.end());
}

// Sort an array of 0/1/2 in ONE pass. O(n) / O(1).
// Invariant: [0,low) are 0s, [low,mid) are 1s, (high,end) are 2s.
void dutchFlagSort(vector<int>& nums) {
    int low = 0, mid = 0, high = int(nums.size()) - 1;
    while (mid <= high) {
        if (nums[mid] == 0) swap(nums[low++], nums[mid++]);
        else if (nums[mid] == 1) mid++;
        else swap(nums[mid], nums[high--]);       // do NOT advance mid here
    }
}

// ============================================================================
// 8. Merging two sorted arrays
// ============================================================================
vector<int> mergeSorted(const vector<int>& a, const vector<int>& b) {
    vector<int> out;
    out.reserve(a.size() + b.size());             // one allocation, no regrowth
    size_t i = 0, j = 0;
    while (i < a.size() && j < b.size())
        out.push_back(a[i] <= b[j] ? a[i++] : b[j++]);   // <= keeps it stable
    while (i < a.size()) out.push_back(a[i++]);
    while (j < b.size()) out.push_back(b[j++]);
    return out;
}

// ============================================================================
// demo
// ============================================================================
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    DynamicArray<int> arr;
    for (int i = 0; i < 5; i++) arr.push_back(i);
    assert(arr.size() == 5);
    assert((arr.toVector() == vector<int>{0, 1, 2, 3, 4}));
    arr.insert(0, 99);
    assert((arr.toVector() == vector<int>{99, 0, 1, 2, 3, 4}));
    assert(arr.erase(0) == 99);
    assert(arr.size() == 5 && arr[0] == 0);
    DynamicArray<int> copyOfArr = arr;            // deep copy, no double free
    copyOfArr[0] = 42;
    assert(arr[0] == 0);

    assert((twoSumSorted({1, 3, 5, 8}, 11) == pair<int, int>{1, 3}));
    assert((twoSumSorted({1, 2}, 99) == pair<int, int>{-1, -1}));
    assert(isPalindrome({1, 2, 1}) && !isPalindrome({1, 2}));

    vector<int> zeros{0, 1, 0, 3};
    moveZeros(zeros);
    assert((zeros == vector<int>{1, 3, 0, 0}));

    vector<int> dups{1, 1, 2, 2, 3};
    assert(removeDuplicatesSorted(dups) == 3);
    assert(dups[0] == 1 && dups[1] == 2 && dups[2] == 3);

    assert(maxSubarray({-2, 1, -3, 4, -1, 2, 1, -5, 4}) == 6);   // [4,-1,2,1]
    assert(maxSubarray({-5, -2, -9}) == -2);                     // all negative

    PrefixSum ps({1, 2, 3, 4});
    assert(ps.rangeSum(0, 4) == 10);
    assert(ps.rangeSum(1, 3) == 5);
    assert(ps.rangeSum(2, 2) == 0);                              // empty range

    assert(maxSumWindow({1, 5, 2, 9, 1}, 2) == 11);
    assert(longestUniqueWindow("abcabcbb") == 3);
    assert(longestUniqueWindow("") == 0);

    vector<int> rot{1, 2, 3, 4, 5};
    rotateRight(rot, 2);
    assert((rot == vector<int>{4, 5, 1, 2, 3}));

    vector<int> flag{2, 0, 2, 1, 1, 0};
    dutchFlagSort(flag);
    assert((flag == vector<int>{0, 0, 1, 1, 2, 2}));

    assert((mergeSorted({1, 4}, {2, 3, 5}) == vector<int>{1, 2, 3, 4, 5}));
    assert((mergeSorted({}, {1}) == vector<int>{1}));

    cout << "03-Arrays (C++): all checks passed\n";
    return 0;
}
