// 08 - Searching: binary search and every variant that actually shows up -
// boundaries, rotated arrays, matrices, and binary search on the answer.
//
// Build & run:
//   g++ -std=c++17 -O2 -Wall searching.cpp -o searching && ./searching

#include <algorithm>
#include <cassert>
#include <iostream>
#include <numeric>
#include <stdexcept>
#include <vector>

using namespace std;

// ============================================================================
// 1. Linear search
// ============================================================================
int linearSearch(const vector<int>& nums, int target) {   // O(n)
    for (size_t i = 0; i < nums.size(); i++)
        if (nums[i] == target) return int(i);
    return -1;
}

// ============================================================================
// 2. Binary search
// ============================================================================
// Inclusive bounds [lo, hi]: the loop uses <= and the updates are mid +/- 1.
// That pairing is what guarantees the range always shrinks.
int binarySearch(const vector<int>& nums, int target) {
    int lo = 0, hi = int(nums.size()) - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;    // (lo + hi) / 2 can overflow int
        if (nums[mid] == target) return mid;
        if (nums[mid] < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return -1;
}

// Same algorithm with index bounds instead of sub-vectors. Passing
// vector<int>(nums.begin()+mid+1, nums.end()) would copy: O(n log n).
int binarySearchRecursive(const vector<int>& nums, int target, int lo, int hi) {
    if (lo > hi) return -1;
    int mid = lo + (hi - lo) / 2;
    if (nums[mid] == target) return mid;
    if (nums[mid] < target) return binarySearchRecursive(nums, target, mid + 1, hi);
    return binarySearchRecursive(nums, target, lo, mid - 1);
}

// ============================================================================
// 3. Boundary variants
// ============================================================================
// First index with nums[i] >= target. Half-open bounds [lo, hi): the loop uses
// < and hi = mid (never mid - 1). It never returns early - it squeezes until
// the boundary is exact.
int lowerBound(const vector<int>& nums, int target) {
    int lo = 0, hi = int(nums.size());
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] < target) lo = mid + 1;
        else hi = mid;
    }
    return lo;
}

// First index with nums[i] > target.
int upperBound(const vector<int>& nums, int target) {
    int lo = 0, hi = int(nums.size());
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] <= target) lo = mid + 1;
        else hi = mid;
    }
    return lo;
}

int firstOccurrence(const vector<int>& nums, int target) {
    int i = lowerBound(nums, target);
    return (i < int(nums.size()) && nums[i] == target) ? i : -1;
}

int lastOccurrence(const vector<int>& nums, int target) {
    int i = upperBound(nums, target) - 1;
    return (i >= 0 && nums[i] == target) ? i : -1;
}

int countOccurrences(const vector<int>& nums, int target) {   // O(log n)
    return upperBound(nums, target) - lowerBound(nums, target);
}

// ============================================================================
// 4. Rotated arrays
// ============================================================================
// At any mid, at least ONE half is properly sorted. Work out which, test
// whether the target lies inside it, and discard the other half. O(log n).
int searchRotated(const vector<int>& nums, int target) {
    int lo = 0, hi = int(nums.size()) - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] == target) return mid;

        if (nums[lo] <= nums[mid]) {                  // left half sorted
            if (nums[lo] <= target && target < nums[mid]) hi = mid - 1;
            else lo = mid + 1;
        } else {                                      // right half sorted
            if (nums[mid] < target && target <= nums[hi]) lo = mid + 1;
            else hi = mid - 1;
        }
    }
    return -1;
}

// Smallest element of a rotated sorted array. Compare against the RIGHT end:
// nums[mid] > nums[hi] means the minimum is strictly right of mid.
int findMinRotated(const vector<int>& nums) {
    int lo = 0, hi = int(nums.size()) - 1;
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] > nums[hi]) lo = mid + 1;
        else hi = mid;                                // mid stays a candidate
    }
    return nums[lo];
}

// Any element greater than both neighbours. Works on UNSORTED input: whichever
// side goes uphill must contain a peak, since the ends count as -infinity.
int findPeak(const vector<int>& nums) {
    int lo = 0, hi = int(nums.size()) - 1;
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] < nums[mid + 1]) lo = mid + 1;  // uphill to the right
        else hi = mid;
    }
    return lo;
}

