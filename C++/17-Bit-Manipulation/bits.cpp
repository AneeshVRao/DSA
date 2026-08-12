// 17 - Bit Manipulation: the idioms, the XOR tricks, and bitmasks as sets.
//
// Build & run:
//   g++ -std=c++17 -O2 -Wall bits.cpp -o bits && ./bits

#include <algorithm>
#include <bitset>
#include <cassert>
#include <cstdint>
#include <iostream>
#include <string>
#include <utility>
#include <vector>

using namespace std;

// ============================================================================
// 1. Single-bit operations
// ============================================================================
int getBit(int n, int i) { return (n >> i) & 1; }
int setBit(int n, int i) { return n | (1 << i); }
int clearBit(int n, int i) { return n & ~(1 << i); }
int toggleBit(int n, int i) { return n ^ (1 << i); }   // XOR 1 flips, XOR 0 keeps

// Isolate the lowest set bit. Works because -n is ~n + 1 in two's complement:
// every bit above the lowest set bit is inverted, so only that one survives.
// This is the core of the Fenwick tree in chapter 19.
int lowestSetBit(int n) { return n & -n; }

// Clear the lowest set bit: n - 1 flips it to 0 and sets everything below it
// to 1, so the AND removes exactly that bit.
int clearLowestSetBit(int n) { return n & (n - 1); }

// ============================================================================
// 2. Counting
// ============================================================================
int countSetBitsNaive(unsigned int n) {          // O(width)
    int count = 0;
    while (n) {
        count += n & 1;
        n >>= 1;
    }
    return count;
}

// Brian Kernighan: one iteration per SET bit, not per bit. On 0b10000000 that
// is 1 iteration instead of 8.
int countSetBitsKernighan(unsigned int n) {
    int count = 0;
    while (n) {
        n &= n - 1;                              // clear the lowest set bit
        count++;
    }
    return count;
}

// A tiny DP over bits: dropping the last bit gives a smaller, already-computed
// number. O(n) for the whole range.
vector<int> countBitsUpTo(int n) {
    vector<int> counts(n + 1, 0);
    for (int i = 1; i <= n; i++) counts[i] = counts[i >> 1] + (i & 1);
    return counts;
}

// ============================================================================
// 3. Powers of two
// ============================================================================
// A power of two has exactly one set bit, so n & (n-1) clears it to zero.
bool isPowerOfTwo(int n) { return n > 0 && (n & (n - 1)) == 0; }

// Smallest power of two >= n. Note 1u to avoid shifting a signed 1 into the
// sign bit, which would be undefined behaviour.
unsigned int nextPowerOfTwo(unsigned int n) {
    if (n <= 1) return 1;
    unsigned int power = 1;
    while (power < n) power <<= 1;
    return power;
}

// ============================================================================
// 4. XOR tricks
// ============================================================================
// Every value appears twice except one. O(n) time, O(1) SPACE - a hash set
// would solve it too, in O(n) space.
int singleNumber(const vector<int>& nums) {
    int result = 0;
    for (int x : nums) result ^= x;              // pairs cancel in any order
    return result;
}

// Exactly two values appear once. XOR everything to get a ^ b; any set bit in
// that is a bit where a and b DIFFER, so partitioning on it separates them.
pair<int, int> singleNumberTwoUniques(const vector<int>& nums) {
    long long xorAll = 0;
    for (int x : nums) xorAll ^= x;

    int distinguishing = int(xorAll & -xorAll);  // a bit where they differ
    int a = 0, b = 0;
    for (int x : nums) {
        if (x & distinguishing) a ^= x;
        else b ^= x;
    }
    return a < b ? make_pair(a, b) : make_pair(b, a);
}

// One number missing from 0..n. XOR the indices with the values: everything
// present cancels. Immune to the overflow the sum formula can cause.
int missingNumber(const vector<int>& nums) {
    int result = int(nums.size());
    for (int i = 0; i < int(nums.size()); i++) result ^= i ^ nums[i];
    return result;
}

// The classic XOR swap: a party trick (std::swap is clearer and faster), but
// it demonstrates that XOR is its own inverse.
void swapWithoutTemp(int& a, int& b) {
    if (&a == &b) return;                        // aliasing would zero them out
    a ^= b;
    b ^= a;                                      // b = (a^b)^b = a
    a ^= b;                                      // a = (a^b)^a = b
}

// ============================================================================
// 5. Fixed-width work
// ============================================================================
// Reverse the bits of a 32-bit value. O(32).
uint32_t reverseBits(uint32_t n) {
    uint32_t result = 0;
    for (int i = 0; i < 32; i++) {
        result = (result << 1) | (n & 1);
        n >>= 1;
    }
    return result;
}

// Addition with only bitwise operations. a ^ b adds without carrying;
// (a & b) << 1 is the carry. unsigned avoids the UB of signed overflow.
int addWithoutPlus(int a, int b) {
    unsigned int x = unsigned(a), y = unsigned(b);
    while (y) {
        unsigned int carry = (x & y) << 1;
        x ^= y;
        y = carry;
    }
    return int(x);
}

// ============================================================================
// 6. Bitmasks as sets
// ============================================================================
// All 2^n subsets, using each integer as a membership mask. O(n * 2^n) - the
// same as chapter 07's backtracking, with no recursion and no undo step.
vector<vector<int>> subsetsBitmask(const vector<int>& items) {
    int n = int(items.size());
    vector<vector<int>> out;
    out.reserve(size_t(1) << n);
    for (int mask = 0; mask < (1 << n); mask++) {
        vector<int> subset;
        for (int i = 0; i < n; i++)
            if (mask & (1 << i)) subset.push_back(items[i]);
        out.push_back(move(subset));
    }
    return out;
}

// Every submask of `mask`, including 0. sub = (sub - 1) & mask jumps straight
// to the next submask instead of walking every integer - the standard trick in
// bitmask DP.
vector<int> submasks(int mask) {
    vector<int> out;
    for (int sub = mask;; sub = (sub - 1) & mask) {
        out.push_back(sub);
        if (sub == 0) break;
    }
    return out;
}

int hammingDistance(int a, int b) {
    return countSetBitsKernighan(unsigned(a ^ b));   // XOR marks differences
}

// ============================================================================
// demo
// ============================================================================
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n = 0b1010;                                   // 10
    assert(getBit(n, 1) == 1 && getBit(n, 0) == 0);
    assert(setBit(n, 0) == 0b1011);
    assert(clearBit(n, 1) == 0b1000);
    assert(toggleBit(n, 3) == 0b0010);
    assert(toggleBit(toggleBit(n, 3), 3) == n);       // toggling twice = identity

    assert(lowestSetBit(0b1100) == 0b100);
    assert(lowestSetBit(0b1000) == 0b1000);
    assert(clearLowestSetBit(0b1100) == 0b1000);
    assert(clearLowestSetBit(1) == 0);

    for (unsigned int value = 0; value < 300; value++) {
        int expected = int(bitset<32>(value).count());
        assert(countSetBitsNaive(value) == expected);
        assert(countSetBitsKernighan(value) == expected);
        assert(__builtin_popcount(value) == expected);   // the intrinsic agrees
    }
    assert((countBitsUpTo(5) == vector<int>{0, 1, 1, 2, 1, 2}));
    assert(countBitsUpTo(16)[16] == 1);

    assert(isPowerOfTwo(1) && isPowerOfTwo(1024));
    assert(!isPowerOfTwo(0) && !isPowerOfTwo(6));
    assert(!isPowerOfTwo(-8));                        // negatives never qualify
    assert(nextPowerOfTwo(1) == 1);
    assert(nextPowerOfTwo(5) == 8);
    assert(nextPowerOfTwo(16) == 16);

    assert(singleNumber({4, 1, 2, 1, 2}) == 4);
    assert(singleNumber({1}) == 1);
    assert(singleNumber({-1, -1, 7}) == 7);           // negatives work too

    assert((singleNumberTwoUniques({1, 2, 1, 3, 2, 5}) == pair<int, int>{3, 5}));
    assert((singleNumberTwoUniques({9, 4}) == pair<int, int>{4, 9}));

    assert(missingNumber({3, 0, 1}) == 2);
    assert(missingNumber({0}) == 1);
    assert(missingNumber({9, 6, 4, 2, 3, 5, 7, 0, 1}) == 8);

    int a = 3, b = 5;
    swapWithoutTemp(a, b);
    assert(a == 5 && b == 3);

    assert(reverseBits(1u) == (1u << 31));
    assert(reverseBits(1u << 31) == 1u);
    assert(reverseBits(0) == 0);
    assert(reverseBits(reverseBits(0b1011u)) == 0b1011u);   // self-inverse

    assert(addWithoutPlus(3, 5) == 8);
    assert(addWithoutPlus(-3, 5) == 2);
    assert(addWithoutPlus(-7, -8) == -15);
    assert(addWithoutPlus(0, 0) == 0);

    auto subs = subsetsBitmask({1, 2, 3});
    assert(subs.size() == 8);                         // 2^3
    assert(count(subs.begin(), subs.end(), vector<int>{}) == 1);
    assert(count(subs.begin(), subs.end(), vector<int>{1, 2, 3}) == 1);

    auto allSubmasks = submasks(0b1010);
    assert(allSubmasks.size() == 4);                  // 2^(2 set bits)
    for (int sub : allSubmasks) assert((sub & 0b1010) == sub);   // really submasks

    assert(hammingDistance(1, 4) == 2);               // 0001 vs 0100
    assert(hammingDistance(3, 3) == 0);

    // bitset packs 8 bits per byte - the reason bitset<10^9> is 125 MB where
    // bool[10^9] is 1 GB.
    bitset<8> flags(0b1010);
    assert(flags.count() == 2);
    assert(flags.to_string() == "00001010");
    flags.set(0);
    assert(flags.to_ulong() == 0b1011);

    cout << "17-Bit-Manipulation (C++): all checks passed\n";
    return 0;
}