// ============================================================================
// 5. Matrices
// ============================================================================
// Rows sorted and chained (each row starts after the previous ends): treat the
// matrix as one flat sorted array. O(log(rows*cols)).
bool searchMatrix(const vector<vector<int>>& matrix, int target) {
    if (matrix.empty() || matrix[0].empty()) return false;
    int rows = int(matrix.size()), cols = int(matrix[0].size());
    int lo = 0, hi = rows * cols - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        int value = matrix[mid / cols][mid % cols];   // flat index -> (r, c)
        if (value == target) return true;
        if (value < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return false;
}

// Rows AND columns sorted, but rows do not chain. Start at the top-right: it
// is the largest in its row and smallest in its column, so every comparison
// eliminates a whole row or column. O(rows + cols).
bool searchMatrixStaircase(const vector<vector<int>>& matrix, int target) {
    if (matrix.empty() || matrix[0].empty()) return false;
    int r = 0, c = int(matrix[0].size()) - 1;
    while (r < int(matrix.size()) && c >= 0) {
        if (matrix[r][c] == target) return true;
        if (matrix[r][c] > target) c--;
        else r++;
    }
    return false;
}

// ============================================================================
// 6. Binary search on the answer
// ============================================================================
// Largest x with x*x <= n. The predicate is monotonic: true up to the answer,
// false after. long long avoids overflow in mid*mid.
long long integerSqrt(long long n) {
    if (n < 0) throw invalid_argument("negative input");
    long long lo = 0, hi = n, best = 0;
    while (lo <= hi) {
        long long mid = lo + (hi - lo) / 2;
        if (mid <= n / max(1LL, mid)) {      // mid*mid <= n without overflow
            best = mid;                       // feasible: record, then go right
            lo = mid + 1;
        } else {
            hi = mid - 1;
        }
    }
    return best;
}

// Smallest ship capacity that delivers every package within `days` days.
// No array is being searched - the ANSWER is searched, between max(weights)
// (must fit the heaviest package) and sum(weights) (one giant trip).
// canShip is monotonic: a bigger ship is never worse. O(n log(sum)).
long long minShipCapacity(const vector<int>& weights, int days) {
    if (days <= 0 || weights.empty()) throw invalid_argument("bad input");

    auto canShip = [&](long long capacity) {
        int used = 1;
        long long load = 0;
        for (int w : weights) {
            if (load + w > capacity) {        // start a new day
                used++;
                load = 0;
            }
            load += w;
        }
        return used <= days;
    };

    long long lo = *max_element(weights.begin(), weights.end());
    long long hi = accumulate(weights.begin(), weights.end(), 0LL);
    while (lo < hi) {
        long long mid = lo + (hi - lo) / 2;
        if (canShip(mid)) hi = mid;           // feasible: try smaller
        else lo = mid + 1;
    }
    return lo;
}

// Minimum bananas-per-hour to finish every pile within `hours`.
// Same shape: monotonic predicate, binary search the answer.
long long kokoEatingSpeed(const vector<int>& piles, int hours) {
    auto hoursNeeded = [&](long long speed) {
        long long total = 0;
        for (int p : piles) total += (p + speed - 1) / speed;   // ceil division
        return total;
    };

    long long lo = 1, hi = *max_element(piles.begin(), piles.end());
    while (lo < hi) {
        long long mid = lo + (hi - lo) / 2;
        if (hoursNeeded(mid) <= hours) hi = mid;
        else lo = mid + 1;
    }
    return lo;
}

// ============================================================================
// demo
// ============================================================================
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    vector<int> nums{1, 3, 5, 7, 9, 11};
    assert(linearSearch(nums, 7) == 3 && linearSearch(nums, 8) == -1);

    assert(binarySearch(nums, 1) == 0);           // first element
    assert(binarySearch(nums, 11) == 5);          // last element
    assert(binarySearch(nums, 7) == 3);
    assert(binarySearch(nums, 8) == -1);
    assert(binarySearch({}, 1) == -1);            // empty input
    assert(binarySearchRecursive(nums, 9, 0, int(nums.size()) - 1) == 4);

    vector<int> dups{1, 2, 2, 2, 3, 5};
    assert(lowerBound(dups, 2) == 1 && upperBound(dups, 2) == 4);
    assert(lowerBound(dups, 4) == 5);             // insertion point, no match
    assert(upperBound(dups, 5) == 6);             // past the end
    assert(firstOccurrence(dups, 2) == 1 && lastOccurrence(dups, 2) == 3);
    assert(firstOccurrence(dups, 4) == -1);
    assert(countOccurrences(dups, 2) == 3 && countOccurrences(dups, 9) == 0);
    // Agreement with the STL is the real correctness check.
    assert(lowerBound(dups, 2) ==
           int(lower_bound(dups.begin(), dups.end(), 2) - dups.begin()));
    assert(upperBound(dups, 2) ==
           int(upper_bound(dups.begin(), dups.end(), 2) - dups.begin()));

    vector<int> rotated{4, 5, 6, 7, 0, 1, 2};
    assert(searchRotated(rotated, 0) == 4);
    assert(searchRotated(rotated, 5) == 1);
    assert(searchRotated(rotated, 3) == -1);
    assert(findMinRotated(rotated) == 0);
    assert(findMinRotated({3, 4, 5, 1, 2}) == 1);
    assert(findMinRotated({1, 2, 3}) == 1);       // not actually rotated

    assert(findPeak({1, 2, 3, 1}) == 2);
    int p = findPeak({1, 2, 1, 3, 5, 6, 4});
    assert(p == 1 || p == 5);                     // either peak is valid

    vector<vector<int>> matrix{{1, 3, 5, 7}, {10, 11, 16, 20}, {23, 30, 34, 60}};
    assert(searchMatrix(matrix, 3) && searchMatrix(matrix, 60));
    assert(!searchMatrix(matrix, 13));

    vector<vector<int>> staircase{{1, 4, 7}, {2, 5, 8}, {3, 6, 9}};
    assert(searchMatrixStaircase(staircase, 5));
    assert(!searchMatrixStaircase(staircase, 10));

    assert(integerSqrt(0) == 0);
    assert(integerSqrt(8) == 2);                  // floor of 2.83
    assert(integerSqrt(16) == 4);
    assert(integerSqrt(1000000000000LL) == 1000000);

    assert(minShipCapacity({1, 2, 3, 4, 5, 6, 7, 8, 9, 10}, 5) == 15);
    assert(minShipCapacity({3, 2, 2, 4, 1, 4}, 3) == 6);
    assert(kokoEatingSpeed({3, 6, 7, 11}, 8) == 4);
    assert(kokoEatingSpeed({30, 11, 23, 4, 20}, 5) == 30);

    cout << "08-Searching (C++): all checks passed\n";
    return 0;
}
